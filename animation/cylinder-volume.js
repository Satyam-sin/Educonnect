/* SMART PROCESS — 60fps Coin-Stack Volume Builder Canvas Engine (V = πr²h) */
(function () {
  function initCylinderVolume() {
    const canvas = document.getElementById("volCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const playBtn = document.getElementById("coinPlayBtn");
    const addBtn = document.getElementById("coinAddBtn");
    const clearBtn = document.getElementById("coinClearBtn");

    const MAX_COINS = 10;
    let coins = [];
    let autoInterval = null;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(320, rect.width || 680);
      const h = Math.round(w * 0.42);
      canvas.style.height = h + "px";
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function dropOneCoin() {
      if (coins.length >= MAX_COINS) {
        if (autoInterval) { clearInterval(autoInterval); autoInterval = null; }
        return;
      }
      coins.push({ idx: coins.length, yOffset: -130, vy: 0, settled: false });
    }

    function render() {
      const w = canvas.width / Math.min(window.devicePixelRatio || 1, 2);
      const h = canvas.height / Math.min(window.devicePixelRatio || 1, 2);

      const bg = ctx.createRadialGradient(w * 0.35, h * 0.5, 20, w * 0.5, h * 0.5, w * 0.7);
      bg.addColorStop(0, "#12214f");
      bg.addColorStop(1, "#060b1f");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.28;
      const R = Math.min(w * 0.125, 76);
      const ry = R * 0.24;
      const baseBottom = h * 0.84;
      const stepH = Math.min(h * 0.062, 16);
      const cylTop = baseBottom - MAX_COINS * stepH - 12;

      // Back Glass Cylinder
      ctx.fillStyle = "rgba(14, 165, 233, 0.08)";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.65)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cx - R, cylTop);
      ctx.lineTo(cx - R, baseBottom);
      ctx.ellipse(cx, baseBottom, R, ry, 0, Math.PI, 0, true);
      ctx.lineTo(cx + R, cylTop);
      ctx.fill();
      ctx.stroke();

      // Update & Draw Coins (Gravity + Gentle Bounce)
      for (const c of coins) {
        if (!c.settled) {
          c.vy += 1.25;
          c.yOffset += c.vy;
          if (c.yOffset >= 0) {
            c.yOffset = 0;
            if (Math.abs(c.vy) > 2.8) c.vy = -c.vy * 0.28;
            else { c.vy = 0; c.settled = true; }
          }
        }
        const cy = baseBottom - c.idx * stepH + c.yOffset;
        const isTop = c.idx === coins.length - 1;
        // Coin rim thickness
        ctx.fillStyle = "#b45309";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 4, R - 4, ry * 0.92, 0, 0, Math.PI * 2);
        ctx.fill();
        // Coin top face
        ctx.fillStyle = isTop ? "#fde047" : "#f59e0b";
        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(cx, cy, R - 4, ry * 0.92, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Front Glass Top Ellipse Rim
      ctx.beginPath();
      ctx.ellipse(cx, cylTop, R, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Right Info Panel
      const px = w * 0.52;
      const pw = w * 0.44;
      ctx.fillStyle = "rgba(15, 23, 42, 0.86)";
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(px, h * 0.14, pw, h * 0.72, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#34d399";
      ctx.font = "900 14px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("LIVE VOLUME COUNTER", px + 18, h * 0.29);

      ctx.fillStyle = "#fde047";
      ctx.font = "900 20px sans-serif";
      ctx.fillText(`Height h = ${coins.length} / ${MAX_COINS} discs`, px + 18, h * 0.45);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 18px sans-serif";
      ctx.fillText(
        coins.length === MAX_COINS ? "Volume = πr² × h = πr²h ✓" : `Volume = ${coins.length} × πr²`,
        px + 18,
        h * 0.61
      );

      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 12px sans-serif";
      ctx.fillText("Each circular disc has Base Area = πr²", px + 18, h * 0.76);

      requestAnimationFrame(render);
    }

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        if (autoInterval) clearInterval(autoInterval);
        if (coins.length >= MAX_COINS) coins = [];
        dropOneCoin();
        autoInterval = setInterval(dropOneCoin, 240);
      });
    }
    if (addBtn) addBtn.addEventListener("click", dropOneCoin);
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (autoInterval) { clearInterval(autoInterval); autoInterval = null; }
        coins = [];
      });
    }

    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(render);
  }

  document.addEventListener("DOMContentLoaded", initCylinderVolume);
})();
