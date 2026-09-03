# CSS 外壳修改说明

## 文件清单（.obsidian/snippets/）

| 文件 | 作用 | 谁的 | 能不能改 |
|---|---|---|---|
| `baseline-optimized.minimal.active.css` | 全局基线：色板、语义色变量（`--hv-*`）、阅读区排版 | letschips | ❌ 不改。色系微调全部走 Style Settings + 覆盖片段 |
| `border-polished.active.css` | Border 主题下的笔记级美化（`--csspp-*` 前缀），含移动端/打印适配 | letschips | ❌ 不改 |
| `blue-gray-dark-fix.css` | 蓝灰化覆盖层：覆盖 letschips 硬编码的暖色 `--hv-*`（行内代码/强调/选中/高亮/代码块背景） | 自写 | ✅ 只改色值 |
| `graph-blue-gray.css` | 关系图配色：蓝灰节点 + 青色标签，覆盖 border-polished 第 8 节的绿/红/紫/橙 | 自写 | ✅ 只改文件头部的 `--bgg-*` 变量 |
| `pin-spacing.css` | 文件树 pin 图标间距：文件 12px、文件夹 8px | 自写 | ✅ 只改数值 |
| `hide-editing-toolbar.css` | 带 `no-editing-toolbar` 标签的笔记隐藏顶部编辑工具条 | 自写 | ✅ 只加选择器 |
| `hide-embed-titles.css` | 隐藏嵌入文件（图片等）的标题 | 自写 | ✅ |

> **启用顺序重要**：`blue-gray-dark-fix` 和 `graph-blue-gray` 必须排在两个 letschips 文件之后（当前 appearance.json 已排好），靠加载顺序完成覆盖。
>
> 已知问题：`appearance.json` 的 `enabledCssSnippets` 里引用了 `baseline-translucent-window.active`，但该文件已不存在，属无效引用，可以清理（不影响使用）。

## 深色模式蓝灰色板（2026-09 定稿）

围绕色相 215° 的蓝黑梯子，与主蓝 `#6B9FE8` 同族：

| 用途 | 色值 |
|---|---|
| 底层背景（纯净无纹理） | `#0A0E1A` |
| 笔记区 primary | `#10151F` |
| 侧栏 secondary | `#141A26` |
| 三级面板 tertiary | `#19202E` |
| 代码块背景 | `#131926` |
| 边框三级递进 | `#263042` → `#334157` → `#425470` |
| 语义绿（已并入蓝） | 浅 `#5A7F9A` / 深 `#6BA3C8` |

红/橙/黄保留原值——错误与警告语义需要暖色点缀。

## 色系怎么改（走 Style Settings，不动 letschips 的 CSS）

位置：`.obsidian/plugins/obsidian-style-settings/data.json`

| 想改什么 | 改哪个键 |
|---|---|
| 深色背景 | 搜 `background-underlying-CSS-dark`（纯净 `#0A0E1A`，无纹理） |
| 强调色（浅/深） | 浅色 `#5A7F9A`，深色 `#6B9FE8` |
| Pink / Red / Orange 饱和度 | 搜对应 RGB 值，单次调整幅度 < 5% |
| 关系图配色 | `snippets/graph-blue-gray.css` 头部的 `--bgg-*` 变量（graph.json 的 colorGroups 留空即可） |

改法：直接编辑 `data.json` 里对应键的值，保存后在 Obsidian 里 Style Settings 会即时生效。**一次只改一项，看效果再改下一项。**

## 小片段改法示例

**pin-spacing.css**（间距数值在 `margin-right`）：

```css
/* 文件 pinned 间距 —— 想加大就改这里的 12px */
.nav-file-title.is-pinned::before { margin-right: 12px !important; }
/* 文件夹 pinned —— 固定 8px，保持不变 */
.nav-folder-title.is-pinned::before { margin-right: 8px !important; }
```

**新增一条小片段**：在 snippets 目录建 `名字.css` → 设置 → 外观 → CSS 片段里刷新并启用。只放一两个选择器的独立小修补，不往 letschips 的文件里加。

## 署名声明

`baseline-optimized.minimal.active.css` 与 `border-polished.active.css` 由小红书博主 **letschips** 制作（crisp 系列插件同为其作品）。修改或再分发需保留其文件头署名。
