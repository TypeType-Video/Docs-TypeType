# 手动安装

本页带你用 Docker Compose **手动**在自己的机器上把 TypeType 运行起来。基础安装只是一小段命令。仓库中辅助脚本所做的一切都在这里说明，所以你永远不必运行自己看不懂的脚本。

部署会在一次性的初始化过程中生成敏感的 YouTube 密钥。不使用脚本的安装必须自己生成 Garage 的 RPC 密钥，做法见下文。

::: tip 推荐：安装脚本
对大多数人来说，[快速开始](./quick-start)中的脚本是最省事的方式：它替你完成本页的全部内容，包括用于下载的对象存储。如果你想完全掌控或了解每一步，再使用这份手动指南。
:::

## 第一部分 - 让它运行起来 {#part-1---get-it-running}

### 1. 下载文件 {#1-download-the-files}

Compose 文件、`.env.example` 和部署脚本都在 TypeType 仓库中。网页镜像已经包含受支持的 nginx 配置，Compose 会在一个命名卷中创建 Garage 的默认配置。部署拉取的是预先构建好的镜像，所以不需要编译任何东西。

```sh
git clone https://github.com/TypeType-Video/TypeType.git
cd TypeType
```

### 2. 创建你的配置 {#2-create-your-configuration}

复制示例文件。大多数默认值已经适合本地安装；在启动服务之前，用下一条命令替换 Garage 的占位符。

```sh
cp .env.example .env
```

生成一个唯一的 32 字节十六进制 Garage RPC 密钥，并替换它的占位符：

```sh
GARAGE_RPC_SECRET=$(openssl rand -hex 32)
sed -i "s/^GARAGE_RPC_SECRET=.*/GARAGE_RPC_SECRET=$GARAGE_RPC_SECRET/" .env
```

