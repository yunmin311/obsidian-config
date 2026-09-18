# 任务：为 4 个 Obsidian 插件拍摄上架用截图

> **这是一份自包含任务书。执行者不需要任何先前上下文 —— 以下内容就是全部背景。**
> 请从头读到尾再动手。带 ⚠️ 的是会造成不可逆后果的红线。

---

# 0. 背景：为什么要做这件事

有人（下称"作者"）开发了 4 个 **Obsidian 插件**，正在把它们发布到
**Obsidian 官方社区插件目录**（`https://community.obsidian.md`，全世界 Obsidian 用户
在软件内搜索安装插件的唯一官方渠道）。

其中 1 个已经上架（Quiet Shelf），另外 3 个待上架。

**问题**：已上架的 Quiet Shelf 在目录上的详情页**一张图都没有** —— 只有文字。
和别的成熟插件一比，显得非常不专业，直接影响用户是否愿意安装。

**本任务：为这 4 个插件产出可上架用的截图素材。**
截图最终有**两个去处**（规格不同，都要出）：

| 去处 | 用途 | 规格 |
|---|---|---|
| **A. 目录后台的截图栏** | 用户在 `community.obsidian.md` 看到的插件图集 | **1200×800**，最多 5 张/插件 |
| **B. 仓库 README 里的插图** | GitHub 页面 + 目录页 Overview 区（渲染 README） | 宽 1200px 即可 |

**你只负责产图。** 裁剪、标注、入 README、上传后台等后续工作由作者/其他人完成。
但你必须**按规格产出、按规则命名、放到指定目录**，否则后续无法使用。

---

# 1. 环境与绝对路径（照抄，不要猜）

