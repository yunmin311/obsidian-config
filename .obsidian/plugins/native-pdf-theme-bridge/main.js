const { Plugin, PluginSettingTab, Setting, getLanguage } = require("obsidian");

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
    const zh = /^zh(?:[-_]|$)/i.test(typeof getLanguage === "function" ? getLanguage() : "en");
    const t = (chinese, english) => zh ? chinese : english;
    const heading = (name) => new Setting(containerEl).setName(name).setHeading();
    containerEl.empty();
    containerEl.createEl("h2", { text: t("PDF 导出", "PDF export") });
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: t("使用 Obsidian 原生「导出为 PDF」。设置自动保存，下次导出时生效。", "Use Obsidian’s native Export to PDF. Changes save automatically and apply to the next export."),
    });
    heading(t("配色", "Palette"));
    new Setting(containerEl)
      .setName(t("跟随当前配色", "Follow current palette"))
      .setDesc(t("跟随 Obsidian 的浅色或深色外观，而非系统外观。关闭后不修正导出配色。", "Follow Obsidian’s light or dark appearance, not the system appearance. Turn off to skip export color corrections."))
      .addToggle(toggle => toggle.setValue(plugin.settings.followTheme).onChange(async value => {
        plugin.settings.followTheme = value;
        await plugin.saveData(plugin.settings);
      }));
    heading(t("逐页留白", "Page layout"));
    const spacingInputs = [];
    new Setting(containerEl)
      .setName(t("逐页留白", "Per-page spacing"))
      .setDesc(t("每一页都保留正文留白，纸纹仍铺满纸面。关闭后使用主题和片段的布局。", "Repeat content spacing on every page while keeping paper full-bleed. Turn off to use theme and snippet layout."))
      .addToggle(toggle => toggle.setValue(plugin.settings.pageSpacing).onChange(async value => {
        plugin.settings.pageSpacing = value;
        spacingInputs.forEach(input => input.setDisabled(!value));
        await plugin.saveData(plugin.settings);
      }));
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: t("四边独立设置，单位：毫米。范围 0–40，默认各 12；不改变纸张尺寸。", "Set each side independently in millimeters. Range: 0–40; default: 12 each. Paper size is unchanged."),
    });
    for (const [side, label] of [
      ["top", t("上方留白", "Top spacing")],
      ["right", t("右侧留白", "Right spacing")],
      ["bottom", t("下方留白", "Bottom spacing")],
      ["left", t("左侧留白", "Left spacing")],
    ]) {
      const row = new Setting(containerEl);
      row
        .setName(`${label} (mm)`)
        .addText((text) => {
          spacingInputs.push(text);
          text.setDisabled(!plugin.settings.pageSpacing);
          text.inputEl.type = "number";
          text.inputEl.setAttribute("aria-label", `${label} (mm)`);
          text.inputEl.setAttribute("min", "0");
          text.inputEl.setAttribute("max", "40");
          text.inputEl.setAttribute("step", "0.5");
          text
            .setValue(String(plugin.settings[side]))
            .onChange(async (value) => {
              const number = Number(value);
              if (!value.trim() || !Number.isFinite(number) || number < 0 || number > 40) {
                const message = t("请输入 0–40 之间的毫米数值。", "Enter a value from 0 to 40 mm.");
                row.setDesc(message);
                text.inputEl.setCustomValidity(message);
                text.inputEl.setAttribute("aria-invalid", "true");
                return;
              }
              text.inputEl.setCustomValidity("");
              row.setDesc("");
              text.inputEl.setAttribute("aria-invalid", "false");
              plugin.settings[side] = number;
              await plugin.saveData(plugin.settings);
            });
          text.inputEl.addEventListener("blur", () => {
            text.setValue(String(plugin.settings[side]));
            text.inputEl.setCustomValidity("");
            row.setDesc("");
            text.inputEl.setAttribute("aria-invalid", "false");
          });
        });
    }
    heading(t("导出须知", "Before exporting"));
    new Setting(containerEl)
      .setName(t("满版纸纹：页边距选「无」", "Full-bleed paper: choose Margins: None"))
      .setDesc(t("在原生导出弹窗设置一次，Obsidian 会记住。插件不会替你修改此选项；其他页边距会裁切背景。", "Select this once in the native export dialog; Obsidian remembers it. The plugin does not change this option. Other margins crop the background."));
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: t("纸纹和字体由主题及 CSS 片段提供，本插件不内置素材。超大图片、代码块和第三方嵌入仍受原生分页限制。", "Textures and fonts come from your theme and CSS snippets; no assets are bundled. Oversized images, code blocks and third-party embeds retain native pagination limits."),
    });
    if (typeof window !== "undefined" && !supportsRepeatedPadding(window)) {
      containerEl.createEl("p", {
        cls: "mod-warning",
        text: t("当前内核不支持逐页留白，导出仍保留原有分页。请更新 Obsidian 桌面安装程序，仅应用内更新可能不会升级内核。", "This browser engine cannot repeat per-page spacing; exports retain original pagination. Update the Obsidian desktop installer, not only the in-app package."),
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
