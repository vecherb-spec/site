(function () {
  const modal = document.getElementById("quizModal");
  if (!modal) return;

  const overlay = modal.querySelector(".quiz-modal__overlay");
  const dialog = modal.querySelector(".quiz-modal__dialog");
  const closeBtn = modal.querySelector(".quiz-modal__close");
  const form = modal.querySelector("#quizForm");
  const steps = Array.from(modal.querySelectorAll(".quiz-step"));
  const progressBar = modal.querySelector(".quiz-modal__progress-bar");
  const progressText = modal.querySelector(".quiz-modal__progress-text");
  const errorEl = modal.querySelector(".quiz-modal__error");
  const phoneInput = modal.querySelector("#quizPhone");

  let stepIndex = 0;
  let lastFocus = null;

  const eventLabels = {
    conference: "Конференция",
    concert: "Концерт",
    corporate: "Корпоратив",
    exhibition: "Выставка",
    wedding: "Свадьба / частное",
    other: "Другое",
  };

  const serviceLabels = {
    led: "LED-экран",
    sound: "Звук",
    light: "Свет",
    stage: "Сцена",
    content: "Видеоконтент",
    turnkey: "Техпродакшн под ключ",
  };

  const contactLabels = {
    telegram: "Telegram",
    max: "MAX",
    phone: "Звонок",
  };

  function setError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg || "";
    errorEl.hidden = !msg;
  }

  function updateProgress() {
    const total = steps.length;
    const current = stepIndex + 1;
    const pct = Math.round((current / total) * 100);
    if (progressBar) progressBar.style.width = pct + "%";
    if (progressText) progressText.textContent = "Шаг " + current + " из " + total;
    steps.forEach((el, i) => {
      el.hidden = i !== stepIndex;
      el.classList.toggle("is-active", i === stepIndex);
    });
    const back = modal.querySelector('[data-quiz-action="back"]');
    const next = modal.querySelector('[data-quiz-action="next"]');
    const skip = modal.querySelector('[data-quiz-action="skip"]');
    const submit = modal.querySelector('[data-quiz-action="submit"]');
    if (back) back.hidden = stepIndex === 0;
    if (next) next.hidden = stepIndex >= total - 1;
    if (skip) skip.hidden = stepIndex !== 3;
    if (submit) submit.hidden = stepIndex !== total - 1;
    setError("");
  }

  function openQuiz() {
    lastFocus = document.activeElement;
    stepIndex = 0;
    form.reset();
    updateProgress();
    modal.hidden = false;
    document.body.classList.add("quiz-open");
    closeBtn?.focus();
  }

  function closeQuiz() {
    modal.hidden = true;
    document.body.classList.remove("quiz-open");
    setError("");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function validateStep(index) {
    if (index === 0) {
      if (!form.querySelector('input[name="event_type"]:checked')) {
        setError("Выберите тип мероприятия.");
        return false;
      }
      return true;
    }
    if (index === 1) {
      if (form.querySelectorAll('input[name="services[]"]:checked').length === 0) {
        setError("Отметьте хотя бы одну услугу.");
        return false;
      }
      return true;
    }
    if (index === 2) {
      const city = form.querySelector("#quizCity");
      const date = form.querySelector("#quizDate");
      if (!city?.value.trim()) {
        setError("Укажите город проведения.");
        city?.focus();
        return false;
      }
      if (!date?.value.trim()) {
        setError("Укажите дату или период мероприятия.");
        date?.focus();
        return false;
      }
      return true;
    }
    if (index === 3) {
      return true;
    }
    if (index === 4) {
      const name = form.querySelector("#quizName");
      const phone = normalizePhone(phoneInput?.value || "");
      const contact = form.querySelector('input[name="contact_method"]:checked');
      const consent = form.querySelector("#quizConsent");
      if (!name?.value.trim()) {
        setError("Введите имя.");
        name?.focus();
        return false;
      }
      if (!isValidPhone(phone)) {
        setError("Введите телефон в формате +7 (XXX) XXX-XX-XX.");
        phoneInput?.focus();
        return false;
      }
      if (!contact) {
        setError("Выберите удобный способ связи.");
        return false;
      }
      if (!consent?.checked) {
        setError("Нужно согласие с политикой конфиденциальности.");
        consent?.focus();
        return false;
      }
      return true;
    }
    return true;
  }

  function normalizePhone(raw) {
    const digits = String(raw).replace(/\D/g, "");
    if (digits.length === 11 && digits[0] === "8") return "7" + digits.slice(1);
    if (digits.length === 10) return "7" + digits;
    return digits;
  }

  function isValidPhone(digits) {
    return /^7\d{10}$/.test(digits);
  }

  function formatPhoneInput(value) {
    let digits = value.replace(/\D/g, "");
    if (!digits) return "";
    if (digits[0] === "8") digits = "7" + digits.slice(1);
    if (digits[0] !== "7") digits = "7" + digits;
    digits = digits.slice(0, 11);
    let out = "+7";
    if (digits.length > 1) out += " (" + digits.slice(1, 4);
    if (digits.length >= 4) out += ") " + digits.slice(4, 7);
    if (digits.length >= 7) out += "-" + digits.slice(7, 9);
    if (digits.length >= 9) out += "-" + digits.slice(9, 11);
    return out;
  }

  phoneInput?.addEventListener("input", () => {
    const pos = phoneInput.selectionStart;
    phoneInput.value = formatPhoneInput(phoneInput.value);
    phoneInput.setSelectionRange(pos, pos);
  });

  phoneInput?.addEventListener("focus", () => {
    if (!phoneInput.value.trim()) phoneInput.value = "+7 ";
  });

  function collectPayload() {
    const eventType = form.querySelector('input[name="event_type"]:checked')?.value || "";
    const services = Array.from(form.querySelectorAll('input[name="services[]"]:checked')).map((el) => el.value);
    const city = form.querySelector("#quizCity")?.value.trim() || "";
    const date = form.querySelector("#quizDate")?.value.trim() || "";
    const scale = form.querySelector("#quizScale")?.value.trim() || "";
    const name = form.querySelector("#quizName")?.value.trim() || "";
    const phone = normalizePhone(phoneInput?.value || "");
    const contactMethod = form.querySelector('input[name="contact_method"]:checked')?.value || "";
    const honeypot = form.querySelector("#quizWebsite")?.value || "";
    return {
      event_type: eventType,
      event_type_label: eventLabels[eventType] || eventType,
      services,
      service_labels: services.map((s) => serviceLabels[s] || s),
      city,
      event_date: date,
      scale,
      name,
      phone: "+" + phone,
      contact_method: contactMethod,
      contact_method_label: contactLabels[contactMethod] || contactMethod,
      consent: true,
      company_website: honeypot,
      source_page: window.location.pathname || "/",
    };
  }

  async function submitQuiz() {
    if (!validateStep(4)) return;
    const submitBtn = modal.querySelector('[data-quiz-action="submit"]');
    submitBtn.disabled = true;
    setError("");
    const payload = collectPayload();
    try {
      const res = await fetch("/api/lead.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error || "Не удалось отправить заявку. Попробуйте позже или позвоните нам.");
        submitBtn.disabled = false;
        return;
      }
      sessionStorage.setItem(
        "leadDraft",
        JSON.stringify({
          name: payload.name,
          contact: payload.contact_method_label + ", " + payload.phone,
          message:
            "Тип: " +
            payload.event_type_label +
            "\nУслуги: " +
            payload.service_labels.join(", ") +
            "\nГород: " +
            payload.city +
            "\nДата: " +
            payload.event_date +
            (payload.scale ? "\nМасштаб: " + payload.scale : ""),
        })
      );
      document.dispatchEvent(new CustomEvent("medialive-quiz-submit", { detail: { source: "medialive_quiz" } }));
      window.location.href = "/thanks.html";
    } catch (e) {
      setError("Нет связи с сервером. Проверьте интернет или позвоните +7 (926) 335-39-35.");
      submitBtn.disabled = false;
    }
  }

  modal.addEventListener("click", (event) => {
    const action = event.target.closest("[data-quiz-action]");
    if (!action) return;
    const kind = action.getAttribute("data-quiz-action");
    if (kind === "close") {
      closeQuiz();
      return;
    }
    if (kind === "next") {
      if (!validateStep(stepIndex)) return;
      stepIndex = Math.min(stepIndex + 1, steps.length - 1);
      updateProgress();
      return;
    }
    if (kind === "back") {
      stepIndex = Math.max(stepIndex - 1, 0);
      updateProgress();
      return;
    }
    if (kind === "skip") {
      const scale = form.querySelector("#quizScale");
      if (scale) scale.value = "";
      stepIndex = 4;
      updateProgress();
      return;
    }
    if (kind === "submit") {
      event.preventDefault();
      submitQuiz();
    }
  });

  overlay?.addEventListener("click", closeQuiz);
  closeBtn?.addEventListener("click", closeQuiz);

  document.addEventListener("keydown", (event) => {
    if (modal.hidden) return;
    if (event.key === "Escape") closeQuiz();
  });

  document.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest && event.target.closest('a[href="#quiz"], [data-quiz-open]');
      if (!link) return;
      event.preventDefault();
      event.stopPropagation();
      openQuiz();
    },
    true
  );

  window.openMedialiveQuiz = openQuiz;
  updateProgress();
})();
