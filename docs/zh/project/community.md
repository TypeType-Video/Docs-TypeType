# 社区来源与致谢

文档会对照源码进行核实，但仅凭源码看不出每一种部署失败，也说明不了哪个细节会让运营者感到困惑。社区的报告补上了这部分缺失的依据。本页记录了那些直接影响了当前文档的人和讨论。

## 文档中提到的贡献者 {#contributors-referenced-in-the-documentation}

| 贡献者 | 报告或讨论 | 改进的文档内容 |
| --- | --- | --- |
| [arcoast](https://github.com/arcoast) | [YouTube 远程登录，讨论 #122](https://github.com/TypeType-Video/TypeType/discussions/122) | 代理对 WebSocket 的要求，以及过时 nginx 文件的诊断 |
| [arcoast](https://github.com/arcoast) | [数据库变量的命名，讨论 #123](https://github.com/TypeType-Video/TypeType/discussions/123) | 把 PostgreSQL 变量作为部署层面唯一的权威来源 |
| [arcoast](https://github.com/arcoast) | [Authelia 与 Pocket ID 的 OIDC 指南，讨论 #128](https://github.com/TypeType-Video/TypeType/discussions/128) | 经过测试的提供方示例和回调设置 |
| [arcoast](https://github.com/arcoast) | [Garage RPC 密钥，讨论 #130](https://github.com/TypeType-Video/TypeType/discussions/130) | 手动安装时生成随机的 `GARAGE_RPC_SECRET` |
| [filippobaroni](https://github.com/filippobaroni) | [旧版播放与部署迁移，讨论 #133](https://github.com/TypeType-Video/TypeType/discussions/133#discussioncomment-17779201) | 识别并迁移仍在使用旧镜像命名空间的 Compose 文件 |
| [hugoghx](https://github.com/hugoghx) | [Token 容器的运行环境，讨论 #156](https://github.com/TypeType-Video/TypeType/discussions/156) | Token 服务的命名、内部网络边界以及目前加固方面的限制 |
| [hulmgulm](https://github.com/hulmgulm) | [首个管理员的设置，讨论 #151](https://github.com/TypeType-Video/TypeType/discussions/151) | 初始化状态，以及按确切的源排查 CORS 问题 |
| [Toni-Vide](https://github.com/Toni-Vide) | [意外登出，讨论 #162](https://github.com/TypeType-Video/TypeType/discussions/162) | 访问令牌、刷新 Cookie 和会话方面的故障排查 |
| [nanhoes](https://github.com/nanhoes) | [iOS 上的下载流程，issue #116](https://github.com/TypeType-Video/TypeType/issues/116) | 身份验证的传递以及文件路径的复查 |
| [lelam183](https://github.com/lelam183) | [导入的播放列表的行为，issue #135](https://github.com/TypeType-Video/TypeType/issues/135) | 导入时的去重、系统播放列表的对应关系以及后台元数据修复 |
| [BuggyPasta](https://github.com/BuggyPasta) | [使用 Dockge 部署的说明，讨论 #277](https://github.com/TypeType-Video/TypeType/discussions/277) | Dockge 中的部署布局、一次性初始化，以及运营者对手动安装的反馈 |
| [hugoghx](https://github.com/hugoghx) | [直播的播放，issue #145](https://github.com/TypeType-Video/TypeType/issues/145) | 直播播放与滑动窗口的复查 |
| [Priveetee](https://github.com/Priveetee) | [直播中的画质切换，issue #163](https://github.com/TypeType-Video/TypeType/issues/163) | 播放指南中关于直播会话和画质切换的概念 |

感谢以上各位公开了可复现的症状、配置的背景以及后续的结果。他们的报告让受支持的流程变得更清楚，以后遇到同样问题的人会因此受益。

## 项目的支持者 {#project-supporters}

### 长期赞助者 {#recurring-sponsor}

感谢 [@Toastienergy](https://github.com/Toastienergy) 通过 GitHub Sponsors 的定期赞助支持 TypeType。这帮助我负担基础设施的开销，并能花更多时间改进这个项目。

### 一次性捐助者 {#one-time-donor}

我也感谢 [@filippobaroni](https://github.com/filippobaroni) 通过 GitHub Sponsors 进行的一次性捐助，它为 TypeType 提供了支持。

如果你想在资金上支持 TypeType，可以通过 [GitHub Sponsors](https://github.com/sponsors/Priveetee) 进行。

## 如何使用来自社区的材料 {#how-community-material-is-used}

讨论或 issue 的内容不会被直接照搬进手册。在成为文档之前：

1. 先检查当前负责的仓库，确认该行为仍然存在。
2. 对照中心的 Compose 和 nginx 文件，确认受支持的部署方式。
3. 去掉敏感的值和特定实例才有的细节。
4. 把结果写成可以复用的说明或诊断方法。
5. 在用到这项见解的地方，链接到最初的贡献者和公开的讨论。

这一点很重要，因为实现发生变化之后，旧的变通办法可能反而有害。例如，讨论 #122 中关于 WebSocket 的调查仍然有价值，但受支持的修复方式是使用当前自带的 nginx 配置，而不是照搬报告者的整套自定义部署。

## Issue 与讨论 {#issues-and-discussions}

所有面向用户的报告都集中在 TypeType 仓库中：

- [问题跟踪器](https://github.com/TypeType-Video/TypeType/issues)，用于错误、功能和文档中的缺漏。
- [讨论区](https://github.com/TypeType-Video/TypeType/discussions)，用于运营者的提问、部署中的发现、想法和配置示例。

报告问题时，请附上相关的 `/api/version/*` 响应，并删掉令牌、Cookie、密码、内部主机名和私有实例的地址。完整的检查清单见[报告问题](/zh/self-hosting/reporting-issues)。
