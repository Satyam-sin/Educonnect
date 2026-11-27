/* ==========================================================================
   SMART PROCESS — Shared Interactive Notes Controller (Theme, Settings & Widgets)
   ========================================================================== */
(function () {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }

  function showToast(msg) {
    const t = $("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.add("hidden"), 2200);
  }

  function initSharedNotes() {
    if (window.QuizApp && window.QuizApp.theme) window.QuizApp.theme.initTheme();
    if (window.QuizApp && window.QuizApp.scroll) window.QuizApp.scroll.initScrollBehavior();

    // Settings Modal
    const backdrop = $("settingsModalBackdrop");
    const openSet = () => {
      if (!backdrop) return;
      backdrop.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    };
    const closeSet = () => {
      if (!backdrop) return;
      backdrop.classList.add("hidden");
      document.body.style.overflow = "";
    };
    if ($("settingsGearBtn")) $("settingsGearBtn").addEventListener("click", openSet);
    if ($("closeSettingsBtn")) $("closeSettingsBtn").addEventListener("click", closeSet);
    if ($("doneSettingsBtn")) $("doneSettingsBtn").addEventListener("click", closeSet);
    if (backdrop) {
      backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeSet(); });
    }
    if ($("resetSettingsDefaultsBtn")) {
      $("resetSettingsDefaultsBtn").addEventListener("click", () => {
        if (window.QuizApp && window.QuizApp.theme) window.QuizApp.theme.resetAppearanceDefaults();
        showToast("Settings reset to default.");
      });
    }


    // Listen to Key Highlights (Web Speech API)
    const listenBtn = $("listenHighlightsBtn");
    if (listenBtn && "speechSynthesis" in window) {
      listenBtn.addEventListener("click", () => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          showToast("Stopped reading.");
          return;
        }
        const hl = $("sec-highlights");
        if (!hl) return;
        const text = Array.from(hl.querySelectorAll(".check-list li")).map((li) => li.textContent.trim()).join(". ");
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1.0;
        window.speechSynthesis.speak(utter);
        showToast("Reading Key Highlights aloud...");
      });
    }

    // Print Notes button in Sidebar
    const printBtn = $("printNotesBtn");
    if (printBtn) {
      printBtn.addEventListener("click", () => window.print());
    }

    // Smooth Sidebar Active Link Tracking
    const navLinks = Array.from(document.querySelectorAll(".side-nav-link"));
    if (navLinks.length > 0) {
      navLinks.forEach((link) => {
        link.addEventListener("click", () => {
          navLinks.forEach((l) => l.classList.remove("is-active"));
          link.classList.add("is-active");
        });
      });
    }

    // Interactive Citizenship Articles Filter (if present)
    const artFilterBtns = document.querySelectorAll("[data-art-group]");
    if (artFilterBtns.length > 0) {
      artFilterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const grp = btn.dataset.artGroup;
          artFilterBtns.forEach((b) => b.classList.toggle("active", b === btn));
          document.querySelectorAll("[data-art-cat]").forEach((row) => {
            row.classList.toggle("hidden", grp !== "ALL" && row.dataset.artCat !== grp);
          });
        });
      });
    }

    // Interactive Planetary Weight Calculator (Exploring Forces Notes)
    const massInput = $("planetMassInput");
    if (massInput) {
      const updateWeights = () => {
        const m = Math.max(0, parseFloat(massInput.value) || 0);
        const map = {
          wEarth: (m * 10).toFixed(1),
          wMoon: (m * 1.6).toFixed(1),
          wMars: (m * 3.8).toFixed(1),
          wVenus: (m * 9.0).toFixed(1),
          wJupiter: (m * 25.4).toFixed(1)
        };
        Object.keys(map).forEach((id) => {
          const el = $(id);
          if (el) el.textContent = `${map[id]} N`;
        });
      };
      massInput.addEventListener("input", updateWeights);
      updateWeights();
    }

    // Interactive Continent Explorer Tabs (World Geography Notes)
    const contBtns = document.querySelectorAll("[data-continent-tab]");
    if (contBtns.length > 0) {
      contBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const target = btn.dataset.continentTab;
          contBtns.forEach((b) => b.classList.toggle("active", b === btn));
          document.querySelectorAll("[data-continent-panel]").forEach((panel) => {
            panel.classList.toggle("hidden", panel.dataset.continentPanel !== target);
          });
        });
      });
    }


    // Interactive Net Force Calculator (Exploring Forces)
    const netF1 = $("netF1"), netF2 = $("netF2"), netDir = $("netDirSelect"), netRes = $("netForceResult");
    if (netF1 && netF2 && netDir && netRes) {
      const calcNet = () => {
        const f1 = parseFloat(netF1.value) || 0;
        const f2 = parseFloat(netF2.value) || 0;
        if (netDir.value === "same") {
          netRes.textContent = `Net Force = ${(f1 + f2).toFixed(1)} N (Same Direction)`;
        } else {
          const diff = Math.abs(f1 - f2);
          const dir = f1 === f2 ? "Balanced (0 N)" : (f1 > f2 ? "Along Force 1" : "Along Force 2");
          netRes.textContent = `Net Force = ${diff.toFixed(1)} N (${dir})`;
        }
      };
      netF1.addEventListener("input", calcNet);
      netF2.addEventListener("input", calcNet);
      netDir.addEventListener("change", calcNet);
      calcNet();
    }

    // Interactive Spring Balance Least Count Calculator
    const sbGap = $("sbBigGap"), sbDiv = $("sbSmallDiv"), sbRes = $("sbLeastCountRes");
    if (sbGap && sbDiv && sbRes) {
      const calcSb = () => {
        const g = parseFloat(sbGap.value) || 0;
        const d = Math.max(1, parseInt(sbDiv.value, 10) || 1);
        sbRes.textContent = `Least Count = ${(g / d).toFixed(2)} N`;
      };
      sbGap.addEventListener("input", calcSb);
      sbDiv.addEventListener("input", calcSb);
      calcSb();
    }


    // Interactive Electromagnet Strength Simulator (Science Ch. 4)
    const emCells = $("emCells"), emTurns = $("emTurns"), emCore = $("emIronCore"), emRes = $("emStrengthRes");
    if (emCells && emTurns && emCore && emRes) {
      const calcEm = () => {
        const c = Math.max(0, parseInt(emCells.value, 10) || 0);
        const t = Math.max(0, parseInt(emTurns.value, 10) || 0);
        const coreMult = emCore.checked ? 2.5 : 1;
        const clips = Math.round(c * (t / 25) * 4 * coreMult);
        if (c === 0) {
          emRes.textContent = "OFF — 0 clips (No Current!)";
        } else {
          const lvl = clips >= 35 ? "Very Strong" : clips >= 15 ? "Strong" : "Mild";
          emRes.textContent = `${lvl} (~${clips} iron clips lifted)`;
        }
      };
      emCells.addEventListener("input", calcEm);
      emTurns.addEventListener("input", calcEm);
      emCore.addEventListener("change", calcEm);
      calcEm();
    }

    // Interactive Heating Effect Lab (Science Ch. 4)
    const hMat = $("heatMatSel"), hCells = $("heatCellsSel"), hRes = $("heatOutputRes");
    if (hMat && hCells && hRes) {
      const calcHeat = () => {
        const matScore = hMat.value === "nichrome" ? 3 : hMat.value === "iron" ? 2 : 1;
        const cells = parseInt(hCells.value, 10) || 1;
        const total = matScore * cells;
        if (total >= 8) hRes.textContent = "Red-Hot High Heat (Ideal Heater!)";
        else if (total >= 4) hRes.textContent = "Noticeably Warm Wire";
        else hRes.textContent = "Very Low Heat (Good Conductor)";
      };
      hMat.addEventListener("change", calcHeat);
      hCells.addEventListener("change", calcHeat);
      calcHeat();
    }


    // Interactive Reflection Angle Calculator (Science Ch. 10)
    const rIn = $("reflAngleInput"), rOutR = $("reflOutR"), rOutM = $("reflOutMirror"), rOutT = $("reflOutTotal");
    if (rIn && rOutR && rOutM && rOutT) {
      const calcRefl = () => {
        const iVal = Math.max(0, Math.min(89, parseFloat(rIn.value) || 0));
        rOutR.textContent = `∠r = ${iVal}°`;
        rOutM.textContent = `Angle with Mirror = ${(90 - iVal).toFixed(0)}°`;
        rOutT.textContent = `Between Rays = ${(2 * iVal).toFixed(0)}°`;
      };
      rIn.addEventListener("input", calcRefl);
      calcRefl();
    }

    // Interactive Mirror & Lens Image Predictor (Science Ch. 10)
    const oDev = $("optDeviceSel"), oDist = $("optDistSel"), oOut = $("optPredictorOut");
    if (oDev && oDist && oOut) {
      const PREDICT = {
        "plane-mirror": {
          close: "Erect, Same Size & Laterally Inverted — Reflection stays parallel.",
          far: "Erect, Same Size & Laterally Inverted — Always identical size!"
        },
        "concave-mirror": {
          close: "Erect & Enlarged (Magnified) — Used by dentists & ENT doctors!",
          far: "Inverted (initially Enlarged, then Diminished) — Converges light!"
        },
        "convex-mirror": {
          close: "Erect & Diminished — Diverges light; wide rear-view field!",
          far: "Erect & Even More Diminished — Always erect & smaller!"
        },
        "convex-lens": {
          close: "Erect & Enlarged — Works as a Magnifying Glass (Converging lens)!",
          far: "Inverted (Enlarged → Diminished) — Can focus sunlight to burn paper!"
        },
        "concave-lens": {
          close: "Erect & Diminished — Diverging lens (thicker at edges)!",
          far: "Erect & Even More Diminished — Always erect & smaller!"
        }
      };
      const updatePred = () => {
        const d = PREDICT[oDev.value];
        if (d) oOut.textContent = d[oDist.value] || "";
      };
      oDev.addEventListener("change", updatePred);
      oDist.addEventListener("change", updatePred);
      updatePred();
    }

    // Interactive Exploring Forces Flashcards
    const fGrid = $("forcesFlashGrid");
    const fToggle = $("toggleForcesFlashBtn");
    if (fGrid) {
      const cards = Array.from(fGrid.querySelectorAll(".flashcard"));
      cards.forEach((c) => c.addEventListener("click", () => c.classList.toggle("is-flipped")));
      if (fToggle) {
        let allOpen = false;
        fToggle.addEventListener("click", () => {
          allOpen = !allOpen;
          cards.forEach((c) => c.classList.toggle("is-flipped", allOpen));
          fToggle.textContent = allOpen ? "Hide All" : "Reveal All";
        });
      }
    }
  }

  document.addEventListener("DOMContentLoaded", initSharedNotes);
})();
