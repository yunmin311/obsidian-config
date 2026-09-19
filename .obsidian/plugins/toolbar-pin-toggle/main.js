/* Toolbar Pin Toggle
   One command, two pinning modes (chosen in settings):
   - fixed: toggles Editing Toolbar's fixed (bottom) toolbar
   - top  : toggles body.etb-pinned, keeping the top toolbar visible

   ⚠️ This plugin is a companion to the "Editing Toolbar" community plugin:
   both modes act on toolbars that Editing Toolbar provides, so it does
   nothing useful on its own. That dependency is stated in the README and
   checked at load time (see ensureEditingToolbar) so a missing install
   produces a clear notice instead of a command that silently does nothing.

   All Editing Toolbar appearance/behaviour corrections live in this plugin's
   styles.css — enabling this plugin is enough, no extra CSS snippet. */

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
/* Toolbar Pin Toggle —— 界面字符串表。
   只放本插件专属的键；语言下拉、赞助区块、通用按钮在 main.js 里另有公共表。 */

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
    "meta.desc": "Editing Toolbar 的常驻/固定双模式开关。",

    "command.toggle": "切换工具栏常驻",

    "notice.missing": "「{name}」插件未启用 —— 请先安装并启用它（设置 → 第三方插件）。",
    "notice.mode.fixed": "常驻模式：固定底部工具栏",
    "notice.mode.top": "常驻模式：顶部工具栏常驻",
    "notice.pinned.on": "顶部工具栏：常驻",
    "notice.pinned.off": "顶部工具栏：自动隐藏",

    "settings.missing.title": "「{name}」是必需依赖",
    "settings.missing.body":
      "两种常驻模式作用的工具栏都由该插件提供。请先安装并启用它，然后重新加载 Obsidian。",

    "settings.usage.intro":
      "按 {key}（或从命令面板运行「切换工具栏常驻」）即可常驻 / 取消常驻下方选择的工具栏。",
    "settings.usage.rebind":
      "Alt+Q 只是默认值。要改键，去「设置 → 快捷键」搜索「切换工具栏常驻」。",

    "settings.mode.name": "常驻模式",
    "settings.mode.desc":
      "固定底部工具栏：切换 Editing Toolbar 的底部固定栏。顶部工具栏：让顶部工具栏保持可见，而不是自动收起。",
    "settings.mode.opt.fixed": "固定底部工具栏",
    "settings.mode.opt.top": "顶部工具栏",

    "settings.dep.name": "依赖状态",
    "settings.dep.present": "已安装「{name}」，两种模式都可用。",
    "settings.dep.absent": "未检测到「{name}」，本插件的命令暂时不会生效。",

    "settings.reset.name": "恢复默认设置",
    "settings.reset.desc": "把常驻模式与常驻状态清回初始值。",
  },

  en: {
    "meta.desc": "One toggle, two pinning modes, for the Editing Toolbar plugin.",

    "command.toggle": "Toggle toolbar pin",

    "notice.missing":
      'Toolbar Pin Toggle needs the "{name}" plugin — install and enable it first (Settings → Community plugins).',
    "notice.mode.fixed": "Pin mode: fixed bottom toolbar",
    "notice.mode.top": "Pin mode: top toolbar",
    "notice.pinned.on": "Top toolbar pinned: on",
    "notice.pinned.off": "Top toolbar pinned: off",

    "settings.missing.title": '"{name}" is required',
    "settings.missing.body":
      "Both pinning modes act on toolbars that plugin provides. Install and enable it, then reload Obsidian.",

    "settings.usage.intro":
      'Press {key} — or run "Toggle toolbar pin" from the command palette — to pin or unpin the toolbar chosen below.',
    "settings.usage.rebind":
      'Alt+Q is only the default. To rebind it, go to Settings → Hotkeys and search for "Toggle toolbar pin".',

    "settings.mode.name": "Pin mode",
    "settings.mode.desc":
      "Fixed toolbar: toggles Editing Toolbar's fixed bottom toolbar. Top toolbar: keeps the top toolbar visible instead of hiding itself.",
    "settings.mode.opt.fixed": "Fixed bottom toolbar",
    "settings.mode.opt.top": "Top toolbar",

    "settings.dep.name": "Dependency",
    "settings.dep.present": '"{name}" is installed — both modes are available.',
    "settings.dep.absent": '"{name}" was not detected — this plugin\'s command does nothing for now.',

    "settings.reset.name": "Restore defaults",
    "settings.reset.desc": "Reset the pin mode and the pinned state to their initial values.",
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

   这份文件在三个插件里是同一份（各自复制一份，因为插件是独立仓库、
   不能互相 require）。改动请三处同步。 */

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
const DEFAULTS = { mode: "fixed", topPinned: false, language: "auto" };

/** The command we delegate the "fixed" mode to; its existence is also how we
 *  detect whether the required companion plugin is present. */
const ETB_COMMAND = "editing-toolbar:toggle-fixed-toolbar";
const ETB_PLUGIN_NAME = "Editing Toolbar";

class ToolbarPinTogglePlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULTS, await this.loadData());
    bindI18n(this);
    this.applyTopPinned(this.settings.topPinned);

    const t = (k, v) => this.i18n.t(k, v);

    this.addCommand({
      id: "toggle-pin",
      // 命令名会随界面语言变化：Obsidian 每次打开命令面板都会重读注册表，
      // 而切换语言后我们重建设置页；命令名以加载时的语言为准，
      // 想立刻生效可重新加载插件（设置页里有说明）。
      name: t("command.toggle"),
      // Ship the default binding the README has always advertised. Without
      // this field the command exists but has NO hotkey on a fresh install,
      // so "Default hotkey: Alt+Q" was only true for users who bound it by
      // hand. An explicit user binding (hotkeys.json) still wins over this.
      hotkeys: [{ modifiers: ["Alt"], key: "Q" }],
      callback: async () => {
        if (!this.hasEditingToolbar()) {
          this.warnMissingEditingToolbar();
          return;
        }
        if (this.settings.mode === "top") {
          this.settings.topPinned = !this.settings.topPinned;
          await this.saveData(this.settings);
          this.applyTopPinned(this.settings.topPinned);
          new Notice(
            this.i18n.t(
              this.settings.topPinned ? "notice.pinned.on" : "notice.pinned.off"
            )
          );
        } else {
          this.app.commands.executeCommandById(ETB_COMMAND);
        }
      },
    });

    this.addSettingTab(new ToolbarPinToggleSettingTab(this.app, this));

    // Surface the dependency once at load rather than letting the command
    // silently do nothing. Deferred so it does not race Obsidian's own
    // "plugin loaded" notices.
    if (!this.hasEditingToolbar()) {
      window.setTimeout(() => this.warnMissingEditingToolbar(), 1000);
    }
  }

  /**
   * Whether the required companion plugin is available.
   *
   * Probed through the command registry because that is the very object the
   * "fixed" mode delegates to — if the command is absent, that mode could not
   * have worked either. Any failure is treated as "missing": a false warning
   * is far better than a command that silently does nothing.
   */
  hasEditingToolbar() {
    try {
      const commands = this.app.commands;
      if (!commands) return false;
      if (typeof commands.findCommand === "function") {
        return !!commands.findCommand(ETB_COMMAND);
      }
      return !!(commands.commands && commands.commands[ETB_COMMAND]);
    } catch {
      return false;
    }
  }

  warnMissingEditingToolbar() {
    new Notice(this.i18n.t("notice.missing", { name: ETB_PLUGIN_NAME }), 8000);
  }

  applyTopPinned(pinned) {
    document.body.classList.toggle("etb-pinned", !!pinned);
  }

  onunload() {
    document.body.classList.remove("etb-pinned");
  }
}

class ToolbarPinToggleSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    const t = (k, v) => this.plugin.i18n.t(k, v);
    containerEl.empty();
    containerEl.createEl("h3", { text: "Toolbar Pin Toggle" });

    // 语言放在最上面：它是这一页里唯一「改变这一页本身」的选项。
    new Setting(containerEl)
      .setName(t("settings.language.name"))
      .setDesc(t("settings.language.desc"))
      .addDropdown((drop) => {
        for (const opt of this.plugin.i18n.options) {
          drop.addOption(opt.id, opt.label);
        }
        drop.setValue(this.plugin.settings.language || "auto").onChange(
          async (value) => {
            this.plugin.settings.language = value;
            await this.plugin.saveData(this.plugin.settings);
            this.display();
          }
        );
      });

    // Stated up front rather than buried in the README: without the companion
    // plugin every option on this page is inert.
    if (!this.plugin.hasEditingToolbar()) {
      containerEl.createDiv({ cls: "tpt-missing-dependency" }, (el) => {
        el.createEl("strong", {
          text: t("settings.missing.title", { name: ETB_PLUGIN_NAME }),
        });
        el.createEl("div", { text: t("settings.missing.body") });
      });
    }

    // Usage block, placed above the mode dropdown. The plugin has exactly one
    // interaction, so this page is the right place to teach it: a bare
    // dropdown never told anyone that Alt+Q is the toggle, or that rebinding
    // lives in Settings → Hotkeys rather than here.
    containerEl.createDiv({ cls: "tpt-usage" }, (el) => {
      // 文案里的 {key} 要用 <kbd> 包起来，所以拿一个不可能出现的哨兵值
      // 切出前后两段，再在中间插元素 —— 直接写死 "Press " 就没法翻译了。
      const parts = t("settings.usage.intro", { key: "\u0000" }).split("\u0000");
      const p1 = el.createEl("p");
      p1.appendText(parts[0] || "");
      p1.createEl("kbd", { text: "Alt+Q" });
      p1.appendText(parts[1] || "");
      el.createEl("p", { text: t("settings.usage.rebind") });
    });

    new Setting(containerEl)
      .setName(t("settings.mode.name"))
      .setDesc(t("settings.mode.desc"))
      .addDropdown((drop) =>
        drop
          .addOption("fixed", t("settings.mode.opt.fixed"))
          .addOption("top", t("settings.mode.opt.top"))
          .setValue(this.plugin.settings.mode)
          .onChange(async (value) => {
            if (value === "fixed" && this.plugin.settings.topPinned) {
              // Leaving top mode: drop the pin so the two never stack.
              this.plugin.settings.topPinned = false;
              this.plugin.applyTopPinned(false);
            }
            this.plugin.settings.mode = value;
            await this.plugin.saveData(this.plugin.settings);
            new Notice(
              t(value === "top" ? "notice.mode.top" : "notice.mode.fixed")
            );
          })
      );

    new Setting(containerEl)
      .setName(t("settings.dep.name"))
      .setDesc(
        this.plugin.hasEditingToolbar()
          ? t("settings.dep.present", { name: ETB_PLUGIN_NAME })
          : t("settings.dep.absent", { name: ETB_PLUGIN_NAME })
      );

    new Setting(containerEl)
      .setName(t("settings.reset.name"))
      .setDesc(t("settings.reset.desc"))
      .addButton((b) =>
        b.setButtonText(t("common.reset")).onClick(async () => {
          // 语言是「这一页本身」的偏好，恢复默认时刻意保留，
          // 否则中文用户点一下按钮界面就变成英文了。
          const keepLang = this.plugin.settings.language;
          this.plugin.settings = Object.assign({}, DEFAULTS, {
            language: keepLang,
          });
          await this.plugin.saveData(this.plugin.settings);
          this.plugin.applyTopPinned(false);
          new Notice(t("common.reset.done"));
          this.display();
        })
      );

    this.renderFooter(containerEl, t);
  }

  /** 版本 + 仓库 + 赞助。四个插件共用同一套结构与文案。 */
  renderFooter(containerEl, t) {
    const wrap = containerEl.createDiv({ cls: "tpt-about" });

    const meta = wrap.createDiv({ cls: "tpt-about-meta" });
    const version = this.plugin.manifest.version;
    meta.createSpan({
      text: `${t("meta.version")} ${version}`,
    });
    meta.createSpan({ cls: "tpt-about-sep", text: "·" });
    const repo = meta.createEl("a", {
      text: this.plugin.manifest.id,
      href: `https://github.com/yunmin311/${this.plugin.manifest.id}-obsidian`,
    });
    repo.setAttr("target", "_blank");
    repo.setAttr("rel", "noopener");

    renderSponsor(wrap, t);
  }
}

module.exports = ToolbarPinTogglePlugin;
