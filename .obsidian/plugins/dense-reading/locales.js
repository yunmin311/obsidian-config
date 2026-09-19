/* Dense Reading —— 界面字符串表。
   只放本插件专属的键；语言下拉、赞助区块、通用按钮由公共表提供。 */

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
