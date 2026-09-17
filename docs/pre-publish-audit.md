# 发布前审计报告 —— 四个自研插件

审计日期：2026-09-17
审计对象：`quiet-shelf-obsidian` / `reading-rail-sidebar-obsidian` /
`toolbar-pin-toggle-obsidian` / `zheng-tally-obsidian`
审计脚本：`scripts/audit-plugins.ps1`（可重跑）

---

## 0. 结论摘要

| 维度 | 结果 |
|---|---|
| 官方规定合规 | **PASS** —— 四个 manifest 逐字段合规，零网络访问、零 eval、零遥测 |
| 工程化 | **PASS** —— 监听器/观察器/定时器均有回收，无私有 API 依赖 |
| 好用 | **PASS** —— 四个 Release 三件套齐全，tag ↔ version 严格一致，Actions 全绿 |
| 文件内容隐私 | **PASS** —— 工作区 + 全历史 blob 均无个人信息 |
| **提交元数据隐私** | **FAIL** —— 见 §5，需你决策（force-push） |
| **官方目录收录** | **审核中** —— Quiet Shelf / Zheng Tally 已提交，未过自动审核；另两个未提交 |

**给 qy 的一句话结论**：你要的「隐藏 Location / name / 邮箱」，
**commit 邮箱我能代跑改掉，profile 那三个字段只能你自己在 GitHub 网页改** —— 两边都要做。

---

## 1. ⚠️ 首要更正：「已经发布了两个」—— **你是对的，我错了**

经核实，官方提交流程**已经变更**，我最初按旧流程（GitHub PR）判断，得出了错误结论。

**你截图里的页面是官方开发者后台**（`obsidian.md` 登录 → Plugins → Your plugins），
上面确实有 **Quiet Shelf** 和 **Zheng Tally** 两条，标着 `you`。
这是 **2026 年上线的自助提交流程**，**不经过 GitHub PR**。

### 现行流程（官方文档实证）

1. GitHub 仓库齐备（README / LICENSE / manifest）
2. 打 tag 建 Release，tag == `manifest.version`，挂 main.js + manifest.json + styles.css
3. 去 **`community.obsidian.md`** 用 **Obsidian 账号**登录 → **关联 GitHub 账号**
   → **Add a plugin / New plugin**
4. **自动审核**（文档原话 "reviewed automatically"），后台会列出待修项
5. 编辑描述后点 **Publish**
6. 通过后由机器人**镜像**进 `obsidian-releases` 的 `community-plugins.json`

第 6 步的证据：该仓库有大量 `chore: Mirror community plugins and themes
(-3/+6 plugins, -0/+1 themes)` 这类自动提交，且**今天（2026-09-17）仍在持续跑**
（最近三次：13:27、12:38、10:28）。

### 为什么社区里搜不到

| 检查 | 结果 |
|---|---|
| `community-plugins.json`（7722 条）里搜四个 id | **全部没有** |
| `community-plugins-removed.json`（175 条下架名单）里搜 | **没有** |

**两项都为空 = 提交了但还没通过自动审核**，不是被拒，也不是没提交。
去 `community.obsidian.md` 后台即可看到具体的待修项。

### ❌ 我之前的错误方法（记录以免重犯）

```
gh pr list --repo obsidianmd/obsidian-releases --author yunmin311 --state all  →  []
```

新流程**本来就不产生 PR**，查了必然为空。我据此判断「从没提交过」——
**这个推断是错的**。判断收录状态应该查上表那两个 JSON，而不是查 PR。

---

## 2. 合规审计（官方规定）

### 2.1 manifest.json 硬约束 —— 全部 PASS

