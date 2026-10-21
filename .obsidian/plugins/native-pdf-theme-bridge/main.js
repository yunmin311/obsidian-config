const { Plugin, PluginSettingTab, Setting } = require("obsidian");

const DEFAULTS = Object.freeze({
  followTheme: true,
  pageSpacing: true,
  top: 12,
  right: 12,
  bottom: 12,
  left: 12,
});
const SIDES = ["top", "right", "bottom", "left"];
function supportsRepeatedPadding(win) {
  const chromium = win?.navigator?.userAgent.match(
    /(?:Chrome|Chromium)\/(\d+)/,
  );
  // Older Chromium supports clone on inline boxes, but not paginated blocks.
  return (
    (!chromium || Number(chromium[1]) >= 130) &&
    !!win?.CSS?.supports("box-decoration-break", "clone")
  );
}
function normalizeSettings(saved) {
  const result = { ...DEFAULTS };
  if (!saved || typeof saved !== "object") return result;
  for (const key of ["followTheme", "pageSpacing"])
    if (typeof saved[key] === "boolean") result[key] = saved[key];
  for (const side of SIDES) {
    if (typeof saved[side] === "number" && Number.isFinite(saved[side]))
      result[side] = Math.max(0, Math.min(40, saved[side]));
  }
  return result;
}

class ExportSettingsTab extends PluginSettingTab {
  display() {
    const { containerEl, plugin } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "PDF 导出 / PDF export" });
    containerEl.createEl("p", {
      text: "保留原生导出流程。满版纸纹请在导出弹窗选择「页边距：无」。设置在下次导出时生效。 / Keep native export. For full-bleed paper, select Margins: None in the export dialog. Changes apply to the next export.",
    });
    for (const [key, name, desc] of [
      [
        "followTheme",
        "跟随当前配色 / Follow current palette",
        "沿用 Obsidian 当前浅深色，而不是系统配色。关闭后不修正配色，主题和片段仍生效。 / Use the active Obsidian palette, not the OS scheme. Off skips palette corrections; theme/snippet rules still apply.",
      ],
      [
        "pageSpacing",
        "逐页留白 / Per-page spacing",
        "在每一页重复四边内边距，不裁切纸纹。关闭后沿用现有主题和片段。 / Repeat content spacing on every page without cropping paper. Off leaves spacing to the theme and snippets.",
      ],
    ])
      new Setting(containerEl)
        .setName(name)
        .setDesc(desc)
        .addToggle((toggle) =>
          toggle.setValue(plugin.settings[key]).onChange(async (value) => {
            plugin.settings[key] = value;
            await plugin.saveData(plugin.settings);
          }),
        );
    for (const [side, label] of [
      ["top", "上 / Top"],
      ["right", "右 / Right"],
      ["bottom", "下 / Bottom"],
      ["left", "左 / Left"],
    ]) {
      new Setting(containerEl)
        .setName(`${label} (mm)`)
        .setDesc(
          "0–40 毫米，仅作用于导出正文。 / 0–40 mm, export content only.",
        )
        .addText((text) => {
          text.inputEl.type = "number";
          text.inputEl.setAttribute("min", "0");
          text.inputEl.setAttribute("max", "40");
          text.inputEl.setAttribute("step", "0.5");
          text
            .setValue(String(plugin.settings[side]))
            .onChange(async (value) => {
              if (!value.trim()) return;
              const number = Number(value);
              if (!Number.isFinite(number) || number < 0 || number > 40) return;
              plugin.settings[side] = number;
              await plugin.saveData(plugin.settings);
            });
        });
    }
    containerEl.createEl("p", {
      text: "纸纹与字体仍由你的主题和 CSS 片段提供。大图、超高代码块和复杂第三方嵌入仍受原生分页限制。 / Textures and fonts come from your theme/snippets. Oversized images, code blocks and third-party embeds remain subject to native pagination limits.",
    });
    if (typeof window !== "undefined" && !supportsRepeatedPadding(window)) {
      containerEl.createEl("p", {
        text: "当前浏览器内核不支持逐页留白，已保留原有分页。请更新 Obsidian 安装程序（仅应用内更新可能不会升级内核）。 / Per-page spacing is unavailable in this browser engine; original pagination is retained. Update the Obsidian installer, not only the in-app package.",
      });
    }
  }
}

