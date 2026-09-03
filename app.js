/* ============================================================
   To-Do Life Dashboard — app.js
   Single-file, module-object pattern.
   No ES modules, no build tools — works via file:// protocol.
   ============================================================ */

'use strict';

/* ── Shared helper: ID generation ─────────────────────────── */

function makeId(prefix) {
  return `${prefix}_${Date.now()}`;
}

/* ── StorageHelper ─────────────────────────────────────────── */

const StorageHelper = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }
  },
};

/* ── GreetingModule ────────────────────────────────────────── */

const GreetingModule = {
  _name: 'Friend',
  _intervalId: null,

  getGreetingPrefix(hour) {
    if (hour >= 5  && hour <= 11) return 'Good Morning';
    if (hour >= 12 && hour <= 17) return 'Good Afternoon';
    if (hour >= 18 && hour <= 21) return 'Good Evening';
    return 'Good Night';
  },

  tick() {
    const now = new Date();

    // Time: HH:MM:SS — Intl-based, always 24-hour with seconds, respects locale
    const timeStr = now.toLocaleTimeString(undefined, {
      hour:   '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const timeEl = document.getElementById('clock-time');
    if (timeEl) timeEl.textContent = timeStr;

    // Date: Day, DD Month YYYY — using Intl for correct locale-aware formatting
    const dateStr = now.toLocaleDateString(undefined, {
      weekday: 'long',
      day:     'numeric',
      month:   'long',
      year:    'numeric',
    });
    const dateEl = document.getElementById('clock-date');
    if (dateEl) dateEl.textContent = dateStr;

    // Greeting prefix
    const prefixEl = document.getElementById('greeting-prefix');
    if (prefixEl) prefixEl.textContent = this.getGreetingPrefix(now.getHours());

    // Name
    const nameEl = document.getElementById('greeting-name');
    if (nameEl) nameEl.textContent = this._name;
  },

  saveName(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    this._name = trimmed;
    StorageHelper.set('tld_name', trimmed);
    this.tick();
  },

  init() {
    this._name = StorageHelper.get('tld_name', 'Friend');
    this.tick();
    this._intervalId = setInterval(() => this.tick(), 1000);

    const form = document.getElementById('name-form');
    const input = document.getElementById('name-input');
    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveName(input.value);
        input.value = '';
      });
    }
  },
};

/* ── TimerModule ───────────────────────────────────────────── */

const TimerModule = {
  state: {
    totalSeconds: 1500,
    remaining:    1500,
    running:      false,
    intervalId:   null,
  },

  renderTime(seconds) {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  },

  _updateDisplay() {
    const el = document.getElementById('timer-display');
    if (el) el.textContent = this.renderTime(this.state.remaining);
  },

  start() {
    if (this.state.running) return;
    this.state.running = true;
    const cue = document.getElementById('timer-complete-cue');
    if (cue) cue.classList.add('hidden');
    this.state.intervalId = setInterval(() => this.tick(), 1000);
  },

  stop() {
    clearInterval(this.state.intervalId);
    this.state.intervalId = null;
    this.state.running = false;
  },

  reset() {
    this.stop();
    this.state.remaining = this.state.totalSeconds;
    this._updateDisplay();
    const cue = document.getElementById('timer-complete-cue');
    if (cue) cue.classList.add('hidden');
  },

  tick() {
    this.state.remaining--;
    this._updateDisplay();
    if (this.state.remaining <= 0) this.complete();
  },

  complete() {
    this.stop();
    const audio = document.getElementById('timer-audio');
    if (audio) audio.play().catch(() => {});
    const cue = document.getElementById('timer-complete-cue');
    if (cue) cue.classList.remove('hidden');
  },

  init() {
    this.state = { totalSeconds: 1500, remaining: 1500, running: false, intervalId: null };
    this._updateDisplay();

    const startBtn = document.getElementById('timer-start');
    const stopBtn  = document.getElementById('timer-stop');
    const resetBtn = document.getElementById('timer-reset');

    if (startBtn) startBtn.addEventListener('click', () => this.start());
    if (stopBtn)  stopBtn.addEventListener('click',  () => this.stop());
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
  },
};

/* ── TaskModule ────────────────────────────────────────────── */