| 规则 | quiet-shelf | reading-rail | toolbar-pin | zheng-tally |
|---|---|---|---|---|
| id 小写+连字符 | ✓ | ✓ | ✓ | ✓ |
| id 不含 `obsidian` | ✓ | ✓ | ✓ | ✓ |
| id 不以 `plugin` 结尾 | ✓ | ✓ | ✓ | ✓ |
| name 不含 `Obsidian`/`Plugin` | ✓ | ✓ | ✓ | ✓ |
| description ≤250 字符 | 129 | 117 | 104 | 92 |
| description 以句号结尾 | ✓ | ✓ | ✓ | ✓ |
| description 无 emoji | ✓ | ✓ | ✓ | ✓ |
| version 语义化 x.y.z | 0.1.0 | 0.1.0 | 1.0.0 | 1.0.1 |
| authorUrl 存在 | ✓ | ✓ | ✓ | ✓ |
| isDesktopOnly 正确 | `false` ✓ | `false` ✓ | `false` ✓ | `true` ✓ |

`zheng-tally` 的 `isDesktopOnly: true` 是**正确的**——它用 TypeScript
+ esbuild，涉及桌面端能力。

### 2.2 开发者政策禁止项 —— 全部 PASS

| 禁止项 | 审计结果 |
|---|---|
| 代码混淆 | 三个纯 JS 插件：无。zheng-tally 的 `dist/main.js` 长行是 **esbuild 打包产物**，不是人为混淆（已在审计脚本里做 `dist/` 路径豁免） |
| `eval` / `new Function` | 四个插件命中数 **0** |
| 客户端遥测 | 无 |
| 动态广告 | 无 |
| 自装依赖 | 无 |
| 让用户误以为是官方出品 | README 未作此暗示 |

### 2.3 需要 README 披露的项 —— 全部不适用

官方规定：**网络访问、访问 vault 外文件、付费墙、服务端遥测**允许，
但必须在 README 中披露。

实测四个插件的 `fetch` / `requestUrl` / `XMLHttpRequest` / Node API
（`fs` / `os` / `electron`）命中数：

```
quiet-shelf-obsidian              fetch=0  requestUrl=0  XHR=0  NodeAPI=0
reading-rail-sidebar-obsidian     fetch=0  requestUrl=0  XHR=0  NodeAPI=0
toolbar-pin-toggle-obsidian       fetch=0  requestUrl=0  XHR=0  NodeAPI=0
zheng-tally-obsidian              fetch=0  requestUrl=0  XHR=0  NodeAPI=0
```

**零网络、零 vault 外访问** → 需披露的项**全部不适用**，README 无需额外声明。

### 2.4 LICENSE —— 全部齐全

四个仓库根均有 `LICENSE`，MIT，
`Copyright (c) 2026 yunmin311`（署名创作者，符合预期，不含私人信息）。

---

## 3. 工程化审计

### 3.1 资源回收

| 检查项 | quiet-shelf | reading-rail | toolbar-pin |
|---|---|---|---|
| `addEventListener` 是否配对清理 | ✓ 7 处全在 `extends Modal` 作用域内，随 DOM 回收 | ✓ | ✓ |
| `MutationObserver` 是否 `disconnect()` | ✓ `teardownObserver()` | — | — |
| 定时器是否清理 | ✓ | ✓ | ✓ |
| `onunload` 是否实现 | ✓ | ✓ | ✓ |

### 3.2 私有 API 依赖

`fileItems` / `setCollapsed` 等 Obsidian 私有 API 的命中，
经逐条核查**全部是注释里说明"刻意不用"**，不是真调用。
`reading-rail-sidebar` 碰 `currentMode` / `.cm-scroller` 的地方
均有 `try/catch` + 特性探测 + 兜底路径。

**结论**：无私有 API 依赖，Obsidian 升级时不会脆断。

---

## 4. 发布链路审计

