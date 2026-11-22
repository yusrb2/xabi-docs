(() => {
  "use strict";

  const STORAGE_OS = "xabi_docs_os";
  const STORAGE_STEPS = "xabi_docs_completed_steps";
  const TOTAL_STEPS = 7;

  const state = {
    os: "windows",
    completedSteps: new Set(),
    activeSimCmd: "xabi doctor",
    searchQuery: "",
  };

  // Realistic simulated CLI outputs synced to actual xabi source code (v0.1.0)
  const SIM_OUTPUTS = {
    "xabi doctor": {
      windows: [
        { type: "step", text: "==> XDG environment" },
        { type: "ok", text: "  ✔ config dir       C:\\Users\\dev\\.config\\xabi" },
        { type: "ok", text: "  ✔ data dir         C:\\Users\\dev\\.local\\share\\xabi" },
        { type: "ok", text: "  ✔ runtime dir      C:\\Users\\dev\\AppData\\Local\\Temp\\xabi" },
        { type: "ok", text: "  ✔ config.toml      C:\\Users\\dev\\.config\\xabi\\config.toml" },
        { type: "ok", text: "  ✔ nginx.conf       C:\\Users\\dev\\.config\\xabi\\nginx\\nginx.conf" },
        { type: "step", text: "==> System binaries" },
        { type: "ok", text: "  ✔ nginx            C:\\tools\\nginx\\nginx.exe" },
        { type: "ok", text: "  ✔ php-cgi          C:\\Users\\dev\\.local\\share\\xabi\\bin\\php-cgi.cmd" },
        { type: "ok", text: "  ✔ mariadb/mysql    C:\\Program Files\\MariaDB 11.4\\bin\\mariadbd.exe" },
        { type: "ok", text: "  ✔ mkcert           C:\\Users\\dev\\scoop\\shims\\mkcert.exe" },
        { type: "warn", text: "  ! cloudflared      not found in PATH (needed for 'xabi share')" },
        { type: "step", text: "==> Port availability" },
        { type: "ok", text: "  ✔ port 80 (http)   free" },
        { type: "ok", text: "  ✔ port 443 (https) free" },
        { type: "ok", text: "  ✔ port 3306 (db)   free" },
        { type: "step", text: "==> Hosts & capabilities" },
        { type: "ok", text: "  ✔ hosts file       C:\\Windows\\System32\\drivers\\etc\\hosts (read/write)" },
        { type: "info", text: ":: system ready" },
      ],
      linux: [
        { type: "step", text: "==> XDG environment" },
        { type: "ok", text: "  ✔ config dir       /home/dev/.config/xabi" },
        { type: "ok", text: "  ✔ data dir         /home/dev/.local/share/xabi" },
        { type: "ok", text: "  ✔ runtime dir      /run/user/1000/xabi" },
        { type: "ok", text: "  ✔ config.toml      /home/dev/.config/xabi/config.toml" },
        { type: "ok", text: "  ✔ nginx.conf       /home/dev/.config/xabi/nginx/nginx.conf" },
        { type: "step", text: "==> System binaries" },
        { type: "ok", text: "  ✔ nginx            /usr/bin/nginx" },
        { type: "ok", text: "  ✔ php-fpm          /home/dev/.local/share/xabi/bin/php-fpm" },
        { type: "ok", text: "  ✔ mariadb/mysql    /usr/bin/mariadbd" },
        { type: "ok", text: "  ✔ mkcert           /usr/bin/mkcert" },
        { type: "warn", text: "  ! cloudflared      not found in PATH (needed for 'xabi share')" },
        { type: "step", text: "==> Port availability" },
        { type: "ok", text: "  ✔ port 80 (http)   free" },
        { type: "ok", text: "  ✔ port 443 (https) free" },
        { type: "ok", text: "  ✔ port 3306 (db)   free" },
        { type: "step", text: "==> Hosts & capabilities" },
        { type: "ok", text: "  ✔ hosts file       /etc/hosts (read/write)" },
        { type: "ok", text: "  ✔ net_bind_cap     /usr/bin/nginx has cap_net_bind_service" },
        { type: "info", text: ":: system ready" },
      ],
    },
    "xabi init --dry-run": {
      windows: [
        { type: "step", text: "==> dry-run mode: no files or system state will be modified" },
        { type: "info", text: ":: would ensure XDG directories under C:\\Users\\dev\\.config\\xabi, C:\\Users\\dev\\.local\\share\\xabi, C:\\Users\\dev\\AppData\\Local\\Temp\\xabi" },
        { type: "info", text: ":: would write C:\\Users\\dev\\.config\\xabi\\config.toml" },
        { type: "info", text: ":: would write C:\\Users\\dev\\.config\\xabi\\nginx\\nginx.conf" },
        { type: "info", text: ":: would write C:\\Users\\dev\\.config\\xabi\\nginx\\mime.types" },
        { type: "info", text: ":: would run C:\\Program Files\\MariaDB 11.4\\bin\\mariadb-install-db.exe --datadir=C:\\Users\\dev\\.local\\share\\xabi\\db" },
        { type: "info", text: ":: would run C:\\Users\\dev\\scoop\\shims\\mkcert.exe -install" },
        { type: "info", text: ":: detected php runtime at C:\\laragon\\bin\\php\\php-8.3.14\\php-cgi.exe" },
        { type: "info", text: ":: xabi initialized (run 'xabi doctor' to verify)" },
      ],
      linux: [
        { type: "step", text: "==> dry-run mode: no files or system state will be modified" },
        { type: "info", text: ":: would ensure XDG directories under /home/dev/.config/xabi, /home/dev/.local/share/xabi, /run/user/1000/xabi" },
        { type: "info", text: ":: would write /home/dev/.config/xabi/config.toml" },
        { type: "info", text: ":: would write /home/dev/.config/xabi/nginx/nginx.conf" },
        { type: "info", text: ":: would write /home/dev/.config/xabi/nginx/mime.types" },
        { type: "info", text: ":: would grant cap_net_bind_service=+ep on /usr/bin/nginx" },
        { type: "info", text: ":: would run /usr/bin/mariadb-install-db --datadir=/home/dev/.local/share/xabi/db" },
        { type: "info", text: ":: would run /usr/bin/mkcert -install" },
        { type: "info", text: ":: detected php runtime at /usr/bin/php-fpm" },
        { type: "info", text: ":: xabi initialized (run 'xabi doctor' to verify)" },
      ],
    },
    "xabi up": {
      windows: [
        { type: "info", text: ":: started nginx (pid 14820)" },
        { type: "info", text: ":: started php-fpm (pid 19344)" },
        { type: "info", text: ":: started mariadb (pid 22108)" },
      ],
      linux: [
        { type: "info", text: ":: started nginx (pid 4812)" },
        { type: "info", text: ":: started php-fpm (pid 4856)" },
        { type: "info", text: ":: started mariadb (pid 4910)" },
      ],
    },
    "xabi status": {
      windows: [
        { type: "dim", text: "SERVICE  STATE    PID    ENDPOINT                          MEMORY" },
        { type: "ok", text: "nginx    RUNNING  14820  127.0.0.1:80                      14.2 MiB" },
        { type: "ok", text: "php-fpm  RUNNING  19344  127.0.0.1:9000 (+8.3:9083)        46.8 MiB" },
        { type: "ok", text: "mariadb  RUNNING  22108  127.0.0.1:3306                    118.5 MiB" },
      ],
      linux: [
        { type: "dim", text: "SERVICE  STATE    PID   ENDPOINT                           MEMORY" },
        { type: "ok", text: "nginx    RUNNING  4812  127.0.0.1:80                       11.4 MiB" },
        { type: "ok", text: "php-fpm  RUNNING  4856  unix:/run/user/1000/xabi/php.sock  38.6 MiB" },
        { type: "ok", text: "mariadb  RUNNING  4910  127.0.0.1:3306                     104.2 MiB" },
      ],
    },
    "xabi add myapp --proxy 3000": {
      windows: [
        { type: "info", text: ":: linked http://myapp.test -> http://127.0.0.1:3000" },
        { type: "dim", text: "   vhost : C:\\Users\\dev\\.config\\xabi\\nginx\\sites\\myapp.test.conf (WebSocket Upgrade enabled)" },
        { type: "dim", text: "   hosts : injected '127.0.0.1 myapp.test' inside # BEGIN xabi" },
        { type: "dim", text: "   nginx : reloaded (nginx -s reload)" },
      ],
      linux: [
        { type: "info", text: ":: linked http://myapp.test -> http://127.0.0.1:3000" },
        { type: "dim", text: "   vhost : /home/dev/.config/xabi/nginx/sites/myapp.test.conf (WebSocket Upgrade enabled)" },
        { type: "dim", text: "   hosts : injected '127.0.0.1 myapp.test' inside # BEGIN xabi" },
        { type: "dim", text: "   nginx : reloaded (SIGHUP)" },
      ],
    },
    "xabi tls myapp": {
      windows: [
        { type: "dim", text: "   mkcert: C:\\Users\\dev\\.config\\xabi\\certs\\myapp.test.pem (+ *.myapp.test)" },
        { type: "dim", text: "   vhost : HTTP :80 -> 301 redirect + HTTPS :443 ssl" },
        { type: "info", text: ":: enabled TLS for https://myapp.test" },
      ],
      linux: [
        { type: "dim", text: "   mkcert: /home/dev/.config/xabi/certs/myapp.test.pem (+ *.myapp.test)" },
        { type: "dim", text: "   vhost : HTTP :80 -> 301 redirect + HTTPS :443 ssl" },
        { type: "info", text: ":: enabled TLS for https://myapp.test" },
      ],
    },
    "xabi php": {
      windows: [
        { type: "ok", text: "* 8.4  C:/laragon/bin/php/php-8.4.5/php.exe    (laragon)" },
        { type: "plain", text: "  8.3  C:/laragon/bin/php/php-8.3.14/php.exe   (laragon)" },
        { type: "plain", text: "  8.2  C:/Users/dev/scoop/apps/php82/current/php.exe  (scoop)" },
        { type: "info", text: ":: project .php-version: 8.3" },
      ],
      linux: [
        { type: "ok", text: "* 8.4  /usr/bin/php8.4                     (system)" },
        { type: "plain", text: "  8.3  /home/dev/.local/share/xabi/php/8.3/bin/php  (xabi)" },
        { type: "plain", text: "  8.2  /usr/bin/php8.2                     (system)" },
        { type: "info", text: ":: project .php-version: 8.3" },
      ],
    },
    "xabi php pin 8.3": {
      windows: [
        { type: "dim", text: "   file    : .php-version -> 8.3" },
        { type: "dim", text: "   fastcgi : fastcgi_pass 127.0.0.1:9083;" },
        { type: "info", text: ":: pinned PHP 8.3 for api.test (.php-version)" },
      ],
      linux: [
        { type: "dim", text: "   file    : .php-version -> 8.3" },
        { type: "dim", text: "   fastcgi : fastcgi_pass unix:/run/user/1000/xabi/php-8.3.sock;" },
        { type: "info", text: ":: pinned PHP 8.3 for api.test (.php-version)" },
      ],
    },
    "xabi ls": {
      windows: [
        { type: "dim", text: "DOMAIN         TARGET                                   TLS  PHP" },
        { type: "plain", text: "api.test       php -> C:/Dev/api/public                 on   8.3" },
        { type: "plain", text: "myapp.test     proxy -> http://127.0.0.1:3000           on   -" },
        { type: "plain", text: "xabi-docs.test static -> C:/Dev/01_Active/xabi-docs     off  -" },
      ],
      linux: [
        { type: "dim", text: "DOMAIN         TARGET                                   TLS  PHP" },
        { type: "plain", text: "api.test       php -> /home/dev/code/api/public         on   8.3" },
        { type: "plain", text: "myapp.test     proxy -> http://127.0.0.1:3000           on   -" },
        { type: "plain", text: "xabi-docs.test static -> /home/dev/code/xabi-docs       off  -" },
      ],
    },
  };

  function detectInitialOS() {
    try {
      const saved = localStorage.getItem(STORAGE_OS);
      if (saved === "windows" || saved === "linux") {
        return saved;
      }
    } catch (_) {
      // Ignore storage failures in restricted contexts
    }
    const ua = (navigator.userAgent || "").toLowerCase();
    const plat = (navigator.platform || "").toLowerCase();
    if (plat.includes("win") || ua.includes("windows")) {
      return "windows";
    }
    return "linux";
  }

  function loadCompletedSteps() {
    try {
      const raw = localStorage.getItem(STORAGE_STEPS);
      if (!raw) return new Set();
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr.map(String).filter((n) => Number(n) >= 1 && Number(n) <= TOTAL_STEPS));
      }
    } catch (_) {
      // Ignore invalid JSON
    }
    return new Set();
  }

  function saveCompletedSteps() {
    try {
      localStorage.setItem(STORAGE_STEPS, JSON.stringify([...state.completedSteps]));
    } catch (_) {
      // Ignore storage errors
    }
  }

  function setOS(os, persist = true) {
    state.os = os === "linux" ? "linux" : "windows";
    document.body.setAttribute("data-platform", state.os);

    document.querySelectorAll("[data-set-os]").forEach((btn) => {
      const active = btn.getAttribute("data-set-os") === state.os;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    document.querySelectorAll(".os-token").forEach((el) => {
      const val = el.getAttribute(state.os === "windows" ? "data-win" : "data-linux");
      if (val !== null) {
        el.textContent = val;
      }
    });

    const sandboxLabel = document.getElementById("sandbox-os-label");
    if (sandboxLabel) {
      sandboxLabel.textContent = state.os === "windows" ? "Windows PowerShell" : "Linux Bash/Zsh";
    }

    if (persist) {
      try {
        localStorage.setItem(STORAGE_OS, state.os);
      } catch (_) {
        // Ignore storage errors
      }
    }

    renderSimOutput(state.activeSimCmd);
  }

  function updateProgressUI() {
    const doneCount = state.completedSteps.size;
    const pct = Math.round((doneCount / TOTAL_STEPS) * 100);

    const progressText = document.getElementById("progress-text");
    const progressFill = document.getElementById("progress-fill");
    if (progressText) {
      progressText.textContent = `${doneCount}/${TOTAL_STEPS} Steps`;
    }
    if (progressFill) {
      progressFill.style.width = `${pct}%`;
    }

    document.querySelectorAll(".step-card").forEach((card) => {
      const stepId = card.getAttribute("data-step");
      const isDone = state.completedSteps.has(stepId);
      card.classList.toggle("is-done", isDone);

      const marker = card.querySelector(".step-marker");
      if (marker) {
        marker.textContent = isDone ? "✓" : stepId.padStart(2, "0");
      }

      const btn = card.querySelector("[data-toggle-step]");
      if (btn) {
        btn.setAttribute("aria-pressed", String(isDone));
        const label = btn.querySelector(".done-label");
        if (label) {
          label.textContent = isDone ? "Selesai" : "Tandai Selesai";
        }
      }
    });

    document.querySelectorAll("[data-step-nav]").forEach((link) => {
      const stepId = link.getAttribute("data-step-nav");
      const isDone = state.completedSteps.has(stepId);
      link.classList.toggle("is-done", isDone);
    });
  }

  function toggleStep(stepId) {
    if (state.completedSteps.has(stepId)) {
      state.completedSteps.delete(stepId);
    } else {
      state.completedSteps.add(stepId);
    }
    saveCompletedSteps();
    updateProgressUI();
  }

  function resetProgress() {
    state.completedSteps.clear();
    saveCompletedSteps();
    updateProgressUI();
  }

  function renderSimOutput(cmd) {
    state.activeSimCmd = cmd;
    const outEl = document.getElementById("sandbox-output");
    const titleEl = document.getElementById("sandbox-active-cmd");
    if (!outEl) return;

    document.querySelectorAll(".sim-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.getAttribute("data-sim") === cmd);
    });

    if (titleEl) {
      titleEl.textContent = cmd;
    }

    const entry = SIM_OUTPUTS[cmd];
    const lines = entry ? entry[state.os] || entry.linux : [];

    const frag = document.createDocumentFragment();
    const promptLine = document.createElement("span");
    const promptSpan = document.createElement("span");
    promptSpan.className = "t-prompt";
    promptSpan.textContent = state.os === "windows" ? "PS C:\\Dev\\myapp> " : "~/code/myapp $ ";
    const cmdSpan = document.createElement("span");
    cmdSpan.className = "t-cmd";
    cmdSpan.textContent = cmd + "\n";
    promptLine.appendChild(promptSpan);
    promptLine.appendChild(cmdSpan);
    frag.appendChild(promptLine);

    lines.forEach((item) => {
      const span = document.createElement("span");
      const classMap = {
        step: "t-step",
        info: "t-info",
        ok: "t-ok",
        warn: "t-warn",
        dim: "t-dim",
        plain: "",
      };
      if (classMap[item.type]) {
        span.className = classMap[item.type];
      }
      span.textContent = item.text + "\n";
      frag.appendChild(span);
    });

    const exitSpan = document.createElement("span");
    exitSpan.className = "t-exit";
    exitSpan.textContent = "\n[exit 0]";
    frag.appendChild(exitSpan);

    outEl.replaceChildren(frag);
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {
        // Fallback below
      }
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (_) {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }

  function flashCopied(btn, originalText) {
    btn.classList.add("is-copied");
    btn.textContent = "Copied!";
    window.clearTimeout(btn._copyTimer);
    btn._copyTimer = window.setTimeout(() => {
      btn.classList.remove("is-copied");
      btn.textContent = originalText;
    }, 1600);
  }

  function applyGlobalSearch(rawQuery) {
    const query = rawQuery.trim().toLowerCase();
    state.searchQuery = query;

    const clearBtn = document.getElementById("search-clear");
    const kbdHint = document.getElementById("search-kbd");
    if (clearBtn) clearBtn.hidden = query.length === 0;
    if (kbdHint) kbdHint.hidden = query.length > 0;

    let visibleSteps = 0;
    document.querySelectorAll(".step-card").forEach((card) => {
      if (!query) {
        card.classList.remove("is-hidden");
        visibleSteps++;
        return;
      }
      const hay = (
        (card.getAttribute("data-keywords") || "") +
        " " +
        card.textContent
      ).toLowerCase();
      const matched = hay.includes(query);
      card.classList.toggle("is-hidden", !matched);
      if (matched) visibleSteps++;
    });

    let visibleRows = 0;
    document.querySelectorAll("#cheat-table tbody tr").forEach((row) => {
      if (!query) {
        row.classList.remove("is-hidden");
        visibleRows++;
        return;
      }
      const matched = row.textContent.toLowerCase().includes(query);
      row.classList.toggle("is-hidden", !matched);
      if (matched) visibleRows++;
    });

    const statusBar = document.getElementById("search-status");
    const statusText = document.getElementById("search-status-text");
    const stepsEmpty = document.getElementById("steps-empty");
    const cheatEmpty = document.getElementById("cheat-empty");

    if (statusBar && statusText) {
      statusBar.hidden = !query;
      if (query) {
        statusText.textContent = `Filter aktif: "${rawQuery.trim()}" — ${visibleSteps} langkah & ${visibleRows} baris cheat sheet cocok.`;
      }
    }
    if (stepsEmpty) stepsEmpty.hidden = visibleSteps > 0;
    if (cheatEmpty) cheatEmpty.hidden = visibleRows > 0;
  }

  function applySidebarCmdFilter(rawQuery) {
    const query = rawQuery.trim().toLowerCase();
    let visibleCount = 0;
    document.querySelectorAll(".cmd-pill").forEach((pill) => {
      const cmd = (pill.getAttribute("data-cmd") || pill.textContent).toLowerCase();
      const matched = !query || cmd.includes(query);
      pill.classList.toggle("is-hidden", !matched);
      if (matched) visibleCount++;
    });

    const empty = document.getElementById("cmd-filter-empty");
    if (empty) {
      empty.hidden = visibleCount > 0;
    }
  }

  function setupScrollspy() {
    const sections = [
      "overview",
      "sandbox",
      "step-1",
      "step-2",
      "step-3",
      "step-4",
      "step-5",
      "step-6",
      "step-7",
      "cheat-sheet",
    ]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const linksById = new Map();
    document.querySelectorAll("[data-scrollspy]").forEach((link) => {
      linksById.set(link.getAttribute("data-scrollspy"), link);
    });

    const setActive = (id) => {
      linksById.forEach((link, key) => {
        link.classList.toggle("is-active", key === id);
      });
    };

    const updateOnScroll = () => {
      const offset = 130;
      let currentId = sections[0] ? sections[0].id : "overview";
      for (const sec of sections) {
        if (sec.classList.contains("is-hidden")) continue;
        const rect = sec.getBoundingClientRect();
        if (rect.top <= offset) {
          currentId = sec.id;
        }
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24) {
        const lastVisible = [...sections].reverse().find((s) => !s.classList.contains("is-hidden"));
        if (lastVisible) currentId = lastVisible.id;
      }
      setActive(currentId);
    };

    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updateOnScroll();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
    updateOnScroll();
  }

  function closeMobileSidebar() {
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (sidebar) sidebar.classList.remove("is-open");
    if (backdrop) backdrop.classList.remove("is-open");
  }

  function openMobileSidebar() {
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (sidebar) sidebar.classList.add("is-open");
    if (backdrop) backdrop.classList.add("is-open");
  }

  function init() {
    state.completedSteps = loadCompletedSteps();
    setOS(detectInitialOS(), false);
    updateProgressUI();

    // OS Switcher buttons
    document.querySelectorAll("[data-set-os]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setOS(btn.getAttribute("data-set-os"), true);
      });
    });

    // Step checklist buttons
    document.querySelectorAll("[data-toggle-step]").forEach((btn) => {
      btn.addEventListener("click", () => {
        toggleStep(btn.getAttribute("data-toggle-step"));
      });
    });

    const resetBtn = document.getElementById("progress-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", resetProgress);
    }

    // Copy buttons inside code blocks
    document.querySelectorAll(".btn-copy").forEach((btn) => {
      const original = btn.textContent.trim();
      btn.addEventListener("click", async () => {
        const block = btn.closest(".code-block");
        const codeEl = block ? block.querySelector("pre code") : null;
        if (!codeEl) return;
        const ok = await copyText(codeEl.textContent.trimEnd());
        if (ok) flashCopied(btn, original);
      });
    });

    // Terminal simulator controls
    document.querySelectorAll(".sim-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        renderSimOutput(btn.getAttribute("data-sim"));
      });
    });

    const simCopy = document.getElementById("sandbox-copy");
    if (simCopy) {
      const original = simCopy.textContent.trim();
      simCopy.addEventListener("click", async () => {
        const outEl = document.getElementById("sandbox-output");
        if (!outEl) return;
        const ok = await copyText(outEl.textContent);
        if (ok) flashCopied(simCopy, original);
      });
    }

    const simClear = document.getElementById("sandbox-clear");
    if (simClear) {
      simClear.addEventListener("click", () => {
        const outEl = document.getElementById("sandbox-output");
        const titleEl = document.getElementById("sandbox-active-cmd");
        if (titleEl) titleEl.textContent = "ready";
        if (outEl) {
          const span = document.createElement("span");
          span.className = "t-prompt";
          span.textContent =
            state.os === "windows"
              ? "PS C:\\Dev\\myapp> # Pilih perintah di atas untuk menjalankan simulasi..."
              : "~/code/myapp $ # Pilih perintah di atas untuk menjalankan simulasi...";
          outEl.replaceChildren(span);
        }
        document.querySelectorAll(".sim-btn").forEach((b) => b.classList.remove("is-active"));
      });
    }

    // Global Search & Ctrl+K / '/' shortcut
    const searchInput = document.getElementById("global-search");
    const searchClear = document.getElementById("search-clear");
    const searchResetStatus = document.getElementById("search-reset-status");
    const stepsEmptyReset = document.getElementById("steps-empty-reset");

    const resetGlobalSearch = () => {
      if (searchInput) searchInput.value = "";
      applyGlobalSearch("");
    };

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        applyGlobalSearch(e.target.value);
      });
    }
    if (searchClear) searchClear.addEventListener("click", resetGlobalSearch);
    if (searchResetStatus) searchResetStatus.addEventListener("click", resetGlobalSearch);
    if (stepsEmptyReset) stepsEmptyReset.addEventListener("click", resetGlobalSearch);

    // Sidebar subcommand filter
    const cmdFilter = document.getElementById("cmd-filter");
    if (cmdFilter) {
      cmdFilter.addEventListener("input", (e) => {
        applySidebarCmdFilter(e.target.value);
      });
    }

    // Sidebar command quick jump (clear global filter if target step was hidden)
    document.querySelectorAll(".cmd-pill").forEach((pill) => {
      pill.addEventListener("click", (e) => {
        const targetSelector = pill.getAttribute("href");
        if (!targetSelector) return;
        const target = document.querySelector(targetSelector);
        if (!target) return;

        if (target.classList.contains("is-hidden")) {
          resetGlobalSearch();
        }
        closeMobileSidebar();
        target.classList.add("is-highlight");
        window.setTimeout(() => target.classList.remove("is-highlight"), 1400);
      });
    });

    // Mobile drawer controls
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const sidebarClose = document.getElementById("sidebar-close");
    const sidebarBackdrop = document.getElementById("sidebar-backdrop");
    if (sidebarToggle) sidebarToggle.addEventListener("click", openMobileSidebar);
    if (sidebarClose) sidebarClose.addEventListener("click", closeMobileSidebar);
    if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", closeMobileSidebar);
    document.querySelectorAll(".toc-link").forEach((link) => {
      link.addEventListener("click", () => {
        const targetSelector = link.getAttribute("href");
        if (targetSelector && targetSelector.startsWith("#step-")) {
          const target = document.querySelector(targetSelector);
          if (target && target.classList.contains("is-hidden")) {
            resetGlobalSearch();
          }
        }
        closeMobileSidebar();
      });
    });

    // Global keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      const tag = (document.activeElement && document.activeElement.tagName) || "";
      const isTyping = tag === "INPUT" || tag === "TEXTAREA";

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }

      if (e.key === "Escape") {
        closeMobileSidebar();
        if (document.activeElement === searchInput) {
          if (searchInput.value) {
            resetGlobalSearch();
          } else {
            searchInput.blur();
          }
        }
      }
    });

    setupScrollspy();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
