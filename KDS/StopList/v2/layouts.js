/* Реестр панели ревью (ds-review.js) — KDS/StopList.
   Прототип «КДС · Стоп-лист» (Jira PB-8111 «Дизайн: стоп-лист и остатки на кухонном
   экране WebKDS», рабочее ТЗ — pb8111-stoplist-tz.md, сценарии — приложение
   PB-8102-user-scenarios.md, полный текст в ТЗ).
   Один файл kds-stoplist-v2.html: экраны переключаются селектом «Экраны» через state
   (в контенте ссылок-переключателей нет — правило 19.10.2026). Демо-контента нет — только свои экраны.
   Порядок — по логике работы сотрудника: вход → список и его состояния →
   внесение новых позиций → массовые действия → очистка → смена выключена.
   19.11.2026 убраны экраны 4, 6, 7, 9, 10, 12, 16 и 17 — осталось 9 шагов.
   Число шагов = числу ключей SCREENS (9 = 9). */
window.dsLayouts = {
  проект: 'КДС · Стоп-лист · v2',
  /* КДС — фиксированный кухонный экран: селект «Размер» (1440/1024/375) не нужен,
     по контракту ДС «адаптив: false» секцию не выводит */
  адаптив: false,
  шаги: [
    { file: 'kds-stoplist-v2.html', state: 'base-noaccess', title: '1. Экран заказов · нет прав, кнопки входа нет' },
    { file: 'kds-stoplist-v2.html', state: 'base', title: '2. Экран заказов · вход в стоп-лист' },
    { file: 'kds-stoplist-v2.html', state: 'list-empty', title: '3. Стоп-лист пуст · ограничений нет' },
    { file: 'kds-stoplist-v2.html', state: 'add-row', title: '4. Добавить в стоп-лист · своя кнопка в каждой строке' },
    { file: 'kds-stoplist-v2.html', state: 'list-clean-copy', title: '5. Стоп-лист · панели раскрытия · рабочий вид' },
    { file: 'kds-stoplist-v2.html', state: 'list-clean-copy-2', title: '6. Стоп-лист · копия экрана 5' },
    { file: 'kds-stoplist-v2.html', state: 'multi-head', title: '7. Выбор позиций · действия в шапке' },
    { file: 'kds-stoplist-v2.html', state: 'multi-partial', title: '8. Массовое снятие · результат с пропуском' },
    { file: 'kds-stoplist-v2.html', state: 'clear-confirm', title: '9. Очистить стоп-лист · подтверждение' },
    { file: 'kds-stoplist-v2.html', state: 'shift-off', title: '10. Смена выключена · возврат к заказам' }
  ]
};