| 名称 | 绝对路径 |
|---|---|
| Obsidian 程序 | `E:\APP\Obsidian\Obsidian.exe` |
| **作者的正式 vault（⚠️ 绝对不要用它截图）** | `E:\1obsidian\Obsidian Vault` |
| 4 个插件的源码/成品目录 | `E:\1project\quiet-shelf-obsidian\` 等，见下 |
| **建议的演示 vault 位置（你新建）** | `E:\1project\_scratch\plugin-demo-vault\` |
| **截图输出目录（你新建）** | `E:\1project\_scratch\plugin-screenshots\` |

四个插件的目录与「插件 ID」（= Obsidian 里的安装目录名，务必一致）：

| 插件名 | 仓库目录 | 插件 ID（目录名） | 版本 |
|---|---|---|---|
| Quiet Shelf | `E:\1project\quiet-shelf-obsidian\` | `quiet-shelf` | 0.1.0 |
| Reading Rail Sidebar | `E:\1project\reading-rail-sidebar-obsidian\` | `reading-rail-sidebar` | 0.1.1 |
| Toolbar Pin Toggle | `E:\1project\toolbar-pin-toggle-obsidian\` | `toolbar-pin-toggle` | 1.0.1 |
| Zheng Tally | `E:\1project\zheng-tally-obsidian\` | `zheng-tally` | 1.0.2 |

⚠️ **Zheng Tally 的成品不在仓库根目录，只在 `dist\` 子目录里。** 另外三个在根目录。

---

# 2. 能力检查（先做这一步，决定走哪条路线）

Obsidian 是**桌面原生程序**，不是网页。**浏览器自动化工具（Playwright / agent-browser 等）
无法操作它。**

- **如果你能操作 Windows 原生 GUI**（有鼠标/键盘控制、能截图整个窗口）
  → 走 **路线一：直接执行**（第 3 节起）
- **如果你只能操作浏览器 / 命令行**
  → 走 **路线二**：不要硬做。改为
  (a) 把第 3–7 节整份交给作者，请他手动截图；
  (b) 你负责第 8 节之后的**后期处理**（裁剪、统一尺寸、压缩、必要时合成 GIF）。
  → 明确告诉作者"我无法操作原生程序，需要你手动截图"。

**不要**用 HTML/CSS 仿造 Obsidian 界面冒充截图。那是示意图不是截图，用在插件市场属于误导。

---

# 3. 准备演示 vault（⚠️ 隐私红线在这一节）

## 3.1 为什么必须新建演示 vault

插件市场的详情页是**公开网页**，会被搜索引擎和爬虫收录，且**永久存在**。
如果用了作者的正式 vault，那么**所有笔记的文件夹名、文件名、正文内容都会永久公开**。

⚠️ **这不是"尽量注意"级别的建议，是硬性要求。**
不要图省事去 `E:\1obsidian\Obsidian Vault` 里截图 —— 那个 vault 里有大量个人笔记。

## 3.2 建立步骤

1. 打开 Obsidian（`E:\APP\Obsidian\Obsidian.exe`）
2. 在 vault 选择界面点 **"Create new vault"**（创建新仓库）
3. Vault name 填 `plugin-demo-vault`
4. Location 选 `E:\1project\_scratch`
5. 点 **Create**
6. ⚠️ **不要**打开"作者的正式 vault"

## 3.3 ⚠️ 演示 vault 的关闭安全设置

新 vault 建好后，先做这两件事：

1. 关闭同步/发布之类会外传的功能（新 vault 默认就没有，确认一下即可）
2. **不要登录任何账号**

---

# 4. 安装插件到演示 vault

## 4.1 复制插件文件

对每个插件：在 `<演示vault>\.obsidian\plugins\<插件ID>\` 下建目录，然后复制文件。

| 源目录 | 要复制的文件 | 目标目录 |
|---|---|---|
| `E:\1project\quiet-shelf-obsidian\` | `main.js`、`manifest.json`、`styles.css` | `…\plugins\quiet-shelf\` |
| `E:\1project\reading-rail-sidebar-obsidian\` | 同上三个 | `…\plugins\reading-rail-sidebar\` |
| `E:\1project\toolbar-pin-toggle-obsidian\` | 同上三个 | `…\plugins\toolbar-pin-toggle\` |
| `E:\1project\zheng-tally-obsidian\` | ⚠️ **`dist\` 里的**这三个 | `…\plugins\zheng-tally\` |

⚠️ `styles.css` 必须一起复制。缺了它界面会掉样式，截出来是坏的。

## 4.2 启用插件

在 Obsidian 里：
1. 按 `Ctrl` + `,`（或点左下角齿轮）打开 **Settings**
2. 左侧选 **Community plugins**（社区插件）
3. 如果提示受限模式，点 **Turn on community plugins**
4. 在 **Installed plugins** 列表里找到刚复制的插件 → 打开右侧开关
5. 四个都这样启用

## 4.3 ⚠️ Toolbar Pin Toggle 有一个额外依赖

`toolbar-pin-toggle` **依赖另一个社区插件 `Editing Toolbar`**，没有它什么都做不了。

安装方法：Settings → Community plugins → **Browse** → 搜索 `Editing Toolbar`
→ Install → Enable。（这是公开插件，联网即可装。）

**顺序**：先装好 Editing Toolbar，再启用 toolbar-pin-toggle。

---

# 5. 造演示内容（每个插件需要不同的东西）

**内容全部用占位文字**，例如：

```
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
这里是演示用的占位段落，不包含任何真实信息。
```

⚠️ **禁止**出现：真实人名、学校名、公司名、邮箱、电话、地址、真实聊天记录、私人待办。

## 5.1 给 `quiet-shelf` 准备

1. 在左侧文件树里新建 8–12 个文件夹，每层放 2–3 个 `.md`
2. 其中 3 个文件夹命名为：`Archive/`、`Reading/`、`Inbox/`
3. 再建 2 个文件：`readme.md`、`inbox.md`
4. 让文件树**展开 2 层**，看起来有层次

## 5.2 给 `reading-rail-sidebar` 准备

1. 新建 1 个长笔记，例如 `Demo Article.md`
2. 里面写 **8–10 个二级标题**（`## Section One` …），每个标题下放**长短不一**的段落
   （有的 2 行、有的 15 行）—— 这样右侧刻度条才能看出长短起伏
3. 打开这篇笔记，切到**阅读视图**（右上角书本图标）

