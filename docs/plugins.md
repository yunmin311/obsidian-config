# 插件设置说明 + 来源链接

安装方式：**市场** = Obsidian 内置社区插件市场直接搜；**BRAT** = 通过 obsidian42-brat 添加 GitHub 仓库安装；**本地** = 自研插件。

备份策略：

| 类型 | 备份内容 |
|---|---|
| 第三方插件 | 只备份 `data.json`（设置），本体按惯例不入库 |
| 自研插件 | **不入本仓库** —— 源码在 `E:\1project\<id>-obsidian\`，各自独立仓库并发布到社区市场。详见 `docs/publishing.md` |
| 含 vault 路径的运行时状态 | **不入库**（见文末「不随仓库备份的配置」） |

## 已启用（21 个）

| 插件 | 版本 | 用途 | 来源 |
|---|---|---|---|
| [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) | 1.0.9 | 主题可视化调参（色系微调唯一入口） | mgmeyers |
| [Editing Toolbar](https://github.com/cumany/obsidian-editing-toolbar) | 4.1.3 | 编辑工具条 + 自定义 AI（GLM） | Cumany |
| [Calendar](https://github.com/liamcain/obsidian-calendar-plugin) | 1.5.10 | 日历面板 | Liam Cain |
| [Templater](https://github.com/SilentVoid13/Templater) | 2.25.0 | 模板引擎 | SilentVoid |
| [Dataview](https://github.com/blacksmithgu/obsidian-dataview) | 0.5.68 | 笔记查询/索引 | blacksmithgu |
| [Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) | 8.4.0 | 任务管理 | Clare Macrae / Ilya Landikov |
| [Git](https://github.com/Vinzent03/obsidian-git) | 2.39.0 | vault 自动备份 | Vinzent03 |
| [BRAT](https://github.com/TfTHacker/obsidian42-brat) | 2.2.0 | 安装未上架插件 | TfTHacker |
| [Omnisearch](https://github.com/scambier/obsidian-omnisearch) | 1.31.0 | 全文搜索 | Simon Cambier |
| [Buttons](https://github.com/shabegom/buttons) | 0.9.13 | 笔记内按钮 | shabegom |
| [Flexplorer](https://github.com/kh4f/flexplorer) | 4.0.5 | 自定义排序 / 固定 / 隐藏文件 | kh4f |
| [Immersive Folder](https://github.com/iBlinkQ/immersive-folder) | 0.4.2 | 单文件夹沉浸视图 | iBlinkQ |
| Widgets | 0.0.11 | 笔记内小组件（时钟/倒计时/引语） | Rafael Veiga |
| Crisp Base | 0.2.4 | crisp 系列基础依赖 | letschips（BRAT） |
| Crisp File Explorer | 0.2.63 | 文件浏览器美化 | letschips（BRAT） |
| Crisp Focus | 1.4.0 | 专注书写（光标动效 / 打字机滚动 / 环境音） | letschips（BRAT） |
| Crisp Recall | 0.2.4 | 主动回忆 / 挖空复习 | letschips（BRAT） |
| Crisp Visual | 0.2.2 | 视觉资产画廊 | letschips（BRAT） |
| **Toolbar Pin Toggle** | 1.0.1 | 自研，见下 | 本地 |
| **Reading Rail Sidebar** | 0.1.1 | 自研，见下 | 本地 |
| **Quiet Shelf**（暗格） | 0.1.0 | 自研，见下 | 本地 |
| **Zheng Tally**（正字计数） | 1.0.2 | 自研，见下 | 本地 |

## 已装未启用（9 个）

保留在 vault 里备用，随时可在设置里打开：

| 插件 | 版本 | 用途 | 备注 |
|---|---|---|---|
| Claudian | 2.2.6 | Claude Code / Codex 等编码 agent 接入 vault | 备用 |
| Contribution Graph | 0.11.0 | 贡献热力图 | 备用 |
| Crisp Annotations | 1.6.0 | 手绘箭头 + 手写批注 | 引导流程不顺手，暂关 |
| Crisp ASR | 0.6.0 | 豆包 / Gemini 转写 | 备用 |
| Crisp DSH | 1.2.0 | DeepSeek Harness 嵌入右侧栏 | 备用 |
| **Crisp Reading Rail** | 0.4.4 | 阅读进度浮层轨道 | 已被自研 Reading Rail Sidebar 取代 |
| Day Planner | 0.35.1 | 时间块日程 | 备用 |

> CLI 侧另有一套 AI 编码工具链（Codex / OpenCode / dsh 等）在 Obsidian 之外独立运行，与本仓库无关。

## 自研插件（源码在独立仓库）

源码**唯一真身**位于 `E:\1project\<id>-obsidian\`，各自是独立的 GitHub 仓库，
目标发布到官方社区市场（见 `docs/publishing.md`）。

本仓库里保存的是**备份副本**，作用是「换机器时一份恢复全部」；vault 里的是**运行副本**。
改插件一律去源码仓库，改完跑 `scripts\sync-plugins.ps1`，一次把 vault 与 config 两处副本
都更新并校验逐字节一致。

| 插件 | 源码仓库 | vault / config 目录 |
|---|---|---|
| **Toolbar Pin Toggle** | `E:\1project\toolbar-pin-toggle-obsidian\` | `.obsidian/plugins/toolbar-pin-toggle/` |
| **Reading Rail Sidebar** | `E:\1project\reading-rail-sidebar-obsidian\` | `.obsidian/plugins/reading-rail-sidebar/` |
| **Quiet Shelf**（暗格） | `E:\1project\quiet-shelf-obsidian\` | `.obsidian/plugins/quiet-shelf/` |
| **Zheng Tally**（已在市场提交流程中） | `E:\1project\zheng-tally-obsidian\` | `.obsidian/plugins/zheng-tally/` |

用途简述：

- **Toolbar Pin Toggle** — 一个快捷键（`Alt+Q`）两种常驻：底部原生常驻工具条 / 顶部工具条常驻
- **Reading Rail Sidebar** — 右侧栏面板：进度百分比、当前标题跟随、标题树跳转、按文件记忆阅读位置；
  右缘刻度条用长度反映文本密度
- **Quiet Shelf**（暗格）— ① 暗格：归档 / 索引类文件从文件树收起（物理位置、知识图谱、搜索不受影响）；
  ② 聚焦：跨层级多选，只留选中那一组
- **Zheng Tally** — 编辑器内联的正字计数器（TypeScript 构建，产物在 `dist/`）

### Quiet Shelf 的命令与快捷键

| 命令 | 快捷键 |
|---|---|
| 打开暗格 | `Alt+S` |
| 批量移入 / 移出暗格 | — |
| 把当前文件移入 / 移出暗格 | `Alt+Shift+S` |
| 切换聚焦模式 | `Alt+Shift+F` |
| 聚焦当前文件所在文件夹 | — |
| 退出聚焦（恢复全部） | — |
| 把当前聚焦存为组合 | — |

批量界面也可以从 **设置 → Quiet Shelf → 批量管理** 打开：列出整个 vault 的树，勾选后一次处理，
带筛选框和「选中当前结果」。

> 快捷键写在本仓库的 `.obsidian/hotkeys.json` 里，随配置一起恢复。

前三个是**纯 JS、无构建依赖**（`main.js` + `styles.css` + `manifest.json`），改完重启 Obsidian 即生效；
zheng-tally 是 TypeScript 构建，产物在 `dist/`。样式全部限定在各自前缀（`rrs-` / `qs-` / `tbpt-`）下，
不改动任何主题变量。

> **`.gitignore`**：自研插件用**白名单**（`!.obsidian/plugins/<id>/**`）整目录放行，
> 其余插件的 `main.js` / `styles.css` / `manifest.json` 仍被通配规则排除（只留 `data.json`）。
>
> ⚠️ 白名单必须写在 `.obsidian/plugins/*/main.js` 这组通配排除**之后** ——
> gitignore 是后置规则优先，顺序写反白名单会被盖掉。
> 历史教训：`toolbar-pin-toggle` 曾因此只入库了 `data.json`，本体三件套全漏。
>
> `data.json` 不在同步范围里（脚本只复制三件套），所以各副本的设置互不干扰，手工改过的设置不会被覆盖。

## 不随仓库备份的配置

以下四个插件的 `data.json` 里 **含 vault 路径与打开记录**（属运行时状态，不是配置），已从仓库移出并加入 `.gitignore`。
本地文件照常保留，不影响使用；换机器时按下面的值手动设一遍即可。

**Flexplorer**（`flexplorer/data.json`，177 KB，其中 `items` 是 1000+ 条笔记/文件夹路径）

| 键 | 当前值 |
|---|---|
| `showHidden` | `false` |
| `newItemPlacement` | `"top"` |
| `persistOrderOnCreateDelete` | `true` |
| `debugMode` | `false` |
| `pinnedFiles` | `[]` |

**Crisp File Explorer**（`crisp-file-explorer/data.json`，19 KB，其中 `activity` 是今日/常用文件记录 + 每篇打开次数）

| 键 | 当前值 |
|---|---|
| `includeFolders` | `true` |
| `openOnDragRelease` | `true` |
| `autoExpandFoldersOnDrag` | `true` |
| `todayTrailEnabled` | `true` |
| `frequentMagnetsEnabled` | `true` |
| `soundEnabled` | `false` |
| `releaseSoundEnabled` | `false` |
| `pitchScaleEnabled` | `false` |
| `soundStyle` | `"soft"` |
| `orbStyle` | `"default"` |

**Crisp Reading Rail**（`crisp-reading-rail/data.json`，3.4 KB，其中 `readingMemory` 是每篇笔记的阅读进度与当前标题）

| 键 | 当前值 |
|---|---|
| `orbStyle` | `"default"` |
| `outlineMaxLevel` | `4` |
| `outlineScope` | `"all"` |
| `soundEnabled` | `false` |
| `releaseSoundEnabled` | `true` |
| `soundStyle` | `"followFileExplorer"` |
| `waypoints` | `{}` |

> 该插件已停用，功能由自研 Reading Rail Sidebar 接管。`licenseCode`（Crisp 激活码）不入库，恢复时自行填入。

## 关键插件设置

**Style Settings**（`obsidian-style-settings/data.json`）— 色系微调的唯一入口，改这里而不是改 letschips 的 CSS。深色背景键：`background-underlying-CSS-dark`（当前 `#0A0E1A`）。

