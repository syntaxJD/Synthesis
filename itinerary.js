// itinerary.js - show/hide day details and expand/collapse all
"use strict";

const toggleButtons = document.querySelectorAll(".toggle-details");
const toggleAll = document.getElementById("toggle-all");

function setDetails(button, show) {
  const target = document.getElementById(button.getAttribute("aria-controls"));
  target.classList.toggle("show", show);
  button.setAttribute("aria-expanded", String(show));
  button.textContent = show ? "Hide details" : "Show details";
}

toggleButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    const show = btn.getAttribute("aria-expanded") !== "true";
    setDetails(btn, show);
  });
});

let allOpen = false;
toggleAll.addEventListener("click", function () {
  allOpen = !allOpen;
  toggleButtons.forEach((btn) => setDetails(btn, allOpen));
  toggleAll.textContent = allOpen ? "Collapse all days" : "Expand all days";
});
