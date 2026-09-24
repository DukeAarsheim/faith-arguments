# Faith Arguments Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the static-site architecture for a black-themed, interactive "Faith Arguments" website — a home page showing topics as a web of connected bubbles (with a grid-view alternative), and a single reusable topic page template that renders an expandable argument tree and objections accordion from JSON data.

**Architecture:** Plain HTML/CSS/JS, no build step. One `topic.html` template reads `?topic=<slug>` and renders from `data/<slug>.json`, so adding a topic later never touches code. A `window.FaithApp` global namespace (populated by classic `<script>` tags, no bundler) holds shared logic: loading topics, `localStorage`-backed visited/layout state, and the shared nav.

**Tech Stack:** Vanilla HTML/CSS/JS. No frameworks, no npm dependencies in the shipped site. `npx serve` (via `.claude/launch.json`) for local preview only — not a project dependency.

**Spec:** [docs/superpowers/specs/2026-09-23-faith-arguments-website-design.md](../specs/2026-09-23-faith-arguments-website-design.md)

## Global Constraints

- No build step, no framework, no runtime dependencies in the shipped site (spec: Tech stack).
- One fixed dark theme: black page background, white/gray text and borders only — no light mode, no other saturated colors (spec: Visual design).
- Adding a topic requires only a new `data/<slug>.json` file plus one entry in `data/topics.json` — zero HTML/JS changes (spec: Core architectural decision).
- No automated test suite; verification is manual, in-browser (spec: Testing / verification plan).
- `localStorage` access must be wrapped so a blocked/unavailable store degrades gracefully rather than breaking the page (spec: Error handling).

---

## Task 1: Project scaffold, theme, and page shells

**Files:**
- Create: `.claude/launch.json`
- Create: `css/style.css`
- Create: `index.html`
- Create: `topic.html`

**Interfaces:**
- Produces: the CSS class vocabulary every later task's markup depends on — `site-header`, `site-title`, `site-nav`, `nav-link`, `nav-link.active`, `nav-check`, `kebab-btn`, `kebab-dot`, `kebab-menu`, `kebab-menu.open`, `kebab-menu .check`/`.check.visible`, `topic-web`, `web-line`/`web-line.hovered`, `web-hub`, `topic-node`, `node-circle`, `node-label`, `star-dot`, `star-sparkle`, `web-ghost`, `topic-grid`, `argument-conclusion`, `premise`/`premise-head`/`premise-body`/`premise-children`, `objection`/`objection-head`/`objection-body`, `chevron`, `eyebrow`, `summary`, `section-label`, `not-found`.

- [ ] **Step 1: Create the local-preview server config**

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "faith-arguments-site",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["serve", "-l", "5500", "."],
      "port": 5500
    }
  ]
}
```

Save as `.claude/launch.json`. This is a dev convenience only (it is how the Browser tool's `preview_start` serves the site over `http://` — required because `fetch()` of local JSON files is blocked over `file://`), not a project dependency.

- [ ] **Step 2: Write the full stylesheet**

