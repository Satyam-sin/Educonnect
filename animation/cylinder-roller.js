/* SMART PROCESS — 60fps Road Roller Canvas Engine (1 Revolution = 2πrh) */
(function () {
  function initRoadRoller() {
    const canvas = document.getElementById("rollerCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const playBtn = document.getElementById("rollerPlayBtn");
    const resetBtn = document.getElementById("rollerResetBtn");

    let prog = 0; // 0 -> 1 full 360° revolution
    let rolling = false;
    let lastTs = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(320, rect.width || 680);
      const h = Math.round(w * 0.34);
      canvas.style.height = h + "px";
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function draw() {
      const w = canvas.width / Math.min(window.devicePixelRatio || 1, 2);
      const h = canvas.height / Math.min(window.devicePixelRatio || 1, 2);

      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#0b1437");
      bg.addColorStop(1, "#060b1f");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const R = Math.min(h * 0.24, 42);
      const roadY = h * 0.76;
      const startX = w * 0.14;
      const travel = Math.min(w * 0.72, 2 * Math.PI * R * 1.9);
      const curX = startX + prog * travel;
      const angle = prog * Math.PI * 2;

      // Rough road base
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.roundRect(w * 0.05, roadY, w * 0.9, 16, 8);
      ctx.fill();

      // Freshly levelled emerald road strip (= 2πr distance!)
      if (prog > 0.005) {
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.roundRect(startX, roadY - 2, prog * travel, 20, 6);
        ctx.fill();
      }

      // Spinning Cylindrical Roller Drum
      ctx.save();
      ctx.translate(curX, roadY - R);
      ctx.rotate(angle);

      const drumGrad = ctx.createRadialGradient(-8, -8, 4, 0, 0, R);
      drumGrad.addColorStop(0, "#fde047");
      drumGrad.addColorStop(1, "#d97706");
      ctx.fillStyle = drumGrad;
      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Spokes
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-R + 4, 0); ctx.lineTo(R - 4, 0);
      ctx.moveTo(0, -R + 4); ctx.lineTo(0, R - 4);
      ctx.stroke();

      // Red Tracker Dot starting at bottom contact point
      ctx.fillStyle = "#f43f5e";
      ctx.beginPath();
      ctx.arc(0, R - 8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Status Text
      ctx.fillStyle = "#fde047";
      ctx.font = "900 15px sans-serif";
      ctx.textAlign = "left";
      const deg = Math.round(prog * 360);
      if (prog === 0) {
        ctx.fillText("Press 'Roll 1 Revolution' to watch the red dot complete 360°.", 24, 34);
      } else if (prog < 1) {
        ctx.fillText(`Rolling... ${deg}° rotated — Flattening road equal to curved surface!`, 24, 34);
      } else {
        ctx.fillStyle = "#6ee7b7";
        ctx.fillText("360° Complete! Distance = 2πr × Width h → Area Flattened = 2πrh (1 CSA)!", 24, 34);
      }
    }

    function tick(now) {
      if (!rolling) return;
      if (!lastTs) lastTs = now;
      const dt = now - lastTs;
      lastTs = now;
      prog = Math.min(1, prog + dt / 2400);
      draw();
      if (prog < 1) requestAnimationFrame(tick);
      else rolling = false;
    }

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        prog = 0;
        rolling = true;
        lastTs = 0;
        requestAnimationFrame(tick);
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        rolling = false;
        prog = 0;
        draw();
      });
    }

    window.addEventListener("resize", resize);
    resize();
  }

  document.addEventListener("DOMContentLoaded", initRoadRoller);
})();
