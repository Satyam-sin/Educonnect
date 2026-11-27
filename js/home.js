/* ==========================================================================
   SMART PROCESS Home Page Controller
   BOOKS (Collapsible) | QUIZ (Collapsible) | EXTRA THINGS (Collapsible)
   ========================================================================== */

(function () {
  const SUBJECTS = [
    { id: "sst", name: "SST", icon: "images/sub-sst.svg", booksActive: true, quizActive: true },
    { id: "science", name: "Science", icon: "images/sub-science.svg", booksActive: true, quizActive: true },
    { id: "maths", name: "Maths", icon: "images/sub-maths.svg", booksActive: true, quizActive: false },
    { id: "english", name: "English", icon: "images/sub-english.svg", booksActive: false, quizActive: false },
    { id: "hindi", name: "Hindi", icon: "images/sub-hindi.svg", booksActive: false, quizActive: false },
    { id: "gk", name: "GK", icon: "images/sub-gk.svg", booksActive: false, quizActive: false }
  ];

  const SST_PART1_CHAPTERS_BOOKS = [
    { num: 1, title: "Natural Resources and Their Use", href: null },
    { num: 2, title: "Reshaping India's Political Map", href: null },
    {
      num: 3,
      title: "The Rise of the Marathas",
      href: "chapters/sst/the-rise-of-the-marathas/the-rise-of-the-marathas.html",
      meta: "CHS Notes + Timeline",
      icon: "images/ch-marathas.svg"
    },
    { num: 4, title: "The Colonial Era in India", href: null },
    { num: 5, title: "Universal Franchise and India's Electoral System", href: null },
    { num: 6, title: "The Parliamentary System: Legislature and Executive", href: null },
    { num: 7, title: "Factors of Production", href: null }
  ];

  const SST_PART2_CHAPTERS_BOOKS = [
    {
      num: 1,
      title: "World Geography: Some Glimpses",
      href: "chapters/sst/world-geography-some-glimpses/world-geography-some-glimpses.html",
      meta: "Illustrated Notes",
      icon: "images/ch-world-geo.svg"
    },
    { num: 2, title: "India's Long Road to Independence", href: null },
    { num: 3, title: "A Journey Through Indian Architecture", href: null },
    { num: 4, title: "The Role of the Judiciary in Our Society", href: null },
    {
      num: 5,
      title: "Citizenship: Rights and Duties",
      href: "chapters/sst/citizenship-rights-and-duties/citizenship-rights-and-duties.html",
      meta: "Illustrated Notes",
      icon: "images/ch-citizenship.svg"
    },
    { num: 6, title: "Dynamics of Population", href: null },
    { num: 7, title: "India's Urban Landscape", href: null },
    { num: 8, title: "Cultural Currents: 13th to 17th Centuries", href: null }
  ];

  const SCIENCE_CHAPTERS_BOOKS = [
    { num: 1, title: "Exploring the Investigative World of Science", href: null },
    { num: 2, title: "The Invisible Living World: Beyond Our Naked Eye", href: null },
    { num: 3, title: "Health: The Ultimate Treasure", href: null },
    {
      num: 4,
      title: "Electricity: Magnetic and Heating Effects",
      href: "chapters/science/electricity-magnetic-and-heating-effects/electricity-magnetic-and-heating-effects.html",
      meta: "Notes & Labs",
      icon: "images/ch-electricity.svg"
    },
    {
      num: 5,
      title: "Exploring Forces",
      href: "chapters/science/exploring-forces/exploring-forces.html",
      meta: "Notes & Labs",
      icon: "images/ch-forces.svg"
    },
    { num: 6, title: "Pressure, Winds, Storms, and Cyclones", href: null },
    { num: 7, title: "Particulate Nature of Matter", href: null },
    { num: 8, title: "Nature of Matter: Elements, Compounds, and Mixtures", href: null },
    { num: 9, title: "The Amazing World of Solutes, Solvents, and Solutions", href: null },
    {
      num: 10,
      title: "Light: Mirrors and Lenses",
      href: "chapters/science/light-mirrors-and-lenses/light-mirrors-and-lenses.html",
      meta: "Notes & Labs",
      icon: "images/ch-light.svg"
    },
    { num: 11, title: "Keeping Time with the Skies", href: null },
    { num: 12, title: "How Nature Works in Harmony", href: null },
    { num: 13, title: "Our Home: Earth, a Unique Life Sustaining Planet", href: null }
  ];


  const MATHS_CHAPTERS_BOOKS = [
    {
      num: 1,
      title: "Cylinder: Surface Area, Volume & Visual Proofs",
      href: "chapters/maths/cylinder/cylinder.html",
      meta: "Visual Notes",
      icon: "images/ch-cylinder.svg"
    }
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
      meta: "160 MCQs",
      icon: "images/ch-franchise.svg"
    },
    { num: 6, title: "The Parliamentary System: Legislature and Executive", href: null },
    { num: 7, title: "Factors of Production", href: null }
  ];

  const SST_PART2_CHAPTERS_QUIZ = [
    {
      num: 1,
      title: "World Geography: Some Glimpses",
      href: "world-geography-some-glimpses.html",
      meta: "160 MCQs",
      icon: "images/ch-world-geo.svg"
    },
    { num: 2, title: "India's Long Road to Independence", href: null },
    { num: 3, title: "A Journey Through Indian Architecture", href: null },
    { num: 4, title: "The Role of the Judiciary in Our Society", href: null },
    {
      num: 5,
      title: "Citizenship: Rights and Duties",
      href: "citizenship-rights-and-duties.html",
      meta: "160 MCQs",
      icon: "images/ch-citizenship.svg"
    },
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
      meta: "140 MCQs",
      icon: "images/ch-microbes.svg"
    },
    { num: 3, title: "Health: The Ultimate Treasure", href: null },
    { num: 4, title: "Electricity: Magnetic and Heating Effects", href: null },
    {
      num: 5,
      title: "Exploring Forces",
      href: "exploring-forces.html",
      meta: "150 MCQs",
      icon: "images/ch-forces.svg"
    },
    { num: 6, title: "Pressure, Winds, Storms, and Cyclones", href: null },
    {
      num: 7,
      title: "Particulate Nature of Matter",
      href: "particulate-nature-of-matter.html",
      meta: "130 MCQs",
      icon: "images/ch-matter.svg"
    },
    { num: 8, title: "Nature of Matter: Elements, Compounds, and Mixtures", href: null },
    { num: 9, title: "The Amazing World of Solutes, Solvents, and Solutions", href: null },
    { num: 10, title: "Light: Mirrors and Lenses", href: null },
    { num: 11, title: "Keeping Time with the Skies", href: null },
    { num: 12, title: "How Nature Works in Harmony", href: null },
    { num: 13, title: "Our Home: Earth, a Unique Life Sustaining Planet", href: null }
  ];

  const EXTRA_TOOLS = [
    {
      id: "pdf-studio",
      title: "Question Paper PDF Studio",
      sub: "Design & print custom A4 CHS question papers with answer keys",
      icon: "images/extra-pdf-studio.svg",
      href: "download-pdf.html"
    },
    {
      id: "formulas",
      title: "CHS Formula & SI Units Studio",
      sub: "42+ explained formulas, 35+ SI units, visual diagrams, solver & flashcards",
      icon: "images/extra-formulas.svg",
      href: "chs-formulas-and-si-units.html"
    },
    {
      id: "converter",
      title: "Science Unit Converter",
      sub: "Convert °C/°F/K, km/h ↔ m/s, N ↔ kgf, and Pa ↔ kPa instantly",
      icon: "images/extra-converter.svg"
    },
    {
      id: "pomodoro",
      title: "25-Min Focus Study Timer",
      sub: "Distraction-free Pomodoro timer for daily CHS exam practice",
      icon: "images/extra-pomodoro.svg"
    },
    {
      id: "progress",
      title: "My Study Progress & Vault",
      sub: "View saved Bookmarks, Mistakes & Mastered CHS questions",
      icon: "images/extra-progress.svg"
    },
    {
      id: "blueprint",
      title: "BHU CHS Class 9 Blueprint",
      sub: "Exam pattern, 100-MCQ subject split & smart test-day strategy",
      icon: "images/extra-blueprint.svg"
    }
  ];

  const state = {
    booksOpen: false,
    booksLevel: "subjects",
    quizOpen: false,
    quizLevel: "subjects",
    extraOpen: false,
    pomoTimer: null,
    pomoRemaining: 25 * 60,
    pomoRunning: false
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
              <img src="${ch.icon || "images/book.svg"}" class="chapter-svg-icon" alt="" aria-hidden="true" />
              <span class="chapter-num">Ch ${ch.num}</span>
              <span class="chapter-title">${ch.title}</span>
            </div>
            <span class="live-badge">${ch.meta} →</span>
          </a>`
              : `
          <div class="chapter-row is-disabled" aria-disabled="true">
            <div class="chapter-row-left">
              <img src="images/ui-lock-soon.svg" class="chapter-svg-icon" style="opacity:0.65;" alt="" aria-hidden="true" />
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
    const panel = $("booksExplorerPanel");
    const triggerHint = $("booksTriggerHint");
    const triggerBtn = $("booksSquareTrigger");

    if (!state.booksOpen) {
      panel.classList.add("hidden");
      triggerHint.textContent = "Tap to explore subjects →";
      if (triggerBtn) triggerBtn.setAttribute("aria-expanded", "false");
      return;
    }

    panel.classList.remove("hidden");
    triggerHint.textContent = "Tap to collapse ↑";
    if (triggerBtn) triggerBtn.setAttribute("aria-expanded", "true");

    const crumbEl = $("booksBreadcrumb");
    const contentEl = $("booksContent");

    if (state.booksLevel === "subjects") {
      crumbEl.innerHTML = `<span>BOOKS</span> <span>/</span> <span>All Subjects</span>`;
      contentEl.innerHTML = `
        <div class="subject-grid" style="margin-top:0;">
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
          } else if (btn.dataset.bookSubject === "science") {
            state.booksLevel = "science-chapters";
            renderBooksExplorer();
          } else if (btn.dataset.bookSubject === "maths") {
            state.booksLevel = "maths-chapters";
            renderBooksExplorer();
          }
        });
      });
    } else if (state.booksLevel === "sst-parts") {
      crumbEl.innerHTML = `
        <button type="button" class="breadcrumb-btn" data-book-nav="subjects">Subjects</button>
        <span>/</span>
        <span>SST Books</span>`;

      contentEl.innerHTML = `
        <div class="parts-grid">
          <button type="button" class="part-card is-active" id="openBooksSstPart1Btn">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">
              <strong style="font-size:1.12rem;display:inline-flex;align-items:center;gap:0.45rem;"><img src="images/ui-part1-book.svg" class="svg-icon svg-icon--btn" alt="" aria-hidden="true" /> Part 1</strong>
              <span class="live-badge">7 Chapters →</span>
            </div>
            <span style="font-size:0.84rem;color:var(--text-secondary);">
              Exploring Society: India and Beyond — Grade 8 Part 1
            </span>
          </button>

          <button type="button" class="part-card is-active" id="openBooksSstPart2Btn">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">
              <strong style="font-size:1.12rem;display:inline-flex;align-items:center;gap:0.45rem;"><img src="images/ui-part2-book.svg" class="svg-icon svg-icon--btn" alt="" aria-hidden="true" /> Part 2</strong>
              <span class="live-badge">2 Live Notes →</span>
            </div>
            <span style="font-size:0.84rem;color:var(--text-secondary);">
              Exploring Society: India and Beyond — Grade 8 Part 2
            </span>
          </button>
        </div>`;

      $("openBooksSstPart1Btn").addEventListener("click", () => {
        state.booksLevel = "sst-part1-chapters";
        renderBooksExplorer();
      });

      $("openBooksSstPart2Btn").addEventListener("click", () => {
        state.booksLevel = "sst-part2-chapters";
        renderBooksExplorer();
      });
    } else if (state.booksLevel === "sst-part1-chapters") {
      crumbEl.innerHTML = `
        <button type="button" class="breadcrumb-btn" data-book-nav="subjects">Subjects</button>
        <span>/</span>
        <button type="button" class="breadcrumb-btn" data-book-nav="sst-parts">SST</button>
        <span>/</span>
        <span>Part 1</span>`;

      contentEl.innerHTML = renderChapterRows(SST_PART1_CHAPTERS_BOOKS);
    } else if (state.booksLevel === "sst-part2-chapters") {
      crumbEl.innerHTML = `
        <button type="button" class="breadcrumb-btn" data-book-nav="subjects">Subjects</button>
        <span>/</span>
        <button type="button" class="breadcrumb-btn" data-book-nav="sst-parts">SST</button>
        <span>/</span>
        <span>Part 2</span>`;

      contentEl.innerHTML = renderChapterRows(SST_PART2_CHAPTERS_BOOKS);
    } else if (state.booksLevel === "science-chapters") {
      crumbEl.innerHTML = `
        <button type="button" class="breadcrumb-btn" data-book-nav="subjects">Subjects</button>
        <span>/</span>
        <span>Science (Curiosity — 13 Chapters)</span>`;

      contentEl.innerHTML = renderChapterRows(SCIENCE_CHAPTERS_BOOKS);
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
    const triggerBtn = $("quizSquareTrigger");

    if (!state.quizOpen) {
      panel.classList.add("hidden");
      triggerHint.textContent = "Tap to explore subjects →";
      if (triggerBtn) triggerBtn.setAttribute("aria-expanded", "false");
      return;
    }

    panel.classList.remove("hidden");
    triggerHint.textContent = "Tap to collapse ↑";
    if (triggerBtn) triggerBtn.setAttribute("aria-expanded", "true");

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
              <strong style="font-size:1.12rem;display:inline-flex;align-items:center;gap:0.45rem;"><img src="images/ui-part1-book.svg" class="svg-icon svg-icon--btn" alt="" aria-hidden="true" /> Part 1</strong>
              <span class="live-badge">7 Chapters →</span>
            </div>
            <span style="font-size:0.84rem;color:var(--text-secondary);">
              Exploring Society: India and Beyond — Grade 8 Part 1
            </span>
          </button>

          <button type="button" class="part-card is-active" id="openSstPart2Btn">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">
              <strong style="font-size:1.12rem;display:inline-flex;align-items:center;gap:0.45rem;"><img src="images/ui-part2-book.svg" class="svg-icon svg-icon--btn" alt="" aria-hidden="true" /> Part 2</strong>
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

  function renderExtraExplorer() {
    const panel = $("extraExplorerPanel");
    const triggerHint = $("extraTriggerHint");
    const triggerBtn = $("extraSquareTrigger");
    const contentEl = $("extraExplorerContent");
    if (!panel || !contentEl) return;

    if (!state.extraOpen) {
      panel.classList.add("hidden");
      triggerHint.textContent = "Tap to explore tools & study boosters →";
      if (triggerBtn) triggerBtn.setAttribute("aria-expanded", "false");
      return;
    }

    panel.classList.remove("hidden");
    triggerHint.textContent = "Tap to collapse ↑";
    if (triggerBtn) triggerBtn.setAttribute("aria-expanded", "true");

    contentEl.innerHTML = `
      <div class="extra-tools-grid">
        ${EXTRA_TOOLS.map((t) =>
          t.href
            ? `
          <a class="extra-tool-card" href="${t.href}">
            <img src="${t.icon}" class="extra-tool-card-icon" alt="" aria-hidden="true" />
            <div class="extra-tool-card-info">
              <div class="extra-tool-card-title">${t.title}</div>
              <div class="extra-tool-card-sub">${t.sub}</div>
            </div>
          </a>`
            : `
          <button type="button" class="extra-tool-card" data-extra-tool="${t.id}">
            <img src="${t.icon}" class="extra-tool-card-icon" alt="" aria-hidden="true" />
            <div class="extra-tool-card-info">
              <div class="extra-tool-card-title">${t.title}</div>
              <div class="extra-tool-card-sub">${t.sub}</div>
            </div>
          </button>`
        ).join("")}
      </div>`;

    contentEl.querySelectorAll("[data-extra-tool]").forEach((btn) => {
      btn.addEventListener("click", () => openExtraToolModal(btn.dataset.extraTool));
    });
  }

  function stopPomodoro() {
    if (state.pomoTimer) {
      clearInterval(state.pomoTimer);
      state.pomoTimer = null;
    }
    state.pomoRunning = false;
  }

  function closeExtraToolModal() {
    const bd = $("extraToolBackdrop");
    if (bd) bd.classList.add("hidden");
    document.body.style.overflow = "";
    stopPomodoro();
  }

  function openExtraToolModal(toolId) {
    const tool = EXTRA_TOOLS.find((t) => t.id === toolId);
    if (!tool) return;
    $("extraToolTitle").textContent = tool.title;
    $("extraToolIcon").src = tool.icon;
    const body = $("extraToolBody");

    if (toolId === "formulas") {
      const items = [
        ["Weight on Planet", "W = m × g (Earth g ≈ 9.8 m/s²)"],
        ["Pressure", "P = Force / Area (SI: Pascal, N/m²)"],
        ["Law of Reflection", "∠i = ∠r (Normal is 90° to mirror)"],
        ["Angle with Mirror Surface", "θ = 90° − ∠i"],
        ["Density", "Density = Mass / Volume (kg/m³)"],
        ["Speed", "Speed = Distance / Time (m/s)"],
        ["Electric Heating (Joule)", "H = I² × R × t"],
        ["Voting Age (61st Amendment)", "18 Years (Article 326)"]
      ];
      body.innerHTML = items
        .map(
          ([label, eq]) => `
        <div class="extra-formula-card">
          <strong>${label}</strong>
          <span class="extra-formula-eq">${eq}</span>
        </div>`
        )
        .join("");
    } else if (toolId === "converter") {
      body.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:0.85rem;">
          <label style="font-weight:700;font-size:0.86rem;">Choose Conversion Type</label>
          <select id="convMode" class="extra-conv-input">
            <option value="c2f">Celsius (°C) → Fahrenheit (°F) &amp; Kelvin (K)</option>
            <option value="kmh2ms">Speed: km/h → m/s</option>
            <option value="kg2n">Mass (kg) → Weight on Earth (Newton)</option>
            <option value="pa2kpa">Pressure: Pascal (Pa) → Kilopascal (kPa)</option>
          </select>
          <div class="extra-conv-grid">
            <div>
              <label style="font-size:0.8rem;color:var(--text-secondary);">Input Value</label>
              <input type="number" id="convVal" class="extra-conv-input" value="100" step="any" />
            </div>
            <div>
              <label style="font-size:0.8rem;color:var(--text-secondary);">Converted Result</label>
              <div id="convOut" class="extra-conv-input" style="color:var(--accent-primary);">212 °F | 373.15 K</div>
            </div>
          </div>
        </div>`;
      const calc = () => {
        const mode = $("convMode").value;
        const v = parseFloat($("convVal").value);
        if (Number.isNaN(v)) {
          $("convOut").textContent = "Enter a number";
          return;
        }
        if (mode === "c2f") {
          $("convOut").textContent = `${((v * 9) / 5 + 32).toFixed(2)} °F | ${(v + 273.15).toFixed(2)} K`;
        } else if (mode === "kmh2ms") {
          $("convOut").textContent = `${(v / 3.6).toFixed(3)} m/s`;
        } else if (mode === "kg2n") {
          $("convOut").textContent = `${(v * 9.8).toFixed(2)} N`;
        } else {
          $("convOut").textContent = `${(v / 1000).toFixed(4)} kPa`;
        }
      };
      $("convMode").addEventListener("change", calc);
      $("convVal").addEventListener("input", calc);
      calc();
    } else if (toolId === "pomodoro") {
      state.pomoRemaining = 25 * 60;
      const fmt = (sec) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
      body.innerHTML = `
        <div style="text-align:center;">
          <p style="font-size:0.86rem;color:var(--text-secondary);">Stay focused for 25 minutes, then take a 5-minute break!</p>
          <div class="extra-pomo-display" id="pomoClock">${fmt(state.pomoRemaining)}</div>
          <div style="display:flex;gap:0.6rem;justify-content:center;flex-wrap:wrap;">
            <button type="button" class="btn btn-primary" id="pomoStartBtn">Start Focus</button>
            <button type="button" class="btn btn-secondary" id="pomoResetBtn">Reset 25:00</button>
            <button type="button" class="btn btn-secondary" id="pomoBreakBtn">5:00 Break</button>
          </div>
        </div>`;
      const tick = () => {
        if (state.pomoRemaining <= 0) {
          stopPomodoro();
          showToast("Pomodoro session complete! Great job!");
          return;
        }
        state.pomoRemaining -= 1;
        const el = $("pomoClock");
        if (el) el.textContent = fmt(state.pomoRemaining);
      };
      $("pomoStartBtn").addEventListener("click", () => {
        if (state.pomoRunning) {
          stopPomodoro();
          $("pomoStartBtn").textContent = "Resume Focus";
        } else {
          state.pomoRunning = true;
          $("pomoStartBtn").textContent = "Pause";
          state.pomoTimer = setInterval(tick, 1000);
        }
      });
      $("pomoResetBtn").addEventListener("click", () => {
        stopPomodoro();
        state.pomoRemaining = 25 * 60;
        $("pomoClock").textContent = fmt(state.pomoRemaining);
        $("pomoStartBtn").textContent = "Start Focus";
      });
      $("pomoBreakBtn").addEventListener("click", () => {
        stopPomodoro();
        state.pomoRemaining = 5 * 60;
        $("pomoClock").textContent = fmt(state.pomoRemaining);
        $("pomoStartBtn").textContent = "Start Break";
      });
    } else if (toolId === "progress") {
      const readLen = (key) => {
        try {
          const arr = JSON.parse(localStorage.getItem(key) || "[]");
          return Array.isArray(arr) ? arr.length : 0;
        } catch (_) {
          return 0;
        }
      };
      const bm = readLen("uaf_chs_bookmarks");
      const ms = readLen("uaf_chs_mistakes");
      const ma = readLen("uaf_chs_mastered");
      body.innerHTML = `
        <div class="stats-grid" style="margin-bottom:1rem;">
          <div class="stat-card"><div class="stat-label">Mastered MCQs</div><div class="stat-value success">${ma}</div></div>
          <div class="stat-card"><div class="stat-label">Saved Bookmarks</div><div class="stat-value accent">${bm}</div></div>
          <div class="stat-card"><div class="stat-label">Mistakes to Revise</div><div class="stat-value" style="color:var(--danger)">${ms}</div></div>
        </div>
        <p style="font-size:0.84rem;color:var(--text-secondary);margin-bottom:0.85rem;">
          Tip: Open any chapter quiz and expand <strong>Advanced Features → Smart Focus Pool</strong> to practice only your Bookmarked or Mistake questions!
        </p>
        <button type="button" class="btn btn-secondary" id="clearProgressBtn">Reset Saved Quiz Stats</button>`;
      $("clearProgressBtn").addEventListener("click", () => {
        ["uaf_chs_bookmarks", "uaf_chs_mistakes", "uaf_chs_mastered", "uaf_chs_history"].forEach((k) =>
          localStorage.removeItem(k)
        );
        showToast("Saved quiz stats cleared.");
        openExtraToolModal("progress");
      });
    } else if (toolId === "blueprint") {
      body.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:0.7rem;font-size:0.88rem;line-height:1.5;">
          <div class="extra-formula-card"><strong>Total Questions</strong><span class="extra-formula-eq">100 MCQs (Class 8 NCERT)</span></div>
          <div class="extra-formula-card"><strong>Subjects Covered</strong><span class="extra-formula-eq">Science, SST, Maths, English, Hindi</span></div>
          <div class="extra-formula-card"><strong>Negative Marking</strong><span class="extra-formula-eq">None — Attempt All 100!</span></div>
          <div class="extra-formula-card"><strong>Daily Target</strong><span class="extra-formula-eq">1 Book Chapter + 40 Timed MCQs</span></div>
        </div>`;
    }

    $("extraToolBackdrop").classList.remove("hidden");
    document.body.style.overflow = "hidden";
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
    renderExtraExplorer();

    // Global Live Chapter & Quiz Search
    const searchInput = $("globalChapterSearch");
    const searchResults = $("globalSearchResults");
    if (searchInput && searchResults) {
      const allEntries = [
        ...SST_PART1_CHAPTERS_BOOKS.filter((c) => c.href).map((c) => ({ ...c, kind: "SST Book Notes" })),
        ...SST_PART2_CHAPTERS_BOOKS.filter((c) => c.href).map((c) => ({ ...c, kind: "SST Book Notes" })),
        ...SCIENCE_CHAPTERS_BOOKS.filter((c) => c.href).map((c) => ({ ...c, kind: "Science Book Notes" })),
        ...MATHS_CHAPTERS_BOOKS.filter((c) => c.href).map((c) => ({ ...c, kind: "Maths Book Notes" })),
        ...SST_PART1_CHAPTERS_QUIZ.filter((c) => c.href).map((c) => ({ ...c, kind: "SST Quiz" })),
        ...SST_PART2_CHAPTERS_QUIZ.filter((c) => c.href).map((c) => ({ ...c, kind: "SST Quiz" })),
        ...SCIENCE_CHAPTERS_QUIZ.filter((c) => c.href).map((c) => ({ ...c, kind: "Science Quiz" })),
        { title: "CHS Formula & SI Units Studio", href: "chs-formulas-and-si-units.html", meta: "42+ Formulas • 35+ SI Units", kind: "Extra Things", icon: "images/extra-formulas.svg" }
      ];

      searchInput.addEventListener("input", () => {
        const q = searchInput.value.trim().toLowerCase();
        if (!q) {
          searchResults.classList.add("hidden");
          searchResults.innerHTML = "";
          return;
        }
        const matches = allEntries.filter(
          (e) => e.title.toLowerCase().includes(q) || e.kind.toLowerCase().includes(q)
        );
        searchResults.classList.remove("hidden");
        if (matches.length === 0) {
          searchResults.innerHTML = `<div style="padding:0.5rem 0.7rem;font-size:0.84rem;color:var(--text-secondary);">No live chapter matched "${q}". Try Maratha, Forces, Electricity, Light, Citizenship, or Geography.</div>`;
          return;
        }
        searchResults.innerHTML = matches
          .map(
            (m) => `
          <a class="global-search-item" href="${m.href}">
            <span style="display:inline-flex;align-items:center;gap:0.45rem;">
              <img src="${m.icon || "images/book.svg"}" style="width:20px;height:20px;" alt="" aria-hidden="true" />
              <span>${m.title} <small style="color:var(--text-secondary);font-weight:600;">(${m.kind})</small></span>
            </span>
            <span class="live-badge">${m.meta} →</span>
          </a>`
          )
          .join("");
      });
    }

    $("booksSquareTrigger").addEventListener("click", () => {
      state.booksOpen = !state.booksOpen;
      if (state.booksOpen) state.booksLevel = "subjects";
      renderBooksExplorer();
    });

    $("quizSquareTrigger").addEventListener("click", () => {
      state.quizOpen = !state.quizOpen;
      if (state.quizOpen) state.quizLevel = "subjects";
      renderQuizExplorer();
    });

    $("extraSquareTrigger").addEventListener("click", () => {
      state.extraOpen = !state.extraOpen;
      renderExtraExplorer();
    });

    $("closeExtraToolBtn").addEventListener("click", closeExtraToolModal);
    $("extraToolBackdrop").addEventListener("click", (e) => {
      if (e.target === $("extraToolBackdrop")) closeExtraToolModal();
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


    // === SMART PROCESS HOME INTERACTIONS ===
    const openAndScroll = (hubKey, sectionId) => {
      if (hubKey === "books") {
        state.booksOpen = true;
        state.booksLevel = "subjects";
        renderBooksExplorer();
      } else if (hubKey === "quiz") {
        state.quizOpen = true;
        state.quizLevel = "subjects";
        renderQuizExplorer();
      } else if (hubKey === "extra") {
        state.extraOpen = true;
        renderExtraExplorer();
      }
      const sec = $(sectionId);
      if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    if ($("navHomeBtn")) $("navHomeBtn").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    if ($("navChaptersBtn")) $("navChaptersBtn").addEventListener("click", () => openAndScroll("books", "booksHubSection"));
    if ($("navNotesBtn")) $("navNotesBtn").addEventListener("click", () => openAndScroll("books", "booksHubSection"));
    if ($("navQuizBtn")) $("navQuizBtn").addEventListener("click", () => openAndScroll("quiz", "quizHubSection"));
    if ($("navMoreBtn")) $("navMoreBtn").addEventListener("click", () => openAndScroll("extra", "extraHubSection"));

    if ($("spStartLearningBtn")) $("spStartLearningBtn").addEventListener("click", () => openAndScroll("books", "booksHubSection"));
    if ($("spViewAllChaptersBtn")) $("spViewAllChaptersBtn").addEventListener("click", () => openAndScroll("books", "booksHubSection"));
    if ($("featNotesCard")) $("featNotesCard").addEventListener("click", () => openAndScroll("books", "booksHubSection"));
    if ($("featQuizCard")) $("featQuizCard").addEventListener("click", () => openAndScroll("quiz", "quizHubSection"));
    if ($("featProgressCard")) $("featProgressCard").addEventListener("click", () => openExtraToolModal("progress"));
    if ($("featResourcesCard")) $("featResourcesCard").addEventListener("click", () => openAndScroll("extra", "extraHubSection"));

    if ($("navSearchBtn")) {
      $("navSearchBtn").addEventListener("click", () => {
        const inp = $("globalChapterSearch");
        if (inp) {
          inp.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => inp.focus(), 300);
        }
      });
    }

    if ($("spSearchGoBtn")) {
      $("spSearchGoBtn").addEventListener("click", () => {
        const inp = $("globalChapterSearch");
        if (inp) {
          inp.focus();
          inp.dispatchEvent(new Event("input"));
        }
      });
    }

    // Quick Theme Toggle in Navbar
    const qtBtn = $("quickThemeToggleBtn");
    const qtIcon = $("quickThemeIcon");
    const syncQuickThemeIcon = () => {
      if (!qtIcon) return;
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      qtIcon.src = isLight ? "images/sun.svg" : "images/moon.svg";
    };
    syncQuickThemeIcon();
    if (qtBtn) {
      qtBtn.addEventListener("click", () => {
        const isLight = document.documentElement.getAttribute("data-theme") === "light";
        const nextTheme = isLight ? "dark" : "light";
        const choiceBtn = document.querySelector(`[data-theme-choice="${nextTheme}"]`);
        if (choiceBtn) choiceBtn.click();
        else document.documentElement.setAttribute("data-theme", nextTheme);
        syncQuickThemeIcon();
      });
    }

    // Popular Chapters Carousel
    const track = $("popularChaptersTrack");
    const dotsWrap = $("popCarouselDots");
    if (track && dotsWrap) {
      let slideIdx = 0;
      const cards = Array.from(track.children);
      const getVisibleCount = () => (window.innerWidth <= 560 ? 1 : window.innerWidth <= 900 ? 2 : 4);
      const getMaxIdx = () => Math.max(0, cards.length - getVisibleCount());

      const renderCarousel = () => {
        const maxIdx = getMaxIdx();
        slideIdx = Math.max(0, Math.min(slideIdx, maxIdx));
        const cardWidth = cards[0] ? cards[0].getBoundingClientRect().width + 14.4 : 0;
        track.style.transform = `translateX(-${slideIdx * cardWidth}px)`;

        dotsWrap.innerHTML = Array.from({ length: maxIdx + 1 }, (_, i) =>
          `<button type="button" class="sp-car-dot ${i === slideIdx ? "is-active" : ""}" data-slide="${i}"></button>`
        ).join("");
        dotsWrap.querySelectorAll("[data-slide]").forEach((d) => {
          d.addEventListener("click", () => {
            slideIdx = Number(d.dataset.slide);
            renderCarousel();
          });
        });
      };

      if ($("popPrevBtn")) $("popPrevBtn").addEventListener("click", () => { slideIdx -= 1; renderCarousel(); });
      if ($("popNextBtn")) $("popNextBtn").addEventListener("click", () => { slideIdx += 1; renderCarousel(); });
      window.addEventListener("resize", renderCarousel);
      renderCarousel();
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!$("extraToolBackdrop").classList.contains("hidden")) closeExtraToolModal();
        else if (!$("settingsModalBackdrop").classList.contains("hidden")) closeSettings();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
