/* ==========================================================================
   Main Application Controller — Pure Quiz Flow + Unified Cohesive Settings
   ========================================================================== */

(function () {
  const LETTERS = ["A", "B", "C", "D"];

  const state = {
    allQuestions: [],
    activeTab: "home", // home | quiz | results
    setup: {
      mode: "practice",
      answerRevealMode: "instant", // "instant" | "submit-end"
      topic: "ALL",
      difficulty: "ALL",
      count: "20",
      shuffleQuestions: true,
      shuffleOptions: true
    },
    session: null,
    lastResult: null,
    timerId: null,
    reviewFilter: "ALL"
  };

  function $(id) {
    return document.getElementById(id);
  }

  function showToast(message) {
    const toast = $("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove("hidden");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.add("hidden"), 2400);
  }

  function stopTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function openSettings() {
    syncSettingsModal();
    $("settingsModalBackdrop").classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeSettings() {
    $("settingsModalBackdrop").classList.add("hidden");
    document.body.style.overflow = "";
    if (window.QuizApp.scroll) window.QuizApp.scroll.showControls();
  }

  function syncSettingsModal() {
    const activeReveal = state.session
      ? state.session.answerRevealMode
      : state.setup.answerRevealMode;

    document.querySelectorAll("[data-settings-reveal]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.settingsReveal === activeReveal);
    });

    const inQuiz = state.activeTab === "quiz" && state.session && !state.session.finished;
    $("settingsActiveQuizSection").classList.toggle("hidden", !inQuiz);
  }

  function switchView(viewName) {
    if (window.QuizApp.tts) window.QuizApp.tts.stopSpeaking();
    if (viewName !== "quiz") {
      stopTimer();
      $("topProgressRail").classList.add("hidden");
    } else {
      $("topProgressRail").classList.remove("hidden");
    }

    state.activeTab = viewName;

    ["viewHome", "viewQuiz", "viewResults"].forEach((id) => {
      const el = $(id);
      if (el) el.classList.add("hidden");
    });

    const map = {
      home: "viewHome",
      quiz: "viewQuiz",
      results: "viewResults"
    };

    const target = $(map[viewName]);
    if (target) {
      target.classList.remove("hidden");
      target.classList.remove("fade-in");
      void target.offsetWidth;
      target.classList.add("fade-in");
    }

    window.scrollTo({ top: 0, behavior: "instant" });
    if (window.QuizApp.scroll) window.QuizApp.scroll.showControls();
    if (viewName === "home") updateMatchingCount();
  }

  function updateMatchingCount() {
    let matching = state.allQuestions.slice();
    if (state.setup.topic !== "ALL") {
      matching = matching.filter((q) => q.topic === state.setup.topic);
    }
    if (state.setup.difficulty !== "ALL") {
      matching = matching.filter((q) => q.difficulty === state.setup.difficulty);
    }
    $("matchingPoolCount").textContent = `${matching.length} MCQs available`;
  }

  function populateTopicDropdown() {
    const topics = Array.from(new Set(state.allQuestions.map((q) => q.topic)));
    $("topicSelect").innerHTML =
      `<option value="ALL">All Chapter Topics (${state.allQuestions.length} Questions)</option>` +
      topics
        .map((t) => {
          const cnt = state.allQuestions.filter((q) => q.topic === t).length;
          return `<option value="${t}">${t} (${cnt})</option>`;
        })
        .join("");
  }

  function startQuiz() {
    const session = window.QuizApp.engine.createSession(state.allQuestions, state.setup);
    if (!session.questions.length) {
      showToast("No questions match the selected filters.");
      return;
    }
    state.session = session;
    closeSettings();
    switchView("quiz");
    renderQuizFeed();
    startTimer();
  }

  function startTimer() {
    stopTimer();
    updateTimerDisplay();
    state.timerId = setInterval(() => {
      if (!state.session || state.session.finished) {
        stopTimer();
        return;
      }
      state.session.elapsedSec += 1;
      if (state.session.mode === "exam") {
        state.session.remainingSec -= 1;
        if (state.session.remainingSec <= 0) {
          state.session.remainingSec = 0;
          updateTimerDisplay();
          showToast("Time is up! Submitting automatically.");
          finishQuiz();
          return;
        }
      }
      updateTimerDisplay();
    }, 1000);
  }

  function updateTimerDisplay() {
    if (!state.session) return;
    const fmt = window.QuizApp.engine.formatTime;
    $("quizTimer").textContent =
      state.session.mode === "exam"
        ? `⏳ ${fmt(state.session.remainingSec)}`
        : `⏱ ${fmt(state.session.elapsedSec)}`;
  }

  function getDifficultyPillClass(diff) {
    if (diff === "Easy") return "easy";
    if (diff === "Medium") return "medium";
    return "chs";
  }

  function updateQuizCounters() {
    const s = state.session;
    if (!s) return;
    const total = s.questions.length;
    const answeredCount = Object.keys(s.answers).length;
    const pct = total ? Math.round((answeredCount / total) * 100) : 0;
    const isInstant = s.answerRevealMode === "instant";

    $("quizModeLabel").textContent = isInstant ? "✓ Instant Check" : "📋 Submit at End";
    $("quizProgressText").textContent = `${answeredCount} / ${total} Attempted`;
    $("quizStreak").textContent = `🔥 Streak: ${s.streak}`;
    $("quizStreak").classList.toggle("hidden", !isInstant);
    $("topProgressFill").style.width = `${pct}%`;
    $("footerProgressNote").textContent = `Answered ${answeredCount} of ${total} questions`;
  }

  function buildQuestionCardHtml(q, idx) {
    const s = state.session;
    const userAns = s.answers[idx];
    const isAnswered = userAns !== undefined;
    const isInstant = s.answerRevealMode === "instant";

    let cardClass = "question-card";
    if (isInstant && isAnswered) {
      cardClass += userAns === q.displayCorrectIndex ? " card-correct" : " card-wrong";
    }

    const optionsHtml = q.displayOptions
      .map((optText, optIdx) => {
        let cls = "option-btn";
        let mark = "";
        let disabledAttr = "";

        if (isInstant && isAnswered) {
          disabledAttr = "disabled";
          if (optIdx === q.displayCorrectIndex) {
            cls += " correct";
            mark = "✓";
          } else if (optIdx === userAns) {
            cls += " wrong";
            mark = "✗";
          }
        } else if (!isInstant && userAns === optIdx) {
          cls += " selected";
          mark = "●";
        }

        return `
          <button type="button" class="${cls}" data-qidx="${idx}" data-opt="${optIdx}" ${disabledAttr}>
            <span class="option-left">
              <span class="option-key">${LETTERS[optIdx]}</span>
              <span>${optText}</span>
            </span>
            <span class="option-mark" aria-hidden="true">${mark}</span>
          </button>`;
      })
      .join("");

    let explanationHtml = "";
    if (isInstant && isAnswered) {
      const isRight = userAns === q.displayCorrectIndex;
      explanationHtml = `
        <div class="explanation-box ${isRight ? "correct" : "wrong"}">
          <div class="explanation-title">
            <span>${isRight ? "✓ Correct!" : `✗ Incorrect — Correct answer: ${LETTERS[q.displayCorrectIndex]}`}</span>
            <span class="ncert-tag">${q.ncertRef}</span>
          </div>
          <p>${q.explanation}</p>
        </div>`;
    }

    return `
      <article class="${cardClass}" id="qCard_${idx}">
        <div class="question-top">
          <div class="quiz-meta-pills">
            <span class="pill">Q${idx + 1}</span>
            <span class="pill">${q.topic}</span>
            <span class="pill ${getDifficultyPillClass(q.difficulty)}">${q.difficulty}</span>
          </div>
          <button type="button" class="tts-btn" data-tts-qidx="${idx}" aria-label="Listen to Question ${idx + 1}">
            🔊 Listen
          </button>
        </div>
        <h3 class="question-text">${q.question}</h3>
        <div class="options-list">${optionsHtml}</div>
        ${explanationHtml}
      </article>`;
  }

  function renderQuizFeed() {
    const s = state.session;
    if (!s) return;
    updateQuizCounters();
    const feed = $("questionsFeed");
    feed.innerHTML = s.questions.map((q, idx) => buildQuestionCardHtml(q, idx)).join("");
    attachFeedCardListeners(feed);
  }

  function updateSingleCard(idx) {
    const s = state.session;
    if (!s) return;
    const oldEl = document.getElementById(`qCard_${idx}`);
    if (!oldEl) return;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = buildQuestionCardHtml(s.questions[idx], idx).trim();
    const newEl = wrapper.firstElementChild;
    oldEl.replaceWith(newEl);
    attachFeedCardListeners(newEl);
    updateQuizCounters();
  }

  function attachFeedCardListeners(rootEl) {
    rootEl.querySelectorAll(".option-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        handleSelectOption(Number(btn.dataset.qidx), Number(btn.dataset.opt));
      });
    });

    rootEl.querySelectorAll("[data-tts-qidx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.ttsQidx);
        const q = state.session.questions[idx];
        if (window.QuizApp.tts) {
          window.QuizApp.tts.speakQuestion(idx, q.question, q.displayOptions, btn);
        }
      });
    });
  }

  function handleSelectOption(qIdx, optIndex) {
    const s = state.session;
    if (!s || s.finished) return;
    const q = s.questions[qIdx];
    const isInstant = s.answerRevealMode === "instant";

    if (isInstant && s.answers[qIdx] !== undefined) return;

    s.answers[qIdx] = optIndex;

    if (isInstant) {
      const isCorrect = optIndex === q.displayCorrectIndex;
      if (isCorrect) {
        s.streak += 1;
        if (s.streak > s.bestStreak) s.bestStreak = s.streak;
        window.QuizApp.sound.playCorrect();
      } else {
        s.streak = 0;
        window.QuizApp.sound.playWrong();
      }
      window.QuizApp.storage.recordOutcome(q.id, isCorrect);
    }

    updateSingleCard(qIdx);
  }

  function openSubmitModal() {
    const s = state.session;
    if (!s) return;
    closeSettings();
    const answered = Object.keys(s.answers).length;
    const unanswered = s.questions.length - answered;
    $("submitModalDesc").textContent =
      unanswered > 0
        ? `You have answered ${answered} of ${s.questions.length} questions (${unanswered} unanswered). Submit now to view all results together?`
        : `All ${s.questions.length} questions answered! Ready to submit and view your scorecard?`;
    $("submitModal").classList.remove("hidden");
  }

  function finishQuiz() {
    $("submitModal").classList.add("hidden");
    stopTimer();
    if (window.QuizApp.tts) window.QuizApp.tts.stopSpeaking();
    if (!state.session) return;
    state.session.finished = true;

    const result = window.QuizApp.engine.evaluateSession(state.session);
    state.lastResult = result;
    window.QuizApp.sound.playComplete();
    switchView("results");
    renderResults();
  }

  function renderResults() {
    const r = state.lastResult;
    const s = state.session;
    if (!r || !s) return;

    $("resPercent").textContent = `${r.percent}%`;
    $("resFraction").textContent = `${r.correct} / ${r.total}`;

    const circle = $("scoreRingCircle");
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${circumference - (r.percent / 100) * circumference}`;
    circle.style.stroke =
      r.percent >= 80 ? "var(--success)" : r.percent >= 50 ? "var(--accent-gold)" : "var(--danger)";

    let verdict = "Keep Practising — Review Every Explanation Below!";
    if (r.percent >= 90) verdict = "Outstanding! CHS Top-Rank Readiness!";
    else if (r.percent >= 75) verdict = "Great Job! Strong Command of Chapter 5.";
    else if (r.percent >= 50) verdict = "Good Effort — Review Your Incorrect Answers.";

    $("resVerdict").textContent = verdict;
    $("resCorrect").textContent = r.correct;
    $("resWrong").textContent = r.wrong;
    $("resSkipped").textContent = r.skipped;
    $("resTime").textContent = window.QuizApp.engine.formatTime(r.elapsedSec);

    state.reviewFilter = "ALL";
    document.querySelectorAll("[data-rev-filter]").forEach((b) => {
      b.classList.toggle("active", b.dataset.revFilter === "ALL");
    });
    renderReviewList();
  }

  function renderReviewList() {
    const s = state.session;
    if (!s) return;
    const container = $("reviewList");
    const items = s.questions
      .map((q, idx) => {
        const userAns = s.answers[idx];
        const status =
          userAns === undefined
            ? "skipped"
            : userAns === q.displayCorrectIndex
            ? "correct"
            : "wrong";
        return { q, idx, userAns, status };
      })
      .filter((item) => state.reviewFilter === "ALL" || item.status === state.reviewFilter);

    if (!items.length) {
      container.innerHTML =
        '<div class="panel" style="text-align:center;color:var(--text-secondary);">No questions in this filter.</div>';
      return;
    }

    container.innerHTML = items
      .map(({ q, idx, userAns, status }) => {
        const statusLabel =
          status === "correct"
            ? '<span class="pill easy">✓ Correct</span>'
            : status === "wrong"
            ? '<span class="pill chs">✗ Incorrect</span>'
            : '<span class="pill">○ Unanswered</span>';

        const yourAnsText =
          userAns !== undefined
            ? `${LETTERS[userAns]}. ${q.displayOptions[userAns]}`
            : "Not attempted";
        const correctAnsText = `${LETTERS[q.displayCorrectIndex]}. ${q.displayOptions[q.displayCorrectIndex]}`;

        return `
          <div class="review-card is-${status}">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.45rem;">
              <span class="pill">${q.topic}</span>
              ${statusLabel}
            </div>
            <p style="font-weight:700;margin-bottom:0.55rem;">Q${idx + 1}. ${q.question}</p>
            <p style="font-size:0.88rem;color:var(--text-secondary);margin-bottom:0.2rem;">
              <strong>Your Answer:</strong> ${yourAnsText}
            </p>
            <p style="font-size:0.88rem;color:var(--success);margin-bottom:0.5rem;">
              <strong>Correct Answer:</strong> ${correctAnsText}
            </p>
            <p style="font-size:0.85rem;color:var(--text-secondary);">
              <strong>Explanation (${q.ncertRef}):</strong> ${q.explanation}
            </p>
          </div>`;
      })
      .join("");
  }

  function bindEvents() {
    $("brandHomeBtn").addEventListener("click", () => {
      if (state.activeTab === "quiz" && state.session && !state.session.finished) {
        if (!confirm("Return to question selector? Your current quiz will reset.")) return;
      }
      switchView("home");
    });

    // Settings Sheet Open/Close/Reset
    $("settingsGearBtn").addEventListener("click", openSettings);
    $("closeSettingsBtn").addEventListener("click", closeSettings);
    $("doneSettingsBtn").addEventListener("click", closeSettings);
    $("settingsModalBackdrop").addEventListener("click", (e) => {
      if (e.target === $("settingsModalBackdrop")) closeSettings();
    });

    $("resetSettingsDefaultsBtn").addEventListener("click", () => {
      if (window.QuizApp.theme) window.QuizApp.theme.resetAppearanceDefaults();
      if (window.QuizApp.tts) window.QuizApp.tts.resetTTSDefaults();
      const soundToggle = $("settingsSoundToggle");
      if (soundToggle && !soundToggle.checked) {
        soundToggle.checked = true;
        soundToggle.dispatchEvent(new Event("change"));
      }
      showToast("All settings reset to default.");
    });

    // Answer Check Mode inside Settings Sheet
    document.querySelectorAll("[data-settings-reveal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.settingsReveal;
        state.setup.answerRevealMode = mode;
        document.querySelectorAll("[data-home-reveal]").forEach((b) =>
          b.classList.toggle("selected", b.dataset.homeReveal === mode)
        );
        if (state.session && !state.session.finished) {
          state.session.answerRevealMode = mode;
          renderQuizFeed();
        }
        syncSettingsModal();
        showToast(
          mode === "instant"
            ? "Instant Check ON — ✓/✗ shown immediately on click."
            : "Submit-at-End ON — all results shown after Submit."
        );
      });
    });

    $("settingsChangeQuestionsBtn").addEventListener("click", () => {
      closeSettings();
      switchView("home");
    });

    $("settingsSubmitQuizBtn").addEventListener("click", openSubmitModal);

    // Home Question Selector Controls
    document.querySelectorAll("[data-mode]").forEach((card) => {
      card.addEventListener("click", () => {
        state.setup.mode = card.dataset.mode;
        state.setup.answerRevealMode = card.dataset.mode === "exam" ? "submit-end" : "instant";
        document.querySelectorAll("[data-mode]").forEach((c) => c.classList.toggle("selected", c === card));
        document.querySelectorAll("[data-home-reveal]").forEach((b) =>
          b.classList.toggle("selected", b.dataset.homeReveal === state.setup.answerRevealMode)
        );
      });
    });

    document.querySelectorAll("[data-home-reveal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.setup.answerRevealMode = btn.dataset.homeReveal;
        document.querySelectorAll("[data-home-reveal]").forEach((b) =>
          b.classList.toggle("selected", b === btn)
        );
      });
    });

    $("topicSelect").addEventListener("change", (e) => {
      state.setup.topic = e.target.value;
      updateMatchingCount();
    });

    document.querySelectorAll("[data-diff]").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.setup.difficulty = chip.dataset.diff;
        document.querySelectorAll("[data-diff]").forEach((c) => c.classList.toggle("active", c === chip));
        updateMatchingCount();
      });
    });

    document.querySelectorAll("[data-count]").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.setup.count = chip.dataset.count;
        document.querySelectorAll("[data-count]").forEach((c) => c.classList.toggle("active", c === chip));
      });
    });

    $("shuffleQToggle").addEventListener("change", (e) => {
      state.setup.shuffleQuestions = e.target.checked;
    });

    $("shuffleOptToggle").addEventListener("change", (e) => {
      state.setup.shuffleOptions = e.target.checked;
    });

    $("startQuizBtn").addEventListener("click", startQuiz);

    // Quiz bottom actions
    $("bottomSubmitQuizBtn").addEventListener("click", openSubmitModal);
    $("scrollTopFromBottomBtn").addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );

    $("cancelSubmitBtn").addEventListener("click", () => $("submitModal").classList.add("hidden"));
    $("confirmSubmitBtn").addEventListener("click", finishQuiz);

    // Results actions
    $("retakeQuizBtn").addEventListener("click", startQuiz);
    $("backHomeFromResBtn").addEventListener("click", () => switchView("home"));
    $("printResultBtn").addEventListener("click", () => window.print());

    document.querySelectorAll("[data-rev-filter]").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.reviewFilter = chip.dataset.revFilter;
        document.querySelectorAll("[data-rev-filter]").forEach((c) => c.classList.toggle("active", c === chip));
        renderReviewList();
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!$("settingsModalBackdrop").classList.contains("hidden")) {
          closeSettings();
        } else if (!$("submitModal").classList.contains("hidden")) {
          $("submitModal").classList.add("hidden");
        }
      }
    });
  }

  async function init() {
    window.QuizApp.theme.initTheme();
    window.QuizApp.sound.initSound();
    window.QuizApp.tts.initTTS();
    window.QuizApp.scroll.initScrollBehavior();

    try {
      const dataset = await window.QuizApp.dataLoader.loadQuizData();
      state.allQuestions = dataset.questions;
      populateTopicDropdown();
      bindEvents();
      switchView("home");
    } catch (err) {
      document.querySelector("main").innerHTML = `
        <div class="panel" style="max-width:560px;margin:2rem auto;text-align:center;">
          <h2>Could not load quiz data</h2>
          <p style="color:var(--text-secondary);margin-top:0.5rem;">${err.message}</p>
        </div>`;
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
