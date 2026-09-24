# 发布指南：把可发布的资产拆成独立仓库

> **历史方案（2026-09-17），不是当前状态清单。** 插件数量、版本和上架状态已变化；
> 当前恢复与同步方式见 [README](../README.md) 和 [插件设置说明](plugins.md)。

> 更新日期：2026-09-17　·　仓库：`yunmin311/obsidian-config`（public）
> 文中关于社区市场的规则均核对过官方文档与 `obsidianmd/obsidian-releases` 的说明，非记忆。

---

## 0. 现状：仓库里到底有什么

`obsidian-config` 目前跟踪 52 个文件，混装了四类性质完全不同的东西：

| 类别 | 内容 | 数量 | 该不该发布 | 归宿 |
|---|---|---|---|---|
| **① 自研插件** | `quiet-shelf` / `reading-rail-sidebar` / `toolbar-pin-toggle` / `zheng-tally` | 4 | ✅ 完全可以 | **各自独立仓库**（config 里留备份副本） |
| **② 自写 CSS 片段** | `tree-indent` `dense-reading` `pin-spacing` `border-polished` `dark-paper-texture` `graph-blue-gray` `blue-gray-dark-fix` `hide-embed-titles` `hide-editing-toolbar` `baseline-optimized.minimal` | 10 | ✅ 可以（作为片段合集） | 留在本仓库 |
| **③ 配置框架** | `appearance.json` `hotkeys.json` `community-plugins.json` + 第三方插件 `data.json` + 文档 | — | ✅ 已在发布（就是本仓库） | 保持 |
| **④ 运行时状态** | `flexplorer` / `crisp-file-explorer` 的 `data.json` | — | ❌ 已排除 | 保持排除 |

**核心问题**：①和③挤在一个仓库里，导致
- 别人要装你的插件，得 clone 整个配置仓库（里面还有 Crisp 授权码、上千条笔记路径）
- 插件没有 Release，别人无法用 BRAT 安装，更进不了社区市场
- 插件版本和"配置备份"的版本混在一个 commit 流里，无法单独追溯

**解决**：源码搬到独立仓库并各自发 Release；config 里保留一份副本纯粹为了「换机器一份恢复全部」，
不再作为插件源码使用。两边由 `scripts\sync-plugins.ps1` 单向同步并校验一致。

---

## 1. 目标：只有插件单独出仓库，其余仍在 config

配置仓库 `obsidian-config` **保持不变** —— 主题、CSS 片段、第三方插件设置、文档都还在这一个仓库里，
不必拆。要单独提走的**只有四个自研插件**（只有它们才谈得上被别人"安装"、才够格进市场）。

> **config 仓库里仍然保留插件本体三件套**（白名单放行），职责是「换机器时一份恢复全部」。
> 这不与"插件单独出仓库"冲突 —— 源码真身在插件仓库，config 里是备份副本，
> vault 里是运行副本，三处由 `scripts\sync-plugins.ps1` 一次同步。
> 当初考虑过把插件从 config 里摘干净，结论是**没必要**：多一份廉价备份不花成本，
> 而摘掉之后换机器就得先去 GitHub 找四个仓库，反而多一步。

### 位置：跟你的其他项目平级

`E:\1project\` 下面 30 个项目，**清一色的约定**：**本地目录名 == GitHub 仓库名**
（`pixel-panels` → `yunmin311/pixel-panels.git`，一个个都对得上）。插件也照这条办：

```
E:\1project\
  zheng-tally-obsidian\              ← 你已发布的同款插件，现成模板
  quiet-shelf-obsidian\              ← 新建（源码唯一真身）
  reading-rail-sidebar-obsidian\     ← 新建
  toolbar-pin-toggle-obsidian\       ← 新建
  obsidian-config\                   ← 配置仓库，保持不变

