# 推荐服务（实验性）

::: warning 实验性功能
推荐服务处于 0.0.1 版本。它的算法、设置和资源需求在各次更新之间仍可能变化。
:::

推荐服务是可选的，以 [TypeType Signals](https://github.com/TypeType-Video/TypeType-Signals) 的名称发布。它让每位用户用自己选择并调整的算法来生成首页。用户能得到什么，请见[选择你的算法](/zh/guide/algorithm)。

没有它的部署和以前完全一样，任何地方都不会出现相关选项。有了它，三个开关分别掌握在不同的人手里：

1. 你安装这个服务；
2. 管理员为实例开启它；
3. 每位用户为自己开启它。

## 开始之前 {#requirements}

| 资源 | 数量 | 如何检查 |
| --- | --- | --- |
| 内存 | 空闲时约 1 GB，默认上限 2 GB（`RECOMMENDER_MEMORY_LIMIT`） | `free -h`，看 `available` 一列 |
| 磁盘 | 语言模型约 550 MB，镜像约 330 MB | `df -h /var/lib/docker` |
| 网络 | 首次启动时需要访问互联网，以便从 Hugging Face 下载模型。该服务从不与 YouTube 通信。 | |
| TypeType | 用安装脚本或受支持的 Compose 文件安装的部署 | 在部署目录中运行 `docker compose ps` |

添加它之后，你的部署会发生这些变化：

- 新增一个容器 `typetype-recommender`；
- 新增一个卷 `recommender_models`，用于存放模型；
- 在你已有的 PostgreSQL 中新增一个数据库 `typetype_recommender`；
- `postgres` 服务从 `postgres:17` 换成 `pgvector/pgvector:pg17`，即带有 `pgvector` 扩展的同一个 PostgreSQL 17，使用同一个数据卷。PostgreSQL 会重启一次，实例有几秒钟不可用；
- Server 会带着该服务的地址重新创建。

你现有的数据不会被迁移或改写。尽管如此，还是请先备份数据库，就像对部署做任何改动之前一样：见 [Maintenance](/self-hosting/maintenance#backups)。

本页的命令用 `$STACK_DIR` 表示你的部署所在的目录。请在终端里设置一次。`~/typetype-stack` 只是安装脚本的默认值：请填写你自己选择的目录，无论它是哪一个。见 [Choose the directory](/self-hosting/quick-start#stack-directory)。

```sh
STACK_DIR=~/typetype-stack
```

请从下面三种方式中选择一种。

## A. 新实例，使用安装脚本 {#install-new}

1. 带上推荐服务运行安装脚本：

   ```sh
   curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --recommender
   ```

   不加 `--recommender` 时，安装脚本会询问；如果你直接按回车，答案为否：

   ```text
   [install] Optional: the recommender (experimental) lets each user pick the algorithm of their home page.
   [install] It needs about 2 GB of memory and 1 GB of disk, and downloads a language model on first start.
   Add the experimental recommender? [y/N]:
   ```

2. 安装脚本确认这一选择，然后在启动任何东西之前再问一次：

   ```text
   [install] Recommender (experimental) added to the stack.
   [install] Validating the resolved Compose stack...
   Proceed with Docker pull + startup in <你的部署目录>? [y/N]:
   ```

   回答 `y`。

3. 等待。首次启动会先下载镜像，再下载模型。安装脚本最多等待 15 分钟让所有服务变为健康状态，而不是通常的 3 分钟。它以这一行结束：

   ```text
   Done. Open http://localhost:8082
   ```

4. 转到[检查它是否在运行](#verify)。

安装脚本已在 `.env` 中写入 `RECOMMENDER_ENABLED=true`，所以实例上已经提供这个选项。

## B. 已有实例，使用安装脚本 {#install-existing}

带上你的部署目录再次运行安装脚本。它会备份自己管理的文件，保留你的 `.env` 和 `docker-compose.override.yml`，并添加推荐服务。

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --recommender --dir "$STACK_DIR"
```

PostgreSQL 和 Server 重启期间，实例会有几秒钟不可用；之后转到[检查它是否在运行](#verify)。

## C. 已有实例，手动操作 {#manual}

适用于自己管理部署的情况，例如使用 Dockge。

1. 进入部署目录，确认服务的文件在那里：

   ```sh
   cd "$STACK_DIR"
   ls docker-compose.recommender.yml
   ```

   如果没有，说明你的部署文件比这个服务更旧。把它下载下来：

   ```sh
   curl -fsSLO https://raw.githubusercontent.com/TypeType-Video/TypeType/main/docker-compose.recommender.yml
   ```

2. 让部署提供这个功能。在 `.env` 中设置：

   ```dotenv
   RECOMMENDER_ENABLED=true
   ```

   也正是这一行，让安装脚本在以后的更新中保留该服务。

3. 创建数据库和共享密钥：

   ```sh
   COMPOSE_RECOMMENDER_FILE=docker-compose.recommender.yml ./scripts/run-stack-init.sh
   ```

   输出以这两行结束：

   ```text
   CREATE DATABASE
   CREATE EXTENSION
   ```

   第二次运行时不会出现 `CREATE DATABASE`，扩展那一行会提示它已经存在。两种情况都是正常的。

4. 启动服务并重新创建 Server：

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml up -d --wait --wait-timeout 900
   ```

   在 ARM64 主机上，像你平时那样把 ARM64 文件也写上：
   `-f docker-compose.yml -f docker-compose.arm64.yml -f docker-compose.recommender.yml`。

5. 转到[检查它是否在运行](#verify)。

::: warning 从现在起要写上两个文件
这个部署的每条 `docker compose` 命令现在都必须同时写上 `docker-compose.recommender.yml`。只写 `docker-compose.yml` 并带 `--remove-orphans` 的命令会把推荐服务删掉。
:::

## 检查它是否在运行 {#verify}

在部署目录中运行这些命令。无论你用哪种方式安装，每条命令都写上两个 Compose 文件：单独的 `docker compose` 只认识 `docker-compose.yml` 中的服务。在 ARM64 主机上，请在两者之间加上 `-f docker-compose.arm64.yml`。

```sh
cd "$STACK_DIR"
```

1. 容器处于健康状态：

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml ps typetype-recommender
   ```

   `STATUS` 一列应显示 `Up ... (healthy)`。`(health: starting)` 表示模型仍在下载或加载。

2. 它的日志显示启动已完成：

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml logs typetype-recommender
   ```

   ```text
   INFO:     Started server process [1]
   INFO:     Waiting for application startup.
   Warning: You are sending unauthenticated requests to the HF Hub. Please set a HF_TOKEN to enable higher rate limits and faster downloads.
   INFO:     Application startup complete.
   INFO:     Uvicorn running on http://0.0.0.0:8190 (Press CTRL+C to quit)
   ```

   关于 HF Hub 的警告是正常的：模型是公开的，不需要令牌。`Application startup complete` 之前的停顿就是在下载。

3. Server 能连上它：

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml exec -T typetype-server wget -qO- http://127.0.0.1:8080/version/recommender
   ```

   ```json
   {"service":"recommender","version":"0.0.1","revision":"...","shortRevision":"...","buildTime":"..."}
   ```

   如果返回为空或报错，说明 Server 看不到这个服务：见[故障排查](#troubleshooting)。

4. 实例已经宣告了它：

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml exec -T typetype-server wget -qO- http://127.0.0.1:8080/instance
   ```

   返回内容中包含：

   ```json
   "recommender":{"installed":true,"enabled":true,"experimental":true}
   ```

   只要 Server 知道这个服务，`installed` 就为真。`enabled` 是实例级的开关，下一节会说明。

5. 在网页应用中，**设置**，然后 **关于**，会显示一行 **算法**，版本为 `0.0.1`。

## 开启 {#enable}

仅仅安装服务不会让用户看到任何东西，必须由实例提供这个功能。

1. 以管理员身份登录并打开管理控制台。
2. 打开 **推荐服务** 一节。
3. 开启 **提供实验性首页**。如果 `.env` 中有 `RECOMMENDER_ENABLED=true`，它已经是开启的。
4. 重新加载网页应用：菜单中会出现 **算法**。

然后用你自己的账号试一下：

1. 打开 **算法**。
2. 开启 **用我选择的算法生成我的首页**。
3. 回到首页。空账号会看到一张欢迎卡片；请先导入一些数据或观看几个视频。
4. 再次打开 **算法**，然后打开 **上一次首页是如何生成的**：那里应显示请求过的来源和找到的视频。

每位用户都需要为自己做同样的操作，除非你开启 **默认对所有人开启**。

管理控制台的 **推荐服务** 一节包含管理员决定的全部内容：

| 控件 | 作用 |
| --- | --- |
| **提供实验性首页** | 关闭时，所有人保持标准首页，算法页面消失。开启时，由每位用户自己选择是否开启。 |
| **默认对所有人开启** | 默认关闭。开启后，每位用户立即获得算法首页，并且可以把它关掉。 |
| **提供的算法** | 用户可以选择哪些算法。一个都不选表示全部提供。 |
| **预选算法** | 用户在自己选择之前使用的算法。**由服务自行选择** 遵循 `RECOMMENDER_DEFAULT_ALGORITHM`。 |
| **允许的响应时间（毫秒）** | 对服务的一次调用最多可以花多久。`0` 表示保持安装时设定的值。 |
| **每分钟向 YouTube 发出的视频请求数** | 见[它向 YouTube 请求什么](#provider-requests)。`0` 表示保持安装时设定的值。 |

下方的 **服务状态** 显示它是否有响应以及响应用了多少毫秒、生成一个页面的平均时间（分为算法和 YouTube 来源两部分）、已提供的页面数及其中来自缓存的数量、访问者有多少次改为得到标准首页，以及这一分钟内发出和被搁置的视频请求数。它还按算法显示有多少用户开启了该选项，以及他们选择发送的意见。任何意见都不会显示作者。Server 重启后，这些计数会重新开始。

## 它保存什么 {#storage}

你的用户的数据留在 Server 的数据库中。推荐服务没有账号系统，也不知道用户是谁。

| 内容 | 位置 | 保存多久 |
| --- | --- | --- |
| 公开视频标题的向量 | 它自己的 PostgreSQL 数据库，`title_vectors` 表 | 直到被删除。不涉及任何用户。 |
| Server 发送的公开视频资料 | 它自己的 PostgreSQL 数据库，`catalogue_videos` 表 | 直到该行被删除；新资料会替换旧资料。不关联账号。 |
| 某位用户的历史记录，由 Server 以一个键发送 | 内存和共享缓存 | 内存：闲置满 30 分钟后过期，并在下一次历史记录或推荐请求时清理；共享缓存：自发送起 30 分钟 |
| 正在生成的页面的计划 | 内存和共享缓存 | 2 分钟 |
| 从历史记录中得出的推断 | 仅内存 | 10 分钟，前提是历史记录没有变化 |

视频目录保存视频 ID、标题、频道 URL、类别、最多 12 个标签和最多 300 个描述
字符。它不会自动过期。

此外，Server 会把每个生成好的首页在 Dragonfly 中保存 30 分钟，并把每位用户的算法选择、更正和意见保存在它自己的数据库中。用户的导出文件包含他们的选择和意见。

该服务可以随时重启。重启后 Server 会重新发送历史记录，下一个页面照常生成。

## 它向 YouTube 请求什么 {#provider-requests}

推荐服务本身不向 YouTube 发送任何东西。它告诉 Server 一个页面需要哪些来源（某个频道的视频、一次搜索、某个视频旁边的相关视频），由 Server 通过它平常的提取流程、经过共享缓存去获取。

Server 会限制推荐服务能让它打开多少视频：

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `RECOMMENDER_STREAM_REQUESTS_PER_MINUTE` | `15` | 整个实例范围内，推荐服务每分钟最多能让 Server 在视频提供方打开的视频数。点击播放的人永远不受它限制。 |

当视频提供方拒绝某个请求时，推荐服务会在一段时间内完全不再请求视频，以免让正在观看的人遇到的拒绝持续更久。这段时间内生成的页面只是来源少一些。

## 设置 {#settings}

以下部署级的值从 `.env` 读取：

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `RECOMMENDER_ENABLED` | `false` | 在实例上提供推荐服务。之后可以在管理控制台中更改。 |
| `RECOMMENDER_MEMORY_LIMIT` | `2g` | 容器的内存上限 |
| `RECOMMENDER_DEFAULT_ALGORITHM` | `signals` | 为尚未选择的人预选的算法 |
| `RECOMMENDER_DATABASE` | `typetype_recommender` | 该服务自己的数据库名称 |
| `RECOMMENDER_CACHE_URL` | `redis://dragonfly:6379` | 该服务的共享缓存 |
| `RECOMMENDER_THREADS` | 最多 8 | 语言模型使用的 CPU 线程数 |
| `TYPETYPE_RECOMMENDER_IMAGE` | 稳定版镜像 | 替换镜像，用于固定版本的部署或回滚 |
| `TYPETYPE_POSTGRES_VECTOR_IMAGE` | `pgvector/pgvector:pg17` | 自带 `pgvector` 的 PostgreSQL 镜像 |
| `TYPETYPE_RECOMMENDER_PORT` | `8190` | 该服务在 Compose 网络内监听的端口 |

Server 一侧的集成也可以调整：

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `RECOMMENDER_REQUEST_TIMEOUT_MS` | `2500` | 对推荐服务的一次调用最多可以花多久 |
| `RECOMMENDER_PAGE_DEADLINE_MS` | `4000` | 访问者等待页面多久之后改为显示标准首页；页面会继续生成，供下次访问使用 |
| `RECOMMENDER_PAGE_TTL_SECONDS` | `1800` | 生成好的页面保存多久 |
| `RECOMMENDER_PAGE_VARIANTS` | `3` | 为每位用户保存的页面数，这样刷新时能立即显示另一个 |
| `RECOMMENDER_RELATED_TTL_SECONDS` | `86400` | 某个视频的相关视频保存多久 |
| `RECOMMENDER_SEARCH_TTL_SECONDS` | `21600` | 搜索结果保存多久 |
| `RECOMMENDER_CHANNEL_TTL_SECONDS` | `1800` | 某个频道的视频保存多久 |
| `RECOMMENDER_SOURCE_PARALLELISM` | `6` | 同一个页面同时获取的来源数 |

服务的 Compose 文件只传递上面这些值。服务自身还读取其他一些值，需要用针对 `typetype-recommender` 的 Compose 覆盖文件来设置：

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `RECOMMENDER_HISTORY_TTL_SECONDS` | `1800` | 内存记录在达到闲置期限后的下一次请求时清理；共享缓存 TTL 从发送时开始 |
| `RECOMMENDER_HISTORY_ITEMS_KEPT` | `400000` | 内存中同时保存的所有历史记录的观看和点赞条目总数，每 1,000 条约 0.5 MB |
| `RECOMMENDER_PLAN_TTL_SECONDS` | `120` | 页面的计划保存多久 |
| `RECOMMENDER_PROFILE_TTL_SECONDS` | `600` | 从未变化的历史记录中得出的推断保存多久；`0` 表示关闭 |
| `RECOMMENDER_EMBED_BUDGET` | `100` | 一次请求内模型最多读取的新标题数 |
| `RECOMMENDER_MAX_TITLES` | `2000` | 一份画像最多读取的标题数 |
| `RECOMMENDER_EMBEDDING_MODEL`、`RECOMMENDER_EMBEDDING_FILE` | 多语言 mpnet，fp16 | 语言模型及其版本 |
| `RECOMMENDER_DATABASE_POOL` | `4` | 与数据库保持的连接数 |
| `RECOMMENDER_CACHE_TIMEOUT_MS` | `2000` | 一次缓存调用最多可以花多久 |

留空的变量视为未设置。

```yaml
services:
  typetype-recommender:
    environment:
      RECOMMENDER_PARALLEL_BATCHES: "3"
```

把它保存为部署目录中的 `docker-compose.override.yml`；安装脚本会保留这个文件，并在最后应用它。

### 内存与速度的取舍 {#memory}

使用默认值时，该服务保持在 2 GB 以内。如果主机能给它 4 GB，服务的两项设置可以让它在大量新用户同时到来时更快，代价是占用更多内存：

| 变量 | 默认值 | 效果 |
| --- | --- | --- |
| `RECOMMENDER_PARALLEL_BATCHES` | `1` | 同时通过模型的标题批次数。设为 `3` 时，为大量新用户服务的速度大约快三分之一，峰值内存多用约 0.8 GB。 |
| `RECOMMENDER_ONNX_ARENA` | `0` | 设为 `1` 时，模型会保留其最大批次所用的内存：人多时大约快 10%，多用约 1.3 GB。 |

请同时调高 `RECOMMENDER_MEMORY_LIMIT`。

## 更新 {#update}

使用安装脚本时，照常更新即可。因为 `.env` 中有 `RECOMMENDER_ENABLED=true`，它会保留该服务：

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes --dir "$STACK_DIR"
```

手动操作时，用两个文件拉取镜像并重新创建：

```sh
cd "$STACK_DIR"
docker compose -f docker-compose.yml -f docker-compose.recommender.yml pull
docker compose -f docker-compose.yml -f docker-compose.recommender.yml up -d --wait --wait-timeout 900
```

模型留在它的卷里，更新不会重新下载。之后请按[检查它是否在运行](#verify)再检查一遍：版本那一行会告诉你当前响应的是哪个版本。

## 移除 {#remove}

1. 在 `.env` 中设置 `RECOMMENDER_ENABLED=false`，这样安装脚本在下次更新时不会再把它加回来。

2. 不带服务的文件重新创建部署：

   ```sh
   cd "$STACK_DIR"
   docker compose -f docker-compose.yml up -d --remove-orphans --wait
   ```

   服务的容器被删除，PostgreSQL 回到 `postgres:17`，Server 在不带服务地址的情况下重新创建。所有人的首页都恢复为标准首页，算法页面消失。

3. 检查：

   ```sh
   docker compose exec -T typetype-server wget -qO- http://127.0.0.1:8080/instance
   ```

   返回内容现在包含 `"recommender":{"installed":false,`。

用户的选择、更正和意见仍保留在 Server 的数据库中，以便你日后再次添加该服务。除此之外，该服务从未保存过他们的任何内容。

如果想回收磁盘空间，可以：

```sh
docker volume ls | grep recommender_models
docker volume rm <上面显示的名称>
docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DROP DATABASE typetype_recommender"'
```

## 故障排查 {#troubleshooting}

先查看该服务的日志：

```sh
cd "$STACK_DIR"
docker compose -f docker-compose.yml -f docker-compose.recommender.yml logs --tail 100 typetype-recommender
```

| 现象 | 原因 | 处理方法 |
| --- | --- | --- |
| 首次启动时 `STATUS` 连续几分钟停在 `(health: starting)` | 约 550 MB 的模型正在下载 | 等待。完成后日志会显示 `Application startup complete`。 |
| 日志在 `Application startup complete` 之前出现网络错误 | 无法从 Hugging Face 下载模型 | 首次启动时让容器能访问互联网。之后模型会从卷中读取。 |
| `no such service: typetype-recommender` | 命令只写了 `docker-compose.yml` | 加上 `-f docker-compose.recommender.yml`。 |
| 容器被杀掉并重启，`docker inspect` 中显示 `OOMKilled` | 它达到了 `RECOMMENDER_MEMORY_LIMIT` | 调高上限，或者保持[内存与速度的取舍](#memory)中的默认值。 |
| `/version/recommender` 没有任何返回 | Server 没有带着服务的文件重新创建，或者缺少共享密钥 | 重新执行[C. 手动操作](#manual)中第 3 步和第 4 步的两条命令。 |
| 菜单中没有 **算法** | 实例没有提供该功能 | 管理控制台，**推荐服务**，**提供实验性首页**；然后重新加载页面。 |
| 首页仍然是标准首页 | 页面没有及时准备好，或者账号没有数据 | 几秒钟后重新加载。管理控制台中的 **退回标准首页的次数** 统计了这种情况发生的次数。 |
| **服务状态** 显示 **无响应** | 服务已停止或仍在启动 | 按上面的方法检查它的状态和日志。在此期间，首页都是标准首页。 |

## 参考链接

- [Signals 仓库](https://github.com/TypeType-Video/TypeType-Signals)
- [服务的 Compose 文件](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.recommender.yml)
- [安装脚本](https://github.com/TypeType-Video/TypeType/blob/main/scripts/install-stack.sh)
- [Server 中的服务配置](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/services/RecommenderConfig.kt)
