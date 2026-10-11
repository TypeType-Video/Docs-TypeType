# 配置

受支持的部署从 `.env` 读取部署方面的选择。安装脚本会为你创建并更新这个文件。手动安装时，请复制 `.env.example`，替换下文指出的值，并且不要把这个文件纳入版本控制。

并不是每个服务的内部变量都属于 `.env`：中心 Compose 文件会推导出内部地址，并且只把受支持的设置传给各个容器。要构建自定义的拓扑，请使用 Compose 覆盖文件。

## 网页端口与诊断端口 {#ports}

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `HOST_PORT_WEB` | `8082` | 公开的网页容器；nginx 提供应用、API、WebSocket、SABR 和下载 |
| `HOST_BIND_SERVER` | `127.0.0.1` | Server 诊断端口绑定的主机地址 |
| `HOST_PORT_SERVER` | `8080` | Server 的诊断端口和直接访问 API 的端口 |
| `HOST_BIND_TOKEN` | `127.0.0.1` | Token 诊断端口绑定的主机地址 |
| `HOST_PORT_TOKEN` | `8081` | Token 的健康检查和版本端口 |
| `HOST_BIND_GARAGE_S3` | `127.0.0.1` | Garage 配置与诊断所绑定的主机地址 |
| `HOST_PORT_GARAGE_S3` | `3900` | Garage 的 S3 端口 |

只有 `HOST_PORT_WEB` 需要对外开放。其他的主机绑定请保持在回环地址上，除非某个特定的可信网络需要它们。在受支持的 Compose 文件中，Downloader、PostgreSQL 和 Dragonfly 没有固定的主机端口。

Beta 使用对应的 `HOST_PORT_*_BETA` 和 `HOST_BIND_*_BETA` 值。见 [Beta 与 main](./beta-and-main)。

## 允许的浏览器源 {#allowed-browser-origins}

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `ALLOWED_ORIGINS` | 用于开发的 localhost 地址 | 允许调用 Server 的浏览器源，用逗号分隔 |

源由协议、主机和可选的端口组成，不带路径，也不带结尾的斜杠：

```dotenv
ALLOWED_ORIGINS=https://watch.example.com,http://192.0.2.10:8082
```

浏览器的源必须完全一致。如果这个值不对，页面可能正常加载，但注册、登录或其他 API 操作会以空的 `403` 失败。修改之后请重新创建 Server：

```sh
docker compose up -d --force-recreate typetype-server
```

