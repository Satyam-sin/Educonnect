/* ==========================================================================
   Shared Theme, Accent Color, Font Size Slider (11px–26px) & Global Settings
   Synced seamlessly via localStorage across EVERY page of SMART PROCESS!
   ========================================================================== */

(function () {
  const KEYS = {
    THEME: "chs_exp_theme",
    ACCENT: "chs_exp_accent",
    FONT_SIZE: "chs_exp_font_size",
    FONT_FAMILY: "chs_exp_font_family",
    DENSITY: "chs_exp_density",
    AUTO_HIDE: "chs_exp_auto_hide",
    ANIMATIONS: "chs_exp_animations",
    CONTRAST: "chs_exp_contrast",
    HOME_LAYOUT: "chs_exp_home_layout",
    SHOW_SOON: "chs_exp_show_soon"
  };

  const DEFAULTS = {
    theme: "dark",
    accent: "indigo",
    fontSize: 16,
    fontFamily: "sans",
    density: "comfortable",
    autoHide: true,
    animations: true,
    contrast: false,
    homeLayout: "grid",
    showSoon: true
  };

  function updateSliderFill(sliderEl) {
    if (!sliderEl) return;
    const min = parseFloat(sliderEl.min) || 0;
    const max = parseFloat(sliderEl.max) || 100;
    const val = parseFloat(sliderEl.value) || min;
    const pct = ((val - min) / (max - min)) * 100;
    sliderEl.style.setProperty("--slider-pct", `${pct}%`);
  }

  function applyTheme(theme) {
    const valid = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", valid);
    try { localStorage.setItem(KEYS.THEME, valid); } catch (_) {}
    document.querySelectorAll("[data-theme-choice]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.themeChoice === valid);
    });
  }

  function applyAccent(accent) {
    const allowed = ["indigo", "emerald", "amber", "rose", "cyan", "violet"];
    const valid = allowed.includes(accent) ? accent : DEFAULTS.accent;
    document.documentElement.setAttribute("data-accent", valid);
    try { localStorage.setItem(KEYS.ACCENT, valid); } catch (_) {}
    document.querySelectorAll("[data-accent-choice]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.accentChoice === valid);
    });
  }

  function applyFontSize(sizePx) {
    const num = Math.max(11, Math.min(26, parseInt(sizePx, 10) || DEFAULTS.fontSize));
    document.documentElement.style.fontSize = `${num}px`;
    try { localStorage.setItem(KEYS.FONT_SIZE, String(num)); } catch (_) {}

    const slider = document.getElementById("fontSizeSlider");
    if (slider) {
      slider.value = String(num);
      updateSliderFill(slider);
    }
    const label = document.getElementById("fontSizeValue");
    if (label) label.textContent = `${num}px`;
  }

  function applyFontFamily(family) {
    const allowed = ["sans", "serif", "rounded"];
    const valid = allowed.includes(family) ? family : DEFAULTS.fontFamily;
    document.documentElement.setAttribute("data-font", valid);
    try { localStorage.setItem(KEYS.FONT_FAMILY, valid); } catch (_) {}
    document.querySelectorAll("[data-font-family]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.fontFamily === valid);
    });
  }

  function applyDensity(density) {
    const valid = density === "compact" ? "compact" : "comfortable";
    document.documentElement.setAttribute("data-density", valid);
    try { localStorage.setItem(KEYS.DENSITY, valid); } catch (_) {}
    document.querySelectorAll("[data-density-choice]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.densityChoice === valid);
    });
  }

  function applyAutoHide(enabled) {
    const val = Boolean(enabled);
    document.documentElement.setAttribute("data-auto-hide", val ? "on" : "off");
    try { localStorage.setItem(KEYS.AUTO_HIDE, String(val)); } catch (_) {}
    const el = document.getElementById("settingsAutoHideToggle");
    if (el) el.checked = val;
    if (!val && window.QuizApp.scroll) window.QuizApp.scroll.showControls();
  }

  function applyAnimations(enabled) {
    const val = Boolean(enabled);
    document.documentElement.setAttribute("data-animations", val ? "on" : "off");
    try { localStorage.setItem(KEYS.ANIMATIONS, String(val)); } catch (_) {}
    const el = document.getElementById("settingsAnimToggle");
    if (el) el.checked = val;
  }

  function applyContrast(enabled) {
    const val = Boolean(enabled);
    document.documentElement.setAttribute("data-contrast", val ? "high" : "normal");
    try { localStorage.setItem(KEYS.CONTRAST, String(val)); } catch (_) {}
    const el = document.getElementById("settingsContrastToggle");
    if (el) el.checked = val;
  }

  function applyHomeLayout(layout) {
    const valid = layout === "list" ? "list" : "grid";
    document.documentElement.setAttribute("data-home-layout", valid);
    try { localStorage.setItem(KEYS.HOME_LAYOUT, valid); } catch (_) {}
    document.querySelectorAll("[data-home-layout-choice]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.homeLayoutChoice === valid);
    });
  }

  function applyShowSoon(enabled) {
    const val = Boolean(enabled);
    document.documentElement.setAttribute("data-show-soon", val ? "true" : "false");
    try { localStorage.setItem(KEYS.SHOW_SOON, String(val)); } catch (_) {}
    const el = document.getElementById("settingsSoonToggle");
    if (el) el.checked = val;
  }

  function isAutoHideEnabled() {
    return document.documentElement.getAttribute("data-auto-hide") !== "off";
  }

  function resetAppearanceDefaults() {
    applyTheme(DEFAULTS.theme);
    applyAccent(DEFAULTS.accent);
    applyFontSize(DEFAULTS.fontSize);
    applyFontFamily(DEFAULTS.fontFamily);
    applyDensity(DEFAULTS.density);
    applyAutoHide(DEFAULTS.autoHide);
    applyAnimations(DEFAULTS.animations);
    applyContrast(DEFAULTS.contrast);
    applyHomeLayout(DEFAULTS.homeLayout);
    applyShowSoon(DEFAULTS.showSoon);
  }

  function readBool(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : raw === "true";
    } catch (_) {
      return fallback;
    }
  }

  function initTheme() {
    let savedTheme = DEFAULTS.theme;
    let savedAccent = DEFAULTS.accent;
    let savedSize = DEFAULTS.fontSize;
    let savedFamily = DEFAULTS.fontFamily;
    let savedDensity = DEFAULTS.density;
    let savedLayout = DEFAULTS.homeLayout;

    try {
      savedTheme = localStorage.getItem(KEYS.THEME) || DEFAULTS.theme;
      savedAccent = localStorage.getItem(KEYS.ACCENT) || DEFAULTS.accent;
      savedSize = parseInt(localStorage.getItem(KEYS.FONT_SIZE), 10) || DEFAULTS.fontSize;
      savedFamily = localStorage.getItem(KEYS.FONT_FAMILY) || DEFAULTS.fontFamily;
      savedDensity = localStorage.getItem(KEYS.DENSITY) || DEFAULTS.density;
      savedLayout = localStorage.getItem(KEYS.HOME_LAYOUT) || DEFAULTS.homeLayout;
    } catch (_) {}

    applyTheme(savedTheme);
    applyAccent(savedAccent);
    applyFontSize(savedSize);
    applyFontFamily(savedFamily);
    applyDensity(savedDensity);
    applyAutoHide(readBool(KEYS.AUTO_HIDE, DEFAULTS.autoHide));
    applyAnimations(readBool(KEYS.ANIMATIONS, DEFAULTS.animations));
    applyContrast(readBool(KEYS.CONTRAST, DEFAULTS.contrast));
    applyHomeLayout(savedLayout);
    applyShowSoon(readBool(KEYS.SHOW_SOON, DEFAULTS.showSoon));

    document.querySelectorAll("[data-theme-choice]").forEach((btn) => {
      btn.addEventListener("click", () => applyTheme(btn.dataset.themeChoice));
    });

    document.querySelectorAll("[data-accent-choice]").forEach((btn) => {
      btn.addEventListener("click", () => applyAccent(btn.dataset.accentChoice));
    });

    const slider = document.getElementById("fontSizeSlider");
    if (slider) {
      slider.addEventListener("input", (e) => applyFontSize(e.target.value));
    }

    document.querySelectorAll("[data-font-family]").forEach((btn) => {
      btn.addEventListener("click", () => applyFontFamily(btn.dataset.fontFamily));
    });

    document.querySelectorAll("[data-density-choice]").forEach((btn) => {
      btn.addEventListener("click", () => applyDensity(btn.dataset.densityChoice));
    });

    document.querySelectorAll("[data-home-layout-choice]").forEach((btn) => {
      btn.addEventListener("click", () => applyHomeLayout(btn.dataset.homeLayoutChoice));
    });

    const autoHideEl = document.getElementById("settingsAutoHideToggle");
    if (autoHideEl) autoHideEl.addEventListener("change", (e) => applyAutoHide(e.target.checked));

    const animEl = document.getElementById("settingsAnimToggle");
    if (animEl) animEl.addEventListener("change", (e) => applyAnimations(e.target.checked));

    const contrastEl = document.getElementById("settingsContrastToggle");
    if (contrastEl) contrastEl.addEventListener("change", (e) => applyContrast(e.target.checked));

    const soonEl = document.getElementById("settingsSoonToggle");
    if (soonEl) soonEl.addEventListener("change", (e) => applyShowSoon(e.target.checked));
  }

  window.QuizApp = window.QuizApp || {};
  window.QuizApp.theme = {
    initTheme,
    applyTheme,
    applyAccent,
    applyFontSize,
    applyFontFamily,
    applyDensity,
    applyAutoHide,
    applyAnimations,
    applyContrast,
    applyHomeLayout,
    applyShowSoon,
    isAutoHideEnabled,
    updateSliderFill,
    resetAppearanceDefaults
  };
})();
