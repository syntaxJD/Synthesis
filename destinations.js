// destinations.js - loads destinations with Ajax (fetch), filters, searches, favourites
"use strict";

const grid = document.getElementById("dest-grid");
const statusEl = document.getElementById("status");
const searchBox = document.getElementById("search");
const filterButtons = document.querySelectorAll(".filter-btn");
const favList = document.getElementById("fav-list");

let destinations = [];
let currentCategory = "all";
let favourites = loadStore("favourites", []); // array of ids

// Ajax: try the JSON file first; fall back to built-in data (works on file://)
async function loadDestinations() {
  statusEl.textContent = "Loading destinations...";
  try {
    const response = await fetch("data/destinations.json");
    if (!response.ok) throw new Error("HTTP " + response.status);
    destinations = await response.json();
    statusEl.textContent = "";
  } catch (err) {
    destinations = window.FALLBACK_DESTINATIONS || [];
    statusEl.textContent =
      "Showing built-in data (could not load destinations.json). Run through XAMPP to use Ajax.";
  }
  render();
}

function matches(place) {
  const term = searchBox.value.trim().toLowerCase();
  const inCategory = currentCategory === "all" || place.category === currentCategory;
  const inSearch =
    term === "" ||
    place.name.toLowerCase().includes(term) ||
    place.summary.toLowerCase().includes(term);
  return inCategory && inSearch;
}

function formatCost(cost) {
  return cost === 0 ? "Free" : "GH₵" + cost;
}

function render() {
  grid.innerHTML = "";
  let shown = 0;

  for (const place of destinations) {
    if (!matches(place)) continue;
    shown++;

    const isFav = favourites.includes(place.id);
    const article = document.createElement("article");
    article.className = "card";

    const tipItems = place.tips.map((t) => "<li>" + t + "</li>").join("");
    article.innerHTML =
      '<figure><img src="' + place.image + '" alt="' + place.alt + '" loading="lazy" width="600" height="360">' +
      "<figcaption>" + place.area + "</figcaption></figure>" +
      '<div class="card-body">' +
      "<h3>" + place.name + "</h3>" +
      "<p>" + place.summary + "</p>" +
      '<ul class="meta"><li>' + place.category + "</li><li>" + formatCost(place.cost) +
      "</li><li>" + place.hours + " hr</li></ul>" +
      '<details><summary>Local tips</summary><ul>' + tipItems + "</ul></details>" +
      '<p><button class="fav-btn" data-id="' + place.id + '" aria-pressed="' + isFav + '">' +
      (isFav ? "★ Saved" : "☆ Save") + "</button></p></div>";
    grid.appendChild(article);
  }

  if (shown === 0) {
    grid.innerHTML = '<p class="notice">No destinations match your search.</p>';
  }
  renderFavourites();
}

function renderFavourites() {
  favList.innerHTML = "";
  if (favourites.length === 0) {
    favList.innerHTML = "<li>No saved places yet. Press Save on a card.</li>";
    return;
  }
  for (const id of favourites) {
    const place = destinations.find((p) => p.id === id);
    if (!place) continue;
    const li = document.createElement("li");
    li.textContent = place.name + " (" + formatCost(place.cost) + ")";
    favList.appendChild(li);
  }
}

function toggleFavourite(id) {
  const index = favourites.indexOf(id);
  if (index === -1) favourites.push(id);
  else favourites.splice(index, 1);
  saveStore("favourites", favourites);
  render();
}

// Events
grid.addEventListener("click", function (e) {
  const btn = e.target.closest(".fav-btn");
  if (btn) toggleFavourite(btn.dataset.id);
});

filterButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    currentCategory = btn.dataset.category;
    filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
    render();
  });
});

searchBox.addEventListener("input", render);

loadDestinations();