这一诊断是通过 [hulmgulm 关于首个管理员的报告](https://github.com/TypeType-Video/TypeType/discussions/151)得到确认的。

## 账号会话 {#account-sessions}

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `AUTH_SESSION_TTL_DAYS` | `30` | 刷新会话的有效天数，限制在 `1` 到 `365` 之间 |
| `AUTH_ALLOW_INSECURE_COOKIES` | `false` | 允许通过明文 HTTP 使用带 `SameSite=Lax` 的刷新 Cookie |

访问令牌始终有效一小时。有效的刷新会话会在后台自动续期，所以 `AUTH_SESSION_TTL_DAYS` 决定了一个账号在不重新登录的情况下能保持登录多久。

使用 HTTPS 以及任何公开部署时，请保持 `AUTH_ALLOW_INSECURE_COOKIES=false`。只有当一个可信的、仅限本地的实例必须通过明文 HTTP 运行时，才把它设为 `true`。这会削弱传输安全；见[会话有效期](./authentication#session-lifetime)。

修改其中任何一个值之后，请重新创建 Server：

```sh
docker compose up -d --force-recreate typetype-server
```

## 数据库与缓存 {#database-and-cache}

自带的 PostgreSQL 服务使用以下值：

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `POSTGRES_DB` | `typetype` | 应用的主数据库 |
| `POSTGRES_USER` | `typetype` | PostgreSQL 用户 |
| `POSTGRES_PASSWORD` | `typetype` | PostgreSQL 密码；真正部署时请更换 |
| `DRAGONFLY_URL` | `redis://dragonfly:6379` | Server 的缓存地址 |
| `DRAGONFLY_MAX_MEMORY` | `2gb` | 缓存可以使用的内存。写满之后，它会忘掉最旧的条目，而不是拒绝新的条目。 |
| `DRAGONFLY_THREADS` | `4` | 缓存的线程数。Dragonfly 每个线程需要 256 MB 的 `DRAGONFLY_MAX_MEMORY`，不够就无法启动。 |

`POSTGRES_DB`、`POSTGRES_USER` 和 `POSTGRES_PASSWORD` 是部署层面唯一的权威来源。Compose 会由它们推导出 Server 的 `DATABASE_*` 值和 Downloader 的 `DB_URL`。请只在这一处修改 PostgreSQL 的值，而不要在多个服务专用的变量中重复填写密码。

请在首次启动之前选定这些值。PostgreSQL 初始化它的卷之后，仅仅修改 `.env` 并不会改变数据库中已有角色的密码。

这样的安排源自 [arcoast 在讨论 #123](https://github.com/TypeType-Video/TypeType/discussions/123) 中指出的不一致之处。

使用外部数据库时，请通过 Compose 覆盖文件为 Server 设置 `DATABASE_URL`、`DATABASE_USER` 和 `DATABASE_PASSWORD`，并为 Downloader 设置 `DB_URL`。按照目前的设计，Downloader 需要它自己的 `typetype_downloader` 数据库。

## 下载与 Garage {#downloads-and-garage}

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `DOWNLOADER_S3_ACCESS_KEY` | 占位符 | Garage 的访问密钥；必须以 `GK` 开头 |
| `DOWNLOADER_S3_SECRET_KEY` | 占位符 | Garage 访问密钥对应的密钥 |
| `GARAGE_RPC_SECRET` | 占位符 | Garage 集群的 RPC 密钥，32 字节十六进制 |

安装脚本会生成这三个值并配置好存储桶。不使用脚本的安装必须替换这些占位符，并完成[手动安装的第二部分](./docker-compose#part-2-object-storage-for-downloads)。

自带的 Downloader 把 `http://garage:3900` 同时用于它的 S3 客户端和预签名的文件链接。Server 能识别这个内部主机名，并把完成的文件转交给浏览器。受支持的 `.env` 中没有必需的 `DOWNLOADER_S3_PUBLIC_ENDPOINT` 变量。

`GARAGE_RPC_SECRET` 的自动生成是在 [arcoast 于讨论 #130 中指出缺少该密钥](https://github.com/TypeType-Video/TypeType/discussions/130)之后加入的。

## 自带的与自定义的服务配置 {#bundled-and-custom-service-configuration}

受支持的 nginx 配置由网页镜像提供。中心部署不从主机挂载 `nginx.conf`，所以代理方面的修复会随网页镜像的正常更新一起到来。

初始化服务 `garage-config` 只有在命名卷 `garage_config` 中还没有配置时，才把 Garage 的默认配置写进去。已有的内容永远不会被覆盖。从较旧的部署迁移时，安装脚本会先暂存主机上原来的 `garage.toml`，初始化服务在首次使用时把它导入。

请把有意对 nginx 或 Garage 所做的修改放在单独的文件中，并通过 `docker-compose.override.yml` 挂载。安装脚本会保留覆盖文件，也不会替换不由它管理的配置文件。示例见[自定义 nginx 或 Garage 配置](./docker-compose#custom-nginx-or-garage-configuration)。

## YouTube 与 Token {#youtube-and-token}

Token 始终保持启用，因为 YouTube 播放要用到它的 PO 令牌、解码器、字幕和 SABR 端点。下面这个开关只控制交互式的远程登录：

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `YOUTUBE_REMOTE_LOGIN_ENABLED` | `false` | 启用交互式的 YouTube 登录流程 |
| `YOUTUBE_OUTBOUND_PROXY_URL` | 空 | 可选的出站代理，用于 YouTube 流量 |
| `YOUTUBE_REMOTE_LOGIN_CALLBACK_BASE_URL` | `http://localhost:8080` | 接收 Token 完成回调的 Server 内部源 |
| `YOUTUBE_REMOTE_LOGIN_CALLBACK_ORIGIN` | `http://typetype-server:8080` | Token 使用的内部回调源 |
| `YOUTUBE_REMOTE_LOGIN_TTL_MS` | `480000` | Server 请求的有效时长，限制在 1 到 10 分钟之间 |
| `YOUTUBE_REMOTE_LOGIN_MAX_SESSIONS` | `2` | 同时进行的远程浏览器会话数，限制在 1 到 8 之间 |
| `YOUTUBE_REMOTE_LOGIN_FRAME_FPS` | `10` | 登录画面的捕获帧率 |
| `YOUTUBE_REMOTE_LOGIN_MAX_FRAME_BYTES` | `524288` | 编码后的登录画面帧的最大大小 |

请让默认的回调保持为 Server 的内部地址。浏览器通过公开的网页源和 WebSocket 访问登录会话；它不会直接调用这个回调地址。

在自定义的 Compose 部署中，两个回调设置必须使用同一个 Server 内部源。请把 Server 上的 `YOUTUBE_REMOTE_LOGIN_CALLBACK_BASE_URL` 和 Token 上的 `YOUTUBE_REMOTE_LOGIN_CALLBACK_ORIGIN` 都设为 Token 在 Compose 网络中能访问到的主机名和端口，例如 `http://typetype-server:8080`。这两个设置都不要使用公开的网页地址。

在受支持的 Compose 文件中，Token 保留它自己默认的八分钟上限，因为这个时长变量只传给了 Server。因此，如果不对 Token 做自定义配置，超过八分钟的值并不会延长实际的保留时间。

重命名了 `typetype-token` 服务的自定义 Compose 部署，必须设置 Server 当前使用的内部端点变量 `SUBTITLE_SERVICE_URL`，或者保留 `typetype-token` 作为网络别名。见[自定义 Token 服务名称](./security#custom-token-service-names)。

## 对 YouTube 的请求限制 {#youtube-request-limits}

一个实例通过单一地址访问 YouTube，而 YouTube 会拒绝请求过多的地址：打开视频会开始失败，并提示“Sign in to confirm you're not a bot”，持续十分钟以上。搜索、频道页面和视频页面能承受的请求量远高于打开视频。

Server 从它自己的环境中读取这些值。受支持的 Compose 文件不会传递它们：请用针对 `typetype-server` 的 Compose 覆盖文件来设置。

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `YOUTUBE_OPENS_PER_MINUTE` | `0`（不限制） | 整个实例每分钟在 YouTube 打开的视频数。超过之后，每个视频都要排队等候，最多等 30 秒。没有人在等的视频从不排队：要么立刻发出，要么不发。 |
| `YOUTUBE_SESSION_RENEWAL` | 开启 | 一分钟内有三个视频被拒绝后，Server 向 Token 请求一次新会话，然后等待两分钟。设为 `off` 可以关闭。 |
| `YOUTUBE_LIVE_PROBE` | 先询问直播客户端 | 设为 `after` 时先询问普通客户端，只有它判断为直播的内容才询问直播客户端。适用于繁忙的实例：直播客户端一次只处理一个视频。 |
| `STREAM_PREVIEWS` | 开启 | 设为 `off` 时，拒绝一切在有人观看之前发起的视频请求，例如鼠标悬停在卡片上时。 |
| `SABR_INITIALIZATION_RANGE` | 开启 | 设为 `off` 时，跳过一个对某些地址来说每次播放都会被 YouTube 拒绝的请求。 |
| `EXTRACTOR_SIMULTANEOUS_REQUESTS_PER_HOST` | `64` | 提取器同时发往同一主机的请求数上限 |
| `EXTRACTOR_HTTP_VERSION` | HTTP/2 | 设为 `1` 时每个连接只发一个请求。如果 Server 在人多时停止响应而处理器却是空闲的，请使用它。 |
| `SUBSCRIPTION_FEED_MAX_CONCURRENT_FETCHES` | `20` | 构建订阅信息流时同时请求的频道页面数；只能调低 |
| `SUBSCRIPTION_FEED_FRESHNESS_SECONDS` | `60` | 订阅信息流可以有多旧，超过之后读取它会触发刷新；只能调高，最多一天 |
| `YOUTUBE_REQUEST_LOG` | 关闭 | 设为 `1` 时，每个发往 YouTube 的请求写一行日志。仅用于诊断。 |

```yaml
services:
  typetype-server:
    environment:
      YOUTUBE_OPENS_PER_MINUTE: "120"
      YOUTUBE_LIVE_PROBE: after
```

把它保存为部署目录中的 `docker-compose.override.yml`，然后重新创建 Server：

```sh
docker compose up -d --force-recreate typetype-server
```

Server 从不主动向 YouTube 请求字幕轨的文本；那是 YouTube 看管得最严的地址。

## 推荐服务 {#recommender}

可选的推荐服务有它自己的页面，其中包含它的要求和全部设置：[推荐服务](./recommender)。

## YouTube 密钥 {#secrets-handled-automatically}

| 变量 | 用途 |
| --- | --- |
| `YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN` | 验证 Server 与 Token 之间的远程登录回调 |
| `YOUTUBE_SESSION_ENCRYPTION_KEY` | 加密保存的 YouTube 会话凭据 |

初始化容器 `typetype-secrets` 把它们写入一个私有的命名卷。空值和 `SET_ME_...` 占位符会让系统在首次启动时生成一个值。在 `.env` 中提供真实的值会替换生成的文件。

不要随意轮换 `YOUTUBE_SESSION_ENCRYPTION_KEY`：已保存的 YouTube 会话无法用另一个密钥解密。

## OIDC {#oidc}

Server 支持 OIDC 变量，但它们不在基础的 `.env.example` 中。请按[身份验证（OIDC）](./authentication)中的说明，通过 Compose 覆盖文件添加。Server 支持的变量有：

- `OIDC_ISSUER` (或 `OIDC_ISSUER_URL`);
- `OIDC_CLIENT_ID`;
- `OIDC_CLIENT_SECRET`;
- 可选的 `OIDC_DISCOVERY_URL`、`OIDC_SCOPES` 和 `OIDC_PROVIDER_NAME`。

## 替换镜像 {#image-overrides}

留空即可使用正常的稳定版或 Beta 版镜像标签：

| 稳定版 | Beta |
| --- | --- |
| `TYPETYPE_WEB_IMAGE` | `TYPETYPE_WEB_BETA_IMAGE` |
| `TYPETYPE_SERVER_IMAGE` | `TYPETYPE_SERVER_BETA_IMAGE` |
| `TYPETYPE_DOWNLOADER_IMAGE` | `TYPETYPE_DOWNLOADER_BETA_IMAGE` |
| `TYPETYPE_TOKEN_IMAGE` | `TYPETYPE_TOKEN_BETA_IMAGE` |
| `TYPETYPE_RECOMMENDER_IMAGE` | `TYPETYPE_RECOMMENDER_IMAGE` |

回滚或固定版本的部署时，请把它们设为不可变的 `ghcr.io/...@sha256:...` 引用。见[回滚一次更新](./rollback)。

## 错误报告 {#bug-reports}

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `GITHUB_REPO` | `TypeType-Video/TypeType` | 应用内报告链接指向的仓库 |
| `GITHUB_ISSUE_TEMPLATE` | `bug_report_backend.md` | 附加到应用内报告链接上的模板文件名 |

::: warning 目前与中心问题跟踪器不一致
目前随附的目标仓库和模板并不匹配：`bug_report_backend.md` 存在于 TypeType-Server 中，而不在中心的 TypeType 仓库里。中心仓库的选择页面确实提供了 `bug_report.yml`，但那是一个结构化的 Issue 表单，它的字段使用各自的查询 ID；而应用内的生成器发送的是单个 Markdown 格式的 `body`。因此，把文件名换成 `bug_report.yml` 并不能等效地解决诊断信息预填的问题。
:::

指向某个 fork 或其他仓库时，请使用与其 issue 流程所期望的地址相兼容的模板。目前的限制和手动报告的方式见[报告问题](./reporting-issues#from-inside-the-app)。

## 校验最终的配置 {#validate-the-resolved-configuration}

Compose 可以在不启动的情况下显示最终的服务关系：

```sh
docker compose config -q
docker compose config
```

第二条命令会展开变量，所以在删掉密码和密钥之前，不要把它的输出公开贴出来。

## 参考链接 {#source-references}

- [当前的 `.env.example`](https://github.com/TypeType-Video/TypeType/blob/main/.env.example)
- [稳定版 Compose 的环境](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.yml)
- [Server 加载环境的代码](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/Application.kt)
- [远程登录的配置](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/YoutubeRemoteBrowserConfig.kt)
