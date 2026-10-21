# 纸质 PDF 导出：可选配置与安全恢复

本文区分已验证的本机配色与分页、可选恢复工具和剩余边界。配置工具通过不等于所有 PDF 场景通过。

## 当前状态（2026-10-21，实机复核）

- 安装程序及安装目录中的包是 **1.9.14**，但当前窗口标题是 **1.14.4**，且 `C:\Users\lqy\AppData\Roaming\obsidian\obsidian-1.14.4.asar` 内的 package.json 同样声明 1.14.4。不能用 exe 文件版本排除自动更新后的应用版本；此前“1.14.4 是误读”的判断有误。
- 现用 vault 的纸纹片段为 `print-paper.css`（472KB，含浅色与深色两套），导出页边距已保存为 None（`margin: "1"`）。
- **0.2.0 已修复并验证 A4/A5 跨页留白。** 插件设置页提供跟随配色、逐页留白与四边独立毫米值，默认各 12 mm。真实原生导出浅深色共 182 页通过逐页文字位置检查；不代表所有纸张均已验证。
- 用户已确认本机导出测试通过。隔离库又完成 Obsidian 1.14.4 / Border / 两页 A4 的四种应用与环境配色组合；浅深色纸纹、正文、标题、链接、提示块、代码、表格均检查。
- 本仓库包含纸纹片段与独立发布的辅助插件，均为可选资源，不默认启用。没有复制整份日常库配置或任何笔记。

## 纸纹 CSS + 小型配色桥接插件

`print-paper.css` 只有一个文件，内部两个媒体块：

```css
@media print { /* 浅色：纸、字体、版心、配色 */ }
@media print and (prefers-color-scheme: dark) { /* 深色：只覆盖纸图与配色 */ }
```

深色块不重复定义位置和尺寸，直接继承浅色块的 `position / top / left / width / height`，只替换 `content` 与颜色变量。深色配色沿用 Border 主题 `.theme-dark` 的公式（`--text-normal: hsl(var(--accent-h), 15%, 85%)` 等），不另设色值。

### 启用桥接插件后：跟随 Obsidian

单独使用 CSS 时，`prefers-color-scheme` 查询环境偏好，不能独立跟随应用。`native-pdf-theme-bridge` 通过 Markdown 后处理接口，仅在原生 PDF 的临时文档中恢复当前应用主题，读取阅读模式元素的实际颜色，并修正临时文档中纸纹片段的媒体条件。源 CSS 不变。

| 环境偏好 | Obsidian | 实机导出 |
|---|---|---|
| 深色 | 深色 | 深色纸 |
| 浅色 | 浅色 | 浅色纸 |
| 深色 | 浅色 | 浅色纸 |
| 浅色 | 深色 | 深色纸 |

实机交叉测试在隔离实例中模拟环境颜色偏好，不改 Windows 设置；相同应用主题的 PDF 首屏图像在两种环境偏好下 SHA256 相同。使用真正的原生导出和 Electron PDF 接口，不经过系统打印机。

桥接不替换原生命令、不改安装包、不联网、不控制其他插件，仅保存自身 data.json 设置。取色副本排除样式、脚本与媒体资源，避免干扰阅读页面；使用后立即清理，异常时也清理。PDF 本身的图片等内容不被移除。配置工具（`configure-pdf-export.ps1`）仅管理页边距，不处理主题。

### 切换脚本

前一轮留下的 `E:\99_临时\obsidian-paper\toggle-theme.bat` 会修改 Windows 当前用户的颜色偏好。它不是跟随 Obsidian 的修复，本轮未执行，也不属于 config 的恢复流程。

### 为什么纯 CSS 不够

当前更新包（1.14.4）中的导出流程也存在以下步骤（下列为简化流程，不是逐字源码）：

```js
复制主窗口样式到新导出窗口;
await sleep(200);
导出窗口.document.body.removeClass("theme-dark");
导出窗口.document.body.addClass("theme-light");
```

直接依赖 `.theme-dark` 会在强制浅色后失效；现有片段又只按环境媒体查询选纸，所以不能承诺跟随应用主题。但“新文档完全拿不到主窗口状态”也不准确：当前包的样式复制函数 `y0` 会复制 head 中的 style/link，并传递 body 的自定义内联变量。