// No command replacement, Electron patch, timers, external settings writes or network.
// Obsidian renders native PDFs in a separate document under .print.
module.exports = class NativePdfThemeBridge extends Plugin {
  async onload() {
    this.settings = { ...DEFAULTS };
    this.registerMarkdownPostProcessor((el) => this.prepareExport(el), 1000);
    this.settings = normalizeSettings(await this.loadData());
    this.addSettingTab(new ExportSettingsTab(this.app, this));
  }

  prepareExport(el) {
    const targetDocument = el.ownerDocument;
    if (targetDocument === document || !el.closest(".print")) return;
    const sourceWindow = document.defaultView;
    if (!sourceWindow || sourceWindow.matchMedia("print").matches) return;
    this.preparePageSpacing(targetDocument);
    if (!this.settings.followTheme) return;
    const dark = document.body.classList.contains("theme-dark");
    targetDocument.body.classList.toggle("theme-dark", dark);
    targetDocument.body.classList.toggle("theme-light", !dark);

    // Legacy local paper CSS selected its paper through the OS theme. Alter
    // only its COPY in the disposable export document, never the source sheet.
    for (const style of targetDocument.head.querySelectorAll("style")) {
      if (
        style.textContent.includes("450mm") &&
        style.textContent.includes("data:image/png;base64,")
      ) {
        style.textContent = style.textContent.replace(
          /\(prefers-color-scheme:\s*(dark|light)\)/g,
          (_, mode) =>
            (mode === "dark") === dark
              ? "(min-width: 0px)"
              : "(max-width: 0px)",
        );
      }
    }

    // Never import export-only styles or resource loaders into the live page.
    // Use localName so SVG elements are covered too; keep PDF originals intact.
    const excluded =
      "script,style,iframe,object,embed,audio,video,img,image,source,link,base,meta";
    const excludedNames = new Set(excluded.split(","));
    if (excludedNames.has(el.localName.toLowerCase())) return;
    const host = document.createElement("div");
    host.dataset.nativePdfProbe = "";
    host.className = "workspace-leaf-content";
    host.setAttribute("data-type", "markdown");
    host.style.cssText =
      "position:fixed;left:-100000px;top:0;width:800px;visibility:hidden;pointer-events:none;contain:layout style;";
    const content = document.createElement("div");
    content.className = "view-content";
    const reading = document.createElement("div");
    reading.className = "markdown-reading-view";
    const probe = el.cloneNode(true);
    // Clones must not load media, duplicate IDs, or run scripts.
    for (const node of [probe, ...probe.querySelectorAll("*")]) {
      node.removeAttribute("id");
      for (const attribute of [...node.attributes]) {
        if (/^on/i.test(attribute.name)) node.removeAttribute(attribute.name);
      }
    }
    for (const node of probe.querySelectorAll(excluded)) node.remove();
    reading.append(probe);
    content.append(reading);
    host.append(content);
    document.body.append(host);
    try {
      // Match paths rather than indexes: inert media were removed from probe.
      const pairs = [];
      const collect = (original, clone) => {
        pairs.push([original, clone]);
        const children = [...original.children].filter(
          (node) => !excludedNames.has(node.localName.toLowerCase()),
        );
        children.forEach((child, index) => {
          if (clone.children[index]) collect(child, clone.children[index]);
        });
      };
      collect(el, probe);
      const properties = [
        "color",
        "background-color",
        "border-top-color",
        "border-right-color",
        "border-bottom-color",
        "border-left-color",
        "text-decoration-color",
        "fill",
        "stroke",
      ];
      // Read all computed values before writing: no per-node frame delays.
      const snapshot = pairs.map(([target, clone]) => {
        const computed = sourceWindow.getComputedStyle(clone);
        return [
          target,
          properties.map((name) => [name, computed.getPropertyValue(name)]),
        ];
      });
      for (const [target, values] of snapshot) {
        for (const [name, value] of values)
          if (value) target.style.setProperty(name, value, "important");
        target.style.setProperty("print-color-adjust", "exact", "important");
      }
      // Keep paper visible behind the document itself, not an opaque rectangle.
      el.style.setProperty("background-color", "transparent", "important");
    } finally {
      host.remove();
    }
  }

  preparePageSpacing(targetDocument) {
    if (
      !this.settings.pageSpacing ||
      targetDocument.getElementById("native-pdf-theme-bridge-layout")
    )
      return;
    // Repeating block padding preserves full-bleed backgrounds. @page margins
    // would clip those backgrounds; layout tables alter native content flow.
    if (!supportsRepeatedPadding(targetDocument.defaultView)) return;
    const root =
      targetDocument.querySelector(".print .markdown-preview-view") ||
      targetDocument.querySelector(".print .markdown-rendered") ||
      targetDocument.querySelector(".print");
    if (!root) return;
    root.setAttribute("data-native-pdf-page-box", "");
    const style = targetDocument.createElement("style");
    style.id = "native-pdf-theme-bridge-layout";
    style.textContent = `@media print {
      html body .print .markdown-rendered {padding:0!important;}
      html body .print[data-native-pdf-page-box],
      html body .print [data-native-pdf-page-box] {
        display:block!important;box-sizing:border-box!important;
        padding:${SIDES.map((side) => this.settings[side] + "mm").join(" ")}!important;
        box-decoration-break:clone!important;-webkit-box-decoration-break:clone!important;
      }
    }`;
    targetDocument.head.append(style);
  }
};
