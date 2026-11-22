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

  // Simulated CLI output aligned with cmd/xabi and internal/commands implementations
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
        { type: "dim", text: "   vhost : C:\\Users\\dev\\.config\\xabi\\nginx\\sites\\myapp.test.conf (WebSocket Upgrade)" },
        { type: "dim", text: "   hosts : injected '127.0.0.1 myapp.test' inside # BEGIN xabi" },
        { type: "dim", text: "   nginx : reloaded (nginx -s reload)" },
      ],
      linux: [
        { type: "info", text: ":: linked http://myapp.test -> http://127.0.0.1:3000" },
        { type: "dim", text: "   vhost : /home/dev/.config/xabi/nginx/sites/myapp.test.conf (WebSocket Upgrade)" },
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
      // Ignore storage restrictions
    }
    const ua = (navigator.userAgent || "").toLowerCase();
    const plat = (navigator.platform || "").toLowerCase();
    return plat.includes("win") || ua.includes("windows") ? "windows" : "linux";
  }

  function loadCompletedSteps() {
    try {
      const raw = localStorage.getItem(STORAGE_STEPS);
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.map(String).filter((n) => Number(n) >= 1 && Number(n) <= TOTAL_STEPS));
      }
    } catch (_) {
      // Ignore malformed JSON
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
      sandboxLabel.textContent = state.os === "windows" ? "Windows" : "Linux";
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

    const progressText = document.getElementById("progress-text");
    const progressReset = document.getElementById("progress-reset");

    if (progressText) {
      progressText.textContent = `${doneCount}/${TOTAL_STEPS} completed`;
    }
    if (progressReset) {
      progressReset.hidden = doneCount === 0;
    }

    document.querySelectorAll(".step-section").forEach((section) => {
      const stepId = section.getAttribute("data-step");
      const isDone = state.completedSteps.has(stepId);
      section.classList.toggle("is-done", isDone);

      const checkbox = section.querySelector("[data-toggle-step]");
      if (checkbox) {
        checkbox.checked = isDone;
      }
      const label = section.querySelector(".check-label");
      if (label) {
        label.textContent = isDone ? "Completed" : "Mark step as completed";
      }
    });

    document.querySelectorAll("[data-step-nav]").forEach((link) => {
      const stepId = link.getAttribute("data-step-nav");
      link.classList.toggle("is-done", state.completedSteps.has(stepId));
    });
  }

  function setStepCompleted(stepId, completed) {
    if (completed) {
      state.completedSteps.add(stepId);
    } else {
      state.completedSteps.delete(stepId);
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
        // Fallback to textarea copy in non-secure contexts
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
    btn.textContent = "Copied";
    window.clearTimeout(btn._copyTimer);
    btn._copyTimer = window.setTimeout(() => {
      btn.classList.remove("is-copied");
      btn.textContent = originalText;
    }, 1500);
  }

  function applyGlobalSearch(rawQuery) {
    const query = rawQuery.trim().toLowerCase();
    state.searchQuery = query;

    const clearBtn = document.getElementById("search-clear");
    const kbdHint = document.getElementById("search-kbd");
    if (clearBtn) clearBtn.hidden = query.length === 0;
    if (kbdHint) kbdHint.hidden = query.length > 0;

    let visibleSteps = 0;
    document.querySelectorAll(".step-section").forEach((section) => {
      if (!query) {
        section.classList.remove("is-hidden");
        visibleSteps++;
        return;
      }
      const hay = ((section.getAttribute("data-keywords") || "") + " " + section.textContent).toLowerCase();
      const matched = hay.includes(query);
      section.classList.toggle("is-hidden", !matched);
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
        statusText.textContent = `Showing ${visibleSteps} procedural sections and ${visibleRows} command reference entries matching "${rawQuery.trim()}".`;
      }
    }
    if (stepsEmpty) stepsEmpty.hidden = visibleSteps > 0;
    if (cheatEmpty) cheatEmpty.hidden = visibleRows > 0;
  }

  function setupScrollspy() {
    const sectionIds = [
      "overview",
      "simulator",
      "step-1",
      "step-2",
      "step-3",
      "step-4",
      "step-5",
      "step-6",
      "step-7",
      "step-8",
    ];
    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
    const linksById = new Map();

    document.querySelectorAll("[data-scrollspy]").forEach((link) => {
      const id = link.getAttribute("data-scrollspy");
      if (!linksById.has(id)) {
        linksById.set(id, []);
      }
      linksById.get(id).push(link);
    });

    const setActive = (id) => {
      linksById.forEach((links, key) => {
        const active = key === id;
        links.forEach((link) => link.classList.toggle("is-active", active));
      });
    };

    const updateOnScroll = () => {
      const offset = 130;
      let currentId = sections[0] ? sections[0].id : "overview";
      for (const sec of sections) {
        if (sec.classList.contains("is-hidden")) continue;
        if (sec.getBoundingClientRect().top <= offset) {
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

  function openMobileNav() {
    const sidebar = document.getElementById("left-sidebar");
    const backdrop = document.getElementById("nav-backdrop");
    const toggle = document.getElementById("nav-toggle");
    if (sidebar) sidebar.classList.add("is-open");
    if (backdrop) {
      backdrop.hidden = false;
      backdrop.classList.add("is-open");
    }
    if (toggle) toggle.setAttribute("aria-expanded", "true");
  }

  function closeMobileNav() {
    const sidebar = document.getElementById("left-sidebar");
    const backdrop = document.getElementById("nav-backdrop");
    const toggle = document.getElementById("nav-toggle");
    if (sidebar) sidebar.classList.remove("is-open");
    if (backdrop) {
      backdrop.classList.remove("is-open");
      backdrop.hidden = true;
    }
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  function init() {
    state.completedSteps = loadCompletedSteps();
    setOS(detectInitialOS(), false);
    updateProgressUI();

    document.querySelectorAll("[data-set-os]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setOS(btn.getAttribute("data-set-os"), true);
      });
    });

    document.querySelectorAll("[data-toggle-step]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        setStepCompleted(checkbox.getAttribute("data-toggle-step"), checkbox.checked);
      });
    });

    const resetBtn = document.getElementById("progress-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", resetProgress);
    }

    document.querySelectorAll(".code-block .copy-btn").forEach((btn) => {
      const original = btn.textContent.trim();
      btn.addEventListener("click", async () => {
        const block = btn.closest(".code-block");
        const codeEl = block ? block.querySelector("pre code") : null;
        if (!codeEl) return;
        const ok = await copyText(codeEl.textContent.trimEnd());
        if (ok) flashCopied(btn, original);
      });
    });

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
              ? "PS C:\\Dev\\myapp> # Select a command above to preview its output."
              : "~/code/myapp $ # Select a command above to preview its output.";
          outEl.replaceChildren(span);
        }
        document.querySelectorAll(".sim-btn").forEach((b) => b.classList.remove("is-active"));
      });
    }

    const searchInput = document.getElementById("global-search");
    const searchClear = document.getElementById("search-clear");
    const searchResetStatus = document.getElementById("search-reset-status");
    const stepsEmptyReset = document.getElementById("steps-empty-reset");

    const resetGlobalSearch = () => {
      if (searchInput) searchInput.value = "";
      applyGlobalSearch("");
    };

    if (searchInput) {
      searchInput.addEventListener("input", (e) => applyGlobalSearch(e.target.value));
    }
    if (searchClear) searchClear.addEventListener("click", resetGlobalSearch);
    if (searchResetStatus) searchResetStatus.addEventListener("click", resetGlobalSearch);
    if (stepsEmptyReset) stepsEmptyReset.addEventListener("click", resetGlobalSearch);

    const navToggle = document.getElementById("nav-toggle");
    const navClose = document.getElementById("nav-close");
    const navBackdrop = document.getElementById("nav-backdrop");
    if (navToggle) navToggle.addEventListener("click", openMobileNav);
    if (navClose) navClose.addEventListener("click", closeMobileNav);
    if (navBackdrop) navBackdrop.addEventListener("click", closeMobileNav);

    document.querySelectorAll("[data-scrollspy]").forEach((link) => {
      link.addEventListener("click", () => {
        const selector = link.getAttribute("href");
        if (!selector) return;
        const target = document.querySelector(selector);
        if (!target) return;

        if (target.classList.contains("is-hidden")) {
          resetGlobalSearch();
        }
        closeMobileNav();
        if (target.classList.contains("doc-section")) {
          target.classList.add("is-highlight");
          window.setTimeout(() => target.classList.remove("is-highlight"), 1200);
        }
      });
    });

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
        closeMobileNav();
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