## 5.3 给 `toolbar-pin-toggle` 准备

1. 打开任意一篇有内容的笔记
2. 确认 `Editing Toolbar` 已启用（否则底部/顶部工具条不会出现）
3. 让光标进入正文，使工具条显示出来

## 5.4 给 `zheng-tally` 准备

1. 新建 `Tally Demo.md`
2. 写几行普通文字，例如 `1. Gym：` 之类的中性短句
3. 只缺 1 张动图（见第 7 节）

---

# 6. 截图规范

## 6.1 窗口与画面

| 项 | 要求 |
|---|---|
| **成品尺寸** | **桌面图 1200×800**（这是目录后台的硬性要求） |
| 窗口设置 | 把 Obsidian 窗口调到大约 1200×800，最大化**不要**用。截完图裁到正好 1200×800 |
| 缩放 | Obsidian 缩放保持 **100%** —— 不要为了"显得满"调到 150% |
| 主题 | 先出**深色**（插件市场默认深色）。作者若要浅色版，同场景再出一份 |
| 字体 | 用 Obsidian **默认**字体。不要用作者的自定义字体，否则和用户实际观感不符 |

## 6.2 画面卫生

截图里**不能出现**：

- 鼠标指针
- 系统通知弹窗、微信/QQ 弹窗、时间戳水印
- 窗口标题栏里的**完整路径**（会暴露用户名，如 `C:\Users\xxx\…`）
- 任何其他个人插件的图标/按钮（演示 vault 只装本任务涉及的插件）
- 未完成/报错的红色提示

## 6.3 格式与命名