E:\1obsidian\Obsidian Vault\.obsidian\plugins\<id>\     ← 运行副本（脚本同步过去）
```

**命名是 `<插件 id>-obsidian` 后缀，不是 `obsidian-` 前缀。**
依据是你自己的先例 `zheng-tally-obsidian` —— manifest 里 `id: "zheng-tally"`，
仓库名加 `-obsidian` 后缀。**和自己已有项目保持一致，比跟社区多数派一致更重要。**

> 顺带：`zheng-tally` 目前**还不在官方目录**（查过 `community-plugins.json`，7717 条里没有）。
> 所以这次提 PR 是你第一次走官方审核，更该照着自己已经跑通的那套骨架来。

### 照抄 zheng-tally-obsidian 的骨架

那个仓库已经是完整形态，直接复用除构建以外的部分：

| 文件/目录 | zheng-tally 有 | 我们的插件 |
|---|---|---|
| `manifest.json` | ✅ `authorUrl: "https://github.com/yunmin311"` | ✅ 照抄，补同一个 `authorUrl` |
| `README.md` | ✅ 首屏即产品页（徽章 + 动图 + Why + How it works） | ✅ 市场详情页抓的就是它，值得认真写 |
| `LICENSE` | ✅ MIT | ✅ **政策硬要求** |
| `CHANGELOG.md` | ✅ | ✅ 建议有，用户看版本记录 |
| `versions.json` | ✅ `{"1.0.0":"1.5.12"}` | ⭕ 提高 `minAppVersion` 时才需要 |
| `.github/workflows/` | ✅ CI（lint / typecheck / test / build） | ✅ 换成 release workflow，见 §4.4 |
| `.gitignore` | ✅ `node_modules/ dist/ *.log` | ✅ 再加一条 `data.json` |
| `src/` + `esbuild` + `dist/` | ✅ TypeScript 构建 | ❌ **不照抄**，见下 |

### 无构建 vs TypeScript：保持现状

你的三个插件是**纯 JS、手写 `main.js`、直接 `require("obsidian")`**，没有构建步骤；
zheng-tally 是 TypeScript + esbuild。**建议保持纯 JS 无构建**：

- 官方市场只认 Release 里的三件套，**不要求 TS，也不要求构建**
- 这三个插件刚调完好几轮（尤其 `reading-rail-sidebar` 的刻度算法），现在重写风险远大于收益
- 没有 `dist/` 这一层，仓库里的 `main.js` 就是源文件，改完直接同步进 vault 验证，链条最短

代价是没有类型检查和 lint —— 插件结构简单且已实机反复验证过，可接受。

### ⚠️ 不要用 submodule（理由已更新）

之前文档里写的"E 盘嵌套 git 引用不落盘"是**错的，已实测证伪**：
`work-capsule` 的 `.git/refs/heads/codex/` 目录就好端端在盘上。
（`work-capsule-local-obsolete`、`creative-os-canonical-fact-adoption` 也都 checkout
在 `feat/xxx`、`codex/xxx` 这样的嵌套分支上。）真正不用的理由是：

1. Obsidian 需要插件是 **vault 里 `.obsidian\plugins\<id>\` 的真实文件**；
   submodule 只解决"源码归属"，不解决"同步进 vault" —— 反正还得配一个脚本
2. 多一层间接（config 仓库 → submodule → vault）却不省掉任何一步，纯增心智负担
3. vault 里 `project/` 下那两个内嵌仓库的 fatal 是真麻烦，但根因是**缺 `.gitmodules`**，与 E 盘无关

**改用「源码仓库 + 单向同步脚本」**（见 §6）。

---

## 2. 插件仓库需要哪些文件

| 文件 | 必须 | 说明 |
|---|---|---|
| `manifest.json` | ✅ | 插件身份证，字段规则见 §3 |
| `main.js` | ✅ | 发布产物 |
| `styles.css` | ⭕ | 有样式就必须一起挂到 Release，否则用户端样式不更新 |
| `README.md` | ✅（事实必须） | **市场详情页直接从仓库根抓 README.md** 展示，没有就是空白页 |
| `LICENSE` | ✅ | MIT 即可，与本仓库保持一致 |
| `versions.json` | ⭕ | 只有在**提高 `minAppVersion`** 时才需要，用来给老版本 Obsidian 兜底 |
| `.gitignore` | ⭕ | 排除 `data.json`（含用户笔记路径，属运行时状态） |

---

## 3. manifest.json 规则（官方口径）与现状检查

| 字段 | 规则 | `quiet-shelf` | `reading-rail-sidebar` | `toolbar-pin-toggle` |
|---|---|---|---|---|
| `id` | 仅小写字母和连字符；**不能含 `obsidian`**；**不能以 `plugin` 结尾** | `quiet-shelf` ✅ | `reading-rail-sidebar` ✅ | `toolbar-pin-toggle` ✅ |
| `name` | 简短；**不能含 `Obsidian` 或 `Plugin`**；仅基本拉丁字符 | `Quiet Shelf` ✅ | `Reading Rail Sidebar` ✅ | `Toolbar Pin Toggle` ✅ |
| `version` | 语义化 `x.y.z` | `0.1.0` ✅ | `0.1.0` ✅ | `1.0.0` ✅ |
| `minAppVersion` | 与所用 API 匹配，不确定就填当前稳定版 | `1.4.0` ✅ | `1.4.0` ✅ | `1.4.0` ✅ |
| `description` | ≤ 250 字符；**结尾句号**；无 emoji/特殊字符 | 73 字 ✅ | 49 字 ✅ | 44 字 ✅ |
| `author` | 必填 | `yunmin311` ✅ | ✅ | ✅ |
| `authorUrl` | 选填，建议填 | ❌ **缺** | ❌ **缺** | ❌ **缺** |
| `isDesktopOnly` | 用了 Node/Electron API 必须 `true` | `false` ✅（纯公开 API，无 fs/os/electron） | ✅ | ✅ |
| `fundingUrl` | 不接受赞助就不要写（写了却非赞助链接会违规） | 无 ✅ | 无 ✅ | 无 ✅ |
| **命令 id** | **不能带插件 id 前缀**（Obsidian 会自动加） | `open-shelf` 等 7 个 ✅ | `open-rail-panel` 等 3 个 ✅ | `toggle-pin` ✅ |

**结论**：三个插件的 id / name / description / 命令 id **全部合规**，只差三件事：
补 `authorUrl`、补 `README.md`、补 `LICENSE`。

> 中文 description 以 `。` 结尾。官方原文要求 "End with a period `.`"，中文语境下 `。` 是对应写法；若审核被挑，改成半角 `.` 即可，一行的事。

---

## 4. 落地步骤（以 `reading-rail-sidebar` 为例）

### 4.0 前置：gh CLI 还没登录（本机实测 2026-09-17）

```bash
$ gh auth status
You are not logged into any GitHub hosts. To log in, run: gh auth login
```

`git push` 能通是因为走的是 **https + 凭据管理器**（已缓存），但 `gh` 是**另一套凭据**，
不登录则 `gh repo create` / `gh release create` 全部失败。二选一：

- **A（推荐，一次搞定）**：`gh auth login` → GitHub.com → HTTPS → 浏览器授权 → 之后本节所有命令可直接跑
- **B（不动环境）**：全部改用网页操作 —— 在 github.com 手动 New repository，
  在 Releases → Draft a new release 手动上传三个文件并填同名 tag

### 4.1 建仓库

```bash
# 名字：<id>-obsidian 后缀（沿用你自己的 zheng-tally-obsidian），
#       本地目录名与仓库名一致 —— 你和 E:\1project 下 30 个项目一个规矩。
# manifest 里的 id 保持原样（id 里不许出现 obsidian，仓库名可以）。
gh repo create yunmin311/reading-rail-sidebar-obsidian --public --license MIT
```

### 4.2 初始化目录并推第一版

```bash
mkdir -p /e/1project/reading-rail-sidebar-obsidian
cd /e/1project/reading-rail-sidebar-obsidian
git init && git remote add origin https://github.com/yunmin311/reading-rail-sidebar-obsidian.git