这个值用于验证 Garage 内部的集群协议。受支持的安装脚本会自动生成它；这项要求是通过 [arcoast 对 Garage 的调查](https://github.com/TypeType-Video/TypeType/discussions/130)发现的。

::: tip 两个 YouTube 占位符会自动填好
`YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN` 和 `YOUTUBE_SESSION_ENCRYPTION_KEY` 会在首次启动时**替你**填好。一个初始化容器生成它们，Server 从一个私有卷中读取。除非你自己管理密钥，否则请保持这两个 `SET_ME_...` 值不变。
:::

### 3. 初始化并启动全部服务 {#3-bootstrap-and-start-everything}

```sh
./scripts/run-stack-init.sh
docker compose up -d --remove-orphans --wait --wait-timeout 180
```

初始化会运行一个短暂的 `typetype-init` 任务，并在成功运行后把它删除。它在长期运行的服务启动之前，准备好私有的密钥卷、Garage 的配置和 Downloader 的数据库。

检查长期运行的服务是否已启动：

```sh
docker compose ps -a
```

你应该看到 `typetype`、`typetype-server`、`typetype-token`、`typetype-downloader`、`postgres`、`dragonfly` 和 `garage`，全部处于 `running` 或 `healthy` 状态。初始化程序是带 `--rm` 运行的，所以成功初始化之后它不出现在列表中是正常的。

### 4. 打开它并创建管理员账号 {#4-open-it-and-create-the-admin-account}

访问 **`http://localhost:8082`**。在全新安装时，应用会发现还没有任何账号，并请你创建一个。**第一个账号会自动成为管理员**，不需要额外的步骤。

![全新安装时的注册界面](/screenshot-register.png)

输入名称、邮箱和密码，然后点 **注册**。你会立即以管理员身份登录，并进入引导界面，可以在那里导入你的数据。

![以管理员身份登录](/screenshot-onboarding.png)

从空白表单到管理员首页的完整流程：

![创建管理员账号](/register-admin.gif)

基础安装到此全部完成。如果要用 HTTPS 把它放到真正的域名上，见[反向代理与 HTTPS](./reverse-proxy)。

## 第二部分 - 用于下载的对象存储 {#part-2-object-storage-for-downloads}

**下载**功能需要一个兼容 S3 的对象存储，部署中已经自带（Garage）。[安装脚本](./quick-start)会自动把它配置好；手动步骤如下。浏览和观看已经可以使用，所以你可以现在做，也可以以后做，但在完成之前下载功能保持关闭。

### 1. 生成访问密钥和密钥 {#1-generate-an-access-key-and-secret}

访问密钥必须以 `GK` 开头。

```sh
echo "DOWNLOADER_S3_ACCESS_KEY=GK$(openssl rand -hex 12)"
echo "DOWNLOADER_S3_SECRET_KEY=$(openssl rand -hex 32)"
```

把这两行粘贴到 `.env` 中，替换占位符 `SET_ME_ACCESS_KEY` 和 `SET_ME_SECRET_KEY`，然后重新创建受影响的服务：

```sh
docker compose up -d
```

### 2. 配置 Garage {#2-provision-garage}

这些命令只需运行一次。它们分配存储空间、创建存储桶、登记你的密钥并授予它访问权限。Garage 通过 `GARAGE_CONFIG_FILE` 读取初始化好的配置，所以命令行工具会自动使用它。

```sh
# 容器内 Garage 命令行工具的简短别名
g() { docker compose exec -T garage /garage "$@"; }

# 1. 给节点分配存储布局
NODE_ID=$(g node id | head -n1 | cut -d@ -f1)
g layout assign -z dc1 -c 20GB "$NODE_ID"
g layout apply --version 1

# 2. 创建用于下载的存储桶
g bucket create typetype-downloads

# 3. 登记第 1 步中的密钥（使用你自己 .env 中的值）
g key import --yes -n typetype-downloader "<DOWNLOADER_S3_ACCESS_KEY>" "<DOWNLOADER_S3_SECRET_KEY>"

# 4. 允许这个密钥使用该存储桶
g bucket allow --read --write --owner --key "<DOWNLOADER_S3_ACCESS_KEY>" typetype-downloads
```

::: tip
在全新安装时，`--version 1` 是正确的。如果以后要重新执行布局这一步，请使用比 `g layout show` 显示的版本大一的数字。
:::

现在可以从界面上使用下载功能了。

浏览器通过 Server 的网关下载。Garage 保持在内部；你不需要公开 3900 端口，也不需要配置面向浏览器的 S3 端点。

## 第三部分 - 使用 Dockge 部署 {#deploy-with-dockge}

::: tip 致谢
本节改编自 [@BuggyPasta](https://github.com/BuggyPasta) 的记录。他在一套真实的 Dockge 安装上从头到尾走通了整个流程，并发表在 [issue #254 的后续回复](https://github.com/TypeType-Video/TypeType/issues/254#issuecomment-5701725080)和[讨论 #277](https://github.com/TypeType-Video/TypeType/discussions/277) 中。谢谢。
:::

[Dockge](https://github.com/louislam/dockge) 是 Docker Compose 的一个网页界面。它可以把 TypeType 的部署和你的其他部署放在一起管理，但不能代替 TypeType 的一次性初始化。请保留官方的服务名称和文件，这样内部地址和 Garage 命令才能继续与受支持的部署保持一致。

### 1. 准备部署目录 {#1-prepare-the-stack-directory}

使用被挂载为 Dockge 部署目录的那个主机目录。下面的例子在 `$HOME/dockge-stacks` 下创建一个名为 `typetype` 的部署；如果你的 Dockge 安装使用其他路径，请换成那个路径。

```sh
mkdir -p "$HOME/dockge-stacks"
git clone --depth 1 https://github.com/TypeType-Video/TypeType.git \
  "$HOME/dockge-stacks/typetype"
cd "$HOME/dockge-stacks/typetype"
cp .env.example .env
mkdir -p .typetype-migration
```

在部署之前生成 Garage 密钥。把这个值保存在 `.env` 中；绝不要把它贴到公开的 issue 或 Dockge 的截图里。

```sh
GARAGE_RPC_SECRET=$(openssl rand -hex 32)
sed -i "s/^GARAGE_RPC_SECRET=.*/GARAGE_RPC_SECRET=$GARAGE_RPC_SECRET/" .env
```

刷新 Dockge 并选择 `typetype` 部署。在 Dockge 中或在部署目录里编辑 `.env`，把 `ALLOWED_ORIGINS` 设为用户实际打开的那个确切的源。不要把社区里旧的 Compose 示例覆盖到当前文件上；受支持的 Compose 文件已经包含目前的 `typetype-init` 流程。

### 2. 运行一次性的初始化 {#2-run-the-one-time-bootstrap}

在启动应用的各个服务之前，在部署目录中运行一次：

```sh
./scripts/run-stack-init.sh
```

这条命令带 `--rm` 运行 `typetype-init`。它生成 YouTube 会话密钥、创建 Garage 的配置，并创建 Downloader 的数据库。更新部署时可以放心地再次运行它；已有的密钥和 Garage 配置都会保留。

### 3. 在 Dockge 中启动并管理部署 {#3-start-and-manage-the-stack-in-dockge}

初始化成功结束后，使用 Dockge 的 **Deploy** 或 **Start** 操作。主机上等效的命令是：

```sh
docker compose up -d --remove-orphans --wait --wait-timeout 180
```

在 Dockge 中或用 `docker compose ps` 检查部署。初始化容器在成功后会被删除，所以它不需要一直运行。停止或更新部署时，请保留 PostgreSQL、Garage 和密钥的卷；正常更新时绝不要使用 `docker compose down -v`。

### 4. 更新部署而不丢失任何东西 {#4-update-the-stack-without-losing-anything}

使用 Dockge 的 **Update** 操作，它会拉取新镜像并重启容器；然后运行 **System Prune**，回收旧镜像层占用的磁盘空间。

::: warning 绝不要在部署停止时执行 prune
Garage 的布局和存储桶的登记信息保存在[第二部分](#part-2-object-storage-for-downloads)所说的那些命名卷中，prune 不会删除它们。但如果你确实在部署停止时执行了 prune，稳妥的恢复办法就是重新执行第二部分中配置 Garage 的步骤：只需几秒钟，而且不会动到你的账号、历史记录或设置。
:::

::: tip Garage 的节点 ID 不是固定的
如果你曾经把 Garage 的元数据卷整个清空（这不属于正常更新），它的节点 ID 会改变，你必须用新生成的 ID 重新执行[第二部分](#part-2-object-storage-for-downloads)中的布局分配，而不是使用之前某次运行得到的 ID。
:::


## 自定义 nginx 或 Garage 配置 {#custom-nginx-or-garage-configuration}

受支持的默认设置不需要主机上的配置文件。如果要自定义这两个服务中的任何一个，请把自定义文件放在部署受管文件之外，并用 `docker-compose.override.yml` 挂载：

```yaml
services:
  typetype:
    volumes:
      - ./config/nginx.conf:/etc/nginx/conf.d/default.conf:ro
  garage:
    volumes:
      - ./config/garage.toml:/etc/garage/garage.toml:ro
```

只有在默认拓扑不适合你的部署时，才创建 `config/nginx.conf` 或 `config/garage.toml`。Compose 会自动加载覆盖文件。启动之前先校验最终的挂载：

```sh
docker compose config -q
docker compose config
```

安装脚本会保留 `docker-compose.override.yml` 以及不属于受管部署的文件。备份时请把这些文件和 `.env` 一起保存。

## 日常命令 {#everyday-commands}

```sh
docker compose pull && docker compose up -d   # 更新到最新版本
docker compose logs -f typetype-server        # 跟踪服务器日志
docker compose down                           # 停止（数据会保留）
```
