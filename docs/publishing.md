# 发布指南：把可发布的资产拆成独立仓库

> 更新日期：2026-09-17　·　仓库：`yunmin311/obsidian-config`（public）
> 文中关于社区市场的规则均核对过官方文档与 `obsidianmd/obsidian-releases` 的说明，非记忆。

---

## 0. 现状：仓库里到底有什么

`obsidian-config` 目前跟踪 52 个文件，混装了四类性质完全不同的东西：

| 类别 | 内容 | 数量 | 该不该发布 | 归宿 |
|---|---|---|---|---|
| **① 自研插件** | `quiet-shelf` / `reading-rail-sidebar` / `toolbar-pin-toggle` | 3 | ✅ 完全可以 | **各自独立仓库** |
| **② 自写 CSS 片段** | `tree-indent` `dense-reading` `pin-spacing` `border-polished` `dark-paper-texture` `graph-blue-gray` `blue-gray-dark-fix` `hide-embed-titles` `hide-editing-toolbar` `baseline-optimized.minimal` | 10 | ✅ 可以（作为片段合集） | 一个 `obsidian-css-snippets` 仓库（可选） |
| **③ 配置框架** | `appearance.json` `hotkeys.json` `community-plugins.json` + 第三方插件 `data.json` + 文档 | — | ✅ 已在发布（就是本仓库） | 保持，但要**瘦身** |
| **④ 运行时状态** | `flexplorer` / `crisp-file-explorer` 的 `data.json` | — | ❌ 已排除 | 保持排除 |

**核心问题**：①和③挤在一个仓库里，导致
- 别人要装你的插件，得 clone 整个配置仓库（里面还有 Crisp 授权码、上千条笔记路径）
- 插件没有 Release，别人无法用 BRAT 安装，更进不了社区市场
- 插件版本和"配置备份"的版本混在一个 commit 流里，无法单独追溯

---

## 1. 目标架构

```
GitHub:
  yunmin311/obsidian-config           已 public → 瘦身为「纯配置」
  yunmin311/obsidian-quiet-shelf      新建 → 独立发布
  yunmin311/obsidian-reading-rail-sidebar   新建 → 独立发布
  yunmin311/obsidian-toolbar-pin-toggle     新建 → 独立发布
  yunmin311/obsidian-css-snippets     新建（可选）→ 片段合集

本地:
  E:\1project\obsidian-config\                 配置仓库
  E:\1project\obsidian-quiet-shelf\            插件源码仓库 ← 唯一真身
  E:\1project\obsidian-reading-rail-sidebar\
  E:\1project\obsidian-toolbar-pin-toggle\
  E:\1obsidian\Obsidian Vault\.obsidian\plugins\<id>\   运行副本（脚本同步过去）
```

### ⚠️ 不要用 git submodule 串起来

两条本机实测过的硬理由：

1. **E 盘 git 嵌套引用不落盘**：`E:\1project\**` 下 git 无法创建嵌套分支引用（exit 0 但 ref 不落盘），submodule 重度依赖这套机制。
2. **vault 里已有前车之鉴**：`project/` 下两个内嵌仓库因为没有 `.gitmodules`，任何 submodule 解析都直接 fatal。

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
# 名字约定：社区里 7717 个插件，30% 用「repo 名 == 插件 id」，多数用 obsidian- 前缀。
# 建议用 obsidian- 前缀 —— GitHub 上一眼能看出是 Obsidian 插件，可发现性更好。
# manifest 里的 id 保持不动（id 里不许出现 obsidian，仓库名可以）。
gh repo create yunmin311/obsidian-reading-rail-sidebar --public --license MIT
```

### 4.2 初始化目录并推第一版

```bash
mkdir -p /e/1project/obsidian-reading-rail-sidebar
cd /e/1project/obsidian-reading-rail-sidebar
git init && git remote add origin git@github.com:yunmin311/obsidian-reading-rail-sidebar.git

# 从配置仓库把三件套搬过来（搬完配置仓库里那份就删，避免两份真身）
cp "/e/1project/obsidian-config/.obsidian/plugins/reading-rail-sidebar/main.js" .
cp "/e/1project/obsidian-config/.obsidian/plugins/reading-rail-sidebar/manifest.json" .
cp "/e/1project/obsidian-config/.obsidian/plugins/reading-rail-sidebar/styles.css" .

# 补 authorUrl（marketplace 详情页会用它做作者链接）
# manifest.json 里加一行："authorUrl": "https://github.com/yunmin311"

# 写 README.md（必写：市场详情页就是抓它）
# LICENSE 已由 --license MIT 生成

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

## 6. 与现有工作流衔接（避免两份 main.js 漂移）