| 项 | 要求 |
|---|---|
| 格式 | PNG（细线/图标更锐）；单张超 3MB 再转 WebP |
| 单张大小 | **≤ 5MB** |
| 命名 | `<插件ID>-<场景>.png`，全小写、连字符。例：`quiet-shelf-hidden-tree.png` |
| 输出位置 | 全部放 `E:\1project\_scratch\plugin-screenshots\` |

---

# 7. 场景清单（每个插件拍什么 + 在界面哪里找）

界面位置速查：

- **左侧栏（文件树）**：窗口最左侧竖排图标里，第一个就是
- **右侧栏**：窗口最右侧。没开的话按 `Ctrl` + `Shift` + `R`，或点右上角面板图标
- **命令面板**：按 `Ctrl` + `P`
- **设置**：`Ctrl` + `,`
- **底部工具条**：窗口底部、状态栏上方的一条按钮

## 7.1 `quiet-shelf`（暗格）—— 3–4 张

| 文件名 | 怎么做出这个画面 | 画面里要能看到 |
|---|---|---|
| `quiet-shelf-hidden-tree.png` | 打开左栏文件树，把 `Archive/`、`Reading/` 用插件功能「收起」（命令面板搜 "Quiet Shelf" 找相关命令）。鼠标移开 | `Archive/`、`Reading/` **不在**树里，其余文件夹正常显示 |
| `quiet-shelf-panel.png` | 命令面板搜 "Open shelf panel" 打开管理面板 | 面板里的"已收起/未收起"两组与勾选项 |
| `quiet-shelf-focus.png` | 选中 2 个文件夹后开启聚焦（命令面板搜 "Toggle focus"） | 只有选中组及其祖先/后代可见，其余消失 |
| `quiet-shelf-settings.png`（可选） | 设置 → 左侧找 Quiet Shelf | 插件的设置项 |

## 7.2 `reading-rail-sidebar`（轨道）—— 3 张

| 文件名 | 怎么做出这个画面 | 画面里要能看到 |
|---|---|---|
| `reading-rail-panel.png` | 打开右侧栏，切到「轨道」面板 | 进度百分比、当前标题、标题大纲 |
| `reading-rail-ticks.png` | 打开 5.2 的长笔记（阅读视图），裁右侧区域 | 刻度**长短不一**的起伏 + 当前位置高亮 |
| `reading-rail-reading-view.png` | 阅读视图整页 | 正文 + 右侧刻度条同时入镜，交代它在哪里 |

## 7.3 `toolbar-pin-toggle` —— 2–3 张

| 文件名 | 怎么做出这个画面 | 画面里要能看到 |
|---|---|---|
| `toolbar-pin-bottom.png` | 设置里 Pin mode 选 "Fixed bottom toolbar"，命令面板执行 "Toggle toolbar pin" 打开它 | 底部工具条可见（非编辑聚焦状态也在） |
| `toolbar-pin-top.png` | Pin mode 改 "Top toolbar"，再执行一次命令 | 顶部工具条可见 |
| `toolbar-pin-settings.png`（可选） | 设置 → Toolbar Pin Toggle | Pin mode 下拉 |

## 7.4 `zheng-tally` —— 已有 5 张静态图，**只缺 1 张动图**

| 文件名 | 内容 |
|---|---|
| `zheng-tally-counting.gif` | 见下节 |

---

# 8. 动图怎么录（Zheng Tally）

**用录屏工具，不要逐帧截图**（逐帧会丢帧、光标不连贯）。

推荐 **ScreenToGif**（Windows 免费开源）。步骤：

1. 打开 ScreenToGif → **Recorder**
2. 录制区域设为 **1200×800**（拖动边框对齐 Obsidian 内容区）
3. 点 **Record**
4. 在笔记里依次按：
   - `Alt` + `Z`（起一个计数）
   - `Space` **按 5 次**（正好写完一个「正」字）
   - 再按 2 次（第二组的前两笔）
   - `Enter`（提交）
5. 点 **Stop**
6. 在编辑器里：删掉开头结尾的多余帧（保留 3–4 秒即可）
7. **Save as** → GIF → 宽度设 **1200px**

**成品要求**：GIF，宽 1200px，**控制在 3MB 以内**，不超过 5MB。
超过就裁掉无关区域或降帧率（12–15fps 足够）。

---

# 9. 交付

## 9.1 文件

全部放 `E:\1project\_scratch\plugin-screenshots\`，命名见上文。清单：

```
quiet-shelf-hidden-tree.png        1200x800
quiet-shelf-panel.png              1200x800
quiet-shelf-focus.png              1200x800
reading-rail-panel.png             1200x800
reading-rail-ticks.png             1200x800
reading-rail-reading-view.png      1200x800
toolbar-pin-bottom.png             1200x800
toolbar-pin-top.png                1200x800
zheng-tally-counting.gif           宽 1200
```

## 9.2 交付说明（必须附上）

写一段简短说明，包含：

1. 每张图对应第 7 节的哪一项
2. 用的是**深色**还是**浅色**主题
3. 哪些场景**没做成**，以及原因（例如"Editing Toolbar 装不上"）
4. 若走了路线二（没做成），明确说明"需要作者手动截图"

## 9.3 交付前自检（逐条打勾）

- [ ] 每张图**精确**是 1200×800（动图除外）
- [ ] 每张都 **≤ 5MB**
- [ ] 文件名与第 9.1 节完全一致（大小写、连字符）
- [ ] 画面里**没有**真实笔记内容、真实人名/学校/公司/邮箱/电话
- [ ] 画面里**没有**鼠标指针、系统弹窗、时间戳
- [ ] **没有**暴露 `C:\Users\…` 之类的本机路径
- [ ] 演示 vault 里没有装其他个人插件
- [ ] 深色主题下截图，缩放 100%
- [ ] GIF 宽度 1200、体积 ≤5MB
- [ ] 第 9.2 节的说明已写

---

# 10. 绝对不要做的事

- ❌ 用 `E:\1obsidian\Obsidian Vault`（作者正式 vault）截图 —— **这是最严重的一条**
- ❌ 让真实笔记的标题/正文进入任何一张图
- ❌ 用 HTML/CSS 仿造界面冒充截图
- ❌ 拉伸图片凑成 1200×800（会变形）—— 应该裁切或补同色背景
- ❌ 上传/发布任何东西。**你只产图**，不做后续动作
- ❌ 修改 `E:\1project\` 下任何插件的源码或仓库（那是别人的代码）
- ❌ 在演示 vault 里登录账号、开启同步
