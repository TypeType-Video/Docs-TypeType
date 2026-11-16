# Twitch（可选）

Twitch 支持是一个可选服务，以 [TypeType-Live](https://github.com/TypeType-Video/TypeType-Live) 发布。
启用后，用户可以浏览 Twitch 的直播、分类和标签，观看直播、往期直播和剪辑，在聊天室中阅读和发言，
并可关联自己的 Twitch 账号。往期直播会像其他视频一样记住播放位置。Twitch 永远看不到他们的 IP 地址，他们的浏览器也永远不会联系 Twitch。

没有该服务的实例与以前完全相同，不会显示任何 Twitch 栏目。

## 开始之前 {#requirements}

| 资源 | 用量 |
| --- | --- |
| 内存 | 约 128 MB（`LIVE_MEMORY_LIMIT`） |
| 磁盘 | 镜像约 10 MB |
| TypeType | 1.18.0 或更新版本，使用安装脚本或受支持的 Compose 文件安装 |

添加后，你的实例会有以下变化：

- 新增一个容器 `typetype-live`；
- `typetype_secrets` 卷中新增三个由 `typetype-init` 创建的密钥：Server 与 Live 共享的密钥、
  加密已关联 Twitch 账号的密钥，以及让播放链接在重启后仍然有效的密钥；
- Server 会使用该服务的地址重新创建。

本页命令使用 `$STACK_DIR` 表示实例所在目录：

```sh
STACK_DIR=~/typetype-stack
```

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

不带 `--yes` 时，安装脚本也会询问。它会在 `.env` 中写入 `TWITCH_ENABLED=true`，以便之后的更新保留 Twitch。

## B. 手动添加 {#install-by-hand}

```sh
cd "$STACK_DIR"
COMPOSE_TWITCH_FILE=docker-compose.twitch.yml ./scripts/run-stack-init.sh
docker compose -f docker-compose.yml -f docker-compose.twitch.yml up -d --wait
```

如果之后使用安装脚本更新，请在 `.env` 中加入 `TWITCH_ENABLED=true`。

## 检查是否正常 {#check}

打开实例：侧边栏会显示 **直播**。打开一个正在直播的频道及其聊天室。

```sh
docker compose -f docker-compose.yml -f docker-compose.twitch.yml ps typetype-live
```

容器状态应为 `healthy`。

## 关联 Twitch 账号 {#link-account}

每个用户都可以在 **直播 > 关联 Twitch 账号** 中关联自己的 Twitch 账号。TypeType 会显示一个代码，
在任意已登录 Twitch 的设备上打开 `twitch.tv/activate` 输入即可。关联后会显示关注的直播，
可以发言和关注频道，并使用该账号读取往期直播的聊天和章节。令牌加密保存在数据库中，绝不会发送到浏览器。

## 移除 {#remove}

在 `.env` 中设置 `TWITCH_ENABLED=false`，避免之后的更新再次添加，然后不带 Twitch 文件启动实例：

```sh
cd "$STACK_DIR"
docker compose -f docker-compose.yml up -d --remove-orphans --wait
```

Twitch 栏目会消失。已关联的账号仍加密保存在数据库中。

## 设置 {#settings}

| 变量 | 默认值 | 作用 |
| --- | --- | --- |
| `TYPETYPE_LIVE_IMAGE` | 跟随 `TYPETYPE_VERSION` | Live 镜像 |
| `LIVE_MEMORY_LIMIT` | `128m` | 容器内存上限 |
| `LIVE_SEGMENT_CACHE` | `48MiB` | 视频分片共享缓存 |
| `TWITCH_SERVICE_TIMEOUT_MS` | `15000` | Server 调用 Live 的超时时间 |

## 自己的 Compose 文件 {#own-compose}

如果你使用自己的 Compose 文件运行 TypeType，请加入
[docker-compose.twitch.yml](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.twitch.yml)
中的 `typetype-live` 服务，不要公开它的端口：只有服务器和网页容器会与它通信。它的变量列在
[TypeType-Live 的 README](https://github.com/TypeType-Video/TypeType-Live) 中。

### 让服务器连接该服务 {#server}

| 变量 | 含义 |
| --- | --- |
| `TWITCH_SERVICE_URL` | 服务地址，例如 `http://typetype-live:8080` |
| `TWITCH_SERVICE_SECRET` | 与 `LIVE_SECRET` 相同的值 |
| `TWITCH_TOKEN_ENCRYPTION_KEY` | 至少 32 个随机字符；用于加密用户关联的 Twitch 账号 |
| `TWITCH_SERVICE_TIMEOUT_MS` | 向服务发起请求的超时时间，默认 `15000` |

`TWITCH_SERVICE_SECRET` 和 `TWITCH_TOKEN_ENCRYPTION_KEY` 也接受 `_FILE` 形式，从文件中读取值。
在前三个变量全部设置之前，Twitch 保持关闭。

### 网页容器 {#web}

网页镜像已经把 `/live/hls/` 转发到 `typetype-live:8080` 上的服务。如果你的服务名称或端口不同，
请在网页容器上设置 `TYPETYPE_LIVE_HOST` 和 `TYPETYPE_LIVE_PORT`。只有签名的视频链接经过这条路由；
服务的 API 在共享密钥之后保持私有。