```css
:root {
  --bg-page: #000000;
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.55);
  --text-muted: rgba(255, 255, 255, 0.35);
  --border: rgba(255, 255, 255, 0.25);
  --border-strong: #ffffff;
  --surface-1: rgba(255, 255, 255, 0.04);
  --surface-1-hover: rgba(255, 255, 255, 0.1);
  --surface-2: #111111;
  --radius: 8px;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg-page);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

a { color: inherit; text-decoration: none; }

.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-bottom: 0.5px solid var(--border);
  position: relative;
  flex-wrap: wrap;
  gap: 12px;
}

.site-title {
  font-size: 15px;
  font-weight: 600;
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 13px;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.site-nav .nav-link { display: flex; align-items: center; gap: 4px; }
.site-nav .nav-link.active { color: var(--text-primary); }
.nav-check { color: var(--text-secondary); font-size: 11px; }

main { max-width: 900px; margin: 0 auto; padding: 24px; }

h1 { margin: 0 0 8px; font-size: 22px; font-weight: 600; }
.eyebrow { font-size: 12px; color: var(--text-muted); margin: 0 0 4px; }
.summary { color: var(--text-secondary); line-height: 1.7; margin: 0 0 24px; }
.section-label { font-weight: 500; font-size: 15px; margin: 24px 0 8px; }

.kebab-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.kebab-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--text-primary); display: block; }

.kebab-menu {
  position: absolute;
  top: 46px;
  right: 24px;
  background: var(--surface-2);
  border: 0.5px solid var(--border);
  border-radius: var(--radius);
  padding: 4px;
  min-width: 140px;
  z-index: 5;
  display: none;
}
.kebab-menu.open { display: block; }
.kebab-menu button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 13px;
  padding: 8px 10px;
  text-align: left;
  border-radius: 6px;
  cursor: pointer;
}
.kebab-menu button:hover { background: var(--surface-1-hover); }
.kebab-menu .check { visibility: hidden; }
.kebab-menu .check.visible { visibility: visible; }

.topic-web { position: relative; height: 380px; }
.topic-web svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.web-line { stroke: var(--border); stroke-width: 1; transition: stroke 0.15s ease, stroke-width 0.15s ease; }
.web-line.hovered { stroke: var(--border-strong); stroke-width: 1.5; }

.web-hub {
  position: absolute;
  left: 50%;
  top: 52%;
  transform: translate(-50%, -50%);
  width: 76px;
  height: 76px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface-1);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.web-hub span { font-size: 11px; color: var(--text-secondary); padding: 0 6px; }

.topic-node { position: absolute; transform: translate(-50%, -50%); text-align: center; cursor: pointer; display: block; }
.node-circle {
  position: relative;
  overflow: hidden;
  width: 92px;
  height: 92px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface-1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}
.topic-node:hover .node-circle {
  transform: scale(1.15);
  border-color: var(--border-strong);
  background: var(--surface-1-hover);
}
.node-label { position: relative; z-index: 1; font-size: 13px; font-weight: 500; padding: 0 8px; }

.star-dot { position: absolute; border-radius: 50%; background: #ffffff; }
.star-sparkle {
  position: absolute;
  background: #ffffff;
  clip-path: polygon(50% 0%, 61% 35%, 100% 50%, 61% 65%, 50% 100%, 39% 65%, 0% 50%, 39% 35%);
}

.web-ghost {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px dashed var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 16px;
}

.topic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 24px;
  padding: 24px 0;
  justify-items: center;
}

.argument-conclusion { background: var(--surface-1); border-radius: var(--radius); padding: 12px 16px; margin-bottom: 16px; }
.argument-conclusion .label { font-size: 12px; color: var(--text-secondary); margin: 0 0 2px; }
.argument-conclusion .value { font-weight: 500; font-size: 15px; margin: 0; }

.premise, .objection { border: 0.5px solid var(--border); border-radius: var(--radius); margin-bottom: 8px; overflow: hidden; }
.premise-head, .objection-head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  text-align: left;
  font-size: 14px;
  cursor: pointer;
}
.premise-head { font-weight: 500; }
.chevron { flex-shrink: 0; transition: transform 0.15s ease; font-size: 12px; color: var(--text-secondary); }
.premise[data-open="true"] .chevron, .objection[data-open="true"] .chevron { transform: rotate(180deg); }
.premise-body, .objection-body { display: none; padding: 0 16px 14px; font-size: 14px; color: var(--text-secondary); line-height: 1.7; }
.premise[data-open="true"] .premise-body, .objection[data-open="true"] .objection-body { display: block; }
.premise-children { margin-top: 10px; padding-left: 16px; border-left: 0.5px solid var(--border); }

.not-found { text-align: center; padding: 60px 0; color: var(--text-secondary); }
```

- [ ] **Step 3: Create the home page shell**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Faith Arguments</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <header class="site-header">
    <span class="site-title">Faith Arguments</span>
    <nav id="site-nav" class="site-nav"></nav>
  </header>
  <main>
    <p class="summary">Coming soon.</p>
  </main>
</body>
</html>
```

- [ ] **Step 4: Create the topic page shell**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Faith Arguments</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <header class="site-header">
    <a class="site-title" href="index.html">Faith Arguments</a>
    <nav id="site-nav" class="site-nav"></nav>
  </header>
  <main>
    <p class="summary">Coming soon.</p>
  </main>
</body>
</html>
```

- [ ] **Step 5: Manually verify the shell**

Use the Browser tool: `preview_start` with `name: "faith-arguments-site"`, then navigate to `http://localhost:5500/index.html` and `http://localhost:5500/topic.html`. Confirm on both: black background, white "Faith Arguments" header text, no console errors (`read_console_messages`).

- [ ] **Step 6: Commit**

```bash
git add .claude/launch.json css/style.css index.html topic.html
git commit -m "Scaffold faith-arguments site: theme, launch config, page shells"
```

---

## Task 2: Topic data files

**Files:**
- Create: `data/topics.json`
- Create: `data/universe.json`
- Create: `data/morality.json`
- Create: `data/jesus.json`

