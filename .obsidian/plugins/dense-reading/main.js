/* Dense Reading（密排阅读）
   把原来那个 CSS 片段（dense-reading.css）+ Style Settings 的组合，换成真插件。

   为什么要变成插件：
   片段那套必须先在 Style Settings 里勾总开关、再手写 `cssclasses: dense-w54`
   才生效 —— 用户得先知道要写什么才用得上。插件把这层拿掉：
   命令面板直接切档位、每篇笔记记住自己的档位、设置页有实时预览。

   设计上守住原来片段的三条底线（它们是踩过坑得出的，不要动）：

   1. 只改「视图层」，不改文件。
      行宽必须写在 `:is(.markdown-source-view.mod-cm6, .markdown-preview-view,
      .markdown-rendered)` 上，不能写在 body 上 —— Obsidian 会内联
      `--file-line-width: 700px`，写在 body 上会被它压掉，看起来像没生效。

   2. 间距规则全部包在 `body.dense-reading-mode` 下。
      关掉总开关时，除了行宽以外零生效，不残留任何副作用。

   3. 不写死颜色。
      hr / 行内代码一律 currentColor + color-mix，跟随主题。

   实现路线：只往 body 上加 class。
   档位是 dense-w44 / dense-w54 / dense-w66 / dense-w78 / dense-w-custom，
   与片段完全同名 —— 这样两套可以共存、也可以平滑迁移，互不打架。
*/

"use strict";

const { Plugin, PluginSettingTab, Setting, Notice } = require("obsidian");


/* ============================================================
   【内联模块 · 自动生成，请勿手改这一段】
   ------------------------------------------------------------
   以下三段来自仓库里的 locales.js / i18n.js / sponsor.js，
   由打包脚本 bundle-inline.js 拼接到此（脚本在 _scratch/_i18n/）。

   为什么不写 require("./locales")：
   Obsidian 注入的 require 是白名单函数，只认 obsidian / @codemirror /
   @lezer 与 Electron 的 window.require，**不解析插件的相对路径** ——
   require("./x") 会返回 undefined，插件直接加载失败。

   改动流程：改源文件 → node bundle-inline.js <插件目录> → 跑 sync-plugins.ps1
   ============================================================ */

/* ---------- 来自 locales.js ---------- */
/* Dense Reading —— 界面字符串表。
   只放本插件专属的键；语言下拉、赞助区块、通用按钮由公共表提供。 */

/* 公共键 —— 四个插件完全一致，改动请四处同步（i18n.js 里也有同样的说明）。 */
const COMMON = {
  zh: {
    "settings.language.name": "界面语言",
    "settings.language.desc":
      "设置页、命令与提示的显示语言。「跟随 Obsidian」会随界面语言自动切换。",
    "sponsor.title": "赞助支持",
    "sponsor.body":
      "这些插件都是独立开发并免费开源的，没有任何商业绑定。如果它确实省下了时间，可以通过 GitHub Sponsors 支持后续维护。",
    "meta.version": "版本",
    "meta.repository": "仓库",
    "common.reset": "恢复默认",
    "common.reset.done": "已恢复默认设置",
    "common.clear": "清除",
  },
  en: {
    "settings.language.name": "Interface language",
    "settings.language.desc":
      'Language for this settings page, commands and notices. "Follow Obsidian" tracks the app language.',
    "sponsor.title": "Sponsorship",
    "sponsor.body":
      "These plugins are built independently and released free and open-source, with no commercial tie-in. If one of them saves you time, you can support ongoing maintenance via GitHub Sponsors.",
    "meta.version": "Version",
    "meta.repository": "Repository",
    "common.reset": "Restore defaults",
    "common.reset.done": "Settings restored to defaults",
    "common.clear": "Clear",
  },
};