**Git**（`obsidian-git/data.json`）— 备份的是**整个 vault**（笔记 + 配置），推到 `yunmin311/obsidian-notes`（private）。⚠️ 这与本仓库（只备份配置、public）是**两套完全独立的仓库**，不要把它的远端指到本仓库。

当前节奏（2026-09-16 核对）：每 **10 分钟**自动 commit（`autoSaveInterval: 10`）、每 **30 分钟**自动 push（`autoPushInterval: 30`）、每 1440 分钟自动 pull（`autoPullInterval: 1440`）+ 启动时 pull（`autoPullOnBoot: true`）；`disablePush: false`（推送开启）、`showErrorNotices: true`（失败会弹通知）、`updateSubmodules: false`；提交信息模板 `vault backup: {{date}}`。

> vault 根目录的 `.gitignore` 与 config 仓库各自独立维护。2026-09-16 修：vault 侧补上了 `.obsidian/workspace.json` —— 原来只有 `workspace-*.json`，通配匹配不到它（缺横线），导致主工作区状态每 10 分钟被提交一次，纯噪音。

**Editing Toolbar**（`editing-toolbar/data.json`）— 含自定义 AI 配置（GLM）。`toolbarBackgroundColor` / `toolbarIconColor` 保持插件的浅色原值，深色模式由 `toolbar-pin-toggle/styles.css` 用 `!important` 接管。

