// ---------- Content ----------
const CURRENCY = "₹";

const SERVICES = [
  {
    id: "quick",
    name: "Quick fix",
    price: 499,
    time: "30 min",
    description: "One problem, solved: a flat, a brake adjustment or a gear tweak."
  },
  {
    id: "tuneup",
    name: "Full tune-up",
    price: 1499,
    time: "90 min",
    description: "Brakes, gears, wheels and bearings checked and adjusted. Cleaned, lubed and test ridden."
  },
  {
    id: "overhaul",
    name: "Overhaul",
    price: 3499,
    time: "3 hours",
    description: "Stripped down and degreased, with new cables and housing and re-greased bearings."
  }
];

const SYMPTOMS = [
  {
    id: "skip",
    label: "Chain skips",
    title: "Worn chain or cassette",
    detail: "We measure chain stretch, replace the chain if needed, and check the gear cogs for wear.",
    service: "tuneup"
  },
  {
    id: "squeal",
    label: "Brakes squeal",
    title: "Glazed pads or dirty rims",
    detail: "We clean the braking surface, sand or replace the pads, and centre the brake.",
    service: "quick"
  },
  {
    id: "flat",
    label: "Flat tyre",
    title: "Puncture or worn tube",
    detail: "We find the cause, fit a new tube and check the tyre for embedded glass or thorns.",
    service: "quick"
  },
  {
    id: "shift",
    label: "Gears won't shift",
    title: "Stretched cable or bent hanger",
    detail: "We re-index the gears, replace cables if frayed, and straighten the derailleur hanger.",
    service: "quick"
  },
  {
    id: "wobble",
    label: "Wheel wobbles",
    title: "Loose spokes or worn bearings",
    detail: "We true the wheel, tension the spokes, and check the hub bearings for play.",
    service: "tuneup"
  },
  {
    id: "old",
    label: "Hasn't been ridden in ages",
    title: "General ageing",
    detail: "Rust, dry lube and perished tyres add up. A full overhaul gets it road-ready again.",
    service: "overhaul"
  }
];

// ---------- Helpers ----------
const $ = (selector) => document.querySelector(selector);
const money = (n) => CURRENCY + n.toLocaleString("en-IN");
const serviceById = (id) => SERVICES.find((s) => s.id === id);

// ---------- Symptom picker ----------
const symptomsEl = $("#symptoms");
const resultEl = $("#result");

SYMPTOMS.forEach((symptom) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "symptom";
  btn.textContent = symptom.label;
  btn.setAttribute("aria-pressed", "false");
  btn.dataset.id = symptom.id;
  symptomsEl.appendChild(btn);
});

symptomsEl.addEventListener("click", (event) => {
  const btn = event.target.closest(".symptom");
  if (!btn) return;

  symptomsEl.querySelectorAll(".symptom").forEach((b) => {
    b.setAttribute("aria-pressed", String(b === btn));
  });

  const symptom = SYMPTOMS.find((s) => s.id === btn.dataset.id);
  const service = serviceById(symptom.service);

  resultEl.innerHTML = `
    <h3>${symptom.title}</h3>
    <p>${symptom.detail}</p>
    <p class="result-meta">
      <strong>${money(service.price)}</strong>
      <span>${service.time}</span>
      <span>${service.name}</span>
    </p>
    <a class="btn btn-small" href="#book" data-service="${service.id}">Book this fix</a>
  `;
  resultEl.classList.remove("is-new");
  void resultEl.offsetWidth; // restart the animation
  resultEl.classList.add("is-new");
});

// Prefill the form when "Book this fix" is used
resultEl.addEventListener("click", (event) => {
  const link = event.target.closest("[data-service]");
  if (link) serviceSelect.value = link.dataset.service;
});

// ---------- Price list ----------
const priceList = $("#price-list");
SERVICES.forEach((service) => {
  const li = document.createElement("li");
  li.className = "price-row";
  li.innerHTML = `
    <h3>${service.name}</h3>
    <p>${service.description}</p>
    <div class="price">${money(service.price)}<span class="time">${service.time}</span></div>
  `;
  priceList.appendChild(li);
});

// ---------- Booking form ----------
const form = $("#book-form");
const serviceSelect = $("#service");
const dateInput = $("#date");
const confirmation = $("#confirmation");

serviceSelect.innerHTML =
  `<option value="">Choose a service</option>` +
  SERVICES.map((s) => `<option value="${s.id}">${s.name} (${money(s.price)})</option>`).join("");

// No dates in the past
dateInput.min = new Date().toISOString().split("T")[0];

const validators = {
  name: (v) => (v.trim().length >= 2 ? "" : "Enter your name."),
  phone: (v) => (/^[+\d][\d\s-]{7,14}$/.test(v.trim()) ? "" : "Enter a phone number we can reach, like 98765 43210."),
  area: (v) => (v.trim().length >= 2 ? "" : "Enter the area where the bike is."),
  service: (v) => (v ? "" : "Choose a service."),
  date: (v) => (v ? "" : "Pick a date.")
};

function showError(field, message) {
  const input = form.elements[field];
  const errorEl = form.querySelector(`[data-error-for="${field}"]`);
  errorEl.textContent = message;
  input.setAttribute("aria-invalid", message ? "true" : "false");
  if (message) input.setAttribute("aria-describedby", errorEl.id || (errorEl.id = `${field}-error`));
}

Object.keys(validators).forEach((field) => {
  form.elements[field].addEventListener("blur", () => {
    showError(field, validators[field](form.elements[field].value));
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  let firstInvalid = null;
  Object.keys(validators).forEach((field) => {
    const message = validators[field](form.elements[field].value);
    showError(field, message);
    if (message && !firstInvalid) firstInvalid = form.elements[field];
  });

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  const service = serviceById(form.elements.service.value);
  const date = new Date(form.elements.date.value + "T00:00");
  const prettyDate = date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  // This is where you'd send the data to your backend, e.g. fetch("/api/bookings", { ... })
  confirmation.hidden = false;
  confirmation.innerHTML = `
    <h3>Request received</h3>
    <p>${service.name} on ${prettyDate}. We'll message ${form.elements.phone.value.trim()} within 30 minutes to confirm your slot.</p>
  `;
  confirmation.focus?.();
  form.reset();
  confirmation.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

// ---------- Footer ----------
$("#year").textContent = new Date().getFullYear();