# 从配置仓库把三件套搬过来 —— 这是「源码从哪来的」；
# 搬完配置仓库里那份【保留】，它是备份副本，由脚本负责保持一致。
cp "/e/1project/obsidian-config/.obsidian/plugins/reading-rail-sidebar/main.js" .
cp "/e/1project/obsidian-config/.obsidian/plugins/reading-rail-sidebar/manifest.json" .
cp "/e/1project/obsidian-config/.obsidian/plugins/reading-rail-sidebar/styles.css" .

# 补 authorUrl —— 与 zheng-tally-obsidian 保持同一个值
# manifest.json 里加一行："authorUrl": "https://github.com/yunmin311"

# 写 README.md（必写：市场详情页就是抓它）、CHANGELOG.md
# LICENSE 已由 --license MIT 生成
# .gitignore 加一条 data.json

git add -A && git commit -m "feat: initial release 0.1.0"
git branch -M main && git push -u origin main
```

### 4.3 打第一个 Release

```bash
# ⚠️ tag 必须与 manifest.json 里的 version 【完全一致】，不要加 v 前缀
gh release create 0.1.0 main.js manifest.json styles.css --title "0.1.0" --notes "首个公开版本"
```

官方的拉取机制（照抄 README 原文要点）：
- 市场读 `community-plugins.json` 拿列表
- 详情页抓你**仓库根**的 `manifest.json` + `README.md`
- 安装时按 `manifest.json` 里的 version 去找**同名 tag 的 Release**
- 从 Release 下载 `manifest.json` / `main.js` / `styles.css`

### 4.4 用 GitHub Actions 自动打 Release（强烈建议）

手动打 Release 迟早漏东西 —— 你自己的 `zheng-tally-obsidian` 里就已经漂出
`1.0.1` 和 `v1.0.1` **两个 tag 并存**（带 v 前缀那个市场找不到）。

放一份 `.github/workflows/release.yml`，以后只需两步：**改 manifest version → 打同名 tag → push**，
剩下全自动，而且**会校验 tag 与 manifest 是否一致**，不一致直接失败：

```yaml
name: Release plugin