**Interfaces:**
- Produces: the JSON shapes every later task's JS reads — `topics.json` is `Array<{slug, title, teaser}>`; each `<slug>.json` is `{slug, title, summary, argument: {conclusion, premises: [{id, text, support, children}]}, objections: [{id, text, response}]}`.

- [ ] **Step 1: Write the topics registry**

```json
[
  { "slug": "universe", "title": "The Beginning of the Universe", "teaser": "Why the universe having a beginning points to a cause." },
  { "slug": "morality", "title": "Morality", "teaser": "Where objective moral obligations could come from." },
  { "slug": "jesus", "title": "Jesus", "teaser": "The historical case for the resurrection." }
]
```

Save as `data/topics.json`.

- [ ] **Step 2: Write the universe topic (no nested premises, for baseline coverage)**

```json
{
  "slug": "universe",
  "title": "The Beginning of the Universe",
  "summary": "Placeholder framing for the cosmological argument. Replace with your own writing.",
  "argument": {
    "conclusion": "The universe has a cause.",
    "premises": [
      { "id": "p1", "text": "Whatever begins to exist has a cause.", "support": "Placeholder support text for premise 1.", "children": [] },
      { "id": "p2", "text": "The universe began to exist.", "support": "Placeholder support text for premise 2.", "children": [] }
    ]
  },
  "objections": [
    { "id": "o1", "text": "Quantum events are uncaused.", "response": "Placeholder response text." }
  ]
}
```

Save as `data/universe.json`.

- [ ] **Step 3: Write the morality topic (includes a nested child premise, to exercise recursive rendering)**

```json
{
  "slug": "morality",
  "title": "Morality",
  "summary": "Placeholder framing for the moral argument. Replace with your own writing.",
  "argument": {
    "conclusion": "Objective moral values and duties exist and are best explained by God.",
    "premises": [
      {
        "id": "p1",
        "text": "If God does not exist, objective moral values and duties do not exist.",
        "support": "Placeholder support text for premise 1.",
        "children": [
          { "id": "p1a", "text": "Objective morality requires a transcendent grounding.", "support": "Placeholder sub-point support text.", "children": [] }
        ]
      },
      { "id": "p2", "text": "Objective moral values and duties do exist.", "support": "Placeholder support text for premise 2.", "children": [] }
    ]
  },
  "objections": [
    { "id": "o1", "text": "Morality could be a product of evolution alone.", "response": "Placeholder response text." }
  ]
}
```

Save as `data/morality.json`.

- [ ] **Step 4: Write the Jesus topic**

```json
{
  "slug": "jesus",
  "title": "Jesus",
  "summary": "Placeholder framing for the historical case for the resurrection. Replace with your own writing.",
  "argument": {
    "conclusion": "The resurrection of Jesus is the best explanation of the historical evidence.",
    "premises": [
      { "id": "p1", "text": "Jesus's tomb was found empty.", "support": "Placeholder support text for premise 1.", "children": [] },
      { "id": "p2", "text": "Multiple witnesses reported post-death appearances.", "support": "Placeholder support text for premise 2.", "children": [] }
    ]
  },
  "objections": [
    { "id": "o1", "text": "The accounts were written decades later.", "response": "Placeholder response text." }
  ]
}
```

Save as `data/jesus.json`.

- [ ] **Step 5: Manually verify the data**

With the preview server still running, use the Browser tool's `javascript_tool` on either page to run:
```js
await Promise.all(['topics','universe','morality','jesus'].map(s => fetch('data/'+s+'.json').then(r => r.json())))
```
Confirm it resolves without throwing, and that the result's `morality` entry has a non-empty `children` array on its first premise.

- [ ] **Step 6: Commit**

```bash
git add data/topics.json data/universe.json data/morality.json data/jesus.json
git commit -m "Add placeholder topic data for universe, morality, and Jesus"
```

---

## Task 3: Shared app logic and navigation

**Files:**
- Create: `js/main.js`
- Modify: `index.html` (replace placeholder `<main>` script wiring)
- Modify: `topic.html` (replace placeholder `<main>` script wiring)

**Interfaces:**
- Consumes: `data/topics.json` shape from Task 2.
- Produces (on `window.FaithApp`, read by Tasks 4 and 5):
  - `FaithApp.STORAGE_KEYS: { VISITED: string, LAYOUT: string }`
  - `FaithApp.loadTopics(): Promise<Array<{slug,title,teaser}>>`
  - `FaithApp.getVisitedTopics(): string[]`
  - `FaithApp.markVisited(slug: string): void`
  - `FaithApp.getLayoutPreference(): 'web' | 'grid'`
  - `FaithApp.setLayoutPreference(mode: 'web' | 'grid'): void`
  - `FaithApp.renderNav(topics: Array<{slug,title}>, activeSlug: string|null, containerEl: HTMLElement): void`

