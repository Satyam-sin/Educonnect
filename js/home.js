/* ==========================================================================
   CHS Explorer Home Page Controller
   BOOKS: SST -> Part 1 -> Ch. 3 (The Rise of the Marathas)
   QUIZ:  SST -> Part 1 -> Ch. 5 (Universal Franchise, 160 MCQs)
          Science -> Ch. 7 (Particulate Nature of Matter, 120 MCQs)
   ========================================================================== */

(function () {
  const SUBJECTS = [
    { id: "sst", name: "SST", icon: "images/globe.svg", booksActive: true, quizActive: true },
    { id: "science", name: "Science", icon: "images/microscope.svg", booksActive: false, quizActive: true },
    { id: "maths", name: "Maths", icon: "images/math.svg", booksActive: false, quizActive: false },
    { id: "english", name: "English", icon: "images/book.svg", booksActive: false, quizActive: false },
    { id: "hindi", name: "Hindi", icon: "images/feather.svg", booksActive: false, quizActive: false },
    { id: "gk", name: "GK", icon: "images/bulb.svg", booksActive: false, quizActive: false }
  ];

  const SST_PART1_CHAPTERS_BOOKS = [
    { num: 1, title: "Natural Resources and Their Use", href: null },
    { num: 2, title: "Reshaping India's Political Map", href: null },
    {
      num: 3,
      title: "The Rise of the Marathas",
      href: "chapters/sst/the-rise-of-the-marathas/the-rise-of-the-marathas.html",
      meta: "CHS Notes + Timeline"
    },
    { num: 4, title: "The Colonial Era in India", href: null },
    { num: 5, title: "Universal Franchise and India's Electoral System", href: null },
    { num: 6, title: "The Parliamentary System: Legislature and Executive", href: null },
    { num: 7, title: "Factors of Production", href: null }
  ];

  const SST_PART1_CHAPTERS_QUIZ = [
    { num: 1, title: "Natural Resources and Their Use", href: null },
    { num: 2, title: "Reshaping India's Political Map", href: null },
    { num: 3, title: "The Rise of the Marathas", href: null },
    { num: 4, title: "The Colonial Era in India", href: null },
    {
      num: 5,
      title: "Universal Franchise and India's Electoral System",
      href: "universal-adult-franchise-indias-electoral-system.html",
      meta: "160 MCQs"
    },
    { num: 6, title: "The Parliamentary System: Legislature and Executive", href: null },
    { num: 7, title: "Factors of Production", href: null }
  ];

  const SST_PART2_CHAPTERS_QUIZ = [
    {
      num: 1,
      title: "World Geography: Some Glimpses",
      href: "world-geography-some-glimpses.html",
      meta: "160 MCQs"
    },
    { num: 2, title: "India's Long Road to Independence", href: null },
    { num: 3, title: "A Journey Through Indian Architecture", href: null },
    { num: 4, title: "The Role of the Judiciary in Our Society", href: null },
    { num: 5, title: "Citizenship: Rights and Duties", href: null },
    { num: 6, title: "Dynamics of Population", href: null },
    { num: 7, title: "India's Urban Landscape", href: null },
    { num: 8, title: "Cultural Currents: 13th to 17th Centuries", href: null }
  ];

  const SCIENCE_CHAPTERS_QUIZ = [
    { num: 1, title: "Exploring the Investigative World of Science", href: null },
    {
      num: 2,
      title: "The Invisible Living World: Beyond Our Naked Eye",
      href: "the-invisible-living-world-beyond-our-naked-eye.html",
      meta: "140 MCQs"
    },
    { num: 3, title: "Health: The Ultimate Treasure", href: null },
    { num: 4, title: "Electricity: Magnetic and Heating Effects", href: null },
    {
      num: 5,
      title: "Exploring Forces",
      href: "exploring-forces.html",
      meta: "150 MCQs"
    },
    { num: 6, title: "Pressure, Winds, Storms, and Cyclones", href: null },
    {
      num: 7,
      title: "Particulate Nature of Matter",
      href: "particulate-nature-of-matter.html",
      meta: "130 MCQs"
    },
    { num: 8, title: "Nature of Matter: Elements, Compounds, and Mixtures", href: null },
    { num: 9, title: "The Amazing World of Solutes, Solvents, and Solutions", href: null },
    { num: 10, title: "Light: Mirrors and Lenses", href: null },
    { num: 11, title: "Keeping Time with the Skies", href: null },
    { num: 12, title: "How Nature Works in Harmony", href: null },
    { num: 13, title: "Our Home: Earth, a Unique Life Sustaining Planet", href: null }
  ];

  const state = {
    booksLevel: "subjects", // "subjects" | "sst-parts" | "sst-part1-chapters"
    quizOpen: false,
    quizLevel: "subjects" // "subjects" | "sst-parts" | "sst-part1-chapters" | "science-chapters"
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
    toast._t = setTimeout(() => toast.classList.add("hidden"), 2200);
  }

  function renderChapterRows(list) {
    return `
      <div class="chapter-list">
        ${list
          .map((ch) =>
            ch.href
              ? `
          <a class="chapter-row is-live" href="${ch.href}">
            <div class="chapter-row-left">
              <span class="chapter-num">Ch ${ch.num}</span>
              <span class="chapter-title">${ch.title}</span>
            </div>
            <span class="live-badge">${ch.meta} →</span>
          </a>`
              : `
          <div class="chapter-row is-disabled" aria-disabled="true">
            <div class="chapter-row-left">
              <span class="chapter-num">Ch ${ch.num}</span>
              <span class="chapter-title">${ch.title}</span>
            </div>
            <span class="soon-badge">Soon</span>
          </div>`
          )
          .join("")}
      </div>`;
  }

  function renderBooksExplorer() {
    const crumbWrap = $("booksBreadcrumbWrap");
    const crumbEl = $("booksBreadcrumb");
    const contentEl = $("booksContent");

    if (state.booksLevel === "subjects") {
      crumbWrap.classList.add("hidden");
      contentEl.innerHTML = `
        <div class="subject-grid">
          ${SUBJECTS.map((s) =>
            s.booksActive
              ? `
            <button type="button" class="subject-tile is-active" data-book-subject="${s.id}">
              <div class="subject-tile-left">
                <span class="subject-icon-pedestal"><img src="${s.icon}" class="svg-icon svg-icon--lg" alt="" aria-hidden="true" /></span>
                <span class="subject-name">${s.name}</span>
              </div>
              <span class="live-badge">Open →</span>
            </button>`
              : `
            <div class="subject-tile is-disabled" aria-disabled="true">
              <div class="subject-tile-left">
                <span class="subject-icon-pedestal"><img src="${s.icon}" class="svg-icon svg-icon--lg" alt="" aria-hidden="true" /></span>
                <span class="subject-name">${s.name}</span>
              </div>
              <span class="soon-badge">Soon</span>
            </div>`
          ).join("")}
        </div>`;

      contentEl.querySelectorAll("[data-book-subject]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (btn.dataset.bookSubject === "sst") {
            state.booksLevel = "sst-parts";
            renderBooksExplorer();
          }
        });
      });
    } else if (state.booksLevel === "sst-parts") {
      crumbWrap.classList.remove("hidden");
      crumbEl.innerHTML = `
        <button type="button" class="breadcrumb-btn" data-book-nav="subjects">Subjects</button>
        <span>/</span>
        <span>SST Books</span>`;

      contentEl.innerHTML = `
        <div class="parts-grid">
          <button type="button" class="part-card is-active" id="openBooksSstPart1Btn">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">
              <strong style="font-size:1.12rem;"><img src="images/folder-book.svg" class="svg-icon" alt="" aria-hidden="true" /> Part 1</strong>
              <span class="live-badge">7 Chapters →</span>
            </div>
            <span style="font-size:0.84rem;color:var(--text-secondary);">
              Exploring Society: India and Beyond — Grade 8 Part 1
            </span>
          </button>

          <div class="part-card is-disabled" aria-disabled="true">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">
              <strong style="font-size:1.12rem;"><img src="images/folder-book.svg" class="svg-icon" alt="" aria-hidden="true" /> Part 2</strong>
              <span class="soon-badge">Soon</span>
            </div>
            <span style="font-size:0.84rem;color:var(--text-secondary);">
              Exploring Society: India and Beyond — Grade 8 Part 2
            </span>
          </div>
        </div>`;

      $("openBooksSstPart1Btn").addEventListener("click", () => {
        state.booksLevel = "sst-part1-chapters";
        renderBooksExplorer();
      });
    } else if (state.booksLevel === "sst-part1-chapters") {
      crumbWrap.classList.remove("hidden");
      crumbEl.innerHTML = `
        <button type="button" class="breadcrumb-btn" data-book-nav="subjects">Subjects</button>
        <span>/</span>
        <button type="button" class="breadcrumb-btn" data-book-nav="sst-parts">SST</button>
        <span>/</span>
        <span>Part 1</span>`;

      contentEl.innerHTML = renderChapterRows(SST_PART1_CHAPTERS_BOOKS);
    }

    crumbEl.querySelectorAll("[data-book-nav]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.booksLevel = btn.dataset.bookNav;
        renderBooksExplorer();
      });
    });
  }

  function renderQuizExplorer() {
    const panel = $("quizExplorerPanel");
    const triggerHint = $("quizTriggerHint");

    if (!state.quizOpen) {
      panel.classList.add("hidden");
      triggerHint.textContent = "Tap to explore subjects →";
      return;
    }

    panel.classList.remove("hidden");
    triggerHint.textContent = "Tap to collapse ↑";

    const crumbEl = $("quizBreadcrumb");
    const contentEl = $("quizExplorerContent");

    if (state.quizLevel === "subjects") {
      crumbEl.innerHTML = `<span>QUIZ</span> <span>/</span> <span>All Subjects</span>`;
      contentEl.innerHTML = `
        <div class="subject-grid" style="margin-top:0;">
          ${SUBJECTS.map((s) =>
            s.quizActive
              ? `
            <button type="button" class="subject-tile is-active" data-quiz-subject="${s.id}">
              <div class="subject-tile-left">
                <span class="subject-icon-pedestal"><img src="${s.icon}" class="svg-icon svg-icon--lg" alt="" aria-hidden="true" /></span>
                <span class="subject-name">${s.name}</span>
              </div>
              <span class="live-badge">Open →</span>
            </button>`
              : `
            <div class="subject-tile is-disabled" aria-disabled="true">
              <div class="subject-tile-left">
                <span class="subject-icon-pedestal"><img src="${s.icon}" class="svg-icon svg-icon--lg" alt="" aria-hidden="true" /></span>
                <span class="subject-name">${s.name}</span>
              </div>
              <span class="soon-badge">Soon</span>
            </div>`
          ).join("")}
        </div>`;

      contentEl.querySelectorAll("[data-quiz-subject]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (btn.dataset.quizSubject === "sst") {
            state.quizLevel = "sst-parts";
            renderQuizExplorer();
          } else if (btn.dataset.quizSubject === "science") {
            state.quizLevel = "science-chapters";
            renderQuizExplorer();
          }
        });
      });
    } else if (state.quizLevel === "sst-parts") {
      crumbEl.innerHTML = `
        <button type="button" class="breadcrumb-btn" data-nav-level="subjects">Subjects</button>
        <span>/</span>
        <span>SST</span>`;

      contentEl.innerHTML = `
        <div class="parts-grid">
          <button type="button" class="part-card is-active" id="openSstPart1Btn">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">
              <strong style="font-size:1.12rem;"><img src="images/folder-book.svg" class="svg-icon" alt="" aria-hidden="true" /> Part 1</strong>
              <span class="live-badge">7 Chapters →</span>
            </div>
            <span style="font-size:0.84rem;color:var(--text-secondary);">
              Exploring Society: India and Beyond — Grade 8 Part 1
            </span>
          </button>

          <button type="button" class="part-card is-active" id="openSstPart2Btn">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">
              <strong style="font-size:1.12rem;"><img src="images/folder-book.svg" class="svg-icon" alt="" aria-hidden="true" /> Part 2</strong>
              <span class="live-badge">8 Chapters →</span>
            </div>
            <span style="font-size:0.84rem;color:var(--text-secondary);">
              Exploring Society: India and Beyond — Grade 8 Part 2
            </span>
          </button>
        </div>`;

      $("openSstPart1Btn").addEventListener("click", () => {
        state.quizLevel = "sst-part1-chapters";
        renderQuizExplorer();
      });

      $("openSstPart2Btn").addEventListener("click", () => {
        state.quizLevel = "sst-part2-chapters";
        renderQuizExplorer();
      });
    } else if (state.quizLevel === "sst-part1-chapters") {
      crumbEl.innerHTML = `
        <button type="button" class="breadcrumb-btn" data-nav-level="subjects">Subjects</button>
        <span>/</span>
        <button type="button" class="breadcrumb-btn" data-nav-level="sst-parts">SST</button>
        <span>/</span>
        <span>Part 1</span>`;

      contentEl.innerHTML = renderChapterRows(SST_PART1_CHAPTERS_QUIZ);
    } else if (state.quizLevel === "sst-part2-chapters") {
      crumbEl.innerHTML = `
        <button type="button" class="breadcrumb-btn" data-nav-level="subjects">Subjects</button>
        <span>/</span>
        <button type="button" class="breadcrumb-btn" data-nav-level="sst-parts">SST</button>
        <span>/</span>
        <span>Part 2</span>`;

      contentEl.innerHTML = renderChapterRows(SST_PART2_CHAPTERS_QUIZ);
    } else if (state.quizLevel === "science-chapters") {
      crumbEl.innerHTML = `
        <button type="button" class="breadcrumb-btn" data-nav-level="subjects">Subjects</button>
        <span>/</span>
        <span>Science (Curiosity — 13 Chapters)</span>`;

      contentEl.innerHTML = renderChapterRows(SCIENCE_CHAPTERS_QUIZ);
    }

    crumbEl.querySelectorAll("[data-nav-level]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.quizLevel = btn.dataset.navLevel;
        renderQuizExplorer();
      });
    });
  }

  function openSettings() {
    $("settingsModalBackdrop").classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeSettings() {
    $("settingsModalBackdrop").classList.add("hidden");
    document.body.style.overflow = "";
    if (window.QuizApp.scroll) window.QuizApp.scroll.showControls();
  }

  function init() {
    window.QuizApp.theme.initTheme();
    window.QuizApp.scroll.initScrollBehavior();

    renderBooksExplorer();
    renderQuizExplorer();

    $("quizSquareTrigger").addEventListener("click", () => {
      state.quizOpen = !state.quizOpen;
      if (state.quizOpen) state.quizLevel = "subjects";
      renderQuizExplorer();
    });

    $("settingsGearBtn").addEventListener("click", openSettings);
    $("closeSettingsBtn").addEventListener("click", closeSettings);
    $("doneSettingsBtn").addEventListener("click", closeSettings);
    $("settingsModalBackdrop").addEventListener("click", (e) => {
      if (e.target === $("settingsModalBackdrop")) closeSettings();
    });

    $("resetSettingsDefaultsBtn").addEventListener("click", () => {
      window.QuizApp.theme.resetAppearanceDefaults();
      showToast("All settings reset to default.");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !$("settingsModalBackdrop").classList.contains("hidden")) {
        closeSettings();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