/* 本插件专属键。 */
const OWN = {
  zh: {
    "meta.desc": "密排阅读：紧凑间距 + 可调行宽，不依赖 Style Settings 与 CSS 片段。",

    "command.toggle": "切换密排阅读",
    "command.cycle": "循环切换行宽档位",
    "command.pin": "为当前笔记固定行宽档位",
    "command.unpin": "清除当前笔记的行宽档位",

    "notice.mode.on": "密排阅读：开",
    "notice.mode.off": "密排阅读：关",
    "notice.width": "行宽：{label}",
    "notice.pinned": "已固定为「{label}」：{path}",
    "notice.unpinned": "已清除该笔记的档位固定",

    "preset.w44": "窄读",
    "preset.w54": "均衡",
    "preset.w66": "宽幅",
    "preset.w78": "超宽",
    "preset.custom": "自定义",

    "settings.usage":
      "行宽按「视图层」生效，不受总开关影响；间距只在总开关打开时作用。" +
      "两者都与原来的 dense-reading.css 片段同名，可平滑迁移。",

    "settings.mode.name": "密排阅读总开关",
    "settings.mode.desc": "收紧密排阅读视图的段落与标题间距。关闭时除行宽外零生效。",

    "settings.width.name": "行宽档位",
    "settings.width.desc": "覆盖主题的可读行宽。与总开关互相独立。",

    "settings.custom.name": "自定义行宽",
    "settings.custom.desc": "仅在行宽档位选「自定义」时生效（36–96rem）。",

    "settings.perNote.name": "按笔记记住档位",
    "settings.perNote.desc": "每篇笔记可以固定自己的档位，切换笔记时自动套用。",

    "settings.pinned.title": "已固定档位的笔记（{n}）",
    "settings.pinned.empty": "还没有固定过档位的笔记",
    "settings.pinned.more": "…另外 {n} 条",

    "settings.preview.label": "行宽预览",
    "settings.preview.sample":
      "阅读行宽决定了眼睛每行的移动距离。窄一点更专注，宽一点更适合表格与代码。",

    "settings.reset.name": "恢复默认设置",
    "settings.reset.desc": "把总开关、行宽档位与每篇笔记的固定全部清回初始值。",
  },

  en: {
    "meta.desc":
      "Dense reading: tighter spacing plus an adjustable line width, with no Style Settings or CSS snippet required.",

    "command.toggle": "Toggle dense reading",
    "command.cycle": "Cycle line-width preset",
    "command.pin": "Pin line width for this note",
    "command.unpin": "Clear line width for this note",

    "notice.mode.on": "Dense reading: on",
    "notice.mode.off": "Dense reading: off",
    "notice.width": "Line width: {label}",
    "notice.pinned": 'Pinned to "{label}": {path}',
    "notice.unpinned": "This note's pinned width was cleared",

    "preset.w44": "Narrow",
    "preset.w54": "Balanced",
    "preset.w66": "Wide",
    "preset.w78": "Extra wide",
    "preset.custom": "Custom",

    "settings.usage":
      "Line width applies at the view layer and is independent of the master switch; spacing only kicks in while the switch is on. Both keep the same class names as the original dense-reading.css snippet, so migrating is seamless.",

    "settings.mode.name": "Dense spacing",
    "settings.mode.desc":
      "Tightens paragraph and heading spacing in reading view. With it off, nothing but the line width applies.",

    "settings.width.name": "Line-width preset",
    "settings.width.desc":
      "Overrides the theme's readable line width. Independent of the master switch.",

    "settings.custom.name": "Custom line width",
    "settings.custom.desc": "Only used when the preset above is set to Custom (36–96rem).",

    "settings.perNote.name": "Remember width per note",
    "settings.perNote.desc":
      "Each note can pin its own preset, applied automatically when you switch to it.",

    "settings.pinned.title": "Notes with a pinned preset ({n})",
    "settings.pinned.empty": "No note has a pinned preset yet",
    "settings.pinned.more": "…and {n} more",

    "settings.preview.label": "Width preview",
    "settings.preview.sample":
      "Line width sets how far the eye travels per line. Narrower reads more focused; wider suits tables and code.",

    "settings.reset.name": "Restore defaults",
    "settings.reset.desc":
      "Clear the master switch, the preset and every per-note pin back to their initial values.",
  },
};
const LOCALES = buildLocales();
/** 把公共表与本插件表合并；插件缺某语言时回落到英语。 */
function buildLocales() {
  const out = {};
  const langs = new Set([...Object.keys(COMMON), ...Object.keys(OWN)]);
  for (const lang of langs) {
    out[lang] = Object.assign(
      {},
      COMMON[lang] || COMMON.en,
      OWN[lang] || OWN.en
    );
  }
  return out;
}

