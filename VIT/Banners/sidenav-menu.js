/* Раздел сайдбара для прототипа «Киоски · Баннеры и группы»:
   у существующего «Администрирования» задаётся L2 с «Управление киосками» → «Баннеры» / «Группы».
   Подключается ДО connect.js (window.APP_SIDENAV_SECTION с тем же id заменяет раздел,
   APP_SIDENAV_OPEN открывает его при старте). */
(function () {
  'use strict';
  var page = (location.pathname.split('/').pop() || '').toLowerCase();
  var onGroups = page.indexOf('groups') === 0;   /* groups.html (список и форма) */

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
          { label: 'Баннеры', href: 'banners-spisok.html', selected: !onGroups },
          { label: 'Группы', href: 'groups.html?state=list', selected: onGroups },
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
