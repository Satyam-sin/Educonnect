/* SMART PROCESS — 60fps Cylinder 2D Net Fold/Unfold Canvas Engine (TSA) */
(function () {
  function initCylinderTSA() {
    const canvas = document.getElementById("tsaCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const btn = document.getElementById("netToggleBtn");
    const cap = document.getElementById("netCaption");

    let t = 0; // 0 = folded 3D, 1 = unfolded 2D net
    let target = 0;
    let raf = null;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(320, rect.width || 680);
      const h = Math.round(w * 0.44);
      canvas.style.height = h + "px";
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function draw() {
      const w = canvas.width / Math.min(window.devicePixelRatio || 1, 2);
      const h = canvas.height / Math.min(window.devicePixelRatio || 1, 2);

      const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 20, w * 0.5, h * 0.5, w * 0.65);
      bg.addColorStop(0, "#151f4d");
      bg.addColorStop(1, "#060b1f");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;
      const R = Math.min(h * 0.165, 42);
      const rectH = Math.min(h * 0.34, 96);
      const foldedW = R * 2;
      const unfoldedW = Math.min(w * 0.64, 2 * Math.PI * R);
      const curW = foldedW + (unfoldedW - foldedW) * t;

      // Center Curved Wall -> Rectangle (2πrh)
      ctx.fillStyle = "rgba(14, 165, 233, 0.32)";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.roundRect(cx - curW * 0.5, cy - rectH * 0.5, curW, rectH, 8 * (1 - t));
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 15px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Curved Wall = 2πrh", cx, cy + 5);

      // Top Lid hinges from flat ellipse to full circle above top edge
      const lidRY = R * (0.28 + 0.72 * t);
      const topCenterY = cy - rectH * 0.5 - lidRY * t;
      ctx.fillStyle = "rgba(251, 191, 36, 0.38)";
      ctx.strokeStyle = "#fde047";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.ellipse(cx, topCenterY, R, lidRY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fde047";
      ctx.font = "900 13px sans-serif";
      ctx.fillText("πr²", cx, topCenterY + 5);

      // Bottom Lid hinges downward
      const botCenterY = cy + rectH * 0.5 + lidRY * t;
      ctx.beginPath();
      ctx.ellipse(cx, botCenterY, R, lidRY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fde047";
      ctx.fillText("πr²", cx, botCenterY + 5);

      if (t > 0.6) {
        ctx.save();
        ctx.globalAlpha = (t - 0.6) / 0.4;
        ctx.fillStyle = "#6ee7b7";
        ctx.font = "900 14px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("TSA = 2πrh + πr² + πr²", 18, 34);
        ctx.fillStyle = "#fde047";
        ctx.font = "900 16px sans-serif";
        ctx.fillText("= 2πr(r + h)", 18, 56);
        ctx.restore();
      }
    }

    function animate() {
      const diff = target - t;
      if (Math.abs(diff) < 0.005) {
        t = target;
        draw();
        raf = null;
        return;
      }
      t += diff * 0.12;
      draw();
      raf = requestAnimationFrame(animate);
    }

    if (btn) {
      btn.addEventListener("click", () => {
        target = target === 0 ? 1 : 0;
        btn.textContent = target === 1 ? "Fold Back to Cylinder" : "Unfold to 2D Net";
        if (cap) {
          cap.textContent = target === 1
            ? "Unfolded 2D Net: Total Surface Area = Curved Rectangle (2πrh) + Top Lid (πr²) + Bottom Lid (πr²) = 2πr(r + h)."
            : "Folded back into a 3D Cylinder! Click 'Unfold to 2D Net' anytime to inspect all 3 faces.";
        }
        if (!raf) raf = requestAnimationFrame(animate);
      });
    }

    window.addEventListener("resize", resize);
    resize();
  }

  document.addEventListener("DOMContentLoaded", initCylinderTSA);
})();
