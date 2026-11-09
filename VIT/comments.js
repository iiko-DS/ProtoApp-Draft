/* comments.js — комментарии к экрану прототипа (по образцу КДС: kds-stoplist.html / kds-combo.html).

   Кнопка и панель создаются один раз (position: fixed — доступны при любом скролле),
   содержимое привязано к текущему экрану: имя файла + query (state/menu/version…).
   Хранение — localStorage, ключ vitComments:v1 (у file:// и GitHub Pages это РАЗНЫЕ
   хранилища; между устройствами комментарии не синхронизируются).

   Подключение: <script src="../comments.js"></script> на страницах VIT. */
(function () {
  'use strict';

  var KEY = 'vitComments:v1';
  var HEADER = 'Комментарии · VIT «Баннеры и стикеры»';

  function store() {
    try { return JSON.parse(window.localStorage.getItem(KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function persist(all) {
    try { window.localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) {}
  }
  function screenId() {
    /* ?w=1440/1280/1024 — ширина кадра панели ревью, а не отдельный экран:
       комментарии должны быть одни и те же при смене ширины. */
    var q = (location.search || '').replace(/^\?/, '');
    var keep = [];
    if (q) {
      q.split('&').forEach(function (pair) {
        if (!pair) return;
        var key = pair.split('=')[0];
        if (key === 'w') return;
        keep.push(pair);
      });
    }
    keep.sort();
    return (location.pathname.split('/').pop() || 'page') + (keep.length ? '?' + keep.join('&') : '');
  }
  function screenLabel() {
    var label = document.title || screenId();
    var m = location.search.match(/[?&]state=([^&]*)/);
    if (m && m[1]) label += ' · ' + decodeURIComponent(m[1]);
    return label;
  }
  function list() {
    var rec = store()[screenId()];
    return rec && rec.items ? rec.items.slice() : [];
  }
  function stamp(ts) {
    var d = new Date(ts);
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return p(d.getDate()) + '.' + p(d.getMonth() + 1) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ── разметка панели (как в КДС) ─────────────────────────────────────────── */
  function panelHtml(id) {
    var items = list().map(function (c) {
      return '<li class="vit-cmt__i" data-cmt-id="' + esc(c.id) + '">' +
        '<span class="vit-cmt__t">' + esc(c.text) + '</span>' +
        '<span class="vit-cmt__time">' + stamp(c.ts) + '</span>' +
        '<button class="vit-cmt__del" type="button" data-cmt-del="' + esc(c.id) + '" title="Удалить"><span class="material-icons">close</span></button>' +
      '</li>';
    }).join('');
    var n = list().length;
    return '<div class="vit-cmt__head">Комментарии к экрану' +
        '<span class="vit-cmt__n' + (n ? '' : ' vit-cmt__n--zero') + '">' + n + '</span>' +
        '<button class="vit-cmt__copy" type="button" data-cmt-copy>Скопировать все</button>' +
        '<button class="vit-cmt__close" type="button" data-cmt-close title="Закрыть"><span class="material-icons">close</span></button>' +
      '</div>' +
      (items
        ? '<ul class="vit-cmt__list">' + items + '</ul>'
        : '<p class="vit-cmt__empty">Пока нет. Напиши замечание — оно сохранится в этом браузере.</p>') +
      '<div class="vit-cmt__add">' +
        '<textarea class="vit-cmt__input" data-cmt-input rows="2" placeholder="Замечание к экрану…"></textarea>' +
        '<button class="vit-cmt__send" type="button" data-cmt-send disabled>Добавить</button>' +
      '</div>' +
      '<p class="vit-cmt__hint">Хранится локально в этом браузере (localStorage) — на опубликованной странице и у коллег этих комментариев не будет. Ctrl+Enter — добавить.</p>';
  }

  function mount() {
    var id = screenId();
    var fab = document.getElementById('vitCmtFab');
    var panel = document.getElementById('vitCmtPanel');
    if (!fab) {
      fab = document.createElement('button');
      fab.id = 'vitCmtFab';
      fab.type = 'button';
      fab.className = 'vit-cmt-fab';
      fab.innerHTML = '<span class="material-icons">mode_comment</span><span class="vit-cmt-fab__n"></span>';
      document.body.appendChild(fab);
      fab.addEventListener('click', function () {
        panel.classList.toggle('is-open');
        if (panel.classList.contains('is-open')) {
          var ta = panel.querySelector('[data-cmt-input]');
          if (ta) ta.focus();
        }
      });
    }
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'vitCmtPanel';
      panel.className = 'vit-cmt-panel';
      document.body.appendChild(panel);
    }
    panel.setAttribute('data-cmt-screen', id);
    panel.innerHTML = panelHtml(id);
    var n = list().length;
    fab.querySelector('.vit-cmt-fab__n').textContent = n ? String(n) : '';
    fab.classList.toggle('has-cmt', !!n);
    fab.title = 'Комментарии к экрану' + (n ? ' (' + n + ')' : '');
  }

  function addComment() {
    var panel = document.getElementById('vitCmtPanel');
    if (!panel) return;
    var ta = panel.querySelector('[data-cmt-input]');
    var text = ((ta && ta.value) || '').trim();
    if (!text) return;
    var id = screenId();
    var all = store();
    var rec = all[id] || (all[id] = { label: screenLabel(), items: [] });
    rec.label = screenLabel();
    rec.items.push({ id: 'c' + Date.now() + Math.random().toString(36).slice(2, 6), text: text, ts: Date.now() });
    persist(all);
    mount();
    var p = document.getElementById('vitCmtPanel');
    if (p) p.classList.add('is-open');
    var t = p && p.querySelector('[data-cmt-input]');
    if (t) t.focus();
  }

  function copyFallback(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }
  function copyAll(btn) {
    var all = store();
    var ids = Object.keys(all).filter(function (k) { return all[k] && all[k].items && all[k].items.length; });
    var flash = function (msg) { if (!btn) return; var old = btn.textContent; btn.textContent = msg; setTimeout(function () { btn.textContent = old; }, 1600); };
    if (!ids.length) { flash('Пока пусто'); return; }
    ids.sort(function (a, b) { return (all[a].label || a).localeCompare(all[b].label || b, 'ru'); });
    var out = [HEADER, ''];
    ids.forEach(function (k, i) {
      out.push((i + 1) + '. ' + (all[k].label || k) + ' — ' + k);
      all[k].items.forEach(function (c) { out.push('   • ' + stamp(c.ts) + ' — ' + c.text); });
      out.push('');
    });
    var text = out.join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { flash('Скопировано'); }, function () { copyFallback(text); flash('Скопировано'); });
    } else {
      copyFallback(text);
      flash('Скопировано');
    }
  }

  /* ── стили (по образцу КДС) ──────────────────────────────────────────────── */
  function injectCss() {
    if (document.getElementById('vitCmtCss')) return;
    var s = document.createElement('style');
    s.id = 'vitCmtCss';
    s.textContent =
      '.vit-cmt-fab{position:fixed;right:20px;bottom:20px;z-index:70;display:inline-flex;align-items:center;gap:8px;' +
        'height:44px;padding:0 16px;border:1px solid #e0e0e0;border-radius:22px;background:#fff;color:#333;' +
        'box-shadow:0 2px 8px rgba(0,0,0,.12);font:500 14px/20px "Roboto",Arial,sans-serif;cursor:pointer;}' +
      '.vit-cmt-fab:hover{background:#f5f5f5;}' +
      '.vit-cmt-fab .material-icons{font-size:20px;}' +
      '.vit-cmt-fab.has-cmt{border-color:#448aff;color:#1565c0;}' +
      '.vit-cmt-fab__n:empty{display:none;}' +
      '.vit-cmt-fab__n{min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:#448aff;color:#fff;' +
        'font-size:12px;line-height:20px;text-align:center;}' +
      '.vit-cmt-panel{position:fixed;right:20px;bottom:76px;z-index:70;display:none;flex-direction:column;' +
        'width:360px;max-height:calc(100vh - 120px);padding:12px;border-radius:12px;background:#fff;' +
        'box-shadow:0 8px 24px rgba(0,0,0,.18);font-family:"Roboto","Helvetica Neue",Arial,sans-serif;}' +
      '.vit-cmt-panel.is-open{display:flex;}' +
      '.vit-cmt__head{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:500;line-height:20px;color:#333;margin:0 0 8px;}' +
      '.vit-cmt__n{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;' +
        'border-radius:10px;background:#e0e0e0;color:#616161;font-size:12px;line-height:20px;font-weight:500;}' +
      '.vit-cmt__n--zero{display:none;}' +
      '.vit-cmt__copy{margin-left:auto;height:28px;padding:0 10px;border:1px solid #e0e0e0;border-radius:8px;background:#fff;' +
        'font:500 12px/18px "Roboto",Arial,sans-serif;color:#333;cursor:pointer;}' +
      '.vit-cmt__copy:hover{background:#f5f5f5;}' +
      '.vit-cmt__close{flex:0 0 28px;width:28px;height:28px;padding:0;border:0;border-radius:6px;background:transparent;' +
        'color:#9e9e9e;cursor:pointer;display:flex;align-items:center;justify-content:center;}' +
      '.vit-cmt__close:hover{background:#f5f5f5;color:#333;}' +
      '.vit-cmt__close .material-icons{font-size:18px;}' +
      '.vit-cmt__list{list-style:none;margin:0 0 8px;padding:0 2px 0 0;display:flex;flex-direction:column;gap:4px;' +
        'overflow-y:auto;flex:1 1 auto;min-height:0;}' +
      '.vit-cmt__i{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-radius:8px;background:#f5f5f5;' +
        'font-size:14px;line-height:20px;color:#333;}' +
      '.vit-cmt__t{flex:1;min-width:0;white-space:pre-wrap;overflow-wrap:anywhere;}' +
      '.vit-cmt__time{flex:0 0 auto;font-size:12px;line-height:20px;color:#9e9e9e;white-space:nowrap;}' +
      '.vit-cmt__del{flex:0 0 24px;width:24px;height:24px;padding:0;border:0;border-radius:6px;background:transparent;' +
        'color:#9e9e9e;cursor:pointer;display:flex;align-items:center;justify-content:center;}' +
      '.vit-cmt__del:hover{background:#e0e0e0;color:#333;}' +
      '.vit-cmt__del .material-icons{font-size:16px;}' +
      '.vit-cmt__empty{font-size:14px;line-height:20px;color:#9e9e9e;margin:0 0 8px;}' +
      '.vit-cmt__add{display:flex;gap:8px;align-items:flex-start;}' +
      '.vit-cmt__input{flex:1;min-width:0;min-height:40px;max-height:120px;resize:vertical;padding:9px 12px;' +
        'border:1px solid #e0e0e0;border-radius:8px;background:#fff;font:400 14px/20px "Roboto",Arial,sans-serif;color:#333;}' +
      '.vit-cmt__input:focus{outline:none;border-color:#448aff;}' +
      '.vit-cmt__send{flex:0 0 auto;height:40px;padding:0 14px;border:0;border-radius:8px;background:#448aff;color:#fff;' +
        'font:500 14px/20px "Roboto",Arial,sans-serif;cursor:pointer;}' +
      '.vit-cmt__send:disabled{background:#e0e0e0;color:#9e9e9e;cursor:default;}' +
      '.vit-cmt__hint{font-size:11px;line-height:15px;color:#9e9e9e;margin:6px 0 0;}';
    (document.head || document.documentElement).appendChild(s);
  }

  /* ── обработчики — на документе: переживают перерисовки экрана ───────────── */
  function bind() {
    document.addEventListener('input', function (e) {
      var ta = e.target && e.target.closest ? e.target.closest('[data-cmt-input]') : null;
      if (!ta) return;
      var panel = ta.closest('.vit-cmt-panel');
      var btn = panel && panel.querySelector('[data-cmt-send]');
      if (btn) btn.disabled = !ta.value.trim();
    });
    document.addEventListener('keydown', function (e) {
      if (!(e.ctrlKey || e.metaKey) || e.key !== 'Enter') return;
      var ta = e.target && e.target.closest ? e.target.closest('[data-cmt-input]') : null;
      if (!ta) return;
      e.preventDefault();
      addComment();
    });
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var panel = t.closest('.vit-cmt-panel');
      if (!panel) return;
      if (t.closest('[data-cmt-close]')) { panel.classList.remove('is-open'); return; }
      if (t.closest('[data-cmt-send]')) { addComment(); return; }
      var del = t.closest('[data-cmt-del]');
      if (del) {
        var id = screenId();
        var all = store();
        var rec = all[id];
        if (!rec) return;
        rec.items = rec.items.filter(function (c) { return c.id !== del.getAttribute('data-cmt-del'); });
        if (!rec.items.length) delete all[id];
        persist(all);
        mount();
        var p = document.getElementById('vitCmtPanel');
        if (p) p.classList.add('is-open');
        return;
      }
      var cp = t.closest('[data-cmt-copy]');
      if (cp) copyAll(cp);
    });
    /* Esc закрывает панель комментариев */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var p = document.getElementById('vitCmtPanel');
      if (p) p.classList.remove('is-open');
    });
  }

  function init() {
    injectCss();
    mount();
    bind();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
