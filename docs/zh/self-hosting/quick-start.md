# 快速开始

自托管 TypeType 最快、也是**推荐**的方式是使用安装脚本。它会为你搭好整套部署：密钥、空闲端口、各个服务，以及用于下载的对象存储，一条命令就能得到一个完整可用的实例。

::: tip 更想手动来？
脚本所做的一切在[手动安装](./docker-compose)中也有逐步说明，适合想要完全掌控或了解每个部分的人。
:::

## 一条命令 {#one-command}

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash
```

安装脚本会：

- 创建 `~/typetype-stack`，其中包含 Compose 文件和部署脚本，
- 生成下载器、Garage RPC 和 YouTube 会话的密钥，
- 在默认端口被占用时自动选择空闲端口，
- 校验最终的配置并启动所有服务，
- 并初始化 Garage，让**下载功能开箱即用**。

它是交互式的。它先下载并准备部署文件，然后在拉取镜像和启动容器之前请你确认。

更新时，安装脚本会先为它管理的部署文件创建一份带时间戳的备份，并记录当前的镜像引用。随后它等待更新后的服务就绪，并在结束前检查它们的版本端点。

### 选择目录 {#stack-directory}

安装脚本把部署放在 `~/typetype-stack`。这只是它的默认值：传入 `--dir` 就可以安装到你想要的任何位置。

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --dir /srv/typetype
```

本文档中的命令用 `$STACK_DIR` 表示这个目录。请在终端里设置一次，填默认值或者你自己选择的目录：

```sh
STACK_DIR=~/typetype-stack
```

手动安装没有默认值：`$STACK_DIR` 就是包含你的 `docker-compose.yml` 的那个目录。

### 仅下载 {#download-only}

如果想先取得文件并检查，再自己启动 Docker：

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --download-only
```

## 检查它是否已启动 {#check-it-is-up}

```sh
cd "$STACK_DIR"
docker compose ps
docker compose exec -T typetype-server wget -qO- http://127.0.0.1:8080/health
```

第二条命令是从 Server 的容器内部检查它，所以即使安装脚本选了别的主机端口，这条命令依然有效。

## 创建管理员账号 {#create-the-admin-account}

打开网页应用（安装脚本会输出确切的地址，默认是 `http://localhost:8082`）。在全新安装时，它会请你创建一个账号，**第一个账号会自动成为管理员**。

![全新安装时的注册界面](/screenshot-register.png)

输入名称、邮箱和密码，然后点 **注册**。你会以管理员身份登录，并进入引导界面，可以在那里导入你的数据。

![以管理员身份登录](/screenshot-onboarding.png)

完整流程：

![创建管理员账号](/register-admin.gif)

## 接下来 {#next}

- 用 HTTPS 把它放到你自己的域名上：[反向代理与 HTTPS](./reverse-proxy)。
- 调整端口、数据库和密钥：[配置](./configuration)。
- 保持它健康运行：[维护](./maintenance)。
