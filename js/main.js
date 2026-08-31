const header = document.getElementById("header");
const burger = document.getElementById("burger");
const navMobile = document.getElementById("navMobile");
const catalogGrid = document.getElementById("catalogGrid");
const year = document.getElementById("year");

if (year) year.textContent = String(new Date().getFullYear());

window.addEventListener(
  "scroll",
  () => header?.classList.toggle("is-scrolled", window.scrollY > 40),
  { passive: true }
);

const closeMenu = () => {
  if (!navMobile) return;
  navMobile.hidden = true;
  burger?.setAttribute("aria-expanded", "false");
};

burger?.addEventListener("click", () => {
  const open = navMobile.hidden;
  navMobile.hidden = !open;
  burger.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href");
    const target = id && document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    closeMenu();
    target.scrollIntoView({ behavior: "smooth" });
  });
});

const renderCatalog = (id) => {
  const group = (window.CATALOG || []).find((item) => item.id === id);
  if (!catalogGrid || !group) return;
  catalogGrid.innerHTML = group.items
    .map(
      (item) => `
      <article class="equip">
        <div class="equip__media">
          ${item.photo ? `<img src="${item.photo}" alt="${item.name}" width="900" height="600" loading="lazy">` : ""}
          ${item.badge ? `<span class="equip__badge">${item.badge}</span>` : ""}
        </div>
        <h3>${item.name}</h3>
        <p>${item.spec}</p>
        <a href="#contact">Запросить цену <span aria-hidden="true">→</span></a>
      </article>`
    )
    .join("");
};

document.querySelectorAll(".tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tabs button").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    renderCatalog(button.dataset.tab);
  });
});

catalogGrid?.addEventListener("click", (event) => {
  const link = event.target.closest('a[href="#contact"]');
  if (!link) return;
  event.preventDefault();
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
});

renderCatalog("sound");

document.addEventListener("click", (event) => {
  const goalLink = event.target.closest("[data-goal]");
  if (goalLink && typeof window.trackGoal === "function") {
    window.trackGoal(goalLink.getAttribute("data-goal"));
  }
});

const cookieBar = document.getElementById("cookieBar");
const cookieOk = document.getElementById("cookieOk");
if (cookieBar && !localStorage.getItem("ml-cookie-ok")) {
  cookieBar.hidden = false;
}
cookieOk?.addEventListener("click", () => {
  localStorage.setItem("ml-cookie-ok", "1");
  if (cookieBar) cookieBar.hidden = true;
});

const leadForm = document.getElementById("leadForm");
leadForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const consent = document.getElementById("leadConsent");
  if (consent && !consent.checked) {
    consent.focus();
    return;
  }
  const name = document.getElementById("leadName")?.value.trim() || "";
  const contact = document.getElementById("leadContact")?.value.trim() || "";
  const message = document.getElementById("leadMessage")?.value.trim() || "";
  sessionStorage.setItem("leadDraft", JSON.stringify({ name, contact, message }));
  if (typeof window.trackGoal === "function") window.trackGoal("lead");
  window.location.href = "thanks.html";
});

const counters = document.querySelectorAll("[data-count]");
if (counters.length) {
  const animate = (el) => {
    const to = Number(el.dataset.count);
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / 1400, 1);
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => io.observe(el));
}
