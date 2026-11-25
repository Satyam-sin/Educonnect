/* ==========================================================================
   Quiz Engine — Session State, Answer Check Modes, Shuffling, Timer & Scoring
   ========================================================================== */

(function () {
  function shuffleArray(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function prepareQuestion(q, shouldShuffleOptions) {
    const indexed = q.options.map((text, idx) => ({
      text,
      isCorrect: idx === q.correctIndex
    }));
    const finalOpts = shouldShuffleOptions ? shuffleArray(indexed) : indexed;
    return {
      ...q,
      displayOptions: finalOpts.map((o) => o.text),
      displayCorrectIndex: finalOpts.findIndex((o) => o.isCorrect)
    };
  }

  function createSession(allQuestions, config) {
    let pool = allQuestions.slice();

    if (config.specialFilter === "mistakes") {
      const mistakeSet = new Set(window.QuizApp.storage.getMistakes());
      pool = pool.filter((q) => mistakeSet.has(q.id));
    } else if (config.specialFilter === "bookmarks") {
      const bmSet = new Set(window.QuizApp.storage.getBookmarks());
      pool = pool.filter((q) => bmSet.has(q.id));
    } else {
      if (config.topic && config.topic !== "ALL") {
        pool = pool.filter((q) => q.topic === config.topic);
      }
      if (config.difficulty && config.difficulty !== "ALL") {
        pool = pool.filter((q) => {
          if (config.difficulty === "CHS Exam") {
            return q.difficulty === "CHS Exam" || q.difficulty === "Hard";
          }
          return q.difficulty === config.difficulty;
        });
      }
    }

    if (config.shuffleQuestions) {
      pool = shuffleArray(pool);
    }

    const limit =
      config.count === "ALL" ? pool.length : Math.min(Number(config.count), pool.length);
    const selected = pool.slice(0, limit).map((q) => prepareQuestion(q, config.shuffleOptions));

    const secondsPerQuestion = 45;
    const isTimed = config.mode === "exam";
    const totalTimeSec = isTimed ? selected.length * secondsPerQuestion : 0;

    return {
      mode: config.mode, // "practice" | "exam"
      // answerRevealMode: "instant" (show ✓/✗ on click) | "submit-end" (show all after submit)
      answerRevealMode:
        config.answerRevealMode || (config.mode === "exam" ? "submit-end" : "instant"),
      topicLabel: config.specialFilter
        ? config.specialFilter === "mistakes"
          ? "Mistakes Review"
          : "Bookmarked Questions"
        : config.topic === "ALL"
        ? "All Topics"
        : config.topic,
      questions: selected,
      currentIndex: 0,
      answers: {}, // index -> selectedOptionIndex
      marked: new Set(),
      streak: 0,
      bestStreak: 0,
      elapsedSec: 0,
      remainingSec: totalTimeSec,
      finished: false
    };
  }

  function evaluateSession(session) {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    const byTopic = {};

    session.questions.forEach((q, idx) => {
      if (!byTopic[q.topic]) {
        byTopic[q.topic] = { total: 0, correct: 0 };
      }
      byTopic[q.topic].total += 1;

      const userAns = session.answers[idx];
      if (userAns === undefined) {
        skipped += 1;
      } else if (userAns === q.displayCorrectIndex) {
        correct += 1;
        byTopic[q.topic].correct += 1;
        window.QuizApp.storage.recordOutcome(q.id, true);
      } else {
        wrong += 1;
        window.QuizApp.storage.recordOutcome(q.id, false);
      }
    });

    const total = session.questions.length;
    const percent = total ? Math.round((correct / total) * 100) : 0;

    return {
      total,
      correct,
      wrong,
      skipped,
      percent,
      elapsedSec: session.elapsedSec,
      bestStreak: session.bestStreak,
      byTopic
    };
  }

  function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  window.QuizApp = window.QuizApp || {};
  window.QuizApp.engine = { createSession, evaluateSession, formatTime };
})();
