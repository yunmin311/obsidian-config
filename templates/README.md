# 📋 模板说明

> 5 个核心模板，放入 `templates/` 目录，配合 Templater 使用。

---

## 📝 模板列表

| 文件 | 用途 | 触发方式 |
|------|------|----------|
| `daily-note.md` | 日记 | 启动时自动 / `Ctrl+T` 选择 |
| `weekly-note.md` | 周回顾 | 周一自动 / 手动触发 |
| `project-note.md` | 项目笔记 | `Ctrl+T` 选择 |
| `literature-note.md` | 文献笔记 | `Ctrl+T` 选择 |
| `meeting-note.md` | 会议记录 | `Ctrl+T` 选择 |

---

## 📝 daily-note.md

```markdown
---
date: <% tp.date.now("YYYY-MM-DD") %>
week: <% tp.date.now("WW") %>
tags: [daily]
---

# 📅 <%= tp.date.now("YYYY年MM月DD日 dddd") %>

## 🌅 晨间意图
- 今日最重要的 1 件事：
- 今日想完成的 3 件事：
  1.
  2.
  3.

## 📋 任务看板
```dataview
TASK FROM ""
WHERE !completed AND (due = date(today) OR scheduled = date(today) OR due < date(today))
SORT priority DESC, due ASC
```

## 💭 灵感/记录
-

## 📚 学习/阅读
-

## 🌙 晚间复盘
- 今日完成度：
- 今日亮点：
- 待改进：
- 明日重点：

---

## 🏷️ 标签
#daily <% tp.date.now("YYYY-MM") %>
```

---

## 📝 weekly-note.md

```markdown
---
date: <% tp.date.now("YYYY-[W]WW") %>
tags: [weekly]
---

# 📅 周回顾 <% tp.date.now("YYYY年 第WW周") %>

## 📊 本周概览
| 维度 | 评分 (1-10) | 备注 |
|------|-------------|------|
| 专注度 | | |
| 产出质量 | | |
| 身体状态 | | |
| 情绪稳定 | | |
| 学习进度 | | |

## ✅ 本周完成
```dataview
TASK FROM ""
WHERE completed AND completion >= date(today) - dur(7 days)
SORT completion DESC
```

## 📚 本周学习
- **读书**：
- **课程/视频**：
- **文章/笔记**：
- **代码/实践**：

## 💡 复盘洞察
- **做得好的**：
- **待改进**：
- **新认知**：
- **下周重点**：

---

## 📅 下周规划
- [ ] 目标 1
- [ ] 目标 2
- [ ] 目标 3

---

## 🏷️ 标签
#weekly <% tp.date.now("YYYY-[W]WW") %>
```

---

## 📝 project-note.md

```markdown
---
project: "<%= tp.file.title %>"
status: "active"
priority: "high"
tags: [project]
created: <% tp.date.now("YYYY-MM-DD") %>
---

# 🚀 项目：<%= tp.file.title %>

## 🎯 目标
- 核心目标：
- 成功标准：
- 截止日期：

## 📋 任务分解
```dataview
TASK FROM ""
WHERE contains(project, "<%= tp.file.title %>")
SORT priority DESC, due ASC
```

## 📚 资料/参考
- [[相关笔记]]
- 外部链接：

## 📝 进展记录
- **<%= tp.date.now("YYYY-MM-DD") %>**：项目启动

---

## 🏷️ 标签
#project #active
```

---

## 📝 literature-note.md

```markdown
---
source: ""
author: ""
type: "book|article|paper|video"
tags: [literature, <% tp.file.cursor(1) %>]
date: <% tp.date.now("YYYY-MM-DD") %>
---

# 📖 文献笔记：<%= tp.file.title %>

## 📌 核心观点
1.
2.
3.

## 📝 详细笔记

### 章节/要点 1
-

### 章节/要点 2
-

## 💡 个人思考/关联
- 关联笔记：[[相关笔记]]
- 反驳/补充：
- 实践应用：

## 📌 关键引用
> "引用原文"
> — 来源

---

## 🏷️ 标签
#literature #<% tp.file.cursor(1) %>
```

---

## 📝 meeting-note.md

```markdown
---
meeting: "<%= tp.file.title %>"
date: <% tp.date.now("YYYY-MM-DD HH:mm") %>
attendees: []
tags: [meeting]
---

# 🤝 会议记录：<%= tp.file.title %>

## 📋 基本信息
- **时间**：<%= tp.date.now("YYYY-MM-DD HH:mm") %>
- **地点/链接**：
- **参会人**：
- **主持人**：
- **记录人**：

## 📋 议程
1.
2.
3.

## 📝 核心讨论
### 议题 1
- 观点 A：
- 观点 B：
- 结论：

### 议题 2
- 观点 A：
- 观点 B：
- 结论：

## ✅ 行动项
```dataview
TASK FROM ""
WHERE contains(text, "#action")
SORT priority DESC
```

## 📝 会议纪要
-

## 📅 后续跟进
- [ ] 任务 1 @责任人 📅 截止日期
- [ ] 任务 2 @责任人 📅 截止日期

---

## 🏷️ 标签
#meeting
```