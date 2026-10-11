# Discord Rich Presence

把你在 TypeType 上正在看的内容显示为你的 Discord 状态：标题、频道，以及一个回到该视频的链接。它借助一个小型桌面伴侣程序 [TypeType RPC](https://github.com/TypeType-Video/TypeType-RPC)，通过本地连接与 Discord 通信，和 Spotify 或游戏使用的机制相同。

## 需要什么 {#what-it-needs}

- 一个 TypeType 账号。访客无法创建状态密钥。
- [Discord 桌面版](https://discord.com/download)，或者像 [Vesktop](https://vesktop.dev/) 这样的兼容客户端，在同一台机器上运行。
- 已安装 [TypeType RPC](https://github.com/TypeType-Video/TypeType-RPC) 应用。

## 创建状态密钥 {#create-a-presence-key}

1. 打开 **设置**，然后打开 **API**。
2. 在 **状态访问权限** 下给密钥起个名字，方便以后辨认，然后点 **创建密钥**。
3. 复制密钥。它以 `ttp1_` 开头，而且你只能在这一次看到它：TypeType 只保存它的哈希值。

![创建状态密钥](/screenshot-presence-key-created.png)

你最多可以同时拥有 10 个有效密钥。可以随时在同一个界面撤销其中任何一个，与你的登录会话互不影响。

## 连接 TypeType RPC {#connect-typetype-rpc}

1. 安装并打开 [TypeType RPC](https://github.com/TypeType-Video/TypeType-RPC)。
2. 点击托盘图标，然后点 **Settings…**。
3. 输入你的实例地址和刚刚创建的密钥，然后点 **Save**。
4. 开启 **Share on Discord**。

![TypeType RPC 的设置窗口](/screenshot-rpc-settings.png)

下次打开应用时会自动恢复分享，所以只需要设置一次。

## 它能看到什么 {#what-it-can-see}

密钥的权限范围是 `presence:read`，只读且范围很窄：正在播放的内容、标题、频道和播放位置，仅此而已。它看不到你的历史记录、订阅、账号信息或会话，而且只有在它自己的开关打开时，TypeType RPC 才会进行查询。

## 故障排查 {#troubleshooting}

- **Discord 里什么都不显示**：Rich Presence 的按钮和活动卡片在你*自己*的个人资料上是看不到的，这是 Discord 的限制，不是故障。请朋友帮忙看一下，或者用第二个账号查看你的个人资料。
- **应用无法连接**：TypeType RPC 通过本地连接与 Discord 通信，所以需要先在同一台机器上运行 Discord（或 Vesktop）。