on:
  push:
    tags: ["*"]

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Read version from manifest
        id: ver
        run: echo "version=$(node -p "require('./manifest.json').version")" >> "$GITHUB_OUTPUT"

      - name: Tag must equal manifest version
        run: |
          if [ "${{ github.ref_name }}" != "${{ steps.ver.outputs.version }}" ]; then
            echo "tag=${{ github.ref_name }} 与 manifest version=${{ steps.ver.outputs.version }} 不一致"
            exit 1
          fi

      - name: Create release
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh release create "${{ github.ref_name }}" \
            --title "${{ github.ref_name }}" \
            --generate-notes \
            manifest.json main.js styles.css
```

这样 `styles.css` 漏传的问题从机制上消失（写死在工作流里）。

---

## 5. 版本规则（最容易踩的坑）

| 坑 | 后果 | 做法 |
|---|---|---|
| **改了代码但没 bump version** | 用户端**永远收不到更新**（Obsidian 靠 version 判断新旧） | 每次改动都 `version` +1，再打同名 tag |
| tag 写成 `v0.1.1` | 找不到 Release，安装失败 | tag 严格等于 version，不带 `v` |
| 只传 `main.js` 忘了 `styles.css` | 样式不更新，且旧样式残留 | 三个文件一起挂 |
| 直接改高 `minAppVersion` | 老版本 Obsidian 用户装不上 | 同时维护 `versions.json` 做版本映射 |
| 仓库根没 README | 市场详情页一片空白 | 建仓库时就写 |

---

## 6. 与现有工作流衔接（避免三份 main.js 漂移）

源码搬到独立仓库后，**唯一真身是 `E:\1project\<id>-obsidian\`**。
下游有两个副本，都由脚本一次同步：

| 副本 | 路径 | 作用 |
|---|---|---|
| **运行副本** | `E:\1obsidian\Obsidian Vault\.obsidian\plugins\<id>\` | Obsidian 真正加载的那份，Reload 后生效 |
| **备份副本** | `E:\1project\obsidian-config\.obsidian\plugins\<id>\` | 随 config 仓库备份，换机器时一份恢复全部 |

`scripts/sync-plugins.ps1` 的真实形态（比早期草稿多了几层保护）：

```powershell
param(
    [string]  $VaultPath  = "E:\1obsidian\Obsidian Vault",
    [string]  $ConfigPath = "E:\1project\obsidian-config",  # 传 "" 则只同步 vault
    [string]  $SrcRoot    = "E:\1project",
    [string[]]$PluginId,                                    # 只同步指定插件
    [switch]  $DryRun                                       # 只打印，不复制
)
```

关键行为：

- **复制前校验 `manifest.json` 的 `id` 与目标目录名一致** —— 对不上插件会装上但加载不了，
  且报错很难懂，所以直接跳过并告警
- **只复制三件套**（`main.js` / `manifest.json` / `styles.css`），
  **`data.json` 永不触碰** —— 各副本的设置互不干扰
- `styles.css` 缺失不算错误（`zheng-tally` 就没有，样式内联在 TS 里）
- **复制完再按 SHA256 逐字节复核**「源码 ↔ vault ↔ config」，不一致就列出来并 `exit 2`。
  手工 `cp` 过、或改了源码忘了跑脚本时，这里会立刻暴露
- 试运行开关叫 `-DryRun`，**刻意不叫 `-WhatIf`** —— 那是 `[CmdletBinding()]` 的保留参数名，
  拿它当普通变量名会让脚本在 `param` 之后静默退出（踩过：日志一片空白，查了半天）

```powershell
# 日常：改完源码跑这个，两个副本一起更新 + 校验
.\scripts\sync-plugins.ps1

# 只动某一个插件
.\scripts\sync-plugins.ps1 -PluginId reading-rail-sidebar

