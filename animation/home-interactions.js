/* SMART PROCESS — 3D Card Tilt, Neon Spotlight & Smooth Scroll Reveal */
(function () {
  function initHomeInteractions() {
    const isAnimOff = () => document.documentElement.getAttribute("data-animations") === "off";

    // 1. Subtle 3D Tilt + Cursor Spotlight on Feature Cards & Popular Cards
    const tiltTargets = document.querySelectorAll(".sp-feat-card, .sp-pop-card");
    tiltTargets.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        if (isAnimOff()) return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotY = (x - 0.5) * 10;
        const rotX = (0.5 - y) * 10;
        card.style.transform = `perspective(700px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px)`;
        card.style.setProperty("--mx", `${Math.round(x * 100)}%`);
        card.style.setProperty("--my", `${Math.round(y * 100)}%`);
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });

    // 2. Smooth Scroll Reveal via IntersectionObserver
    const revealEls = document.querySelectorAll(
      ".sp-feature-grid, .sp-search-section, .sp-popular-section, .hub-square, .sp-footer-banner"
    );
    if ("IntersectionObserver" in window && !isAnimOff()) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("sp-revealed");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08 }
      );
      revealEls.forEach((el) => {
        el.classList.add("sp-reveal-ready");
        io.observe(el);
      });
    }

    // 3. Gentle Orbiting Parallax on Hero Logo Pedestal
    const logoOrbit = document.querySelector(".sp-logo-orbit");
    if (logoOrbit) {
      window.addEventListener("mousemove", (e) => {
        if (isAnimOff() || window.innerWidth < 900) return;
        const nx = (e.clientX / window.innerWidth - 0.5) * 12;
        const ny = (e.clientY / window.innerHeight - 0.5) * 10;
        logoOrbit.style.setProperty("--px", `${nx.toFixed(1)}px`);
        logoOrbit.style.setProperty("--py", `${ny.toFixed(1)}px`);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", initHomeInteractions);
})();