/* ---------- 来自 i18n.js ---------- */
/* i18n —— 多语言运行时。

   为什么不用 Obsidian 的 moment.locale()：moment 只管日期格式化，不提供
   界面字符串表；而且用户在设置页切语言要即时生效，moment 的切换要等界面重建。

   设计约束：
   - t() 永不抛异常：缺键回落到英语，英语也缺就返回键名本身。
     设置页少一行字，好过整页白屏。
   - 支持 {name} 占位符；参数没给就原样保留，方便定位漏传。
   - 界面字符串全部集中在 locales.js，main.js 里不留字面量。

   这份 i18n.js 在四个自研插件里是同一份（各自复制，因为插件是独立仓库、
   不能互相 require）。改动请四处同步。 */

/** 设置页语言下拉框的定义顺序。 */
const LANGUAGE_OPTIONS = [
  { id: "auto", label: "跟随 Obsidian / Follow Obsidian" },
  { id: "zh", label: "简体中文" },
  { id: "en", label: "English" },
];

/**
 * 把偏好解析成实际语言 id。
 * "auto" 时读 Obsidian 的界面语言；任何异常都回落到英语 ——
 * 语言探测失败不值得让设置页打不开。
 */
function resolveLanguage(pref) {
  if (pref && pref !== "auto" && LOCALES[pref]) return pref;
  try {
    const raw =
      window.localStorage.getItem("language") ||
      document.documentElement.lang ||
      "";
    const short = String(raw).toLowerCase().slice(0, 2);
    if (short && LOCALES[short]) return short;
  } catch (e) {
    /* 忽略：回落英语 */
  }
  return "en";
}

function translate(lang, key, vars) {
  const table = LOCALES[lang] || LOCALES.en;
  let s = table[key];
  if (s === undefined) {
    const fb = LOCALES.en[key];
    s = fb === undefined ? key : fb;
  }
  if (!vars) return s;
  return String(s).replace(/\{(\w+)\}/g, (m, name) =>
    vars[name] === undefined ? m : String(vars[name])
  );
}

/** 绑定插件实例：读 settings.language，暴露 t()。 */
function bindI18n(plugin) {
  const current = () =>
    resolveLanguage(plugin && plugin.settings ? plugin.settings.language : "auto");

  plugin.i18n = {
    get resolved() {
      return current();
    },
    t(key, vars) {
      return translate(current(), key, vars);
    },
    options: LANGUAGE_OPTIONS,
  };
  return plugin.i18n;
}

/* ---------- 来自 sponsor.js ---------- */
/* 赞助区块。
 *
 * 刻意做成一个独立小节而不是塞进说明文字里：设置页是用户唯一会认真读的
 * 地方，藏起来等于没有。区块只渲染链接，不引任何外部脚本或图片 ——
 * 插件必须保持零网络请求，否则会在社区市场审核时被质疑。
 *
 * 为什么只有 GitHub Sponsors 一条：
 *   最初国内 / 海外分列（爱发电 + Ko-fi），但 qy 决定统一走 GitHub ——
 *   单一入口便于维护，也避免在插件里出现多个可能失效/需要实名认证的平台。
 *   保留 SPONSORS 数组结构（而不是塌成一个字符串），是为了将来真要加
 *   第二条时改数据即可，不用动渲染代码。
 */