# 先看看会动什么
.\scripts\sync-plugins.ps1 -DryRun
```

**改插件的新流程**：
1. 改 `E:\1project\<id>-obsidian\` 里的源码 ← **唯一真身**
2. 跑 `scripts\sync-plugins.ps1` → vault 与 config 两个副本一起更新并校验一致
3. vault 里 `Ctrl+P → Reload app without saving` 验证
4. **bump `manifest.json` 的 version**（不改这一步用户端收不到更新）
5. `git commit` + `git tag <version>` + `git push --follow-tags`（**tag 名必须严格等于 version**）
6. Release 由 Actions 自动生成并挂好三件套（§4.4）
7. config 仓库同步提交一次（脚本已经改好了工作区，`git add` + `commit` 即可）

> ⚠️ 第 5、7 步的**推送必须等明确批准**，不自动推。

---

## 7. 已定目标：直接冲官方社区市场

BRAT 只当作**提交前的自检通道**（打完 Release 自己装一遍，验证三件套能被正确拉取），
最终向 `obsidianmd/obsidian-releases` 提 PR，进官方目录。

### 7.1 提交前自检清单（官方政策 + 提交要求合并）

来源：`obsidian-releases/README.md`、`Community directory/Developer policies`、
`Submission requirements for plugins` —— 三份都核对过，不是记忆。

**① 开发者政策（违反会直接下架）**

| 检查项 | 要求 | 我们 |
|---|---|---|
| 代码混淆 | 禁止（不得隐藏用途） | ✅ 无 `eval` / `new Function`，源码直读 |
| 动态广告 | 禁止（联网加载的广告） | ✅ 无 |
| 静态广告 | 不得出现在插件自身界面之外 | ✅ 无 |
| 客户端遥测 | 禁止 | ✅ 无 |
| 自行安装/更新依赖 | 禁止 | ✅ 无 |
| 网络访问 | 允许，但**必须在 README 明确说明**用的是哪些远程服务、为什么 | ✅ 零网络访问（`requestUrl`/`fetch`/`XHR` 均为 0 处）→ 无需披露 |
| 访问 vault 外的文件 | 允许，但必须在 README 说明原因 | ✅ 无 → 无需披露 |
| 付费/注册才能用全功能 | 允许，但必须写明 | ✅ 无 → 无需披露 |
| LICENSE | **必须有**，且明确标注许可证 | ⚠️ 待补（MIT） |
| 商标 | 不得让用户误以为是官方出品 | ✅ 命名是 `<id>-obsidian` 后缀（先例 `zheng-tally-obsidian`），且 manifest 的 `id` 里不含 `obsidian`；README 里注明非官方即可 |

**② 提交要求（Submissions 会被逐条挑）**

| 检查项 | 要求 | 我们 |
|---|---|---|
| 样例代码 | 必须删干净 | ✅ 三个插件都是手写的，非样例模板 |
| `minAppVersion` | 与所用 API 匹配 | ⚠️ 现填 `1.4.0`，建议提到当前稳定版更稳（或保持 1.4.0 也合规） |
| `fundingUrl` | 不接受赞助就必须**删掉**（不是留空） | ✅ 本来就没有 |
| description 写法 | 好的描述**以动作开头**；不要以 "This is a plugin" 开头 | ⚠️ 三个里有 2 个是名词开头，见 §7.2 |
| 命令 id | 不得包含插件 id | ✅ 全部合规 |

**③ 仓库文件**：`manifest.json` / `main.js` / `styles.css` / `README.md` / `LICENSE` / `.gitignore`
（README 会被市场详情页直接抓取，等于你的产品页）

### 7.2 description 建议改写（官方偏好"动作开头"）

| 插件 | 现在 | 建议 |
|---|---|---|
| `quiet-shelf` | 暗格：把归档、索引类文件从左侧文件树收起来（物理位置、知识图谱、搜索全部不变），随时可放回。另含聚焦模式——可跨层级多选文件夹，只留下当前要看的。 | **把归档与索引类文件从左侧文件树收起来**，物理位置、知识图谱、搜索全部不变，随时可放回。另含聚焦模式：跨层级多选文件夹，只留下当前要看的。 |
| `toolbar-pin-toggle` | 一个快捷键两种常驻：切换底部原生常驻工具条，或让顶部工具条保持常驻。模式可在设置里选择。 | **用一个快捷键切换两种工具条常驻**：底部原生常驻工具条，或顶部工具条保持常驻。模式可在设置里选择。 |
| `reading-rail-sidebar` | 把阅读进度与标题导航做成右侧栏面板：… | 已经是动作开头 ✅ 不用改 |

（改写只动了开头语序，长度仍在 250 字符内。）

### 7.3 提 PR

往 `obsidianmd/obsidian-releases` 的 `community-plugins.json` 加**四条**（注意保持文件按 id 排序）。
`repo` 字段填的就是仓库全名，正是 `<id>-obsidian` 这个后缀命名的用处：

```json
{ "id": "zheng-tally",            "repo": "yunmin311/zheng-tally-obsidian" },
{ "id": "quiet-shelf",            "repo": "yunmin311/quiet-shelf-obsidian" },
{ "id": "reading-rail-sidebar",   "repo": "yunmin311/reading-rail-sidebar-obsidian" },
{ "id": "toolbar-pin-toggle",     "repo": "yunmin311/toolbar-pin-toggle-obsidian" }
```

（实际提交时 `name` / `author` / `description` 要与各自仓库根目录 `manifest.json` 完全一致 ——
维护者会核对，不一致会被要求改。）

提完等人工审核（队列很长，数周～数月）。**期间插件照常可用**（BRAT 装的就是同一份 Release），
不影响自己用。审核意见通常集中在命名与 description，按意见改完在同一 PR 里推新 commit 即可。

---

## 8. 待办清单（按官方发布格式）

**已完成（2026-09-17）**
- [x] 建 4 个源码仓库 `E:\1project\<id>-obsidian\`（含 `zheng-tally-obsidian` 既有仓）
- [x] 四个插件补 `"authorUrl": "https://github.com/yunmin311"`
- [x] 按 §7.2 改写 description（英文、动作开头、句末带句点）
- [x] 各写 README.md + CHANGELOG.md + LICENSE（MIT）+ `.gitignore`（已排除 `data.json`）
- [x] 各放 `.github/workflows/release.yml`（§4.4，含 tag↔version 硬校验）
- [x] 三仓已建（public）并推首版，**Actions 全部 success**，Release 三件套齐全
- [x] `zheng-tally-obsidian` 的 `v1.0.0` / `v1.0.1` tag 已从远端删除，只留 `1.0.1`
- [x] `scripts/sync-plugins.ps1` 写完并实跑通过（vault + config 双目标 + SHA256 校验）
- [x] config 仓库保留插件本体（白名单放行），作为换机器时的备份副本

**待办**
- [ ] `gh auth login`（`gh` 未登录，与 git 走的两套凭据；提 PR 前需要）
- [ ] 用 BRAT 装一遍，验证用户在别处拉取 Release 的链路
- [ ] 提 `obsidian-releases` 的 PR（往 `community-plugins.json` 加**四条**：`zheng-tally` + 三个新插件）
- [ ] （可选）`obsidian-config` 的 README 里加「我的插件」索引
- [ ] （可选）考虑是否把 `crisp-reading-rail` / `reading-rail-sidebar` 的 `data.json` 也移出仓库（见 §9）

---

## 9. 提醒：发布前再看一眼这个仓库已经公开的东西

`obsidian-config` 是 public，从首次推送起以下内容就公开可搜（qy 已知悉并授权，此处只作发布前复核）：

- 7 个 crisp 插件的 **Crisp Suite 授权码**（`licenseCode`，`maxDevices: 3`）
- `flexplorer` / `crisp-file-explorer` 的 `data.json` 已排除，但 **`crisp-reading-rail/data.json` 的 `readingMemory`** 与 **`reading-rail-sidebar/data.json` 的 `memory`** 仍含笔记路径，尚未移出

**插件的源码仓库是干净的** —— 只有 `main.js` / `manifest.json` / `styles.css` / `README.md` /
`LICENSE` / `CHANGELOG.md`，`data.json` 已进各自 `.gitignore`。所以正式发布的通道不泄任何 vault 路径。

但**本仓库（config）里的备份副本仍会带 `data.json`**（它们含笔记路径与阅读记录）。
这与 §1 的取舍有关：config 的定位是「换机器一份恢复全部」，含 `data.json` 才恢复得出设置。
当前只有两处尚未移出：

- `crisp-reading-rail/data.json` → `readingMemory`（该插件已停用）
- `reading-rail-sidebar/data.json` → `memory`

两者各 2.2 KB / 0.3 KB，且仓库本来就 public（qy 已知悉）。**要移出随时可以** ——
把路径加进 `.gitignore` 的「运行时状态」那一段即可，代价是换机器时这两个插件的阅读记忆要重建。
