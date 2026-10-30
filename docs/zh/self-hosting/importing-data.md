# 导入你的数据

实例运行起来、账号也创建好之后，你可以把以前所用应用中的订阅、播放列表、历史记录等内容迁移进来，之后也可以再导出到其他应用。打开侧边栏中的**数据传输**；新账号注册后会直接来到这里。

## 支持的应用 {#supported-apps}

| 应用或格式 | 文件 | 导入 | 导出 |
| --- | --- | --- | --- |
| TypeType | `.json` | 全部 | 全部 |
| PipePipe | `.zip` | 支持 | 不支持 |
| NewPipe | `.zip` | 支持 | 支持 |
| Invidious | `.json` | 支持 | 支持 |
| Piped | `.json` | 支持 | 支持 |
| LibreTube | `.json` | 支持 | 支持 |
| ViewTube | `.zip` | 支持 | 不支持 |
| Flow | `.json` | 支持 | 支持 |
| Grayjay | `.zip` | 支持 | 支持 |
| YouTube Takeout | `.zip` | 支持 | 不支持 |
| OPML | `.opml` | 订阅 | 订阅 |
| Materialious | `.json` | 订阅 | 订阅 |
| SkyTube | `.opml` | 订阅 | 订阅 |
| youtube-local | `.opml` | 订阅 | 订阅 |

能迁移哪些内容取决于各个应用保存了什么：订阅、订阅分组、观看历史、播放列表、稍后再看、收藏、播放进度、搜索历史、已保存的播放列表、设置或内容过滤规则。TypeType 备份包含全部内容。如果某个格式只保存了某一类别的部分内容，预览和最终报告都会注明。

![“导入来源”菜单，列出所有支持的来源](/screenshot-import-sources.png)

## 导入 {#import}

1. 从你现在使用的应用中导出备份，并保持文件原样：不要解压，也不要修改。
2. 在**数据传输**中停留在**导入**，把**导入来源**保持为**自动检测**，或者自己选择应用。
3. 拖入文件或选择文件。大小上限为 512 MB。
4. TypeType 会分析文件并显示预览：检测到的来源、每个类别找到的条目数、重复项以及兼容性说明。在这一步之前不会写入任何数据。
5. 随后，导入会针对检测到的全部内容自动开始。你已有的条目会被跳过。你可以离开页面，导入会继续进行。

完成后，会有一份报告列出导入和跳过的内容，你可以下载它。

## 从 YouTube 导入（Google Takeout） {#from-youtube-google-takeout}

Takeout 可以导入你的**订阅、观看历史、播放列表、稍后再看以及点赞的视频**（作为收藏）。

1. 在**导入来源**中选择 **YouTube Takeout**，然后选择 **Open Google Takeout**：这个链接会预先选好 YouTube 和“我的活动”。如果想导入观看历史，请保留“我的活动”。
2. 创建一次性的 ZIP 导出，并从 Google 下载。
3. 拖入原始 ZIP。如果 Google 把导出拆成了多个 ZIP，请逐个导入。

导入会去除重复的订阅、播放列表和视频，在匹配时复用已有的播放列表，并把 YouTube 的系统播放列表对应到 TypeType 的**收藏**和**稍后再看**，而不是普通播放列表。当系统播放列表缺失或不完整时，“赞”的活动记录也可以补全收藏，并保留原始时间和顺序。元数据不完整的条目会在后台补全，因此播放列表可以立即打开。

如果导入提示没有找到账号数据，说明你拖入的是只包含视频的导出部分：请选择包含历史记录、订阅或播放列表的 ZIP。如果提示压缩包超出限制或已加密，请重新以更小的 ZIP 分卷导出 YouTube 数据。

## 导出 {#export}

在**导出**标签中，选择**目标格式**和要包含的类别，然后点击 **Generate export** 并下载文件。如果目标格式无法保存 TypeType 的全部字段，会显示警告，报告也会列出无法保留的内容。TypeType 导出会保留全部内容，迁移到另一个 TypeType 实例时请使用它。

**设置 > 数据**也可以直接创建和恢复 TypeType 备份。在那里恢复会替换备份中包含的类别。

## 参考链接 {#source-references}

- [支持的格式](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-portability/src/main/kotlin/dev/typetype/server/portability/PortabilityFormat.kt)
- [已注册的导入器和导出器](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-portability/src/main/kotlin/dev/typetype/server/portability/PortabilityEngineFactory.kt)
- [Takeout 解析与去重](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/services/YoutubeTakeoutParserService.kt)
- [后台元数据修复](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/services/UserVideoMetadataRepairService.kt)
