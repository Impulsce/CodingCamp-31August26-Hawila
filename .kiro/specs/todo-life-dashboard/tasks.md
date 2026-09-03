# Implementation Plan: To-Do Life Dashboard

## Overview

Build a zero-dependency, single-page personal productivity dashboard delivered as three static files: `index.html`, `style.css`, and `app.js`. All behaviour is organized using the module-object pattern defined in the design. Every module reads and writes state exclusively through `StorageHelper`; the DOM is always derived from data, never treated as the source of truth.

---

## Tasks

- [x] 1. Scaffold the three static files with base structure
  - Create `index.html` with semantic `<section>` skeletons for `#greeting-section`, `#timer-section`, `#links-section`, and `#task-section`; link `style.css` and `app.js`
  - Create `style.css` with CSS custom property declarations for both light and dark themes (`--bg`, `--surface`, `--text-primary`, `--text-secondary`, `--accent`, `--border`) scoped to `:root` and `[data-theme="dark"]`
  - Create `app.js` with an empty `init()` function called on `DOMContentLoaded`; define stub objects for `StorageHelper`, `ThemeModule`, `GreetingModule`, `TimerModule`, `TaskModule`, and `QuickLinksModule`
  - _Requirements: 17.1, 17.2, 17.3_

- [ ] 2. Implement `StorageHelper`
  - [x] 2.1 Implement `StorageHelper.get(key, fallback)` — wrap `localStorage.getItem` + `JSON.parse` in a `try/catch`; return `fallback` when the key is absent or the stored value is corrupted JSON
  - [x] 2.2 Implement `StorageHelper.set(key, value)` — wrap `localStorage.setItem` + `JSON.stringify` in a `try/catch`; log a console warning on `QuotaExceededError` without throwing
  - [ ] 2.3 Write property test for `StorageHelper` round-trip (tasks)
    - **Property 1: localStorage round-trip preserves tasks**
    - Generates arbitrary arrays of Task objects via `fc.array(taskArbitrary())`; asserts deep equality after `set` → `get`
    - **Validates: Requirements 7.4, 11.1, 11.2**
  - [ ] 2.4 Write property test for `StorageHelper` round-trip (links)
    - **Property 2: localStorage round-trip preserves links**
    - Generates arbitrary arrays of Link objects; asserts deep equality after `set` → `get`
    - **Validates: Requirements 13.3, 14.2, 15.3**
  - _Requirements: 11.1, 11.2, 13.3_

- [ ] 3. Implement `ThemeModule`
  - [ ] 3.1 Implement `ThemeModule.apply(theme)` — set `document.documentElement.setAttribute('data-theme', theme)`; store the active theme value in a module-local variable
  - [ ] 3.2 Implement `ThemeModule.toggle()` — flip between `"light"` and `"dark"`, call `apply`, then `StorageHelper.set('tld_theme', …)`
  - [ ] 3.3 Implement `ThemeModule.init()` — call `StorageHelper.get('tld_theme', 'light')`; call `apply` with the result; bind the theme toggle button's click event to `toggle()`
  - [ ] 3.4 Wire `ThemeModule.init()` as the first call inside `init()` so the theme is applied before any other rendering to prevent a flash-of-unstyled-content
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [ ] 4. Implement `GreetingModule`
  - [ ] 4.1 Implement `getGreetingPrefix(hour)` as a pure function — map hour ranges to `"Good Morning"` (5–11), `"Good Afternoon"` (12–17), `"Good Evening"` (18–21), `"Good Night"` (all others)
  - [ ] 4.2 Write property test for `getGreetingPrefix`
    - **Property 5: Greeting prefix is total and well-defined for all hours**
    - Generates integers in [0, 23] via `fc.integer({ min: 0, max: 23 })`; asserts the result is one of the four valid strings and is never `null`, `undefined`, or empty
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
  - [ ] 4.3 Implement `GreetingModule.tick()` — read `new Date()`, format time as `HH:MM:SS`, format date as `"Day, DD Month YYYY"`, call `getGreetingPrefix(now.getHours())`, update the relevant DOM elements
  - [ ] 4.4 Implement `GreetingModule.saveName(name)` — validate the trimmed input is non-empty; call `StorageHelper.set('tld_name', name)`; re-render the greeting
  - [ ] 4.5 Implement `GreetingModule.init()` — read stored name via `StorageHelper.get('tld_name', 'Friend')`; render initial greeting; start `setInterval(tick, 1000)`; bind the name input submit event to `saveName`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 5. Implement `TimerModule`
  - [ ] 5.1 Implement `TimerModule.renderTime(seconds)` — format integer seconds as `"MM:SS"` with zero-padded minutes and seconds; return the string
  - [ ] 5.2 Write property test for `renderTime`
    - **Property 6: `renderTime` is a lossless encoding of seconds**
    - Generates integers in [0, 1500] via `fc.integer({ min: 0, max: 1500 })`; parses the returned `"MM:SS"` string back to total seconds and asserts `MM * 60 + SS === input`
    - **Validates: Requirements 4.1, 4.3**
  - [ ] 5.3 Implement `TimerModule.start()` — guard with `if (this.state.running) return`; set `running = true`; start `setInterval(tick, 1000)`
  - [ ] 5.4 Implement `TimerModule.stop()` — clear the interval; set `running = false`; retain `remaining`
  - [ ] 5.5 Implement `TimerModule.reset()` — call `stop()`; set `remaining = totalSeconds`; call `renderTime`
  - [ ] 5.6 Implement `TimerModule.tick()` — decrement `remaining`; call `renderTime`; if `remaining <= 0` call `complete()`
  - [ ] 5.7 Implement `TimerModule.complete()` — call `stop()`; attempt `audio.play()` and catch any rejection silently; show the visual completion cue element
  - [ ] 5.8 Implement `TimerModule.init()` — initialize in-memory state `{ totalSeconds: 1500, remaining: 1500, running: false, intervalId: null }`; render `25:00`; bind Start, Stop, and Reset button click events
  - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3_

