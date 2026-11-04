# 候选版本

候选版本（rc）是 TypeType 下一个版本在正式发布之前的版本。它使用的就是将要发布的镜像，所以你可以提前试用新版本，在所有人更新之前报告出现的问题。官方实例同样运行候选版本。

| 选择 | 镜像 | 何时变化 | 适合 |
| --- | --- | --- | --- |
| **最新正式版** | `:latest`、`:1.16.0` | 只在发布当天 | 日常使用 |
| **候选版本** | `:rc`、`:1.16.0-rc.1` | 某个组件为下一个版本准备好时 | 提前试用下一个版本 |
| **固定版本** | `:1.15.0` | 永不变化，直到你选择另一个版本 | 有意停留在某个版本 |
| **Beta** | `-beta:latest` | 每次推送到 `dev` | 开发用途，可能出问题 |

候选版本只包含为下一个版本准备好的内容，所以比 beta 更稳定。但它仍然可能有问题：切换之前请先备份数据库，见[备份](./maintenance#backups)。候选版本是怎样产生的，见[分支与版本](/zh/project/releases#how-a-release-is-made)。

## 选择你的版本 {#choose-your-version}

照常运行安装脚本。它会询问你想要哪个版本：

```text
[install] Which TypeType version do you want?
[install]   1) The latest release, recommended for everyday use
[install]   2) The release candidates, the next version before its release
[install]   3) One version that never changes until you pick another one
Choose 1, 2 or 3 [1]:
```

选择 `2` 即可使用候选版本。安装脚本会在 `.env` 中写入 `TYPETYPE_VERSION=rc`，让四个 TypeType 镜像都使用 `:rc` 标签，并从 `staging` 分支获取与候选版本配套的部署文件。以后想切换时再运行一次即可，它会默认选中你当前的选择。你的 `.env`、端口和数据卷都保持不变。

::: tip TypeType 1.16.0 之前
只有 `staging` 上的安装脚本会提出这个问题。目前请使用：

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/staging/scripts/install-stack.sh | bash
```
:::

`.env` 中的 `TYPETYPE_*_IMAGE` 值对它自己的镜像仍然优先。删除这些行或把它们留空，所有镜像才会跟随你的选择。

## 不提问的安装 {#without-questions}

在脚本或自动化部署中，用一个选项来选择，并加上 `--yes`：

| 选项 | 作用 |
| --- | --- |
| `--rc` | 跟随候选版本 |
| `--latest` | 重新跟随最新正式版 |
| `--version 1.15.0` | 停留在一个版本 |

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/staging/scripts/install-stack.sh | bash -s -- --rc --yes --dir "$STACK_DIR"
```

`$STACK_DIR` 是你的部署目录，除非你选择了其他目录，否则是 `~/typetype-stack`。这些选项不能与 `--beta` 一起使用。

## 更新 {#update}

重新运行安装脚本。跟随候选版本的部署在重新运行安装脚本时会继续使用 `staging` 的部署文件，即使加了 `--yes` 也一样。不使用安装脚本时，拉取并重新创建部署：

```sh
cd "$STACK_DIR"
docker compose pull
docker compose up -d --wait --wait-timeout 180
```

新的候选版本会替换 `:rc` 镜像，所以每次更新都会得到最新的候选版本。

## 检查正在运行的版本 {#check-what-you-run}

```sh
curl -fsS http://localhost:8082/api/version/server
```

`version` 字段会显示候选版本，例如 `1.16.0-rc.1`。`web`、`token` 和 `downloader` 也有同样的接口。

## 回到最新正式版 {#go-back-to-the-latest-release}

运行安装脚本并选择 `1`，或者传入 `--latest`。候选版本可能会修改数据库，所以回到更早的版本时可能需要用到切换前做的备份，见[回滚一次更新](./rollback)。

正式发布之后，最新正式版与最后一个候选版本的代码相同，所以你可以继续停留在候选版本上，测试再下一个版本。

## 报告问题 {#report-a-problem}

提交一个 [issue](https://github.com/TypeType-Video/TypeType/issues)，附上 `/api/version` 返回的版本号，并说明你在使用候选版本。见[报告问题](./reporting-issues)。
