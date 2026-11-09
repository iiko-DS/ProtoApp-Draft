/* table-resize.js — изменение ширины колонок таблиц (эталон — Table_DS/demo.html, «All example»).

   Поведение как в ДС:
   • активные стыки — между колонками шапки (после чекбокс-ячейки линии нет — стык пропускается);
   • наведение у стыка В ПОЛОСЕ ШАПКИ — серая линия на всю высоту таблицы;
   • захват/перетаскивание — линия синяя (Divider/Hover);
   • тянем стык — меняется ширина колонки СЛЕВА от линии, минимум 60 px;
   • после первого перетаскивания все колонки фиксируются по пикселям, ширина строк =
     сумме колонок, поэтому таблица может прокручиваться по горизонтали (.tbl уже overflow-x:auto).

   Обвязка страниц: <script src="../table-resize.js"></script> — скрипт сам находит .tbl
   (в т.ч. появившиеся после перерисовки) и добавляет разделители. Классы страниц t-c-* /
   g-c-* / d-c-* / e-c-* используются как ключ колонки: это позволяет менять ширину и в строках
   с другим числом ячеек (групповые строки) и не сбивать служебные колонки (actions и т.п.). */
(function () {
  'use strict';

  var MIN = 60;                       /* минимум ширины колонки (как в ДС) */
  var HIT = 4;                        /* половина зоны захвата стыка, px */
  var SEP_CLASS = 'ds-col-resize';
  var state = new WeakMap();          /* root → { sig, frozen } */
  var saved = {};                     /* подпись колонок → { widths: {key: px}, total } */

  /* ── стили оверлея (один раз на страницу) ───────────────────────────────── */
  function injectCss() {
    if (document.getElementById('dsColResizeCss')) return;
    var s = document.createElement('style');
    s.id = 'dsColResizeCss';
    s.textContent =
      '.ds-col-resize{position:absolute;top:0;width:9px;display:none;pointer-events:none;z-index:30;}' +
      '.ds-col-resize.is-on{display:block;}' +
      '.ds-col-resize::after{content:"";position:absolute;left:4px;top:0;width:1px;height:100%;' +
        'background:var(--ds-color-stroke-default,#e0e0e0);}' +
      '.ds-col-resize.is-drag::after{background:var(--ds-color-divider-solid-hover-color,#448aff);}' +
      '.ds-col-resize__grab{position:absolute;left:0;top:0;width:100%;height:36px;' +
        'cursor:col-resize;pointer-events:auto;touch-action:none;}' +
      '.ds-col-resize-root{position:relative;}';
    (document.head || document.documentElement).appendChild(s);
  }

  /* ── утилиты ─────────────────────────────────────────────────────────────── */
  function keyOf(cell) {
    if (!cell) return '';
    for (var i = 0; i < cell.classList.length; i++) {
      var c = cell.classList[i];
      if (/^[a-z]+-c-[a-z0-9-]+$/.test(c)) return c;
    }
    return '';
  }
  function isVisible(el) {
    return !!el && el.offsetParent !== null;
  }
  function headerRow(root) {
    return root.querySelector('.ds-table-header-row');
  }
  function contentRows(root) {
    return [].slice.call(root.querySelectorAll('.ds-table-content-row'));
  }
  function allRows(root) {
    return [].slice.call(root.querySelectorAll('.ds-table-header-row, .ds-table-content-row'));
  }
  /* ячейка строки для колонки: сначала по классу колонки, иначе по позиции
     (только если в строке столько же ячеек, сколько в шапке) */
  function rowCell(row, key, index, headerCount) {
    if (key) {
      for (var i = 0; i < row.children.length; i++) {
        if (row.children[i].classList.contains(key)) return row.children[i];
      }
    }
    if (row.children.length === headerCount && row.children[index]) return row.children[index];
    return null;
  }
  function setWidth(cell, w) {
    if (!cell) return;
    cell.style.flex = '0 0 auto';
    cell.style.width = w + 'px';
    cell.style.minWidth = '0px';
  }
  function setRowWidth(root, total) {
    allRows(root).forEach(function (r) {
      r.style.width = total + 'px';
      r.style.minWidth = total + 'px';
    });
    /* панели-аккордеоны (баннеры) тянутся вместе со строками */
    [].slice.call(root.querySelectorAll('.exp-group')).forEach(function (p) {
      p.style.minWidth = total + 'px';
    });
  }
  function applyColumn(root, key, index, w) {
    var hr = headerRow(root);
    if (!hr) return;
    var hc = null;
    for (var i = 0; i < hr.children.length; i++) {
      if (key ? hr.children[i].classList.contains(key) : i === index) { hc = hr.children[i]; break; }
    }
    if (hc) setWidth(hc, w);
    var hcCount = hr.children.length;
    contentRows(root).forEach(function (r) {
      setWidth(rowCell(r, key, index, hcCount), w);
    });
  }

  /* подпись колонок таблицы — по ней находим все таблицы-панели одного экрана
     (аккордеоны в «Внешнем меню», панели меню в «Всё»): ресайз держит их в одной сетке */
  function signature(root) {
    var hr = headerRow(root);
    if (!hr) return '';
    return [].slice.call(hr.children).map(function (c, i) { return keyOf(c) || ('#' + i); }).join('|');
  }
  function rootsWithSig(sig) {
    if (!sig) return [];
    return [].slice.call(document.querySelectorAll('.tbl')).filter(function (r) {
      return signature(r) === sig;
    });
  }
  function applySaved(root, sig) {
    var s = saved[sig];
    if (!s) return;
    var hr = headerRow(root);
    if (!hr) return;
    [].slice.call(hr.children).forEach(function (c, i) {
      var key = keyOf(c) || ('#' + i);
      if (s.widths[key]) applyColumn(root, key, i, s.widths[key]);
    });
    if (s.total) setRowWidth(root, s.total);
  }

  /* ── инициализация конкретной таблицы ───────────────────────────────────── */
  function init(root) {
    if (root.__dsColResize) return;
    var hr = headerRow(root);
    if (!hr || hr.children.length < 2) return;
    root.__dsColResize = true;
    root.classList.add('ds-col-resize-root');
    var st = { sig: signature(root), frozen: false };
    state.set(root, st);
    /* уже меняли ширины этих колонок на странице — применить к новой таблице */
    if (saved[st.sig]) { st.frozen = true; applySaved(root, st.sig); }

    var sep = document.createElement('div');
    sep.className = SEP_CLASS;
    sep.setAttribute('aria-hidden', 'true');
    sep.innerHTML = '<span class="' + SEP_CLASS + '__grab"></span>';
    root.appendChild(sep);

    var active = null;
    var drag = null;
    var reapplying = false;

    function joints() {
      var h = headerRow(root);
      if (!h) return [];
      var rr = root.getBoundingClientRect();
      var cells = [].slice.call(h.children);
      var out = [];
      for (var i = 1; i < cells.length; i++) {
        var c = cells[i];
        var prev = cells[i - 1];
        if (!isVisible(c) || !isVisible(prev)) continue;
        /* после ячейки-чекбокса линии нет — стык неактивен (как в ДС) */
        if (prev.querySelector('input[type="checkbox"]')) continue;
        out.push({
          x: Math.round(c.getBoundingClientRect().left - rr.left + root.scrollLeft),
          prev: prev,
          index: i - 1,
          key: keyOf(prev)
        });
      }
      return out;
    }

    function show(j) {
      var h = headerRow(root);
      if (!h) return;
      sep.style.left = (j.x - 4) + 'px';
      sep.style.top = '0px';
      sep.style.height = Math.round(root.scrollHeight) + 'px';
      sep.querySelector('.' + SEP_CLASS + '__grab').style.height =
        Math.round(h.getBoundingClientRect().height) + 'px';
      sep.classList.add('is-on');
    }

    /* все колонки фиксируются по текущим пикселям; ширина строк = текущей ширине таблицы */
    function freeze() {
      if (st.frozen) return;
      var h = headerRow(root);
      if (!h) return;
      /* если контейнер таблицы не умел прокручиваться — включаем горизонтальную прокрутку:
         при увеличении колонки таблица шире карточки, как в эталонном «All example» */
      if (getComputedStyle(root).overflowX === 'visible') root.style.overflowX = 'auto';
      var widths = {};
      [].slice.call(h.children).forEach(function (c, i) {
        widths[keyOf(c) || ('#' + i)] = Math.round(c.getBoundingClientRect().width);
      });
      saved[st.sig] = { widths: widths, total: Math.round(h.getBoundingClientRect().width) };
      rootsWithSig(st.sig).forEach(function (r) { applySaved(r, st.sig); });
      st.frozen = true;
    }

    function applyStored() {
      if (!st.frozen) return;
      applySaved(root, st.sig);
    }

    root.addEventListener('pointermove', function (e) {
      if (drag) return;
      var h = headerRow(root);
      if (!h) return;
      var hr = h.getBoundingClientRect();
      /* линия — только у стыка в полосе ШАПКИ */
      if (e.clientY < hr.top || e.clientY > hr.bottom) {
        active = null;
        sep.classList.remove('is-on');
        return;
      }
      var rr = root.getBoundingClientRect();
      var x = e.clientX - rr.left + root.scrollLeft;
      var list = joints(), hit = null;
      for (var i = 0; i < list.length; i++) {
        if (Math.abs(x - list[i].x) <= HIT) { hit = list[i]; break; }
      }
      active = hit;
      if (hit) show(hit); else sep.classList.remove('is-on');
    });
    root.addEventListener('pointerleave', function () {
      if (!drag) { active = null; sep.classList.remove('is-on'); }
    });

    sep.addEventListener('pointerdown', function (e) {
      if (!active || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      freeze();
      var startX = e.clientX;
      var startW = active.prev.getBoundingClientRect().width;
      var sig = st.sig;
      var store = saved[sig];
      var startTotal = store ? store.total : Math.round(headerRow(root).getBoundingClientRect().width);
      var key = active.key, index = active.index, prev = active.prev;
      drag = true;
      sep.classList.add('is-drag');
      function onMove(ev) {
        var w = Math.max(MIN, Math.round(startW + ev.clientX - startX));
        if (!store) return;
        store.widths[key || ('#' + index)] = w;
        store.total = Math.max(MIN, Math.round(startTotal + (w - startW)));
        rootsWithSig(sig).forEach(function (r) { applySaved(r, sig); });
        var rr = root.getBoundingClientRect();
        sep.style.left = (Math.round(prev.getBoundingClientRect().right - rr.left + root.scrollLeft) - 4) + 'px';
      }
      function onUp() {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        sep.classList.remove('is-drag');
        drag = null;
        document.addEventListener('click', function (ce) {
          ce.stopPropagation();
          ce.preventDefault();
        }, { capture: true, once: true });   /* клик после ресайза — погасить */
      }
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });

    /* перерисовка строк/шапки внутри той же таблицы — вернуть сохранённые ширины */
    var mo = new MutationObserver(function () {
      if (reapplying || drag || !st.frozen) return;
      reapplying = true;
      requestAnimationFrame(function () {
        reapplying = false;
        applyStored();
      });
    });
    mo.observe(root, { childList: true, subtree: true });
    root.__dsColResizeRestore = applyStored;
  }

  /* ── поиск таблиц, в т.ч. появившихся после перерисовки страниц ──────────── */
  var scanScheduled = false;
  function scan() {
    scanScheduled = false;
    [].slice.call(document.querySelectorAll('.tbl')).forEach(init);
  }
  function scheduleScan() {
    if (scanScheduled) return;
    scanScheduled = true;
    requestAnimationFrame(scan);
  }

  function onReady() {
    injectCss();
    scan();
    if (window.MutationObserver) {
      new MutationObserver(scheduleScan).observe(document.body, { childList: true, subtree: true });
    }
    window.addEventListener('resize', function () {
      /* после пересчёта ширин страницей (fitColumns/fitTable) вернуть ширины пользователя */
      setTimeout(function () {
        Object.keys(saved).forEach(function (sig) {
          rootsWithSig(sig).forEach(function (r) { applySaved(r, sig); });
        });
      }, 0);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady);
  else onReady();
})();
