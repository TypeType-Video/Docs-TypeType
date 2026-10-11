# 安全边界

TypeType 会处理账号数据、YouTube 会话 Cookie、在浏览器中执行的令牌逻辑，以及下载的媒体。本页说明受支持的 Compose 部署提供了哪些边界，以及在自定义之前你应该了解哪些限制。

## 公开服务与内部服务 {#public-and-internal-services}

只向用户暴露网页服务。当前的部署使用以下边界：

| 服务 | 默认的主机暴露方式 | 原因 |
| --- | --- | --- |
| `typetype` | 所有网络接口上的 `HOST_PORT_WEB` | 公开的网页、API、WebSocket、播放和下载网关 |
| `typetype-server` | `127.0.0.1:HOST_PORT_SERVER` | 可选的主机侧健康检查和直接的 API 诊断 |
| `typetype-token` | `127.0.0.1:HOST_PORT_TOKEN` | 可选的主机侧健康诊断；绝不是公开的 API |
| `garage` | `127.0.0.1:HOST_PORT_GARAGE_S3` | 对象存储的内部诊断和配置 |
| Downloader、PostgreSQL、Dragonfly | 仅 Compose 网络 | 不需要浏览器或互联网直接访问 |

自带的 nginx 把 `/api/` 和 `/sabr/` 的流量发给 Server。Server 再作为通往 Token 和 Downloader 的网关。不要通过公开的反向代理暴露 Token、Downloader、PostgreSQL 或 Dragonfly。

## 密钥与保存的凭据 {#secrets-and-stored-credentials}

部署把密钥分成三类：

- `YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN` 用于验证从 Server 到 Token 的远程登录回调。
- `YOUTUBE_SESSION_ENCRYPTION_KEY` 用于加密保存的 YouTube 会话凭据。
- `GARAGE_RPC_SECRET` 用于验证 Garage 集群的 RPC 流量。

安装脚本会生成它们，并把与 YouTube 相关的值存入 `typetype_secrets` 卷。手动安装必须在启动部署之前生成一个随机的 Garage RPC 密钥。请妥善保管 `.env`、密钥卷和数据库备份，不要外泄。

更改 `YOUTUBE_SESSION_ENCRYPTION_KEY` 会使已保存的 YouTube 会话无法读取。在不考虑 Garage 现有状态的情况下更改 `GARAGE_RPC_SECRET`，可能导致对象存储节点无法正常启动。

## Token 的浏览器边界 {#token-browser-boundary}

TypeType-Token 通过 Playwright 启动 Chromium，用于 BotGuard 和 PO 令牌相关的工作，以及可选的交互式 YouTube 登录。请把它当作一个运行浏览器的服务来对待：

- 把它留在私有的 Compose 网络中；
- 让主机端口保持绑定到 `127.0.0.1`，或者干脆去掉发布的端口；
- 只以只读方式挂载生成的密钥卷；
- 和部署的其余部分一起更新镜像；
- 不要让它访问无关的主机目录或 Docker 的套接字。

受支持的 Compose 目前使用 `init: true` 和 `ipc: host` 来保证 Chromium 的稳定。发布的镜像还没有声明[讨论 #156](https://github.com/TypeType-Video/TypeType/discussions/156)中研究的那种完整的非 root、只读、去除能力的配置。

::: warning 不要盲目套用未经测试的加固配置
容器可能通过了 `/health`，而 `/potoken`、SABR 或远程登录却已经损坏。以任意的 `nobody` 用户运行也会让 Chromium 没有可用的主目录。测试自定义的安全配置时，请验证 Token 的全部流程，而不只是它的健康检查端点。
:::

当前的 Playwright 镜像包含一个 `pwuser` 账号，社区测试发现，可写的 `/tmp` 和 `/home/pwuser` 可以支持只读的根文件系统。这种配置是有价值的进行中的工作，但还不是受支持部署的默认设置，因为浏览器沙箱、IPC 的选择、PO 令牌、SABR 和远程登录流程必须一起验证。

感谢 [hugoghx](https://github.com/hugoghx) 在讨论 #156 中对容器边界所做的详细研究和可复现的测试。

## 自定义 Token 服务名称 {#custom-token-service-names}

Compose 中该服务的 DNS 名称是 `typetype-token`，Server 目前默认使用 `http://typetype-token:8081`。如果自定义部署重命名了这个服务又没有保留网络别名，请把下面这个 Server 环境变量设为它的内部地址：

```yaml
services:
  typetype-server:
    environment:
      SUBTITLE_SERVICE_URL: http://my-token-service:8081
```

`SUBTITLE_SERVICE_URL` 是当前实现中使用的名称，尽管 Token 现在除了字幕之外还负责 PO 令牌、解码、SABR 和远程登录。目前的 Server 不会读取 `TOKEN_SERVICE_URL` 变量。

如果远程登录使用单独的 Token 地址，还要为 Server 设置 `YOUTUBE_REMOTE_LOGIN_SERVICE_URL`。在受支持的部署中，这两个值指向同一个内部服务。

## 身份验证会话 {#authentication-sessions}

本地登录和 OIDC 登录都会签发一个有效期一小时的访问令牌，以及一个有效期 30 天、会轮换的刷新会话。刷新值是一个带有 `HttpOnly`、`Secure`、`SameSite=None` 的 Cookie。这种设计意味着：

- JavaScript 可以使用短期的访问令牌，但无法读取刷新令牌；
- 在公开域名上必须使用 HTTPS，并正确处理凭据和 CORS；
- 访问令牌正常过期时应触发刷新，而不是让用户登出；
- 登出或刷新令牌的轮换可以撤销已保存的会话。

没有单独的“记住我”时长设置。在 30 天的刷新有效期之内出现意外登出，应当作为 Cookie、源、代理或会话方面的问题来排查。见[故障排查](./troubleshooting#unexpected-sign-outs)。

这段说明源自 [Toni-Vide 在讨论 #162](https://github.com/TypeType-Video/TypeType/discussions/162) 中提出的问题，并依据 Server 和 Frontend 当前的会话代码。

## OIDC 密钥 {#oidc-secrets}

使用保密型的 OIDC 客户端，并且只把它的密钥保存在 Server 的环境中。登记准确的回调地址，在提供方那里限制允许的重定向 URI，并在关闭本地登录之前先验证 OIDC。见[身份验证（OIDC）](./authentication)。

## 参考链接 {#source-references}

- [稳定版 Compose 中的服务边界](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.yml)
- [Token 的容器镜像](https://github.com/TypeType-Video/TypeType-Token/blob/dev/Dockerfile)
- [Token 的浏览器实现](https://github.com/TypeType-Video/TypeType-Token/blob/dev/src/remote-login-browser.ts)
- [Server 访问令牌的有效期](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/AuthAccessTokenCodec.kt)
- [Server 刷新会话的有效期](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/AuthTokenIssuer.kt)
- [刷新 Cookie 的设置](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/AuthCookieHelpers.kt)