const SPONSORS = [
  { label: "GitHub Sponsors", url: "https://github.com/sponsors/yunmin311" },
];

function linkRow(parent, label, url) {
  const a = parent.createEl("a", { cls: "sp-link", text: label, href: url });
  a.setAttr("target", "_blank");
  a.setAttr("rel", "noopener");
}

/** 在 parent 里渲染赞助区块。t 是当前语言的取词函数。 */
function renderSponsor(parent, t) {
  const box = parent.createDiv({ cls: "sp-box" });
  box.createDiv({ cls: "sp-title", text: t("sponsor.title") });
  box.createDiv({ cls: "sp-body", text: t("sponsor.body") });

  const row = box.createDiv({ cls: "sp-row" });
  for (const l of SPONSORS) linkRow(row, l.label, l.url);
}

/* ======================== 内联模块结束 ======================== */
/* ---------------------------------------------------------------- 常量 */

const WIDTH_CLASSES = ["dense-w44", "dense-w54", "dense-w66", "dense-w78", "dense-w-custom"];
const MODE_CLASS = "dense-reading-mode";

/** 档位表：值是 rem 数；null 表示「自定义」，另取 settings.customWidth。
 *  `cls` 是它对应的 body class —— 显式写出来而不是靠字符串拼，
 *  因为 "custom" 这种档位名一旦去拼就会拼成 `dense-wustom`。
 *  `key` 是显示名的 i18n 键，语言切换后标签跟着变，class 与 id 永不随语言变。 */
const PRESETS = [
  { id: "w44", key: "preset.w44", rem: 44, cls: "dense-w44" },
  { id: "w54", key: "preset.w54", rem: 54, cls: "dense-w54" },
  { id: "w66", key: "preset.w66", rem: 66, cls: "dense-w66" },
  { id: "w78", key: "preset.w78", rem: 78, cls: "dense-w78" },
  { id: "custom", key: "preset.custom", rem: null, cls: "dense-w-custom" },
];

/** 档位 id → body class。唯一入口，避免在多处重复拼接逻辑。 */
function classForPreset(id) {
  const hit = PRESETS.find((p) => p.id === id);
  return hit ? hit.cls : "dense-w54";
}

const DEFAULT_SETTINGS = {
  /** 总开关：阅读视图的密排间距。与行宽互相独立，沿用片段的语义。 */
  denseMode: false,
  /** 行宽档位 id（见 PRESETS）。 */
  widthPreset: "w54",
  /** 自定义档位的 rem 数（36–96，与片段的滑条范围一致）。 */
  customWidth: 54,
  /** 打开新笔记时，是否自动套用该笔记记住的档位。 */
  rememberPerNote: true,
  /** 每篇笔记的档位覆盖：{ "path/to/note.md": "w66" }。 */
  perNote: {},
  /** 界面语言：auto / zh / en（见 i18n.js）。 */
  language: "auto",
};

/* ---------------------------------------------------------------- 主插件 */

