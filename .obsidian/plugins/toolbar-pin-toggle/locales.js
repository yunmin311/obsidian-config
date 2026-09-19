/* Toolbar Pin Toggle —— 界面字符串表。
   只放本插件专属的键；语言下拉、赞助区块、通用按钮在 main.js 里另有公共表。 */

"use strict";

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

module.exports = { LOCALES: buildLocales() };

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
