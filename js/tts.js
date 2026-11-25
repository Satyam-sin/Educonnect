/* ==========================================================================
   Text-to-Speech (TTS) Module — Smooth Speed Slider + Per-Question Listen
   ========================================================================== */

(function () {
  const KEY_ENABLED = "uaf_chs_tts_enabled";
  const KEY_RATE = "uaf_chs_tts_rate";

  let ttsEnabled = true;
  let speechRate = 1.0;
  let activeQIdx = null;
  const supported = "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";

  function loadPrefs() {
    try {
      const savedOn = localStorage.getItem(KEY_ENABLED);
      ttsEnabled = savedOn === null ? true : savedOn === "true";
      const savedRate = parseFloat(localStorage.getItem(KEY_RATE));
      if (!Number.isNaN(savedRate) && savedRate >= 0.6 && savedRate <= 1.6) {
        speechRate = savedRate;
      }
    } catch (_) {}
  }

  function updateSpeedSliderUI() {
    const slider = document.getElementById("ttsRateSlider");
    const label = document.getElementById("ttsRateValue");
    if (slider) {
      slider.value = String(speechRate);
      if (window.QuizApp.theme && window.QuizApp.theme.updateSliderFill) {
        window.QuizApp.theme.updateSliderFill(slider);
      }
    }
    if (label) label.textContent = `${speechRate.toFixed(2).replace(/\.00$/, ".0")}×`;
  }

  function setEnabled(val) {
    ttsEnabled = Boolean(val);
    try { localStorage.setItem(KEY_ENABLED, String(ttsEnabled)); } catch (_) {}
    if (!ttsEnabled) stopSpeaking();
    document.body.classList.toggle("tts-disabled", !ttsEnabled);
    const toggle = document.getElementById("settingsTtsToggle");
    if (toggle) toggle.checked = ttsEnabled;
  }

  function setRate(rate) {
    const parsed = Math.max(0.6, Math.min(1.6, parseFloat(rate) || 1.0));
    speechRate = Math.round(parsed * 20) / 20;
    try { localStorage.setItem(KEY_RATE, String(speechRate)); } catch (_) {}
    updateSpeedSliderUI();
  }

  function resetTTSDefaults() {
    setEnabled(true);
    setRate(1.0);
  }

  function clearActiveButtons() {
    document.querySelectorAll(".tts-btn.speaking").forEach((btn) => {
      btn.classList.remove("speaking");
      btn.innerHTML = `<img src="${window.SVG_IMG_PREFIX || "images/"}volume.svg" class="svg-icon" alt="" aria-hidden="true" /> Listen`;
    });
    activeQIdx = null;
  }

  function stopSpeaking() {
    if (supported) {
      try { window.speechSynthesis.cancel(); } catch (_) {}
    }
    clearActiveButtons();
  }

  function speakQuestion(qIdx, questionText, options, buttonEl) {
    if (!supported) return false;
    if (activeQIdx === qIdx) {
      stopSpeaking();
      return false;
    }

    stopSpeaking();

    const letters = ["A", "B", "C", "D"];
    const optsText = options.map((opt, i) => `Option ${letters[i]}: ${opt}`).join(". ");
    const fullText = `Question ${qIdx + 1}. ${questionText}. ${optsText}`;

    const utter = new SpeechSynthesisUtterance(fullText);
    utter.lang = "en-IN";
    utter.rate = speechRate;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length) {
      const preferred =
        voices.find((v) => v.lang.toLowerCase().startsWith("en-in")) ||
        voices.find((v) => v.lang.toLowerCase().startsWith("en"));
      if (preferred) utter.voice = preferred;
    }

    activeQIdx = qIdx;
    if (buttonEl) {
      buttonEl.classList.add("speaking");
      buttonEl.innerHTML = `<img src="${window.SVG_IMG_PREFIX || "images/"}stop.svg" class="svg-icon" alt="" aria-hidden="true" /> Stop`;
    }

    utter.onend = () => clearActiveButtons();
    utter.onerror = () => clearActiveButtons();

    window.speechSynthesis.speak(utter);
    return true;
  }

  function speakText(text) {
    if (!supported) return;
    stopSpeaking();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-IN";
    utter.rate = speechRate;
    window.speechSynthesis.speak(utter);
  }

  function initTTS() {
    loadPrefs();
    document.body.classList.toggle("tts-disabled", !ttsEnabled);

    const toggle = document.getElementById("settingsTtsToggle");
    if (toggle) {
      toggle.checked = ttsEnabled;
      toggle.disabled = !supported;
      toggle.addEventListener("change", (e) => setEnabled(e.target.checked));
    }

    const slider = document.getElementById("ttsRateSlider");
    if (slider) {
      slider.disabled = !supported;
      slider.addEventListener("input", (e) => setRate(e.target.value));
    }
    updateSpeedSliderUI();

    const testBtn = document.getElementById("settingsTtsTestBtn");
    if (testBtn) {
      if (!supported) {
        testBtn.disabled = true;
        testBtn.textContent = "Not Supported";
      } else {
        testBtn.addEventListener("click", () => {
          if (!ttsEnabled) setEnabled(true);
          speakText("Universal Adult Franchise gives every adult citizen one equal vote.");
        });
      }
    }

    window.addEventListener("beforeunload", stopSpeaking);
  }

  window.QuizApp = window.QuizApp || {};
  window.QuizApp.tts = {
    initTTS,
    speakQuestion,
    stopSpeaking,
    resetTTSDefaults
  };
})();
