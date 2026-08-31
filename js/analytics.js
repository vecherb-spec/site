(function () {
  const id = Number(window.SITE && window.SITE.metrikaId);
  const verify = window.SITE && window.SITE.yandexVerification;

  if (verify) {
    const meta = document.createElement("meta");
    meta.name = "yandex-verification";
    meta.content = String(verify);
    document.head.appendChild(meta);
  }

  window.trackGoal = function (name) {
    if (!id || typeof window.ym !== "function") return;
    window.ym(id, "reachGoal", name);
  };

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
  })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

  window.ym(id, "init", {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
  });
})();