- [ ] **Step 1: Write `js/main.js`**

```js
window.FaithApp = window.FaithApp || {};

(function (FaithApp) {
  FaithApp.STORAGE_KEYS = {
    VISITED: 'faithArguments.visitedTopics',
    LAYOUT: 'faithArguments.homeLayout'
  };

  FaithApp.loadTopics = async function () {
    const response = await fetch('data/topics.json');
    if (!response.ok) {
      throw new Error('Failed to load topics.json: ' + response.status);
    }
    return response.json();
  };

  FaithApp.getVisitedTopics = function () {
    try {
      const raw = localStorage.getItem(FaithApp.STORAGE_KEYS.VISITED);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  };

  FaithApp.markVisited = function (slug) {
    try {
      const visited = FaithApp.getVisitedTopics();
      if (visited.indexOf(slug) === -1) {
        visited.push(slug);
        localStorage.setItem(FaithApp.STORAGE_KEYS.VISITED, JSON.stringify(visited));
      }
    } catch (err) {
      // localStorage unavailable; visited tracking silently degrades
    }
  };

  FaithApp.getLayoutPreference = function () {
    try {
      const value = localStorage.getItem(FaithApp.STORAGE_KEYS.LAYOUT);
      return value === 'grid' ? 'grid' : 'web';
    } catch (err) {
      return 'web';
    }
  };

  FaithApp.setLayoutPreference = function (mode) {
    try {
      localStorage.setItem(FaithApp.STORAGE_KEYS.LAYOUT, mode);
    } catch (err) {
      // localStorage unavailable; layout choice won't persist
    }
  };

  FaithApp.renderNav = function (topics, activeSlug, containerEl) {
    const visited = FaithApp.getVisitedTopics();
    containerEl.innerHTML = '';

    const homeLink = document.createElement('a');
    homeLink.className = 'nav-link' + (activeSlug === null ? ' active' : '');
    homeLink.href = 'index.html';
    homeLink.textContent = 'Home';
    containerEl.appendChild(homeLink);

    topics.forEach(function (topic) {
      const link = document.createElement('a');
      link.className = 'nav-link' + (activeSlug === topic.slug ? ' active' : '');
      link.href = 'topic.html?topic=' + encodeURIComponent(topic.slug);
      link.textContent = topic.title;
      if (visited.indexOf(topic.slug) !== -1) {
        const check = document.createElement('span');
        check.className = 'nav-check';
        check.textContent = '✓';
        link.appendChild(check);
      }
      containerEl.appendChild(link);
    });
  };
})(window.FaithApp);
```

- [ ] **Step 2: Wire `index.html` to render the nav**

Replace the `<main>...</main>` block and add the script tags before `</body>`:

```html
  <main>
    <p class="summary">Coming soon.</p>
  </main>
  <script src="js/main.js"></script>
  <script>
    (async function () {
      const topics = await FaithApp.loadTopics();
      FaithApp.renderNav(topics, null, document.getElementById('site-nav'));
    })();
  </script>
</body>
```

- [ ] **Step 3: Wire `topic.html` to render the nav**

```html
  <main>
    <p class="summary">Coming soon.</p>
  </main>
  <script src="js/main.js"></script>
  <script>
    (async function () {
      const topics = await FaithApp.loadTopics();
      FaithApp.renderNav(topics, null, document.getElementById('site-nav'));
    })();
  </script>
</body>
```

- [ ] **Step 4: Manually verify navigation**

Reload both `index.html` and `topic.html` in the Browser tool. Confirm both show "Home, The Beginning of the Universe, Morality, Jesus" in the header nav, with "Home" highlighted (active). Click "Morality" from the home page nav and confirm the URL becomes `topic.html?topic=morality`.

- [ ] **Step 5: Commit**

```bash
git add js/main.js index.html topic.html
git commit -m "Add shared topics/localStorage logic and render the nav bar"
```

---

## Task 4: Topic page — argument tree and objections

**Files:**
- Create: `js/components/argument-tree.js`
- Create: `js/components/objections.js`
- Create: `js/topic-page.js`
- Modify: `topic.html` (replace placeholder `<main>`, add script tags)

