# Signals，推荐服务

::: warning 实验性功能
Signals 处于 0.0.1 版本。它与 Server 之间的约定以及它的算法都还可能变化。
:::

[TypeType Signals](https://github.com/TypeType-Video/TypeType-Signals) 是一个可选的服务，其中包含各种首页算法。本页说明它如何与 Server 配合，以及算法是怎样编写的。用户能看到什么，请读[选择你的算法](/zh/guide/algorithm)；如何运行它，请读[推荐服务](/zh/self-hosting/recommender)。

## 各自负责什么 {#roles}

| | TypeType-Server | Signals |
| --- | --- | --- |
| 账号、会话、用户数据 | 由它负责 | 完全没有：请求中从不出现用户的身份 |
| 与 YouTube 通信 | 通过自己的提取流程和缓存获取每一个视频 | 从不这样做 |
| 屏蔽、家庭过滤 | 对所有返回的内容应用这些规则 | 无法绕过它们 |
| 选择视频并排序 | 退回到内置的首页 | 负责各种算法 |
| 保存的内容 | 选择、更正、意见、生成好的页面 | 公开视频标题向量和公开视频目录；带键的临时历史快照 |

Server 是这个服务唯一的调用方。如果服务不存在、响应慢或出错，Server 就提供它内置的首页，所以首页永远不会坏掉。

## 一个首页的生成过程 {#flow}

```text
browser ── GET /recommendations/home ─▶ Server
Server  ── POST /v1/history (once, when the history changed) ─▶ Signals
Server  ── POST /v1/plan (snapshot) ─▶ Signals
Server  ◀─ the sources to fetch ───── Signals
Server:    fetches those sources, filters the candidates
Server  ── POST /v1/rank (plan id, candidates) ─▶ Signals
Server  ◀─ rows, reasons, trace ───── Signals
Server:    filters the rows again, keeps the page, serves it in slices
browser ◀─ rows ───────────────────── Server
```

1. **快照。** Server 在不指明身份的前提下描述这个人：他选择的算法及其设置、时间和语言、他的订阅，以及仅限于算法声明要读取、并且本人允许的那些数据类别。较长的历史记录只以某个键发送一次，之后就用这个键来指代。
2. **计划。** 算法回复它想要的来源：订阅信息流、某个视频的相关视频、某个频道的视频、一次搜索、热门内容，或者需要继续观看的特定视频。每个来源都带有请求它的原因。
3. **获取。** Server 经由共享缓存获取这些来源，并把它需要在视频提供方打开的每个视频计入实例的限额。
4. **排序。** 算法给候选视频打分，并把它们排成若干行。各行只用地址来指代视频：服务无法把 Server 没有获取并过滤过的视频放到屏幕上。
5. **第二次过滤。** Server 对这些行再次应用屏蔽和家庭过滤。算法中的错误不可能让被屏蔽的视频显示出来。

如果页面没有在 Server 的时限内准备好，这次访问就改用内置的首页，页面则继续生成，供下一次访问使用。

## 服务的路由 {#routes}

除 `/health` 之外的所有路由都要求带有 `X-Internal-Token` 请求头，即与 Server 共享的密钥。

| 路由 | 用途 |
| --- | --- |
| `GET /health` | 存活状态和版本 |
| `GET /version` | 版本、修订号和构建时间，格式与其他 TypeType 服务相同 |
| `GET /v1/algorithms` | 各种算法、它们的文字说明、各自读取的数据，以及每一项设置及其范围和默认值。界面就是根据这个响应构建的：新增算法不需要修改 frontend。 |
| `POST /v1/history` | 以 Server 选定的键发送的历史记录和点赞，可以一次发完，也可以分成几部分 |
| `POST /v1/plan` | 输入快照，输出需要获取的来源 |
| `POST /v1/rank` | 输入候选视频，输出带有原因的各行，并在要求时附上追踪信息 |
| `POST /v1/profile` | 算法从快照中得出的推断：兴趣、频道、最近观看的内容 |
| `POST /v1/topics` | 对一组标题，给出每个标题所属的兴趣 |

如果服务已不再保有某个计划或历史记录，它会返回 `409`；Server 随后会重新发送。确切的数据结构见 [`recommender/contract.py`](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/recommender/contract.py) 以及旁边各个 `contract_*.py` 文件中的模型。

## 每个算法都遵守的规则 {#principles}

1. **说明自己读取什么。** 算法列出它使用的数据类别，引擎在调用它之前会把其余类别从快照中去掉。“从不读取你的历史记录”是由结构保证的。
2. **每项设置都公开。** 每个权重、阈值、上限和衰减时间都声明了类型、范围和默认值，并展示给用户。
3. **每一行都有原因。** 每一行都带有原因的种类以及背后的条目或推断；每个视频都带有把它带来的依据。
4. **推断会被展示。** 推断出的内容（兴趣、频道、最近观看）出自负责排序的同一段代码，并注明每项推断的来源。
5. **用户的决定优先。** 被隐藏和被置顶的兴趣、被忽略的频道以及被排除的条目，每个算法都必须遵守。
6. **随机性要声明。** 使用随机抽取的算法会说明这一点，并接受一个种子：相同的种子和相同的数据会得到相同的页面。
7. **只有一条代码路径。** 用户看到的画像和追踪信息，都来自生成其页面的那次计算。不存在另外一套解释。

## 编写一个算法 {#write}

一个算法就是 `recommender/algorithms/` 中的一个文件。它声明自己的名称和文字说明、读取的数据、各项设置，并实现两个步骤：规划来源，然后把候选视频排成若干行。在 `recommender/registry.py` 中登记它。

可以从最小的 [`subscriptions.py`](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/recommender/algorithms/subscriptions.py) 入手，并且请先阅读 [`CONTRIBUTING.md`](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/CONTRIBUTING.md)：其中说明了代码的写法，以及如何证明某项改动没有改变任何页面。

```sh
docker compose up -d --build
uv run pytest
```

第一条命令在 `8190` 端口启动服务，并带有它自己的数据库和缓存。测试使用基于词语哈希的语言模型替身，所以不需要下载任何东西。

## Signals 如何读取历史记录 {#signals}

Signals 系列（Signals、channels、videos、mix）共用同一套对历史记录的解读方式：

- **频道。** 频道按观看过的不同视频的数量计分，每 30 天衰减一半。观看的分钟数不计入。
- **兴趣。** 用一个多语言的句子模型，按含义比较看完的视频的标题，并在它们平均而言足够接近时归为一组。每一组以其标题中共有的词命名。不能说明任何主题的标题会被排除在外。
- **最近观看。** 刚看过的视频会立即影响页面；它的影响随时间减半，并在几小时后消失。

Shorts 会单独记录，默认不会影响普通视频推荐。在 Signals 系列中，**Let Shorts shape the home page** 默认关闭；
开启后，Shorts 也可以影响信息流中的普通视频。

模型在服务内部本地运行，使用 CPU。它在首次启动时下载一次，之后不会向任何第三方发送任何内容。

## 版本 {#versions}

Signals 遵循[语义化版本](https://semver.org)。补丁版本不改变任何页面，次版本可能改变页面展示的内容或增加设置，主版本则改变与 Server 之间的约定。只要版本号以 0 开头，一切都还可能变化。实例上运行的版本显示在它的“关于”页面中。

该服务采用 GNU Affero General Public License 第 3 版许可证。

## 参考链接 {#source-references}

- [Signals 仓库](https://github.com/TypeType-Video/TypeType-Signals)
- [约定的模型](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/recommender/contract.py)
- [Server 中的服务集成](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/RecommenderServices.kt)
