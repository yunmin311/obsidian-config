# 插件设置说明 + 来源链接

安装方式两种：**市场** = Obsidian 内置社区插件市场直接搜；**BRAT** = 通过 obsidian42-brat 添加 GitHub 仓库安装。

本仓库只备份各插件的 `data.json`（设置），不含插件本体（main.js 等按惯例不入库）。

## 已安装插件（24 个）

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
| [Contribution Graph](https://github.com/vran/contribution-graph) | 贡献热力图 | vran | 市场 |
| [Flexplorer](https://github.com/kh4f/flexplorer) | 灵活文件浏览器 | kh4f | 市场 |
| Claudian | AI 助手（GLM 4.6V） | [Yishen Tu](https://github.com/YishenTu) | 市场/手动 |
| Widgets | 桌面小组件 | [Rafael Veiga](https://rafaelveiga.github.io/) | 市场 |

### crisp 系列（共 9 个，作者均为小红书博主 letschips，全部经 BRAT 安装）

| 插件 | 用途 | BRAT 仓库 |
|---|---|---|
| Crisp Base | 系列基础依赖 | `letschips/crisp-base` |
| Crisp File Explorer | 文件管理器美化 | `letschips/crisp-file-explorer` |
| Crisp Visual | 视觉增强 | `letschips/crisp-visual` |
| Crisp Focus | 专注模式 | `letschips/crisp-focus` |
| Crisp Reading Rail | 阅读侧栏 | `letschips/crisp-reading-rail` |
| Crisp Annotations | 批注 | `letschips/crisp-annotations` |
| Crisp Recall | 回忆/复习 | `letschips/crisp-recall` |
| Crisp ASR | 语音识别 | `letschips/crisp-asr` |
| Crisp DSH | 仪表盘 | `letschips/crisp-dsh` |

## 关键插件设置（对应 .obsidian/plugins/<id>/data.json）

**Style Settings**（`obsidian-style-settings/data.json`）— 色系微调的唯一入口，改这里而不是改 letschips 的 CSS。深色背景键：`background-underlying-CSS-dark`（当前 `#0A0E1A`）。

**Git**（`obsidian-git/data.json`）— 当前配置：每天自动 commit 一次（`autoSaveInterval: 1440`），每天自动 pull 一次，**自动 push 关闭**（`autoPushInterval: 0`），提交信息模板 `vault backup: {{date}}`。注意：这个插件会备份整个 vault，与"只备份配置"的仓库是两回事，别把它指向本仓库远端。

**Editing Toolbar**（`editing-toolbar/data.json`）— 含自定义 AI 配置（GLM），API Key 需用户自填，本文件不入库敏感值。

**Claudian**（`realclaudian/data.json`）— AI 配置：GLM 4.6V，`providerMode: custom`。

**Templater**（`templater-obsidian/data.json`）— 模板目录指向 vault 的 `templates/`（该目录随仓库同步）。

**BRAT**（`obsidian42-brat/data.json`）— 上面 crisp 系列的 9 个仓库已登记，新设备恢复时先装 BRAT，再逐一添加。

## 新设备恢复顺序

1. 装市场插件（上表前 14 个）
2. 装 BRAT → 添加 crisp 系列仓库
3. 复制 `.obsidian/plugins/*/data.json` 覆盖对应插件设置
4. 复制 `snippets/` + `appearance.json` → 重启
