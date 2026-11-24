/* ==========================================================================
   Sound Feedback Module — Controlled from Inside Settings Panel
   ========================================================================== */

(function () {
  const STORAGE_KEY = "uaf_chs_sound";
  let enabled = true;
  let audioCtx = null;

  function loadPref() {
    try {
      const val = localStorage.getItem(STORAGE_KEY);
      enabled = val === null ? true : val === "true";
    } catch (_) {
      enabled = true;
    }
    const toggle = document.getElementById("settingsSoundToggle");
    if (toggle) toggle.checked = enabled;
  }

  function setEnabled(val) {
    enabled = Boolean(val);
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch (_) {}
    if (enabled) playTone(520, 0.08, "sine");
  }

  function playTone(freq, duration, type) {
    if (!enabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtx) audioCtx = new AudioContextClass();
      if (audioCtx.state === "suspended") audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }

  function playCorrect() {
    playTone(587.33, 0.1, "triangle");
    setTimeout(() => playTone(880, 0.16, "triangle"), 90);
  }

  function playWrong() {
    playTone(220, 0.16, "sawtooth");
  }

  function playComplete() {
    playTone(523.25, 0.12, "triangle");
    setTimeout(() => playTone(659.25, 0.12, "triangle"), 110);
    setTimeout(() => playTone(783.99, 0.22, "triangle"), 220);
  }

  function initSound() {
    loadPref();
    const toggle = document.getElementById("settingsSoundToggle");
    if (toggle) {
      toggle.addEventListener("change", (e) => setEnabled(e.target.checked));
    }
  }

  window.QuizApp = window.QuizApp || {};
  window.QuizApp.sound = { initSound, playCorrect, playWrong, playComplete };
})();
