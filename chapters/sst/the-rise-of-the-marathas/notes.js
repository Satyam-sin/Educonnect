/* ==========================================================================
   Chapter Notes Controller — 32-Event Vertical Timeline, 26 Kings & Gurus,
   Reading Progress Rail, Interactive Flashcards, Search, TTS & Settings
   ========================================================================== */

(function () {
  let allTimelineEvents = [];
  let activeEra = "ALL";

  let allLeaders = [];
  let activeLeaderCategory = "ALL";

  const FLASHCARDS = [
    { q: "In which year & fort was Chhatrapati Shivaji Maharaj crowned?", a: "1674 at Raigad Fort (title: 'Shri Raja Shiva Chhatrapati'; era: Rājyābhiṣheka shaka)." },
    { q: "Which weapon did Shivaji use against Afzal Khan at Pratapgad?", a: "Wāgh nakh ('tiger's claw') in close combat, followed by guerrilla ambush." },
    { q: "What were Chauth and Sardeshmukhi?", a: "Chauth = 25% tax; Sardeshmukhi = additional 10% tax levied for protection." },
    { q: "Who authored Ādnyāpatra (1715) and called forts 'the core of the state'?", a: "Ramachandrapant Amatya (Shivaji's Finance Minister)." },
    { q: "Difference between Bārgīrs and Shiledārs in Maratha cavalry?", a: "Bārgīrs = horses/equipment funded by state; Shiledārs = funded by soldiers themselves." },
    { q: "Which Maratha admiral challenged European cartaz naval passes?", a: "Kanhoji Angre (18th century) — Europeans frustratedly called him a 'pirate'." },
    { q: "Who is called the 'architect of the northward Maratha expansion'?", a: "Maharani Tarabai (Queen of Chhatrapati Rajaram)." },
    { q: "Which two iconic temples did Ahilyabai Holkar rebuild?", a: "Kashi Vishwanath (Varanasi) and Somnath (Gujarat), plus Maheshwar weaving." },
    { q: "Who organised the first pan-Indian anti-British alliance?", a: "Nana Phadnavis (uniting Hyder Ali of Mysore and the Nizam of Hyderabad)." },
    { q: "Who recaptured Delhi in 1771 and built a European-style Maratha army?", a: "Mahadji Shinde (Mahadji Scindia)." },
    { q: "Who founded Dhanwantari Mahal and India's first native printing press?", a: "Raja Serfoji II of Thanjavur (also wrote Devendra Kuravanji)." },
    { q: "Which script was mainly used for Maratha official correspondence?", a: "Moḍī script (a cursive form of Devanagari)." }
  ];

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

  async function loadJSON(file, fallbackGlobal, key) {
    try {
      const res = await fetch(file, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json[key])) return json[key];
      }
    } catch (_) {}
    if (fallbackGlobal && Array.isArray(fallbackGlobal[key])) return fallbackGlobal[key];
    return [];
  }

  /* ------------------ Vertical Timeline (32 Events + Era Filter) ------------------ */
  function renderTimeline() {
    const container = $("verticalTimelineList");
    if (!container) return;
    const filtered =
      activeEra === "ALL"
        ? allTimelineEvents
        : allTimelineEvents.filter((e) => e.era === activeEra);

    $("timelineCountBadge").textContent = `${filtered.length} Events`;

    container.innerHTML = filtered
      .map(
        (ev) => `
      <div class="v-timeline-item">
        <div class="v-timeline-meta">
          <span class="v-timeline-year">${ev.year}</span>
          <span class="v-timeline-era">${ev.era}</span>
        </div>
        <h4 class="v-timeline-title">${ev.title}</h4>
        <p class="v-timeline-desc">${ev.desc}</p>
      </div>`
      )
      .join("");
  }

  /* ------------------ Kings, Queens, Generals & Gurus Directory ------------------ */
  function getLeaderCatClass(cat) {
    if (cat.includes("Guru")) return "cat-guru";
    if (cat.includes("Peshwa")) return "cat-peshwa";
    if (cat.includes("Thanjavur")) return "cat-cultural";
    if (cat.includes("Rival")) return "cat-rival";
    return "";
  }

  function renderLeaders() {
    const container = $("leadersListContainer");
    if (!container) return;
    const q = ($("leadersSearchInput").value || "").trim().toLowerCase();

    const filtered = allLeaders.filter((item) => {
      if (activeLeaderCategory !== "ALL" && item.category !== activeLeaderCategory) return false;
      if (q) {
        const hay = `${item.name} ${item.role} ${item.summary} ${item.chsFact} ${item.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    $("leadersCountBadge").textContent = `${filtered.length} Profiles`;

    if (!filtered.length) {
      container.innerHTML =
        '<p style="text-align:center;color:var(--text-secondary);padding:1.2rem;">No matching rulers or gurus found.</p>';
      return;
    }

    container.innerHTML = filtered
      .map(
        (l) => `
      <article class="leader-card ${getLeaderCatClass(l.category)}">
        <div class="leader-head">
          <h4 class="leader-name">${l.name}</h4>
          <span class="pill">${l.period}</span>
        </div>
        <div class="leader-role">${l.role} • ${l.category}</div>
        <p class="leader-summary">${l.summary}</p>
        <div class="leader-fact"><strong>CHS Key Point:</strong> ${l.chsFact}</div>
      </article>`
      )
      .join("");
  }

  /* ------------------ Interactive CHS Rapid-Fire Flashcards ------------------ */
  function renderFlashcards() {
    const grid = $("flashcardGrid");
    if (!grid) return;
    grid.innerHTML = FLASHCARDS.map(
      (fc, i) => `
      <button type="button" class="flashcard-btn" data-fc-idx="${i}">
        <span class="flashcard-q">Q${i + 1}. ${fc.q}</span>
        <span class="flashcard-hint">Tap to reveal answer ↓</span>
        <span class="flashcard-a hidden">✓ ${fc.a}</span>
      </button>`
    ).join("");

    grid.querySelectorAll(".flashcard-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const isOpen = btn.classList.toggle("revealed");
        btn.querySelector(".flashcard-a").classList.toggle("hidden", !isOpen);
        btn.querySelector(".flashcard-hint").classList.toggle("hidden", isOpen);
      });
    });
  }

  /* ------------------ Modals Open / Close ------------------ */
  function closeAllModals() {
    $("timelineModalBackdrop").classList.add("hidden");
    $("leadersModalBackdrop").classList.add("hidden");
    $("settingsModalBackdrop").classList.add("hidden");
    document.body.style.overflow = "";
    if (window.QuizApp.scroll) window.QuizApp.scroll.showControls();
  }

  function openModal(id) {
    closeAllModals();
    $(id).classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  /* ------------------ Reading Progress Rail ------------------ */
  function initReadingProgress() {
    const fill = $("notesProgressFill");
    if (!fill) return;
    const update = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const pct = scrollHeight > 0 ? Math.min(100, Math.round((scrollTop / scrollHeight) * 100)) : 0;
      fill.style.width = `${pct}%`;
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initNotesSearch() {
    const input = $("notesSearchInput");
    if (!input) return;
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      document.querySelectorAll(".study-card").forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.classList.toggle("hidden", q.length > 0 && !text.includes(q));
      });
    });
  }

  function initSectionTTS() {
    document.querySelectorAll("[data-read-section]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!("speechSynthesis" in window)) return;
        const card = btn.closest(".study-card");
        if (!card) return;

        if (btn.classList.contains("speaking")) {
          window.speechSynthesis.cancel();
          btn.classList.remove("speaking");
          btn.textContent = "🔊 Listen";
          return;
        }

        window.speechSynthesis.cancel();
        document.querySelectorAll("[data-read-section].speaking").forEach((b) => {
          b.classList.remove("speaking");
          b.textContent = "🔊 Listen";
        });

        const clone = card.cloneNode(true);
        clone.querySelectorAll("button").forEach((b) => b.remove());
        const text = clone.textContent.replace(/\s+/g, " ").trim();

        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "en-IN";
        const slider = document.getElementById("ttsRateSlider");
        utter.rate = slider ? parseFloat(slider.value) || 1.0 : 1.0;

        btn.classList.add("speaking");
        btn.textContent = "⏹ Stop";
        utter.onend = () => {
          btn.classList.remove("speaking");
          btn.textContent = "🔊 Listen";
        };
        utter.onerror = () => {
          btn.classList.remove("speaking");
          btn.textContent = "🔊 Listen";
        };
        window.speechSynthesis.speak(utter);
      });
    });
  }

  async function init() {
    window.QuizApp.theme.initTheme();
    window.QuizApp.tts.initTTS();
    window.QuizApp.scroll.initScrollBehavior();

    [allTimelineEvents, allLeaders] = await Promise.all([
      loadJSON("timeline-data.json", window.MARATHA_TIMELINE_FALLBACK, "events"),
      loadJSON("leaders-data.json", window.MARATHA_LEADERS_FALLBACK, "leaders")
    ]);

    renderTimeline();
    renderLeaders();
    renderFlashcards();
    initReadingProgress();
    initNotesSearch();
    initSectionTTS();

    // Topbar Icon Buttons
    $("timelineIconBtn").addEventListener("click", () => openModal("timelineModalBackdrop"));
    $("leadersIconBtn").addEventListener("click", () => openModal("leadersModalBackdrop"));
    $("settingsGearBtn").addEventListener("click", () => openModal("settingsModalBackdrop"));

    // Close Buttons & Backdrops
    $("closeTimelineBtn").addEventListener("click", closeAllModals);
    $("closeLeadersBtn").addEventListener("click", closeAllModals);
    $("closeSettingsBtn").addEventListener("click", closeAllModals);
    $("doneSettingsBtn").addEventListener("click", closeAllModals);

    ["timelineModalBackdrop", "leadersModalBackdrop", "settingsModalBackdrop"].forEach((id) => {
      $(id).addEventListener("click", (e) => {
        if (e.target === $(id)) closeAllModals();
      });
    });

    // Era Filters inside Vertical Timeline
    document.querySelectorAll("[data-era-filter]").forEach((chip) => {
      chip.addEventListener("click", () => {
        activeEra = chip.dataset.eraFilter;
        document.querySelectorAll("[data-era-filter]").forEach((c) => c.classList.toggle("active", c === chip));
        renderTimeline();
      });
    });

    // Category Filters & Search inside Kings & Gurus Directory
    document.querySelectorAll("[data-leader-cat]").forEach((chip) => {
      chip.addEventListener("click", () => {
        activeLeaderCategory = chip.dataset.leaderCat;
        document.querySelectorAll("[data-leader-cat]").forEach((c) => c.classList.toggle("active", c === chip));
        renderLeaders();
      });
    });
    $("leadersSearchInput").addEventListener("input", renderLeaders);

    // Flashcards Reveal All / Hide All
    $("toggleAllFlashcardsBtn").addEventListener("click", () => {
      const cards = document.querySelectorAll(".flashcard-btn");
      const anyHidden = Array.from(cards).some((c) => !c.classList.contains("revealed"));
      cards.forEach((c) => {
        c.classList.toggle("revealed", anyHidden);
        c.querySelector(".flashcard-a").classList.toggle("hidden", !anyHidden);
        c.querySelector(".flashcard-hint").classList.toggle("hidden", anyHidden);
      });
      $("toggleAllFlashcardsBtn").textContent = anyHidden ? "Hide All Answers" : "Reveal All Answers";
    });

    $("resetSettingsDefaultsBtn").addEventListener("click", () => {
      window.QuizApp.theme.resetAppearanceDefaults();
      window.QuizApp.tts.resetTTSDefaults();
      showToast("All settings reset to default.");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAllModals();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
