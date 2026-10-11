# 维护

部署运行起来之后的日常运维。

## 更新 {#updating}

如果你是用推荐的安装脚本安装的 TypeType，再运行它一次即可。它会更新自己管理的部署文件，保留 `.env`、Compose 覆盖文件和数据卷，拉取发布版镜像，等待各个服务就绪，检查各组件的版本，并配置新增的 Garage 资源：

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes --dir "$STACK_DIR"
cd "$STACK_DIR"
docker compose ps
```

`$STACK_DIR` 是你的部署目录，除非你选了别的目录，否则是 `~/typetype-stack`：见[选择目录](./quick-start#stack-directory)。

再次运行安装脚本时，已配置的端口保持不变。账号、历史记录、下载内容和各服务的密钥都保留在 `.env` 和命名卷中。在修改受管文件之前，安装脚本会在 `.typetype-backups/` 下创建一个带时间戳的目录，其中包含之前的部署文件；如果旧配置有效，还包含它解析出的和正在运行的镜像引用。

对于不使用脚本的安装，先用当前版本的 Compose 文件和脚本替换旧的，同时保留 `.env`、可能存在的覆盖文件和自定义配置。然后校验并重新创建部署：

```sh
docker compose config -q
docker compose pull
docker compose up -d --force-recreate --wait --wait-timeout 180
docker compose ps
```

### 迁移较旧的 Priveetee 部署 {#migrate-an-older-priveetee-stack}

较旧的安装可能仍在使用引用 `ghcr.io/priveetee/...` 的 Compose 文件。用这些文件运行 `docker compose pull` 只会继续拉取旧的镜像命名空间，并不会把实例迁移到当前的 `ghcr.io/typetype-video/...` 版本。

在包含当前生效的 Compose 文件的目录中，检查解析出的镜像名称：

```sh
docker compose config --images
```

如果有任何 TypeType 镜像以 `ghcr.io/priveetee/` 开头，请更新一次部署文件。先保留当前的配置并备份数据库：

```sh
cd "$STACK_DIR"
migration_backup="../typetype-stack-before-migration-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$migration_backup"
cp -a .env docker-compose.yml "$migration_backup"/
[ ! -f nginx.conf ] || cp -a nginx.conf "$migration_backup"/
[ ! -f garage.toml ] || cp -a garage.toml "$migration_backup"/
docker compose exec -T postgres \
  pg_dump -U typetype typetype > "$migration_backup/typetype.sql"
```

把当前受支持的 Compose 文件和脚本下载到同一个目录。安装脚本会保留已有的 `.env` 文件、Compose 覆盖文件、不受管的文件和命名卷，同时补上当前必需的条目：

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh \
  | bash -s -- --dir "$PWD" --download-only --yes
```

::: warning 自定义的部署文件会被替换
这条命令会更新 `docker-compose.yml`、`.env.example` 和部署脚本。在恢复某项自定义改动之前，请先对照带时间戳的备份；不要把旧的 Compose 文件复制回来，因为那样也会恢复它旧的镜像引用。请把对服务的自定义改动放在 `docker-compose.override.yml` 中。
:::

主机上旧的 `nginx.conf` 会被备份，但默认部署不再挂载它，因为 nginx 现在随网页镜像一起提供。旧的 `garage.toml` 会被暂存，用于一次性导入 `garage_config` 卷。初始化程序绝不会覆盖该卷中已有的配置。

校验更新后的部署，并再次查看镜像：

```sh
docker compose config -q
docker compose config --images
```

现在，TypeType 的四个应用镜像都必须以 `ghcr.io/typetype-video/` 开头。拉取它们并重新创建服务，不要删除卷：

```sh
docker compose pull
docker compose up -d --force-recreate --wait --wait-timeout 180
docker compose ps
```

最后，把下面示例中的源换成实例的地址，确认已部署的各组件的修订号：

```sh
curl -fsS https://watch.example.com/api/version
curl -fsS https://watch.example.com/api/version/web
curl -fsS https://watch.example.com/api/version/server
curl -fsS https://watch.example.com/api/version/token
curl -fsS https://watch.example.com/api/version/downloader
```

这个一次性的迁移缺口是由 [filippobaroni 在讨论 #133 中的后续回复](https://github.com/TypeType-Video/TypeType/discussions/133#discussioncomment-17779201)指出的。

如果是从不包含 Garage 的版本升级，请在使用下载功能之前，先完整做一遍[手动安装](./docker-compose#manual-setup)，包括第二部分。

每次更新之前，请保留当前的镜像引用和一份数据库备份，以便在需要时[回滚这次更新](./rollback)。

## 日志 {#logs}

```sh
docker compose logs -f typetype-server     # 跟踪某个服务
docker compose logs --tail=100 typetype    # 网页应用的最后 100 行
docker compose logs                         # 全部
```

当提取、账号或 API 出现异常时，应该去看服务器日志。

## 备份 {#backups}

所有重要的东西都在两个地方：数据库和对象存储。

### 数据库 {#database}

```sh
docker compose exec -T postgres \
  pg_dump -U typetype typetype > typetype-$(date +%F).sql
```

恢复到一套全新的部署中：

```sh
cat typetype-YYYY-MM-DD.sql | docker compose exec -T postgres psql -U typetype typetype
```

### 对象存储（下载内容） {#object-store-downloads}

下载内容在 `garage_data` 和 `garage_meta` 卷中。直接备份这些卷本身（为了得到一致的副本，请先停止部署）：

```sh
docker compose down
docker run --rm -v typetype_garage_data:/data -v "$PWD":/backup busybox \
  tar czf /backup/garage-data-$(date +%F).tar.gz -C /data .
docker compose up -d
```

如果你的 Compose 项目前缀不同，请相应调整卷的名称（可以用 `docker volume ls` 查看）。

::: tip
下载内容是可以重新生成的，所以真正重要的是数据库备份。`.env` 文件也值得保留，因为它固定了你的端口和所有自定义的值。
:::

## 停止与启动 {#stopping-and-starting}

```sh
docker compose stop      # 停止容器并保留它们
docker compose start     # 重新启动它们
docker compose down      # 删除容器但保留卷（数据安全）
```

## 资源 {#resources}

小型实例有大约 2 GB 内存就很宽裕。最吃资源的组件是 API 服务器（JVM）和数据库。下载器在任务运行期间对磁盘和网络的使用最多，其余时间处于空闲状态。
