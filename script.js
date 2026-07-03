/* Alex Mercer — portfolio. Tiny, dependency-free enhancements. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* current year in footer */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* neutralise placeholder links so nothing 404s during preview */
  document.querySelectorAll('a[data-noop]').forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); });
  });

  /* ---- typewriter tagline (the one deliberate animated moment) ---- */
  var typeEl = document.querySelector(".type");
  if (typeEl) {
    var full = typeEl.getAttribute("data-type") || "";
    if (reduceMotion) {
      typeEl.textContent = full;
    } else {
      var i = 0;
      typeEl.textContent = "";
      var tick = function () {
        if (i <= full.length) {
          typeEl.textContent = full.slice(0, i);
          i++;
          // slight rhythm variation so it reads like typing, not a metronome
          setTimeout(tick, 26 + Math.random() * 42);
        }
      };
      // let the page settle first
      setTimeout(tick, 480);
    }
  }

  /* ---- scroll reveal for sections ---- */
  var revealables = document.querySelectorAll(".section, .hero__cta");
  revealables.forEach(function (el) { el.classList.add("reveal"); });

  if (!reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- active section in nav ---- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function (a) {
            a.setAttribute("aria-current", a.getAttribute("href") === "#" + id ? "true" : "false");
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }
})();
