# 身份验证（OIDC）

默认情况下，TypeType 使用本地账号（邮箱和密码）。你也可以接入一个 **OpenID Connect** 提供方，例如 Authentik、Keycloak、Authelia 或 Pocket ID，让用户通过单点登录来登录。

这是实例层面的配置。用户一侧的说明见[登录](/zh/guide/accounts#single-sign-on-oidc)。

## 接入提供方 {#connect-a-provider}

只要在 **API 服务器**（`typetype-server`）上设置了签发方、客户端 ID 和客户端密钥，OIDC 就会启用。稳定版的基础 Compose 文件不会把 `.env` 中的 OIDC 变量传递进去，所以请在它旁边添加一个 `docker-compose.override.yml`：

```yaml
services:
  typetype-server:
    environment:
      OIDC_ISSUER: ${OIDC_ISSUER}
      OIDC_CLIENT_ID: ${OIDC_CLIENT_ID}
      OIDC_CLIENT_SECRET: ${OIDC_CLIENT_SECRET}
      OIDC_PROVIDER_NAME: ${OIDC_PROVIDER_NAME:-OIDC}
      OIDC_SCOPES: ${OIDC_SCOPES:-openid email profile}
```

然后把这些值加入 `.env`：

```dotenv
OIDC_ISSUER=https://identity.example.com
OIDC_CLIENT_ID=replace-with-client-id
OIDC_CLIENT_SECRET=replace-with-client-secret
OIDC_PROVIDER_NAME="Company login"
```

Server 支持以下变量：

| 变量 | 是否必需 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `OIDC_ISSUER` | 是 | - | 你的提供方的签发方地址（例如 `https://id.example.com`）。`OIDC_ISSUER_URL` 也可以使用。 |
| `OIDC_CLIENT_ID` | 是 | - | 提供方给出的客户端 ID |
| `OIDC_CLIENT_SECRET` | 是 | - | 提供方给出的客户端密钥 |
| `OIDC_DISCOVERY_URL` | 否 | `<issuer>/.well-known/openid-configuration` | 只有当发现文档位于别处时才需要修改 |
| `OIDC_SCOPES` | 否 | `openid email profile` | 请求的范围 |
| `OIDC_PROVIDER_NAME` | 否 | `OIDC` | 登录按钮上显示的名称 |

设置好之后，登录页面上会出现一个带有 `OIDC_PROVIDER_NAME` 名称的登录按钮。用 `docker compose up -d --force-recreate typetype-server` 应用这个覆盖文件。

## 重定向 URI {#redirect-uri}

在你的提供方那里登记以下回调地址：

```text
https://<your-domain>/auth/oidc/callback
dev.typetype.android://oidc/callback
```

请使用你真实的域名（本地测试时可以用 `http://localhost:8082/auth/oidc/callback`）。

回调属于 Frontend 的路由，而不是 `/api`，并且必须与提供方的配置完全一致。

## 经过测试的提供方示例 {#tested-provider-examples}

社区成员 [arcoast](https://github.com/arcoast) 测试了 Authelia 和 Pocket ID，并在[讨论 #128](https://github.com/TypeType-Video/TypeType/discussions/128) 中发布了可用的提供方一侧的设置。

### Pocket ID {#pocket-id}

创建一个保密型客户端，设置如下：

| Pocket ID 的设置项 | 值 |
| --- | --- |
| Callback URL | `https://watch.example.com/auth/oidc/callback` `dev.typetype.android://oidc/callback` |
| Client launch URL | `https://watch.example.com/` |
| Public client | 关闭 |
| Requires re-authentication | 关闭 |
| PKCE | 关闭 |
| Logout callback | 留空 |

把 Pocket ID 生成的客户端 ID 和密钥填入上面的 TypeType 变量，并把 Pocket ID 的基础地址用作 `OIDC_ISSUER`。

### Authelia {#authelia}

创建一个保密型的 Authelia 客户端，使用同样的回调地址，范围为 `openid`、`profile` 和 `email`，令牌端点的认证方式为 `client_secret_post`。把随机生成的客户端密钥的值填入 TypeType 的 `OIDC_CLIENT_SECRET`；并按照 Authelia 当前的 OIDC 文档，把它的哈希值配置为 Authelia 的客户端密钥。

提供方的配置格式可能会变化。请把讨论 #128 当作经过 TypeType 测试的参考，具体的配置结构则以提供方当前的文档为准。

## 会话有效期 {#session-lifetime}

本地登录或 OIDC 登录之后，访问令牌有效一小时。浏览器还会收到一个会轮换的刷新 Cookie，所以访问令牌正常过期时应该是无感的。刷新会话默认有效 30 天。在 `.env` 中设置 `AUTH_SESSION_TTL_DAYS`，可以选择 1 到 365 天之间的值：

```dotenv
AUTH_SESSION_TTL_DAYS=90
```

这个时长适用于新签发和续期的会话。数据库中已有的记录会保持当前的过期时间，直到下一次成功的刷新或登录。

刷新 Cookie 带有 `HttpOnly`、`Secure` 和 `SameSite=None`。因此，公开部署需要 HTTPS、正确的 `ALLOWED_ORIGINS`，以及不会破坏带凭据请求的代理配置。如果用户在使用过程中被登出，见[意外登出](./troubleshooting#unexpected-sign-outs)。

对于无法使用 HTTPS 的可信本地网络，可以用一个明确的兼容选项，让刷新 Cookie 不带 `Secure` 并使用 `SameSite=Lax`：

```dotenv
AUTH_ALLOW_INSECURE_COOKIES=true
```

::: danger
不要在公开或不可信的网络上启用这个选项。账号的刷新 Cookie 可能会通过未加密的 HTTP 传输。HTTPS 仍然是受支持的默认方式。
:::

修改其中任何一个变量之后，请重新创建 Server：

```sh
docker compose up -d --force-recreate typetype-server
```

这段说明源自 [Toni-Vide 在讨论 #162](https://github.com/TypeType-Video/TypeType/discussions/162) 中提出疑问的行为，并已对照当前的身份验证源码核实。

## 管理员选项 {#admin-options}

有两个相关的选项位于 **控制台** 区域，而不在环境变量中：

- **停用本地登录**：让单点登录成为唯一的登录方式，这样就没有人能使用邮箱和密码登录。
- **自动跳转到提供方**：完全跳过登录页面，把用户直接送到你的提供方。

::: warning
在停用本地登录之前，先用 OIDC 登录一次并确认它可以正常工作。否则你可能会把自己锁在实例之外。
:::
