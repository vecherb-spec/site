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
    if (!id || id.startsWith("#popup:")) return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    closeMenu();
    target.scrollIntoView({ behavior: "smooth" });
  });
});

/**
 * Marquiz binds only links that exist at init. Catalog tabs replace innerHTML,
 * so new «Запросить цену» buttons have no listeners. Capture-phase delegation
 * opens the quiz on every tab and every button, including after tab switches.
 */
function openMarquiz(id) {
  if (window.Marquiz && typeof window.Marquiz.showModal === "function") {
    window.Marquiz.showModal(id);
    return;
  }
  let n = 0;
  const t = setInterval(() => {
    n += 1;
    if (window.Marquiz && typeof window.Marquiz.showModal === "function") {
      window.Marquiz.showModal(id);
      clearInterval(t);
    } else if (n > 50) {
      clearInterval(t);
    }
  }, 100);
}

document.addEventListener(
  "click",
  (event) => {
    const link = event.target.closest && event.target.closest('a[href^="#popup:marquiz_"]');
    if (!link) return;
    event.preventDefault();
    event.stopPropagation();
    const href = link.getAttribute("href") || "";
    const id = href.replace(/^#popup:marquiz_/, "");
    if (!id) return;
    openMarquiz(id);
  },
  true
);

const renderCatalog = (id) => {
  const group = (window.CATALOG || []).find((item) => item.id === id);
  if (!catalogGrid || !group) return;
  catalogGrid.innerHTML = group.items
    .map(
      (item) => `
      <article class="equip">
        <div class="equip__media">
          ${item.photo ? `<img src="${item.photo}" alt="${item.name}" width="1200" height="800" loading="lazy">` : ""}
          ${item.badge ? `<span class="equip__badge">${item.badge}</span>` : ""}
        </div>
        <h3>${item.name}</h3>
        <p>${item.spec}</p>
        <a href="#popup:marquiz_68663cff9e2f3a0019760c73">Запросить цену <span aria-hidden="true">→</span></a>
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
