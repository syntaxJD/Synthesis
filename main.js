// main.js - shared behaviour: mobile nav, dark mode, footer year
"use strict";

// Safe localStorage helpers (storage can be blocked)
function loadStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function saveStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* ignore */
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const navToggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");
  const themeBtn = document.getElementById("theme-toggle");

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  function applyTheme(dark) {
    document.body.classList.toggle("dark", dark);
    if (themeBtn) {
      themeBtn.setAttribute("aria-pressed", String(dark));
      themeBtn.textContent = dark ? "Light mode" : "Dark mode";
    }
  }
  applyTheme(loadStore("theme", "light") === "dark");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      const dark = !document.body.classList.contains("dark");
      applyTheme(dark);
      saveStore("theme", dark ? "dark" : "light");
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