| 仓库 | manifest.version | 远端 tag | 一致 | Release 资产 |
|---|---|---|---|---|
| quiet-shelf-obsidian | 0.1.0 | `0.1.0` | ✓ | main.js, manifest.json, styles.css |
| reading-rail-sidebar-obsidian | 0.1.0 | `0.1.0` | ✓ | main.js, manifest.json, styles.css |
| toolbar-pin-toggle-obsidian | 1.0.0 | `1.0.0` | ✓ | main.js, manifest.json, styles.css |
| zheng-tally-obsidian | 1.0.1 | `1.0.1` | ✓ | main.js, manifest.json |

**tag 名严格等于 manifest.version**（市场定位 Release 的唯一机制）。

`zheng-tally` 只有 2 个资产是**正确的**——它没有 `styles.css`，样式全部
内联在 TS 源码里（`renderer.ts` 中 21 处 `style.*`），不是漏传。

下载的资产过 `node --check` 通过；GitHub Actions 全部 `completed/success`。

`v1.0.0` / `v1.0.1` 两个冗余 tag **已从远端删除**，远端只剩 `1.0.1`。

---

## 5. ⚠️ 隐私审计 —— 发现一处真实泄露

### 5.1 文件内容：全部干净

扫描模式：`liqiyu` / `15005656607` / `西交利物浦` / `1obsidian` /
`C:\Users` / `Users/lqy`
扫描范围：**工作区 + 全部历史 blob**（逐对象 `cat-file`，不止当前版本）

| 仓库 | 对象总数 | 命中 |
|---|---|---|
| quiet-shelf-obsidian | 1 commit | 无 |
| reading-rail-sidebar-obsidian | 1 commit | 无 |
| toolbar-pin-toggle-obsidian | 1 commit | 无 |
| zheng-tally-obsidian | 115 blob / 25 commit / 72 tree / 1 tag | 无 |

vault 路径、本机绝对路径、真实姓名、手机号、其他项目名 —— **一个都没有**。
`data.json` **从未被提交过**（四仓全历史查证为空）。

### 5.2 唯一泄露：提交身份元数据

| 仓库 | author / committer 邮箱 | 命中对象 |
|---|---|---|
| quiet-shelf-obsidian | `liqiyu311@gmail.com` | commit `0f8439c3…` |
| reading-rail-sidebar-obsidian | `liqiyu311@gmail.com` | commit `23527f5f…` |
| toolbar-pin-toggle-obsidian | `liqiyu311@gmail.com` | commit `67a66f57…` |
| zheng-tally-obsidian | `liqiyu311@gmail.com` ×23 ＋ **`15005656607@163.com` ×2** | commit ＋ tag 对象 `dea616b5…` |

zheng-tally 的 annotated tag `1.0.1` 自身也带：
`tagger yunmin311 <liqiyu311@gmail.com>`

**两个邮箱严重度不同**：

- `liqiyu311@gmail.com` —— 个人邮箱。但它**本身就挂在公开 GitHub profile 上**
  （profile 还公开了 `name: liqiyu`、`location: 西交利物浦大学`）。
  严格说这条**不是新泄露**，但会随每次 clone 永久扩散。
- **`15005656607@163.com` —— 手机号即邮箱前缀。**
  这是**唯一一条真正的隐藏隐私泄露**：profile 上看不到，
  只有翻 git 历史才能挖出来。

### 5.3 修复方案

**统一身份**：`208762643+yunmin311@users.noreply.github.com`
（账号 id `208762643`；先例仓库 `operation-platform-learning` 的三个 commit
**全部**用的就是这个地址，证明可用且生效）

**分工要先说清 —— 有两件事，缺一不可**：

| # | 做什么 | 谁做 | 效果 |
|---|---|---|---|
| A | 改 commit / tag 里的邮箱 | **我代跑** | 清掉历史里的 `liqiyu311@gmail.com` 与 `15005656607@163.com` |
| B | 改 GitHub profile 的 name / email / location | **只能你自己** | 隐藏 profile 页上公开显示的三个字段 |

