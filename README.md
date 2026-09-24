# Obsidian Config（仅配置，不含任何笔记）

Obsidian 外壳配置包：主题、CSS 片段、插件设置与说明文档。**不含任何笔记内容**。

配色为自制**灰青蓝蓝灰体系**：浅色主蓝 `#5A7F9A` / 深色主蓝 `#6B9FE8`，深色模式围绕色相 215° 的蓝黑梯子（背景 `#0A0E1A`，叠加 `dark-paper-texture.css` 的纸纹）。关系图、行内代码、选中、高亮全部并入蓝灰系。实际渲染效果见 [docs/色彩系统预览.md](docs/色彩系统预览.md)（在 Obsidian 中打开可实时查看浅/深两版）。

正式项目地址：`E:\1project\obsidian-config`（与日常使用的 vault 分离；vault 只作为配置来源）。

## 两套仓库，别混淆

| 仓库 | 可见性 | 装什么 | 谁在推 |
|---|---|---|---|
| `yunmin311/obsidian-notes` | **private** | **整个 vault**（全部笔记 + `.obsidian` 配置） | obsidian-git 插件自动：每 10 分钟 commit、每 30 分钟 push |
| `yunmin311/obsidian-config` | public（本仓库） | **只放配置框架**：主题、CSS 片段、插件设置、恢复文档 | 手工 push |

- 本仓库是「配置框架」，可供展示与复用；vault 的日常笔记备份走 `obsidian-notes` —— 两者**完全独立、互不干扰**。
- 从本仓库移出某个文件，只影响这里；vault 那边的备份照常包含它（反之亦然）。
- 两边的 `.gitignore` 各自维护、规则不同：vault 侧是「完整笔记备份」（只排垃圾与大包），config 侧是「白名单放行」（防止笔记误入本仓库）。

## 当前配置栈

| 层 | 内容 |
|---|---|
| 主题 | Border（`cssTheme: "Border"`，基础模式 moonstone） |
| 配色 | 灰青蓝：浅色 `#5A7F9A` / 深色 `#6B9FE8`；深色面板为蓝黑梯子（见 [docs/css-guide.md](docs/css-guide.md) 定稿表） |
| 大 CSS | `baseline-optimized.minimal.active.css` + `border-polished.active.css`（均为 letschips 作品，勿改） |
| 覆盖片段 | `blue-gray-dark-fix.css`（暖色→蓝灰）、`graph-blue-gray.css`（关系图蓝灰）、`dark-paper-texture.css`（深色纸纹）、`tree-indent.css`（文件树缩进）、`hide-embed-titles.css`、`hide-editing-toolbar.css`、`pin-spacing.css`，自写可改 |
| 字体 | 界面：方正屏显雅宋简体 · 正文：iA Writer Quattro S · 等宽：Fira Code |
| 自研插件 | 6 个，**本体整体入库**：`toolbar-pin-toggle` · `quiet-shelf` · `reading-rail-sidebar` · `dense-reading` · `zheng-tally` · `paper-desk`（详见下节） |
| 第三方插件 | 配置与安装方式见 [docs/plugins.md](docs/plugins.md)；启用清单以 `.obsidian/community-plugins.json` 为准 |

### 六个自研插件

| 插件 | 版本 | 作用 |
|---|---|---|
| `toolbar-pin-toggle` | 1.1.2 | Alt+Q 让 Editing Toolbar 底栏/顶栏常驻；Toolbar 外观改动的唯一依赖 |
| `quiet-shelf`（暗格） | 0.3.0 | 左侧文件树的**显示层**控制：自动收起归档/索引文件（支持通配符）、跨层级多选聚焦 |
| `reading-rail-sidebar`（轨道） | 0.2.2 | 右侧栏阅读面板 + 正文右侧浮层刻度条（文本密度驱动） |
| `dense-reading` | 0.2.2 | 行宽档位 + 密集阅读模式（原 `dense-reading.css` 片段转成的插件） |
| `zheng-tally`（正） | 1.0.5 | 内联「正」字计数芯片，编辑/阅读双视图渲染 |
| `paper-desk` | 0.4.0 | 笔记时钟、侧栏计时器，以及可选的首页行为与区块 |

六个插件各有独立的公开源码仓库与 GitHub Release。前五个已在 Obsidian 社区目录；
`paper-desk` 目前需从 GitHub Release 手动安装（2026-09-24 核对）。
源码仓库是唯一修改处。[scripts/sync-plugins.ps1](scripts/sync-plugins.ps1) 把构建好的文件同步到 vault、
本仓库和演示 vault，并逐字节校验；它不覆盖各处的 `data.json`。

> **`dense-reading` 已从 CSS 片段转为插件。** 片段文件与类名保留（`dense-w44` … `dense-w-custom`、
> `dense-reading-mode`），所以迁移是无缝的；但推荐用插件，因为它有设置界面且能按笔记记住档位。

