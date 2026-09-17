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
| 提交元数据隐私 | **FAIL** —— 见 §5，需 qy 决策 |
| 官方目录收录 | **未提交** —— 四个都还没提 PR |

---

## 1. ⚠️ 首要更正：「已经发布了两个」这个认知是错的

经 GitHub API 实证：

```
$ gh pr list --repo obsidianmd/obsidian-releases --author yunmin311 --state all
[]                                    ← 从未提过 PR
```

`community-plugins.json`（7722 条）中：

| plugin id | 是否收录 |
|---|---|
| `zheng-tally` | 未收录 |
| `quiet-shelf` | 未收录 |
| `reading-rail-sidebar` | 未收录 |
| `toolbar-pin-toggle` | 未收录 |

以 author 搜 `yunmin` 也是空集。

**这说明什么**：你在 GitHub 上看到的是 **Release**（可用 BRAT 或手动安装，
对你自己完全可用），但**不等于进了官方社区目录**。官方目录收录的唯一途径是
向 `obsidianmd/obsidian-releases` 提一个 PR，在 `community-plugins.json`
里加一条记录，然后等人工审核合并。

**四个都还没提。** 所以这轮审计的真正价值在于：在提 PR 之前把该修的修掉，
避免提上去被打回。

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
（账号 id `208762643`；先例仓库 `operation-platform-learning` 已在用这个地址）

```
阶段 1（本地，无风险）
  git config --global user.email "208762643+yunmin311@users.noreply.github.com"

阶段 2（本地重写历史）
  三个单提交仓库 → git commit --amend --reset-author          （最省事）
  zheng-tally   → git filter-repo 全量重写（25 commit + tag 对象）

阶段 3（远端，破坏性，需拍板）
  git push --force-with-lease
  重建 tag
```

**另需你本人处理**（网页设置，我改不了）：
GitHub profile 的 `name` / `email` / `location` 三个公开字段。
其中 `email` 设为 noreply 即可从 profile 隐藏，但**历史里的旧提交不受影响**，
所以阶段 1–3 仍要做。

---

## 6. 本轮补的工程缺口

1. **`zheng-tally-obsidian/.gitignore` 缺 `data.json`** —— 另外三个早有。
   已补，并注明原因（手工拷贝插件目录时容易把运行状态带进仓库）。
2. **四个仓库各加 `.gitattributes`**（`* text=auto eol=lf` + 二进制资源排除）——
   根治 Windows `core.autocrlf=true` 与 GitHub Actions（Linux，LF）
   之间「内容相同、SHA256 不同」的长期歧义。

---

## 7. 待办

| # | 事项 | 阻塞点 |
|---|---|---|
| 1 | 修提交邮箱（§5.3 阶段 1–3） | **需 qy 拍板**（涉及 force-push） |
| 2 | qy 自行调整 GitHub profile 的 name/email/location | 网页操作 |
| 3 | 提交 `.gitattributes` ×4 + zheng-tally 的 `.gitignore` | 与 #1 一起做更省事 |
| 4 | 提 `obsidian-releases` PR（**一次加四条**） | 等 #1 完成（否则邮箱会随 PR 一并公开） |
| 5 | 推 `5230deb` / `0e8d52a` 到 obsidian-config | **需 qy 拍板** |
| 6 | BRAT 装一遍，验证用户侧拉取链路 | 无 |

**顺序建议**：先做 #1（改邮箱 + 重写历史 + force-push），
再做 #3、#4 —— 因为 PR 被合并后，你的 commit 元数据就进了
几十万人使用的仓库历史，再改成本极高。
