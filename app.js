/* ============================================================
   To-Do Life Dashboard — app.js
   Single-file, module-object pattern.
   No ES modules, no build tools — works via file:// protocol.
   ============================================================ */

'use strict';

/* ── Shared helper: ID generation ─────────────────────────── */

/**
 * Generate a namespaced, timestamp-based ID.
 * Sufficient for single-user, single-tab local use.
 * @param {string} prefix  e.g. "task" | "link"
 * @returns {string}       e.g. "task_1721500000000"
 */
function makeId(prefix) {
  return `${prefix}_${Date.now()}`;
}

/* ── StorageHelper ─────────────────────────────────────────── */

/**
 * Thin wrapper around localStorage with JSON serialization and
 * graceful error handling. All modules read/write through here
 * so serialization logic is never duplicated.
 */
const StorageHelper = {
  /**
   * Read a value from localStorage.
   * Returns `fallback` when the key is absent or the stored
   * value is corrupted JSON.
   * @param {string} key
   * @param {*} fallback
   * @returns {*}
   */
  get(key, fallback = null) {
    // stub — full implementation in task 2.1
  },

  /**
   * Write a value to localStorage as serialized JSON.
   * Catches QuotaExceededError and logs a warning without throwing.
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    // stub — full implementation in task 2.2
  },
};

/* ── ThemeModule ───────────────────────────────────────────── */

/**
 * Manages light / dark theme — applies a data-theme attribute on
 * <html> and persists the preference to localStorage.
 * Must be initialised first inside init() to avoid a
 * flash-of-wrong-theme before other modules render.
 */
const ThemeModule = {
  /** @type {'light'|'dark'} Tracks the currently active theme */
  _current: 'light',

  /**
   * Apply `theme` to the document and store it as the active value.
   * @param {'light'|'dark'} theme
   */
  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this._current = theme;
  },

  /**
   * Toggle between 'light' and 'dark', then persist the new value.
   */
  toggle() {
    const next = this._current === 'light' ? 'dark' : 'light';
    this.apply(next);
    StorageHelper.set('tld_theme', next);
  },

  /**
   * Load the stored theme (default 'light') and bind the toggle button.
   */
  init() {
    // stub — full implementation in task 3.3 / 3.4
  },
};

/* ── GreetingModule ────────────────────────────────────────── */

/**
 * Displays and auto-updates the clock, date, greeting prefix,
 * and personalized name.
 * DOM slice: #greeting-section
 */
const GreetingModule = {
  /**
   * Pure function: maps an hour (0–23) to a greeting prefix string.
   * @param {number} hour  integer in [0, 23]
   * @returns {'Good Morning'|'Good Afternoon'|'Good Evening'|'Good Night'}
   */
  getGreetingPrefix(hour) {
    if (hour >= 5  && hour <= 11) return 'Good Morning';
    if (hour >= 12 && hour <= 17) return 'Good Afternoon';
    if (hour >= 18 && hour <= 21) return 'Good Evening';
    return 'Good Night';  // 22–23 and 0–4
  },

  /**
   * Called every second by setInterval; updates time, date, and greeting.
   */
  tick() {
    // stub — full implementation in task 4.3
  },

  /**
   * Validate and save the user's name; re-render the greeting.
   * @param {string} name
   */
  saveName(name) {
    // stub — full implementation in task 4.4
  },

  /**
   * Read stored name, render initial greeting, start the clock interval,
   * bind the name-input submit event.
   */
  init() {
    // stub — full implementation in task 4.5
  },
};

/* ── TimerModule ───────────────────────────────────────────── */

/**
 * 25-minute Pomodoro-style countdown with Start / Stop / Reset.
 * Plays an audio alert and shows a visual cue on completion.
 * Timer state is intentionally NOT persisted — a page reload
 * always starts fresh at 25:00.
 * DOM slice: #timer-section
 */