const TaskModule = {
  _tasks: [],
  _sortOrder: 'newest',

  loadTasks() {
    return StorageHelper.get('tld_tasks', []);
  },

  saveTasks(tasks) {
    StorageHelper.set('tld_tasks', tasks);
  },

  addTask(desc) {
    const trimmed = desc.trim();
    const errEl = document.getElementById('task-input-error');
    if (!trimmed) {
      if (errEl) { errEl.textContent = 'Task cannot be empty.'; errEl.classList.remove('hidden'); }
      return;
    }

    // Duplicate limit: block a third task with the same description (case-insensitive)
    const dupCount = this._tasks.filter(
      t => t.description.toLowerCase() === trimmed.toLowerCase()
    ).length;
    if (dupCount >= 2) {
      if (errEl) { errEl.textContent = 'You already have 2 tasks with this description.'; errEl.classList.remove('hidden'); }
      return;
    }

    if (errEl) errEl.classList.add('hidden');

    const task = { id: makeId('task'), description: trimmed, completed: false, createdAt: Date.now() };
    this._tasks.push(task);
    this.saveTasks(this._tasks);
    this.renderTasks(this._tasks);
  },

  editTask(id, newDesc) {
    const trimmed = newDesc.trim();
    if (!trimmed) return;

    // Duplicate limit: count how many OTHER tasks already have this description
    const dupCount = this._tasks.filter(
      t => t.id !== id && t.description.toLowerCase() === trimmed.toLowerCase()
    ).length;
    if (dupCount >= 2) {
      // Surface error via the global task-input-error element as a fallback
      const errEl = document.getElementById('task-input-error');
      if (errEl) { errEl.textContent = 'You already have 2 tasks with this description.'; errEl.classList.remove('hidden'); }
      return;
    }

    this._tasks = this._tasks.map(t => t.id === id ? { ...t, description: trimmed } : t);
    this.saveTasks(this._tasks);
    this.renderTasks(this._tasks);
  },

  deleteTask(id) {
    this._tasks = this._tasks.filter(t => t.id !== id);
    this.saveTasks(this._tasks);
    this.renderTasks(this._tasks);
  },

  toggleTask(id) {
    this._tasks = this._tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    this.saveTasks(this._tasks);
    this.renderTasks(this._tasks);
  },

  sortTasks(tasks, order) {
    const copy = [...tasks];
    const comparators = {
      newest:     (a, b) => b.createdAt - a.createdAt,
      oldest:     (a, b) => a.createdAt - b.createdAt,
      az:         (a, b) => a.description.toLowerCase().localeCompare(b.description.toLowerCase()),
      za:         (a, b) => b.description.toLowerCase().localeCompare(a.description.toLowerCase()),
      incomplete: (a, b) => Number(a.completed) - Number(b.completed),
      complete:   (a, b) => Number(b.completed) - Number(a.completed),
    };
    return copy.sort(comparators[order] ?? comparators.newest);
  },

  renderTasks(tasks) {
    const list = document.getElementById('task-list');
    if (!list) return;
    list.innerHTML = '';
    const sorted = this.sortTasks(tasks, this._sortOrder);

    sorted.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item${task.completed ? ' completed' : ''}`;
      li.setAttribute('role', 'listitem');
      li.dataset.id = task.id;

      // Checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.setAttribute('aria-label', `Mark "${task.description}" as ${task.completed ? 'incomplete' : 'complete'}`);
      checkbox.addEventListener('change', () => this.toggleTask(task.id));

      // Description span
      const span = document.createElement('span');
      span.className = 'task-description';
      span.textContent = task.description;

      // Actions
      const actions = document.createElement('div');
      actions.className = 'task-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-secondary';
      editBtn.textContent = '✎';
      editBtn.setAttribute('aria-label', `Edit task: ${task.description}`);
      editBtn.addEventListener('click', () => this._startEdit(li, task));

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-danger';
      deleteBtn.textContent = '✕';
      deleteBtn.setAttribute('aria-label', `Delete task: ${task.description}`);
      deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(actions);
      list.appendChild(li);
    });
  },

  _startEdit(li, task) {
    const span = li.querySelector('.task-description');
    const actions = li.querySelector('.task-actions');
    if (!span || !actions) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-edit-input';
    input.value = task.description;
    input.setAttribute('aria-label', 'Edit task description');

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = '✓';
    saveBtn.setAttribute('aria-label', 'Save edit');

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.textContent = '✕';
    cancelBtn.setAttribute('aria-label', 'Cancel edit');

    const save = () => { this.editTask(task.id, input.value); };
    const cancel = () => { this.renderTasks(this._tasks); };

    saveBtn.addEventListener('click', save);
    cancelBtn.addEventListener('click', cancel);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') save();
      if (e.key === 'Escape') cancel();
    });

    span.replaceWith(input);
    actions.innerHTML = '';
    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);
    input.focus();
  },

  init() {
    this._tasks = this.loadTasks();
    this._sortOrder = StorageHelper.get('tld_sort', 'newest');

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.value = this._sortOrder;
      sortSelect.addEventListener('change', () => {
        this._sortOrder = sortSelect.value;
        StorageHelper.set('tld_sort', this._sortOrder);
        this.renderTasks(this._tasks);
      });
    }

    const form = document.getElementById('task-form');
    const input = document.getElementById('task-input');
    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addTask(input.value);
        input.value = '';
      });
    }

    this.renderTasks(this._tasks);
  },
};

/* ── QuickLinksModule ──────────────────────────────────────── */

const QuickLinksModule = {
  _links: [],

  loadLinks() {
    return StorageHelper.get('tld_links', []);
  },

  saveLinks(links) {
    StorageHelper.set('tld_links', links);
  },

  isValidUrl(url) {
    return url.startsWith('http://') || url.startsWith('https://');
  },

  addLink(label, url) {
    const labelTrimmed = label.trim();
    const urlTrimmed   = url.trim();
    const labelErr = document.getElementById('link-label-error');
    const urlErr   = document.getElementById('link-url-error');

    let valid = true;
    if (labelErr) labelErr.classList.add('hidden');
    if (urlErr)   urlErr.classList.add('hidden');

    if (!labelTrimmed) {
      if (labelErr) { labelErr.textContent = 'Label cannot be empty.'; labelErr.classList.remove('hidden'); }
      valid = false;
    }
    if (!urlTrimmed) {
      if (urlErr) { urlErr.textContent = 'URL cannot be empty.'; urlErr.classList.remove('hidden'); }
      valid = false;
    } else if (!this.isValidUrl(urlTrimmed)) {
      if (urlErr) { urlErr.textContent = 'URL must start with http:// or https://'; urlErr.classList.remove('hidden'); }
      valid = false;
    }

    if (!valid) return;

    const link = { id: makeId('link'), label: labelTrimmed, url: urlTrimmed };
    this._links.push(link);
    this.saveLinks(this._links);
    this.renderLinks(this._links);
  },

  deleteLink(id) {
    this._links = this._links.filter(l => l.id !== id);
    this.saveLinks(this._links);
    this.renderLinks(this._links);
  },

  renderLinks(links) {
    const list = document.getElementById('links-list');
    if (!list) return;
    list.innerHTML = '';

    links.forEach(link => {
      const li = document.createElement('li');
      li.setAttribute('role', 'listitem');

      const a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = link.label;
      a.setAttribute('aria-label', `Open ${link.label} in new tab`);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-danger';
      deleteBtn.textContent = '✕';
      deleteBtn.setAttribute('aria-label', `Delete link: ${link.label}`);
      deleteBtn.addEventListener('click', () => this.deleteLink(link.id));

      li.appendChild(a);
      li.appendChild(deleteBtn);
      list.appendChild(li);
    });
  },

  init() {
    this._links = this.loadLinks();
    this.renderLinks(this._links);

    const form       = document.getElementById('link-form');
    const labelInput = document.getElementById('link-label-input');
    const urlInput   = document.getElementById('link-url-input');

    if (form && labelInput && urlInput) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addLink(labelInput.value, urlInput.value);
        labelInput.value = '';
        urlInput.value   = '';
      });
    }
  },
};

/* ── Bootstrap ─────────────────────────────────────────────── */

function init() {
  GreetingModule.init();
  TimerModule.init();
  TaskModule.init();
  QuickLinksModule.init();
}

document.addEventListener('DOMContentLoaded', init);
