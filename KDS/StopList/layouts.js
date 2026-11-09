/* Реестр панели ревью (ds-review.js) — KDS/StopList.
   Прототип «КДС · Стоп-лист» (Jira PB-8111 «Дизайн: стоп-лист и остатки на кухонном
   экране WebKDS», рабочее ТЗ — pb8111-stoplist-tz.md, сценарии — приложение
   PB-8102-user-scenarios.md, полный текст в ТЗ).
   Один файл kds-stoplist.html: экраны переключаются селектом «Экраны» через state
   (в контенте ссылок-переключателей нет — правило 19.10.2026). Демо-контента нет — только свои экраны.
   Порядок — по таблице §6 ТЗ; число шагов = числу ключей SCREENS (18 = 18). */
window.dsLayouts = {
  проект: 'КДС · Стоп-лист',
  адаптив: true,
  шаги: [
    { file: 'kds-stoplist.html', state: 'base', title: 'База · экран повара + кнопка «Стоп-лист»' },
    { file: 'kds-stoplist.html', state: 'base-noaccess', title: 'Без доступа · кнопки входа нет' },
    { file: 'kds-stoplist.html', state: 'list', title: 'Стоп-лист · список позиций' },
    { file: 'kds-stoplist.html', state: 'list-empty', title: 'Стоп-лист · ограничений нет' },
    { file: 'kds-stoplist.html', state: 'excluded', title: 'Стоп-лист · позиция исключена из меню' },
    { file: 'kds-stoplist.html', state: 'item-edit', title: 'Позиция · панель остатка' },
    { file: 'kds-stoplist.html', state: 'item-sizes', title: 'Позиция с размерами · уровень «Всё блюдо»' },
    { file: 'kds-stoplist.html', state: 'item-sizes-by', title: 'Позиция с размерами · уровень «Размеры»' },
    { file: 'kds-stoplist.html', state: 'item-invalid', title: 'Позиция · некорректный остаток' },
    { file: 'kds-stoplist.html', state: 'item-nodata', title: 'Стоп-лист · нет данных об остатке' },
    { file: 'kds-stoplist.html', state: 'add', title: 'Добавить в стоп-лист · список позиций' },
    { file: 'kds-stoplist.html', state: 'add-fail', title: 'Добавить в стоп-лист · отказ с причиной' },
    { file: 'kds-stoplist.html', state: 'multi', title: 'Стоп-лист · режим выбора' },
    { file: 'kds-stoplist.html', state: 'multi-partial', title: 'Массовое снятие · результат с пропуском' },
    { file: 'kds-stoplist.html', state: 'clear-confirm', title: 'Очистить стоп-лист · подтверждение' },
    { file: 'kds-stoplist.html', state: 'shift-off', title: 'Смена выключена · возврат к заказам' },
    { file: 'kds-stoplist.html', state: 'icons', title: 'Постер · пиктограммы (кандидаты)' },
    { file: 'kds-stoplist.html', state: 'rationale', title: 'Постер · обоснование решений' }
  ]
};
