# 导入你的数据

实例运行起来、账号创建好之后，你可以把已有的订阅、播放列表和历史记录带进来。TypeType 支持从两种来源导入：**Google Takeout** 导出文件，或 **PipePipe** 备份。

注册之后的引导界面上就有这个功能，之后也可以随时在侧边栏的 **导入** 中找到。

![导入界面](/screenshot-onboarding.png)

## 从 YouTube 导入（Google Takeout） {#from-youtube-google-takeout}

这会带入你的**订阅、播放列表、收藏和观看历史**（历史和收藏只有在导出文件包含相应的“我的活动”记录时才会导入）。

1. 申请导出 **YouTube 和 YouTube Music** 的 Google Takeout；如果想要观看历史，还要加上**我的活动**。应用提供了一个一键链接，会替你预先选好需要的产品。
2. 等 Google 准备好之后，下载 ZIP 文件。较大的导出会被拆成多个 ZIP，这是正常的。
3. 在导入界面选择 **Import from YouTube**，然后拖入**一个或多个 Takeout ZIP 文件**（可以一次选择多个）。
4. 开始导入，然后检查你的订阅和播放列表。

::: warning 导入进度停在零
如果预览成功，但导入一直停在 `00` 个类别、没有任何进展，请在取消之前记下任务标识符和预览中的数量。这个问题在 [issue #276](https://github.com/TypeType-Video/TypeType/issues/276) 中跟踪；它与 Takeout 文件识别失败是两回事。报告时不要附上压缩包或任何账号数据。
:::

::: tip
不需要解压任何东西：把 Google 给你的 Takeout ZIP 原样上传即可。
:::

选择多个压缩包时，Frontend 会逐个处理并提交。每次导入都会去掉重复的订阅、播放列表和视频链接；当播放列表的来源对应关系或名称已经匹配时，会复用已有的播放列表；并把已存在的条目报告为已跳过。因此，后面的压缩包会跳过前面已经提交的数据。YouTube 的系统播放列表会对应到 TypeType 的**收藏**和**稍后再看**，而不是作为重复的普通播放列表出现。

当系统播放列表缺失或不完整时，“赞过的视频”的活动记录也可以用来恢复收藏。导入程序会保留活动原本的时间，能识别 Takeout 的英文和法文日期格式，并忽略已删除、私享或不可用的赞过视频记录。这样可以保留原来的顺序，而不是按相反的顺序赋予导入时的时间戳。

较旧或不可用的 Takeout 行可能只包含备用的元数据。播放列表会立即打开，Server 在后台安排元数据修复，而不是在解析每一项的过程中阻塞整个响应。

这些细节是在 [lelam183 报告导入的播放列表缓慢、顺序颠倒且有重复](https://github.com/TypeType-Video/TypeType/issues/135)之后复查的。

## 从 PipePipe 导入 {#from-pipepipe}

从 PipePipe 应用过来？直接从它的备份恢复。

1. 从 PipePipe 导出一份备份（一个 `.zip` 文件）。
2. 在导入界面选择 **Import from PipePipe**，然后拖入备份 ZIP。
3. 这会恢复你的**历史记录、订阅、播放列表和观看进度**。

## 导入之后 {#after-importing}

导入完成后，它会显示一份简短的报告，说明带入了什么、跳过了什么，让你清楚地知道发生了什么。你的订阅和播放列表立即可用。

## 参考链接 {#source-references}

- [Takeout 解析与去重](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/YoutubeTakeoutParserService.kt)
- [Takeout 的提交行为](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/YoutubeTakeoutImporterService.kt)
- [后台元数据修复](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/UserVideoMetadataRepairService.kt)