- [ ] 6. Checkpoint — StorageHelper, ThemeModule, GreetingModule, and TimerModule complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement `TaskModule` — data helpers and CRUD
  - [ ] 7.1 Implement `TaskModule.loadTasks()` — return `StorageHelper.get('tld_tasks', [])`
  - [ ] 7.2 Implement `TaskModule.saveTasks(tasks)` — call `StorageHelper.set('tld_tasks', tasks)`
  - [ ] 7.3 Implement `TaskModule.addTask(desc)` — trim input; validate non-empty (show inline error if blank); build a `Task` object using `makeId('task')` and `Date.now()`; push to the in-memory array; call `saveTasks`; call `renderTasks`
  - [ ] 7.4 Write property test for `addTask` growth
    - **Property 7: Task addition grows the list by exactly one**
    - Generates arbitrary starting arrays and non-empty, non-whitespace description strings; asserts the array grows by exactly one and the new element's `description` matches input
    - **Validates: Requirements 7.2, 7.4, 7.5**
  - [ ] 7.5 Write property test for whitespace rejection
    - **Property 8: Whitespace-only descriptions are rejected**
    - Generates strings composed entirely of whitespace; asserts `addTask` leaves the stored array unchanged
    - **Validates: Requirements 7.3**
  - [ ] 7.6 Implement `TaskModule.editTask(id, newDesc)` — validate non-empty (show inline error if blank); mutate a copy of the array; call `saveTasks`; call `renderTasks`; cancel edit leaves storage unchanged
  - [ ] 7.7 Implement `TaskModule.deleteTask(id)` — filter the array by id; call `saveTasks`; call `renderTasks`
  - [ ] 7.8 Implement `TaskModule.toggleTask(id)` — flip the `completed` flag of the matching task; call `saveTasks`; call `renderTasks`
  - [ ] 7.9 Write property test for `toggleTask` involution
    - **Property 9: Task completion toggle is an involution**
    - Generates arbitrary task arrays; asserts that toggling the same task twice returns `completed` to its original value
    - **Validates: Requirements 9.2, 9.3**
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3_

- [ ] 8. Implement `TaskModule` — sorting and rendering
  - [ ] 8.1 Implement `sortTasks(tasks, order)` as a pure function — shallow-copy the input with `[...tasks]`; apply the correct comparator from the six `SortOrder` values; return the new sorted array without mutating the original
  - [ ] 8.2 Write property test for sort purity
    - **Property 3: Sort purity — no mutation of source array**
    - Generates arbitrary task arrays and any valid `SortOrder`; asserts the original array is unchanged after calling `sortTasks`
    - **Validates: Requirements 12.2**
  - [ ] 8.3 Write property test for sort completeness
    - **Property 4: Sort completeness — no tasks lost or duplicated**
    - Generates arbitrary task arrays and any valid `SortOrder`; asserts the returned array has the same length and same set of task IDs as the input
    - **Validates: Requirements 12.2**
  - [ ] 8.4 Implement `TaskModule.renderTasks(tasks)` — clear the list DOM container; for each task in `sortTasks(tasks, currentOrder)`, create and append an element with checkbox, description text, edit button, and delete button; apply completed visual style when `task.completed` is true
  - [ ] 8.5 Implement sort control binding — read `StorageHelper.get('tld_sort', 'newest')`; set the dropdown to the stored value; bind the `change` event to update `currentOrder`, call `saveTasks` (to persist sort pref via `StorageHelper.set('tld_sort', …)`), and re-render
  - [ ] 8.6 Implement `TaskModule.init()` — call `loadTasks()`; call `renderTasks`; bind the add-task form submit; bind the sort dropdown; wire edit and delete button events via delegation
  - _Requirements: 11.1, 11.2, 12.1, 12.2, 12.3, 12.4_

