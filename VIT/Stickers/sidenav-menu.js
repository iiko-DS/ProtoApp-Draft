/* Раздел сайдбара для прототипа «Киоски · Стикеры» (VIT/Stickers):
   у существующего «Администрирования» задаётся L2 с «Управление киосками» →
   «Баннеры» / «Стикеры» / «Группы». Подключается ДО connect.js
   (window.APP_SIDENAV_SECTION с тем же id заменяет раздел,
   APP_SIDENAV_OPEN открывает его при старте). */
(function () {
  'use strict';
  var page = (location.pathname.split('/').pop() || '').toLowerCase();
  var onStickers = page.indexOf('sticker') === 0 || page.indexOf('external-menu') === 0;

  window.APP_SIDENAV_SECTION = {
    id: 'admin',
    label: 'Администрирование',
    iconSvg: 'icon-admin.svg',
    l2: {
      title: 'Администрирование',
      items: [
        { label: 'Редактор схемы зала' },
        { label: 'Кассовые раскладки', arrow: 'down' },
        { group: true, label: 'Управление киосками', expanded: true, children: [
          { label: 'Баннеры', href: '../Banners/banners-spisok.html', selected: false },
          { label: 'Стикеры', href: 'stickers.html', selected: onStickers },
          { label: 'Группы', href: '../Banners/groups.html?state=list', selected: false },
          { label: 'Системные изображения' },
          { label: 'Главный экран' },
          { label: 'Системные настройки' },
          { label: 'Системные фразы и переводы' }
        ] },
        { label: 'Розничные продажи', arrow: 'down' }
      ]
    }
  };
  /* По умолчанию сайдбар свёрнут: панель раздела (L2) не открываем —
     только рейл с иконками; раздел открывается кликом по иконке. */
  window.APP_SIDENAV_OPEN = null;
})();
