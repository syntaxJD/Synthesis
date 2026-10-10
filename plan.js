// plan.js - trip budget calculator (functions, objects, arrays) + validated form
"use strict";

// Price data in GH cedis (estimates, per person unless noted)
const PRICES = {
  hotel: { budget: 250, standard: 550, luxury: 1200 }, // per room per night
  transport: { walk: 20, rideshare: 120, private: 350 }, // per day, per group
  food: 150, // per person per day
  activities: {
    jamestown: 10,
    independence: 0,
    nkrumah: 40,
    labadi: 30,
    makola: 0,
    aburi: 30,
  },
};

const form = document.getElementById("plan-form");
const out = {
  hotel: document.getElementById("out-hotel"),
  food: document.getElementById("out-food"),
  transport: document.getElementById("out-transport"),
  activities: document.getElementById("out-activities"),
  total: document.getElementById("out-total"),
  perPerson: document.getElementById("out-person"),
};

function money(n) {
  return "GH₵" + Math.round(n).toLocaleString();
}

function readInputs() {
  const checked = form.querySelectorAll('input[name="activity"]:checked');
  const activityIds = [];
  checked.forEach((c) => activityIds.push(c.value));
  return {
    days: Number(form.days.value) || 0,
    travellers: Number(form.travellers.value) || 0,
    hotel: form.hotel.value,
    transport: form.querySelector('input[name="transport"]:checked').value,
    activities: activityIds,
  };
}

function calculate(t) {
  const nights = Math.max(t.days - 1, 0);
  const rooms = Math.ceil(t.travellers / 2); // two people share a room
  const hotel = nights * rooms * PRICES.hotel[t.hotel];
  const food = t.days * t.travellers * PRICES.food;
  const transport = t.days * PRICES.transport[t.transport];

  let activities = 0;
  for (const id of t.activities) {
    activities += PRICES.activities[id] * t.travellers;
  }

  const total = hotel + food + transport + activities;
  return { hotel, food, transport, activities, total, perPerson: t.travellers ? total / t.travellers : 0 };
}

function updateBudget() {
  const trip = readInputs();
  if (trip.days < 1 || trip.travellers < 1) return;
  const r = calculate(trip);
  out.hotel.textContent = money(r.hotel);
  out.food.textContent = money(r.food);
  out.transport.textContent = money(r.transport);
  out.activities.textContent = money(r.activities);
  out.total.textContent = money(r.total);
  out.perPerson.textContent = money(r.perPerson);
}

// Validation
function setError(field, message) {
  const el = document.getElementById("err-" + field);
  if (el) el.textContent = message;
}

function validate() {
  let ok = true;
  const name = form.fullname.value.trim();
  const email = form.email.value.trim();
  const arrival = form.arrival.value;
  const trip = readInputs();

  setError("fullname", "");
  setError("email", "");
  setError("arrival", "");
  setError("days", "");
  setError("travellers", "");

  if (name.length < 2) { setError("fullname", "Please enter your name."); ok = false; }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setError("email", "Enter a valid email address."); ok = false; }

  const today = new Date().toISOString().split("T")[0];
  if (!arrival) { setError("arrival", "Choose an arrival date."); ok = false; }
  else if (arrival < today) { setError("arrival", "Arrival date cannot be in the past."); ok = false; }

  if (trip.days < 1 || trip.days > 14) { setError("days", "Choose between 1 and 14 days."); ok = false; }
  if (trip.travellers < 1 || trip.travellers > 10) { setError("travellers", "Choose between 1 and 10 travellers."); ok = false; }
  return ok;
}

form.addEventListener("input", updateBudget);
form.addEventListener("change", updateBudget);

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!validate()) return;

  const trip = readInputs();
  const result = calculate(trip);
  const plan = {
    name: form.fullname.value.trim(),
    email: form.email.value.trim(),
    arrival: form.arrival.value,
    trip: trip,
    total: result.total,
    saved: new Date().toLocaleString(),
  };
  saveStore("tripPlan", plan);
  showSaved(plan);
  form.reset();
  updateBudget();
});

function showSaved(plan) {
  const box = document.getElementById("saved-plan");
  if (!plan) { box.hidden = true; return; }
  box.hidden = false;
  box.innerHTML =
    "<strong>Saved plan for " + plan.name + "</strong><br>" +
    plan.trip.days + " days, " + plan.trip.travellers + " traveller(s), arriving " + plan.arrival +
    ". Estimated total: " + money(plan.total) + ". <br><small>Saved " + plan.saved + " in this browser.</small>";
}

// Set min date and show any earlier saved plan
form.arrival.min = new Date().toISOString().split("T")[0];
showSaved(loadStore("tripPlan", null));
updateBudget();
