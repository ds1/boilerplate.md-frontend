#!/usr/bin/env node
// generate-scripts.js — Load data.js + generator.js in Node and emit scripts for each preset

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const jsDir = path.join(__dirname, "..", "js");
const outDir = path.join(__dirname, "generated");
fs.mkdirSync(outDir, { recursive: true });

// Load data.js and generator.js into a shared sandbox via vm
// Use `var` wrappers so declarations attach to the sandbox context object
const sandbox = vm.createContext({
  console, JSON, Array, Object, String, RegExp, Math, parseInt, parseFloat
});

const dataCode = fs.readFileSync(path.join(jsDir, "data.js"), "utf8");
// Replace `const` with `var` so declarations attach to the vm context object
vm.runInContext(dataCode.replace(/\bconst CONFIG_DATA\b/, "var CONFIG_DATA"), sandbox);

const genCode = fs.readFileSync(path.join(jsDir, "generator.js"), "utf8");
vm.runInContext(genCode.replace(/\bconst Generator\b/, "var Generator"), sandbox);

const { CONFIG_DATA, Generator } = sandbox;

// Preset logic (mirrors app.js applyPreset)
function buildState(preset) {
  const state = { claudeMd: {}, settings: {}, commands: {} };

  switch (preset) {
    case "full":
      for (const s of CONFIG_DATA.claudeMd) state.claudeMd[s.id] = true;
      for (const s of CONFIG_DATA.settings) state.settings[s.id] = true;
      for (const c of CONFIG_DATA.commands) state.commands[c.id] = true;
      break;
    case "recommended":
      for (const s of CONFIG_DATA.claudeMd) state.claudeMd[s.id] = !!s.recommended;
      for (const s of CONFIG_DATA.settings) state.settings[s.id] = !!s.recommended;
      for (const c of CONFIG_DATA.commands) state.commands[c.id] = !!c.recommended;
      break;
    case "minimal":
      for (const s of CONFIG_DATA.claudeMd) state.claudeMd[s.id] = s.category === "core";
      for (const s of CONFIG_DATA.settings) state.settings[s.id] = s.id === "permissions-core-tools" || s.id === "permissions-deny";
      for (const c of CONFIG_DATA.commands) state.commands[c.id] = false;
      break;
    case "commandsOnly":
      for (const s of CONFIG_DATA.claudeMd) state.claudeMd[s.id] = false;
      for (const s of CONFIG_DATA.settings) state.settings[s.id] = false;
      for (const c of CONFIG_DATA.commands) state.commands[c.id] = true;
      break;
    case "reset":
      for (const s of CONFIG_DATA.claudeMd) state.claudeMd[s.id] = false;
      for (const s of CONFIG_DATA.settings) state.settings[s.id] = false;
      for (const c of CONFIG_DATA.commands) state.commands[c.id] = false;
      state._reset = true;
      break;
  }
  return state;
}

// Emit a manifest as a bash-sourceable file to avoid path format issues
function buildManifestBash(preset, state) {
  const selectedSections = CONFIG_DATA.claudeMd.filter(s => state.claudeMd[s.id]);
  const selectedSettings = CONFIG_DATA.settings.filter(s => state.settings[s.id]);
  const selectedCommands = CONFIG_DATA.commands.filter(c => state.commands[c.id]);

  const lines = [
    `IS_RESET=${state._reset ? "true" : "false"}`,
    `EXPECT_CLAUDE_MD=${selectedSections.length > 0 ? "true" : "false"}`,
    `EXPECT_SETTINGS=${selectedSettings.length > 0 ? "true" : "false"}`,
    `SECTION_COUNT=${selectedSections.length}`,
    `SETTINGS_COUNT=${selectedSettings.length}`,
    `CMD_COUNT=${selectedCommands.length}`,
    `CMD_FILES="${selectedCommands.map(c => c.filename).join(",")}"`,
  ];
  return lines.join("\n") + "\n";
}

// Zip generation uses JSZip (same library the browser uses via CDN)
const JSZip = require("jszip");

async function generateZipFile(preset, state) {
  const sections = CONFIG_DATA.claudeMd.filter(s => state.claudeMd[s.id]);
  const settings = CONFIG_DATA.settings.filter(s => state.settings[s.id]);
  const commands = CONFIG_DATA.commands.filter(c => state.commands[c.id]);

  const zip = new JSZip();
  const claudeDir = zip.folder(".claude");

  const claudeMdContent = Generator.buildClaudeMdContent(sections);
  if (claudeMdContent) {
    claudeDir.file("CLAUDE.md", claudeMdContent);
  }

  const settingsContent = Generator.buildSettingsJson(settings);
  if (settingsContent) {
    claudeDir.file("settings.json", settingsContent);
  }

  if (commands.length > 0) {
    const commandsDir = claudeDir.folder("commands");
    for (const cmd of commands) {
      commandsDir.file(cmd.filename, cmd.content);
    }
  }

  const buf = await zip.generateAsync({ type: "nodebuffer" });
  fs.writeFileSync(path.join(outDir, `${preset}.zip`), buf);
}

const presets = ["full", "recommended", "minimal", "commandsOnly", "reset"];

(async () => {
  for (const preset of presets) {
    const state = buildState(preset);
    const bash = Generator.generateBash(state);
    const ps = Generator.generatePowerShell(state);
    const manifest = buildManifestBash(preset, state);

    fs.writeFileSync(path.join(outDir, `${preset}.sh`), bash, "utf8");
    // PowerShell 5.1 reads .ps1 files as ANSI unless BOM is present;
    // prepend UTF-8 BOM so Unicode content (em dashes, box drawing) is preserved
    const BOM = "\uFEFF";
    fs.writeFileSync(path.join(outDir, `${preset}.ps1`), BOM + ps, "utf8");
    fs.writeFileSync(path.join(outDir, `${preset}.env`), manifest, "utf8");

    // Skip zip for reset (no files to include)
    if (!state._reset) {
      await generateZipFile(preset, state);
      console.log(`Generated: ${preset}.sh, ${preset}.ps1, ${preset}.zip, ${preset}.env`);
    } else {
      console.log(`Generated: ${preset}.sh, ${preset}.ps1, ${preset}.env (no zip for reset)`);
    }
  }

  console.log(`\nAll scripts written to ${outDir}`);
})();
