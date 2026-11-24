/* ==========================================================================
   LocalStorage Persistence — Bookmarks, Mistakes, Mastered IDs & History
   ========================================================================== */

(function () {
  const KEYS = {
    BOOKMARKS: "uaf_chs_bookmarks",
    MISTAKES: "uaf_chs_mistakes",
    MASTERED: "uaf_chs_mastered",
    HISTORY: "uaf_chs_history"
  };

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
  }

  function getBookmarks() {
    return readJSON(KEYS.BOOKMARKS, []);
  }

  function toggleBookmark(id) {
    const list = new Set(getBookmarks());
    let added = false;
    if (list.has(id)) {
      list.delete(id);
    } else {
      list.add(id);
      added = true;
    }
    writeJSON(KEYS.BOOKMARKS, Array.from(list));
    return added;
  }

  function getMistakes() {
    return readJSON(KEYS.MISTAKES, []);
  }

  function recordOutcome(id, isCorrect) {
    const mistakes = new Set(getMistakes());
    const mastered = new Set(getMastered());
    if (isCorrect) {
      mistakes.delete(id);
      mastered.add(id);
    } else {
      mistakes.add(id);
    }
    writeJSON(KEYS.MISTAKES, Array.from(mistakes));
    writeJSON(KEYS.MASTERED, Array.from(mastered));
  }

  function getMastered() {
    return readJSON(KEYS.MASTERED, []);
  }

  function getHistory() {
    return readJSON(KEYS.HISTORY, []);
  }

  function addHistoryEntry(entry) {
    const history = getHistory();
    history.unshift(entry);
    writeJSON(KEYS.HISTORY, history.slice(0, 12));
  }

  function getBestScorePct() {
    const history = getHistory();
    if (!history.length) return 0;
    return Math.max(...history.map((h) => h.percent || 0));
  }

  function resetAllProgress() {
    Object.values(KEYS).forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (_) {}
    });
  }

  window.QuizApp = window.QuizApp || {};
  window.QuizApp.storage = {
    getBookmarks,
    toggleBookmark,
    getMistakes,
    getMastered,
    recordOutcome,
    getHistory,
    addHistoryEntry,
    getBestScorePct,
    resetAllProgress
  };
})();
