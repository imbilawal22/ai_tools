/* ===================================================================
   Mindora AI - Core JavaScript (Empty Slate Engine)
   =================================================================== */

let currentCategory = "all";
let currentSearchQuery = "";
let currentSort = "name";
const selectedToolsForCompare = new Set();

document.addEventListener("DOMContentLoaded", () => {
  initNeuralCanvas();
  initToolExplorer();
  initAddToolSystem();
  initComparisonSystem();
  initModals();
  initInteractions();
  updateToolCounters();
});

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

      // Mouse interactive push
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
   2. Tool Explorer & Empty State Renderer
   =================================================================== */
function initToolExplorer() {
  const grid = document.getElementById("toolsGrid");
  const searchInput = document.getElementById("toolSearch");
  const sortSelect = document.getElementById("toolSort");
  const filterBtns = document.querySelectorAll(".filter-btn");

  if (!grid) return;

  window.renderTools = function () {
    updateToolCounters();

    // If completely empty database
    if (AI_TOOLS_DATA.length === 0) {
      grid.innerHTML = `
        <div class="empty-tools-card" style="grid-column: 1 / -1; text-align: center; padding: 64px 24px; background: var(--bg-card); border: 1px dashed rgba(0, 242, 254, 0.3); border-radius: var(--radius-lg); backdrop-filter: blur(14px);">
          <div style="font-size: 3.2rem; margin-bottom: 14px; color: var(--accent-cyan);">🌌</div>
          <h3 style="font-size: 1.6rem; margin-bottom: 10px;">The Registry is Currently Empty</h3>
          <p style="color: var(--text-muted); max-width: 520px; margin: 0 auto 26px; font-size: 0.95rem; line-height: 1.6;">
            All pre-loaded tools have been removed as requested. Mindora AI is in clean slate mode, ready to receive your chosen evolving AI tools.
          </p>
          <button class="btn btn-primary" onclick="openAddToolModal()">
            + Register First AI Tool
          </button>
        </div>
      `;
      return;
    }

    let filtered = AI_TOOLS_DATA.filter((tool) => {
      const matchesCategory =
        currentCategory === "all" || tool.category === currentCategory;
      const matchesSearch =
        tool.name.toLowerCase().includes(currentSearchQuery) ||
        tool.provider.toLowerCase().includes(currentSearchQuery) ||
        tool.tagline.toLowerCase().includes(currentSearchQuery) ||
        (tool.modalities && tool.modalities.some((m) => m.toLowerCase().includes(currentSearchQuery)));
      return matchesCategory && matchesSearch;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (currentSort === "reasoning") {
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
          <h3>No tools match "${currentSearchQuery}" in category "${currentCategory}"</h3>
          <p style="margin-top: 8px;">Try clearing filters or search query.</p>
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
          .join("");

        const reasoningScore = tool.metrics?.reasoning || 85;
        const codingScore = tool.metrics?.coding || 85;

        return `
        <div class="tool-card" data-id="${tool.id}">
          <div>
            <div class="tool-card-header">
              <div class="tool-identity">
                <div class="tool-avatar">${initials}</div>
                <div>
                  <h3 class="tool-name">${tool.name}</h3>
                  <span class="tool-provider">${tool.provider}</span>
                </div>
              </div>
              <span class="tool-badge ${tool.badgeType || 'frontier'}">${tool.badge || 'Registered'}</span>
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
                  <span>Coding & Agentic</span>
                  <span>${codingScore}%</span>
                </div>
                <div class="metric-track">
                  <div class="metric-fill violet" style="width: ${codingScore}%"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="tool-card-footer">
            <label class="compare-checkbox-label" title="Compare tool">
              <input type="checkbox" class="tool-compare-chk" data-id="${tool.id}" ${isChecked ? "checked" : ""}>
              <span>Compare</span>
            </label>
            <button class="btn btn-outline card-btn view-details-btn" data-id="${tool.id}">
              Inspect Specs ↗
            </button>
          </div>
        </div>
      `;
      })
      .join("");

    attachCardEventListeners();
  };

  // Event Listeners
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
  const count = AI_TOOLS_DATA.length;
  const navCountEl = document.getElementById("navToolCount");
  const statCountEl = document.getElementById("statToolsCount");
  const allBtn = document.querySelector('.filter-btn[data-category="all"]');

  if (navCountEl) navCountEl.textContent = `${count} Tools in Database`;
  if (statCountEl) statCountEl.textContent = count.toString();
  if (allBtn) allBtn.textContent = `All (${count})`;
}

function attachCardEventListeners() {
  document.querySelectorAll(".tool-compare-chk").forEach((chk) => {
    chk.addEventListener("change", (e) => {
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
    btn.addEventListener("click", () => {
      const toolId = btn.getAttribute("data-id");
      openToolModal(toolId);
    });
  });
}

/* ===================================================================
   3. Add Tool Modal & Dynamic Registration Engine
   =================================================================== */
function initAddToolSystem() {
  const addModal = document.getElementById("addToolModalOverlay");
  const closeBtn = document.getElementById("addToolCloseBtn");
  const cancelBtn = document.getElementById("btnCancelAddTool");
  const form = document.getElementById("addToolForm");

  // Open triggers
  const triggers = [
    document.getElementById("heroAddToolBtn"),
    document.getElementById("navAddToolBtn"),
    document.getElementById("controlBarAddBtn"),
    document.getElementById("footerAddToolLink")
  ];

  window.openAddToolModal = function () {
    if (addModal) addModal.classList.add("open");
  };

  function closeAddToolModal() {
    if (addModal) addModal.classList.remove("open");
  }

  triggers.forEach((btn) => {
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openAddToolModal();
      });
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", closeAddToolModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeAddToolModal);

  // Sliders dynamic display
  const rSlider = document.getElementById("inputToolReasoning");
  const rLabel = document.getElementById("labelReasoningScore");
  if (rSlider && rLabel) {
    rSlider.addEventListener("input", (e) => {
      rLabel.textContent = `${e.target.value}%`;
    });
  }

  const cSlider = document.getElementById("inputToolCoding");
  const cLabel = document.getElementById("labelCodingScore");
  if (cSlider && cLabel) {
    cSlider.addEventListener("input", (e) => {
      cLabel.textContent = `${e.target.value}%`;
    });
  }

  // Handle Form Submission
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("inputToolName").value.trim();
      const category = document.getElementById("inputToolCategory").value;
      const provider = document.getElementById("inputToolProvider").value.trim();
      const tagline = document.getElementById("inputToolTagline").value.trim();
      const modalitiesRaw = document.getElementById("inputToolModalities").value.trim();
      const reasoning = parseInt(rSlider ? rSlider.value : 85, 10);
      const coding = parseInt(cSlider ? cSlider.value : 85, 10);

      const modalities = modalitiesRaw
        ? modalitiesRaw.split(",").map((s) => s.trim()).filter(Boolean)
        : ["Text", "Code"];

      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

      const newTool = {
        id,
        name,
        category,
        provider,
        badge: "User Registered",
        badgeType: category === "reasoning" ? "frontier" : category === "coding" ? "agentic" : "open",
        tagline,
        description: `${name} registered into the Mindora AI hub. Specialized in ${category} workflows.`,
        modalities,
        metrics: {
          reasoning,
          coding,
          costEfficiency: 90
        },
        contextWindow: "128k Tokens",
        pricing: "Configured by Provider",
        useCases: [
          `Primary deployment in ${category} tasks`,
          "Integrated into Mindora AI architecture"
        ]
      };

      AI_TOOLS_DATA.unshift(newTool);
      window.renderTools();
      closeAddToolModal();
      form.reset();
      if (rLabel) rLabel.textContent = "90%";
      if (cLabel) cLabel.textContent = "90%";
      showToast(`Registered "${name}" to Mindora AI!`);
    });
  }

  // Reset/Clear link
  const clearLink = document.getElementById("footerClearToolsLink");
  if (clearLink) {
    clearLink.addEventListener("click", (e) => {
      e.preventDefault();
      AI_TOOLS_DATA = [];
      selectedToolsForCompare.clear();
      if (window.updateComparisonDrawer) updateComparisonDrawer();
      window.renderTools();
      showToast("Registry reset to clean slate (0 tools).");
    });
  }
}