**Interfaces:**
- Consumes: `FaithApp.loadTopics`, `FaithApp.renderNav`, `FaithApp.markVisited` from Task 3; the per-topic JSON shape from Task 2.
- Produces (used only within this task's own page, no later task depends on these):
  - `FaithApp.renderArgumentTree(argument: {conclusion, premises}, containerEl: HTMLElement): void`
  - `FaithApp.renderObjections(objections: Array<{id,text,response}>, containerEl: HTMLElement): void`

- [ ] **Step 1: Write `js/components/argument-tree.js`**

```js
window.FaithApp = window.FaithApp || {};

(function (FaithApp) {
  function renderPremise(premise, parentEl) {
    const row = document.createElement('div');
    row.className = 'premise';
    row.setAttribute('data-open', 'false');

    const head = document.createElement('button');
    head.className = 'premise-head';
    head.type = 'button';
    head.innerHTML = '<span>' + premise.text + '</span><span class="chevron">▾</span>';

    const body = document.createElement('div');
    body.className = 'premise-body';
    body.textContent = premise.support || '';

    if (premise.children && premise.children.length > 0) {
      const childrenWrap = document.createElement('div');
      childrenWrap.className = 'premise-children';
      premise.children.forEach(function (child) {
        renderPremise(child, childrenWrap);
      });
      body.appendChild(childrenWrap);
    }

    head.addEventListener('click', function () {
      const isOpen = row.getAttribute('data-open') === 'true';
      row.setAttribute('data-open', isOpen ? 'false' : 'true');
    });

    row.appendChild(head);
    row.appendChild(body);
    parentEl.appendChild(row);
  }

  FaithApp.renderArgumentTree = function (argument, containerEl) {
    containerEl.innerHTML = '';

    const conclusion = document.createElement('div');
    conclusion.className = 'argument-conclusion';
    conclusion.innerHTML =
      '<p class="label">Conclusion</p><p class="value">' + argument.conclusion + '</p>';
    containerEl.appendChild(conclusion);

    argument.premises.forEach(function (premise) {
      renderPremise(premise, containerEl);
    });
  };
})(window.FaithApp);
```

- [ ] **Step 2: Write `js/components/objections.js`**

```js
window.FaithApp = window.FaithApp || {};

(function (FaithApp) {
  FaithApp.renderObjections = function (objections, containerEl) {
    containerEl.innerHTML = '';

    objections.forEach(function (objection) {
      const row = document.createElement('div');
      row.className = 'objection';
      row.setAttribute('data-open', 'false');

      const head = document.createElement('button');
      head.className = 'objection-head';
      head.type = 'button';
      head.innerHTML = '<span>' + objection.text + '</span><span class="chevron">▾</span>';

      const body = document.createElement('div');
      body.className = 'objection-body';
      body.textContent = objection.response;

      head.addEventListener('click', function () {
        const isOpen = row.getAttribute('data-open') === 'true';
        row.setAttribute('data-open', isOpen ? 'false' : 'true');
      });

      row.appendChild(head);
      row.appendChild(body);
      containerEl.appendChild(row);
    });
  };
})(window.FaithApp);
```

- [ ] **Step 3: Write `js/topic-page.js`**

```js
(function () {
  function getSlugFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('topic');
  }

  function renderNotFound(containerEl) {
    containerEl.innerHTML =
      '<div class="not-found"><p>That topic doesn\'t exist.</p>' +
      '<p><a href="index.html">Back to home</a></p></div>';
  }

  async function init() {
    const navEl = document.getElementById('site-nav');
    const rootEl = document.getElementById('topic-root');
    const slug = getSlugFromUrl();

    let topics;
    try {
      topics = await FaithApp.loadTopics();
    } catch (err) {
      renderNotFound(rootEl);
      return;
    }

    const topicMeta = topics.find(function (t) { return t.slug === slug; });
    if (!slug || !topicMeta) {
      FaithApp.renderNav(topics, null, navEl);
      renderNotFound(rootEl);
      return;
    }

    let topic;
    try {
      const response = await fetch('data/' + slug + '.json');
      if (!response.ok) throw new Error('Not found');
      topic = await response.json();
    } catch (err) {
      FaithApp.renderNav(topics, null, navEl);
      renderNotFound(rootEl);
      return;
    }

    FaithApp.markVisited(slug);
    FaithApp.renderNav(topics, slug, navEl);

    rootEl.innerHTML =
      '<p class="eyebrow">Topic</p>' +
      '<h1>' + topic.title + '</h1>' +
      '<p class="summary">' + topic.summary + '</p>' +
      '<div id="argument-root"></div>' +
      '<p class="section-label">Objections and responses</p>' +
      '<div id="objections-root"></div>';

    FaithApp.renderArgumentTree(topic.argument, document.getElementById('argument-root'));
    FaithApp.renderObjections(topic.objections, document.getElementById('objections-root'));
  }

  init();
})();
```

- [ ] **Step 4: Rewrite `topic.html` to use the new scripts**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Faith Arguments</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <header class="site-header">
    <a class="site-title" href="index.html">Faith Arguments</a>
    <nav id="site-nav" class="site-nav"></nav>
  </header>
  <main>
    <div id="topic-root"></div>
  </main>
  <script src="js/main.js"></script>
  <script src="js/components/argument-tree.js"></script>
  <script src="js/components/objections.js"></script>
  <script src="js/topic-page.js"></script>
</body>
</html>
```

- [ ] **Step 5: Manually verify the topic page**

Navigate to `http://localhost:5500/topic.html?topic=morality`. Confirm: title, summary, and conclusion render; the first premise expands to show support text plus a nested child premise, which itself expands; the objection row expands to show its response; the "Morality" nav link now shows a checkmark. Reload the page and confirm the checkmark is still there (proves the visited state persisted via `localStorage`, not just in-memory). Then navigate to `topic.html?topic=nonsense` and confirm the "That topic doesn't exist" message with a working "Back to home" link.

- [ ] **Step 6: Commit**

```bash
git add js/components/argument-tree.js js/components/objections.js js/topic-page.js topic.html
git commit -m "Render topic pages: argument tree, objections, and not-found handling"
```

---

## Task 5: Home page — topic web, grid view, and layout toggle

**Files:**
- Create: `js/components/topic-web.js`
- Modify: `index.html` (add kebab menu markup, root div, script tags)

**Interfaces:**
- Consumes: `FaithApp.loadTopics`, `FaithApp.renderNav`, `FaithApp.getLayoutPreference`, `FaithApp.setLayoutPreference` from Task 3.
- Produces: `FaithApp.renderTopicWeb(topics: Array<{slug,title,teaser}>, containerEl: HTMLElement): void`

- [ ] **Step 1: Write `js/components/topic-web.js`**

```js
window.FaithApp = window.FaithApp || {};

(function (FaithApp) {
  const STAR_PATTERNS = [
    {
      dots: [
        { top: '18%', left: '28%', size: 2, opacity: 0.8 },
        { top: '70%', left: '20%', size: 2, opacity: 0.5 },
        { top: '30%', left: '78%', size: 2, opacity: 0.6 },
        { top: '78%', left: '70%', size: 1.5, opacity: 0.7 },
        { top: '50%', left: '12%', size: 1.5, opacity: 0.4 }
      ],
      sparkles: [
        { top: '10%', left: '12%', size: 8, opacity: 0.35 },
        { top: '82%', left: '78%', size: 6, opacity: 0.3 }
      ]
    },
    {
      dots: [
        { top: '22%', left: '70%', size: 2, opacity: 0.7 },
        { top: '65%', left: '78%', size: 1.5, opacity: 0.5 },
        { top: '25%', left: '18%', size: 2, opacity: 0.6 },
        { top: '80%', left: '30%', size: 1.5, opacity: 0.4 },
        { top: '48%', left: '85%', size: 1.5, opacity: 0.5 }
      ],
      sparkles: [
        { top: '12%', left: '76%', size: 7, opacity: 0.3 },
        { top: '80%', left: '16%', size: 6, opacity: 0.32 }
      ]
    },
    {
      dots: [
        { top: '16%', left: '50%', size: 2, opacity: 0.75 },
        { top: '60%', left: '16%', size: 1.5, opacity: 0.45 },
        { top: '72%', left: '80%', size: 2, opacity: 0.6 },
        { top: '35%', left: '85%', size: 1.5, opacity: 0.5 },
        { top: '82%', left: '45%', size: 1.5, opacity: 0.4 }
      ],
      sparkles: [
        { top: '14%', left: '16%', size: 7, opacity: 0.3 },
        { top: '84%', left: '82%', size: 6, opacity: 0.32 }
      ]
    }
  ];

  function buildStarfield(pattern) {
    const frag = document.createDocumentFragment();
    pattern.dots.forEach(function (dot) {
      const span = document.createElement('span');
      span.className = 'star-dot';
      span.style.top = dot.top;
      span.style.left = dot.left;
      span.style.width = dot.size + 'px';
      span.style.height = dot.size + 'px';
      span.style.opacity = dot.opacity;
      frag.appendChild(span);
    });
    pattern.sparkles.forEach(function (sparkle) {
      const span = document.createElement('span');
      span.className = 'star-sparkle';
      span.style.top = sparkle.top;
      span.style.left = sparkle.left;
      span.style.width = sparkle.size + 'px';
      span.style.height = sparkle.size + 'px';
      span.style.opacity = sparkle.opacity;
      frag.appendChild(span);
    });
    return frag;
  }

  function computeWebPositions(count) {
    const positions = [];
    const hub = { x: 50, y: 52 };
    const baseRadius = 32;
    const ringGap = 15;
    let remaining = count;
    let ring = 0;

    while (remaining > 0) {
      const capacity = ring === 0 ? 6 : 6 + ring * 2;
      const inRing = Math.min(remaining, capacity);
      const radius = baseRadius + ring * ringGap;
      for (let i = 0; i < inRing; i++) {
        const angle = ((-90 + (360 / inRing) * i) * Math.PI) / 180;
        positions.push({
          x: hub.x + radius * Math.cos(angle),
          y: hub.y + radius * 0.85 * Math.sin(angle)
        });
      }
      remaining -= inRing;
      ring += 1;
    }

    return positions;
  }

  function buildNode(topic, index) {
    const node = document.createElement('a');
    node.className = 'topic-node';
    node.href = 'topic.html?topic=' + encodeURIComponent(topic.slug);

    const circle = document.createElement('div');
    circle.className = 'node-circle';
    circle.appendChild(buildStarfield(STAR_PATTERNS[index % STAR_PATTERNS.length]));

    const label = document.createElement('span');
    label.className = 'node-label';
    label.textContent = topic.title;
    circle.appendChild(label);

    node.appendChild(circle);
    return node;
  }

  function renderWebLayout(topics, containerEl) {
    containerEl.innerHTML = '';
    containerEl.className = 'topic-web';

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');

    const hub = document.createElement('div');
    hub.className = 'web-hub';
    hub.innerHTML = '<span>Does God exist?</span>';

    const positions = computeWebPositions(topics.length);

    topics.forEach(function (topic, index) {
      const pos = positions[index];

      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('class', 'web-line');
      line.setAttribute('x1', '50');
      line.setAttribute('y1', '52');
      line.setAttribute('x2', String(pos.x));
      line.setAttribute('y2', String(pos.y));
      svg.appendChild(line);

      const node = buildNode(topic, index);
      node.style.left = pos.x + '%';
      node.style.top = pos.y + '%';
      node.addEventListener('mouseenter', function () { line.classList.add('hovered'); });
      node.addEventListener('mouseleave', function () { line.classList.remove('hovered'); });

      containerEl.appendChild(node);
    });

    const ghost = document.createElement('div');
    ghost.className = 'web-ghost';
    ghost.style.left = '86%';
    ghost.style.top = '28%';
    ghost.textContent = '+';
    ghost.setAttribute('aria-hidden', 'true');

    containerEl.appendChild(svg);
    containerEl.appendChild(hub);
    containerEl.appendChild(ghost);
  }

  function renderGridLayout(topics, containerEl) {
    containerEl.innerHTML = '';
    containerEl.className = 'topic-grid';

    topics.forEach(function (topic, index) {
      const node = buildNode(topic, index);
      containerEl.appendChild(node);
    });
  }

  FaithApp.renderTopicWeb = function (topics, containerEl) {
    let mode = FaithApp.getLayoutPreference();

    function draw() {
      if (mode === 'grid') {
        renderGridLayout(topics, containerEl);
      } else {
        renderWebLayout(topics, containerEl);
      }
    }
    draw();

    const menu = document.getElementById('kebab-menu');
    const webOption = menu.querySelector('[data-mode="web"]');
    const gridOption = menu.querySelector('[data-mode="grid"]');

    function syncChecks() {
      webOption.querySelector('.check').classList.toggle('visible', mode === 'web');
      gridOption.querySelector('.check').classList.toggle('visible', mode === 'grid');
    }
    syncChecks();

    [webOption, gridOption].forEach(function (option) {
      option.addEventListener('click', function () {
        mode = option.getAttribute('data-mode');
        FaithApp.setLayoutPreference(mode);
        syncChecks();
        draw();
        menu.classList.remove('open');
      });
    });

    const kebabBtn = document.getElementById('kebab-btn');
    kebabBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.toggle('open');
    });
    document.addEventListener('click', function () {
      menu.classList.remove('open');
    });
  };
})(window.FaithApp);
```

- [ ] **Step 2: Rewrite `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Faith Arguments</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <header class="site-header">
    <span class="site-title">Faith Arguments</span>
    <nav id="site-nav" class="site-nav"></nav>
    <button id="kebab-btn" class="kebab-btn" aria-label="Layout options" type="button">
      <span class="kebab-dot"></span>
      <span class="kebab-dot"></span>
      <span class="kebab-dot"></span>
    </button>
    <div id="kebab-menu" class="kebab-menu">
      <button data-mode="web" type="button">
        <span>Web view</span><span class="check">&#10003;</span>
      </button>
      <button data-mode="grid" type="button">
        <span>Grid view</span><span class="check">&#10003;</span>
      </button>
    </div>
  </header>
  <main>
    <div id="topic-web-root"></div>
  </main>
  <script src="js/main.js"></script>
  <script src="js/components/topic-web.js"></script>
  <script>
    (async function () {
      const topics = await FaithApp.loadTopics();
      FaithApp.renderNav(topics, null, document.getElementById('site-nav'));
      FaithApp.renderTopicWeb(topics, document.getElementById('topic-web-root'));
    })();
  </script>
</body>
</html>
```

- [ ] **Step 3: Manually verify the web layout and hover**

Navigate to `http://localhost:5500/index.html`. Confirm: a hub circle labeled "Does God exist?" sits in the middle, connected by lines to three bubbles labeled "The Beginning of the Universe", "Morality", "Jesus", each showing a scattered starfield behind its title, plus a dashed unlabeled "+" node. Hover a bubble and confirm it grows and its connecting line turns solid white. Click a bubble and confirm it navigates to the matching `topic.html?topic=<slug>`.

- [ ] **Step 4: Manually verify the grid toggle and persistence**

Back on the home page, click the three-dot button in the header. Confirm a dropdown appears with "Web view" (checked) and "Grid view". Click "Grid view" and confirm the bubbles rearrange into a plain responsive grid with no hub or lines. Reload the page and confirm it still shows Grid view. Reopen the menu, click "Web view", and confirm it switches back and persists across another reload.

- [ ] **Step 5: Commit**

```bash
git add js/components/topic-web.js index.html
git commit -m "Add home page topic web, grid layout toggle, and layout persistence"
```

---

## Task 6: End-to-end extensibility and error-path verification

**Files:** none permanently changed — this task adds temporary files to prove the architecture, verifies behavior, then removes them.

**Interfaces:** none produced (verification-only task).

- [ ] **Step 1: Add a temporary 4th topic to prove zero-code-change extensibility**

Create `data/temp-test.json`:

```json
{
  "slug": "temp-test",
  "title": "Temp Test Topic",
  "summary": "Temporary topic used to verify extensibility. Not real content.",
  "argument": {
    "conclusion": "This is a placeholder conclusion.",
    "premises": [
      { "id": "p1", "text": "Placeholder premise.", "support": "Placeholder support.", "children": [] }
    ]
  },
  "objections": [
    { "id": "o1", "text": "Placeholder objection.", "response": "Placeholder response." }
  ]
}
```

Then append one entry to `data/topics.json` so the array reads:

```json
[
  { "slug": "universe", "title": "The Beginning of the Universe", "teaser": "Why the universe having a beginning points to a cause." },
  { "slug": "morality", "title": "Morality", "teaser": "Where objective moral obligations could come from." },
  { "slug": "jesus", "title": "Jesus", "teaser": "The historical case for the resurrection." },
  { "slug": "temp-test", "title": "Temp Test Topic", "teaser": "Temporary topic for extensibility verification." }
]
```

- [ ] **Step 2: Verify the 4th topic appears automatically, with no code changes**

Reload `index.html`. Confirm a 4th bubble labeled "Temp Test Topic" appears in the web layout, positioned by the same radial spacing logic (not overlapping the other three), connected to the hub by its own line, and behaves identically on hover. Switch to Grid view and confirm it appears as a 4th grid cell. Confirm it also appears in the shared nav on both pages, and that clicking it opens `topic.html?topic=temp-test` and renders correctly.

- [ ] **Step 3: Re-verify the not-found path against a manually-typed bad slug**

Navigate directly to `topic.html?topic=does-not-exist`. Confirm the not-found message and "Back to home" link still work correctly with the now-4-topic registry.

- [ ] **Step 4: Remove the temporary topic**

Delete `data/temp-test.json` and remove its entry from `data/topics.json`, restoring it to exactly the 3-topic array from Task 2, Step 1. Reload `index.html` and confirm the site is back to showing only the 3 real topics.

No commit is needed for this task — the temporary files are never staged, and the revert in Step 4 leaves the working tree identical to the end of Task 5.
