(function () {
  const id = Number(window.SITE && window.SITE.metrikaId);
  const verify = window.SITE && window.SITE.yandexVerification;

  if (verify) {
    const meta = document.createElement("meta");
    meta.name = "yandex-verification";
    meta.content = String(verify);
    document.head.appendChild(meta);
  }

  window.trackGoal = function (name, params) {
    if (!id || typeof window.ym !== "function") return;
    window.ym(id, "reachGoal", name, params);
  };

  document.addEventListener("click", (event) => {
    const goalLink = event.target.closest && event.target.closest("[data-goal]");
    if (!goalLink) return;
    window.trackGoal(goalLink.getAttribute("data-goal"));
  });

  document.addEventListener("marquiz-finish", (event) => {
    const marquizId = window.SITE && window.SITE.marquizId;
    const quizId = event.detail && event.detail.quizId;
    if (marquizId && quizId && String(quizId) !== String(marquizId)) return;
    window.trackGoal("quiz_submit", {
      source: "marquiz",
      quizId: quizId || marquizId || undefined,
    });
  });

  if (!id) return;

  (function (m, e, t, r, i, k, a) {
    m[i] =
      m[i] ||
      function () {
        (m[i].a = m[i].a || []).push(arguments);
      };
    m[i].l = 1 * new Date();
    for (var j = 0; j < document.scripts.length; j++) {
      if (document.scripts[j].src === r) return;
    }
    k = e.createElement(t);
    a = e.getElementsByTagName(t)[0];
    k.async = 1;
    k.src = r;
    a.parentNode.insertBefore(k, a);
  })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=" + encodeURIComponent(id), "ym");

  window.ym(id, "init", {
    ssr: true,
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
  });
})();
