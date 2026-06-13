/* ============================================================
   ProphetWorks — script.js
   Vanilla JS only. No dependencies.

   Features:
   1. Sticky header style change on scroll
   2. Mobile navigation toggle
   3. Smooth-scroll for in-page nav links (+ close mobile menu)
   4. Reveal-on-scroll via IntersectionObserver
   5. Mouse-follow glow in the hero
   6. Staggered float animation for problem signal chips
   7. Count-up animation for the Opportunity Score
   ============================================================ */

(function () {
  "use strict";

  /* Respect reduced-motion preference for JS-driven motion */
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     1. STICKY HEADER — add .scrolled after a small offset
     ---------------------------------------------------------- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => {
    if (window.scrollY > 24) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ----------------------------------------------------------
     2. MOBILE NAV TOGGLE
     ---------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");

  const closeMobileNav = () => {
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    mobileNav.hidden = true;
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    mobileNav.hidden = !isOpen;
  });

  /* ----------------------------------------------------------
     3. SMOOTH SCROLL for same-page anchor links
     (native smooth-scroll handles most of it; here we also
      close the mobile menu and keep focus accessible)
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      closeMobileNav();
      target.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start",
      });
      // Move focus for keyboard users without an extra visual jump
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  /* ----------------------------------------------------------
     4. REVEAL ON SCROLL
     Adds .is-visible to .reveal elements as they enter view.
     Staggers siblings slightly for a polished cascade.
     ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");

  if (prefersReduced || !("IntersectionObserver" in window)) {
    // Fallback: show everything immediately
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          // Stagger based on position among reveal siblings in same parent
          const siblings = Array.from(el.parentElement.children).filter((c) =>
            c.classList.contains("reveal")
          );
          const index = siblings.indexOf(el);
          el.style.transitionDelay = Math.min(index, 6) * 80 + "ms";
          el.classList.add("is-visible");
          obs.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  /* ----------------------------------------------------------
     5. MOUSE-FOLLOW GLOW in the hero
     Moves the radial glow toward the cursor for a subtle
     "living" intelligence feel. Disabled for reduced motion.
     ---------------------------------------------------------- */
  const hero = document.getElementById("hero");
  const glow = document.getElementById("heroGlow");
  if (hero && glow && !prefersReduced) {
    hero.addEventListener("mousemove", (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      glow.style.left = x + "%";
      glow.style.top = y + "%";
    });
  }

  /* ----------------------------------------------------------
     6. STAGGER signal chips (problem section)
     Sets --i so each chip floats with a slight offset.
     ---------------------------------------------------------- */
  document.querySelectorAll(".signal-chips .chip").forEach((chip, i) => {
    chip.style.setProperty("--i", i);
  });

  /* ----------------------------------------------------------
     7. COUNT-UP for Opportunity Score
     Animates 0 -> data-count once the dashboard is visible.
     ---------------------------------------------------------- */
  const scoreEl = document.querySelector(".score-num[data-count]");
  if (scoreEl) {
    const target = parseInt(scoreEl.getAttribute("data-count"), 10) || 0;

    const runCount = () => {
      if (prefersReduced) {
        scoreEl.textContent = target;
        return;
      }
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3);
        scoreEl.textContent = Math.round(eased * target);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      const scoreObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              runCount();
              obs.disconnect();
            }
          });
        },
        { threshold: 0.5 }
      );
      scoreObserver.observe(scoreEl);
    } else {
      runCount();
    }
  }
})();