/* ===================================================================
   4. Comparison System & Floating Drawer
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
   5. Modals (Specs Inspector & Compare Matrix)
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
      const addModal = document.getElementById("addToolModalOverlay");
      if (addModal) addModal.classList.remove("open");
    }
  });

  window.openToolModal = function (toolId) {
    const tool = AI_TOOLS_DATA.find((t) => t.id === toolId);
    if (!tool) return;

    const modalBody = document.getElementById("modalBody");
    const modalContent = overlay.querySelector(".modal-content");
    modalContent.className = "modal-content";

    modalBody.innerHTML = `
      <div class="modal-header-meta">
        <span class="tool-badge ${tool.badgeType || 'frontier'}">${tool.badge || 'Registered'}</span>
        <span style="font-size: 0.82rem; color: var(--text-dim);">${tool.category}</span>
      </div>
      <h2 class="modal-tool-name">${tool.name}</h2>
      <div class="modal-tagline">${tool.tagline}</div>
      <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 24px; line-height: 1.7;">
        ${tool.description}
      </p>

      <div class="modal-section-title">Telemetry & Specifications</div>
      <div class="specs-grid">
        <div class="spec-cell">
          <span class="spec-key">Provider / Lab</span>
          <span class="spec-val">${tool.provider}</span>
        </div>
        <div class="spec-cell">
          <span class="spec-key">Category</span>
          <span class="spec-val">${tool.category}</span>
        </div>
        <div class="spec-cell">
          <span class="spec-key">Reasoning Benchmark</span>
          <span class="spec-val" style="color: var(--accent-cyan);">${tool.metrics?.reasoning || 85}%</span>
        </div>
        <div class="spec-cell">
          <span class="spec-key">Coding & Autonomy</span>
          <span class="spec-val" style="color: var(--accent-purple);">${tool.metrics?.coding || 85}%</span>
        </div>
      </div>

      <div class="modal-section-title">Operational Roles</div>
      <ul class="modal-usecases">
        ${(tool.useCases || ["Primary task automation"]).map((u) => `<li>${u}</li>`).join("")}
      </ul>

      <div style="display: flex; gap: 14px; margin-top: 30px;">
        <button class="btn btn-outline" style="flex: 1;" onclick="document.getElementById('modalOverlay').classList.remove('open')">
          Close Inspector
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
      <h2 style="font-size: 1.8rem; margin-bottom: 6px;">Frontier Tool Comparison Matrix</h2>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">
        Head-to-head architectural telemetry, capability indices, and runtime metrics.
      </p>

      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Feature / Metric</th>
              ${tools.map((t) => `<th>${t.name}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Provider</strong></td>
              ${tools.map((t) => `<td>${t.provider}</td>`).join("")}
            </tr>
            <tr>
              <td><strong>Category</strong></td>
              ${tools.map((t) => `<td>${t.category}</td>`).join("")}
            </tr>
            <tr>
              <td><strong>Reasoning Index</strong></td>
              ${tools.map((t) => `<td><strong style="color: var(--accent-cyan);">${t.metrics?.reasoning || 85}%</strong></td>`).join("")}
            </tr>
            <tr>
              <td><strong>Coding Index</strong></td>
              ${tools.map((t) => `<td><strong style="color: var(--accent-purple);">${t.metrics?.coding || 85}%</strong></td>`).join("")}
            </tr>
            <tr>
              <td><strong>Modalities</strong></td>
              ${tools.map((t) => `<td>${(t.modalities || []).join(", ")}</td>`).join("")}
            </tr>
          </tbody>
        </table>
      </div>
    `;

    overlay.classList.add("open");
  };
}

/* ===================================================================
   6. General Interactions & Toast
   =================================================================== */
function initInteractions() {
  // Mobile Menu Toggle
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

  // Newsletter Form
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

  // Smooth scroll
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