- [ ] 9. Implement `QuickLinksModule`
  - [ ] 9.1 Implement `isValidUrl(url)` as a pure function — return `true` only if `url.startsWith('http://') || url.startsWith('https://')`
  - [ ] 9.2 Write property test for URL validation
    - **Property 10: URL validation rejects non-http/https schemes**
    - Generates arbitrary strings that do not start with `"http://"` or `"https://"`; asserts `isValidUrl` returns `false` and `addLink` leaves the links array unchanged
    - **Validates: Requirements 14.4**
  - [ ] 9.3 Implement `QuickLinksModule.loadLinks()` / `saveLinks(links)` — mirror the task helpers using key `tld_links`
  - [ ] 9.4 Implement `QuickLinksModule.addLink(label, url)` — validate label non-empty and url non-empty (show per-field inline error if blank); validate url with `isValidUrl` (show scheme error if invalid); build a `Link` object with `makeId('link')`; push to array; call `saveLinks`; call `renderLinks`
  - [ ] 9.5 Implement `QuickLinksModule.deleteLink(id)` — filter array; call `saveLinks`; call `renderLinks`
  - [ ] 9.6 Implement `QuickLinksModule.renderLinks(links)` — clear the links DOM container; append one `<a>` element per link with `href`, `target="_blank"`, `rel="noopener noreferrer"`, and a delete button
  - [ ] 9.7 Implement `QuickLinksModule.init()` — call `loadLinks()`; call `renderLinks`; bind the add-link form submit; wire delete button events via delegation
  - _Requirements: 13.1, 13.2, 13.3, 14.1, 14.2, 14.3, 14.4, 15.1, 15.2, 15.3_

- [ ] 10. Checkpoint — TaskModule and QuickLinksModule complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement responsive CSS layout
  - [ ] 11.1 Add CSS grid layout to the main container — desktop (≥ 768px): two-column grid with the timer and quick-links side by side; task list spanning full width below
  - [ ] 11.2 Add a `@media (max-width: 767px)` breakpoint that collapses to a single-column flex/grid so all sections stack vertically without horizontal overflow
  - [ ] 11.3 Set global typography minimums — `body { font-size: 14px }` and headings `≥ 16px`; verify layout renders correctly at 320px and 1920px viewport widths
  - _Requirements: 18.1, 18.2, 18.3_

- [ ] 12. Implement accessibility — ARIA, keyboard navigation, and focus indicators
  - [ ] 12.1 Add `aria-label` or `aria-labelledby` attributes to all interactive controls (theme toggle, name input, timer buttons, task add/edit/delete, sort dropdown, link add/delete); add `role="list"` and `role="listitem"` where semantic list elements are not used
  - [ ] 12.2 Add visible `:focus-visible` outline styles in `style.css` using the `--accent` custom property so keyboard focus is always clearly visible; ensure no outline is suppressed with `outline: none` without a replacement
  - [ ] 12.3 Verify WCAG 2.1 AA color contrast for `--text-primary` on `--bg` and `--surface` in both light and dark themes; adjust values if needed
  - _Requirements: 16.6, 16.7_

- [ ] 13. Final checkpoint — full integration
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All property-based tests use **fast-check** loaded via CDN (`<script src="https://cdn.jsdelivr.net/npm/fast-check/lib/fast-check.min.js">`) or imported in a Node/Vitest test file — no bundler required
- Each property test should run a minimum of 100 iterations (`{ numRuns: 100 }`)
- Tag each property test with the comment format: `// Feature: todo-life-dashboard, Property N: <property text>`
- `makeId(prefix)` is a shared helper: `return \`\${prefix}_\${Date.now()}\``; place it at the top of `app.js` before the module objects
- Timer state is intentionally NOT persisted to `localStorage` — a page reload always starts at 25:00
- The `ThemeModule.init()` call MUST be first in `init()` to avoid a flash of wrong theme on load
- All link `<a>` elements must include `rel="noopener noreferrer"` alongside `target="_blank"`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "2.2"] },
    { "id": 1, "tasks": ["2.3", "2.4", "3.1", "3.2", "4.1", "5.1"] },
    { "id": 2, "tasks": ["3.3", "3.4", "4.2", "4.3", "4.4", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7"] },
    { "id": 3, "tasks": ["4.5", "5.8", "7.1", "7.2", "9.1", "9.3"] },
    { "id": 4, "tasks": ["7.3", "7.6", "7.7", "7.8", "8.1", "9.4", "9.5", "9.6"] },
    { "id": 5, "tasks": ["7.4", "7.5", "7.9", "8.2", "8.3", "8.4", "8.5", "9.2"] },
    { "id": 6, "tasks": ["7.6", "8.6", "9.7"] },
    { "id": 7, "tasks": ["11.1", "11.2", "11.3"] },
    { "id": 8, "tasks": ["12.1", "12.2", "12.3"] }
  ]
}
```
