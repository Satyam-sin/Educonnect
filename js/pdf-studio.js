/* ==========================================================================
   SMART PROCESS — Question Paper PDF Studio Engine (Offline-First Modular JS)
   ========================================================================== */
(function () {
  "use strict";

  const LETTERS = ["A", "B", "C", "D"];
  const COLOR_PREF_KEY = "chs_pdf_color_prefs_v1";

  const COLOR_PRESETS = {
    classic: {
      bg: "#ffffff", accent: "#4f46e5", text: "#1e293b",
      question: "#0f172a", options: "#334155", answer: "#047857", explanation: "#1d4ed8"
    },
    cream: {
      bg: "#fffbeb", accent: "#b45309", text: "#292524",
      question: "#1c1917", options: "#44403c", answer: "#15803d", explanation: "#9a3412"
    },
    indigo: {
      bg: "#eef2ff", accent: "#3730a3", text: "#1e1b4b",
      question: "#1e1b4b", options: "#312e81", answer: "#047857", explanation: "#4338ca"
    },
    mint: {
      bg: "#ecfdf5", accent: "#047857", text: "#064e3b",
      question: "#022c22", options: "#065f46", answer: "#0f766e", explanation: "#1d4ed8"
    },
    rose: {
      bg: "#fff1f2", accent: "#be123c", text: "#4c0519",
      question: "#881337", options: "#4c0519", answer: "#047857", explanation: "#9f1239"
    },
    dark: {
      bg: "#0f172a", accent: "#38bdf8", text: "#e2e8f0",
      question: "#f8fafc", options: "#cbd5e1", answer: "#34d399", explanation: "#93c5fd"
    }
  };

  const state = {
    sources: [],
    activeSourceId: "",
    statusFilter: "ALL",
    fromNum: 1,
    toNum: 20,
    paperFormat: "mcq-marked", // "mcq-marked" | "mcq-blank" | "direct-qa"
    showExplanation: true,
    showAnswerKey: false,
    showUserAttempt: true,
    showTags: true,
    showHeaderBox: true,
    twoColumn: false,
    fontSize: 14,
    customTitle: "",
    colors: { ...COLOR_PRESETS.classic }
  };

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showToast(msg) {
    const t = $("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.add("hidden"), 2400);
  }

  function loadColorPrefs() {
    try {
      const raw = localStorage.getItem(COLOR_PREF_KEY);
      if (raw) {
        state.colors = { ...COLOR_PRESETS.classic, ...JSON.parse(raw) };
      }
    } catch (_) {}
  }

  function saveColorPrefs() {
    try {
      localStorage.setItem(COLOR_PREF_KEY, JSON.stringify(state.colors));
    } catch (_) {}
  }

  function buildSources() {
    const list = [];
    const lastPlayed = window.QuizApp && window.QuizApp.storage
      ? window.QuizApp.storage.getPdfSession()
      : null;

    if (lastPlayed && Array.isArray(lastPlayed.questions) && lastPlayed.questions.length > 0) {
      list.push({
        id: "last-played",
        label: `Last Played Quiz — ${lastPlayed.chapter} (${lastPlayed.questions.length} Qs)`,
        chapter: lastPlayed.chapter,
        source: lastPlayed.source || "SMART PROCESS Quiz",
        summary: lastPlayed.summary || null,
        isPlayedSession: true,
        questions: lastPlayed.questions
      });
    }

    const fallbacks = [
      { id: "sci-ch5", key: "SCIENCE_CH5_FALLBACK", label: "Science Ch. 5 — Exploring Forces" },
      { id: "sst-p2-ch5", key: "SST_P2_CH5_FALLBACK", label: "SST Part 2 Ch. 5 — Citizenship: Rights and Duties" },
      { id: "sst-p2-ch1", key: "SST_P2_CH1_FALLBACK", label: "SST Part 2 Ch. 1 — World Geography: Some Glimpses" },
      { id: "sci-ch2", key: "SCIENCE_CH2_FALLBACK", label: "Science Ch. 2 — The Invisible Living World" },
      { id: "sci-ch7", key: "SCIENCE_CH7_FALLBACK", label: "Science Ch. 7 — Particulate Nature of Matter" },
      { id: "sst-p1-ch5", key: "QUESTIONS_FALLBACK", label: "SST Part 1 Ch. 5 — Universal Franchise" }
    ];

    fallbacks.forEach((fb) => {
      const data = window[fb.key];
      if (data && Array.isArray(data.questions) && data.questions.length > 0) {
        list.push({
          id: fb.id,
          label: `${fb.label} (${data.questions.length} Qs)`,
          chapter: data.chapter || fb.label,
          source: data.source || "SMART PROCESS",
          summary: null,
          isPlayedSession: false,
          questions: data.questions.map((q, idx) => ({
            number: idx + 1,
            id: q.id,
            topic: q.topic || "",
            difficulty: q.difficulty || "Medium",
            question: q.question,
            options: Array.isArray(q.options) ? q.options : [],
            correctIndex: q.correctIndex,
            userAnswer: null,
            explanation: q.explanation || "",
            ncertRef: q.ncertRef || ""
          }))
        });
      }
    });

    state.sources = list;
  }

  function getActiveSource() {
    return state.sources.find((s) => s.id === state.activeSourceId) || state.sources[0] || null;
  }

  function getFilteredQuestions() {
    const src = getActiveSource();
    if (!src) return [];

    let list = src.questions;
    if (src.isPlayedSession && state.statusFilter !== "ALL") {
      list = list.filter((q) => {
        const hasAns = q.userAnswer !== null && q.userAnswer !== undefined;
        if (state.statusFilter === "skipped") return !hasAns;
        if (state.statusFilter === "correct") return hasAns && q.userAnswer === q.correctIndex;
        if (state.statusFilter === "wrong") return hasAns && q.userAnswer !== q.correctIndex;
        return true;
      });
    }

    const total = list.length;
    if (total === 0) return [];

    const fromIdx = Math.max(1, Math.min(state.fromNum, total));
    const toIdx = Math.max(fromIdx, Math.min(state.toNum, total));
    return list.slice(fromIdx - 1, toIdx);
  }

  function syncColorInputs() {
    $("colorBg").value = state.colors.bg;
    $("colorAccent").value = state.colors.accent;
    $("colorText").value = state.colors.text;
    $("colorQuestion").value = state.colors.question;
    $("colorOptions").value = state.colors.options;
    $("colorAnswer").value = state.colors.answer;
    $("colorExplanation").value = state.colors.explanation;
  }

  function applyPaperCssVars() {
    const sheet = $("paperSheet");
    if (!sheet) return;
    sheet.style.setProperty("--paper-bg", state.colors.bg);
    sheet.style.setProperty("--paper-accent", state.colors.accent);
    sheet.style.setProperty("--paper-text", state.colors.text);
    sheet.style.setProperty("--paper-q-color", state.colors.question);
    sheet.style.setProperty("--paper-opt-color", state.colors.options);
    sheet.style.setProperty("--paper-ans-color", state.colors.answer);
    sheet.style.setProperty("--paper-exp-color", state.colors.explanation);
    sheet.style.setProperty("--paper-font-size", `${state.fontSize}px`);
    sheet.classList.toggle("is-two-col", state.twoColumn);
  }

  function renderPaper() {
    const src = getActiveSource();
    const sheet = $("paperSheet");
    if (!src || !sheet) return;

    applyPaperCssVars();
    const qs = getFilteredQuestions();

    $("sourceTotalBadge").textContent = `${src.questions.length} Qs`;
    $("rangeCountBadge").textContent = `${qs.length} selected`;
    $("previewCountPill").textContent = `${qs.length} Questions Ready`;
    $("pdfStatusFilterGroup").classList.toggle("hidden", !src.isPlayedSession);

    const paperTitle = (state.customTitle || src.chapter || "CHS Question Paper").trim();
    const todayStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    let headerHtml = `
      <div class="paper-header">
        <div class="paper-header-top">
          <div>
            <div class="paper-brand">SMART PROCESS • Question Paper</div>
            <h2 class="paper-title">${escapeHtml(paperTitle)}</h2>
            <div class="paper-meta">${escapeHtml(src.source)} • ${qs.length} Questions • ${todayStr}</div>
          </div>
          ${src.summary ? `<div class="paper-meta" style="font-weight:800;">Quiz Score: ${src.summary.correct}/${src.summary.total} (${src.summary.percent}%)</div>` : ""}
        </div>
        ${state.showHeaderBox ? `
        <div class="paper-student-strip">
          <span>Name: _______________________</span>
          <span>Class: 8 (CHS Prep)</span>
          <span>Marks: ______ / ${qs.length}</span>
        </div>` : ""}
      </div>`;

    if (qs.length === 0) {
      sheet.innerHTML = headerHtml + `<p style="padding:1.2rem 0;font-weight:700;">No questions match the current filter or range. Adjust From/To or select "All".</p>`;
      return;
    }

    const qHtml = qs.map((q, idx) => {
      const displayNum = state.fromNum + idx;
      const correctLetter = LETTERS[q.correctIndex] || "A";
      const correctText = q.options[q.correctIndex] || "";

      const tagsHtml = state.showTags
        ? `<div class="paper-q-tags">
             ${q.topic ? `<span class="paper-tag">${escapeHtml(q.topic)}</span>` : ""}
             ${q.difficulty ? `<span class="paper-tag">${escapeHtml(q.difficulty)}</span>` : ""}
           </div>`
        : "";

      let bodyHtml = "";
      if (state.paperFormat === "direct-qa") {
        bodyHtml = `<div class="paper-direct-ans">Answer: ${escapeHtml(correctText)}</div>`;
      } else {
        const showMark = state.paperFormat === "mcq-marked";
        const optsHtml = q.options.map((opt, oi) => {
          const isCorr = showMark && oi === q.correctIndex;
          return `<div class="paper-opt ${isCorr ? "is-correct-opt" : ""}">(${LETTERS[oi]}) ${escapeHtml(opt)}${isCorr ? " ✓" : ""}</div>`;
        }).join("");
        bodyHtml = `<div class="paper-options-grid">${optsHtml}</div>`;
      }

      let userAnsHtml = "";
      if (state.showUserAttempt && src.isPlayedSession && q.userAnswer !== null && q.userAnswer !== undefined) {
        const uLet = LETTERS[q.userAnswer] || "?";
        const isRight = q.userAnswer === q.correctIndex;
        userAnsHtml = `<div class="paper-user-ans">Your Answer: (${uLet}) ${escapeHtml(q.options[q.userAnswer] || "")} — ${isRight ? "Correct" : "Incorrect"}</div>`;
      }

      const expHtml = state.showExplanation && q.explanation
        ? `<div class="paper-exp"><strong>Explanation:</strong> ${escapeHtml(q.explanation)}</div>`
        : "";

      return `
        <div class="paper-q-item">
          <div class="paper-q-head">
            <span class="paper-q-num">Q${displayNum}.</span>
            <span>${escapeHtml(q.question)}</span>
          </div>
          ${tagsHtml}
          ${bodyHtml}
          ${userAnsHtml}
          ${expHtml}
        </div>`;
    }).join("");

    let keyHtml = "";
    if (state.showAnswerKey) {
      const cells = qs.map((q, idx) => {
        const num = state.fromNum + idx;
        return `<div class="answer-key-cell">Q${num}: ${LETTERS[q.correctIndex] || "A"}</div>`;
      }).join("");
      keyHtml = `
        <div class="paper-answer-key">
          <h3>Answer Key</h3>
          <div class="answer-key-grid">${cells}</div>
        </div>`;
    }

    sheet.innerHTML = `${headerHtml}<div class="paper-questions-list">${qHtml}</div>${keyHtml}`;
  }

  function selectSource(sourceId) {
    state.activeSourceId = sourceId;
    state.statusFilter = "ALL";
    const src = getActiveSource();
    if (src) {
      state.fromNum = 1;
      state.toNum = src.questions.length;
      state.customTitle = src.chapter;
      $("rangeFromInput").value = 1;
      $("rangeFromInput").max = src.questions.length;
      $("rangeToInput").value = src.questions.length;
      $("rangeToInput").max = src.questions.length;
      $("pdfTitleInput").value = src.chapter;
    }
    document.querySelectorAll("[data-status-filter]").forEach((b) => {
      b.classList.toggle("active", b.dataset.statusFilter === "ALL");
    });
    renderPaper();
  }

  function downloadStandaloneHtml() {
    const sheet = $("paperSheet");
    if (!sheet) return;
    const title = (state.customTitle || "CHS-Question-Paper").replace(/[^\w\s\-]+/g, "").trim() || "CHS-Question-Paper";
    const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; padding: 24px; background: ${state.colors.bg}; color: ${state.colors.text}; font-size: ${state.fontSize}px; line-height: 1.55; }
  .paper-sheet { max-width: 900px; margin: 0 auto; background: ${state.colors.bg}; color: ${state.colors.text}; border: 2px solid ${state.colors.accent}; border-radius: 14px; padding: 28px; }
  .paper-header { border-bottom: 2.5px solid ${state.colors.accent}; padding-bottom: 14px; margin-bottom: 18px; }
  .paper-brand { font-size: 0.8em; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: ${state.colors.accent}; }
  .paper-title { font-size: 1.45em; font-weight: 900; color: ${state.colors.question}; margin: 4px 0; }
  .paper-student-strip { margin-top: 10px; padding: 8px 12px; border: 1.5px dashed ${state.colors.accent}; border-radius: 8px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; font-weight: 700; }
  .paper-questions-list { display: ${state.twoColumn ? "grid" : "flex"}; ${state.twoColumn ? "grid-template-columns: repeat(2, 1fr); gap: 16px 22px;" : "flex-direction: column; gap: 14px;"} }
  .paper-q-item { border-bottom: 1px solid rgba(148,163,184,0.3); padding-bottom: 10px; break-inside: avoid; }
  .paper-q-head { font-weight: 800; color: ${state.colors.question}; margin-bottom: 6px; display: flex; gap: 6px; }
  .paper-q-num { color: ${state.colors.accent}; font-weight: 900; }
  .paper-q-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px; }
  .paper-tag { font-size: 0.72em; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid ${state.colors.accent}; color: ${state.colors.accent}; }
  .paper-options-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px 12px; margin: 4px 0 4px 18px; color: ${state.colors.options}; }
  .paper-opt { padding: 3px 6px; border-radius: 6px; }
  .paper-opt.is-correct-opt { color: ${state.colors.answer}; font-weight: 800; border: 1.5px solid ${state.colors.answer}; }
  .paper-direct-ans { margin: 5px 0 4px 18px; font-weight: 800; color: ${state.colors.answer}; }
  .paper-user-ans { margin: 3px 0 3px 18px; font-size: 0.86em; font-weight: 700; }
  .paper-exp { margin: 5px 0 2px 18px; padding: 6px 10px; border-left: 3px solid ${state.colors.explanation}; color: ${state.colors.explanation}; font-size: 0.88em; }
  .paper-answer-key { margin-top: 20px; padding-top: 12px; border-top: 2px solid ${state.colors.accent}; }
  .answer-key-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
  .answer-key-cell { padding: 5px; border: 1px solid ${state.colors.accent}; border-radius: 6px; text-align: center; font-weight: 800; color: ${state.colors.answer}; }
</style>
</head>
<body><div class="paper-sheet">${sheet.innerHTML}</div></body>
</html>`;

    const blob = new Blob([htmlDoc], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Offline question paper saved!");
  }

  function wireEvents() {
    $("pdfSourceSelect").addEventListener("change", (e) => selectSource(e.target.value));
    $("pdfTitleInput").addEventListener("input", (e) => {
      state.customTitle = e.target.value;
      renderPaper();
    });

    document.querySelectorAll("[data-status-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.statusFilter = btn.dataset.statusFilter;
        document.querySelectorAll("[data-status-filter]").forEach((b) => b.classList.toggle("active", b === btn));
        renderPaper();
      });
    });

    $("rangeFromInput").addEventListener("input", (e) => {
      state.fromNum = Math.max(1, parseInt(e.target.value, 10) || 1);
      renderPaper();
    });

    $("rangeToInput").addEventListener("input", (e) => {
      state.toNum = Math.max(1, parseInt(e.target.value, 10) || 1);
      renderPaper();
    });

    document.querySelectorAll("[data-quick-range]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const src = getActiveSource();
        if (!src) return;
        const val = btn.dataset.quickRange;
        state.fromNum = 1;
        state.toNum = val === "ALL" ? src.questions.length : Math.min(parseInt(val, 10), src.questions.length);
        $("rangeFromInput").value = state.fromNum;
        $("rangeToInput").value = state.toNum;
        document.querySelectorAll("[data-quick-range]").forEach((b) => b.classList.toggle("active", b === btn));
        renderPaper();
      });
    });

    document.querySelectorAll("[data-paper-format]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.paperFormat = btn.dataset.paperFormat;
        document.querySelectorAll("[data-paper-format]").forEach((b) => b.classList.toggle("active", b === btn));
        if (state.paperFormat === "mcq-blank") {
          state.showAnswerKey = true;
          $("toggleAnswerKey").checked = true;
        }
        renderPaper();
      });
    });

    $("toggleExplanation").addEventListener("change", (e) => { state.showExplanation = e.target.checked; renderPaper(); });
    $("toggleAnswerKey").addEventListener("change", (e) => { state.showAnswerKey = e.target.checked; renderPaper(); });
    $("toggleUserAttempt").addEventListener("change", (e) => { state.showUserAttempt = e.target.checked; renderPaper(); });
    $("toggleTags").addEventListener("change", (e) => { state.showTags = e.target.checked; renderPaper(); });
    $("toggleHeaderBox").addEventListener("change", (e) => { state.showHeaderBox = e.target.checked; renderPaper(); });
    $("toggleTwoCol").addEventListener("change", (e) => { state.twoColumn = e.target.checked; renderPaper(); });

    $("paperFontSizeSlider").addEventListener("input", (e) => {
      state.fontSize = parseInt(e.target.value, 10) || 14;
      $("paperFontSizeVal").textContent = `${state.fontSize}px`;
      renderPaper();
    });

    // Color Pickers
    const colorMap = [
      ["colorBg", "bg"],
      ["colorAccent", "accent"],
      ["colorText", "text"],
      ["colorQuestion", "question"],
      ["colorOptions", "options"],
      ["colorAnswer", "answer"],
      ["colorExplanation", "explanation"]
    ];
    colorMap.forEach(([id, key]) => {
      $(id).addEventListener("input", (e) => {
        state.colors[key] = e.target.value;
        saveColorPrefs();
        applyPaperCssVars();
      });
    });

    document.querySelectorAll("[data-color-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const preset = COLOR_PRESETS[btn.dataset.colorPreset];
        if (!preset) return;
        state.colors = { ...preset };
        syncColorInputs();
        saveColorPrefs();
        applyPaperCssVars();
        showToast(`Applied ${btn.textContent} paper theme!`);
      });
    });

    $("resetPaperColorsBtn").addEventListener("click", () => {
      state.colors = { ...COLOR_PRESETS.classic };
      syncColorInputs();
      saveColorPrefs();
      applyPaperCssVars();
      showToast("Paper colors reset to Classic White.");
    });

    // Print / Save as PDF (exact colors preserved via CSS print-color-adjust: exact)
    $("downloadPdfActionBtn").addEventListener("click", () => {
      applyPaperCssVars();
      window.print();
    });

    $("downloadHtmlCopyBtn").addEventListener("click", downloadStandaloneHtml);

    // Synced Settings modal
    const openSet = () => { $("settingsModalBackdrop").classList.remove("hidden"); document.body.style.overflow = "hidden"; };
    const closeSet = () => { $("settingsModalBackdrop").classList.add("hidden"); document.body.style.overflow = ""; };
    $("settingsGearBtn").addEventListener("click", openSet);
    $("closeSettingsBtn").addEventListener("click", closeSet);
    $("doneSettingsBtn").addEventListener("click", closeSet);
    $("settingsModalBackdrop").addEventListener("click", (e) => { if (e.target === $("settingsModalBackdrop")) closeSet(); });
    $("resetSettingsDefaultsBtn").addEventListener("click", () => {
      if (window.QuizApp.theme) window.QuizApp.theme.resetAppearanceDefaults();
      showToast("App settings reset to default.");
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !$("settingsModalBackdrop").classList.contains("hidden")) closeSet();
    });
  }

  function init() {
    if (window.QuizApp && window.QuizApp.theme) window.QuizApp.theme.initTheme();
    if (window.QuizApp && window.QuizApp.scroll) window.QuizApp.scroll.initScrollBehavior();

    loadColorPrefs();
    syncColorInputs();
    buildSources();

    const sel = $("pdfSourceSelect");
    sel.innerHTML = state.sources.map((s) => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.label)}</option>`).join("");

    wireEvents();
    if (state.sources.length > 0) {
      selectSource(state.sources[0].id);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
