# 报告问题

所有问题都集中在一个地方：**[TypeType-Video/TypeType](https://github.com/TypeType-Video/TypeType/issues)**。

无论是关于网页应用、API 还是下载，都在那里提交，并选择合适的表单。

你永远不必猜测是哪个部分出了问题。如果某个报告最终确定是后端特有的问题，维护者会接手处理。

报告有两种方式：

- **直接在 GitHub 上**提交 issue，地址见上面的链接。
- 使用**应用内的报告功能**，说明见下文。

## 在应用内报告 {#from-inside-the-app}

反馈问题最快的方式是内置的 **报告问题** 操作，例如在观看页面的操作栏中。它会打开一个简短的表单，使用它不需要 GitHub 账号。

你只需要填写两项：

- 一个**类别**：播放器、音频语言、字幕、界面或功能性之一，
- 一段简短的**描述**，说明哪里出了问题。

其余的一切都由应用替你收集。报告会自动记录你所在的页面或视频、你的浏览器和语言、播放器的状态，以及最近的崩溃日志或 API 错误，这些都是在你使用应用时于浏览器中收集的。你永远不必自己动手去找技术细节。

提交之后，报告会保存在你的实例上。接下来会发生这些事：

1. 报告保存在你的实例上。
2. 管理员在 **控制台** 区域查看已提交的报告。
3. 管理员可以从某个报告打开一个**预填好的 GitHub issue**：应用会为你配置的仓库构造一个 `issues/new` 链接，其中带有标题、预填的正文（报告及其上下文）、对 `bug` 标签的请求，以及在设置了 `GITHUB_ISSUE_TEMPLATE` 时带上那个模板。只有当打开链接的人拥有权限时，GitHub 才会应用通过 URL 请求的标签。在把报告放进这个 URL 之前，生成器会对它能识别出的 URL 主机名和类似域名的文本做脱敏处理。发布之前务必检查结果。

不需要任何 GitHub 令牌：应用只是生成预填好的链接；只有当有人在 GitHub 上提交时，issue 才会被创建。

### 配置 {#configuration}

应用内的报告指向哪里由两个变量决定（见[配置](./configuration#bug-reports)）：

| 变量 | 默认值 | 含义 |
| --- | --- | --- |
| `GITHUB_REPO` | `TypeType-Video/TypeType` | 预填的 issue 指向的仓库 |
| `GITHUB_ISSUE_TEMPLATE` | `bug_report_backend.md` | 目前附加到链接上的模板文件名 |

如果想把所有用户的报告都留在上面这个统一的问题跟踪器中，请让 `GITHUB_REPO` 保持默认值。如果你另有自己的跟踪器，请改用你自己的 fork。

## 让报告更有用 {#make-a-report-useful}

- 说明你使用的是 **main** 还是 **beta** 通道（见 [Beta 与 main](./beta-and-main)）。
- 写明复现步骤、你期望的结果以及实际发生的情况。
- 对于播放问题，请注明视频、提供方（YouTube、NicoNico、BiliBili）和画质。
- 查看 `docker compose logs typetype-server` 中问题发生时间前后的错误。
- 如果问题可能与某次更新有关，请附上已部署的各组件的修订号：

  ```sh
  curl -fsS https://watch.example.com/api/version
  curl -fsS https://watch.example.com/api/version/web
  curl -fsS https://watch.example.com/api/version/server
  curl -fsS https://watch.example.com/api/version/token
  curl -fsS https://watch.example.com/api/version/downloader
  ```

  发布之前，请替换示例中的源并删掉私有的主机名。这些端点包含的是构建元数据，而不是凭据。

## issue 是如何整理的 {#how-issues-are-organised}

每个 issue 都用标签分类，让跟踪器始终便于浏览：

- **类型**，即它是哪一种报告：`bug`、`feature request`、`enhancement`、`documentation` 或 `question`。中心仓库的 GitHub 表单会自动设置各自的标签。目前应用内的链接只请求 `bug`，并受上面所说的 GitHub 权限规则约束。
- **范围**，即它涉及哪个部分：`area: frontend`、`area: backend`、`area: token` 或 `area: downloader`。维护者会在分拣时加上，所以你不需要自己加。
- **优先级**：`priority: high`、`priority: medium` 或 `priority: low`。

实际上，大多数报告都与**网页应用和播放**有关，包括播放器、播放列表、字幕、导入和界面，较少一部分与**后端**（提取和 API）有关。报告会被分拣，其中绝大多数会被修复并关闭，所以一份清楚的报告确实会变成一次修复。

对某段说明或诊断有实质性帮助的报告，会在[社区来源与致谢](/zh/project/community)中署名致谢。

### 想参与贡献？ {#want-to-contribute}

有两个标签值得关注：

- [`good first issue`](https://github.com/TypeType-Video/TypeType/issues?q=is%3Aopen+label%3A%22good+first+issue%22)，适合入门的起点。
- [`help wanted`](https://github.com/TypeType-Video/TypeType/issues?q=is%3Aopen+label%3A%22help+wanted%22)，欢迎多一份力量的地方。
