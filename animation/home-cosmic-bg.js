/* SMART PROCESS — 60fps Cosmic Starfield, Constellation & Shooting Stars */
(function () {
  function initCosmicBg() {
    const canvas = document.getElementById("spCosmicCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let w = 0, h = 0;
    let stars = [];
    let meteors = [];
    const mouse = { x: -9999, y: -9999 };

    function isAnimEnabled() {
      return document.documentElement.getAttribute("data-animations") !== "off";
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(85, Math.max(36, Math.floor((w * h) / 18000)));
      const colors = ["#38bdf8", "#818cf8", "#fbbf24", "#c084fc", "#e0f2fe"];
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.9 + 0.7,
        phase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
    }

    function maybeSpawnMeteor() {
      if (meteors.length < 2 && Math.random() < 0.008) {
        meteors.push({
          x: Math.random() * w * 0.85 + w * 0.1,
          y: Math.random() * h * 0.35,
          vx: -6.5 - Math.random() * 4,
          vy: 3.2 + Math.random() * 2.5,
          life: 1
        });
      }
    }

    function draw(now) {
      ctx.clearRect(0, 0, w, h);
      if (!isAnimEnabled()) {
        requestAnimationFrame(draw);
        return;
      }

      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      const alphaScale = isLight ? 0.28 : 0.88;

      // Update & draw stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = w;
        if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h;
        if (s.y > h) s.y = 0;

        const twinkle = 0.55 + 0.45 * Math.sin(now * 0.0022 + s.phase);
        ctx.save();
        ctx.globalAlpha = twinkle * alphaScale;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Subtle cursor constellation line
        const dx = s.x - mouse.x;
        const dy = s.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 135) {
          ctx.strokeStyle = isLight
            ? `rgba(99, 102, 241, ${(1 - dist / 135) * 0.2})`
            : `rgba(56, 189, 248, ${(1 - dist / 135) * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      // Shooting stars (dark mode highlight)
      if (!isLight) {
        maybeSpawnMeteor();
        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i];
          m.x += m.vx;
          m.y += m.vy;
          m.life -= 0.022;
          if (m.life <= 0) { meteors.splice(i, 1); continue; }
          const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 8, m.y - m.vy * 8);
          grad.addColorStop(0, `rgba(253, 224, 71, ${m.life})`);
          grad.addColorStop(0.4, `rgba(56, 189, 248, ${m.life * 0.7})`);
          grad.addColorStop(1, "rgba(56, 189, 248, 0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - m.vx * 8, m.y - m.vy * 8);
          ctx.stroke();
        }
      }

      requestAnimationFrame(draw);
    }

    window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener("mouseleave", () => { mouse.x = -9999; mouse.y = -9999; });
    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(draw);
  }

  document.addEventListener("DOMContentLoaded", initCosmicBg);
})();
