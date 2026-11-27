/* SMART PROCESS — 60fps 3D Holographic Logo Pedestal & Rising Sparks */
(function () {
  function initHoloPedestal() {
    const canvas = document.getElementById("spHoloCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const particles = Array.from({ length: 24 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 40 + Math.random() * 88,
      y: Math.random() * 90,
      speed: 0.45 + Math.random() * 0.75,
      size: 1.5 + Math.random() * 2.2,
      gold: Math.random() > 0.65
    }));

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(240, rect.width || 340);
      const h = 110;
      canvas.style.height = h + "px";
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(now) {
      const w = canvas.width / Math.min(window.devicePixelRatio || 1, 2);
      const h = canvas.height / Math.min(window.devicePixelRatio || 1, 2);
      ctx.clearRect(0, 0, w, h);

      if (document.documentElement.getAttribute("data-animations") === "off") {
        requestAnimationFrame(draw);
        return;
      }

      const cx = w * 0.5;
      const baseY = h * 0.64;
      const t = now * 0.0018;

      // Central holographic plasma glow
      const glow = ctx.createRadialGradient(cx, baseY - 6, 8, cx, baseY, w * 0.42);
      glow.addColorStop(0, "rgba(56, 189, 248, 0.75)");
      glow.addColorStop(0.45, "rgba(99, 102, 241, 0.32)");
      glow.addColorStop(1, "rgba(14, 165, 233, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.ellipse(cx, baseY, w * 0.44, 34, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rotating segmented neon energy rings
      const rings = [
        { rx: w * 0.34, ry: 14, color: "#38bdf8", speed: 1.1, dash: [24, 14] },
        { rx: w * 0.43, ry: 19, color: "#818cf8", speed: -0.8, dash: [34, 18] },
        { rx: w * 0.25, ry: 10, color: "#fbbf24", speed: 1.6, dash: [14, 12] }
      ];
      rings.forEach((rg, idx) => {
        ctx.save();
        ctx.strokeStyle = rg.color;
        ctx.lineWidth = idx === 0 ? 2.6 : 2;
        ctx.setLineDash(rg.dash);
        ctx.lineDashOffset = t * 42 * rg.speed;
        ctx.beginPath();
        ctx.ellipse(cx, baseY + idx * 4, rg.rx, rg.ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // Rising holographic sparks around the logo
      for (const p of particles) {
        p.y += p.speed;
        p.angle += 0.014;
        if (p.y > 95) {
          p.y = 0;
          p.angle = Math.random() * Math.PI * 2;
        }
        const alpha = Math.sin((p.y / 95) * Math.PI);
        const px = cx + Math.cos(p.angle) * (p.radius * (w / 340));
        const py = baseY - p.y * 0.85;
        ctx.fillStyle = p.gold
          ? `rgba(253, 224, 71, ${alpha * 0.9})`
          : `rgba(56, 189, 248, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(draw);
  }

  document.addEventListener("DOMContentLoaded", initHoloPedestal);
})();