⚠️ **A 和 B 是独立的两件事，改了一个不代表另一个干净了。**
- 只做 B：profile 干净了，但翻你任何仓库的 commit 记录仍能看到旧邮箱
- 只做 A：commit 干净了，但 profile 页上仍明晃晃写着 `liqiyu` / 邮箱 / 学校

#### A. 提交邮箱（我代跑，需你批准 force-push）

```
阶段 1（本地，零风险）
  git config --global user.email "208762643+yunmin311@users.noreply.github.com"
  git config --global user.name  "yunmin311"

阶段 2（本地重写历史，可逆 —— 重写前会留备份分支）
  三个单提交仓库 → git commit --amend --reset-author        （最省事）
  zheng-tally   → git filter-repo 全量重写 25 commit + tag 对象
                  （工具已装：git-filter-repo 2.47.0）

阶段 3（推到远端，破坏性，等你拍板）
  git push --force-with-lease
  重建 tag 1.0.1 并强推
```

**为什么必须重写历史而不是新建一个提交**：旧邮箱写在**已有的 25 个 commit 对象**里，
再提交一个新 commit 只是叠加，旧的那 25 条依然带着旧邮箱。必须重写。

#### B. GitHub profile（你操作，约 1 分钟）

去 https://github.com/settings/profile ：

| 字段 | 现值 | 改成 |
|---|---|---|
| **Name** | `liqiyu` | 清空，或填 `yunmin311` |
| **Public email** | `liqiyu311@gmail.com` | **下拉里选「Don't show my email」**（不是清空文本框 —— 清空后它还会回落到主邮箱） |
| **Location** | `西交利物浦大学` | 清空 |

这三项改完，profile 页（https://github.com/yunmin311）上就看不到了。
注意 **Bio 里那行「特别多想法开发中...」不含个人信息，可以留着。**

---

## 6. 本轮补的工程缺口

1. **`zheng-tally-obsidian/.gitignore` 缺 `data.json`** —— 另外三个早有。
   已补，并注明原因（手工拷贝插件目录时容易把运行状态带进仓库）。
2. **四个仓库各加 `.gitattributes`**（`* text=auto eol=lf` + 二进制资源排除）——
   根治 Windows `core.autocrlf=true` 与 GitHub Actions（Linux，LF）
   之间「内容相同、SHA256 不同」的长期歧义。

---

## 7. 待办

| # | 事项 | 谁做 | 阻塞点 |
|---|---|---|---|
| 1 | **改提交邮箱** —— 全局换 noreply + 重写 4 仓历史 + force-push（§5.3-A） | 我 | **等你批准 force-push** |
| 2 | **改 GitHub profile** 的 name / email / location（§5.3-B） | **你** | 网页操作，约 1 分钟 |
| 3 | 推 `.gitattributes` ×4 + zheng-tally 的 `.gitignore`（已本地提交） | 我 | 与 #1 一起做更省事（同一次 force-push） |
| 4 | 去 `community.obsidian.md` 后台看 Quiet Shelf / Zheng Tally 的**审核待修项** | 你 | 这是「搜不到」的直接原因 |
| 5 | 提交另外两个插件（reading-rail-sidebar / toolbar-pin-toggle）到后台 | 你 | 无 |
| 6 | 推 `5230deb` / `0e8d52a` / `a540e7c` 到 obsidian-config | 我 | **等你拍板** |
| 7 | BRAT 装一遍，验证用户侧拉取链路 | 我 | 无 |

**顺序建议**：

1. **先做 #1 + #3**（我一次性完成：改身份 → 重写 4 仓历史 → force-push，
   把 `.gitattributes` 一起带上）—— 越早越好，因为一旦进了官方目录，
   commit 元数据就写进上游仓库历史，再改成本极高；
2. **同时你做 #4** —— 这是「社区搜不到」的答案所在，后台会直接告诉你缺什么；
3. 最后 #2（profile）什么时候做都行，它只影响 profile 页的显示。