源码搬到独立仓库后，**唯一真身是 `E:\1project\obsidian-<id>\`**，配置仓库里的那份要删掉
（同时清掉 `.gitignore` 里对应的白名单段），vault 里的只是运行副本。

`scripts/sync-plugins.ps1`：

```powershell
<#
.SYNOPSIS 把各插件源码仓库的三件套单向同步进 vault（源码仓库 → vault）
#>
param(
    [string]$VaultPath = "E:\1obsidian\Obsidian Vault",
    [string]$SrcRoot   = "E:\1project"
)

# GitHub 仓库名（obsidian- 前缀） → vault 里的插件目录名（= manifest id）
$map = @{
    "obsidian-quiet-shelf"          = "quiet-shelf"
    "obsidian-reading-rail-sidebar" = "reading-rail-sidebar"
    "obsidian-toolbar-pin-toggle"   = "toolbar-pin-toggle"
}

foreach ($repo in $map.Keys) {
    $id  = $map[$repo]
    $src = Join-Path $SrcRoot $repo
    $dst = Join-Path $VaultPath ".obsidian\plugins\$id"

    if (-not (Test-Path $src)) { Write-Warning "跳过 $id：$src 不存在"; continue }
    New-Item -ItemType Directory -Force -Path $dst | Out-Null

    foreach ($f in @("main.js", "manifest.json", "styles.css")) {
        $s = Join-Path $src $f
        if (Test-Path $s) { Copy-Item $s $dst -Force }
        else              { Write-Warning "$repo 缺少 $f" }
    }
    Write-Host "  ✓ $id ← $repo" -ForegroundColor Green
}
```

**改插件的新流程**：
1. 改 `E:\1project\obsidian-<id>\` 里的源码
2. `scripts/sync-plugins.ps1` 同步进 vault → 在 Obsidian 里 `Ctrl+P → Reload app without saving` 验证
3. **bump `manifest.json` 的 version**
4. 提交 + 打同名 tag + `gh release create` 挂三件套
5. 通知用户更新（BRAT 用户点一下即可）

---

## 7. 两条分发路径

| | **BRAT**（你已装 `obsidian42-brat`） | **官方社区市场** |
|---|---|---|
| 门槛 | 有 Release 即可，**零审核** | 需向 `obsidianmd/obsidian-releases` 提 PR，**人工审核** |
| 时效 | 立刻 | 数周～数月（队列很长） |
| 受众 | 拿到你链接的人 | 全部 Obsidian 用户（可搜索、可一键安装） |
| 要求 | Release 带三件套 | 全部合规 + README + LICENSE + 无恶意代码 |
| 适合 | 自用 / 小范围分发 / 抢先体验 | 想让所有人用 |

**推荐节奏**：先建仓库 + 打 Release → 自己用 BRAT 装一遍验证链路
→ 稳定后再提市场 PR。官方 README 也明确建议先发 public beta 收集反馈。

提 PR 时要往 `community-plugins.json` 加一条：

```json
{ "id": "reading-rail-sidebar", "name": "Reading Rail Sidebar",
  "author": "yunmin311", "description": "...", "repo": "yunmin311/obsidian-reading-rail-sidebar" }
```

---

## 8. 待办清单

- [ ] 决定仓库命名（`obsidian-<id>` 还是 `<id>`）
- [ ] 决定先发哪个（建议先发最稳的 `toolbar-pin-toggle`，2.9KB 最小、逻辑最简单）
- [ ] 建 3 个仓库 + 补 `authorUrl` / README / LICENSE
- [ ] 每个打首个 Release，用 BRAT 装一遍验证
- [ ] 写 `scripts/sync-plugins.ps1` 并替换现有手工 `cp` 流程
- [ ] 从 `obsidian-config` 移除三个插件的本体 + 清 `.gitignore` 白名单段
- [ ] （可选）建 `obsidian-css-snippets` 仓库，把 10 个片段单独发布
- [ ] （可选）`obsidian-config` 的 README 里加「我的插件」索引
- [ ] 稳定后提 `obsidian-releases` 的 PR

---

## 9. 提醒：发布前再看一眼这个仓库已经公开的东西

`obsidian-config` 是 public，从首次推送起以下内容就公开可搜（qy 已知悉并授权，此处只作发布前复核）：

- 7 个 crisp 插件的 **Crisp Suite 授权码**（`licenseCode`，`maxDevices: 3`）
- `flexplorer` / `crisp-file-explorer` 的 `data.json` 已排除，但 **`crisp-reading-rail/data.json` 的 `readingMemory`** 与 **`reading-rail-sidebar/data.json` 的 `memory`** 仍含笔记路径，尚未移出

**新建的插件仓库是干净的**（只有 main.js / manifest.json / styles.css / README / LICENSE，
`data.json` 必须进 `.gitignore`），所以拆分本身就能顺带解决这个历史问题。