已实现的小插件在强制浅色之后的 Markdown 后处理阶段修正临时文档，而不是监听 Windows 或改写全局导出函数。实际禁用后探针数为零、阅读页面 HTML 不变，再启用成功。公开源码及安装包见 [native-pdf-theme-bridge](https://github.com/yunmin311/native-pdf-theme-bridge)，当前版本 0.2.0，作者 yunmin311；尚未进入社区市场。

`print-paper-dark.css` 已退役，移至 `E:\99_临时\obsidian-paper\print-paper-dark.retired.css`，仅作对照，不要重新启用。

## None 是否每次都要选？

不需要每次重选。Obsidian 会把选项保存在当前 vault 的 `.obsidian/app.json` 中，换 vault 或新设备恢复时需要重新确认。

对现用的满版纸纹方法，导出窗口的 **Margins → None** 是必要配套：纸纹不能越过 PDF 输出的页面裁剪区，CSS 的颜色保真选项也不能扩大该区域。None 在当前配置中对应 `pdfExportSettings.margin: "1"`，不是数字 `1`。

这不是所有纸质 PDF 方法的硬性要求。另一条路线是先用原生页边距排好正文，再用本地工具把纸纹铺到 PDF 底层；它有望让分页留白更可靠，但会多一道处理步骤。本轮没有实现这条替代路线，也不保证随意增加 `@page` 就能覆盖应用传给导出接口的参数。

## 启用前提

1. 完全退出 Obsidian 后，将本仓库 `.obsidian/snippets/print-paper.css` 复制到目标 vault 同名目录。
2. 将 `.obsidian/plugins/native-pdf-theme-bridge/` 中的 `main.js`、`manifest.json`、`README.md` 复制到目标 vault 同名插件目录。通用 `install.ps1` **不会安装此可选插件**，需手动复制。
3. 启动后在外观中启用 `print-paper`，在社区插件中启用 Native PDF Theme Bridge。现有启用清单不自动追加，不擅自改其他设置。
4. 在原生导出窗口选择 None；也可以完全退出 Obsidian 后，使用下面的独立工具恢复这一项。
5. 在设置 → Native PDF Theme Bridge 中选择是否跟随配色、是否逐页留白；四边默认各 12 mm，可独立设置 0–40 mm。
6. 导出实际笔记，检查每页四边、正文、公式、表格、代码和嵌入，不只检查第一张截图。

当前效果依赖本机字体：iA Writer Quattro S，以及该机器已有的方正屏显雅宋简体。缺失时会发生字体回退，不能承诺跨设备完全一致。字体应从作者或合法授权渠道取得，商业字体文件不随本仓库发布。

## 可选工具

工具要求 PowerShell 7.5 或更高版本，本轮测试使用 PowerShell 7.5.4 和 Pester 5.7.1。Windows 路径示例须在相应版本的 PowerShell 中运行，而不是系统自带的 Windows PowerShell 5.1。未承诺旧版 PowerShell 的兼容性。

默认只检查，应用运行时也可执行，不写任何文件：

```powershell
pwsh -NoProfile -File .\scripts\configure-pdf-export.ps1 -VaultPath "E:\1obsidian\Obsidian Vault" -Mode Check
```

完全退出 Obsidian 和其他配置写入工具后应用：

```powershell
pwsh -NoProfile -File .\scripts\configure-pdf-export.ps1 -VaultPath "E:\1obsidian\Obsidian Vault" -Mode Apply
```

首次有变化时，结果中的 `BackupPath` 是本次备份目录，请保留。已经是 None 时不改写文件、不新增备份，`ChangeRequired` 为 false。

工具只合并 `pdfExportSettings.margin`，不改纸张、方向、缩放、标题、笔记链接设置或插件配置。JSON 的缩进格式可能变化，其他字段的值必须保留。

WSL 中用 Linux 版 `pwsh`，将路径改为 `/mnt/e/1obsidian/Obsidian Vault`。仅 Windows 进程检查交给 Windows 原生 PowerShell；检测失败时拒绝写入，不提供强制绕过选项。

## 关闭与撤销

三个独立开关都需要考虑：

1. 外观 → CSS 代码片段 → 关闭 `print-paper`。
2. 页边距恢复到你原来的选择，**不一定是 Default**。
3. 关闭 Native PDF Theme Bridge，恢复原生配色行为。只关插件、不关纸纹时，纸色重新由环境偏好决定。

如果本次曾使用工具 Apply，完全退出应用后，可以用对应的备份目录恢复该字段原值：

```powershell
pwsh -NoProfile -File .\scripts\configure-pdf-export.ps1 -VaultPath "E:\1obsidian\Obsidian Vault" -Mode Restore -BackupPath "E:\1obsidian\Obsidian Vault\.obsidian\.print-paper-backups\本次返回的目录名"
```

Restore 不是整份文件回滚。它保留后来新增的其他字段；原来没有 margin 则仅删除该字段，原来是 null 则恢复 null。不会删除整个导出对象或 app.json，因此原先不存在的文件/对象可能留下空对象。若 margin 已被手动改成其他值，工具拒绝自动恢复，应自行确认原意。

若 Apply 时已是 None，工具没有产生备份，也就不能猜测你更早使用的页边距。请手动在导出窗口选择合适的值。

备份在 `.obsidian/.print-paper-backups/`，包含原始 app.json 和校验清单。目录内新建的 `.gitignore` 用于避免误提交；备份可能包含个人偏好，不应公开上传。它不是整个 vault 的备份。

## 安全边界

- JSON 损坏、根对象或导出对象类型不对、未知模板版本、备份损坏或来自其他 vault 时拒绝操作。
- Apply 和 Restore 要求 Obsidian 已完全退出；Check 不要求退出。
- 写前备份，替换前复核读取时的哈希，使用同目录临时文件替换，写后检查内容；拒绝已知的符号链接/重解析配置路径。
- 哈希复核不能消除所有跨进程竞争窗口。必须停止应用及其他配置写入者，不能把此工具视为跨进程事务锁。
- 出错时不自动覆盖当前文件“恢复”，以免抹掉同时产生的新设置；保留备份再调查。
- `app.json` 继续被 config 的 Git 忽略。`install.ps1` 不复制整份 app.json，也不调用此工具。

## 分页与素材说明

当前纸纹源文件为 1700×1700 PNG，CSS 中固定纸层覆盖约 450×450mm，偏移 -10mm；旧材料里的 794×1123、-20mm 不代表这版实际值。

旧片段根容器 padding 为 9.9mm，单独使用不保证逐页重复。0.2.0 在导出副本中只指定一个根盒子，用 `box-decoration-break: clone` 重复四边内边距，并清掉嵌套正文的旧 padding，避免重复缩进。默认改为各 12 mm，不改源片段。关闭逐页留白则回到原片段规则。

真实 Obsidian 已验证 A4 浅/深各 30 页、A5 浅/深各 61 页，共 182 页，含长段落、普通代码块与表格；第二页纸纹铺满纸边。A3/Legal/Letter/Tabloid、横向、复杂嵌入及超高不可拆内容仍需单独验收，不把普通浏览器测试当作这些场景的实机通过证明。逐页留白需 Chromium 130+；旧内核保留原分页并在设置页提示更新 Obsidian 安装程序。

满版纹理适合屏幕阅读，物理打印耗墨。超宽表格、长代码、不可拆高图可能溢出；当前不承诺任意内容、任意纸张都不会裁切。

## 自动化测试

桥接插件源码目录运行 `npm test`：7 项通过，覆盖应用/环境配色四组合、普通文档隔离、纸色选择、嵌入资源隔离、异常清理、设置保存、独立开关、旧内核回退与实际 Chromium PDF 跨页留白。公开证据见 [验证记录](https://github.com/yunmin311/native-pdf-theme-bridge/blob/main/docs/validation.md)，config 留档见 [本轮审查](pdf-theme-review-2026-10-21.md)。

安装 Pester 5 后，在仓库目录运行：

```powershell
pwsh -NoProfile -Command 'Invoke-Pester ./scripts/tests/configure-pdf-export.Tests.ps1 -Output Detailed -CI'
```

测试只写临时 fixture vault，不修改日常 vault。进程检查在单元测试中被替换为可控条件；真实 Windows 进程检查需另行执行。脚本测试通过不能代替实际 PDF 的视觉验收。
