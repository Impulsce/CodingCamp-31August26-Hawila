# To-Do Life Dashboard

A zero-dependency personal productivity dashboard built for RevoU CodingCamp. Three static files — `index.html`, `style.css`, `app.js` — and nothing else. No server, no build step, no internet required. Just open the file and use it.

---

## What It Does

The dashboard combines four productivity tools in one page:

| Section | What it does |
|---|---|
| **Greeting** | Live clock (HH:MM:SS), today's date, and a time-sensitive greeting (Good Morning / Afternoon / Evening / Night). Personalise it by typing your name. |
| **Focus Timer** | 25-minute Pomodoro countdown. Start, pause, and reset. Plays an audio alert and shows a visual banner when it hits 00:00. |
| **Quick Links** | Save your most-visited URLs as labelled bookmarks. Each link opens in a new tab. |
| **To-Do List** | Add, edit, check off, and delete tasks. Six sort options: Newest, Oldest, A–Z, Z–A, Incomplete first, Complete first. |

Everything is stored in `localStorage` — your tasks, links, name, theme preference, and sort order all survive page refreshes.

---

## Getting Started

No installation needed for the app itself. Just open `index.html` in your browser, or drag it into any browser window. Works via `file://` with no local server.

**Browser support:** Chrome, Firefox, Edge, Safari (any version released in the last 3 years).

---

## Project Structure

```
index.html               ← Page shell and all visible markup
style.css                ← All visual rules and CSS custom properties for theming
app.js                   ← All behaviour (module-object pattern, no bundler needed)
package.json             ← Dev dependencies for testing only (Vitest + fast-check)
tests/
  storage-tasks.test.js  ← Property test: localStorage round-trip preserves tasks
  storage-links.test.js  ← Property test: localStorage round-trip preserves links
  greeting.test.js       ← Property test: getGreetingPrefix covers all 24 hours
  timer.test.js          ← Property test: renderTime is a lossless encoding
  tasks.test.js          ← Property tests: addTask growth, whitespace rejection, toggle involution
  sort.test.js           ← Property tests: sort purity and completeness
  links.test.js          ← Property test: URL validation
```

---

## JavaScript Architecture

`app.js` uses a **module-object pattern** — one plain object per feature area, no ES modules, no bundler. This lets the whole app live in a single file that works when opened directly via `file://`.

```
init()  ← called on DOMContentLoaded
  ├── ThemeModule.init()        (first — prevents flash-of-wrong-theme before paint)
  ├── GreetingModule.init()     (starts the 1-second clock interval)
  ├── TimerModule.init()        (renders 25:00 and binds Start / Stop / Reset)
  ├── TaskModule.init()         (loads tasks from localStorage and binds all controls)
  └── QuickLinksModule.init()   (loads links from localStorage and binds all controls)
```

Every module reads and writes through `StorageHelper` — a thin wrapper around `localStorage.getItem` / `setItem` with JSON serialization and graceful error handling. No module touches `localStorage` directly.

### localStorage Keys

| Key | Module | Type | Default |
|---|---|---|---|
| `tld_name` | GreetingModule | string | `"Friend"` |
| `tld_theme` | ThemeModule | `"light"` or `"dark"` | `"light"` |
| `tld_tasks` | TaskModule | Task array | `[]` |
| `tld_sort` | TaskModule | sort order string | `"newest"` |
| `tld_links` | QuickLinksModule | Link array | `[]` |

### Data Models

**Task**

```jsonc
{
  "id": "task_1721500000000",   // "task_" + Date.now() at creation time
  "description": "Buy groceries",
  "completed": false,
  "createdAt": 1721500000000    // Unix ms timestamp
}
```

**Link**

```jsonc
{
  "id": "link_1721500001234",   // "link_" + Date.now() at creation time
  "label": "GitHub",
  "url": "https://github.com"
}
```

