# Twitch（可选）

Twitch 支持是一个可选服务，以 [TypeType-Live](https://github.com/TypeType-Video/TypeType-Live) 发布。
启用后，用户可以浏览 Twitch 的直播、分类和标签，观看直播、往期直播和剪辑，在聊天室中阅读和发言，
并可关联自己的 Twitch 账号。往期直播会像其他视频一样记住播放位置。Twitch 永远看不到他们的 IP 地址，
他们的浏览器也永远不会联系 Twitch。

没有该服务的实例与以前完全相同，不会显示任何 Twitch 栏目。

## 开始之前 {#requirements}

| 资源 | 用量 |
| --- | --- |
| 内存 | 约 128 MB |
| 磁盘 | 镜像约 10 MB |
| TypeType | 1.18.0 或更新版本 |

添加后的变化：新增一个容器 `typetype-live`，Server 会使用该服务的地址重新创建。只有 Server 和网页容器
会与它通信，不要公开它的端口。

## A. 使用安装脚本 {#install}

在新实例或现有实例上使用 `--twitch` 运行安装脚本：

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --twitch
```

::: tip 1.18.0 候选版本期间
在 1.18.0 正式发布之前，只有候选版本的安装脚本支持 `--twitch`：请使用
`https://raw.githubusercontent.com/TypeType-Video/TypeType/staging/scripts/install-stack.sh`，并加上
`bash -s -- --rc --twitch`。
:::

安装脚本会创建密钥、添加该服务，并在之后的更新中保留它。

## B. 手动添加 {#install-by-hand}

适用于自己管理实例的情况，例如使用 Dockge。

1. 在 `.env` 中加入三个至少 32 个字符的随机密钥。任何密码生成器都可以；`openssl rand -hex 32` 会输出一个。

   ```dotenv
   TWITCH_SERVICE_SECRET=替换为随机值
   TWITCH_TOKEN_ENCRYPTION_KEY=替换为另一个随机值
   LIVE_SIGNING_KEY=替换为第三个随机值
   ```

   用户关联账号后请保留 `TWITCH_TOKEN_ENCRYPTION_KEY`：更改它会让用户需要重新关联。

2. 在 `docker-compose.yml` 旁边的 `docker-compose.override.yml` 中加入该服务（没有就新建；安装脚本更新时会保留它）：

   ```yaml
   services:
     typetype-server:
       environment:
         TWITCH_SERVICE_URL: http://typetype-live:8080
         TWITCH_SERVICE_SECRET: ${TWITCH_SERVICE_SECRET}
         TWITCH_TOKEN_ENCRYPTION_KEY: ${TWITCH_TOKEN_ENCRYPTION_KEY}

     typetype-live:
       image: ghcr.io/typetype-video/typetype-live:${TYPETYPE_VERSION:-latest}
       restart: unless-stopped
       environment:
         LIVE_SECRET: ${TWITCH_SERVICE_SECRET}
         LIVE_SIGNING_KEY: ${LIVE_SIGNING_KEY}
         LIVE_PUBLIC_BASE: /live
       mem_limit: 128m
       read_only: true
       cap_drop: [ALL]
       security_opt: ["no-new-privileges:true"]
   ```

   候选版本期间，实例跟随 `TYPETYPE_VERSION=rc`，Live 也一样。

3. 启动：

   ```sh
   docker compose up -d
   ```

   网页容器已经把 `/live/` 下的视频链接转发到 `typetype-live:8080`。如果你的 Live 容器名称不同，
   请在网页容器上设置 `TYPETYPE_LIVE_HOST`（以及 `TYPETYPE_LIVE_PORT`）。

## 检查是否正常 {#check}

打开实例：侧边栏会显示 **直播**。打开一个正在直播的频道及其聊天室。在实例目录中，
`docker compose ps typetype-live` 显示容器为 `healthy`。

## 关联 Twitch 账号 {#link-account}

每个用户都可以在 **直播 > 关联 Twitch 账号** 中关联自己的 Twitch 账号。TypeType 会显示一个代码，
在任意已登录 Twitch 的设备上打开 `twitch.tv/activate` 输入即可。关联后会显示关注的直播，可以发言和关注频道，
并使用该账号读取往期直播的聊天和章节。令牌加密保存在数据库中，绝不会发送到浏览器。

## 移除 {#remove}

使用安装脚本时，在 `.env` 中设置 `TWITCH_ENABLED=false` 后重新运行它。手动添加时，从
`docker-compose.override.yml` 删除 `typetype-live` 部分和三行 `TWITCH_*`，然后运行
`docker compose up -d --remove-orphans`。Twitch 栏目会消失；已关联的账号仍加密保存在数据库中。

## 设置 {#settings}

| 变量 | 默认值 | 作用 |
| --- | --- | --- |
| `TWITCH_SERVICE_URL` | | Server 访问该服务的地址 |
| `TWITCH_SERVICE_SECRET` | | Server 与 Live 共享（`LIVE_SECRET`），至少 32 个字符 |
| `TWITCH_TOKEN_ENCRYPTION_KEY` | | 加密已关联的 Twitch 账号，至少 32 个字符 |
| `LIVE_SIGNING_KEY` | 启动时随机生成 | 让视频链接在重启后仍然有效，至少 32 个字符 |
| `LIVE_SEGMENT_CACHE` | `32MiB` | 共享视频分片的内存 |
| `TWITCH_SERVICE_TIMEOUT_MS` | `15000` | Server 调用 Live 的超时时间 |

在 Server 拿到前三个变量之前，Twitch 保持关闭。每个密钥也接受 `_FILE` 形式，从文件读取值。
