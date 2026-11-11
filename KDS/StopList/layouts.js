/* Реестр панели ревью (ds-review.js) — KDS/StopList.
   Прототип «КДС · Стоп-лист» (Jira PB-8111 «Дизайн: стоп-лист и остатки на кухонном
   экране WebKDS», рабочее ТЗ — pb8111-stoplist-tz.md, сценарии — приложение
   PB-8102-user-scenarios.md, полный текст в ТЗ).
   Один файл kds-stoplist.html: экраны переключаются селектом «Экраны» через state
   (в контенте ссылок-переключателей нет — правило 19.10.2026). Демо-контента нет — только свои экраны.
   Порядок — по логике работы сотрудника: вход → список и его состояния → правка остатка →
   внесение новых позиций → массовые действия → очистка → смена выключена → постеры.
   Число шагов = числу ключей SCREENS (18 = 18). */
window.dsLayouts = {
  проект: 'КДС · Стоп-лист',
  /* КДС — фиксированный кухонный экран: селект «Размер» (1440/1024/375) не нужен,
     по контракту ДС «адаптив: false» секцию не выводит */
  адаптив: false,
  шаги: [
    { file: 'kds-stoplist.html', state: 'base-noaccess', title: '1. Экран заказов · нет прав, кнопки входа нет' },
    { file: 'kds-stoplist.html', state: 'base', title: '2. Экран заказов · вход в стоп-лист' },
    { file: 'kds-stoplist.html', state: 'list-empty', title: '3. Стоп-лист пуст · ограничений нет' },
    { file: 'kds-stoplist.html', state: 'add-fail', title: '4. Добавить в стоп-лист · часть позиций внести нельзя' },
    { file: 'kds-stoplist.html', state: 'add-multi', title: '5. Добавить в стоп-лист · несколько позиций (чекбоксы)' },
    { file: 'kds-stoplist.html', state: 'add-panel', title: '6. Добавить в стоп-лист · вариант 2: панель справа' },
    { file: 'kds-stoplist.html', state: 'list', title: '7. Стоп-лист и остатки · список заполнен' },
    { file: 'kds-stoplist.html', state: 'item-edit', title: '8. Остаток позиции · правка в строке' },
    { file: 'kds-stoplist.html', state: 'item-sizes', title: '9. Позиция с размерами · правка размера 25 см' },
    { file: 'kds-stoplist.html', state: 'item-sizes-by', title: '10. Позиция с размерами · правка размера 30 см' },
    { file: 'kds-stoplist.html', state: 'item-invalid', title: '11. Остаток позиции · некорректное значение' },
    { file: 'kds-stoplist.html', state: 'multi-head', title: '12. Выбор позиций · действия в шапке (вариант A)' },
    { file: 'kds-stoplist.html', state: 'multi-lock', title: '13. Выбор позиций · плашка внизу (вариант B)' },
    { file: 'kds-stoplist.html', state: 'multi-partial', title: '14. Массовое снятие · результат с пропуском' },
    { file: 'kds-stoplist.html', state: 'clear-confirm', title: '15. Очистить стоп-лист · подтверждение' },
    { file: 'kds-stoplist.html', state: 'shift-off', title: '16. Смена выключена · возврат к заказам' },
    { file: 'kds-stoplist.html', state: 'icons', title: '17. Постер · пиктограммы экрана (кандидаты)' },
    { file: 'kds-stoplist.html', state: 'rationale', title: '18. Постер · обоснование решений (6 решений)' }
  ]
};