class DenseReadingPlugin extends Plugin {
  async onload() {
    const saved = (await this.loadData()) || {};
    this.settings = Object.assign({}, DEFAULT_SETTINGS, saved);
    if (typeof this.settings.perNote !== "object" || this.settings.perNote === null) {
      this.settings.perNote = {};
    }

    // 首次加载：把状态落到 body 上。
    this.applyClasses();

    bindI18n(this);

    this.addSettingTab(new DenseReadingSettingTab(this.app, this));

    const t = (k, v) => this.i18n.t(k, v);

    this.addCommand({
      id: "toggle-dense-mode",
      name: t("command.toggle"),
      callback: async () => {
        this.settings.denseMode = !this.settings.denseMode;
        await this.saveSettings();
        this.applyClasses();
        new Notice(
          this.i18n.t(this.settings.denseMode ? "notice.mode.on" : "notice.mode.off")
        );
      },
    });

    this.addCommand({
      id: "cycle-width",
      name: t("command.cycle"),
      callback: async () => {
        const ids = PRESETS.map((p) => p.id);
        const at = ids.indexOf(this.settings.widthPreset);
        this.settings.widthPreset = ids[(at + 1) % ids.length];
        await this.saveSettings();
        this.applyClasses();
        new Notice(
          this.i18n.t("notice.width", {
            label: this.presetLabel(this.settings.widthPreset),
          })
        );
      },
    });

    this.addCommand({
      id: "set-width-for-note",
      name: t("command.pin"),
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "md") return false;
        if (!checking) void this.pinCurrentNote(file.path);
        return true;
      },
    });

    this.addCommand({
      id: "clear-width-for-note",
      name: t("command.unpin"),
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || !(file.path in this.settings.perNote)) return false;
        if (!checking) void this.clearNotePin(file.path);
        return true;
      },
    });

    // 换笔记时套用该笔记自己的档位（如果有）。
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        this.applyClasses();
      })
    );

    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.applyClasses();
      })
    );
  }

  onunload() {
    // 卸载时把插件加的 class 全部摘掉，不留残留。
    try {
      document.body.removeClass(MODE_CLASS, ...WIDTH_CLASSES);
    } catch {
      /* 忽略卸载竞态 */
    }
  }

  /* -------------------------------------------------------------- 状态 */

  presetLabel(id) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return id;
    const name = this.i18n.t(p.key);
    return p.rem === null
      ? `${name}（${this.settings.customWidth}rem）`
      : `${name}（${p.rem}rem）`;
  }

  /** 当前笔记若固定过档位，返回它；否则返回全局档位。 */
  effectivePreset() {
    if (!this.settings.rememberPerNote) return this.settings.widthPreset;
    try {
      const file = this.app.workspace.getActiveFile();
      if (file && file.extension === "md") {
        const pinned = this.settings.perNote[file.path];
        if (pinned && PRESETS.some((p) => p.id === pinned)) return pinned;
      }
    } catch {
      /* 拿不到活动文件就用全局值 */
    }
    return this.settings.widthPreset;
  }

  /** 把两个维度的状态写成 body class —— 这是插件唯一真正「做事」的地方。 */
  applyClasses() {
    const body = document.body;
    if (!body) return;
    const preset = this.effectivePreset() || "w54";
    const widthClass = classForPreset(preset);

    try {
      body.removeClass(...WIDTH_CLASSES);
      body.addClass(widthClass);

      if (this.settings.denseMode) body.addClass(MODE_CLASS);
      else body.removeClass(MODE_CLASS);

      // 自定义档位靠这个变量取值；CSS 里写了 var(--dense-width-value, 54rem) 兜底。
      body.style.setProperty("--dense-width-value", `${this.clampWidth(this.settings.customWidth)}rem`);
    } catch {
      /* 任何异常都不该让插件崩掉；最坏情况就是样式没生效。 */
    }
  }

  clampWidth(raw) {
    const n = Number(raw);
    if (!Number.isFinite(n)) return 54;
    return Math.min(96, Math.max(36, n));
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async setPreset(id) {
    this.settings.widthPreset = id;
    await this.saveSettings();
    this.applyClasses();
  }

  async setDenseMode(on) {
    this.settings.denseMode = on;
    await this.saveSettings();
    this.applyClasses();
  }

  async setCustomWidth(rem) {
    this.settings.customWidth = this.clampWidth(rem);
    await this.saveSettings();
    this.applyClasses();
  }

  /** 把当前档位固定到某篇笔记上。 */
  async pinCurrentNote(path) {
    const id = this.effectivePreset();
    this.settings.perNote[path] = id;
    await this.saveSettings();
    this.applyClasses();
    new Notice(
      this.i18n.t("notice.pinned", { label: this.presetLabel(id), path })
    );
  }

  async clearNotePin(path) {
    if (path in this.settings.perNote) {
      delete this.settings.perNote[path];
      await this.saveSettings();
      this.applyClasses();
      new Notice(this.i18n.t("notice.unpinned"));
    }
  }
}

