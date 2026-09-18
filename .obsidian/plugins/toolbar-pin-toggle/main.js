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

const DEFAULTS = { mode: "fixed", topPinned: false };

/** The command we delegate the "fixed" mode to; its existence is also how we
 *  detect whether the required companion plugin is present. */
const ETB_COMMAND = "editing-toolbar:toggle-fixed-toolbar";
const ETB_PLUGIN_NAME = "Editing Toolbar";

class ToolbarPinTogglePlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULTS, await this.loadData());
    this.applyTopPinned(this.settings.topPinned);

    this.addCommand({
      id: "toggle-pin",
      name: "Toggle toolbar pin",
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
            `Top toolbar pinned: ${this.settings.topPinned ? "on" : "off"}`
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
    new Notice(
      `Toolbar Pin Toggle needs the "${ETB_PLUGIN_NAME}" plugin — install and ` +
        `enable it first (Settings → Community plugins).`,
      8000
    );
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
    containerEl.createEl("h3", { text: "Toolbar Pin Toggle" });

    // Stated up front rather than buried in the README: without the companion
    // plugin every option on this page is inert.
    if (!this.plugin.hasEditingToolbar()) {
      containerEl.createDiv({ cls: "tpt-missing-dependency" }, (el) => {
        el.createEl("strong", {
          text: `"${ETB_PLUGIN_NAME}" is required`,
        });
        el.createEl("div", {
          text:
            "Both pinning modes act on toolbars that plugin provides. " +
            "Install and enable it, then reload Obsidian.",
        });
      });
    }

    new Setting(containerEl)
      .setName("Pin mode")
      .setDesc(
        "Fixed toolbar: toggles Editing Toolbar's fixed bottom toolbar. " +
          "Top toolbar: keeps the top toolbar visible instead of hiding itself."
      )
      .addDropdown((drop) =>
        drop
          .addOption("fixed", "Fixed bottom toolbar")
          .addOption("top", "Top toolbar")
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
              `Pin mode: ${value === "top" ? "top toolbar" : "fixed bottom toolbar"}`
            );
          })
      );
  }
}

module.exports = ToolbarPinTogglePlugin;
