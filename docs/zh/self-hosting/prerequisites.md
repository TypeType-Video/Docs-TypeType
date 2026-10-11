# 前提条件

## 支持的主机 {#supported-hosts}

TypeType 需要 64 位的 Linux 主机。发布的镜像支持 `linux/amd64` 和 `linux/arm64`；需要时安装脚本会自动选用 ARM64 的缓存覆盖配置。不需要 GPU。

::: tip Raspberry Pi
内存至少 4 GiB 的 64 位 Raspberry Pi 4 或 5 可以运行一个小型的个人实例。Docker、PostgreSQL 和 Garage 的数据请使用 USB 3 固态硬盘，而不是 microSD 卡。
:::

## 资源规划 {#resource-sizing}

以下数字是整套 Compose 部署在主机上的总量，包括网页应用、Server、Token、Downloader、PostgreSQL、缓存和 Garage。它们是部署的目标值，而不是硬性限制。

| 档位 | CPU | 内存 | 下载之前的可用磁盘 | 适用场景 |
| --- | --- | --- | --- | --- |
| 小型个人实例 | 2 vCPU | 4 GiB | 固态硬盘上 20 GiB | 同时一两路播放和偶尔的下载 |
| 推荐 | 4 vCPU | 8 GiB | 固态硬盘上 40 GiB | 多位用户、订阅刷新和经常性的下载 |
| 繁忙或下载量大 | 8+ vCPU | 16+ GiB | 100+ GiB，另加存放下载文件的容量 | 大量并发会话，或者体积大、次数多的下载 |

4 GiB 的最低要求在整套部署的正常占用之上留出了余量，也能容纳 Server 或 Token 的短时峰值。CPU 占用通常不高，但提取、大规模的订阅刷新、播放启动和下载的封装可能同时发生。请为每一位同时在线的用户预留容量，而不是按空闲容器来估算。

播放不会把整个视频加载或保存在内存中。因此十小时的直播并不需要十小时那么多的内存；增加内存占用的是同时进行的播放会话及其活动缓冲区。

## 存储与长时间的下载 {#storage-and-long-downloads}

请为四种不同的用途预留磁盘：

- Docker 镜像，以及足够的余量，以便在旧的镜像层被清理之前拉取更新。
- PostgreSQL、缓存和应用的元数据。
- 下载器的工作文件，即分别获取并封装音频轨和视频轨期间的临时文件。
- Garage 卷中的成品文件。

根据总码率估算最终的媒体大小：

```text
size in decimal GB ≈ bitrate in Mbit/s × duration in hours × 0.45
```

| 示例 | 大致的最终大小 |
| --- | --- |
| 10 小时、128 kbit/s 的音频 | 0.58 GB |
| 10 小时、256 kbit/s 的音频 | 1.15 GB |
| 10 小时、20 Mbit/s 的 4K 视频 | 90 GB，另加音频 |
| 10 小时、40 Mbit/s 的 4K 视频 | 180 GB，另加音频 |

单凭分辨率标签并不能决定文件大小，起决定作用的是所选的码率。

使用自带的本地 Garage 存储时，一次视频下载在同一台主机上临时占用的空间可能约为其最终大小的三倍：下载的各条轨道、封装后的文件和 Garage 对象可能同时存在，直到任务结束。仅音频的下载临时可能需要约两倍于最终大小的空间。默认部署允许两个下载任务同时进行，所以要考虑两个任务重叠的情况。

`S3_ARTIFACT_TTL_SECONDS=7200` 控制的是文件链接的过期时间。它不是磁盘配额，也不会自动从 Garage 中删除对象。不再需要某些文件时，请清除已完成的下载任务。请留意 Garage 和 Docker 的存储占用，尤其是在进行长时间的 4K 下载之前：

```sh
df -h
docker stats --no-stream
docker system df -v
docker compose exec -T garage /garage -c /etc/garage.toml status
```

## 网络容量 {#network-capacity}

YouTube 的播放流量会经过 TypeType 主机。对于远程观看的人，主机先接收所选的媒体，再把它发送出去，所以它的下行和上行带宽都必须各自满足所有活动视频流的码率之和，再加上协议开销。在家里托管的实例往往受限于上行速度。

举例来说，一路 40 Mbit/s 的视频流在播放时大约需要 40 Mbit/s 的入站带宽和 40 Mbit/s 的出站带宽。两路这样的视频流大约需要两倍。还要为提取、缩略图、下载和其他用户留出额外的余量。

## 必需的软件 {#required-software}

在主机上安装以下工具：

- **Docker Engine** 24+ 以及 **Docker Compose v2** 插件（是 `docker compose`，不是旧的 `docker-compose`）。
- **curl**，用于运行受支持的安装脚本。
- **git**，用于克隆仓库。
- **openssl**，用于生成密钥。大多数发行版已预装；如果没有，本指南中的命令也给出了使用 Python 的替代方式。

检查你已有的工具：

```sh
docker --version
docker compose version
curl --version
openssl version
git --version
```

如果 `docker compose version` 失败，请先为你的发行版安装 Compose 插件，再继续。

## 可选项，用于公开部署 {#optional-for-a-public-deployment}

- 一个指向你服务器的**域名**。
- 一个用于终止 TLS 的反向代理（Caddy、nginx 或 Traefik）。这部分见[反向代理与 HTTPS](./reverse-proxy)。如果只在本地使用，可以跳过，直接通过 `http://localhost:8082` 访问应用。

::: warning 以非 root 用户运行
把你的用户加入 `docker` 组（`sudo usermod -aG docker "$USER"`，然后注销再重新登录），这样就不必每条命令都加 `sudo`。
:::