/* ---------------------------------------------------------------- 设置页 */

class DenseReadingSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    const t = (k, v) => this.plugin.i18n.t(k, v);
    containerEl.empty();
    containerEl.createEl("h3", { text: "Dense Reading" });

    new Setting(containerEl)
      .setName(t("settings.language.name"))
      .setDesc(t("settings.language.desc"))
      .addDropdown((drop) => {
        for (const opt of this.plugin.i18n.options) {
          drop.addOption(opt.id, opt.label);
        }
        drop.setValue(this.plugin.settings.language || "auto").onChange(
          async (v) => {
            this.plugin.settings.language = v;
            await this.plugin.saveSettings();
            this.display();
          }
        );
      });

    containerEl.createDiv({ cls: "dr-usage" }, (el) => {
      el.createEl("p", { text: t("settings.usage") });
    });

    new Setting(containerEl)
      .setName(t("settings.mode.name"))
      .setDesc(t("settings.mode.desc"))
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.denseMode).onChange((v) => {
          void this.plugin.setDenseMode(v);
        })
      );

    new Setting(containerEl)
      .setName(t("settings.width.name"))
      .setDesc(t("settings.width.desc"))
      .addDropdown((drop) => {
        for (const p of PRESETS) {
          const name = t(p.key);
          drop.addOption(p.id, p.rem === null ? name : `${name} ${p.rem}rem`);
        }
        drop.setValue(this.plugin.settings.widthPreset).onChange((v) => {
          void this.plugin.setPreset(v);
          this.display();
        });
      });

    new Setting(containerEl)
      .setName(t("settings.custom.name"))
      .setDesc(t("settings.custom.desc"))
      .addSlider((s) =>
        s
          .setLimits(36, 96, 0.5)
          .setValue(this.plugin.settings.customWidth)
          .setDynamicTooltip()
          .onChange((v) => {
            void this.plugin.setCustomWidth(v);
            this.updatePreview();
          })
      );

    new Setting(containerEl)
      .setName(t("settings.perNote.name"))
      .setDesc(t("settings.perNote.desc"))
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.rememberPerNote).onChange((v) => {
          void (async () => {
            this.plugin.settings.rememberPerNote = v;
            await this.plugin.saveSettings();
            this.plugin.applyClasses();
            this.display();
          })();
        })
      );

    if (this.plugin.settings.rememberPerNote) {
      const pinned = Object.keys(this.plugin.settings.perNote);
      const box = containerEl.createDiv({ cls: "dr-pinned" });
      box.createEl("div", {
        cls: "dr-pinned-title",
        text: pinned.length
          ? t("settings.pinned.title", { n: pinned.length })
          : t("settings.pinned.empty"),
      });
      for (const path of pinned.slice(0, 12)) {
        const row = box.createDiv({ cls: "dr-pinned-row" });
        row.createSpan({ text: path });
        row
          .createEl("button", { text: t("common.clear") })
          .addEventListener("click", () => {
            void (async () => {
              await this.plugin.clearNotePin(path);
              this.display();
            })();
          });
      }
      if (pinned.length > 12) {
        box.createEl("div", {
          cls: "dr-pinned-more",
          text: t("settings.pinned.more", { n: pinned.length - 12 }),
        });
      }
    }

    // 实时预览：改滑条时立刻看到宽度变化，不用来回切笔记试。
    //
    // 为什么不能直接 `max-width: <n>rem`：
    //   真实行宽是 44–96rem（约 704–1536px），而设置页内容区只有约 640px 宽。
    //   直接设绝对值的话**每个档位都会撑满整格**，五个档位看起来一模一样
    //   —— 预览等于没有。所以这里改成等比映射（见 updatePreview）。
    this.previewEl = containerEl.createDiv({ cls: "dr-preview" });
    this.previewEl.createEl("div", {
      cls: "dr-preview-label",
      text: t("settings.preview.label"),
    });
    const stage = this.previewEl.createDiv({ cls: "dr-preview-stage" });
    // 标尺：把「相对于最窄档位」的宽度画出来，让档位差异可见。
    const ruler = stage.createDiv({ cls: "dr-preview-ruler" });
    this.barEl = ruler.createDiv({ cls: "dr-preview-bar" });
    this.sampleEl = stage.createDiv({ cls: "dr-preview-sample" });
    this.sampleEl.setText(t("settings.preview.sample"));
    this.readoutEl = this.previewEl.createDiv({ cls: "dr-preview-readout" });
    this.updatePreview();

    new Setting(containerEl)
      .setName(t("settings.reset.name"))
      .setDesc(t("settings.reset.desc"))
      .addButton((b) =>
        b.setButtonText(t("common.reset")).onClick(async () => {
          // 语言是「这一页本身」的偏好，恢复默认时刻意保留，
          // 否则中文用户点一下按钮界面就变成英文了。
          const keepLang = this.plugin.settings.language;
          this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS, {
            perNote: {},
            language: keepLang,
          });
          await this.plugin.saveSettings();
          this.plugin.applyClasses();
          new Notice(t("common.reset.done"));
          this.display();
        })
      );

    this.renderFooter(containerEl, t);
  }

  /** 版本 + 仓库 + 赞助。四个插件共用同一套结构与文案。 */
  renderFooter(containerEl, t) {
    const wrap = containerEl.createDiv({ cls: "dr-about" });

    const meta = wrap.createDiv({ cls: "dr-about-meta" });
    meta.createSpan({ text: `${t("meta.version")} ${this.plugin.manifest.version}` });
    meta.createSpan({ cls: "dr-about-sep", text: "·" });
    const repo = meta.createEl("a", {
      text: this.plugin.manifest.id,
      href: `https://github.com/yunmin311/${this.plugin.manifest.id}-obsidian`,
    });
    repo.setAttr("target", "_blank");
    repo.setAttr("rel", "noopener");

    renderSponsor(wrap, t);
  }

  /**
   * 把真实行宽映射到设置页里能看出差异的比例。
   *
   * 真实行宽 44–96rem 全部超过设置页宽度，直接撑满会导致档位之间毫无区别。
   * 这里按 44rem 归一：最窄档位占 55%，最宽档位占 100%，中间线性插值。
   * 于是 w44 与 w78 的差距（44 → 78，约 1.8 倍）在预览里表现为 55% → 81%，
   * 一眼可辨；这是**比例示意**，不是像素级等比。
   */
  updatePreview() {
    if (!this.sampleEl) return;
    const MIN_REM = 44;
    const MAX_REM = 96;
    const preset = PRESETS.find((x) => x.id === this.plugin.settings.widthPreset);
    const rem =
      preset && preset.rem !== null ? preset.rem : this.plugin.settings.customWidth;

    const t = Math.max(0, Math.min(1, (rem - MIN_REM) / (MAX_REM - MIN_REM)));
    const pct = 55 + t * 45; // 55% – 100%

    this.sampleEl.style.maxWidth = pct.toFixed(1) + "%";
    this.sampleEl.style.margin = "0 auto";
    if (this.barEl) this.barEl.style.width = pct.toFixed(1) + "%";
    if (this.readoutEl) {
      const label = preset && preset.rem !== null ? preset.id : "custom";
      this.readoutEl.setText(
        this.plugin.i18n.t("settings.preview.readout", {
          preset: label,
          rem: String(rem),
          px: String(Math.round(rem * 16)),
        })
      );
    }
  }
}

module.exports = DenseReadingPlugin;
