/* SMART PROCESS — 60fps 3D Cylinder Cut & Unroll Canvas Engine (CSA = 2πrh) */
(function () {
  function initCylinderCSA() {
    const canvas = document.getElementById("csaCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const playBtn = document.getElementById("csaPlayBtn");
    const resetBtn = document.getElementById("csaResetBtn");
    const scrub = document.getElementById("csaScrub");
    const caption = document.getElementById("csaCaption");
    const stepBtns = Array.from(document.querySelectorAll("[data-csa-step]"));

    let progress = 0; // 0.0 -> 1.0
    let playing = false;
    let lastTime = 0;
    const DURATION_MS = 8500;
    const sparks = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(320, rect.width || 680);
      const h = Math.round(w * 0.48);
      canvas.style.height = h + "px";
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function clamp01(v) { return Math.max(0, Math.min(1, v)); }
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    function updateCaptionAndSteps(p) {
      let step = 1;
      let text = "Step 1: A complete Right Circular Cylinder with 2 flat circular lids (top & bottom) and 1 curved side wall.";
      if (p >= 0.16 && p < 0.38) {
        step = 2;
        text = "Step 2: Both circular lids lift away — leaving ONLY the hollow curved lateral wall!";
      } else if (p >= 0.38 && p < 0.60) {
        step = 3;
        text = "Step 3: A sharp cutter slices straight down one side of the curved wall from top to bottom.";
      } else if (p >= 0.60 && p < 0.90) {
        step = 4;
        text = "Step 4: Watch the curved wall smoothly uncurl and spread flat on the plane!";
      } else if (p >= 0.90) {
        step = 5;
        text = "Step 5: It forms a Rectangle! Length = Circumference (2πr), Breadth = Height (h) → CSA = 2πr × h = 2πrh!";
      }
      if (caption) caption.textContent = text;
      stepBtns.forEach((b) => b.classList.toggle("is-active", Number(b.dataset.csaStep) === step));
    }

    function spawnSparks(x, y) {
      for (let i = 0; i < 3; i++) {
        sparks.push({
          x, y,
          vx: (Math.random() - 0.5) * 4.2,
          vy: (Math.random() - 0.7) * 3.5,
          life: 1
        });
      }
    }

    function draw() {
      const w = canvas.width / Math.min(window.devicePixelRatio || 1, 2);
      const h = canvas.height / Math.min(window.devicePixelRatio || 1, 2);

      // Deep cosmic background
      const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.5, w * 0.65);
      bg.addColorStop(0, "#132257");
      bg.addColorStop(1, "#060b1f");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Subtle blueprint grid
      ctx.strokeStyle = "rgba(56, 189, 248, 0.06)";
      ctx.lineWidth = 1;
      for (let gx = 0; gx < w; gx += 32) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
      }
      for (let gy = 0; gy < h; gy += 32) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      }

      const cx = w * 0.5;
      const cy = h * 0.52;
      const R = Math.min(w * 0.115, h * 0.28);
      const H = Math.min(h * 0.46, 145);
      const tilt = 0.27; // 3D perspective ellipse vertical ratio

      // Phase factors
      const lidT = easeInOut(clamp01((progress - 0.16) / 0.22));
      const cutT = easeInOut(clamp01((progress - 0.38) / 0.20));
      const unrollT = easeInOut(clamp01((progress - 0.60) / 0.30));
      const labelT = easeOut(clamp01((progress - 0.88) / 0.12));

      // Compute 3D unrolling strip mesh:
      // As unrollT goes 0 -> 1, arc sweep goes from 2π -> 0 (radius -> infinity) while arc length stays 2πR!
      const N = 40;
      const fullWidth = 2 * Math.PI * R;
      const thetaMax = Math.max(0.002, 2 * Math.PI * (1 - unrollT));
      const curR = fullWidth / thetaMax;
      const strips = [];

      for (let i = 0; i < N; i++) {
        const u0 = -0.5 + i / N;
        const u1 = -0.5 + (i + 1) / N;
        const a0 = u0 * thetaMax; // 0 is back-center, ±thetaMax/2 are the two cut edges
        const a1 = u1 * thetaMax;

        // Back center stays near z = -R * (1 - unrollT)
        const x0 = cx + curR * Math.sin(a0);
        const z0 = (curR * (1 - Math.cos(a0)) - R) * (1 - unrollT);
        const x1 = cx + curR * Math.sin(a1);
        const z1 = (curR * (1 - Math.cos(a1)) - R) * (1 - unrollT);

        // When unrollT = 0, a = 0 is back (z = -R), a = ±π is front seam (z = +R)
        const yOff0 = z0 * tilt;
        const yOff1 = z1 * tilt;
        const avgZ = (z0 + z1) * 0.5;
        const shade = 0.5 + 0.5 * Math.cos((a0 + a1) * 0.5);

        strips.push({ x0, x1, yOff0, yOff1, avgZ, shade, i });
      }

      // Painter's algorithm: draw back strips first, front strips on top!
      strips.sort((a, b) => a.avgZ - b.avgZ);

      // Bottom Lid (behind front wall when attached, drops down in phase 2)
      const lidAlpha = 1 - lidT;
      if (lidAlpha > 0.01) {
        const botY = cy + H * 0.5 + lidT * 75;
        ctx.save();
        ctx.globalAlpha = lidAlpha;
        ctx.beginPath();
        ctx.ellipse(cx, botY, R, R * tilt, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245, 158, 11, 0.42)";
        ctx.fill();
        ctx.lineWidth = 2.4;
        ctx.strokeStyle = "#fde047";
        ctx.stroke();
        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Bottom Base", cx, botY + 4);
        ctx.restore();
      }

      // Draw 3D Curved / Unrolling Strips
      for (const s of strips) {
        const isFront = s.avgZ >= 0 || unrollT > 0.5;
        const hue = 198 + (s.i / N) * 58;
        const light = isFront ? 42 + s.shade * 16 : 24 + s.shade * 10;
        ctx.beginPath();
        ctx.moveTo(s.x0, cy - H * 0.5 + s.yOff0);
        ctx.lineTo(s.x1, cy - H * 0.5 + s.yOff1);
        ctx.lineTo(s.x1, cy + H * 0.5 + s.yOff1);
        ctx.lineTo(s.x0, cy + H * 0.5 + s.yOff0);
        ctx.closePath();
        ctx.fillStyle = `hsla(${hue}, 82%, ${light}%, ${isFront ? 0.78 : 0.48})`;
        ctx.fill();

        // Top & bottom glowing edges
        ctx.strokeStyle = unrollT > 0.85 ? "#34d399" : "#38bdf8";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(s.x0, cy - H * 0.5 + s.yOff0);
        ctx.lineTo(s.x1, cy - H * 0.5 + s.yOff1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s.x0, cy + H * 0.5 + s.yOff0);
        ctx.lineTo(s.x1, cy + H * 0.5 + s.yOff1);
        ctx.stroke();
      }

      // Draw crisp side vertical edges of the unrolled rectangle
      if (unrollT > 0.02) {
        const leftX = cx - fullWidth * 0.5;
        const rightX = cx + fullWidth * 0.5;
        if (unrollT > 0.94) {
          ctx.strokeStyle = "#34d399";
          ctx.lineWidth = 2.8;
          ctx.strokeRect(leftX, cy - H * 0.5, fullWidth, H);
        }
      }

      // Top Lid (flies up in phase 2)
      if (lidAlpha > 0.01) {
        const topY = cy - H * 0.5 - lidT * 75;
        ctx.save();
        ctx.globalAlpha = lidAlpha;
        ctx.beginPath();
        ctx.ellipse(cx, topY, R, R * tilt, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(251, 191, 36, 0.52)";
        ctx.fill();
        ctx.lineWidth = 2.6;
        ctx.strokeStyle = "#fde047";
        ctx.stroke();
        // Radius line on top lid
        ctx.beginPath();
        ctx.moveTo(cx, topY);
        ctx.lineTo(cx + R, topY);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("r", cx + R * 0.5, topY - 6);
        ctx.fillStyle = "#0f172a";
        ctx.fillText("Top Lid", cx - R * 0.35, topY + 4);
        ctx.restore();
      }

      // Phase 3: Glowing Knife + Vertical Cut Line + Sparks
      if (progress >= 0.38 && progress < 0.64) {
        const seamTopY = cy - H * 0.5 + R * tilt;
        const seamBotY = cy + H * 0.5 + R * tilt;
        const curY = seamTopY + (seamBotY - seamTopY) * cutT;

        ctx.save();
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 4;
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.moveTo(cx, seamTopY);
        ctx.lineTo(cx, curY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Metallic Knife Blade at (cx, curY)
        ctx.translate(cx, curY);
        ctx.fillStyle = "#e2e8f0";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(28, -16);
        ctx.lineTo(36, -6);
        ctx.lineTo(8, 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Knife Handle
        ctx.fillStyle = "#f43f5e";
        ctx.beginPath();
        ctx.roundRect(30, -24, 34, 13, 5);
        ctx.fill();

        // Glowing cut tip
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#fde047";
        ctx.fill();
        ctx.restore();

        if (playing && cutT > 0.02 && cutT < 0.98) {
          spawnSparks(cx, curY);
        }
      }

      // Render Sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life -= 0.05;
        if (sp.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(253, 224, 71, ${sp.life})`;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 2.5 * sp.life, 0, Math.PI * 2);
        ctx.fill();
      }

      // Phase 5: Dimension Arrows & Proved Formula
      if (labelT > 0.01) {
        const leftX = cx - fullWidth * 0.5;
        const rightX = cx + fullWidth * 0.5;
        const topEdge = cy - H * 0.5;
        const botEdge = cy + H * 0.5;

        ctx.save();
        ctx.globalAlpha = labelT;

        // Top Length = 2πr arrow
        ctx.strokeStyle = "#fde047";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(leftX, topEdge - 20);
        ctx.lineTo(rightX, topEdge - 20);
        ctx.stroke();
        ctx.fillStyle = "#fde047";
        ctx.font = "900 15px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Length = Circumference of Circle (2πr)", cx, topEdge - 30);

        // Right Breadth = h arrow
        ctx.strokeStyle = "#38bdf8";
        ctx.beginPath();
        ctx.moveTo(rightX + 20, topEdge);
        ctx.lineTo(rightX + 20, botEdge);
        ctx.stroke();
        ctx.fillStyle = "#38bdf8";
        ctx.textAlign = "left";
        ctx.fillText("h", rightX + 28, cy + 5);

        // Center Rectangle Text
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = "900 17px sans-serif";
        ctx.fillText("FLAT RECTANGLE", cx, cy - 8);
        ctx.fillStyle = "#6ee7b7";
        ctx.font = "900 18px sans-serif";
        ctx.fillText("Area = Length × Breadth = 2πr × h = 2πrh", cx, cy + 20);
        ctx.restore();
      }

      updateCaptionAndSteps(progress);
      if (scrub) scrub.value = Math.round(progress * 100);
    }

    function tick(now) {
      if (!playing) return;
      if (!lastTime) lastTime = now;
      const dt = now - lastTime;
      lastTime = now;
      progress = Math.min(1, progress + dt / DURATION_MS);
      draw();
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        playing = false;
        if (playBtn) playBtn.textContent = "▶ Play";
      }
    }

    function startPlay() {
      if (progress >= 0.99) progress = 0;
      playing = true;
      lastTime = 0;
      if (playBtn) playBtn.textContent = "⏸ Pause";
      requestAnimationFrame(tick);
    }

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        if (playing) {
          playing = false;
          playBtn.textContent = "▶ Play";
        } else {
          startPlay();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        playing = false;
        progress = 0;
        if (playBtn) playBtn.textContent = "▶ Play";
        draw();
      });
    }

    if (scrub) {
      scrub.addEventListener("input", () => {
        playing = false;
        if (playBtn) playBtn.textContent = "▶ Play";
        progress = Number(scrub.value) / 100;
        draw();
      });
    }

    const STEP_TARGETS = { 1: 0.0, 2: 0.36, 3: 0.56, 4: 0.78, 5: 1.0 };
    stepBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        playing = false;
        if (playBtn) playBtn.textContent = "▶ Play";
        const target = STEP_TARGETS[Number(btn.dataset.csaStep)] ?? 0;
        const startP = progress;
        const t0 = performance.now();
        function tween(now) {
          const k = Math.min(1, (now - t0) / 520);
          progress = startP + (target - startP) * easeInOut(k);
          draw();
          if (k < 1) requestAnimationFrame(tween);
        }
        requestAnimationFrame(tween);
      });
    });

    window.addEventListener("resize", resize);
    resize();
    // Auto-play smoothly once when loaded
    setTimeout(startPlay, 500);
  }

  document.addEventListener("DOMContentLoaded", initCylinderCSA);
})();