**Reading Rail Sidebar**（`reading-rail-sidebar/data.json`）— 自研。`settings` 三项：`maxLevel`（2/3/4）、`showProgress`、`rememberPosition`；`memory` 按文件路径记录阅读进度与当前标题，滚动停顿约 0.9 秒落盘，上限 300 条。

**Templater**（`templater-obsidian/data.json`）— 模板目录指向 vault 的 `templates/`。

**BRAT**（`obsidian42-brat/data.json`）— crisp 系列的 9 个仓库已登记。新设备恢复时先装 BRAT，再逐一添加。

> 2026-09-16 已清理 `community-plugins.json` 里 `obsidian-plugin-update-tracker` 的残留项 —— 它一直列在启用清单里，但插件目录早已不存在（手动删目录留下的），属脏数据。

## 新设备恢复顺序

1. 装市场插件（上表「已启用」里的前 13 个，不含 crisp 系列）
2. 装 BRAT → 添加 crisp 系列 9 个仓库（`letschips/crisp-*`）
3. 复制 `.obsidian/plugins/*/data.json` 覆盖对应插件设置
4. 自研插件：从各自的 GitHub Release 下载三件套放进 `.obsidian/plugins/<id>/`，
   或在 BRAT 里添加 `yunmin311/<id>-obsidian`；
   本机则直接 `git clone` 对应仓库后用 `scripts\sync-plugins.ps1` 同步
   （四个插件的三件套也随本仓库备份，见「自研插件」一节）
5. 复制 `.obsidian/snippets/`（10 个）+ `appearance.json`
6. 主题 Border 在内置主题市场安装，重启 Obsidian
7. 按「不随仓库备份的配置」补设 Flexplorer、Crisp File Explorer、Crisp Reading Rail
8. 填入 GLM API / Crisp 激活码 / ASR Key
