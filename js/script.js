/* ===================================================================
   Mindora AI - Core JavaScript (Direct Global AI App Launcher)
   =================================================================== */

let currentCategory = "all";
let currentSearchQuery = "";
let currentSort = "trending";
const selectedToolsForCompare = new Set();

document.addEventListener("DOMContentLoaded", () => {
  initNeuralCanvas();
  initToolExplorer();
  initComparisonSystem();
  initModals();
  initInteractions();
  updateToolCounters();
});

/* ===================================================================
   Helper: Extract Clean Hostname from Official URL
   =================================================================== */
function getDisplayDomain(url) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/* ===================================================================
   1. Interactive Neural Canvas Background
   =================================================================== */
function initNeuralCanvas() {
  const canvas = document.getElementById("neuralCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 14000), 85);
  const maxDistance = 140;

  const mouse = {
    x: null,
    y: null,
    radius: 120
  };

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 2 + 1;
      this.color = Math.random() > 0.4 ? "rgba(0, 242, 254, " : "rgba(138, 43, 226, ";
      this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 3;
          this.y -= (dy / dist) * force * 3;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha + ")";
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const lineAlpha = (1 - dist / maxDistance) * 0.22;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 242, 254, ${lineAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(render);
  }

  render();
}

/* ===================================================================
   2. Tool Explorer & Direct App Launch Renderer
   =================================================================== */
function initToolExplorer() {
  const grid = document.getElementById("toolsGrid");
  const searchInput = document.getElementById("toolSearch");
  const sortSelect = document.getElementById("toolSort");
  const filterBtns = document.querySelectorAll(".filter-btn");

  if (!grid) return;

  window.renderTools = function () {
    updateToolCounters();

    if (!AI_TOOLS_DATA || AI_TOOLS_DATA.length === 0) {
      grid.innerHTML = `
        <div class="empty-tools-card" style="grid-column: 1 / -1; text-align: center; padding: 64px 24px; background: var(--bg-card); border: 1px dashed rgba(0, 242, 254, 0.3); border-radius: var(--radius-lg); backdrop-filter: blur(14px);">
          <div style="font-size: 3rem; margin-bottom: 14px;">🌌</div>
          <h3 style="font-size: 1.5rem; margin-bottom: 10px;">Awaiting Next Global Research Sync</h3>
          <p style="color: var(--text-muted); max-width: 500px; margin: 0 auto;">
            New verified AI applications are automatically synced daily at 9:00 AM and 6:00 PM PKT.
          </p>
        </div>
      `;
      return;
    }

    let filtered = AI_TOOLS_DATA.filter((tool) => {
      const matchesCategory =
        currentCategory === "all" || tool.category === currentCategory;
      const matchesSearch =
        tool.name.toLowerCase().includes(currentSearchQuery) ||
        (tool.provider || "").toLowerCase().includes(currentSearchQuery) ||
        (tool.tagline || "").toLowerCase().includes(currentSearchQuery) ||
        (tool.website || "").toLowerCase().includes(currentSearchQuery) ||
        (tool.modalities &&
          tool.modalities.some((m) => m.toLowerCase().includes(currentSearchQuery)));
      return matchesCategory && matchesSearch;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (currentSort === "trending") {
        return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
      } else if (currentSort === "reasoning") {
        return (b.metrics?.reasoning || 0) - (a.metrics?.reasoning || 0);
      } else if (currentSort === "coding") {
        return (b.metrics?.coding || 0) - (a.metrics?.coding || 0);
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">🔍</div>
          <h3>No AI apps match "${currentSearchQuery}"</h3>
          <p style="margin-top: 8px;">Try searching for ChatGPT, NotebookLM, Hugging Face, Claude, or clear your filter.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered
      .map((tool) => {
        const isChecked = selectedToolsForCompare.has(tool.id);
        const initials = tool.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        const reasoningScore = tool.metrics?.reasoning || 85;
        const codingScore = tool.metrics?.coding || 85;
        const appUrl = tool.website || "#";
        const domain = getDisplayDomain(appUrl);

        return `
        <div class="tool-card clickable-app-card" data-id="${tool.id}" data-url="${appUrl}" title="Click to open ${tool.name} (${domain})">
          <div>
            <div class="tool-card-header">
              <div class="tool-identity">
                <div class="tool-avatar">${initials}</div>
                <div>
                  <h3 class="tool-name">${tool.name}</h3>
                  <span class="tool-provider">${tool.provider} &middot; <span class="tool-domain-inline">${domain}</span></span>
                </div>
              </div>
              <span class="tool-badge ${tool.badgeType || "frontier"}">${tool.badge || "Live App"}</span>
            </div>

            <p class="tool-tagline">${tool.tagline}</p>

            <div class="tool-modalities">
              ${(tool.modalities || []).map((m) => `<span class="modality-tag">${m}</span>`).join("")}
            </div>

            <div class="tool-metrics-preview">
              <div class="metric-bar-group">
                <div class="metric-label-row">
                  <span>Reasoning Index</span>
                  <span>${reasoningScore}%</span>
                </div>
                <div class="metric-track">
                  <div class="metric-fill" style="width: ${reasoningScore}%"></div>
                </div>
              </div>

              <div class="metric-bar-group">
                <div class="metric-label-row">
                  <span>Coding &amp; Utility</span>
                  <span>${codingScore}%</span>
                </div>
                <div class="metric-track">
                  <div class="metric-fill violet" style="width: ${codingScore}%"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="tool-card-footer">
            <label class="compare-checkbox-label" title="Select to compare side-by-side">
              <input type="checkbox" class="tool-compare-chk" data-id="${tool.id}" ${isChecked ? "checked" : ""}>
              <span>Compare</span>
            </label>
            <div class="card-footer-actions">
              <button type="button" class="btn btn-outline card-btn view-details-btn" data-id="${tool.id}">
                Specs
              </button>
              <a href="${appUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary card-btn launch-app-btn">
                Open App ↗
              </a>
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    attachCardEventListeners();
  };

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      window.renderTools();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      window.renderTools();
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.getAttribute("data-category");
      window.renderTools();
    });
  });

  window.renderTools();
}

function updateToolCounters() {
  const count = AI_TOOLS_DATA ? AI_TOOLS_DATA.length : 0;
  const navCountEl = document.getElementById("navToolCount");
  const statCountEl = document.getElementById("statToolsCount");
  const allBtn = document.querySelector('.filter-btn[data-category="all"]');

  if (navCountEl) navCountEl.textContent = `${count} Live AI Apps`;
  if (statCountEl) statCountEl.textContent = count.toString();
  if (allBtn) allBtn.textContent = `All Tools (${count})`;
}

function attachCardEventListeners() {
  // Clicking anywhere on the card launches the real official web app directly
  document.querySelectorAll(".clickable-app-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      // Ignore clicks on compare checkbox, specs button, or the anchor itself (anchor handles navigation natively)
      if (
        e.target.closest(".compare-checkbox-label") ||
        e.target.closest(".view-details-btn") ||
        e.target.closest(".launch-app-btn")
      ) {
        return;
      }
      const url = card.getAttribute("data-url");
      if (url && url.startsWith("http")) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    });
  });

  document.querySelectorAll(".tool-compare-chk").forEach((chk) => {
    chk.addEventListener("change", (e) => {
      e.stopPropagation();
      const toolId = e.target.getAttribute("data-id");
      if (e.target.checked) {
        if (selectedToolsForCompare.size >= 3) {
          e.target.checked = false;
          showToast("Maximum 3 tools can be compared simultaneously");
          return;
        }
        selectedToolsForCompare.add(toolId);
        showToast("Added to Comparison Matrix");
      } else {
        selectedToolsForCompare.delete(toolId);
      }
      updateComparisonDrawer();
    });
  });

  document.querySelectorAll(".view-details-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const toolId = btn.getAttribute("data-id");
      openToolModal(toolId);
    });
  });
}

/* ===================================================================
   3. Comparison System & Floating Drawer
   =================================================================== */
function initComparisonSystem() {
  const drawer = document.getElementById("compareDrawer");
  const compareBtn = document.getElementById("openCompareBtn");
  const clearBtn = document.getElementById("clearCompareBtn");

  if (!drawer) return;

  window.updateComparisonDrawer = function () {
    const chipsContainer = document.getElementById("compareChips");
    const countBadge = document.getElementById("compareCount");

    if (selectedToolsForCompare.size === 0) {
      drawer.classList.remove("active");
      return;
    }

    drawer.classList.add("active");
    countBadge.textContent = `${selectedToolsForCompare.size}/3`;

    const selectedList = AI_TOOLS_DATA.filter((t) =>
      selectedToolsForCompare.has(t.id)
    );

    chipsContainer.innerHTML = selectedList
      .map(
        (tool) => `
      <div class="compare-chip">
        <span>${tool.name}</span>
        <span class="chip-remove" onclick="removeCompareItem('${tool.id}')">✕</span>
      </div>
    `
      )
      .join("");
  };

  window.removeCompareItem = function (toolId) {
    selectedToolsForCompare.delete(toolId);
    document
      .querySelectorAll(`.tool-compare-chk[data-id="${toolId}"]`)
      .forEach((chk) => (chk.checked = false));
    updateComparisonDrawer();
  };

  clearBtn.addEventListener("click", () => {
    selectedToolsForCompare.clear();
    document
      .querySelectorAll(".tool-compare-chk")
      .forEach((chk) => (chk.checked = false));
    updateComparisonDrawer();
  });

  compareBtn.addEventListener("click", () => {
    openCompareModal();
  });
}

/* ===================================================================
   4. Modals (Specs Inspector & Compare Matrix)
   =================================================================== */
function initModals() {
  const overlay = document.getElementById("modalOverlay");
  const closeBtn = document.getElementById("modalCloseBtn");

  if (!overlay || !closeBtn) return;

  function closeModal() {
    overlay.classList.remove("open");
  }

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
    }
  });

  window.openToolModal = function (toolId) {
    const tool = AI_TOOLS_DATA.find((t) => t.id === toolId);
    if (!tool) return;

    const modalBody = document.getElementById("modalBody");
    const modalContent = overlay.querySelector(".modal-content");
    modalContent.className = "modal-content";

    const appUrl = tool.website || "#";
    const domain = getDisplayDomain(appUrl);

    modalBody.innerHTML = `
      <div class="modal-header-meta">
        <span class="tool-badge ${tool.badgeType || "frontier"}">${tool.badge || "Live App"}</span>
        <span style="font-size: 0.82rem; color: var(--text-dim);">${domain}</span>
      </div>
      <h2 class="modal-tool-name">${tool.name}</h2>
      <div class="modal-tagline">${tool.tagline}</div>
      <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 24px; line-height: 1.7;">
        ${tool.description}
      </p>

      <div class="modal-section-title">Telemetry &amp; Specifications</div>
      <div class="specs-grid">
        <div class="spec-cell">
          <span class="spec-key">Provider / Lab</span>
          <span class="spec-val">${tool.provider}</span>
        </div>
        <div class="spec-cell">
          <span class="spec-key">Pricing</span>
          <span class="spec-val">${tool.pricing || "Free Tier / Pro"}</span>
        </div>
        <div class="spec-cell">
          <span class="spec-key">Context / Scope</span>
          <span class="spec-val">${tool.contextWindow || "Web App"}</span>
        </div>
        <div class="spec-cell">
          <span class="spec-key">Open Source</span>
          <span class="spec-val">${tool.openSource ? "Yes (Open Weights / OSS)" : "Proprietary Cloud App"}</span>
        </div>
      </div>

      <div class="modal-section-title">Best Ways to Use ${tool.name}</div>
      <ul class="modal-usecases">
        ${(tool.useCases || ["Everyday AI assistance"]).map((u) => `<li>${u}</li>`).join("")}
      </ul>

      <div style="display: flex; gap: 14px; margin-top: 30px; flex-wrap: wrap;">
        <a href="${appUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="flex: 1;">
          Launch ${tool.name} App (${domain}) ↗
        </a>
        <button class="btn btn-outline" onclick="document.getElementById('modalOverlay').classList.remove('open')">
          Close
        </button>
      </div>
    `;

    overlay.classList.add("open");
  };

  window.openCompareModal = function () {
    const modalBody = document.getElementById("modalBody");
    const modalContent = overlay.querySelector(".modal-content");
    modalContent.className = "modal-content compare-modal-content";

    const tools = AI_TOOLS_DATA.filter((t) => selectedToolsForCompare.has(t.id));
    if (tools.length === 0) return;

    modalBody.innerHTML = `
      <h2 style="font-size: 1.8rem; margin-bottom: 6px;">AI App Comparison Matrix</h2>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">
        Compare capabilities side-by-side and launch any official app directly.
      </p>

      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Feature / Metric</th>
              ${tools
                .map(
                  (t) =>
                    `<th>${t.name} <a href="${t.website}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); text-decoration: none; margin-left: 4px;">↗</a></th>`
                )
                .join("")}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Provider</strong></td>
              ${tools.map((t) => `<td>${t.provider}</td>`).join("")}
            </tr>
            <tr>
              <td><strong>Pricing</strong></td>
              ${tools.map((t) => `<td>${t.pricing || "Freemium"}</td>`).join("")}
            </tr>
            <tr>
              <td><strong>Reasoning Index</strong></td>
              ${tools.map((t) => `<td><strong style="color: var(--accent-cyan);">${t.metrics?.reasoning || 85}%</strong></td>`).join("")}
            </tr>
            <tr>
              <td><strong>Coding &amp; Utility</strong></td>
              ${tools.map((t) => `<td><strong style="color: var(--accent-purple);">${t.metrics?.coding || 85}%</strong></td>`).join("")}
            </tr>
            <tr>
              <td><strong>Modalities</strong></td>
              ${tools.map((t) => `<td>${(t.modalities || []).join(", ")}</td>`).join("")}
            </tr>
            <tr>
              <td><strong>Direct App Link</strong></td>
              ${tools
                .map(
                  (t) =>
                    `<td><a href="${t.website}" target="_blank" rel="noopener noreferrer" class="btn btn-primary card-btn">Open App ↗</a></td>`
                )
                .join("")}
            </tr>
          </tbody>
        </table>
      </div>
    `;

    overlay.classList.add("open");
  };
}

/* ===================================================================
   5. General Interactions & Toast
   =================================================================== */
function initInteractions() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.querySelector(".nav-links");
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("mobile-open");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("mobile-open");
      });
    });
  }

  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector("input");
      if (input && input.value) {
        showToast("Subscribed! Welcome to Mindora AI updates.");
        input.value = "";
      }
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: "smooth"
        });
      }
    });
  });
}

function showToast(message) {
  let toast = document.getElementById("toastNotice");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastNotice";
    toast.className = "toast-notice";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <span style="color: var(--accent-cyan); font-size: 1.1rem;">⚡</span>
    <span>${message}</span>
  `;

  toast.classList.add("show");

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}
