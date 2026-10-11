# 嵌入式播放器

TypeType 提供了一条专门的播放器路由，用于嵌入 YouTube 视频而不带观看页面的其他部分。

## URL 格式 {#url-format}

在 `/embed/` 后面写上 YouTube 的视频标识符：

```text
https://your-instance.example/embed/VIDEO_ID
```

标识符是普通 YouTube 观看链接中 `v=` 后面的 11 个字符。例如，`https://www.youtube.com/watch?v=dQw4w9WgXcQ` 对应 `/embed/dQw4w9WgXcQ`。

## 起始位置与自动播放 {#start-position-and-autoplay}

| 参数 | 值 | 行为 |
| --- | --- | --- |
| `t` | 秒数或一段时长 | 起始位置 |
| `start` | 秒数或一段时长 | `t` 的别名 |
| `time_continue` | 秒数或一段时长 | 与 Invidious 兼容的 `t` 的别名 |
| `autoplay` | `1` | 请求自动播放 |

时长可以组合小时、分钟和秒，例如 `1h30m15s`。当同时存在多个起始参数时，TypeType 依次使用 `t`、`start`、`time_continue`。无效或为负的值会从头开始。

```text
/embed/dQw4w9WgXcQ?t=90
/embed/dQw4w9WgXcQ?start=1m30s
/embed/dQw4w9WgXcQ?time_continue=45&autoplay=1
```

自动播放仍然受浏览器媒体策略的约束。浏览器可能要求用户先进行一次操作才开始播放声音。

## 添加 iframe {#add-an-iframe}

```html
<iframe
  src="https://your-instance.example/embed/dQw4w9WgXcQ?autoplay=1"
  title="TypeType video player"
  allow="autoplay; fullscreen; picture-in-picture"
  allowfullscreen
  loading="lazy"
></iframe>
```

请在外层页面中给 iframe 一个明确的、自适应的尺寸。例如：

```css
.video-embed {
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 0;
}
```

使用这个示例时，给 iframe 加上 `class="video-embed"`。

### 要验证 iframe，而不只是 URL {#verify-the-iframe-not-only-the-url}

直接打开 `/embed/...` 并看到 `200` 响应，只能证明该路由和播放器作为顶层页面可以工作，并不能证明其他网站可以把它放进框架。请在另一个源上的 iframe 中测试最终的 URL。

添加了 `X-Frame-Options: DENY` 的反向代理或 CDN 会阻止嵌入，即使直接打开页面和所有媒体请求都正常。限制性的内容安全策略 `frame-ancestors` 指令也会造成同样的结果。在普通的 TypeType 页面上保留防嵌入保护，但不要在 `/embed/*` 上发送 `X-Frame-Options: DENY`。如果需要限制哪些网站可以嵌入，请在该路由上使用 CSP 的 `frame-ancestors`。

## 账号、设置与访客访问 {#accounts-settings-and-guest-access}

在浏览器标签页中直接打开嵌入链接，可以沿用当前的 TypeType 账号和播放器设置。在 iframe 内，播放是匿名的，不会读取嵌入方网站的 TypeType 会话或设置。

因此，实例必须允许访客访问，iframe 才能播放。管理员可以在 TypeType 的管理设置中开启 **访客模式**。访客访问被关闭时，嵌入页面会显示专门的提示和一个指向普通观看页面的链接，而不会尝试播放。

嵌入页面还会显示与观看页面相同的不可用、已预定和仅限会员等状态。对于临时的加载失败，在可以安全重试的情况下会提供重试操作。
