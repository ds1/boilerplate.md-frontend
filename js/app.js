// app.js — State management, UI rendering, event handling

(function () {
  "use strict";

  // ── State ───────────────────────────────────────────────────────────

  const state = {
    claudeMd: {},
    settings: {},
    commands: {}
  };

  // Initialize state from CONFIG_DATA defaults (recommended items)
  function initState() {
    for (const s of CONFIG_DATA.claudeMd) {
      state.claudeMd[s.id] = !!s.recommended;
    }
    for (const s of CONFIG_DATA.settings) {
      state.settings[s.id] = !!s.recommended;
    }
    for (const c of CONFIG_DATA.commands) {
      state.commands[c.id] = !!c.recommended;
    }
  }

  // ── URL Hash Encoding ──────────────────────────────────────────────

  function getAllToggleIds() {
    const ids = [];
    for (const s of CONFIG_DATA.claudeMd) ids.push(s.id);
    for (const s of CONFIG_DATA.settings) ids.push(s.id);
    for (const c of CONFIG_DATA.commands) ids.push(c.id);
    return ids;
  }

  function encodeStateToHash() {
    const ids = getAllToggleIds();
    // Pack into a bitmask, then base64url encode
    const bits = [];
    for (const id of ids) {
      const group = CONFIG_DATA.claudeMd.find(s => s.id === id) ? "claudeMd"
        : CONFIG_DATA.settings.find(s => s.id === id) ? "settings"
        : "commands";
      bits.push(state[group][id] ? 1 : 0);
    }

    // Pack bits into bytes
    const bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8 && i + j < bits.length; j++) {
        byte |= bits[i + j] << (7 - j);
      }
      bytes.push(byte);
    }

    // Convert to base64url
    const binary = String.fromCharCode(...bytes);
    const b64 = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return b64;
  }

  function decodeHashToState(hash) {
    if (!hash) return false;
    try {
      // Decode base64url
      const b64 = hash.replace(/-/g, "+").replace(/_/g, "/");
      const binary = atob(b64);
      const bytes = [];
      for (let i = 0; i < binary.length; i++) {
        bytes.push(binary.charCodeAt(i));
      }

      // Unpack bits
      const bits = [];
      for (const byte of bytes) {
        for (let j = 7; j >= 0; j--) {
          bits.push((byte >> j) & 1);
        }
      }

      const ids = getAllToggleIds();
      for (let i = 0; i < ids.length && i < bits.length; i++) {
        const id = ids[i];
        const group = CONFIG_DATA.claudeMd.find(s => s.id === id) ? "claudeMd"
          : CONFIG_DATA.settings.find(s => s.id === id) ? "settings"
          : "commands";
        state[group][id] = bits[i] === 1;
      }
      return true;
    } catch {
      return false;
    }
  }

  // ── Presets ─────────────────────────────────────────────────────────

  function applyPreset(preset) {
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
        updateAllToggles();
        updateOutput();
        updateCounts();
        updateWarnings();
        updatePresetButtons(preset);
        return;
    }
    state._reset = false;
    updateAllToggles();
    updateOutput();
    updateCounts();
    updateWarnings();
    updatePresetButtons(preset);
  }

  // ── Rendering ───────────────────────────────────────────────────────

  function createToggleItem(item, group) {
    const div = document.createElement("div");
    div.className = "toggle-item";
    div.dataset.id = item.id;

    const previewContent = typeof item.content === "string"
      ? item.content
      : JSON.stringify(item.content, null, 2);

    div.innerHTML = `
      <label class="toggle-switch">
        <input type="checkbox" data-group="${group}" data-id="${item.id}" ${state[group][item.id] ? "checked" : ""}>
        <span class="toggle-track"></span>
      </label>
      <div class="toggle-info">
        <label class="toggle-label" for="${item.id}">${item.title}</label>
        <span class="toggle-category">${item.category || ""}</span>
        <div class="toggle-desc">${item.description}</div>
        <button class="toggle-preview-btn" data-id="${item.id}">Show preview</button>
        <div class="toggle-preview" id="preview-${item.id}">${escapeHtml(previewContent)}</div>
      </div>
    `;

    // Toggle event
    const checkbox = div.querySelector("input[type=checkbox]");
    checkbox.addEventListener("change", () => {
      state[group][item.id] = checkbox.checked;
      state._reset = false;
      updateOutput();
      updateCounts();
      updateWarnings();
      detectActivePreset();
    });

    // Label click
    const label = div.querySelector(".toggle-label");
    label.addEventListener("click", (e) => {
      e.preventDefault();
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event("change"));
    });

    // Preview toggle
    const previewBtn = div.querySelector(".toggle-preview-btn");
    const previewDiv = div.querySelector(".toggle-preview");
    previewBtn.addEventListener("click", () => {
      const expanded = previewDiv.classList.toggle("expanded");
      previewBtn.textContent = expanded ? "Hide preview" : "Show preview";
    });

    return div;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderToggles() {
    // CLAUDE.md toggles
    const claudemdContainer = document.getElementById("claudemd-toggles");
    for (const section of CONFIG_DATA.claudeMd) {
      claudemdContainer.appendChild(createToggleItem(section, "claudeMd"));
    }

    // Settings toggles
    const settingsContainer = document.getElementById("settings-toggles");
    for (const setting of CONFIG_DATA.settings) {
      settingsContainer.appendChild(createToggleItem(setting, "settings"));
    }

    // Command toggles (split by category)
    const pmContainer = document.getElementById("commands-pm-toggles");
    const probeContainer = document.getElementById("commands-probe-toggles");
    for (const cmd of CONFIG_DATA.commands) {
      if (cmd.category === "socratic-probes") {
        probeContainer.appendChild(createToggleItem(cmd, "commands"));
      } else {
        pmContainer.appendChild(createToggleItem(cmd, "commands"));
      }
    }
  }

  function updateAllToggles() {
    document.querySelectorAll("input[type=checkbox][data-group]").forEach(cb => {
      const group = cb.dataset.group;
      const id = cb.dataset.id;
      cb.checked = state[group][id];
    });
  }

  function updateCounts() {
    const claudemdSelected = CONFIG_DATA.claudeMd.filter(s => state.claudeMd[s.id]).length;
    document.getElementById("claudemd-count").textContent = `${claudemdSelected}/${CONFIG_DATA.claudeMd.length}`;

    const settingsSelected = CONFIG_DATA.settings.filter(s => state.settings[s.id]).length;
    document.getElementById("settings-count").textContent = `${settingsSelected}/${CONFIG_DATA.settings.length}`;

    const commandsSelected = CONFIG_DATA.commands.filter(c => state.commands[c.id]).length;
    document.getElementById("commands-count").textContent = `${commandsSelected}/${CONFIG_DATA.commands.length}`;
  }

  // ── Dependency Warnings ─────────────────────────────────────────────

  function updateWarnings() {
    const container = document.getElementById("warnings");
    const warnings = [];

    // Bypass permissions without safety net
    if (state.settings["settings-bypass"] && !state.claudeMd["safety-net"]) {
      warnings.push({
        text: '<strong>Bypass Permissions</strong> is enabled without the <strong>Safety Net</strong> section in CLAUDE.md. This means all tool calls are auto-approved with no guardrails.'
      });
    }

    // PreCompact hook without context preservation
    if (state.settings["settings-precompact-hook"] && !state.claudeMd["context-preservation"]) {
      warnings.push({
        text: '<strong>PreCompact Hook</strong> is enabled but the <strong>Context Preservation</strong> section is not selected. The hook will fire but Claude won\'t know what to do with it.'
      });
    }

    // Project state commands without project state management section
    const projectStateCmds = ["cmd-status", "cmd-update-status", "cmd-log", "cmd-plans", "cmd-backlog"];
    const hasProjectStateCmd = projectStateCmds.some(id => state.commands[id]);
    if (hasProjectStateCmd && !state.claudeMd["project-state"]) {
      warnings.push({
        text: 'You have <strong>project management commands</strong> selected but not the <strong>Project State Management</strong> section. The commands reference STATUS.md and _planning/ which are defined in that section.'
      });
    }

    // Documentation auto-update without the commands
    if (state.claudeMd["documentation"] && !state.commands["cmd-docs"]) {
      warnings.push({
        text: 'The <strong>Documentation</strong> section references <code>/docs</code> command which is not selected.'
      });
    }

    container.innerHTML = warnings.map(w => `
      <div class="warning-item">
        <span class="warning-icon">\u26a0</span>
        <span class="warning-text">${w.text}</span>
      </div>
    `).join("");
  }

  // ── Output ──────────────────────────────────────────────────────────

  let currentBashOutput = "";
  let currentPsOutput = "";

  function updateOutput() {
    currentBashOutput = Generator.generateBash(state);
    currentPsOutput = Generator.generatePowerShell(state);

    document.getElementById("bash-output").textContent = currentBashOutput;
    document.getElementById("powershell-output").textContent = currentPsOutput;
  }

  // ── Preset Detection ────────────────────────────────────────────────

  function detectActivePreset() {
    // Check each preset to see if current state matches
    const presets = ["full", "recommended", "minimal", "commandsOnly", "reset"];
    let activePreset = null;

    // Save current state
    const savedState = JSON.parse(JSON.stringify(state));

    for (const preset of presets) {
      applyPresetToTemp(preset);
      if (statesMatch(state, savedState)) {
        activePreset = preset;
      }
    }

    // Restore state
    Object.assign(state.claudeMd, savedState.claudeMd);
    Object.assign(state.settings, savedState.settings);
    Object.assign(state.commands, savedState.commands);

    updatePresetButtons(activePreset);
  }

  function applyPresetToTemp(preset) {
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
        break;
    }
  }

  function statesMatch(a, b) {
    for (const group of ["claudeMd", "settings", "commands"]) {
      for (const key of Object.keys(a[group])) {
        if (a[group][key] !== b[group][key]) return false;
      }
    }
    // Also check _reset flag
    if (!!a._reset !== !!b._reset) return false;
    return true;
  }

  function updatePresetButtons(activePreset) {
    document.querySelectorAll(".preset-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.preset === activePreset);
    });
  }

  // ── Event Binding ───────────────────────────────────────────────────

  function bindEvents() {
    // Preset buttons
    document.querySelectorAll(".preset-btn").forEach(btn => {
      btn.addEventListener("click", () => applyPreset(btn.dataset.preset));
    });

    // Panel accordion (only toggle on elements with data-accordion-toggle)
    document.querySelectorAll("[data-accordion-toggle]").forEach(el => {
      el.addEventListener("click", () => {
        const header = el.closest(".panel-header");
        const expanded = header.getAttribute("aria-expanded") === "true";
        header.setAttribute("aria-expanded", !expanded);
      });
    });

    // Select all / none buttons
    document.querySelectorAll(".select-all-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const group = btn.dataset.group;
        const items = group === "claudeMd" ? CONFIG_DATA.claudeMd
          : group === "settings" ? CONFIG_DATA.settings
          : CONFIG_DATA.commands;
        for (const item of items) state[group][item.id] = true;
        updateAllToggles();
        updateOutput();
        updateCounts();
        updateWarnings();
        detectActivePreset();
      });
    });

    document.querySelectorAll(".select-none-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const group = btn.dataset.group;
        const items = group === "claudeMd" ? CONFIG_DATA.claudeMd
          : group === "settings" ? CONFIG_DATA.settings
          : CONFIG_DATA.commands;
        for (const item of items) state[group][item.id] = false;
        updateAllToggles();
        updateOutput();
        updateCounts();
        updateWarnings();
        detectActivePreset();
      });
    });

    // Output tabs
    document.querySelectorAll(".output-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".output-tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".output-content").forEach(c => c.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById(`output-${tab.dataset.tab}`).classList.add("active");
      });
    });

    // Copy buttons
    document.querySelectorAll(".copy-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.target;
        const text = target === "bash" ? currentBashOutput : currentPsOutput;
        Generator.copyToClipboard(text, btn);
      });
    });

    // Zip download
    document.getElementById("download-zip").addEventListener("click", () => {
      Generator.generateZip(state);
    });

    // Share button
    document.getElementById("share-btn").addEventListener("click", () => {
      const hash = encodeStateToHash();
      const url = `${window.location.origin}${window.location.pathname}#${hash}`;
      navigator.clipboard.writeText(url).then(() => {
        const status = document.getElementById("share-status");
        status.textContent = "URL copied!";
        setTimeout(() => { status.textContent = ""; }, 2000);
      }).catch(() => {
        // Fallback: update URL bar
        window.location.hash = hash;
        const status = document.getElementById("share-status");
        status.textContent = "URL updated in address bar";
        setTimeout(() => { status.textContent = ""; }, 3000);
      });
    });
  }

  // ── Init ────────────────────────────────────────────────────────────

  function init() {
    initState();

    // Check for URL hash
    const hash = window.location.hash.slice(1);
    if (hash) {
      decodeHashToState(hash);
    }

    renderToggles();
    updateCounts();
    updateOutput();
    updateWarnings();
    detectActivePreset();
    bindEvents();
    fetchStarCount();
  }

  // ── Star Count ──────────────────────────────────────────────────────

  function fetchStarCount() {
    fetch("https://api.github.com/repos/ds1/claude-code-config")
      .then(r => r.json())
      .then(data => {
        if (data.stargazers_count != null) {
          const el = document.getElementById("star-count");
          el.textContent = data.stargazers_count;
        }
      })
      .catch(() => {});
  }

  // Go
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
