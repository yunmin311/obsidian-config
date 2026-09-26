# 插件设置说明 + 来源链接

安装方式：**市场** = Obsidian 内置社区插件市场直接搜；**BRAT** = 通过 obsidian42-brat 添加 GitHub 仓库安装；**本地** = 自研插件。

备份策略：

| 类型 | 备份内容 |
|---|---|
| 第三方插件 | 只备份 `data.json`（设置），本体按惯例不入库 |
| 自研插件 | 源码在 `E:\1project\<id>-obsidian\`；本仓库保留可恢复的插件副本，`data.json` 不由同步脚本覆盖 |
| 含 vault 路径的运行时状态 | **不入库**（见文末「不随仓库备份的配置」） |

## 插件参考（启用状态以 `community-plugins.json` 为准）

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
| **Toolbar Pin Toggle** | 1.1.2 | 自研，见下 | 本地 |
| **Reading Rail Sidebar** | 0.2.2 | 自研，见下 | 本地 |
| **Quiet Shelf**（暗格） | 0.3.1 | 自研，见下 | 本地 |
| **Dense Reading**（密排阅读） | 0.2.2 | 自研，见下 | 本地 |
| **Zheng Tally**（正字计数） | 1.0.5 | 自研，见下 | 本地 |
| **Paper Desk** | 0.5.0 | 自研，时钟/计时器/首页 | 本地 |

## 备用插件

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

源码**唯一真身**位于 `E:\1project\<id>-obsidian\`，各自是独立的 GitHub 仓库。
前五个插件已在官方社区目录；Paper Desk 当前通过 GitHub Release 手动安装。
`docs/publishing.md` 记录了此前的上架流程，不是当前上架状态清单。

本仓库里保存的是**备份副本**，作用是「换机器时一份恢复全部」；vault 里的是**运行副本**。
改插件一律去源码仓库，改完跑 `scripts\sync-plugins.ps1`，一次把 vault、本仓库与演示库
三处副本都更新并校验逐字节一致。

| 插件 | 源码仓库 | vault / config 目录 |
|---|---|---|
| **Toolbar Pin Toggle** | `E:\1project\toolbar-pin-toggle-obsidian\` | `.obsidian/plugins/toolbar-pin-toggle/` |
| **Reading Rail Sidebar** | `E:\1project\reading-rail-sidebar-obsidian\` | `.obsidian/plugins/reading-rail-sidebar/` |
| **Quiet Shelf**（暗格） | `E:\1project\quiet-shelf-obsidian\` | `.obsidian/plugins/quiet-shelf/` |
| **Dense Reading**（密排阅读） | `E:\1project\dense-reading-obsidian\` | `.obsidian/plugins/dense-reading/` |
| **Zheng Tally** | `E:\1project\zheng-tally-obsidian\` | `.obsidian/plugins/zheng-tally/` |
| **Paper Desk** | `E:\1project\paper-desk-obsidian\` | `.obsidian/plugins/paper-desk/` |

用途简述：

- **Toolbar Pin Toggle** — 一个快捷键（`Alt+Q`）两种常驻：底部原生常驻工具条 / 顶部工具条常驻
- **Reading Rail Sidebar** — 右侧栏面板：进度百分比、当前标题跟随、标题树跳转、按文件记忆阅读位置；
  右缘刻度条用长度反映文本密度
- **Quiet Shelf**（暗格）— ① 暗格：归档 / 索引类文件从文件树收起（物理位置、知识图谱、搜索不受影响）；
  ② 聚焦：跨层级多选，只留选中那一组
- **Dense Reading**（密排阅读）— 阅读视图密排间距 + 可调行宽（五档 + 自定义滑条）+ 按笔记固定档位。
  前身是 `dense-reading.css` 片段，2026-09-19 退休（见下）
- **Zheng Tally** — 编辑器内联的正字计数器（TypeScript 构建，产物在 `dist/`）
- **Paper Desk** — 笔记时钟、侧栏专注计时器，以及按需启用的首页行为与代码块

### 双语与赞助入口

五个原生 JS 插件的设置页支持**中英双语**，语言下拉在设置页顶部：
`跟随 Obsidian / 简体中文 / English`。改 `locales.js` 后必须重打包内联到 `main.js`；
只改源码表而不打包，运行中的设置页不会更新。

| 文件 | 职责 |
|---|---|
| `i18n.js` | 运行时：`t()` 取词。缺键回落英语、再回落键名本身，**永不抛异常** |
| `locales.js` | 字符串表：公共键（语言/赞助/页脚）+ 本插件专属键 |
| `sponsor.js` | 赞助区块的链接与渲染；只在用户点击链接时离开 Obsidian，不加载外部脚本 |

> `i18n.js` 在五个原生 JS 插件中各有一份，修改公共行为时须逐仓库核对并重新打包。

设置页包括语言下拉、功能项、**恢复默认**及版本/仓库信息；赞助入口另行核对可用性。
「恢复默认」**刻意保留语言选择** —— 那是关于这一页本身的偏好，不是插件行为。

> **赞助入口核查（2026-09-24）：** Paper Desk、Dense Reading、Quiet Shelf、Reading Rail Sidebar
> 和 Toolbar Pin Toggle 的设置页均指向 `https://github.com/sponsors/yunmin311`，但公开访问会
> 重定向到普通个人主页，GitHub API 也没有返回该账号的公开 Sponsors 页面。Zheng Tally 没有设置页
> 赞助入口；六个源码仓库均没有 `.github/FUNDING.yml`。这只是现状记录，不代表已开通收款，
> 也不替换为其他收款平台。公开赞助页启用后再核验链接与仓库按钮。

