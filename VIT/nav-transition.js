/* nav-transition.js — мягкие переходы между страницами прототипа.
   Закрывает первый кадр загрузки (пока применяются шрифты/ширины колонок)
   и делает короткое затемнение перед переходом по ссылкам/табам.
   Подключение: <script src="../nav-transition.js"></script> на страницах VIT. */
(function () {
  'use strict';
  if (window.__dsNavTransition) return;
  /* встроенный экран 9 внутри карточки — у него своя мягкая отрисовка, вешалку не дублируем */
  if (/(?:^|[?&])embed=1(?:&|$)/.test(location.search)) return;
  window.__dsNavTransition = true;

  var BG = '#f5f5f5';
  var style = document.createElement('style');
  style.id = 'dsNavTransitionCss';
  style.textContent =
    '#dsNavVeil{position:fixed;inset:0;z-index:2147483000;background:' + BG + ';' +
      'opacity:1;pointer-events:none;transition:opacity .18s ease;}' +
    '#dsNavVeil.is-ready{opacity:0;}' +
    '@media (prefers-reduced-motion: reduce){#dsNavVeil{transition:none;}}';
  (document.head || document.documentElement).appendChild(style);

  var veil = document.createElement('div');
  veil.id = 'dsNavVeil';
  (document.body || document.documentElement).appendChild(veil);

  var revealed = false;
  function reveal() {
    if (revealed) return;
    revealed = true;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        veil.classList.add('is-ready');
      });
    });
  }

  /* ждём DOM и шрифты (шрифты меняют метрики таблиц/полей — без этого виден прыжок) */
  var domReady = document.readyState === 'loading'
    ? new Promise(function (res) { document.addEventListener('DOMContentLoaded', res, { once: true }); })
    : Promise.resolve();
  var fontsReady = (document.fonts && document.fonts.ready)
    ? document.fonts.ready.catch(function () {})
    : Promise.resolve();
  Promise.all([domReady, fontsReady]).then(reveal);
  setTimeout(reveal, 900);   /* страховка, если шрифты не загрузились */

  /* перед уходом — сразу закрываем кадр; новая страница откроется с той же завесой */
  window.addEventListener('pagehide', function () {
    revealed = true;
    veil.classList.remove('is-ready');
    veil.style.transition = 'none';
    veil.style.opacity = '1';
  });
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    revealed = false;
    veil.style.transition = '';
    veil.style.opacity = '';
    veil.classList.remove('is-ready');
    reveal();
  });

  /* переходы по data-go / ссылкам: короткое затемнение перед навигацией.
     Клик перехватывается в capture, чтобы не сработал второй обработчик. */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var el = e.target && e.target.closest ? e.target.closest('[data-go], a[href]') : null;
    if (!el) return;
    var href = el.getAttribute('data-go') || el.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(href)) return;
    if (el.target && el.target !== '' && el.target !== '_self') return;
    if (el.hasAttribute('download')) return;

    e.preventDefault();
    e.stopPropagation();
    revealed = true;
    veil.style.transition = '';
    veil.style.opacity = '1';
    setTimeout(function () { location.href = href; }, 120);
  }, true);
})();