const TimerModule = {
  /** @type {{ totalSeconds: number, remaining: number, running: boolean, intervalId: number|null }} */
  state: {
    totalSeconds: 1500,  // 25 minutes
    remaining:    1500,
    running:      false,
    intervalId:   null,
  },

  /**
   * Format integer seconds as a zero-padded "MM:SS" string.
   * @param {number} seconds  integer in [0, ∞)
   * @returns {string}        e.g. "25:00" | "04:59"
   */
  renderTime(seconds) {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  },

  /**
   * Begin counting down. No-op if already running.
   */
  start() {
    // stub — full implementation in task 5.3
  },

  /**
   * Pause the countdown; retain the current remaining time.
   */
  stop() {
    // stub — full implementation in task 5.4
  },

  /**
   * Stop and reset the display to 25:00.
   */
  reset() {
    // stub — full implementation in task 5.5
  },

  /**
   * Decrement remaining, re-render, and trigger complete() at zero.
   */
  tick() {
    // stub — full implementation in task 5.6
  },

  /**
   * Called when the timer reaches 00:00 — stop, play audio, show cue.
   */
  complete() {
    // stub — full implementation in task 5.7
  },

  /**
   * Initialize state, render 25:00, bind Start / Stop / Reset events.
   */
  init() {
    // stub — full implementation in task 5.8
  },
};

/* ── TaskModule ────────────────────────────────────────────── */

/**
 * Full CRUD for tasks with sort and localStorage persistence.
 * DOM slice: #task-section
 */
const TaskModule = {
  /** @type {Array<{id:string, description:string, completed:boolean, createdAt:number}>} */
  _tasks: [],

  /** @type {string} Active sort order key */
  _sortOrder: 'newest',

  /**
   * Read tasks from localStorage.
   * @returns {Array}
   */
  loadTasks() {
    // stub — full implementation in task 7.1
  },

  /**
   * Write tasks to localStorage.
   * @param {Array} tasks
   */
  saveTasks(tasks) {
    // stub — full implementation in task 7.2
  },

  /**
   * Validate, build, and append a new task; persist and re-render.
   * @param {string} desc
   */
  addTask(desc) {
    // stub — full implementation in task 7.3
  },

  /**
   * Update an existing task's description; persist and re-render.
   * @param {string} id
   * @param {string} newDesc
   */
  editTask(id, newDesc) {
    // stub — full implementation in task 7.6
  },

  /**
   * Remove a task by id; persist and re-render.
   * @param {string} id
   */
  deleteTask(id) {
    // stub — full implementation in task 7.7
  },

  /**
   * Flip the completed flag of a task; persist and re-render.
   * @param {string} id
   */
  toggleTask(id) {
    // stub — full implementation in task 7.8
  },

  /**
   * Pure function — return a NEW sorted copy without mutating input.
   * @param {Array} tasks
   * @param {string} order  SortOrder value
   * @returns {Array}
   */
  sortTasks(tasks, order) {
    // stub — full implementation in task 8.1
  },

  /**
   * Clear and rebuild the task list DOM from the supplied array.
   * @param {Array} tasks
   */
  renderTasks(tasks) {
    // stub — full implementation in task 8.4
  },

  /**
   * Load tasks + sort preference, render, bind controls.
   */
  init() {
    // stub — full implementation in task 8.6
  },
};

/* ── QuickLinksModule ──────────────────────────────────────── */

/**
 * CRUD for quick-access bookmarks with localStorage persistence.
 * DOM slice: #links-section
 */
const QuickLinksModule = {
  /** @type {Array<{id:string, label:string, url:string}>} */
  _links: [],

  /**
   * Read links from localStorage.
   * @returns {Array}
   */
  loadLinks() {
    // stub — full implementation in task 9.3
  },

  /**
   * Write links to localStorage.
   * @param {Array} links
   */
  saveLinks(links) {
    // stub — full implementation in task 9.3
  },

  /**
   * Validate and add a new link; persist and re-render.
   * @param {string} label
   * @param {string} url
   */
  addLink(label, url) {
    // stub — full implementation in task 9.4
  },

  /**
   * Remove a link by id; persist and re-render.
   * @param {string} id
   */
  deleteLink(id) {
    // stub — full implementation in task 9.5
  },

  /**
   * Clear and rebuild the links list DOM.
   * @param {Array} links
   */
  renderLinks(links) {
    // stub — full implementation in task 9.6
  },

  /**
   * Load links, render, bind the add-link form and delete delegation.
   */
  init() {
    // stub — full implementation in task 9.7
  },
};

/* ── Bootstrap ─────────────────────────────────────────────── */

/**
 * Single entry point — called once on DOMContentLoaded.
 * ThemeModule must be first to prevent flash-of-wrong-theme.
 */
function init() {
  ThemeModule.init();
  GreetingModule.init();
  TimerModule.init();
  TaskModule.init();
  QuickLinksModule.init();
}

document.addEventListener('DOMContentLoaded', init);
