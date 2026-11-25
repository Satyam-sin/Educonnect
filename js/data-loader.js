/* ==========================================================================
   Multi-Quiz Data Loader — Supports Any Chapter JSON + Offline file:// Fallback
   ========================================================================== */

(function () {
  async function loadQuizData() {
    const cfg = window.QUIZ_DATA_CONFIG || {
      jsonPath: "data/questions.json",
      fallbackKey: "QUESTIONS_FALLBACK"
    };

    let questionsPayload = null;

    try {
      const qRes = await fetch(cfg.jsonPath, { cache: "no-store" });
      if (qRes.ok) questionsPayload = await qRes.json();
    } catch (_) {
      // Expected when opened directly from local filesystem (file://) without a server
    }

    if (!questionsPayload && window[cfg.fallbackKey]) {
      questionsPayload = window[cfg.fallbackKey];
    }

    if (!questionsPayload || !Array.isArray(questionsPayload.questions)) {
      throw new Error("Unable to load questions dataset.");
    }

    return {
      chapter: questionsPayload.chapter,
      source: questionsPayload.source,
      questions: questionsPayload.questions
    };
  }

  window.QuizApp = window.QuizApp || {};
  window.QuizApp.dataLoader = { loadQuizData };
})();
