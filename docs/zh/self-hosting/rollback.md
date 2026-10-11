# 回滚一次更新

TypeType 可以回到之前运行的应用镜像，而不必删除它的数据卷。请在每次更新**之前**准备好回滚所需的信息；`latest` 标签会不断前移，不能用作回滚的依据。

::: danger 绝不要删除数据卷
不要运行 `docker compose down -v`，也不要删除 PostgreSQL、Garage 或密钥的卷。普通的 `docker compose down` 会保留它们。
:::

## 更新之前 {#before-updating}

打开部署目录：除非你选了别的目录，否则是 `~/typetype-stack`；手动安装时则是包含 `docker-compose.yml` 的那个目录。见[选择目录](./quick-start#stack-directory)。

```sh
cd "$STACK_DIR"
mkdir rollback-before-update
cp .env docker-compose.yml rollback-before-update/
for file in docker-compose.arm64.yml docker-compose.override.yml nginx.conf garage.toml; do
  [ ! -f "$file" ] || cp -a "$file" rollback-before-update/
done
docker compose exec -T postgres pg_dump -U typetype typetype > rollback-before-update/typetype.sql
```

受支持的安装脚本会在更新之前自动完成部署文件和镜像引用这部分。它带时间戳的备份保存在 `.typetype-backups/` 下。数据库的转储仍然是运营者需要另外做的备份。

记录当前正在运行的四个镜像引用：

```sh
docker image inspect "$(docker compose images -q typetype)" --format '{{index .RepoDigests 0}}'
docker image inspect "$(docker compose images -q typetype-server)" --format '{{index .RepoDigests 0}}'
docker image inspect "$(docker compose images -q typetype-downloader)" --format '{{index .RepoDigests 0}}'
docker image inspect "$(docker compose images -q typetype-token)" --format '{{index .RepoDigests 0}}'
```

每条命令都会输出一个以 `@sha256:...` 结尾的不可变引用。把这四个输出和备份放在一起，并分别标注为 web、server、downloader 和 token。

## 恢复之前的应用版本 {#restore-the-previous-application-version}

停止当前的部署，但不要删除它的卷：

```sh
docker compose down
```

恢复之前的部署文件和配置：

```sh
cp rollback-before-update/.env .env
cp rollback-before-update/docker-compose.yml docker-compose.yml
for file in docker-compose.arm64.yml docker-compose.override.yml nginx.conf garage.toml; do
  [ ! -f "rollback-before-update/$file" ] || cp -a "rollback-before-update/$file" "$file"
done
```

打开 `.env`，把下面这些值设为更新之前记录的四个引用：

```dotenv
TYPETYPE_WEB_IMAGE=ghcr.io/typetype-video/typetype@sha256:WEB_DIGEST
TYPETYPE_SERVER_IMAGE=ghcr.io/typetype-video/typetype-server@sha256:SERVER_DIGEST
TYPETYPE_DOWNLOADER_IMAGE=ghcr.io/typetype-video/typetype-downloader@sha256:DOWNLOADER_DIGEST
TYPETYPE_TOKEN_IMAGE=ghcr.io/typetype-video/typetype-token@sha256:TOKEN_DIGEST
```

请使用 Docker 输出的完整值，而不是示例中的占位符。然后校验恢复后的配置并重新创建部署：

```sh
docker compose config -q
docker compose pull
docker compose up -d --force-recreate --wait --wait-timeout 180
docker compose ps
curl -fsS http://localhost:8080/health
curl -fsS http://localhost:8081/health
curl -fsS http://localhost:8082/api/downloader/health/deep
```

这只改变应用的版本。账号、历史记录、设置、下载内容、Garage 的配置和密钥都留在现有的卷中。

## 只有在必要时才恢复数据库 {#restore-the-database-only-when-required}

不要仅仅因为应用回滚了就恢复数据库。大多数应用回滚都可以配合现有的数据工作。只有在版本说明要求，或者之前的服务器无法在当前的数据库结构下启动时，才恢复备份。

先停止连接 PostgreSQL 的服务：

```sh
docker compose stop typetype typetype-server typetype-downloader postgres-init
docker compose exec -T postgres dropdb -U typetype --if-exists typetype
docker compose exec -T postgres createdb -U typetype typetype
docker compose exec -T postgres psql -U typetype typetype < rollback-before-update/typetype.sql
docker compose up -d --wait --wait-timeout 180
```

这会把数据库恢复到更新之前的状态，所以备份之后所做的更改会丢失。

## 回到正常的更新 {#return-to-normal-updates}

有问题的版本被替换之后，从 `.env` 中删除那四个 `TYPETYPE_*_IMAGE` 值，或者把它们留空。下一次正常更新就会重新跟随稳定版的 `latest` 镜像。见[维护](./maintenance#updating)。
