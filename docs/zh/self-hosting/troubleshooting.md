# 故障排查

先看看某个服务正在做什么：

```sh
docker compose ps               # 每个服务的状态
docker compose logs -f <name>   # 跟踪某个服务，例如 typetype-server
```

## 端口已被占用 {#a-port-is-already-in-use}

`docker compose up` 失败，并报出“address already in use”或“port is allocated”错误。说明另一个程序在使用这个端口。修改 `.env` 中对应的 `HOST_PORT_*`（见[配置](./configuration#ports)），然后再次运行 `docker compose up -d`。

## 页面能加载，但操作因 CORS 或网络错误而失败 {#the-page-loads-but-actions-fail-with-cors-network-errors}

网页应用能加载，但登录或加载内容失败。原因是 `ALLOWED_ORIGINS` 中缺少你的域名。把它设为你真实的源（例如 `https://watch.example.com`），然后运行 `docker compose up -d`。见[反向代理与 HTTPS](./reverse-proxy#before-you-start)。

匹配是精确的：要包含协议和端口，并且不带结尾的斜杠。例如，在 `http://server.lan:32110` 打开的页面需要：

```dotenv
ALLOWED_ORIGINS=http://server.lan:32110
```

编辑 `.env` 之后重新创建 Server：

```sh
docker compose up -d --force-recreate typetype-server
```

这个与首个管理员相关的具体故障，是和 [hulmgulm 在讨论 #151](https://github.com/TypeType-Video/TypeType/discussions/151) 中一起定位出来的。

## 某个服务不断重启 {#a-service-keeps-restarting}

```sh
docker compose logs --tail=50 <name>
```

- `typetype-server` 会等待 `postgres` 和各个初始化容器；如果它重启，请检查 `postgres` 是否健康，以及 `DATABASE_*` 是否正确。
- `typetype`（网页）依赖服务器；它比服务器晚几秒启动是正常的。

## 下载功能不工作 {#downloads-do-not-work}

下载功能需要先配置好对象存储。请确认你已经：

1. 在 `.env` 中设置了真实的 `DOWNLOADER_S3_ACCESS_KEY`（以 `GK` 开头）和 `DOWNLOADER_S3_SECRET_KEY`。
2. 执行了[手动安装第二部分](./docker-compose#part-2-object-storage-for-downloads)中配置 Garage 的步骤。
3. 生成了真实的 `GARAGE_RPC_SECRET`，并且在 Garage 的日志拒绝占位符时重启了 Garage。

检查对象存储能否看到你的密钥和存储桶：

```sh
docker compose exec -T garage /garage bucket list
docker compose exec -T garage /garage key list
```

浏览器使用的是 `/api/downloader/...`；它不需要解析内部主机名 `garage`。如果 Downloader 的日志中出现 `401 Authentication required`，则说明该任务的提取请求没有保留有效的用户会话。报告时请附上 Server 和 Downloader 的日志，以及五个组件的版本响应。

这个故障是在跟进 [nanhoes 关于 iOS 下载的报告](https://github.com/TypeType-Video/TypeType/issues/116)时暴露出来的，之后又对照当前从 Server 到 Downloader 的授权流程做了核对。

## YouTube 远程登录开始后显示 404 {#remote-youtube-login-starts-then-shows-a-404}

如果会话创建成功，但浏览器路由返回 `404`，很可能是 WebSocket 被当作普通的 HTTP 请求转发了。请在每一层代理上检查是否有：

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $connection_upgrade;
```

受支持的 nginx 配置已经打包在网页镜像中。如果部署使用了自定义的主机挂载，请把它与 frontend 仓库中当前的文件进行比较。见[远程登录与 WebSocket](./reverse-proxy#remote-login-and-websockets)以及最初的[社区诊断](https://github.com/TypeType-Video/TypeType/discussions/122)。

## 意外登出 {#unexpected-sign-outs}

账号的访问令牌有效期为一小时，但刷新会话默认有效 30 天。当需要身份验证的请求返回 `401` 时，Frontend 会自动刷新，所以在满一小时的时候被登出并不是预期的正常行为。

请检查：

1. 页面使用 HTTPS。刷新 Cookie 默认带有 `Secure`。
2. `ALLOWED_ORIGINS` 中包含浏览器确切的源。
3. 登录请求和 `/api/auth/refresh` 请求带有凭据，并且没有被自定义的代理去掉。
4. Server 仍在使用保存着刷新会话的那个 PostgreSQL 卷。
5. 浏览器的隐私设置没有拒绝带 `SameSite=None` 的刷新 Cookie。

除非自定义部署设置了 `JWT_SECRET`，否则 Server 每次启动都会生成新的 JWT 签名密钥。这会使旧的一小时访问令牌失效，但只要 PostgreSQL 中的会话和刷新 Cookie 还在，正常的刷新流程应该立即恢复。因此，仅仅重启不应该要求重新登录。

对于无法使用 HTTPS 的可信本地实例，请设置 `AUTH_ALLOW_INSECURE_COOKIES=true` 并重新创建 `typetype-server`。这会有意削弱 Cookie 的传输安全，绝不能用在公开或不可信的网络上。`AUTH_SESSION_TTL_DAYS` 可以把刷新的有效期改为 1 到 365 天。见[会话有效期](./authentication#session-lifetime)。

如果问题依旧，请收集 `/auth/refresh` 前后的 Server 日志、浏览器中的响应状态码以及已部署的修订号。不要附上 Cookie 或任何 bearer 令牌。

这份检查清单源自 [Toni-Vide 在讨论 #162](https://github.com/TypeType-Video/TypeType/discussions/162) 中报告的异常行为。

## 更改密钥后，已保存的 YouTube 会话失效 {#a-saved-youtube-session-stopped-working-after-a-secret-change}

`YOUTUBE_SESSION_ENCRYPTION_KEY` 用于加密保存的 YouTube Cookie 和播放令牌。如果在使用过远程登录之后更改它，那些已保存的 YouTube 会话就无法再解密，受影响的用户必须重新连接 YouTube。它并不加密 TypeType 账号的登录。请一次选定这个值并保留下来。生成的值保存在 `typetype_secrets` 中，所以通常不需要动它。

## 播放不断重新加载，`/api/proxy` 返回 `422` {#playback-reloads-and-apiproxy-returns-422}

旧的播放实现会通过 `/api/proxy` 发送带签名的 `googlevideo` 链接。它最初的范围请求可能返回 `206`，随后是包含 `{"error":"Upstream returned 403"}` 的 `422` 响应。播放器于是反复重建播放源，而在浏览器关闭被放弃的代理响应之后，Server 可能记录 `ChannelWriteException`。

目前的播放使用有状态的 SABR 会话，不再通过同一条面向浏览器的路径使用那些带签名的媒体链接。如果仍然出现旧的请求模式，请检查五个组件的版本响应，并运行：

```sh
docker compose config --images
```

如果输出中包含 `ghcr.io/priveetee/...`，说明当前生效的 Compose 文件仍然指向以前的镜像命名空间。在排查远程登录、家庭 IP 或代理调优之前，请先按[迁移较旧的 Priveetee 部署](./maintenance#migrate-an-older-priveetee-stack)操作。

旧的故障过程和成功的更新由 [filippobaroni 在讨论 #133](https://github.com/TypeType-Video/TypeType/discussions/133#discussioncomment-17779201) 中记录。

## Token 状态健康，但 YouTube 播放失败 {#token-is-healthy-but-youtube-playback-fails}

`/health` 只能证明 Bun 服务在监听。PO 令牌、解码器、SABR 和远程浏览器流程还需要通过 Playwright 运行的 Chromium，以及可写的运行时路径。

如果你应用了自定义的非 root 或只读容器配置，请分别重新测试 `/potoken`、一个普通的 YouTube 视频、一场直播以及远程登录。在当前镜像中，任意的 `nobody` 用户没有可供 Chromium Crashpad 使用的主目录。在把故障当作 Server 或 Player 的错误之前，请先恢复到受支持的 Token 服务定义。

见 [Token 的浏览器边界](./security#token-browser-boundary)以及 [hugoghx 对容器的研究](https://github.com/TypeType-Video/TypeType/discussions/156)。

## 从头开始 {#start-over-from-scratch}

::: danger 这会删除你的数据
`down -v` 会删除数据库、缓存和对象存储的卷。
:::

```sh
docker compose down -v
docker compose up -d
```

## 更新 {#updating}

由安装脚本管理的部署：

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes --dir "$STACK_DIR"
cd "$STACK_DIR"
docker compose ps
```

`$STACK_DIR` 是你的部署目录，除非你选了别的目录，否则是 `~/typetype-stack`：见[选择目录](./quick-start#stack-directory)。

不使用脚本的部署，在用当前版本替换受管的 Compose 文件和脚本、并保留 `.env` 和自定义覆盖文件之后：

```sh
docker compose config -q
docker compose pull
docker compose up -d --force-recreate --wait --wait-timeout 180
docker compose ps
```

你的数据保存在命名卷中，所以更新会保留你的账号和历史记录。如果新版本无法正常启动，请按[回滚一次更新](./rollback)操作，而不是删除容器或卷。