## 目录结构

```
.obsidian/
  appearance.json        主题 + 启用的 CSS 片段 + 字体
  community-plugins.json 已启用插件清单
  graph.json             关系图配色
  hotkeys.json           快捷键
  snippets/              CSS 片段（见 docs/css-guide.md）
  plugins/<第三方>/data.json      各插件设置（见 docs/plugins.md）
  plugins/<自研插件>/             6 个自研插件本体，整体入库
                                 ↑ 含 vault 路径的运行时配置不入库，见 docs/plugins.md
docs/
  css-guide.md           CSS 外壳怎么改（逐文件说明）+ 深色蓝灰色板定稿
  plugins.md             插件设置方式 + 来源链接 + 不随仓库备份的配置清单
  publishing.md          发布插件的完整流程与注意事项
  pre-publish-audit.md   发布前审查清单
  screenshot-brief.md    插件市场截图任务书
  色彩系统预览.md         色彩系统测试页（放进 vault 根目录可实时预览）
scripts/
  install.ps1            一键安装：把配置装进指定 vault（自动备份现有配置）
  sync-plugins.ps1       把自研插件源码同步到 vault / 本仓库 / demo vault 三处并校验
  audit-plugins.ps1      插件审计
  set-repo-about.ps1     设置 GitHub 仓库描述等元信息
templates/README.md      5 个 Templater 模板参考（日记/周记/项目/文献/会议）
ATTRIBUTION.md           引用的开源项目与作者署名清单
LICENSE                  MIT
```

## 新设备恢复方法

**方式一：一键脚本（Windows）**

```powershell
.\scripts\install.ps1 -VaultPath "D:\MyVault"
```

**方式零：下载快照（不装 git 也能用）**

[Releases](../../releases) 页每有 `snapshot-YYYY-MM-DD` 标签就会附带一个 ZIP，
内容与仓库一致（`.obsidian/` + `docs/` + `scripts/` + `templates/` + 根目录文档），
解压后跑 `.\scripts\install.ps1 -VaultPath "<你的 vault>"` 即可。ZIP 由
[.github/workflows/release.yml](.github/workflows/release.yml) 打**显式白名单**生成，不含笔记。

**方式二：手动**

1. 装市场插件（清单见 [docs/plugins.md](docs/plugins.md)）。
2. 装 BRAT → 逐一添加需要的 crisp 系列仓库（`letschips/crisp-*`）。
3. 复制 `.obsidian/plugins/*/data.json` 覆盖对应插件设置（或直接跑 install.ps1）。
4. 复制 **6 个自研插件目录**（`toolbar-pin-toggle/`、`quiet-shelf/`、`reading-rail-sidebar/`、
   `dense-reading/`、`zheng-tally/`、`paper-desk/`）—— 这些含本体，复制过去即可用。
5. 复制 `snippets/` + `appearance.json`。
6. 主题 Border 在内置主题市场安装，重启 Obsidian。

> 第三方插件本体（`main.js`）不入库，本仓库只存设置；**自研插件例外**，本体随仓库一起走。

## 红线（改动前必读）

- `baseline-optimized.minimal.active.css`、`border-polished.active.css` 是 letschips 的原版作品，**不要直接编辑**，改坏了整个外壳会塌。要微调色系走 Style Settings（见 [docs/css-guide.md](docs/css-guide.md)）。
- 本仓库推送前必须确认没有笔记内容被暂存：`git status` 里只应出现 `.obsidian/`、`docs/`、`scripts/`、`templates/`、根目录文档。
- `.gitignore` 里自研插件的白名单必须写在 `.obsidian/plugins/*/main.js` / `styles.css` / `manifest.json` 那组通配排除**之后** —— gitignore 后置规则优先，写前面会被盖掉（历史上 `toolbar-pin-toggle` 本体就这么漏过）。
- `flexplorer` 与 `crisp-file-explorer` 的 `data.json` 里装的是 vault 文件树与打开记录（运行时状态，不是配置），已加入 `.gitignore` **不入库**。本地文件照常保留；换机器时按 [docs/plugins.md](docs/plugins.md)「不随仓库备份的配置」手动补设。
- **改自研插件不要直接改本仓库里的副本** —— 先改 `<id>-obsidian` 源码仓库，再跑 `scripts/sync-plugins.ps1`，否则会被同步覆盖。
- 2026-09-13：已清理 `appearance.json` 中失效片段引用 `baseline-translucent-window.active`。

## 署名

`baseline-optimized.minimal.active.css`、`border-polished.active.css` 及 crisp 系列插件由小红书博主 **letschips** 制作，完整署名清单见 [ATTRIBUTION.md](ATTRIBUTION.md)。
