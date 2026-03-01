/* ==========================================================================
   Claude Insider — Application Logic
   Search, filter, navigation, and interactive components

   Note: All data rendered via innerHTML comes from the local GATES/ENV_VARS
   constants defined in data.js — no user input is injected into HTML.
   This is a static site with no server-side rendering or user-submitted data.
   ========================================================================== */

(function () {
  "use strict";

  // ── Navigation ──────────────────────────────────────────────────────────
  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const links = document.querySelector(".nav-links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      toggle.innerHTML = isOpen ? ICONS.close : ICONS.menu;
      toggle.setAttribute("aria-expanded", isOpen);
    });

    // Close on link click (mobile)
    links.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.innerHTML = ICONS.menu;
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    // Mark active page
    const path = window.location.pathname;
    links.querySelectorAll("a").forEach((link) => {
      const href = link.getAttribute("href");
      if (
        path.endsWith(href) ||
        (href === "index.html" &&
          (path.endsWith("/") || path.endsWith("/site/")))
      ) {
        link.classList.add("active");
      }
    });
  }

  // ── Debounce ────────────────────────────────────────────────────────────
  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // ── Copy to Clipboard ──────────────────────────────────────────────────
  function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      const original = btn.innerHTML;
      btn.innerHTML = ICONS.check;
      btn.classList.add("copied");
      setTimeout(() => {
        btn.innerHTML = original;
        btn.classList.remove("copied");
      }, 1500);
    });
  }

  // ── Escape HTML (for search query display only) ────────────────────────
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Gate Explorer ──────────────────────────────────────────────────────
  function initGateExplorer() {
    const container = document.getElementById("gate-grid");
    const searchInput = document.getElementById("gate-search");
    const filterBar = document.getElementById("gate-filters");
    const resultsCount = document.getElementById("gate-results-count");
    if (!container) return;

    let activeFilter = "all";

    function tierLabel(tier) {
      return "Tier " + tier;
    }

    function tierClass(tier) {
      return "badge-tier-" + tier;
    }

    function categoryBadge(cat) {
      const span = document.createElement("span");
      span.className = "badge badge-category badge-" + cat;
      span.textContent = cat;
      return span.outerHTML;
    }

    function buildGateCard(gate, i) {
      const card = document.createElement("div");
      card.className = "gate-card";
      card.dataset.index = i;

      // Header
      const header = document.createElement("div");
      header.className = "gate-card-header";
      const title = document.createElement("span");
      title.className = "gate-card-title";
      title.textContent = gate.codename;
      const tierBadge = document.createElement("span");
      tierBadge.className = "badge " + tierClass(gate.tier);
      tierBadge.textContent = tierLabel(gate.tier);
      header.appendChild(title);
      header.appendChild(tierBadge);
      card.appendChild(header);

      // Description
      const desc = document.createElement("p");
      desc.className = "gate-card-desc";
      desc.textContent = gate.description;
      card.appendChild(desc);

      // Footer
      const footer = document.createElement("div");
      footer.className = "gate-card-footer";
      const flagSpan = document.createElement("span");
      flagSpan.className = "gate-card-flag";
      flagSpan.textContent = gate.flag;
      footer.appendChild(flagSpan);

      const statusBadge = document.createElement("span");
      if (gate.patchable) {
        statusBadge.className = "badge badge-patchable";
        statusBadge.textContent = "Patchable";
      } else {
        statusBadge.className = "badge badge-detection";
        statusBadge.textContent = "Detection Only";
      }
      footer.appendChild(statusBadge);

      const catBadge = document.createElement("span");
      catBadge.className = "badge badge-category badge-" + gate.category;
      catBadge.textContent = gate.category;
      footer.appendChild(catBadge);
      card.appendChild(footer);

      // CLI block for patchable gates
      if (gate.patchable && gate.cliCommand) {
        const cliBlock = document.createElement("div");
        cliBlock.className = "cli-block";
        const codeEl = document.createElement("code");
        codeEl.textContent = gate.cliCommand;
        cliBlock.appendChild(codeEl);
        const copyBtn = document.createElement("button");
        copyBtn.className = "cli-copy-btn";
        copyBtn.title = "Copy command";
        copyBtn.innerHTML = ICONS.copy;
        copyBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          copyToClipboard(gate.cliCommand, copyBtn);
        });
        cliBlock.appendChild(copyBtn);
        card.appendChild(cliBlock);
      }

      // Expand button
      const expandBtn = document.createElement("button");
      expandBtn.className = "gate-expand-btn";
      expandBtn.innerHTML = "Details " + ICONS.chevronDown;
      card.appendChild(expandBtn);

      // Detail section
      const detail = document.createElement("div");
      detail.className = "gate-detail";
      detail.id = "gate-detail-" + i;

      function addDetailRow(label, value) {
        const row = document.createElement("div");
        row.className = "gate-detail-row";
        const labelEl = document.createElement("span");
        labelEl.className = "gate-detail-label";
        labelEl.textContent = label;
        const valueEl = document.createElement("code");
        valueEl.className = "gate-detail-value";
        valueEl.textContent = value;
        row.appendChild(labelEl);
        row.appendChild(valueEl);
        detail.appendChild(row);
      }

      addDetailRow("Flag", gate.flag);
      addDetailRow("Tier", String(gate.tier));
      if (gate.envOverride) addDetailRow("Env Override", gate.envOverride);
      if (gate.envDisable) addDetailRow("Env Disable", gate.envDisable);

      card.appendChild(detail);

      expandBtn.addEventListener("click", () => {
        detail.classList.toggle("open");
        expandBtn.classList.toggle("expanded");
      });

      return card;
    }

    function renderGates(gates) {
      container.textContent = "";

      if (gates.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.style.gridColumn = "1 / -1";
        empty.innerHTML = ICONS.searchEmpty;
        const p1 = document.createElement("p");
        p1.textContent = "No gates match your search";
        const p2 = document.createElement("p");
        p2.textContent = "Try a different keyword or filter";
        p2.style.fontSize = "0.85rem";
        empty.appendChild(p1);
        empty.appendChild(p2);
        container.appendChild(empty);
        if (resultsCount) resultsCount.textContent = "0 gates";
        return;
      }

      if (resultsCount) {
        resultsCount.textContent =
          gates.length + " gate" + (gates.length !== 1 ? "s" : "");
      }

      gates.forEach((gate, i) => {
        container.appendChild(buildGateCard(gate, i));
      });
    }

    function filterGates() {
      const query = (searchInput ? searchInput.value : "").toLowerCase().trim();
      let filtered = GATES;

      if (activeFilter === "patchable") {
        filtered = filtered.filter((g) => g.patchable);
      } else if (activeFilter === "detection") {
        filtered = filtered.filter((g) => !g.patchable);
      } else if (activeFilter.startsWith("tier-")) {
        const tier = parseInt(activeFilter.split("-")[1], 10);
        filtered = filtered.filter((g) => g.tier === tier);
      }

      if (query) {
        filtered = filtered.filter(
          (g) =>
            g.codename.toLowerCase().includes(query) ||
            g.flag.toLowerCase().includes(query) ||
            g.description.toLowerCase().includes(query) ||
            g.category.toLowerCase().includes(query) ||
            (g.envOverride && g.envOverride.toLowerCase().includes(query)),
        );
      }

      renderGates(filtered);
      updateFilterCounts();
    }

    function updateFilterCounts() {
      if (!filterBar) return;
      filterBar.querySelectorAll(".filter-chip").forEach((chip) => {
        const filter = chip.dataset.filter;
        let count;
        if (filter === "all") count = GATES.length;
        else if (filter === "patchable")
          count = GATES.filter((g) => g.patchable).length;
        else if (filter === "detection")
          count = GATES.filter((g) => !g.patchable).length;
        else if (filter.startsWith("tier-")) {
          const tier = parseInt(filter.split("-")[1], 10);
          count = GATES.filter((g) => g.tier === tier).length;
        }
        const countEl = chip.querySelector(".chip-count");
        if (countEl) countEl.textContent = count;
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", debounce(filterGates, 200));
    }

    if (filterBar) {
      filterBar.addEventListener("click", (e) => {
        const chip = e.target.closest(".filter-chip");
        if (!chip) return;
        filterBar
          .querySelectorAll(".filter-chip")
          .forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        activeFilter = chip.dataset.filter;
        filterGates();
      });
    }

    renderGates(GATES);
    updateFilterCounts();
  }

  // ── Environment Variables ──────────────────────────────────────────────
  function initEnvVars() {
    const tableBody = document.getElementById("env-table-body");
    const mobileContainer = document.getElementById("env-cards-mobile");
    const searchInput = document.getElementById("env-search");
    const tabsContainer = document.getElementById("env-tabs");
    const resultsCount = document.getElementById("env-results-count");
    if (!tableBody && !mobileContainer) return;

    let activeCategory = "all";

    function getBadgeClass(category) {
      if (category === "feature" || category === "enable")
        return "badge-feature";
      if (category === "debug" || category === "disable")
        return "badge-telemetry";
      return "badge-experiment";
    }

    function renderVars(vars) {
      if (resultsCount) {
        resultsCount.textContent =
          vars.length + " variable" + (vars.length !== 1 ? "s" : "");
      }

      if (vars.length === 0) {
        if (tableBody) {
          tableBody.textContent = "";
          const tr = document.createElement("tr");
          const td = document.createElement("td");
          td.colSpan = 4;
          td.className = "empty-state";
          td.innerHTML = ICONS.searchEmpty;
          const p = document.createElement("p");
          p.textContent = "No variables match your search";
          td.appendChild(p);
          tr.appendChild(td);
          tableBody.appendChild(tr);
        }
        if (mobileContainer) {
          mobileContainer.textContent = "";
          const empty = document.createElement("div");
          empty.className = "empty-state";
          empty.innerHTML = ICONS.searchEmpty;
          const p = document.createElement("p");
          p.textContent = "No variables match your search";
          empty.appendChild(p);
          mobileContainer.appendChild(empty);
        }
        return;
      }

      // Desktop table
      if (tableBody) {
        tableBody.textContent = "";
        vars.forEach((v) => {
          const tr = document.createElement("tr");

          const tdName = document.createElement("td");
          const nameSpan = document.createElement("span");
          nameSpan.className = "env-name";
          nameSpan.textContent = v.name;
          tdName.appendChild(nameSpan);
          tr.appendChild(tdName);

          const tdDesc = document.createElement("td");
          tdDesc.className = "env-desc";
          tdDesc.textContent = v.description;
          tr.appendChild(tdDesc);

          const tdCat = document.createElement("td");
          const catBadge = document.createElement("span");
          catBadge.className =
            "badge badge-category " + getBadgeClass(v.category);
          catBadge.textContent = ENV_CATEGORIES[v.category] || v.category;
          tdCat.appendChild(catBadge);
          tr.appendChild(tdCat);

          const tdType = document.createElement("td");
          tdType.className = "env-default";
          tdType.textContent = v.type || "\u2014";
          tr.appendChild(tdType);

          tableBody.appendChild(tr);
        });
      }

      // Mobile cards
      if (mobileContainer) {
        mobileContainer.textContent = "";
        vars.forEach((v) => {
          const card = document.createElement("div");
          card.className = "env-card";

          const name = document.createElement("div");
          name.className = "env-card-name";
          name.textContent = v.name;
          card.appendChild(name);

          const desc = document.createElement("div");
          desc.className = "env-card-desc";
          desc.textContent = v.description;
          card.appendChild(desc);

          const meta = document.createElement("div");
          meta.className = "env-card-meta";
          const catBadge = document.createElement("span");
          catBadge.className = "badge badge-category badge-feature";
          catBadge.textContent = ENV_CATEGORIES[v.category] || v.category;
          meta.appendChild(catBadge);
          const typeSpan = document.createElement("span");
          typeSpan.textContent = v.type || "\u2014";
          meta.appendChild(typeSpan);
          card.appendChild(meta);

          mobileContainer.appendChild(card);
        });
      }
    }

    function filterVars() {
      const query = (searchInput ? searchInput.value : "").toLowerCase().trim();
      let filtered = ENV_VARS;

      if (activeCategory !== "all") {
        filtered = filtered.filter((v) => v.category === activeCategory);
      }

      if (query) {
        filtered = filtered.filter(
          (v) =>
            v.name.toLowerCase().includes(query) ||
            v.description.toLowerCase().includes(query),
        );
      }

      renderVars(filtered);
    }

    if (searchInput) {
      searchInput.addEventListener("input", debounce(filterVars, 200));
    }

    if (tabsContainer) {
      tabsContainer.addEventListener("click", (e) => {
        const tab = e.target.closest(".category-tab");
        if (!tab) return;
        tabsContainer
          .querySelectorAll(".category-tab")
          .forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        activeCategory = tab.dataset.category;
        filterVars();
      });
    }

    renderVars(ENV_VARS);
  }

  // ── Featured Gates (Landing Page) ──────────────────────────────────────
  function initFeaturedGates() {
    const container = document.getElementById("featured-gates");
    if (!container) return;

    const featured = ["session-memory", "amber-flint", "ccr-bridge"];
    const gates = featured
      .map((name) => GATES.find((g) => g.codename === name))
      .filter(Boolean);

    container.textContent = "";
    gates.forEach((gate) => {
      const card = document.createElement("div");
      card.className = "gate-card";

      const header = document.createElement("div");
      header.className = "gate-card-header";
      const title = document.createElement("span");
      title.className = "gate-card-title";
      title.textContent = gate.codename;
      const badge = document.createElement("span");
      badge.className = "badge badge-tier-" + gate.tier;
      badge.textContent = "Tier " + gate.tier;
      header.appendChild(title);
      header.appendChild(badge);
      card.appendChild(header);

      const desc = document.createElement("p");
      desc.className = "gate-card-desc";
      desc.textContent = gate.description;
      card.appendChild(desc);

      const footer = document.createElement("div");
      footer.className = "gate-card-footer";
      const pBadge = document.createElement("span");
      pBadge.className = "badge badge-patchable";
      pBadge.textContent = "Patchable";
      footer.appendChild(pBadge);
      const cBadge = document.createElement("span");
      cBadge.className = "badge badge-category badge-" + gate.category;
      cBadge.textContent = gate.category;
      footer.appendChild(cBadge);
      card.appendChild(footer);

      if (gate.cliCommand) {
        const cliBlock = document.createElement("div");
        cliBlock.className = "cli-block";
        const code = document.createElement("code");
        code.textContent = gate.cliCommand;
        cliBlock.appendChild(code);
        const copyBtn = document.createElement("button");
        copyBtn.className = "cli-copy-btn";
        copyBtn.title = "Copy command";
        copyBtn.innerHTML = ICONS.copy;
        copyBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          copyToClipboard(gate.cliCommand, copyBtn);
        });
        cliBlock.appendChild(copyBtn);
        card.appendChild(cliBlock);
      }

      container.appendChild(card);
    });
  }

  // ── Initialize ─────────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initGateExplorer();
    initEnvVars();
    initFeaturedGates();
  });
})();
