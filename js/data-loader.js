/* ==========================================================================
   Data Loader — Fetches data/questions.json & data/revision-notes.json
   with automatic offline fallback when opened directly via file://
   ========================================================================== */

(function () {
  async function loadQuizData() {
    let questionsPayload = null;
    let notesPayload = null;

    try {
      const [qRes, nRes] = await Promise.all([
        fetch("data/questions.json", { cache: "no-store" }),
        fetch("data/revision-notes.json", { cache: "no-store" })
      ]);
      if (qRes.ok) questionsPayload = await qRes.json();
      if (nRes.ok) notesPayload = await nRes.json();
    } catch (_) {
      // Expected when opened directly from local filesystem (file://) without a server
    }

    if (!questionsPayload && window.QUESTIONS_FALLBACK) {
      questionsPayload = window.QUESTIONS_FALLBACK;
    }
    if (!notesPayload && window.REVISION_NOTES_FALLBACK) {
      notesPayload = window.REVISION_NOTES_FALLBACK;
    }

    if (!questionsPayload || !Array.isArray(questionsPayload.questions)) {
      throw new Error("Unable to load questions dataset.");
    }

    return {
      chapter: questionsPayload.chapter,
      source: questionsPayload.source,
      questions: questionsPayload.questions,
      notes: notesPayload && Array.isArray(notesPayload.notes) ? notesPayload.notes : []
    };
  }

  window.QuizApp = window.QuizApp || {};
  window.QuizApp.dataLoader = { loadQuizData };
})();
