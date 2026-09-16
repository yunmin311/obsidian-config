/* Toolbar Pin Toggle
   一个命令、两种常驻模式（设置里选择）：
   - fixed：委托 Editing Toolbar 原生命令，切换底部常驻工具条
   - top  ：切换 body.etb-pinned，让顶部悬停工具条常驻显示
   全部 Editing Toolbar 外观/行为修正收编在本插件 styles.css，
   启用本插件即可，无需额外 CSS snippet。 */

"use strict";

const { Plugin, PluginSettingTab, Setting, Notice } = require("obsidian");

const DEFAULTS = { mode: "fixed", topPinned: false };

class ToolbarPinTogglePlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULTS, await this.loadData());
    this.applyTopPinned(this.settings.topPinned);

    this.addCommand({
      id: "toggle-pin",
      name: "切换工具栏常驻",
      callback: async () => {
        if (this.settings.mode === "top") {
          this.settings.topPinned = !this.settings.topPinned;
          await this.saveData(this.settings);
          this.applyTopPinned(this.settings.topPinned);
          new Notice(
            `顶部工具栏常驻：${this.settings.topPinned ? "开" : "关"}`
          );
        } else {
          this.app.commands.executeCommandById(
            "editing-toolbar:toggle-fixed-toolbar"
          );
        }
      },
    });

    this.addSettingTab(new ToolbarPinToggleSettingTab(this.app, this));
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
    containerEl.empty();
    containerEl.createEl("h3", { text: "工具栏常驻（Alt+Q）" });

    new Setting(containerEl)
      .setName("常驻模式")
      .setDesc(
        "底部常驻条：切换 Editing Toolbar 的原生 fixed 工具条；" +
          "顶部常驻：让顶部的悬停工具条保持常驻显示。"
      )
      .addDropdown((drop) =>
        drop
          .addOption("fixed", "底部常驻工具条（原生 fixed）")
          .addOption("top", "顶部工具条常驻")
          .setValue(this.plugin.settings.mode)
          .onChange(async (value) => {
            if (value === "fixed" && this.plugin.settings.topPinned) {
              // 从 top 模式切回 fixed 时，撤掉顶栏常驻，避免两条叠加
              this.plugin.settings.topPinned = false;
              this.plugin.applyTopPinned(false);
            }
            this.plugin.settings.mode = value;
            await this.plugin.saveData(this.plugin.settings);
            new Notice(`常驻模式：${value === "top" ? "顶部工具条常驻" : "底部常驻工具条"}`);
          })
      );
  }
}

module.exports = ToolbarPinTogglePlugin;
