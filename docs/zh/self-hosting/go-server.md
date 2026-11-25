# Go 服务器（实验性）

TypeType Server 也有 Go 版本：[TypeType-Server-Go](https://github.com/TypeType-Video/TypeType-Server-Go)。
它提供相同的 API，使用相同的数据库、设置和密钥，因此网页应用以及 Android 和 TV 应用无需任何改动即可使用。
它仍是实验性的：Kotlin 服务器依然是默认选项，你可以随时切换回去。

## 开始之前 {#requirements}

| 资源 | 用量 |
| --- | --- |
| 内存 | 约 200 MB |
| 磁盘 | 镜像约 30 MB |

你的部署会有以下变化：`typetype-server` 容器改用 Go 镜像。首次启动时，它会在数据库中新增一张表
`go_schema_state`，其余内容保持不变。

如果实例正在使用，请先备份数据库（[备份](./maintenance#database)）。

## 切换到 Go 服务器 {#install}

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --server go
```

安装器会在之后的更新中保留这一选择。Go 服务器有自己的版本号：它跟随自己的最新发布版本，并忽略
`--version` 和 `--rc`。使用 `--beta` 时，它跟随自己的 beta 镜像。

## 切换回去 {#switch-back}

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --server kotlin
```

Go 服务器写入的数据，Kotlin 服务器仍然可以读取。

## 手动配置 {#install-by-hand}

将 `docker-compose.go.yml` 加入你已经在用的 Compose 文件：

```sh
docker compose -f docker-compose.yml -f docker-compose.go.yml --env-file .env up -d typetype-server
```

## 须知 {#differences}

- 服务器日志输出到容器的标准输出（`docker compose logs typetype-server`），而不是写入文件。