**Sort orders** (stored in `tld_sort`): `newest`, `oldest`, `az`, `za`, `incomplete`, `complete`.

---

## Theming

Light and dark themes are driven entirely by CSS custom properties. `ThemeModule.apply(theme)` sets a single `data-theme` attribute on `<html>`, which triggers a full repaint instantly via the cascade.

```css
:root                { --bg: #f5f5f5; --surface: #ffffff; --text-primary: #1a1a1a; --accent: #4f46e5; }
[data-theme="dark"]  { --bg: #0f0f0f; --surface: #1e1e1e; --text-primary: #f0f0f0; --accent: #818cf8; }
```

The saved preference is loaded as the very first call in `init()`, so there is never a flash of the wrong theme on page load.

---

## Running the Tests

The test suite is for development only — the app itself has no runtime dependencies.

```bash
npm install         # installs Vitest and fast-check as dev dependencies
npm test            # run all property tests once
npm run test:watch  # re-run on file changes
```

Tests run under [Vitest](https://vitest.dev/) with jsdom (to simulate `localStorage`) and [fast-check](https://fast-check.dev/) for property-based testing. There are 10 correctness properties, each verified against at least 100 randomly generated inputs:

| # | Property |
|---|---|
| 1 | `localStorage` round-trip preserves any array of Task objects |
| 2 | `localStorage` round-trip preserves any array of Link objects |
| 3 | `sortTasks` never mutates the input array |
| 4 | `sortTasks` always returns an array with the same length and same task IDs |
| 5 | `getGreetingPrefix` returns one of the four valid strings for every hour in 0–23 |
| 6 | `renderTime` encodes seconds losslessly — parsing the MM:SS output gives back the original value |
| 7 | `addTask` with a non-empty description always grows the list by exactly one |
| 8 | `addTask` with a whitespace-only description never changes the list |
| 9 | Toggling a task's completion state twice always returns it to its original value |
| 10 | `isValidUrl` rejects every string that does not begin with `http://` or `https://` |

---

## Feature Summary

- **Greeting:** Time-based prefix, live HH:MM:SS clock, customisable name persisted in `localStorage`. Default name is "Friend".
- **Focus Timer:** 25-minute countdown with Start / Stop / Reset. Plays an audio alert and shows a completion banner at 00:00. Timer state is intentionally not persisted — a page reload always starts fresh at 25:00.
- **Quick Links:** Add bookmarks with a label and URL. Links open in a new tab with `rel="noopener noreferrer"`. URL must start with `http://` or `https://`.
- **Tasks:** Full CRUD — add, edit, delete, toggle completion. Six sort orders. Sort preference persisted.
- **Theme:** Light/dark toggle. Preference persisted. Applied before first paint to avoid flicker.
- **Accessibility:** ARIA labels and roles on all interactive controls and dynamic lists. Visible `:focus-visible` outlines on every focusable element. WCAG 2.1 AA contrast ratios maintained in both themes.
- **Responsive:** Two-column grid on desktop (≥768px) with timer and quick links side by side, full-width task list below. Single-column stack on mobile (<768px). Minimum `font-size: 14px` throughout.

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| `localStorage` quota exceeded on write | `StorageHelper.set` catches the error, logs a console warning, and returns silently. The app continues working in-memory. |
| Corrupted JSON in `localStorage` on read | `StorageHelper.get` catches the `SyntaxError` and returns the configured fallback (empty array or default string). No crash. |
| Task or link submitted with blank input | Inline error message shown next to the field. Storage is not touched. |
| Link URL missing `http://` or `https://` | Inline error: "URL must start with http:// or https://". Storage is not touched. |
| `start()` called on a running timer | No-op — `start()` guards with `if (this.state.running) return`. |
| Browser blocks audio autoplay | `audio.play()` returns a rejected Promise; the rejection is caught silently. The visual completion banner always appears. |

---

*Built as part of RevoU CodingCamp — August 2026 cohort.*
