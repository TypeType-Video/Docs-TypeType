# 仓库指南

TypeType 的每个组件都有明确而狭窄的职责范围、各自的检查和各自的许可证。面向用户的问题即使要在某个组件的仓库中修复，也仍然留在 TypeType 的中心问题跟踪器中。

## 职责归属一览 {#ownership-at-a-glance}

| 改动 | 负责的仓库 | 主要的源码路径 |
| --- | --- | --- |
| Docker Compose、安装脚本、更新、迁移或回滚 | [TypeType](https://github.com/TypeType-Video/TypeType) | `docker-compose*.yml`, `scripts/` |
| 页面、路由、nginx、设置项、账号界面或播放器控件 | [TypeType-Frontend](https://github.com/TypeType-Video/TypeType-Frontend) | `apps/web/src/`, `nginx.conf` |
| 提取、API 路由、账号数据、导入、推荐或播放会话 | [TypeType-Server](https://github.com/TypeType-Video/TypeType-Server) | `src/main/kotlin/dev/typetype/server/` |
| PO 令牌、YouTube 播放器解码器、字幕元数据或远程登录浏览器 | [TypeType-Token](https://github.com/TypeType-Video/TypeType-Token) | `src/` |
| 下载队列、传输、封装、存储或成品文件 | [TypeType-Downloader](https://github.com/TypeType-Video/TypeType-Downloader) | `cmd/`, `internal/`, `migrations/` |
| MSE 缓冲、分段调度、跳转、画质切换或播放恢复 | [TypeType-Player](https://github.com/TypeType-Video/TypeType-Player) | `src/` |
| 首页算法、它的设置或它推断出的内容 | [TypeType-Signals](https://github.com/TypeType-Video/TypeType-Signals) | `recommender/` |
| Discord 状态的细节、RPC 握手或系统托盘的行为 | [TypeType-RPC](https://github.com/TypeType-Video/TypeType-RPC) | `src-tauri/src/` |
| 面向用户、运营者或项目的说明 | [Docs-TypeType](https://github.com/TypeType-Video/Docs-TypeType) | `docs/` |

## 中心部署 {#central-stack}

`TypeType` 仓库是集成点，而不是一个单体应用。它包含各个公开组件的 Git 子模块，但部署使用的是 `docker-compose.yml` 中选定的组件镜像。

重要路径：

- `.env.example` 列出受支持的部署层面的设置和替换镜像。
- `docker-compose.yml` 定义稳定版的服务关系。
- `docker-compose.dev.yml` 定义 beta 的服务关系。
- `scripts/` 负责安装、更新、迁移时的备份、密钥生成、Garage 的配置以及稳定版部署的辅助脚本。

默认的 nginx 配置打包在 frontend 镜像中。因此中心部署不需要在每次更新时都从主机挂载一份对应的文件。

该仓库采用 MIT 许可证。

## Frontend {#frontend}

frontend 是一个 Bun 的 monorepo，其中包含一个 React 19 应用。TanStack Router 和 Query 负责导航和服务器状态，Zustand 负责本地状态，Tailwind CSS 负责样式，Vidstack 封装了可用的播放提供方。

有用的入口：

- `apps/web/src/routes`：页面和路由加载器；
- `apps/web/src/components`：共享的界面和播放器外壳；
- `apps/web/src/lib`：API 客户端和与浏览器的集成；
- `apps/web/src/hooks`：查询和各项功能的行为；
- `apps/web/src/settings` 和 `apps/web/src/stores`：客户端持久保存的选择。

检查：

```sh
bun run check
bun run test
bun run knip
bun run sherif
bun run build
```

该仓库采用 MIT 许可证。

## Server {#server}

Server 是一个运行在 JDK 25 上的 Kotlin/Ktor 应用。它用 PipePipeExtractor 支持各个媒体服务，通过 Exposed 和 HikariCP 使用 PostgreSQL 保存持久状态，并通过 Redis 协议使用 Dragonfly 保存缓存状态。

有用的入口：

- `Application.kt` 和 `ApplicationRoutes.kt`：服务与路由的装配；
- `routes/`：HTTP 约定；
- `services/`：应用、提取和播放的行为；
- `db/`：数据表和迁移；
- `openapi.yaml` 和 `openapi/`：对外发布的 API 约定。

检查：

```sh
./gradlew test
./gradlew shadowJar
./gradlew validateOpenApi
```

由于集成了提取器，该仓库采用 GPL-3.0 许可证。

## Token {#token}

Token 是一个内部的 Bun 服务，带有通过 Playwright 运行的 Chromium。它的名字是历史遗留的：如今它提供的远不止字幕或单个令牌端点。它提供 YouTube 的访客数据和 PO 令牌、播放器解码、SABR 会话元数据、字幕，以及用于远程登录的一次性浏览器会话。

frontend 不得直接调用 Token。Server 是它的使用方，也是它的安全边界。在自定义它的容器之前，请先阅读[安全边界](/zh/self-hosting/security#token-browser-boundary)。

检查：

```sh
bun run lint
bun test
bun run build
```

该仓库采用 MIT 许可证。

## Downloader {#downloader}

Downloader 是一个 Go 服务，任务保存在 PostgreSQL 中，缓存状态保存在 Dragonfly 中，支持按范围或 SABR 并发传输媒体，用 libavformat 封装，通过 SSE 报告进度，并支持本地或兼容 S3 的成品文件存储。

有用的入口：

- `internal/api` 和 `internal/server`：内部 HTTP API；
- `internal/pipeline`、`internal/downloader` 和 `internal/sabr`：任务的执行；
- `internal/mux` 和 `internal/ffmpeg`：以流复制方式封装；
- `internal/storage` 和 `internal/artifact`：容量管理和成品文件的交付。

检查：

```sh
gofmt -w cmd internal
go test ./...
go build ./...
```

该仓库采用 GPL-3.0-or-later 许可证。

## Player {#player}

Player 是一个没有任何依赖的 TypeScript 包，以 `@typetype/mse` 的名称发布在 npm 和 JSR 上。它把 Server 的播放会话变成 `HTMLVideoElement` 上的 Media Source Extensions 缓冲。这个包负责调度和恢复，而 Frontend 负责控件和页面布局。

有用的入口包括 `type-type-mse-player.ts`、`playback-loop.ts`、`segment-scheduler.ts`、`media-source-controller.ts`、`seek-controller.ts` 和 `player-recovery.ts`。

检查：

```sh
bun run check
bun run check:docs
bun run check:jsr
bun run test:coverage
bun run build
```

该仓库采用 MIT 许可证。

## RPC {#rpc}

RPC 是一个桌面伴侣程序，它把用户当前在 TypeType 上的播放内容变成 Discord Rich Presence 状态。它是一个 Tauri 2 应用，用 Rust 从零实现了 Discord 的 IPC 协议，不使用 Electron，也不依赖 Discord SDK。它驻留在系统托盘中，只有在开启分享时才会查询 Server 的状态端点。

有用的入口：

- `src-tauri/src/discord_frame.rs` 和 `discord_socket.rs`：IPC 的传输格式和本地套接字的发现；
- `src-tauri/src/discord_rpc.rs`：握手和活动命令；
- `src-tauri/src/presence.rs`：查询状态端点；
- `src-tauri/src/tray.rs`：托盘菜单和查询的生命周期；
- `src/main.ts`：设置窗口。

检查：

```sh
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
bun run build
```

该仓库采用 MIT 许可证。

## Signals {#signals}

TypeType-Signals 是可选的推荐服务：一个只包含首页算法、别无他物的 Python 服务。Server 调用它，取回它要求的视频，并过滤返回的结果。它是实验性的。

```sh
docker compose up -d --build
uv run pytest
```

重要路径：

- `recommender/algorithms/` 中每个算法一个文件。
- `recommender/contract.py` 和各个 `contract_*.py` 文件定义了 Server 发送和接收的内容。
- `tests/reference_pages.py` 构建参考页面，用来证明某项改动没有改变任何页面。

见 [Signals，推荐服务](./signals)。该仓库采用 GNU Affero General Public License 第 3 版许可证。

## 文档与组织主页 {#documentation-and-organisation-profile}

Docs-TypeType 是一个 VitePress 站点。面向用户的页面在 `docs/guide`，面向运营者的页面在 `docs/self-hosting`，面向开发者的页面在 `docs/project`。用下面的命令构建它：

```sh
bun run docs:build
```

文档采用 MIT 许可证。`.github` 主页仓库只包含用于展示组织的资源，没有声明许可证。

## 分支与 issue 的流程 {#branch-and-issue-workflow}

组件的开发以 `dev` 为目标；`main` 代表稳定版的发布线。在修改集成时固定的版本或镜像之前，请先阅读[分支与版本](./releases)。

错误、功能请求和关于文档的反馈都请提交到[中心问题跟踪器](https://github.com/TypeType-Video/TypeType/issues)。确定了负责的组件之后，再针对该组件的 `dev` 分支提交代码的 pull request。文档的 pull request 同样以 `dev` 为目标。

## 参考链接 {#source-references}

- [中心仓库的 README](https://github.com/TypeType-Video/TypeType/blob/main/README.md)
- [Frontend 的 README](https://github.com/TypeType-Video/TypeType-Frontend/blob/dev/README.md)
- [Server 的 README](https://github.com/TypeType-Video/TypeType-Server/blob/dev/README.md)
- [Token 的 README](https://github.com/TypeType-Video/TypeType-Token/blob/dev/README.md)
- [Downloader 的 README](https://github.com/TypeType-Video/TypeType-Downloader/blob/dev/README.md)
- [Player 的 README](https://github.com/TypeType-Video/TypeType-Player/blob/dev/README.md)
- [RPC 的 README](https://github.com/TypeType-Video/TypeType-RPC/blob/dev/README.md)
- [Signals 的 README](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/README.md)
