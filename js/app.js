/* ==========================================================================
   Main Application Controller — Full-Screen Single-Question Quiz Studio
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
      specialFilter: "all",
      shuffleQuestions: true,
      shuffleOptions: true,
      autoScroll: false
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

  function requestBrowserFullscreen() {
    try {
      const el = document.documentElement;
      if (el && !document.fullscreenElement && el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      }
    } catch (_) {}
  }

  function exitBrowserFullscreen() {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (_) {}
  }

  function openSettings() {
    syncSettingsModal();
    $("settingsModalBackdrop").classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeSettings() {
    $("settingsModalBackdrop").classList.add("hidden");
    if (state.activeTab !== "quiz") {
      document.body.style.overflow = "";
    }
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
    const sec = $("settingsActiveQuizSection");
    if (sec) sec.classList.toggle("hidden", !inQuiz);
  }

  function switchView(viewName) {
    if (window.QuizApp.tts) window.QuizApp.tts.stopSpeaking();

    if (viewName !== "quiz") {
      stopTimer();
      document.body.classList.remove("quiz-fs-active");
      document.body.style.overflow = "";
      exitBrowserFullscreen();
      const rail = $("topProgressRail");
      if (rail) rail.classList.add("hidden");
      closeQuestionList();
      closeExitModal();
    } else {
      document.body.classList.add("quiz-fs-active");
      const rail = $("topProgressRail");
      if (rail) rail.classList.add("hidden");
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

    if (viewName !== "quiz") {
      window.scrollTo({ top: 0, behavior: "instant" });
      if (window.QuizApp.scroll) window.QuizApp.scroll.showControls();
    }
    if (viewName === "home") updateMatchingCount();
  }

  function updateMatchingCount() {
    let matching = state.allQuestions.slice();
    if (state.setup.specialFilter === "mistakes") {
      const mSet = new Set(window.QuizApp.storage.getMistakes());
      matching = matching.filter((q) => mSet.has(q.id));
    } else if (state.setup.specialFilter === "bookmarks") {
      const bSet = new Set(window.QuizApp.storage.getBookmarks());
      matching = matching.filter((q) => bSet.has(q.id));
    } else {
      if (state.setup.topic !== "ALL") {
        matching = matching.filter((q) => q.topic === state.setup.topic);
      }
      if (state.setup.difficulty !== "ALL") {
        matching = matching.filter((q) => {
          if (state.setup.difficulty === "CHS Exam") {
            return q.difficulty === "CHS Exam" || q.difficulty === "Hard";
          }
          return q.difficulty === state.setup.difficulty;
        });
      }
    }
    const el = $("matchingPoolCount");
    if (el) el.textContent = `${matching.length} MCQs available`;
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
    const cfg = {
      ...state.setup,
      specialFilter: state.setup.specialFilter === "all" ? null : state.setup.specialFilter
    };
    const session = window.QuizApp.engine.createSession(state.allQuestions, cfg);
    if (!session.questions.length) {
      showToast("No questions match the selected filters.");
      return;
    }
    session.currentIndex = 0;
    state.session = session;
    closeSettings();
    switchView("quiz");
    requestBrowserFullscreen();
    renderCurrentQuestion();
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
    const timerEl = $("quizTimer");
    if (!timerEl) return;
    timerEl.innerHTML =
      state.session.mode === "exam"
        ? `<img src="images/timer.svg" class="svg-icon" alt="" aria-hidden="true" /> ${fmt(state.session.remainingSec)}`
        : `<img src="images/timer.svg" class="svg-icon" alt="" aria-hidden="true" /> ${fmt(state.session.elapsedSec)}`;
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
    const idx = s.currentIndex;
    const answeredCount = Object.keys(s.answers).length;
    const pct = total ? Math.round(((idx + 1) / total) * 100) : 0;
    const isInstant = s.answerRevealMode === "instant";

    const qCounter = $("fsQuestionCounter");
    if (qCounter) qCounter.textContent = `Q ${idx + 1} / ${total}`;

    const progText = $("quizProgressText");
    if (progText) progText.textContent = `${answeredCount}/${total} Done`;

    const streakEl = $("quizStreak");
    if (streakEl) {
      streakEl.innerHTML = `<img src="images/streak-fire.svg" class="svg-icon" alt="" aria-hidden="true" /> ${s.streak}`;
      streakEl.classList.toggle("hidden", !isInstant);
    }

    const fillEl = $("fsProgressFill");
    if (fillEl) fillEl.style.width = `${pct}%`;

    const prevBtn = $("fsPrevBtn");
    const nextBtn = $("fsNextBtn");
    const nextImg = $("fsNextBtnImg");

    if (prevBtn) {
      prevBtn.disabled = idx <= 0;
    }
    if (nextBtn && nextImg) {
      const isLast = idx >= total - 1;
      if (isLast) {
        nextImg.src = "images/quiz-submit.svg";
        nextBtn.classList.add("is-submit");
        nextBtn.setAttribute("aria-label", "Submit Quiz");
        nextBtn.setAttribute("title", "Submit Quiz");
      } else {
        nextImg.src = "images/quiz-next.svg";
        nextBtn.classList.remove("is-submit");
        nextBtn.setAttribute("aria-label", "Next Question");
        nextBtn.setAttribute("title", "Next Question");
      }
    }
  }

  function buildSingleQuestionHtml(q, idx) {
    const s = state.session;
    const userAns = s.answers[idx];
    const isAnswered = userAns !== undefined;
    const isInstant = s.answerRevealMode === "instant";
    const bookmarks = new Set(window.QuizApp.storage.getBookmarks());
    const isBookmarked = bookmarks.has(q.id);

    let cardClass = "fs-qcard";
    if (isInstant && isAnswered) {
      cardClass += userAns === q.displayCorrectIndex ? " card-correct" : " card-wrong";
    }

    const optionsHtml = q.displayOptions
      .map((optText, optIdx) => {
        let cls = "option-btn";
        let markHtml = "";
        let disabledAttr = "";

        if (isInstant && isAnswered) {
          disabledAttr = "disabled";
          if (optIdx === q.displayCorrectIndex) {
            cls += " correct";
            markHtml = `<img src="images/quiz-check-badge.svg" alt="" aria-hidden="true" />`;
          } else if (optIdx === userAns) {
            cls += " wrong";
            markHtml = `<img src="images/quiz-wrong-badge.svg" alt="" aria-hidden="true" />`;
          }
        } else if (!isInstant && userAns === optIdx) {
          cls += " selected";
          markHtml = `<img src="images/quiz-check-badge.svg" alt="" aria-hidden="true" />`;
        }

        return `
          <button type="button" class="${cls}" data-qidx="${idx}" data-opt="${optIdx}" ${disabledAttr}>
            <span class="option-left">
              <span class="option-key">${LETTERS[optIdx]}</span>
              <span>${optText}</span>
            </span>
            <span class="option-mark" aria-hidden="true">${markHtml}</span>
          </button>`;
      })
      .join("");

    let explanationHtml = "";
    if (isInstant && isAnswered) {
      const isRight = userAns === q.displayCorrectIndex;
      explanationHtml = `
        <div class="explanation-box fs-explanation-box ${isRight ? "correct" : "wrong"}">
          <div class="explanation-title">
            <span>${isRight ? "Correct!" : `Incorrect — Correct Answer: ${LETTERS[q.displayCorrectIndex]}`}</span>
            <span class="ncert-tag">${q.ncertRef || "NCERT"}</span>
          </div>
          <p>${q.explanation}</p>
        </div>`;
    }

    return `
      <article class="${cardClass}" id="qCard_${idx}">
        <div class="fs-qcard-top">
          <div class="quiz-meta-pills">
            <span class="pill">Q${idx + 1}</span>
            <span class="pill">${q.topic}</span>
            <span class="pill ${getDifficultyPillClass(q.difficulty)}">${q.difficulty}</span>
          </div>
          <div class="fs-qcard-actions">
            <button type="button" class="fs-mini-svg-btn" data-bm-qid="${q.id}" aria-label="Bookmark Question" title="Bookmark">
              <img src="images/${isBookmarked ? "quiz-bookmarked.svg" : "quiz-bookmark.svg"}" alt="" aria-hidden="true" />
            </button>
            <button type="button" class="fs-mini-svg-btn" data-tts-qidx="${idx}" aria-label="Listen to Question" title="Listen">
              <img src="images/quiz-listen.svg" alt="" aria-hidden="true" />
            </button>
          </div>
        </div>
        <h3 class="fs-question-text">${q.question}</h3>
        <div class="fs-options-grid">${optionsHtml}</div>
        ${explanationHtml}
      </article>`;
  }

  function renderCurrentQuestion() {
    const s = state.session;
    if (!s || !s.questions.length) return;
    if (window.QuizApp.tts) window.QuizApp.tts.stopSpeaking();

    const idx = Math.max(0, Math.min(s.currentIndex, s.questions.length - 1));
    s.currentIndex = idx;

    const host = $("questionsFeed");
    host.innerHTML = buildSingleQuestionHtml(s.questions[idx], idx);
    attachQuestionCardListeners(host);
    updateQuizCounters();
  }

  function attachQuestionCardListeners(rootEl) {
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

    rootEl.querySelectorAll("[data-bm-qid]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qid = btn.dataset.bmQid;
        const added = window.QuizApp.storage.toggleBookmark(qid);
        const img = btn.querySelector("img");
        if (img) img.src = added ? "images/quiz-bookmarked.svg" : "images/quiz-bookmark.svg";
        showToast(added ? "Question bookmarked." : "Bookmark removed.");
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

    renderCurrentQuestion();
  }

  function goToQuestion(newIdx) {
    const s = state.session;
    if (!s) return;
    if (newIdx < 0 || newIdx >= s.questions.length) return;
    s.currentIndex = newIdx;
    renderCurrentQuestion();
  }

  function openQuestionList() {
    const s = state.session;
    if (!s) return;
    const backdrop = $("fsQuestionListBackdrop");
    const container = $("fsQuestionListContainer");
    const summary = $("fsQListSummary");
    if (!backdrop || !container) return;

    const answeredCount = Object.keys(s.answers).length;
    if (summary) summary.textContent = `${answeredCount} of ${s.questions.length} answered`;

    const isInstant = s.answerRevealMode === "instant";
    const bookmarks = new Set(window.QuizApp.storage.getBookmarks());

    container.innerHTML = s.questions
      .map((q, idx) => {
        const userAns = s.answers[idx];
        const isCurrent = idx === s.currentIndex;
        let rowCls = "fs-qlist-row";
        let badgeHtml = "";

        if (isCurrent) rowCls += " is-current";
        if (userAns !== undefined) {
          if (isInstant) {
            if (userAns === q.displayCorrectIndex) {
              rowCls += " is-answered";
              badgeHtml = `<img src="images/quiz-check-badge.svg" class="fs-qlist-badge" alt="" aria-hidden="true" />`;
            } else {
              rowCls += " is-wrong";
              badgeHtml = `<img src="images/quiz-wrong-badge.svg" class="fs-qlist-badge" alt="" aria-hidden="true" />`;
            }
          } else {
            rowCls += " is-answered";
            badgeHtml = `<img src="images/quiz-check-badge.svg" class="fs-qlist-badge" alt="" aria-hidden="true" />`;
          }
        } else if (bookmarks.has(q.id)) {
          badgeHtml = `<img src="images/quiz-bookmarked.svg" class="fs-qlist-badge" alt="" aria-hidden="true" />`;
        }

        const safeSnippet = String(q.question || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `
          <button type="button" class="${rowCls}" data-jump-idx="${idx}">
            <span class="fs-qlist-num">${idx + 1}</span>
            <span class="fs-qlist-snippet">${safeSnippet}</span>
            ${badgeHtml}
          </button>`;
      })
      .join("");

    container.querySelectorAll("[data-jump-idx]").forEach((row) => {
      row.addEventListener("click", () => {
        goToQuestion(Number(row.dataset.jumpIdx));
        closeQuestionList();
      });
    });

    backdrop.classList.remove("hidden");

    const activeRow = container.querySelector(".is-current");
    if (activeRow) {
      setTimeout(() => activeRow.scrollIntoView({ block: "center", behavior: "smooth" }), 50);
    }
  }

  function closeQuestionList() {
    const backdrop = $("fsQuestionListBackdrop");
    if (backdrop) backdrop.classList.add("hidden");
  }

  function openExitModal() {
    const modal = $("exitQuizModal");
    if (modal) modal.classList.remove("hidden");
  }

  function closeExitModal() {
    const modal = $("exitQuizModal");
    if (modal) modal.classList.add("hidden");
  }

  function openSubmitModal() {
    const s = state.session;
    if (!s) return;
    closeSettings();
    closeQuestionList();
    const answered = Object.keys(s.answers).length;
    const unanswered = s.questions.length - answered;
    $("submitModalDesc").textContent =
      unanswered > 0
        ? `You have answered ${answered} of ${s.questions.length} questions (${unanswered} unanswered). Submit now to view all results together?`
        : `All ${s.questions.length} questions answered! Ready to submit and view your scorecard?`;
    $("submitModal").classList.remove("hidden");
  }

  function buildPdfExportPayload() {
    const s = state.session;
    const r = state.lastResult;
    if (!s || !Array.isArray(s.questions)) return null;
    return {
      chapter: document.title || "SMART PROCESS Quiz",
      source: "SMART PROCESS — Class 8 NCERT & BHU CHS Entrance",
      pageHref: window.location.pathname.split("/").pop() || "index.html",
      savedAt: new Date().toISOString(),
      summary: r
        ? {
            correct: r.correct,
            wrong: r.wrong,
            skipped: r.skipped,
            total: r.total,
            percent: r.percent
          }
        : null,
      questions: s.questions.map((q, i) => ({
        number: i + 1,
        id: q.id,
        topic: q.topic || "",
        difficulty: q.difficulty || "Medium",
        question: q.question,
        options: Array.isArray(q.displayOptions) ? q.displayOptions : q.options || [],
        correctIndex: typeof q.displayCorrectIndex === "number" ? q.displayCorrectIndex : q.correctIndex,
        userAnswer: s.answers && s.answers[i] !== undefined ? s.answers[i] : null,
        explanation: q.explanation || "",
        ncertRef: q.ncertRef || ""
      }))
    };
  }

  function saveSessionForPdf() {
    const payload = buildPdfExportPayload();
    if (payload && window.QuizApp.storage && window.QuizApp.storage.savePdfSession) {
      window.QuizApp.storage.savePdfSession(payload);
    }
    return payload;
  }

  function exportCurrentQuizToPdfStudio() {
    saveSessionForPdf();
    window.location.href = "download-pdf.html";
  }

  function finishQuiz() {
    $("submitModal").classList.add("hidden");
    closeQuestionList();
    closeExitModal();
    stopTimer();
    if (window.QuizApp.tts) window.QuizApp.tts.stopSpeaking();
    if (!state.session) return;
    state.session.finished = true;

    const result = window.QuizApp.engine.evaluateSession(state.session);
    state.lastResult = result;
    saveSessionForPdf();
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
    else if (r.percent >= 75) verdict = "Great Job! Strong Command of This Chapter.";
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
              <strong>Explanation (${q.ncertRef || "NCERT"}):</strong> ${q.explanation}
            </p>
          </div>`;
      })
      .join("");
  }

  function bindEvents() {
    const brandBtn = $("brandHomeBtn");
    if (brandBtn) {
      brandBtn.addEventListener("click", () => {
        if (state.activeTab === "quiz" && state.session && !state.session.finished) {
          openExitModal();
          return;
        }
        switchView("home");
      });
    }

    // Settings Sheet Open/Close/Reset
    if ($("settingsGearBtn")) $("settingsGearBtn").addEventListener("click", openSettings);
    if ($("closeSettingsBtn")) $("closeSettingsBtn").addEventListener("click", closeSettings);
    if ($("doneSettingsBtn")) $("doneSettingsBtn").addEventListener("click", closeSettings);
    if ($("settingsModalBackdrop")) {
      $("settingsModalBackdrop").addEventListener("click", (e) => {
        if (e.target === $("settingsModalBackdrop")) closeSettings();
      });
    }

    if ($("resetSettingsDefaultsBtn")) {
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
    }

    document.querySelectorAll("[data-settings-reveal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.settingsReveal;
        state.setup.answerRevealMode = mode;
        document.querySelectorAll("[data-home-reveal]").forEach((b) =>
          b.classList.toggle("selected", b.dataset.homeReveal === mode)
        );
        if (state.session && !state.session.finished) {
          state.session.answerRevealMode = mode;
          renderCurrentQuestion();
        }
        syncSettingsModal();
        showToast(
          mode === "instant"
            ? "Instant Check ON — shown immediately on click."
            : "Submit-at-End ON — all results shown after Submit."
        );
      });
    });

    if ($("settingsChangeQuestionsBtn")) {
      $("settingsChangeQuestionsBtn").addEventListener("click", () => {
        closeSettings();
        switchView("home");
      });
    }

    if ($("settingsSubmitQuizBtn")) {
      $("settingsSubmitQuizBtn").addEventListener("click", openSubmitModal);
    }

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

    if ($("topicSelect")) {
      $("topicSelect").addEventListener("change", (e) => {
        state.setup.topic = e.target.value;
        updateMatchingCount();
      });
    }

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

    if ($("shuffleQToggle")) {
      $("shuffleQToggle").addEventListener("change", (e) => {
        state.setup.shuffleQuestions = e.target.checked;
      });
    }

    if ($("shuffleOptToggle")) {
      $("shuffleOptToggle").addEventListener("change", (e) => {
        state.setup.shuffleOptions = e.target.checked;
      });
    }

    // Collapsible Advanced Features Drawer
    const advToggle = $("advancedFeaturesToggle");
    const advPanel = $("advancedFeaturesPanel");
    if (advToggle && advPanel) {
      advToggle.addEventListener("click", () => {
        const isOpen = !advPanel.classList.contains("hidden");
        advPanel.classList.toggle("hidden", isOpen);
        advToggle.setAttribute("aria-expanded", String(!isOpen));
        advToggle.classList.toggle("is-open", !isOpen);
      });
    }

    document.querySelectorAll("[data-special-pool]").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.setup.specialFilter = chip.dataset.specialPool;
        document.querySelectorAll("[data-special-pool]").forEach((c) => c.classList.toggle("active", c === chip));
        const badge = $("smartPoolBadge");
        if (badge) badge.textContent = chip.textContent.replace(/\(\d+\)/, "").trim();
        updateMatchingCount();
      });
    });

    const autoScrollEl = $("autoScrollToggle");
    if (autoScrollEl) {
      autoScrollEl.addEventListener("change", (e) => {
        state.setup.autoScroll = e.target.checked;
      });
    }

    if ($("startQuizBtn")) $("startQuizBtn").addEventListener("click", startQuiz);

    // Full-Screen Quiz Controls (Icon-Only Prev, Next/Submit, Exit, Question List)
    if ($("fsPrevBtn")) {
      $("fsPrevBtn").addEventListener("click", () => {
        if (!state.session) return;
        goToQuestion(state.session.currentIndex - 1);
      });
    }

    if ($("fsNextBtn")) {
      $("fsNextBtn").addEventListener("click", () => {
        if (!state.session) return;
        const isLast = state.session.currentIndex >= state.session.questions.length - 1;
        if (isLast) {
          openSubmitModal();
        } else {
          goToQuestion(state.session.currentIndex + 1);
        }
      });
    }

    if ($("fsOpenListBtn")) $("fsOpenListBtn").addEventListener("click", openQuestionList);
    if ($("fsCloseListBtn")) $("fsCloseListBtn").addEventListener("click", closeQuestionList);
    if ($("fsQuestionListBackdrop")) {
      $("fsQuestionListBackdrop").addEventListener("click", (e) => {
        if (e.target === $("fsQuestionListBackdrop")) closeQuestionList();
      });
    }
    if ($("fsDrawerSubmitBtn")) $("fsDrawerSubmitBtn").addEventListener("click", openSubmitModal);

    if ($("fsExitQuizBtn")) $("fsExitQuizBtn").addEventListener("click", openExitModal);
    if ($("cancelExitQuizBtn")) $("cancelExitQuizBtn").addEventListener("click", closeExitModal);
    if ($("confirmExitQuizBtn")) {
      $("confirmExitQuizBtn").addEventListener("click", () => {
        closeExitModal();
        switchView("home");
      });
    }
    if ($("exitQuizModal")) {
      $("exitQuizModal").addEventListener("click", (e) => {
        if (e.target === $("exitQuizModal")) closeExitModal();
      });
    }

    if ($("cancelSubmitBtn")) $("cancelSubmitBtn").addEventListener("click", () => $("submitModal").classList.add("hidden"));
    if ($("confirmSubmitBtn")) $("confirmSubmitBtn").addEventListener("click", finishQuiz);

    // Results actions
    if ($("retakeQuizBtn")) $("retakeQuizBtn").addEventListener("click", startQuiz);
    if ($("backHomeFromResBtn")) $("backHomeFromResBtn").addEventListener("click", () => switchView("home"));
    if ($("printResultBtn")) $("printResultBtn").addEventListener("click", () => window.print());
    const pdfBtn = $("openPdfStudioBtn");
    if (pdfBtn) pdfBtn.addEventListener("click", exportCurrentQuizToPdfStudio);

    document.querySelectorAll("[data-rev-filter]").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.reviewFilter = chip.dataset.revFilter;
        document.querySelectorAll("[data-rev-filter]").forEach((c) => c.classList.toggle("active", c === chip));
        renderReviewList();
      });
    });

    // Keyboard Shortcuts in Full-Screen Quiz
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if ($("fsQuestionListBackdrop") && !$("fsQuestionListBackdrop").classList.contains("hidden")) {
          closeQuestionList();
          return;
        }
        if ($("exitQuizModal") && !$("exitQuizModal").classList.contains("hidden")) {
          closeExitModal();
          return;
        }
        if ($("settingsModalBackdrop") && !$("settingsModalBackdrop").classList.contains("hidden")) {
          closeSettings();
          return;
        }
        if ($("submitModal") && !$("submitModal").classList.contains("hidden")) {
          $("submitModal").classList.add("hidden");
          return;
        }
        return;
      }

      if (state.activeTab !== "quiz" || !state.session || state.session.finished) return;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToQuestion(state.session.currentIndex - 1);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const isLast = state.session.currentIndex >= state.session.questions.length - 1;
        if (isLast) openSubmitModal();
        else goToQuestion(state.session.currentIndex + 1);
        return;
      }

      const keyMap = { "1": 0, "2": 1, "3": 2, "4": 3, "a": 0, "b": 1, "c": 2, "d": 3 };
      const k = e.key.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(keyMap, k)) {
        handleSelectOption(state.session.currentIndex, keyMap[k]);
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
