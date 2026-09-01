import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getDatabase, ref, onValue, get, set } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { firebaseConfig, DEFAULT_SCHEDULE_PATH, SCHEDULE_PATH_BY_UID } from './firebase-config.js';

(function () {
  'use strict';
  // build check: af152d1 follow-up

  // Seed data written to the database ONCE, and only if an explicit get()
  // check proves the node is genuinely empty AND has no /schedule/_seeded
  // flag (see seedIfEmpty). It is never used as live state and never written
  // on a normal load. Schema: { categories, events, nameColors }.
  var DEFAULT_STATE = {
    "categories": [
      { "id": "cat-class", "name": "Занятие", "color": "#4f6bff", "isClass": true },
      { "id": "cat-pair", "name": "Пара", "color": "#6b7280", "isClass": true },
      { "id": "cat-other", "name": "Дело", "color": "#ffab40", "isClass": false }
    ],
    "events": [
      { "id": "eafeaa48-f6bd-48c3-bfef-afdfb6dd31a3", "title": "Спецкурс — Бычков", "day": 0, "start": 650, "end": 745, "categoryId": "cat-pair", "notes": "С/К по выбору · ауд. Ц-75 · доц. Бычков М. Е., асп. Сторожева К. Д." },
      { "id": "29e99eec-2747-420a-b8fd-a356c2a4b645", "title": "Философские вопросы естествознания", "day": 0, "start": 810, "end": 905, "categoryId": "cat-pair", "notes": "ауд. 5-51 · доц. Эрекаев В. Д." },
      { "id": "420179ee-64de-44b6-ad05-3e556d87af60", "title": "ФТД — Шугаев", "day": 0, "start": 920, "end": 1015, "categoryId": "cat-pair", "notes": "ФТД · ауд. Каф. · проф. Шугаев Ф. В." },
      { "id": "d7f3b884-1c3c-4621-9e8f-c19d2d958724", "title": "Спецкурс — Дергачёв", "day": 0, "start": 1025, "end": 1120, "categoryId": "cat-pair", "notes": "С/К по выбору · ауд. Ц-75 · асс. Дергачёв М. А." },
      { "id": "7495686e-3d37-41a0-b181-229ad7b16283", "title": "Дисц. спец. — Николаев", "day": 1, "start": 540, "end": 745, "categoryId": "cat-pair", "notes": "Д/С · ауд. Ц-75 · проф. Николаев П. Н. (2 пары)" },
      { "id": "2feebb9f-4392-47ac-be42-d390336df917", "title": "Дисц. спец. — Коваль", "day": 1, "start": 810, "end": 1015, "categoryId": "cat-pair", "notes": "Д/С · ауд. Ц-75 · доц. Коваль Г. В. (2 пары)" },
      { "id": "40b6351a-1e49-4d73-9e0d-f321c9cca8c5", "title": "Психология", "day": 1, "start": 1025, "end": 1120, "categoryId": "cat-pair", "notes": "ауд. им. Хохлова · ст. преп. Стрельников С. В." },
      { "id": "1b51a499-a6f0-4f01-8e18-dcc108c35434", "title": "История России", "day": 2, "start": 540, "end": 745, "categoryId": "cat-pair", "notes": "ауд. 5-19 · н. с. Князев П. Ю." },
      { "id": "ad1def6a-f5df-4bde-95ce-0c62d8a684df", "title": "Межфакультетский курс", "day": 2, "start": 910, "end": 1130, "categoryId": "cat-pair", "notes": "15:10–18:50 · межфакультетские курсы" },
      { "id": "7c38c119-71bd-4eda-a1f6-6ceeab89e6c8", "title": "Военная подготовка", "day": 3, "start": 540, "end": 1015, "categoryId": "cat-pair", "notes": "9:00–16:55" },
      { "id": "5eb7325a-6ced-4a67-84f8-42ed0c113335", "title": "Спецкурс — Савченко", "day": 3, "start": 1025, "end": 1120, "categoryId": "cat-pair", "notes": "С/К по выбору · ауд. Каф. · проф. Савченко А. М." },
      { "id": "033d1779-24bc-43fa-a28c-b51f1b82f006", "title": "Дисц. спец. — Савченко", "day": 4, "start": 650, "end": 745, "categoryId": "cat-pair", "notes": "Д/С · ауд. Ц-75 · проф. Савченко А. М." },
      { "id": "b75a9735-5342-4aad-bf4e-9bf6e2324ed8", "title": "Педагогика", "day": 4, "start": 810, "end": 905, "categoryId": "cat-pair", "notes": "ауд. им. Хохлова · Крашенниников Е. Е." },
      { "id": "b277b515-8d1c-438a-ae6f-53934206828f", "title": "Правоведение", "day": 4, "start": 920, "end": 1015, "categoryId": "cat-pair", "notes": "ауд. им. Хохлова · доц. Долганин А. А." },
      { "id": "0e22b51f-44f0-49c7-a0ef-f3e7b25e10fc", "title": "Общие вопросы преподавания физ.-мат. дисциплин", "day": 4, "start": 1025, "end": 1120, "categoryId": "cat-pair", "notes": "ауд. СФА · доц. Рыжиков С. Б." },
      { "id": "5c71b700-673f-42b8-9358-33b542c42026", "title": "ФТД — Власов", "day": 5, "start": 540, "end": 635, "categoryId": "cat-pair", "notes": "ФТД · ауд. Ц-75 · вед. н. с. Власов А. А." },
      { "id": "247a72a3-ea0a-4fb6-b555-87a1dce65360", "title": "Спецкурс — Боголюбов", "day": 5, "start": 650, "end": 745, "categoryId": "cat-pair", "notes": "С/К по выбору · ауд. Ц-75 · проф. Боголюбов Н. Н." },
      { "id": "62618f89-3512-4f71-aedc-3c2b8e4fa672", "title": "Философские вопросы естествознания", "day": 5, "start": 810, "end": 905, "categoryId": "cat-pair", "notes": "ауд. 5-19 · проф. Яковлев В. А." },
      { "id": "09c668c1-d1a5-4a88-903e-625586ead0de", "title": "Дисц. спец. — Савченко", "day": 5, "start": 1025, "end": 1120, "categoryId": "cat-pair", "notes": "Д/С · ауд. Каф. · проф. Савченко А. М." }
    ],
    "nameColors": {
      "Спецкурс — Бычков": "#6b7280",
      "Философские вопросы естествознания": "#6b7280",
      "ФТД — Шугаев": "#6b7280",
      "Спецкурс — Дергачёв": "#6b7280",
      "Дисц спец — Николаев": "#6b7280",
      "Дисц спец — Коваль": "#6b7280",
      "Психология": "#6b7280",
      "История России": "#6b7280",
      "Межфакультетский курс": "#6b7280",
      "Военная подготовка": "#6b7280",
      "Спецкурс — Савченко": "#6b7280",
      "Дисц спец — Савченко": "#6b7280",
      "Педагогика": "#6b7280",
      "Правоведение": "#6b7280",
      "Общие вопросы преподавания физ -мат дисциплин": "#6b7280",
      "ФТД — Власов": "#6b7280",
      "Спецкурс — Боголюбов": "#6b7280"
    }
  };

  var DAY_START = 6 * 60, DAY_END = 24 * 60;
  // Серый цвет категории «Пара» и всех исходных пар расписания 507.
  var PAIR_COLOR = '#6b7280';
  var GAP_ROW_HEIGHT = 8, PX_PER_MIN = 1.1, MIN_CONTENT_HEIGHT = 30;
  var SNAP = 15, MIN_DURATION = 15;
  var DAY_NAMES = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  var DAY_SHORT_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  var MOBILE_BREAKPOINT = '(max-width: 700px)';
  function isMobileViewport() { return !!(window.matchMedia && window.matchMedia(MOBILE_BREAKPOINT).matches); }
  function todayDayIndex() { return (new Date().getDay() + 6) % 7; }
  var mobileActiveDay = todayDayIndex();

  var NAME_PALETTE = [
    '#4f6bff', '#e5484d', '#30a46c', '#8e4ec6', '#0891b2', '#e93d82',
    '#65a30d', '#d97706', '#6366f1', '#0d9488', '#c026d3', '#a16207',
    '#475569', '#7c3aed', '#0284c7', '#be123c', '#4d7c0f', '#b45309',
    '#4338ca', '#ffab40'
  ];

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  var gridEl = document.getElementById('schedule-grid');
  // Live state starts EMPTY (only the base categories, so the <select>s work).
  // Nothing is shown or written until the first onValue() snapshot arrives —
  // this is what prevents DEFAULT_STATE from ever overwriting real data.
  var state = { categories: clone(DEFAULT_STATE.categories), events: [], nameColors: {} };
  var editingId = null;
  // Занятия, выделенные кликом в «Ленте времени» — для групповых действий (панель сбоку).
  var selectedIds = new Set();
  // Which layout the board shows: 'timeline' (the proportional day columns)
  // or 'matrix' (a days×names table with just the times in the cells).
  var currentView = 'timeline';
  // Starts read-only: editing unlocks only once Firebase Auth reports a
  // signed-in user (see onAuthStateChanged in connectFirebase).
  var isReadOnly = true;
  var currentLayout = null;

  // Firebase wiring.
  var dbInstance = null;
  var scheduleRef = null;
  var scheduleUnsub = null;   // detaches the current onValue(scheduleRef)
  var activePath = null;      // the RTDB node the board is currently bound to
  var authInstance = null;
  var currentUser = null;
  var stateLoaded = false;    // first onValue() snapshot from the server has arrived
  var seedChecked = false;    // the one-time "is the DB empty?" get() check has run
  var pairPresetChecked = false; // the one-time "переведи исходные пары в «Пара»" pass has run
  var isConnected = false;
  var pendingWrite = false;   // a local mutation is waiting for its debounced write
  var syncTimer = null;
  var isInteracting = false;  // a drag/resize gesture is in progress
  var pendingRemote = null;   // remote snapshot received mid-gesture, applied on release

  function uid() {
    return (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2));
  }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function snap(min) { return Math.round(min / SNAP) * SNAP; }
  function parseTime(str) { var p = str.split(':'); return Number(p[0]) * 60 + Number(p[1]); }
  function formatTime(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }
  function getCategory(id) { return state.categories.find(function (c) { return c.id === id; }) || state.categories[0]; }

  // Time shown in a matrix cell: only the start if the event lasts exactly one
  // hour, otherwise "start-end" (e.g. "12:00-13:30").
  function formatCellTime(ev) {
    return (ev.end - ev.start === 60)
      ? formatTime(ev.start)
      : formatTime(ev.start) + '-' + formatTime(ev.end);
  }

  // The nameColors map is keyed by the (trimmed) title, but Realtime Database
  // keys can't contain . # $ / [ ] or control characters. Names pasted from
  // Google Sheets routinely have dots or slashes ("А. Иванов", "10.А"), which
  // would make set() throw and silently abort the whole write. sanitizeName()
  // strips exactly those characters — the event keeps its own real title.
  function nameKey(title) {
    return sanitizeName(title) || '—';
  }
  function getNameColor(title) {
    return (state.nameColors && state.nameColors[nameKey(title)]) || NAME_PALETTE[0];
  }
  function ensureNameColor(title) {
    var key = nameKey(title);
    if (!state.nameColors) state.nameColors = {};
    if (state.nameColors[key]) return state.nameColors[key];
    var color = NAME_PALETTE[Object.keys(state.nameColors).length % NAME_PALETTE.length];
    state.nameColors[key] = color;
    return color;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  var DAY_ALIASES = [
    { day: 0, names: ['понедельник', 'пн', 'mon', 'monday'] },
    { day: 1, names: ['вторник', 'вт', 'tue', 'tues', 'tuesday'] },
    { day: 2, names: ['среда', 'ср', 'wed', 'wednesday'] },
    { day: 3, names: ['четверг', 'чт', 'thu', 'thur', 'thursday'] },
    { day: 4, names: ['пятница', 'пт', 'fri', 'friday'] },
    { day: 5, names: ['суббота', 'сб', 'sat', 'saturday'] },
    { day: 6, names: ['воскресенье', 'вс', 'sun', 'sunday'] }
  ];

  function matchDayName(cell) {
    var norm = (cell || '').trim().toLowerCase().replace(/[.,]+$/, '');
    if (!norm) return null;
    for (var i = 0; i < DAY_ALIASES.length; i++) if (DAY_ALIASES[i].names.indexOf(norm) !== -1) return DAY_ALIASES[i].day;
    for (var j = 0; j < DAY_ALIASES.length; j++) {
      var names = DAY_ALIASES[j].names;
      for (var k = 0; k < names.length; k++) if (names[k].length >= 3 && norm.indexOf(names[k]) === 0) return DAY_ALIASES[j].day;
    }
    return null;
  }

  function parseSingleTime(s) {
    if (!s) return null;
    var m = s.trim().match(/^(\d{1,2})[:.\sч]*(\d{2})?/);
    if (!m) return null;
    var h = Number(m[1]);
    var min = m[2] ? Number(m[2]) : 0;
    if (isNaN(h) || h > 23 || min > 59) return null;
    return h * 60 + min;
  }

  function parseTimeCell(raw) {
    var cleaned = (raw || '').trim();
    if (!cleaned || cleaned === '-' || cleaned === '—' || cleaned === '–') return null;

    var informal = cleaned.match(/^(\d{1,2})-(\d{2})$/);
    if (informal) {
      var ih = Number(informal[1]), imin = Number(informal[2]);
      if (ih <= 23 && imin <= 59) return { start: ih * 60 + imin, end: ih * 60 + imin + 60 };
    }

    var parts = cleaned.replace(/^с\s+/i, '').split(/\s*(?:-|–|—|до|to)\s*/i).filter(Boolean);
    var start = parseSingleTime(parts[0]);
    if (start == null) return null;
    var end = parts.length > 1 ? parseSingleTime(parts[1]) : null;
    if (end == null || end <= start) end = start + 60;
    return { start: clamp(start, DAY_START, DAY_END), end: clamp(end, DAY_START, DAY_END) };
  }

  // Full TSV/CSV tokenizer. Google Sheets copies a range as TAB-separated
  // values and QUOTES any cell that contains a tab, a newline or a quote
  // ("" escapes a literal quote) — so a multi-line cell must not be split on
  // raw "\n". Splitting the text into lines first (the old approach) tore
  // those rows apart and fed the debris — stray quotes, half-cells, embedded
  // carriage returns — into event titles, which then broke the Firebase write.
  function parseDelimited(text) {
    var delim = text.indexOf('\t') !== -1 ? '\t' : ',';
    var rows = [], row = [], field = '', inQuotes = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else { field += ch; }
        continue;
      }
      if (ch === '"') { inQuotes = true; }
      else if (ch === delim) { row.push(field); field = ''; }
      else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (ch === '\r') {
        // lone \r ends a row too; \r\n is one break, not two
        if (text[i + 1] !== '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      }
      else { field += ch; }
    }
    row.push(field);
    rows.push(row);
    return rows;
  }

  // Reduce a title to a string that is safe as a Realtime Database KEY: RTDB
  // rejects . # $ / [ ] and control chars in keys, and nameColors is keyed by
  // title. Names pasted from Google Sheets often carry a dot ("А. Иванов",
  // "10.А") — without this, set() throws and the whole write is aborted, so
  // the pasted rows vanish on the next reload. The event's own title is left
  // untouched; only its palette key goes through here.
  function sanitizeName(s) {
    return (s || '').replace(/[.#$\/[\]\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function parseImportGrid(text) {
    var rows = parseDelimited(text).filter(function (r) {
      return r.some(function (c) { return c.trim() !== ''; });
    });
    if (rows.length < 2) return { events: [], total: 0, skipped: 0 };

    var header = rows[0];
    var dayForColumn = header.map(matchDayName);
    var defaultCategoryId = (state.categories.find(function (c) { return c.isClass; }) || state.categories[0]).id;

    var events = [], total = 0, skipped = 0;
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r];
      // Keep the real name for display (dots and all); nameKey() handles the
      // Firebase-key side. Only control chars are unconditionally unsafe.
      var name = (row[0] || '').replace(/[\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, ' ').trim();
      if (!name) continue;
      for (var c = 1; c < row.length; c++) {
        var day = dayForColumn[c];
        var cell = (row[c] || '').trim();
        if (day == null || !cell) continue;
        total++;
        var parsed = parseTimeCell(cell);
        if (!parsed) { skipped++; continue; }
        events.push({ id: uid(), title: name, day: day, start: parsed.start, end: parsed.end, categoryId: defaultCategoryId, notes: '' });
      }
    }
    return { events: events, total: total, skipped: skipped };
  }

  function showImportStatus(message, kind) {
    var el = document.getElementById('import-status');
    el.textContent = message;
    el.className = 'import-status' + (kind ? ' ' + kind : '');
    el.hidden = false;
  }

  function runImport(text) {
    if (isReadOnly) return;
    if (!text || !text.trim()) { showImportStatus('Вставьте скопированные ячейки или выберите файл.', 'error'); return; }
    var parsedResult = parseImportGrid(text);
    var parsed = parsedResult.events, total = parsedResult.total, skipped = parsedResult.skipped;
    if (!total) {
      showImportStatus('Не нашлось ни одной ячейки с временем. Проверьте, что имена — в первом столбце, а дни недели — в первой строке.', 'error');
      return;
    }

    var existingKey = function (ev) { return ev.title + '|' + ev.day + '|' + ev.start + '|' + ev.end; };
    var existing = {};
    state.events.forEach(function (ev) { existing[existingKey(ev)] = true; });
    var toAdd = [];
    parsed.forEach(function (ev) {
      var key = existingKey(ev);
      if (existing[key]) return;
      existing[key] = true;
      toAdd.push(ev);
    });

    if (!toAdd.length) {
      showImportStatus('Добавлено занятий: 0, уже было: ' + parsed.length + (skipped > 0 ? ', не удалось распознать: ' + skipped : '') + '.', 'error');
      return;
    }

    commit(function () { toAdd.forEach(function (ev) { ensureNameColor(ev.title); state.events.push(ev); }); });

    var parts = ['Добавлено занятий: ' + toAdd.length];
    var dupes = parsed.length - toAdd.length;
    if (dupes > 0) parts.push('уже было: ' + dupes);
    if (skipped > 0) parts.push('не удалось распознать: ' + skipped);
    showImportStatus(parts.join(', ') + '.', 'ok');
  }

  function bindImport() {
    document.getElementById('btn-import').addEventListener('click', function () {
      runImport(document.getElementById('import-text').value);
    });
    document.getElementById('btn-import-file').addEventListener('click', function () {
      document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        document.getElementById('import-text').value = String(reader.result);
        runImport(String(reader.result));
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }

  function setStatus(mode) {
    var pill = document.getElementById('status-pill');
    var text = document.getElementById('status-text');
    if (mode === 'readonly') {
      pill.classList.add('readonly');
      text.textContent = 'Только просмотр';
    } else if (mode === 'saving') {
      pill.classList.remove('readonly');
      text.textContent = 'Сохранение…';
    } else if (mode === 'offline') {
      pill.classList.add('readonly');
      text.textContent = 'Нет соединения';
    } else if (mode === 'loading') {
      pill.classList.remove('readonly');
      text.textContent = 'Загрузка…';
    } else {
      pill.classList.remove('readonly');
      text.textContent = 'Синхронизировано';
    }
  }

  // Reflects the real Realtime Database state: "Загрузка…" until the first
  // snapshot arrives, "Сохранение…" while a write is queued/in flight,
  // "Нет соединения" when .info/connected is false, "Синхронизировано" otherwise.
  function refreshConnectionStatus() {
    if (isReadOnly) { setStatus('readonly'); return; }
    if (!stateLoaded) { setStatus('loading'); return; }
    if (pendingWrite || syncTimer) { setStatus('saving'); return; }
    setStatus(isConnected ? 'idle' : 'offline');
  }

  // Sync the whole UI to the current isReadOnly value: sidebar forms, import
  // controls, the readonly notice, and a re-render (event drag handles and the
  // category delete buttons are drawn conditionally on isReadOnly).
  function applyReadOnlyUI() {
    var disable = isReadOnly;
    if (isReadOnly) selectedIds.clear();
    document.getElementById('readonly-notice').hidden = !isReadOnly;
    document.getElementById('event-form').querySelectorAll('input,select,textarea,button').forEach(function (el) { el.disabled = disable; });
    document.getElementById('category-form').querySelectorAll('input,button').forEach(function (el) { el.disabled = disable; });
    document.getElementById('btn-clear').disabled = disable;
    document.getElementById('import-text').disabled = disable;
    document.getElementById('btn-import').disabled = disable;
    document.getElementById('btn-import-file').disabled = disable;
    render();
    renderCategoryList();
    refreshConnectionStatus();
  }

  function enterReadOnly() {
    clearHistory();
    if (isReadOnly) { applyReadOnlyUI(); return; }
    isReadOnly = true;
    applyReadOnlyUI();
  }

  function exitReadOnly() {
    if (!isReadOnly) return;
    isReadOnly = false;
    applyReadOnlyUI();
  }

  // Undo/redo history: snapshots of the whole state, newest last. Cleared on
  // reload (in-memory only, like a text editor's undo buffer).
  var undoStack = [];
  var redoStack = [];
  var HISTORY_LIMIT = 100;

  function clearHistory() { undoStack.length = 0; redoStack.length = 0; }

  // Push the current state to Firebase on a 500ms debounce so a burst of quick
  // edits collapses into one write.
  function scheduleWrite() {
    if (isReadOnly || !stateLoaded) return;
    pendingWrite = true;
    setStatus('saving');
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(flushSync, 500);
  }

  // Every mutation goes through here: snapshot the pre-mutation state for undo,
  // apply the change, render, and schedule the write. Refuses to run until the
  // real data has loaded from the server, so a local edit can never be based
  // on (and then persist) the empty placeholder state.
  function commit(mutateFn) {
    if (isReadOnly || !stateLoaded) return;
    var before = clone(state);
    mutateFn();
    render();
    undoStack.push(before);
    if (undoStack.length > HISTORY_LIMIT) undoStack.shift();
    redoStack.length = 0;
    scheduleWrite();
  }

  function applyHistorySnapshot(snapshot) {
    state = snapshot;
    render();
    renderCategoryOptions();
    renderCategoryList();
    scheduleWrite();
  }

  function undo() {
    if (isReadOnly || !undoStack.length) return;
    redoStack.push(clone(state));
    applyHistorySnapshot(undoStack.pop());
  }

  function redo() {
    if (isReadOnly || !redoStack.length) return;
    undoStack.push(clone(state));
    applyHistorySnapshot(redoStack.pop());
  }

  function bindUndoRedo() {
    document.addEventListener('keydown', function (e) {
      if ((!e.ctrlKey && !e.metaKey) || e.altKey) return;

      // Use e.code (physical key), not e.key: on a Cyrillic keyboard layout
      // e.key for the Z key is 'я', so `e.key === 'z'` would silently fail.
      var isZ = e.code === 'KeyZ' || (e.key || '').toLowerCase() === 'z';
      var isY = e.code === 'KeyY' || (e.key || '').toLowerCase() === 'y';
      if (!isZ && !isY) return;

      var isUndo = isZ && !e.shiftKey;
      var isRedo = (isZ && e.shiftKey) || (isY && !e.shiftKey);

      // TEMP diagnostic — remove once Ctrl+Z is confirmed working on the live site.
      console.log('[undo] Ctrl+Z нажат', {
        key: e.key, code: e.code, shift: e.shiftKey,
        action: isUndo ? 'undo' : 'redo',
        isReadOnly: isReadOnly, signedIn: !!currentUser,
        undoStack: undoStack.length, redoStack: redoStack.length
      });

      // Let the browser handle Ctrl+Z inside text fields, and don't fire while
      // a modal (edit / auth / confirm) is open or the board is read-only.
      var t = e.target;
      var tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) {
        console.log('[undo] пропущено: фокус в поле ввода (' + tag + ')');
        return;
      }
      if (document.querySelector('.modal-backdrop.open')) {
        console.log('[undo] пропущено: открыт модальный диалог');
        return;
      }
      if (isReadOnly) {
        console.log('[undo] пропущено: режим «только просмотр» (нужно войти)');
        return;
      }

      e.preventDefault();
      if (isUndo) undo(); else redo();
    });
  }

  function handleWriteError(err) {
    console.error('Не удалось записать в Firebase', err);
    pendingWrite = false;
    refreshConnectionStatus();
    var code = (err && (err.code || err.message)) || '';
    if (/permission_denied|PERMISSION_DENIED/i.test(code)) {
      var uid = (currentUser && currentUser.uid) || '(не определён)';
      showDialog(
        'База отклонила запись: у этой учётной записи нет прав на изменение расписания.\n\n' +
        'Ваш UID: ' + uid + '\n\n' +
        'Добавьте его в правила Realtime Database (узел "schedule", ".write") ' +
        'или войдите под учётной записью владельца.', false);
      return;
    }
    showDialog('Не удалось сохранить изменения. Попробуйте ещё раз.', false);
  }

  function flushSync() {
    syncTimer = null;
    // Never write unless: Firebase is ready, the owner is signed in (RTDB
    // rules reject anyone else), and the real data has loaded (so we can't
    // push the empty placeholder over it).
    if (!scheduleRef || !currentUser || !stateLoaded) { pendingWrite = false; refreshConnectionStatus(); return; }
    var writePromise;
    try {
      // set() validates keys/values synchronously and THROWS (not rejects) on
      // bad data, so this needs its own try/catch — .catch() below wouldn't see it.
      writePromise = set(scheduleRef, clone(state));
    } catch (err) {
      handleWriteError(err);
      return;
    }
    writePromise.then(function () {
      pendingWrite = false;
      refreshConnectionStatus();
    }).catch(handleWriteError);
  }

  // Firebase drops empty arrays/objects, so a round-tripped node can be
  // missing keys — rebuild a well-formed { categories, events, nameColors }.
  function normalizeState(raw) {
    raw = raw || {};
    var categories = Array.isArray(raw.categories) && raw.categories.length
      ? raw.categories
      : clone(DEFAULT_STATE.categories);
    var events = Array.isArray(raw.events) ? raw.events.filter(Boolean) : [];
    var nameColors = (raw.nameColors && typeof raw.nameColors === 'object') ? raw.nameColors : {};
    var out = { categories: categories, events: events, nameColors: nameColors };
    if (raw._seeded) out._seeded = true; // carry the one-time seed marker through
    if (raw._pairPreset) out._pairPreset = true; // ...и маркер «исходные пары уже покрашены»
    return out;
  }

  function beginInteraction() { isInteracting = true; }
  function endInteraction() {
    isInteracting = false;
    if (pendingRemote != null && !pendingWrite && !syncTimer) {
      var raw = pendingRemote;
      pendingRemote = null;
      applyRemoteState(raw);
    }
  }

  function applyRemoteState(raw) {
    pendingRemote = null;
    state = normalizeState(raw);
    state.events.forEach(function (ev) { ensureNameColor(ev.title); });
    render();
    renderCategoryOptions();
    renderCategoryList();
  }

  function pathForUser(user) {
    var uid = user && user.uid;
    return (uid && SCHEDULE_PATH_BY_UID[uid]) || DEFAULT_SCHEDULE_PATH;
  }

  // The single source of truth handler. state is only ever replaced from here;
  // the first snapshot flips stateLoaded, which is what unblocks commits/writes.
  function onScheduleSnapshot(snap) {
    var val = snap.val();
    var hasData = val && typeof val === 'object';

    if (hasData) {
      // Don't stomp on edits the local user is still making; the echo of our
      // own write will re-sync once the debounce has flushed. A snapshot that
      // lands mid drag/resize is stashed and applied when the gesture ends.
      if (pendingWrite || syncTimer) {
        // keep current local state
      } else if (isInteracting) {
        pendingRemote = val;
      } else {
        applyRemoteState(val);
      }
    }
    // Empty node (hasData === false): keep the empty placeholder on screen.
    // seedIfEmpty() — not this handler — decides whether to populate it.

    if (!stateLoaded) {
      stateLoaded = true;
      refreshConnectionStatus();
    }
    applyPairPreset();
  }

  // (Re)bind the board to a Realtime Database node. Called on connect and again
  // whenever the signed-in user changes to one mapped to a different node.
  // Tears down the previous listener and wipes all load/seed/sync/history state
  // so nothing from the old node leaks into the new one.
  function subscribeToPath(path) {
    if (!dbInstance || path === activePath) return;
    activePath = path;

    if (scheduleUnsub) { scheduleUnsub(); scheduleUnsub = null; }
    if (syncTimer) { clearTimeout(syncTimer); syncTimer = null; }
    pendingWrite = false;
    pendingRemote = null;
    stateLoaded = false;
    seedChecked = false;
    pairPresetChecked = false;
    clearHistory();
    state = { categories: clone(DEFAULT_STATE.categories), events: [], nameColors: {} };
    render();
    renderCategoryOptions();
    renderCategoryList();

    scheduleRef = ref(dbInstance, path);
    refreshConnectionStatus();

    scheduleUnsub = onValue(scheduleRef, onScheduleSnapshot, function (err) {
      console.error('Ошибка чтения из Firebase', err);
      setStatus('offline');
    });

    seedIfEmpty();
    applyPairPreset();
  }

  // First-run seeding — ONLY for the default node. Runs at most once per
  // subscription, only when signed in and connected. Does an explicit get() (a
  // single read straight from the server, so it can't lose a race with the
  // onValue snapshot) and writes DEFAULT_STATE when the board has no lessons
  // yet — either the node is absent, or it exists but holds no events. The
  // _seeded marker, stamped on the first seed, permanently blocks re-seeding:
  // once the starter data has been written, a later «Очистить всё» stays
  // cleared. Per-user nodes (schedule-2, …) are never seeded — they start empty.
  async function seedIfEmpty() {
    if (seedChecked || !scheduleRef || !currentUser || !isConnected) return;
    if (activePath !== DEFAULT_SCHEDULE_PATH) return;
    seedChecked = true;
    try {
      var snap = await get(scheduleRef);
      var val = snap.exists() ? snap.val() : null;
      // Seeded once already — leave it alone, even if the board was later emptied.
      if (val && val._seeded) return;
      // Firebase may hand events back as an array or, for a sparse list, an
      // object — treat either non-empty shape as "the board already has lessons".
      var ev = val && val.events;
      var hasLessons = Array.isArray(ev)
        ? ev.length > 0
        : !!(ev && typeof ev === 'object' && Object.keys(ev).length > 0);
      if (hasLessons) return;
      var seed = clone(DEFAULT_STATE);
      seed._seeded = true;
      await set(scheduleRef, seed);
      console.log('[seed] на доске не было занятий — записаны стартовые данные один раз');
    } catch (e) {
      seedChecked = false;                  // let a later auth/connect retry
      console.error('[seed] проверка не удалась', e);
    }
  }

  // Одноразовая доводка исходного расписания 507: занятия, записанные сидом,
  // переводятся в категорию «Пара» и красятся в серый. Работает и на уже
  // засеянной доске. «Пары» — это события из DEFAULT_STATE (их id совпадают
  // с тем, что сид записал в базу), так что позже добавленные вручную занятия
  // не трогаются. Флаг _pairPreset в состоянии не даёт применить это повторно,
  // pairPresetChecked — второй раз за сессию.
  function applyPairPreset() {
    if (pairPresetChecked || isReadOnly || !stateLoaded || !currentUser || !isConnected) return;
    if (state._pairPreset) { pairPresetChecked = true; return; }

    var seedIds = {};
    DEFAULT_STATE.events.forEach(function (e) { seedIds[e.id] = true; });
    var targets = state.events.filter(function (e) { return seedIds[e.id]; });
    if (!targets.length) return; // не та доска (или данные ещё не догрузились) — повторим позже

    pairPresetChecked = true;
    if (!state.categories.some(function (c) { return c.id === 'cat-pair'; })) {
      state.categories.push({ id: 'cat-pair', name: 'Пара', color: PAIR_COLOR, isClass: true });
    }
    if (!state.nameColors) state.nameColors = {};
    targets.forEach(function (e) {
      e.categoryId = 'cat-pair';
      state.nameColors[nameKey(e.title)] = PAIR_COLOR;
    });
    state._pairPreset = true;

    render();
    renderCategoryOptions();
    renderCategoryList();
    scheduleWrite();
    console.log('[pair-preset] ' + targets.length + ' пар переведены в категорию «Пара» и покрашены в серый');
  }

  function connectFirebase() {
    try {
      var app = initializeApp(firebaseConfig);
      dbInstance = getDatabase(app);
      authInstance = getAuth(app);
    } catch (e) {
      console.error('Не удалось инициализировать Firebase. Проверьте firebase-config.js', e);
      setStatus('offline');
      return;
    }

    // Firebase persists the session (browserLocalPersistence by default), so
    // this fires with the previously signed-in user on reload without a
    // re-login prompt. Each user is bound to their own node (see pathForUser);
    // signing out drops back to the default node.
    onAuthStateChanged(authInstance, function (user) {
      currentUser = user || null;
      updateAuthUI();
      subscribeToPath(pathForUser(currentUser));
      if (currentUser) {
        exitReadOnly();
        seedIfEmpty();
        applyPairPreset();
      } else {
        enterReadOnly();
      }
    });

    onValue(ref(dbInstance, '.info/connected'), function (snap) {
      isConnected = snap.val() === true;
      refreshConnectionStatus();
      if (isConnected) { seedIfEmpty(); applyPairPreset(); }
    });

    // Bind to the default node right away so visitors see it while auth
    // resolves; the auth callback re-binds if the signed-in user owns another.
    subscribeToPath(DEFAULT_SCHEDULE_PATH);
  }

  function updateAuthUI() {
    var login = document.getElementById('btn-login');
    var logout = document.getElementById('btn-logout');
    if (login) login.hidden = !!currentUser;
    if (logout) logout.hidden = !currentUser;
  }

  function authErrorText(err) {
    var code = (err && err.code) || '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Неверный email или пароль.';
      case 'auth/invalid-email':
        return 'Некорректный адрес email.';
      case 'auth/user-disabled':
        return 'Эта учётная запись отключена.';
      case 'auth/too-many-requests':
        return 'Слишком много попыток входа. Попробуйте позже.';
      case 'auth/network-request-failed':
        return 'Нет соединения с сервером. Проверьте интернет.';
      default:
        return 'Не удалось войти.' + ((err && err.message) ? ' ' + err.message : '');
    }
  }

  function openAuthModal() {
    document.getElementById('auth-backdrop').classList.add('open');
    var email = document.getElementById('auth-email');
    if (email) { try { email.focus(); } catch (e) { } }
  }

  function closeAuthModal() {
    document.getElementById('auth-backdrop').classList.remove('open');
  }

  function bindAuth() {
    document.getElementById('btn-login').addEventListener('click', openAuthModal);

    document.getElementById('btn-logout').addEventListener('click', function () {
      if (!authInstance) return;
      signOut(authInstance).catch(function (err) {
        showDialog('Не удалось выйти. ' + ((err && err.message) || ''), false);
      });
    });

    document.getElementById('auth-cancel').addEventListener('click', closeAuthModal);

    var backdrop = document.getElementById('auth-backdrop');
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) closeAuthModal(); });

    document.getElementById('auth-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (!authInstance) { showDialog('Firebase не инициализирован. Проверьте firebase-config.js.', false); return; }
      var email = document.getElementById('auth-email').value.trim();
      var password = document.getElementById('auth-password').value;
      if (!email || !password) return;
      var submitBtn = e.target.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      signInWithEmailAndPassword(authInstance, email, password).then(function () {
        document.getElementById('auth-password').value = '';
        closeAuthModal();
      }).catch(function (err) {
        showDialog(authErrorText(err), false);
      }).finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
    });
  }

  var dialogResolve = null;

  function showDialog(message, showCancel) {
    return new Promise(function (resolve) {
      dialogResolve = resolve;
      document.getElementById('confirm-message').textContent = message;
      document.getElementById('confirm-cancel').hidden = !showCancel;
      document.getElementById('confirm-backdrop').classList.add('open');
    });
  }

  function closeDialog(result) {
    document.getElementById('confirm-backdrop').classList.remove('open');
    var resolve = dialogResolve;
    dialogResolve = null;
    if (resolve) resolve(result);
  }

  function bindDialog() {
    document.getElementById('confirm-ok').addEventListener('click', function () { closeDialog(true); });
    document.getElementById('confirm-cancel').addEventListener('click', function () { closeDialog(false); });
    document.getElementById('confirm-backdrop').addEventListener('click', function (e) {
      if (e.target === document.getElementById('confirm-backdrop')) closeDialog(false);
    });
  }

  function computeSegments() {
    var points = {}; points[DAY_START] = true; points[DAY_END] = true;
    state.events.forEach(function (ev) {
      points[clamp(ev.start, DAY_START, DAY_END)] = true;
      points[clamp(ev.end, DAY_START, DAY_END)] = true;
    });
    var sorted = Object.keys(points).map(Number).sort(function (a, b) { return a - b; });
    var segs = [];
    for (var i = 0; i < sorted.length - 1; i++) {
      var from = sorted[i], to = sorted[i + 1];
      if (to <= from) continue;
      var busy = state.events.some(function (ev) { return ev.start < to && ev.end > from; });
      segs.push({ from: from, to: to, busy: busy });
    }
    if (!segs.length) segs.push({ from: DAY_START, to: DAY_END, busy: false });
    return segs;
  }

  function computeLayout() {
    var y = 0;
    var segments = computeSegments().map(function (seg) {
      var h = seg.busy ? Math.max(MIN_CONTENT_HEIGHT, Math.round((seg.to - seg.from) * PX_PER_MIN)) : GAP_ROW_HEIGHT;
      var item = { from: seg.from, to: seg.to, busy: seg.busy, y: y, h: h };
      y += h;
      return item;
    });
    return { segments: segments, totalHeight: y };
  }

  function minutesToY(layout, minutes) {
    var segs = layout.segments;
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i];
      if (minutes <= s.from) return s.y;
      if (minutes < s.to) return s.y + ((minutes - s.from) / (s.to - s.from)) * s.h;
    }
    var last = segs[segs.length - 1];
    return last.y + last.h;
  }

  function yToMinutes(layout, y) {
    var segs = layout.segments;
    if (y <= 0) return segs[0].from;
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i];
      if (y <= s.y + s.h) {
        var frac = clamp((y - s.y) / s.h, 0, 1);
        return s.from + frac * (s.to - s.from);
      }
    }
    var last = segs[segs.length - 1];
    return last.to;
  }

  function segmentBackground(layout) {
    var parts = [], y = 0;
    layout.segments.forEach(function (seg, i) {
      if (i > 0) parts.push('var(--seam) ' + y + 'px ' + (y + 1) + 'px');
      var fillStart = i > 0 ? y + 1 : y;
      var fill = seg.busy ? 'var(--surface)' : 'var(--surface-alt)';
      parts.push(fill + ' ' + fillStart + 'px ' + (y + seg.h) + 'px');
      y += seg.h;
    });
    return 'linear-gradient(to bottom, ' + parts.join(', ') + ')';
  }

  function render() {
    pruneSelection();
    currentLayout = computeLayout();
    rebuildSkeleton(currentLayout);
    renderEvents();
    renderNameColorList();
    renderDayTabs();
    renderMatrix();
    renderSelectionPanel();
  }

  // Second format: rows are names/task titles, columns are the seven weekdays,
  // each cell holds the time(s) for that name on that day. Same events as the
  // timeline — this only re-presents state.events, it is not a separate table.
  // Cells are edited in place (Google-Sheets style): a click swaps the cell for
  // an <input>; on commit the text is parsed back into state.events, so any
  // change is instantly visible in the timeline view and synced to Firebase.
  function renderMatrix() {
    var table = document.getElementById('matrix-table');
    if (!table) return;

    var rows = {}, order = [];
    state.events.forEach(function (ev) {
      var key = nameKey(ev.title);
      if (!rows[key]) { rows[key] = { name: ev.title, days: [[], [], [], [], [], [], []] }; order.push(key); }
      rows[key].days[ev.day].push(ev);
    });
    order.sort(function (a, b) { return rows[a].name.localeCompare(rows[b].name, 'ru'); });

    var head = '<thead><tr><th class="mx-name-h">Имя / дело</th>' +
      DAY_NAMES.map(function (n) { return '<th>' + escapeHtml(n) + '</th>'; }).join('') +
      '</tr></thead>';

    if (!order.length) {
      table.innerHTML = head + '<tbody><tr><td class="mx-empty" colspan="8">Пока нет занятий</td></tr></tbody>';
      return;
    }

    var editable = !isReadOnly;
    var body = order.map(function (key) {
      var row = rows[key];
      var cells = row.days.map(function (list, day) {
        var inner = '';
        list.sort(function (a, b) { return a.start - b.start || a.end - b.end; });
        inner = list.map(function (ev) {
          var cat = getCategory(ev.categoryId);
          var cls = 'mx-entry' + (cat.isClass ? '' : ' other-type') + (ev.cancelled ? ' cancelled' : '');
          var note = ev.notes ? '<span class="mx-note">' + escapeHtml(ev.notes) + '</span>' : '';
          return '<span class="' + cls + '" data-id="' + ev.id + '">' +
            '<span class="mx-time">' + escapeHtml(formatCellTime(ev)) + '</span>' + note + '</span>';
        }).join('');
        return '<td class="mx-day' + (editable ? ' editable' : '') + '" data-day="' + day + '">' + inner + '</td>';
      }).join('');
      return '<tr data-name="' + escapeHtml(row.name) + '">' +
        '<th class="mx-name' + (editable ? ' editable' : '') + '">' +
        '<span class="mx-dot" style="background:' + getNameColor(row.name) + '"></span>' +
        '<span class="mx-name-text">' + escapeHtml(row.name) + '</span></th>' + cells + '</tr>';
    }).join('');

    table.innerHTML = head + '<tbody>' + body + '</tbody>';
  }

  // Pull a leading time (single "9" / "9:00" or a range "9-10:30") off the front
  // of a cell string; whatever is left over is the event's comment. A string
  // with no leading time is treated as pure comment (the time stays put).
  function hmValid(h, m) {
    h = Number(h); m = (m == null || m === '') ? 0 : Number(m);
    if (isNaN(h) || isNaN(m) || m > 59 || h > 24) return false;
    if (h === 24 && m !== 0) return false;
    return true;
  }
  function hmToMin(h, m) { return Number(h) * 60 + ((m == null || m === '') ? 0 : Number(m)); }

  function parseTimeAndNote(str) {
    var s = (str || '').trim();
    if (!s) return { start: null, end: null, note: '' };

    var range = s.match(/^(\d{1,2})(?::(\d{2}))?\s*[-–—]\s*(\d{1,2})(?::(\d{2}))?(?:\s+([\s\S]*))?$/);
    if (range && hmValid(range[1], range[2]) && hmValid(range[3], range[4])) {
      var st = hmToMin(range[1], range[2]), en = hmToMin(range[3], range[4]);
      if (en > st) return { start: st, end: en, note: (range[5] || '').trim() };
    }

    var single = s.match(/^(\d{1,2})(?::(\d{2}))?(?:\s+([\s\S]*))?$/);
    if (single && hmValid(single[1], single[2])) {
      return { start: hmToMin(single[1], single[2]), end: null, note: (single[3] || '').trim() };
    }

    return { start: null, end: null, note: s };
  }

  // Swap `target` for a text input seeded with `initialValue`; on Enter or blur
  // run onCommit(value), on Escape discard. Either way renderMatrix() rebuilds
  // the affected cell from state afterwards.
  function swapForInput(target, initialValue, onCommit) {
    if (isReadOnly || !stateLoaded || target.querySelector('input.mx-input')) return;
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'mx-input';
    input.value = initialValue;
    target.classList.add('mx-editing');
    target.innerHTML = '';
    target.appendChild(input);
    input.focus();
    input.select();
    beginInteraction();

    var done = false;
    function finish(save) {
      if (done) return;
      done = true;
      input.removeEventListener('blur', onBlur);
      var val = input.value;
      if (save) {
        try { onCommit(val); } catch (err) { console.error('Не удалось сохранить ячейку', err); }
      }
      endInteraction();
      renderMatrix();
    }
    function onBlur() { finish(true); }
    input.addEventListener('blur', onBlur);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); finish(true); }
      else if (e.key === 'Escape') { e.preventDefault(); finish(false); }
    });
  }

  function applyTimeCellEdit(ev, value) {
    var s = (value || '').trim();
    if (!s) {
      commit(function () { state.events = state.events.filter(function (x) { return x.id !== ev.id; }); });
      return;
    }
    var parsed = parseTimeAndNote(s);
    commit(function () {
      if (parsed.start != null) {
        var start = clamp(parsed.start, DAY_START, DAY_END - MIN_DURATION);
        var end;
        if (parsed.end != null) {
          end = clamp(parsed.end, start + MIN_DURATION, DAY_END);
        } else {
          var dur = ev.end - ev.start;
          end = clamp(start + (dur > 0 ? dur : 60), start + MIN_DURATION, DAY_END);
        }
        ev.start = start;
        ev.end = end;
      }
      ev.notes = parsed.note;
    });
  }

  function editMatrixEntry(entryEl) {
    var ev = state.events.find(function (x) { return x.id === entryEl.dataset.id; });
    if (!ev) return;
    var initial = formatCellTime(ev) + (ev.notes ? ' ' + ev.notes : '');
    swapForInput(entryEl, initial, function (value) { applyTimeCellEdit(ev, value); });
  }

  function addMatrixEntry(cellEl) {
    var tr = cellEl.closest('tr');
    var name = tr && tr.dataset.name;
    var day = Number(cellEl.dataset.day);
    if (!name) return;
    swapForInput(cellEl, '', function (value) {
      var parsed = parseTimeAndNote(value);
      if (parsed.start == null) return; // no usable time → nothing to create
      var start = clamp(parsed.start, DAY_START, DAY_END - MIN_DURATION);
      var end = parsed.end != null
        ? clamp(parsed.end, start + MIN_DURATION, DAY_END)
        : clamp(start + 60, start + MIN_DURATION, DAY_END);
      var categoryId = (state.categories.find(function (c) { return c.isClass; }) || state.categories[0]).id;
      commit(function () {
        ensureNameColor(name);
        state.events.push({ id: uid(), title: name, day: day, start: start, end: end, categoryId: categoryId, notes: parsed.note });
      });
    });
  }

  function editMatrixName(cellEl) {
    var tr = cellEl.closest('tr');
    var oldName = tr && tr.dataset.name;
    if (!oldName) return;
    var textEl = cellEl.querySelector('.mx-name-text') || cellEl;
    swapForInput(textEl, oldName, function (value) {
      var next = value.trim();
      if (!next || next === oldName) return;
      var oldKey = nameKey(oldName);
      var oldColor = getNameColor(oldName);
      commit(function () {
        state.events.forEach(function (ev) { if (nameKey(ev.title) === oldKey) ev.title = next; });
        if (!state.nameColors) state.nameColors = {};
        if (!state.nameColors[nameKey(next)]) state.nameColors[nameKey(next)] = oldColor;
      });
    });
  }

  function setView(view) {
    currentView = view === 'matrix' ? 'matrix' : 'timeline';
    selectedIds.clear();
    var wrap = document.getElementById('grid-wrap');
    if (wrap) wrap.classList.toggle('matrix-view', currentView === 'matrix');
    var tabs = document.getElementById('view-tabs');
    if (tabs) tabs.querySelectorAll('button').forEach(function (b) {
      b.classList.toggle('active', b.dataset.view === currentView);
    });
    render();
  }

  function bindViewTabs() {
    var tabs = document.getElementById('view-tabs');
    if (tabs) tabs.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-view]');
      if (btn) setView(btn.dataset.view);
    });

    var table = document.getElementById('matrix-table');
    if (!table) return;
    table.addEventListener('click', function (e) {
      if (isReadOnly || e.target.closest('input.mx-input')) return;

      var nameCell = e.target.closest('th.mx-name');
      if (nameCell) { editMatrixName(nameCell); return; }

      var entry = e.target.closest('.mx-entry');
      if (entry) { editMatrixEntry(entry); return; }

      var dayCell = e.target.closest('td.mx-day');
      if (dayCell && !dayCell.querySelector('.mx-entry')) { addMatrixEntry(dayCell); return; }
    });
  }

  function rebuildSkeleton(layout) {
    var heightPx = layout.totalHeight;

    var header = document.createElement('div');
    header.className = 'grid-header';
    header.innerHTML = '<div class="corner"></div>' + DAY_NAMES.map(function (n, i) {
      return '<div class="day-head' + (i === mobileActiveDay ? '' : ' hidden-mobile') + '">' + n + '</div>';
    }).join('');

    var body = document.createElement('div');
    body.className = 'grid-body';
    body.style.height = heightPx + 'px';

    var timeCol = document.createElement('div');
    timeCol.className = 'time-col';
    timeCol.style.height = heightPx + 'px';
    layout.segments.forEach(function (seg) {
      if (!seg.busy) return;
      var label = document.createElement('div');
      label.className = 'time-label';
      label.style.top = seg.y + 'px';
      label.textContent = formatTime(seg.from);
      timeCol.appendChild(label);
    });
    body.appendChild(timeCol);

    var dayBg = segmentBackground(layout);
    for (var d = 0; d < 7; d++) {
      var col = document.createElement('div');
      col.className = 'day-col' + (d === mobileActiveDay ? '' : ' hidden-mobile');
      col.dataset.day = String(d);
      col.style.height = heightPx + 'px';
      col.style.backgroundImage = dayBg;
      body.appendChild(col);
    }

    gridEl.innerHTML = '';
    gridEl.appendChild(header);
    gridEl.appendChild(body);
  }

  function renderDayTabs() {
    var wrap = document.getElementById('day-tabs');
    if (!wrap) return;
    wrap.innerHTML = DAY_SHORT_NAMES.map(function (name, i) {
      return '<button type="button" data-day="' + i + '" class="' + (i === mobileActiveDay ? 'active' : '') + '">' + name + '</button>';
    }).join('');
  }

  function bindDayTabs() {
    var wrap = document.getElementById('day-tabs');
    if (!wrap) return;
    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-day]');
      if (!btn) return;
      mobileActiveDay = Number(btn.dataset.day);
      render();
    });
  }

  function dayColEl(day) { return gridEl.querySelector('.day-col[data-day="' + day + '"]'); }
  function dayColAtPoint(clientX) {
    var cols = gridEl.querySelectorAll('.day-col');
    for (var i = 0; i < cols.length; i++) {
      var r = cols[i].getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right) return cols[i];
    }
    return null;
  }

  function layoutDay(events) {
    var sorted = events.slice().sort(function (a, b) { return a.start - b.start || a.end - b.end; });
    var clusters = [], current = [], currentEnd = -Infinity;
    sorted.forEach(function (ev) {
      if (current.length && ev.start >= currentEnd) { clusters.push(current); current = []; currentEnd = -Infinity; }
      current.push(ev);
      currentEnd = Math.max(currentEnd, ev.end);
    });
    if (current.length) clusters.push(current);

    var positioned = [];
    clusters.forEach(function (cluster) {
      var columnsEnd = [], colOf = {};
      cluster.forEach(function (ev) {
        var placed = false;
        for (var c = 0; c < columnsEnd.length; c++) {
          if (columnsEnd[c] <= ev.start) { columnsEnd[c] = ev.end; colOf[ev.id] = c; placed = true; break; }
        }
        if (!placed) { columnsEnd.push(ev.end); colOf[ev.id] = columnsEnd.length - 1; }
      });
      var totalCols = columnsEnd.length;
      cluster.forEach(function (ev) { positioned.push({ ev: ev, col: colOf[ev.id], totalCols: totalCols }); });
    });
    return positioned;
  }

  function renderEvents() {
    for (var d = 0; d < 7; d++) {
      var col = dayColEl(d);
      col.querySelectorAll('.event').forEach(function (n) { n.remove(); });
      var dayEvents = state.events.filter(function (e) { return e.day === d; });
      layoutDay(dayEvents).forEach(function (p) { col.appendChild(buildEventEl(p.ev, p.col, p.totalCols)); });
    }
  }

  function buildEventEl(ev, col, totalCols) {
    var cat = getCategory(ev.categoryId);
    var el = document.createElement('div');
    el.className = 'event' + (cat.isClass ? '' : ' other-type') + (ev.cancelled ? ' cancelled' : '') + (isReadOnly ? ' readonly' : '') + (selectedIds.has(ev.id) ? ' selected' : '');
    el.dataset.id = ev.id;
    positionEventEl(el, ev, col, totalCols, currentLayout);
    el.style.background = getNameColor(ev.title);

    var title = document.createElement('div');
    title.className = 'ev-title';
    title.textContent = ev.title;
    var time = document.createElement('div');
    time.className = 'ev-time';
    time.textContent = formatTime(ev.start) + '–' + formatTime(ev.end);

    el.appendChild(title);
    el.appendChild(time);

    if (!isReadOnly) {
      var handleTop = document.createElement('div');
      handleTop.className = 'resize-handle top';
      var handleBottom = document.createElement('div');
      handleBottom.className = 'resize-handle bottom';
      el.appendChild(handleTop);
      el.appendChild(handleBottom);
      makeDraggable(el, ev);
      makeResizable(el, ev, handleTop, handleBottom);
      el.addEventListener('dblclick', function (e) {
        if (isReadOnly) return;
        e.preventDefault();
        openEditModal(ev.id);
      });
    }

    return el;
  }

  function positionEventEl(el, ev, col, totalCols, layout) {
    var width = 100 / totalCols, left = col * width;
    var top = minutesToY(layout, ev.start);
    var bottom = minutesToY(layout, ev.end);
    el.style.top = top + 'px';
    el.style.height = Math.max(MIN_CONTENT_HEIGHT, bottom - top) + 'px';
    el.style.left = 'calc(' + left + '% + 2px)';
    el.style.width = 'calc(' + width + '% - 4px)';
  }

  function makeDraggable(el, ev) {
    el.addEventListener('pointerdown', function (e) {
      if (isReadOnly || e.target.classList.contains('resize-handle')) return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      beginInteraction();

      var frozen = currentLayout;
      var duration = ev.end - ev.start;
      var startX = e.clientX, startY = e.clientY, moved = false;
      var previewDay = ev.day, previewStart = ev.start;

      function onMove(e2) {
        var dx = e2.clientX - startX, dy = e2.clientY - startY;
        if (!moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) moved = true;
        if (!moved) return;
        el.classList.add('dragging');
        var originY = minutesToY(frozen, ev.start);
        var rawStart = yToMinutes(frozen, originY + dy);
        previewStart = clamp(snap(rawStart), DAY_START, DAY_END - duration);
        var targetCol = dayColAtPoint(e2.clientX);
        if (targetCol) {
          previewDay = Number(targetCol.dataset.day);
          if (targetCol !== el.parentElement) targetCol.appendChild(el);
        }
        var top = minutesToY(frozen, previewStart);
        var bottom = minutesToY(frozen, previewStart + duration);
        el.style.top = top + 'px';
        el.style.height = Math.max(MIN_CONTENT_HEIGHT, bottom - top) + 'px';
        el.style.left = '2px';
        el.style.width = 'calc(100% - 4px)';
      }
      function onUp(e2) {
        el.releasePointerCapture(e2.pointerId);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
        el.classList.remove('dragging');
        if (moved) {
          commit(function () { ev.day = previewDay; ev.start = previewStart; ev.end = previewStart + duration; });
        } else {
          handleEventClick(ev, e2);
        }
        endInteraction();
      }
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
    });
  }

  function makeResizable(el, ev, handleTop, handleBottom) {
    function bind(handle, edge) {
      handle.addEventListener('pointerdown', function (e) {
        if (isReadOnly) return;
        e.stopPropagation();
        e.preventDefault();
        handle.setPointerCapture(e.pointerId);
        beginInteraction();
        var frozen = currentLayout;
        var startY = e.clientY, origStart = ev.start, origEnd = ev.end;
        var originY = minutesToY(frozen, edge === 'top' ? origStart : origEnd);
        var pendingStart = origStart, pendingEnd = origEnd;

        function onMove(e2) {
          var rawMinutes = yToMinutes(frozen, originY + (e2.clientY - startY));
          if (edge === 'top') {
            pendingStart = clamp(snap(rawMinutes), DAY_START, origEnd - MIN_DURATION);
          } else {
            pendingEnd = clamp(snap(rawMinutes), origStart + MIN_DURATION, DAY_END);
          }
          var top = minutesToY(frozen, pendingStart);
          var bottom = minutesToY(frozen, pendingEnd);
          el.style.top = top + 'px';
          el.style.height = Math.max(MIN_CONTENT_HEIGHT, bottom - top) + 'px';
        }
        function onUp(e2) {
          handle.releasePointerCapture(e2.pointerId);
          handle.removeEventListener('pointermove', onMove);
          handle.removeEventListener('pointerup', onUp);
          commit(function () { ev.start = pendingStart; ev.end = pendingEnd; });
          endInteraction();
        }
        handle.addEventListener('pointermove', onMove);
        handle.addEventListener('pointerup', onUp);
      });
    }
    bind(handleTop, 'top');
    bind(handleBottom, 'bottom');
  }

  function renderCategoryOptions() {
    ['f-category', 'e-category'].forEach(function (id) {
      var sel = document.getElementById(id), prev = sel.value;
      sel.innerHTML = state.categories.map(function (c) { return '<option value="' + c.id + '">' + escapeHtml(c.name) + '</option>'; }).join('');
      if (state.categories.some(function (c) { return c.id === prev; })) sel.value = prev;
    });
  }

  function renderCategoryList() {
    var list = document.getElementById('category-list');
    list.innerHTML = '';
    state.categories.forEach(function (cat) {
      var li = document.createElement('li');
      var preview = document.createElement('span'); preview.className = 'style-preview' + (cat.isClass ? '' : ' dashed');
      var name = document.createElement('span'); name.textContent = cat.name;
      var type = document.createElement('span'); type.className = 'cat-type'; type.textContent = cat.isClass ? 'занятие' : 'дело';
      var del = document.createElement('button');
      del.className = 'cat-del'; del.type = 'button'; del.textContent = '✕'; del.title = 'Удалить категорию';
      del.hidden = isReadOnly;
      del.addEventListener('click', function () { deleteCategory(cat.id); });
      li.append(preview, name, type, del);
      list.appendChild(li);
    });
  }

  function renderNameColorList() {
    var list = document.getElementById('name-color-list');
    if (!list) return;
    var seen = {};
    var names = [];
    state.events.forEach(function (ev) {
      var key = nameKey(ev.title);
      if (!seen[key]) { seen[key] = true; names.push(key); }
    });
    names.sort(function (a, b) { return a.localeCompare(b, 'ru'); });
    list.innerHTML = '';
    names.forEach(function (name) {
      var li = document.createElement('li');
      var swatch = document.createElement('span'); swatch.className = 'swatch'; swatch.style.background = getNameColor(name);
      var label = document.createElement('span'); label.textContent = name;
      li.append(swatch, label);
      list.appendChild(li);
    });
    if (!names.length) {
      var li = document.createElement('li');
      li.className = 'empty-hint';
      li.textContent = 'Пока нет занятий';
      list.appendChild(li);
    }
  }

  function deleteCategory(id) {
    if (isReadOnly) return;
    if (state.categories.length <= 1) { showDialog('Должна остаться хотя бы одна категория.', false); return; }
    var cat = getCategory(id);
    showDialog('Удалить категорию «' + cat.name + '»? Все связанные занятия перейдут в другую категорию.', true).then(function (ok) {
      if (!ok) return;
      var fallback = state.categories.find(function (c) { return c.id !== id; }).id;
      commit(function () {
        state.events.forEach(function (ev) { if (ev.categoryId === id) ev.categoryId = fallback; });
        state.categories = state.categories.filter(function (c) { return c.id !== id; });
      });
      renderCategoryOptions();
      renderCategoryList();
    });
  }

  function bindForms() {
    document.getElementById('event-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (isReadOnly) return;
      var title = document.getElementById('f-title').value.trim();
      var day = Number(document.getElementById('f-day').value);
      var start = parseTime(document.getElementById('f-start').value);
      var end = parseTime(document.getElementById('f-end').value);
      var categoryId = document.getElementById('f-category').value;
      var notes = document.getElementById('f-notes').value.trim();
      if (!title) return;
      if (end <= start) { showDialog('Время окончания должно быть позже времени начала.', false); return; }
      commit(function () {
        ensureNameColor(title);
        state.events.push({ id: uid(), title: title, day: day, start: clamp(start, DAY_START, DAY_END), end: clamp(end, DAY_START, DAY_END), categoryId: categoryId, notes: notes });
      });
      e.target.reset();
      document.getElementById('f-start').value = '09:00';
      document.getElementById('f-end').value = '10:00';
    });

    document.getElementById('category-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (isReadOnly) return;
      var name = document.getElementById('c-name').value.trim();
      var isClass = document.getElementById('c-is-class').checked;
      if (!name) return;
      commit(function () { state.categories.push({ id: 'cat-' + uid(), name: name, isClass: isClass }); });
      renderCategoryOptions();
      renderCategoryList();
      e.target.reset();
    });

    document.getElementById('btn-clear').addEventListener('click', function () {
      if (isReadOnly) return;
      showDialog('Удалить все занятия и дела из расписания?', true).then(function (ok) {
        if (!ok) return;
        commit(function () { state.events = []; });
      });
    });

    var backdrop = document.getElementById('edit-backdrop');
    document.getElementById('edit-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (isReadOnly) return;
      var ev = state.events.find(function (x) { return x.id === editingId; });
      if (!ev) return;
      var start = parseTime(document.getElementById('e-start').value);
      var end = parseTime(document.getElementById('e-end').value);
      if (end <= start) { showDialog('Время окончания должно быть позже времени начала.', false); return; }
      commit(function () {
        ev.title = document.getElementById('e-title').value.trim() || ev.title;
        ensureNameColor(ev.title);
        ev.day = Number(document.getElementById('e-day').value);
        ev.start = clamp(start, DAY_START, DAY_END);
        ev.end = clamp(end, DAY_START, DAY_END);
        ev.categoryId = document.getElementById('e-category').value;
        ev.notes = document.getElementById('e-notes').value.trim();
        ev.cancelled = document.getElementById('e-cancelled').checked;
      });
      closeEditModal();
    });

    document.getElementById('e-cancel').addEventListener('click', closeEditModal);
    document.getElementById('e-delete').addEventListener('click', function () {
      if (isReadOnly || !editingId) return;
      var id = editingId;
      closeEditModal();
      showDialog('Удалить это занятие?', true).then(function (ok) {
        if (!ok) return;
        commit(function () { state.events = state.events.filter(function (x) { return x.id !== id; }); });
      });
    });
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) closeEditModal(); });
  }

  function openEditModal(id) {
    var ev = state.events.find(function (x) { return x.id === id; });
    if (!ev) return;
    editingId = id;
    document.getElementById('e-title').value = ev.title;
    document.getElementById('e-day').value = String(ev.day);
    document.getElementById('e-start').value = formatTime(ev.start);
    document.getElementById('e-end').value = formatTime(ev.end);
    document.getElementById('e-category').value = ev.categoryId;
    document.getElementById('e-notes').value = ev.notes || '';
    document.getElementById('e-cancelled').checked = !!ev.cancelled;
    document.getElementById('edit-backdrop').classList.add('open');
    document.getElementById('edit-form').querySelectorAll('input,select,textarea,button').forEach(function (el) { el.disabled = isReadOnly; });
    document.getElementById('e-cancel').disabled = false;
  }
  function closeEditModal() {
    editingId = null;
    document.getElementById('edit-backdrop').classList.remove('open');
  }

  // ── Выделение занятий и групповые действия ────────────────────────────────
  // Одиночный клик по занятию в «Ленте времени» не открывает карточку, а
  // выделяет его (Ctrl/Cmd/Shift+клик добавляет/убирает из выделения; клик по
  // единственному выделенному снимает выделение). Пока что-то выделено, сбоку
  // висит панель: сменить категорию, отметить отменённым или удалить (Del) —
  // сразу для всех выделенных. Двойной клик открывает карточку редактирования.

  function pruneSelection() {
    selectedIds.forEach(function (id) {
      if (!state.events.some(function (e) { return e.id === id; })) selectedIds.delete(id);
    });
  }

  function clearSelection() {
    if (!selectedIds.size) return;
    selectedIds.clear();
    refreshSelectionUI();
  }

  function handleEventClick(ev, e) {
    if (isReadOnly) return;
    var id = ev.id;
    var additive = e && (e.ctrlKey || e.metaKey || e.shiftKey);
    if (additive) {
      if (selectedIds.has(id)) selectedIds.delete(id); else selectedIds.add(id);
    } else if (selectedIds.size === 1 && selectedIds.has(id)) {
      selectedIds.delete(id);
    } else {
      selectedIds.clear();
      selectedIds.add(id);
    }
    refreshSelectionUI();
  }

  // Обновить только рамку выделения и боковую панель, без полного re-render.
  function refreshSelectionUI() {
    gridEl.querySelectorAll('.event').forEach(function (el) {
      el.classList.toggle('selected', selectedIds.has(el.dataset.id));
    });
    renderSelectionPanel();
  }

  function selectedEvents() {
    return Array.from(selectedIds).map(function (id) {
      return state.events.find(function (e) { return e.id === id; });
    }).filter(Boolean);
  }

  function renderSelectionPanel() {
    var bar = document.getElementById('selection-bar');
    if (!bar) return;
    var evs = selectedEvents();
    var show = !isReadOnly && currentView === 'timeline' && evs.length > 0;
    bar.hidden = !show;
    if (!show) return;

    document.getElementById('sel-count-n').textContent = String(evs.length);
    document.getElementById('sel-edit').hidden = evs.length !== 1;

    var classCat = state.categories.find(function (c) { return c.isClass; });
    var otherCat = state.categories.find(function (c) { return !c.isClass; });
    var allOther = evs.every(function (e) { var c = getCategory(e.categoryId); return c && !c.isClass; });
    var catBtn = document.getElementById('sel-cat');
    if (allOther && classCat) {
      catBtn.textContent = 'Сделать занятием';
      catBtn.dataset.target = classCat.id;
      catBtn.disabled = false;
    } else if (otherCat) {
      catBtn.textContent = 'Сделать делом';
      catBtn.dataset.target = otherCat.id;
      catBtn.disabled = false;
    } else {
      catBtn.textContent = 'Сделать делом';
      catBtn.disabled = true;
    }

    var allCancelled = evs.every(function (e) { return e.cancelled; });
    var cancelBtn = document.getElementById('sel-cancelled');
    cancelBtn.textContent = allCancelled ? 'Снять отмену' : 'Отметить отменённым';
    cancelBtn.dataset.value = allCancelled ? '' : '1';
  }

  function mutateSelected(mutateFn) {
    if (isReadOnly || !selectedIds.size) return;
    var ids = new Set(selectedIds);
    commit(function () {
      state.events.forEach(function (e) { if (ids.has(e.id)) mutateFn(e); });
    });
    refreshSelectionUI();
  }

  function deleteSelected() {
    if (isReadOnly || !selectedIds.size) return;
    var ids = new Set(selectedIds);
    var n = ids.size;
    showDialog(n === 1 ? 'Удалить выбранное занятие?' : 'Удалить выбранные занятия: ' + n + '?', true).then(function (ok) {
      if (!ok) return;
      commit(function () { state.events = state.events.filter(function (e) { return !ids.has(e.id); }); });
      selectedIds.clear();
      refreshSelectionUI();
    });
  }

  function bindSelectionBar() {
    document.getElementById('sel-edit').addEventListener('click', function () {
      var id = Array.from(selectedIds)[0];
      if (id) openEditModal(id);
    });
    document.getElementById('sel-cat').addEventListener('click', function () {
      var target = this.dataset.target;
      if (target) mutateSelected(function (e) { e.categoryId = target; });
    });
    document.getElementById('sel-cancelled').addEventListener('click', function () {
      var on = this.dataset.value === '1';
      mutateSelected(function (e) { if (on) e.cancelled = true; else delete e.cancelled; });
    });
    document.getElementById('sel-delete').addEventListener('click', deleteSelected);
    document.getElementById('sel-clear').addEventListener('click', clearSelection);

    var scroll = document.getElementById('grid-scroll');
    if (scroll) scroll.addEventListener('click', function (e) {
      if (isReadOnly || e.target.closest('.event')) return;
      clearSelection();
    });
  }

  function bindSelectionKeys() {
    document.addEventListener('keydown', function (e) {
      if (isReadOnly || !selectedIds.size) return;
      var t = e.target, tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
      if (document.querySelector('.modal-backdrop.open')) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      } else if (e.key === 'Escape') {
        clearSelection();
      }
    });
  }

  var SIDEBAR_COLLAPSE_KEY = 'schedulePlannerSidebarCollapsed';

  function bindSidebarToggle() {
    var layout = document.querySelector('.layout');
    var toggle = document.getElementById('sidebar-toggle');
    if (!layout || !toggle) return;

    var stored = null;
    try { stored = localStorage.getItem(SIDEBAR_COLLAPSE_KEY); } catch (e) { }
    var collapsed = stored === null ? isMobileViewport() : stored === 'true';
    applySidebarState(layout, toggle, collapsed);

    toggle.addEventListener('click', function () {
      var next = !layout.classList.contains('sidebar-collapsed');
      applySidebarState(layout, toggle, next);
      try { localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(next)); } catch (e) { }
    });

    window.addEventListener('resize', function () {
      applySidebarState(layout, toggle, layout.classList.contains('sidebar-collapsed'));
    });
  }

  function bindSidebarBackdrop() {
    var backdrop = document.getElementById('sidebar-backdrop');
    var layout = document.querySelector('.layout');
    var toggle = document.getElementById('sidebar-toggle');
    if (!backdrop || !layout || !toggle) return;
    backdrop.addEventListener('click', function () {
      applySidebarState(layout, toggle, true);
      try { localStorage.setItem(SIDEBAR_COLLAPSE_KEY, 'true'); } catch (e) { }
    });
  }

  function applySidebarState(layout, toggle, collapsed) {
    layout.classList.toggle('sidebar-collapsed', collapsed);
    toggle.textContent = collapsed ? '▶' : '◀';
    toggle.title = collapsed ? 'Показать панель' : 'Свернуть панель';
    var backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) backdrop.classList.toggle('open', !collapsed && isMobileViewport());
  }

  function init() {
    state.events.forEach(function (ev) { ensureNameColor(ev.title); });

    render();
    renderCategoryOptions();
    renderCategoryList();
    bindForms();
    bindImport();
    bindDialog();
    bindAuth();
    bindUndoRedo();
    bindSidebarToggle();
    bindSidebarBackdrop();
    bindDayTabs();
    bindViewTabs();
    bindSelectionBar();
    bindSelectionKeys();

    // Locked until Firebase Auth reports a signed-in user.
    updateAuthUI();
    applyReadOnlyUI();

    connectFirebase();
  }

  init();
})();
