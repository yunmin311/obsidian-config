# 插件设置说明 + 来源链接

安装方式两种：**市场** = Obsidian 内置社区插件市场直接搜；**BRAT** = 通过 obsidian42-brat 添加 GitHub 仓库安装。

第三方插件只备份 `data.json`（设置），不含本体；**自研插件整体入库**，见文末「自研插件」一节。

## 已启用插件（23 个）

| 插件 | 用途 | 来源 | 安装方式 |
|---|---|---|---|
| [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) | 主题可视化调参（色系微调入口） | mgmeyers | 市场 |
| [Editing Toolbar](https://github.com/cumany/obsidian-editing-toolbar) | 编辑工具条 + 自定义 AI（GLM） | cumany | 市场 |
| [Calendar](https://github.com/liamcain/obsidian-calendar-plugin) | 日历面板 | Liam Cain | 市场 |
| [Templater](https://github.com/SilentVoid13/Templater) | 模板引擎 | SilentVoid | 市场 |
| [Dataview](https://github.com/blacksmithgu/obsidian-dataview) | 笔记查询/索引 | blacksmithgu | 市场 |
| [Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) | 任务管理 | obsidian-tasks-group | 市场 |
| [Day Planner](https://github.com/ivan-lednev/obsidian-day-planner) | 日程规划 | ivan-lednev | 市场 |
| [Git](https://github.com/Vinzent03/obsidian-git) | 配置自动备份到 GitHub | Vinzent03 | 市场 |
| [BRAT](https://github.com/TfTHacker/obsidian42-brat) | 安装未上架的 beta 插件 | TfTHacker | 市场 |
| [Omnisearch](https://github.com/scambier/obsidian-omnisearch) | 全文搜索 | scambier | 市场 |
| [Buttons](https://github.com/shabegom/buttons) | 笔记内按钮 | shabegom | 市场 |
| [Update Tracker](https://github.com/swar8080/obsidian-plugin-update-tracker) | 插件更新提醒 | swar8080 | 市场 |
| [Flexplorer](https://github.com/kh4f/flexplorer) | 灵活文件浏览器 | kh4f | 市场 |
| [Immersive Folder](https://github.com/iBlinkQ/immersive-folder) | 单文件夹沉浸视图 | iBlinkQ | 市场 |
| Widgets | 桌面小组件 | [Rafael Veiga](https://rafaelveiga.github.io/) | 市场 |
| Claudian | AI 助手（GLM 4.6V） | [Yishen Tu](https://github.com/YishenTu) | 市场/手动 |
| **Toolbar Pin Toggle** | 自研，见文末 | — | 本地 |
| **Reading Rail Sidebar** | 自研，见文末 | — | 本地 |

### crisp 系列（作者小红书博主 letschips，全部经 BRAT 安装）

| 插件 | 用途 | BRAT 仓库 | 状态 |
|---|---|---|---|
| Crisp Base | 系列基础依赖 | `letschips/crisp-base` | 启用 |
| Crisp File Explorer | 文件管理器美化 | `letschips/crisp-file-explorer` | 启用 |
| Crisp Visual | 视觉增强 | `letschips/crisp-visual` | 启用 |
| Crisp Focus | 专注模式 | `letschips/crisp-focus` | 启用 |
| Crisp Reading Rail | 阅读侧栏（进度 + 标题导航） | `letschips/crisp-reading-rail` | 启用 |
| Crisp Recall | 回忆/复习 | `letschips/crisp-recall` | 启用 |
| Crisp DSH | 仪表盘 | `letschips/crisp-dsh` | 启用 |
| Crisp Annotations | 批注 | `letschips/crisp-annotations` | 已装未启用 |
| Crisp ASR | 语音识别 | `letschips/crisp-asr` | 已装未启用 |

## 自研插件（整体入库）

| 插件 | 用途 | 位置 |
|---|---|---|
| **Toolbar Pin Toggle** | 一个快捷键（Alt+Q）两种常驻：底部原生常驻工具条 / 顶部工具条常驻；同时收编 Editing Toolbar 的全部外观与行为修正 | `.obsidian/plugins/toolbar-pin-toggle/` |
| **Reading Rail Sidebar** | 把「阅读进度 + 标题导航」做成右侧栏面板：进度百分比、当前标题跟随、标题树跳转、按文件记忆阅读位置 | `.obsidian/plugins/reading-rail-sidebar/` |

两者都是**纯 JS、无构建依赖**（`main.js` + `styles.css` + `manifest.json`），改完重启 Obsidian 即生效。
样式全部限定在各自前缀（`etb-` / `rrs-`）下，不改动任何主题变量。

> **`.gitignore` 注意**：自研插件白名单必须写在 `.obsidian/plugins/*/main.js` 那组通配排除**之后**。
> gitignore 是后置规则优先，白名单放前面会被后面的排除规则重新盖掉 ——
> 之前 `toolbar-pin-toggle` 就是这样只入库了 `data.json`，本体三件套全漏。

## 关键插件设置（对应 .obsidian/plugins/<id>/data.json）

**Style Settings**（`obsidian-style-settings/data.json`）— 色系微调的唯一入口，改这里而不是改 letschips 的 CSS。深色背景键：`background-underlying-CSS-dark`（当前 `#0A0E1A`）。

**Git**（`obsidian-git/data.json`）— 当前配置：每天自动 commit 一次（`autoSaveInterval: 1440`），每天自动 pull 一次，**自动 push 关闭**（`autoPushInterval: 0`），提交信息模板 `vault backup: {{date}}`。注意：这个插件会备份整个 vault，与「只备份配置」的本仓库是两回事，别把它指向本仓库远端。

**Editing Toolbar**（`editing-toolbar/data.json`）— 含自定义 AI 配置（GLM）。`toolbarBackgroundColor` / `toolbarIconColor` 保持插件的浅色原值，深色模式由 `toolbar-pin-toggle/styles.css` 用 `!important` 接管。

**Reading Rail Sidebar**（`reading-rail-sidebar/data.json`）— 自研。`settings` 三项：`maxLevel`（2/3/4）、`showProgress`、`rememberPosition`；`memory` 按文件路径记录阅读进度与当前标题，滚动停顿约 0.9 秒落盘，上限 300 条。

**Templater**（`templater-obsidian/data.json`）— 模板目录指向 vault 的 `templates/`（该目录随仓库同步）。

**BRAT**（`obsidian42-brat/data.json`）— 上面 crisp 系列的 9 个仓库已登记，新设备恢复时先装 BRAT，再逐一添加。

## 新设备恢复顺序

1. 装市场插件（上表前 15 个）
2. 装 BRAT → 添加 crisp 系列仓库
3. 复制 `.obsidian/plugins/*/data.json` 覆盖对应插件设置
4. 复制两个自研插件目录（`toolbar-pin-toggle/`、`reading-rail-sidebar/`，含本体）到 `.obsidian/plugins/`
5. 复制 `.obsidian/snippets/` + `appearance.json` → 重启