### Dense Reading 与 dense-reading.css 片段（2026-09-19 退休）

原来的 `dense-reading.css` 片段靠 Style Settings 存值、靠笔记 frontmatter 的 `cssclasses: dense-w54` 生效，
用起来绕。现已整体搬进插件：

- 片段文件已改名为 `dense-reading.css.retired`（**保留不删**，便于回滚）
- `appearance.json` 的 `enabledCssSnippets` 已移出 `dense-reading`
- `community-plugins.json` 已加入 `dense-reading`
- 插件 `data.json` 预写了原档位（`widthPreset: w78` / `customWidth: 96`），启用后行宽与之前一致
- **类名与片段完全一致**（`dense-w44`…`dense-w-custom`、`dense-reading-mode`），两者可并存不打架

> `obsidian-style-settings/data.json` 里还留着 `dense-reading@@dense-width` 与 `@@dense-width-value`
> 两个键。**确认插件工作正常后再删** —— 现在删掉万一要回滚就没档位记录了。

### Quiet Shelf 的命令与快捷键

0.3.1 修复了放回项目仍被聚焦或上级目录隐藏的问题。放回时会解除阻挡它的聚焦，
并放回被收起的上级目录；其他单独移入暗格的项目、聚焦清单和已保存组合保留。
退出聚焦只关闭聚焦过滤，不清空暗格规则。若配置保存失败，会先恢复当前显示并提示重试。

| 命令 | 快捷键 |
|---|---|
| 打开暗格 | `Alt+S` |
| 批量移入 / 移出暗格 | — |
| 把当前文件移入 / 移出暗格 | `Alt+Shift+S` |
| 切换聚焦模式 | `Alt+Shift+F` |
| 聚焦当前文件所在文件夹 | — |
| 退出聚焦（保留暗格规则） | — |
| 把当前聚焦存为组合 | — |

批量界面也可以从 **设置 → Quiet Shelf → 批量管理** 打开：列出整个 vault 的树，勾选后一次处理，
带筛选框和「选中当前结果」。

> 快捷键写在本仓库的 `.obsidian/hotkeys.json` 里，随配置一起恢复。

除 Zheng Tally 外的五个插件为原生 JavaScript。修改 `i18n.js`、`locales.js` 或 `sponsor.js` 后，
须先运行 `_scratch/_i18n/bundle-inline.js` 把伴随模块内联进 `main.js`，再运行同步脚本；
Zheng Tally 则先构建 `dist/`。各插件的样式限定在自己的前缀（`rrs-` / `qs-` / `dr-` /
`tpt-` / `pd-`）下，不应改变主题或其他插件的文件树行为。

> ⚠️ **Release 资产清单不能写死。** 工作流按 `*.js` 通配收集根目录所有脚本 + `manifest.json` + `styles.css`。
> 之前写死成三件套，加了 `i18n.js` 后 Release 里少三个文件 —— 从 Release 安装会 `MODULE_NOT_FOUND`，
> 而且是打开设置页才炸。2026-09-19 已改为通配。

> **`.gitignore`**：自研插件用**白名单**（`!.obsidian/plugins/<id>/**`）整目录放行，
> 其余插件的 `main.js` / `styles.css` / `manifest.json` 仍被通配规则排除（只留 `data.json`）。
>
> ⚠️ 白名单必须写在 `.obsidian/plugins/*/main.js` 这组通配排除**之后** ——
> gitignore 是后置规则优先，顺序写反白名单会被盖掉。
> 历史教训：`toolbar-pin-toggle` 曾因此只入库了 `data.json`，本体三件套全漏。
>
> `data.json` 不在同步范围里（脚本只复制固定清单里的文件），所以各副本的设置互不干扰，手工改过的设置不会被覆盖。
> 同步脚本会顺手清理副本里源码已删掉的 `*.js`（幽灵文件很难查），但**绝不碰 `data.json`**。

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

1. 按 `community-plugins.json` 安装对应市场插件（不含 crisp 系列）
2. 装 BRAT → 添加 crisp 系列 9 个仓库（`letschips/crisp-*`）
3. 复制 `.obsidian/plugins/*/data.json` 覆盖对应插件设置
4. 自研插件：直接复制本仓库 `.obsidian/plugins/<id>/` 里需要的六个插件目录，或从各自的
   GitHub Release 下载对应资产放进同名目录；也可以在 BRAT 中添加各插件的独立仓库。
   从源码仓库安装前须按上节说明完成打包或构建，不要漏掉伴随文件。
5. 复制 `.obsidian/snippets/`（现为 9 个启用 + 1 个已退休的 `dense-reading.css.retired`）+ `appearance.json`
6. 主题 Border 在内置主题市场安装，重启 Obsidian
7. 按「不随仓库备份的配置」补设 Flexplorer、Crisp File Explorer、Crisp Reading Rail
8. 填入 GLM API / Crisp 激活码 / ASR Key
