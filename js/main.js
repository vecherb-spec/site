const header = document.getElementById("header");
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
const form = document.getElementById("contactForm");
const toast = document.getElementById("toast");
const year = document.getElementById("year");

if (year) {
  year.textContent = String(new Date().getFullYear());
}

const onScroll = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 8);
};

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const closeNav = () => {
  nav?.classList.remove("is-open");
  document.body.classList.remove("nav-open");
  burger?.setAttribute("aria-expanded", "false");
  burger?.setAttribute("aria-label", "Открыть меню");
};

burger?.addEventListener("click", () => {
  const open = !nav.classList.contains("is-open");
  nav.classList.toggle("is-open", open);
  document.body.classList.toggle("nav-open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeNav);
});

document.querySelectorAll(".tabs__btn").forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;
    document.querySelectorAll(".tabs__btn").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".equip-grid").forEach((panel) => {
      const active = panel.id === `panel-${tab}`;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  });
});

const showToast = (text) => {
  if (!toast) return;
  toast.textContent = text;
  toast.hidden = false;
  window.setTimeout(() => {
    toast.hidden = true;
  }, 4000);
};

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = form.elements.namedItem("name");
  const phone = form.elements.namedItem("phone");
  const type = form.elements.namedItem("event");
  const message = form.elements.namedItem("message");

  const fields = [name, phone];
  let valid = true;
  fields.forEach((field) => {
    const ok = Boolean(field.value.trim());
    field.classList.toggle("is-invalid", !ok);
    valid = valid && ok;
  });

  if (!valid) {
    showToast("Укажите имя и телефон");
    return;
  }

  const body = [
    `Имя: ${name.value.trim()}`,
    `Телефон: ${phone.value.trim()}`,
    `Тип: ${type.value || "не указан"}`,
    "",
    message.value.trim() || "Без описания",
  ].join("\n");

  const href = `mailto:info@medialive.ru?subject=${encodeURIComponent(
    "Заявка с сайта MediaLive"
  )}&body=${encodeURIComponent(body)}`;

  window.location.href = href;
  showToast("Черновик письма готов. Отправьте его из почтовой программы.");
  form.reset();
});
