/* ==========================================================================
   Shared Scroll Behavior — Hides Topbar on scroll down,
   ONLY unhides when back at the VERY TOP (respects Auto-Hide setting)
   ========================================================================== */

(function () {
  let ticking = false;
  const HIDE_THRESHOLD_Y = 36;
  const TOP_REVEAL_Y = 14;

  function isSettingsOpen() {
    const backdrop = document.getElementById("settingsModalBackdrop");
    return backdrop && !backdrop.classList.contains("hidden");
  }

  function updateVisibility() {
    ticking = false;
    const topbar = document.getElementById("mainTopbar");
    if (!topbar) return;

    if (window.QuizApp.theme && !window.QuizApp.theme.isAutoHideEnabled()) {
      topbar.classList.remove("topbar--hidden");
      return;
    }

    if (isSettingsOpen()) return;

    const currentY = window.scrollY || window.pageYOffset || 0;
    if (currentY <= TOP_REVEAL_Y) {
      topbar.classList.remove("topbar--hidden");
    } else if (currentY > HIDE_THRESHOLD_Y) {
      topbar.classList.add("topbar--hidden");
    }
  }

  function showControls() {
    const topbar = document.getElementById("mainTopbar");
    if (topbar) topbar.classList.remove("topbar--hidden");
  }

  function initScrollBehavior() {
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(updateVisibility);
          ticking = true;
        }
      },
      { passive: true }
    );
    updateVisibility();
  }

  window.QuizApp = window.QuizApp || {};
  window.QuizApp.scroll = { initScrollBehavior, showControls };
})();
