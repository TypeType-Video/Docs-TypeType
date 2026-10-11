# Beta 与 main

TypeType 通过两个通道发布，你可以在同一台主机上同时运行它们。

| 通道 | 分支 | 镜像 | 默认端口 |
| --- | --- | --- | --- |
| **main**（稳定版） | `main` | `ghcr.io/typetype-video/typetype:latest`、`...-server:latest` 等 | 网页 `8082`、服务器 `8080`、token `8081`、S3 `3900` |
| **beta** | `dev` | `ghcr.io/typetype-video/typetype-beta:latest`、`...-server-beta:latest` 等 | 网页 `18082`、服务器 `18080`、下载器 `19093`、token `18081`、S3 `3900` |

CI 会自动构建镜像：推送到 `main` 会更新 `:latest` 镜像，推送到 `dev` 会更新 `-beta` 镜像。所以 **main 是稳定版**，**beta 是即将到来的内容的预览**。

仓库、子模块的固定版本、镜像通知和部署是发布流程中各自独立的环节。需要了解确切的源码或镜像来源时，请阅读[分支与版本](/zh/project/releases)。

## 什么时候使用 beta {#when-to-use-beta}

- 在新功能进入稳定版之前先行试用。
- 在报告错误之前，用最新的 `dev` 构建复现或确认它。

Beta 可能在没有通知的情况下出问题或发生变化：请把真实的数据留在 main 通道上。

## 让 beta 与 main 并行运行 {#run-beta-alongside-main}

Beta 部署定义在 `docker-compose.dev.yml` 中。从同一个工作目录启动时，它读取同一个 `.env`，包括凭据和数据库设置，但不同的 Compose 项目名会让它拥有独立的容器、网络和命名数据卷。这并不会隔离主机端口：随附的 beta 中 Garage 的默认端口同样是 `3900`，所以手动并行部署时必须修改它。

### 一条命令（推荐） {#one-command-recommended}

Beta 分支的安装脚本可以替你把 beta 部署启动起来。它使用 `dev` 构建，所以要从 `dev` 获取脚本并传入 `--beta`：

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/dev/scripts/install-stack.sh | bash -s -- --beta
```

这会创建 `~/typetype-beta-stack`，只获取 `docker-compose.dev.yml` 及其配套文件，在默认端口被占用时选择空闲的 `*_BETA` 端口，拉取 beta 镜像，启动该部署并初始化 Garage。默认是交互式的；加上 `--yes` 可以跳过询问，加上 `--download-only` 则只获取文件而不启动 Docker。

### 手动操作 {#manually}

在 main 旁边启动 beta 之前，先给 Garage 一个空闲的主机端口，并允许 beta 的网页源。对于随附的默认值：

```dotenv
HOST_PORT_GARAGE_S3_BETA=13900
ALLOWED_ORIGINS=http://localhost:8082,http://127.0.0.1:8082,http://localhost:18082,http://127.0.0.1:18082
```

`ALLOWED_ORIGINS` 中已有的公开源请保留。

```sh
docker compose -f docker-compose.dev.yml -p typetype-beta up -d
```

- main 继续在 `http://localhost:8082` 提供服务，
- beta 在 `http://localhost:18082` 提供服务。

用同样的 `-f`/`-p` 参数管理 beta 部署：

```sh
docker compose -f docker-compose.dev.yml -p typetype-beta ps
docker compose -f docker-compose.dev.yml -p typetype-beta pull
docker compose -f docker-compose.dev.yml -p typetype-beta down
```

## 更新某个通道 {#update-a-channel}

```sh
# main
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes

# beta
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/dev/scripts/install-stack.sh | bash -s -- --beta --yes
```

再次运行安装脚本会保留该通道已有的 `.env`、端口和数据卷，同时更新部署文件和镜像。

::: tip 端口已被占用
安装脚本会选择空闲端口。手动启动时，请在启动 beta 部署之前，把 `.env` 中每个有冲突的 `HOST_PORT_*_BETA` 值改掉。尤其要注意，稳定版和 beta 的 Garage 端口默认都是 `3900`。见[配置](./configuration#ports)。
:::
