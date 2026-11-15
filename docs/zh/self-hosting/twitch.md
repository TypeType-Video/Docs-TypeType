# Twitch（可选）

::: warning 仅限开发分支
Twitch 支持位于 TypeType-Server 和 TypeType-Frontend 的 `dev` 分支上。它尚未进入任何正式版本，
中心部署栈也不包含它。
:::

Twitch 支持是一个可选服务，以
[TypeType Live](https://github.com/TypeType-Video/TypeType-Live) 的名称发布。没有它的部署栈
与之前完全一样：服务器在其 Twitch 路由上返回 `404`，网页应用隐藏 Twitch 栏目。

有了它，你的用户可以通过你的实例观看 Twitch 直播、VOD 和剪辑。Twitch 永远看不到他们的 IP
地址，他们的浏览器也永远不会联系 Twitch。

## 开始之前 {#requirements}

| 资源 | 用量 |
| --- | --- |
| 内存 | 上限 128 MB，`GOMEMLIMIT` 设为 100 MiB |
| 镜像 | 从源码构建；目前尚未发布镜像 |
| 网络 | 服务需要能够访问 Twitch |

## 1. 构建并运行服务 {#service}

```sh
git clone https://github.com/TypeType-Video/TypeType-Live.git
cd TypeType-Live
docker build -t typetype-live:local .
```

把它加入你部署栈的 Compose 文件，与服务器和网页容器处于同一网络：

```yaml
  typetype-live:
    image: typetype-live:local
    restart: unless-stopped
    environment:
      LIVE_SECRET: ${LIVE_SECRET}
      LIVE_SIGNING_KEY: ${LIVE_SIGNING_KEY}
      LIVE_PUBLIC_BASE: /live
      LIVE_SEGMENT_CACHE: 48MiB
      GOMEMLIMIT: 100MiB
    read_only: true
    cap_drop: [ALL]
    security_opt:
      - no-new-privileges:true
    pids_limit: 128
    mem_limit: 128m
```

不要公开它的端口。只有服务器和网页容器与它通信。

| 变量 | 默认值 | 含义 |
| --- | --- | --- |
| `LIVE_SECRET` | 必填 | 与服务器共享，至少 32 个字符 |
| `LIVE_SIGNING_KEY` | 启动时随机生成 | 让签名视频链接在重启后仍然有效，至少 32 个字符 |
| `LIVE_PUBLIC_BASE` | | 视频链接的公开前缀，配合 TypeType 网页容器时为 `/live` |
| `LIVE_SEGMENT_CACHE` | `32MiB` | 共享视频分片使用的内存：约为观看中的频道数 x 分片大小 x 6 |
| `LIVE_ADDR` | `:8080` | 监听地址 |
| `LIVE_LOG_LEVEL` | `info` | 日志级别 |

## 2. 让服务器连接该服务 {#server}

| 变量 | 含义 |
| --- | --- |
| `TWITCH_SERVICE_URL` | 服务地址，例如 `http://typetype-live:8080` |
| `TWITCH_SERVICE_SECRET` | 与 `LIVE_SECRET` 相同的值 |
| `TWITCH_TOKEN_ENCRYPTION_KEY` | 至少 32 个随机字符；用于加密用户关联的 Twitch 账号 |
| `TWITCH_SERVICE_TIMEOUT_MS` | 向服务发起请求的超时时间，默认 `15000` |

`TWITCH_SERVICE_SECRET` 和 `TWITCH_TOKEN_ENCRYPTION_KEY` 也接受 `_FILE` 形式，从文件中读取值。
在前三个变量全部设置之前，Twitch 保持关闭。

## 3. 网页容器 {#web}

网页镜像已经把 `/live/hls/` 转发到 `typetype-live:8080` 上的服务。如果你的服务名称或端口不同，
请在网页容器上设置 `TYPETYPE_LIVE_HOST` 和 `TYPETYPE_LIVE_PORT`。只有签名的视频链接经过这条路由；
服务的 API 在共享密钥之后保持私有。

## 用户能得到什么 {#features}

- 一个包含直播、分类和搜索的 Twitch 栏目。
- 通过实例播放的直播、VOD 和剪辑。
- 带有徽章和表情的直播聊天。
- 在 twitch.tv/activate 输入代码关联自己的 Twitch 账号，用于查看关注的直播、订阅者内容以及发送聊天消息。
