# Native PDF Theme Bridge

Preserve the active Obsidian palette in native PDF export, with configurable spacing repeated on every page. Desktop only. By [yunmin311](https://github.com/yunmin311).

[Download](https://github.com/yunmin311/native-pdf-theme-bridge/releases/latest) · [Changelog](CHANGELOG.md) · [Validation](docs/validation.md)

## Installation

Download `main.js` and `manifest.json` from a Release. Create `.obsidian/plugins/native-pdf-theme-bridge/` inside your vault, put both files there, restart Obsidian, then enable **Native PDF Theme Bridge** under Community plugins. For upgrades, replace these two files only; preserve `data.json`. This plugin is not currently listed in the community catalog.

Use the normal **Export to PDF** command. No system print dialog or replacement export command is added. Open the plugin's settings tab to configure:

| Setting                     | Default    | Behavior                                                                 |
| --------------------------- | ---------- | ------------------------------------------------------------------------ |
| Follow current palette      | On         | Use Obsidian's active light/dark palette, independently of the OS scheme |
| Per-page spacing            | On         | Repeat content padding on every page while leaving paper full-bleed      |
| Top / right / bottom / left | 12 mm each | Independently adjustable, 0–40 mm                                        |

For full-bleed textures, select **Margins: None** in the native export dialog. Obsidian remembers this per vault; the plugin does not change export preferences. Native page margins clip full-bleed backgrounds and cannot be undone by CSS. Textures and fonts are supplied by your theme/snippets, not bundled here.

## Compatibility and scope

- Minimum application version: 1.9.0. Repeated block padding requires Chromium 130 or newer. Unsupported engines retain original pagination and show a settings warning; update the desktop installer as well as the application package.
- Runtime tested: Windows, Obsidian application 1.14.4 / installer 1.9.14, Chromium 138, Border theme, local paper snippet; A4 and A5, light and dark, long paragraphs, ordinary code blocks and tables.
- Only the disposable native export document is adjusted. No Electron patch, network request, note modification or writes to other plugins' settings. Settings persist only in this plugin's own `data.json`.
- A temporary inert reading-view clone samples element colors and is removed synchronously, including on error. Original PDF media is preserved.
- Legacy embedded-PNG paper CSS containing the `450mm` signature has its OS-color queries adjusted only in the export copy. Original snippets are untouched.
- Disabling palette following skips color corrections; theme/snippet rules still apply. Disabling spacing restores theme/snippet layout. Disable the plugin to restore native export behavior.
- Other themes, landscape, oversized images/code blocks, dynamic embeds and pseudo-elements need separate testing. This is not a promise of pixel-identical screen/PDF output.

## 中文说明

为 Obsidian 原生「导出为 PDF」保留当前浅深色配色，并在每一页重复正文留白。作者：**yunmin311**。不调用系统打印窗口，不另造导出流程。

从 Release 下载 `main.js`、`manifest.json`，放进仓库的 `.obsidian/plugins/native-pdf-theme-bridge/`，重启并在第三方插件中启用。升级只替换这两个文件，保留自己的 `data.json`。目前尚未进入社区插件市场。

| 设置              | 默认值   | 作用                                       |
| ----------------- | -------- | ------------------------------------------ |
| 跟随当前配色      | 开启     | 使用 Obsidian 当前浅深色，而非操作系统配色 |
| 逐页留白          | 开启     | 每页重复正文内边距，纸纹仍可铺满纸面       |
| 上 / 右 / 下 / 左 | 各 12 mm | 四边独立调整，范围 0–40 mm                 |

在原生导出弹窗选择一次「页边距：无」，Obsidian 会记住。插件不擅自修改导出偏好；原生页边距产生的背景裁剪无法靠 CSS 撤销。纸纹和字体仍由主题、片段提供。

已用上述真实 Windows 环境验证 A4/A5 浅深色长文、代码与表格；逐页留白需 Chromium 130+，旧内核将保留原分页并提示更新安装程序。其他主题、横向、超大图片/代码、第三方动态嵌入仍需单独验证。不修改笔记、其他插件和原片段，不联网；关闭本插件即可回到原生行为。详细证据见 [验证记录](docs/validation.md)。

## Development / 开发

Node.js 20+, Poppler (`pdftotext`, `pdftoppm`) and Playwright Chromium are required:

```sh
npm ci
npx playwright install --with-deps chromium
npm test
```

Tests cover ordinary-document isolation, palette combinations, resource-safe probes, failure cleanup, settings persistence, independent toggles, old-engine fallback and actual Chromium A4/A5 PDF pagination. Runtime Obsidian exports supplement, not replace, those tests.

When reporting a problem, include application **and installer** versions, OS, theme, export paper size/margins and a minimal non-private Markdown sample. Do not upload your private vault or fonts.
