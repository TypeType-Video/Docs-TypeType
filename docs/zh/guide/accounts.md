# 登录

你的订阅、播放列表、历史记录和设置都与你在实例上的账号绑定。

## 本地账号 {#local-account}

用名称、邮箱和密码创建账号，然后登录。在全新的实例上，**第一个账号会成为管理员**（见[快速开始](/zh/self-hosting/quick-start#create-the-admin-account)）。如果忘记了密码，请在登录页面使用重置流程。

![登录页面](/screenshot-login.png)

浏览器会自动刷新账号会话。短期的访问令牌在一小时后过期，而刷新会话可持续 30 天。如果你在正常使用网站时被登出，这不是普通的闲置超时；请让实例的运营者查看[意外登出](/zh/self-hosting/troubleshooting#unexpected-sign-outs)。

## 单点登录（OIDC） {#single-sign-on-oidc}

如果你的实例配置了单点登录，登录页面会显示一个用你的身份提供方（Google、Authentik、Keycloak 等）登录的按钮。点一下即可登录，不需要另外管理密码。

取决于管理员的设置：

- 页面可能会**直接跳转到你的身份提供方**（完全没有登录界面），
- 并且**本地账号可能被关闭**，此时单点登录是唯一的登录方式。

这项配置由管理员完成，见[身份验证（OIDC）](/zh/self-hosting/authentication)。

## 你的个人资料 {#your-profile}

在个人资料中管理你的账号信息。管理员还有一个 **控制台** 区域，用来查看错误报告和管理实例。
