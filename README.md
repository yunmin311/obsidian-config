# Obsidian Config（仅配置，不含任何笔记）

Obsidian 外壳配置包：主题、CSS 片段、插件设置与说明文档。**不含任何笔记内容**。

配色为自制**灰青蓝蓝灰体系**：浅色主蓝 `#5A7F9A` / 深色主蓝 `#6B9FE8`，深色模式围绕色相 215° 的蓝黑梯子（纯净背景 `#0A0E1A`，无纹理），关系图、行内代码、选中、高亮全部并入蓝灰系。实际渲染效果见 [docs/色彩系统预览.md](docs/色彩系统预览.md)（在 Obsidian 中打开可实时查看浅/深两版）。

正式项目地址：`E:\1project\obsidian-config`（与日常使用的 vault 分离；vault 只作为配置来源）。

## 当前配置栈

| 层 | 内容 |
|---|---|
| 主题 | Border（`cssTheme: "Border"`，基础模式 moonstone） |
| 配色 | 灰青蓝：浅色 `#5A7F9A` / 深色 `#6B9FE8`；深色面板为蓝黑梯子（见 [docs/css-guide.md](docs/css-guide.md) 定稿表） |
| 大 CSS | `baseline-optimized.minimal.active.css` + `border-polished.active.css`（均为 letschips 作品，勿改） |
| 覆盖片段 | `blue-gray-dark-fix.css`（暖色→蓝灰）+ `graph-blue-gray.css`（关系图蓝灰），自写可改 |
| 字体 | 界面：方正屏显雅宋简体 · 正文：iA Writer Quattro S · 等宽：Fira Code |
| 插件 | 24 个已安装（crisp 系列 9 个通过 BRAT 安装），18 个有自定义设置 |

## 目录结构

```
.obsidian/
  appearance.json        主题 + 启用的 CSS 片段 + 字体
  community-plugins.json 已启用插件清单
  graph.json             关系图配色
  hotkeys.json           快捷键
  snippets/              7 个 CSS 片段（见 docs/css-guide.md）
  plugins/*/data.json    各插件设置（见 docs/plugins.md）
docs/
  css-guide.md           CSS 外壳怎么改（逐文件说明）+ 深色蓝灰色板定稿
  plugins.md             插件设置方式 + 来源链接
  色彩系统预览.md         色彩系统测试页（放进 vault 根目录可实时预览）
scripts/
  install.ps1            一键安装：把配置装进指定 vault（自动备份现有配置）
templates/README.md      5 个 Templater 模板参考（日记/周记/项目/文献/会议）
ATTRIBUTION.md           引用的开源项目与作者署名清单
LICENSE                  MIT
```

## 新设备恢复方法

**方式一：一键脚本（Windows）**

```powershell
.\scripts\install.ps1 -VaultPath "D:\MyVault"
```

**方式二：手动**

1. 装市场插件（清单见 [docs/plugins.md](docs/plugins.md) 前 14 个）。
2. 装 BRAT → 逐一添加 crisp 系列 9 个仓库（`letschips/crisp-*`）。
3. 复制 `.obsidian/plugins/*/data.json` 覆盖对应插件设置（或直接跑 install.ps1）。
4. 复制 `snippets/` + `appearance.json`。
5. 主题 Border 在内置主题市场安装，重启 Obsidian。

> 插件本体（main.js）不入库，本仓库只存设置，插件需要按上面顺序重装。

## 红线（改动前必读）

- `baseline-optimized.minimal.active.css`、`border-polished.active.css` 是 letschips 的原版作品，**不要直接编辑**，改坏了整个外壳会塌。要微调色系走 Style Settings（见 [docs/css-guide.md](docs/css-guide.md)）。
- 本仓库推送前必须确认没有笔记内容被暂存：`git status` 里只应出现 `.obsidian/`、`docs/`、`scripts/`、`templates/`、根目录文档。
- 已知小问题：vault 的 `appearance.json` 引用了已不存在的片段 `baseline-translucent-window.active`（无效引用，不影响使用，可择机清理）。

## 署名

`baseline-optimized.minimal.active.css`、`border-polished.active.css` 及 crisp 系列插件由小红书博主 **letschips** 制作，完整署名清单见 [ATTRIBUTION.md](ATTRIBUTION.md)。
