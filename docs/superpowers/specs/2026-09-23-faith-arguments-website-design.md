# Faith Arguments Website — Architecture Design

Date: 2026-09-23

## Purpose

A standalone, interactive website presenting the user's arguments for God and
Christianity, organized by topic (initially: Beginning of the Universe,
Morality, Jesus). Audience is general/mixed — both believers and skeptics.
Content (the actual arguments, premises, objections, and responses) will be
supplied by the user later; this phase is architecture only.

## Non-goals (this phase)

- Writing the actual apologetic content/arguments.
- Quizzes or self-check features (explicitly excluded by the user).
- Any backend, database, or server — this is a pure static site.
- Visual design polish (colors, typography) beyond a clean, readable baseline.

## Tech stack

Plain HTML/CSS/JS. No build step, no framework, no dependencies. Chosen for
long-term low-maintenance ownership of a content-focused site, and because a
build pipeline adds no value at this scale.

## Directory structure

```
faith-arguments/
  index.html              # home page: hero + topic cards
  topic.html               # single template page for ALL topics
  css/
    style.css              # shared styles, layout, light/dark tokens
  js/
    main.js                # topics registry loading, nav rendering, theme toggle
    topic-page.js            # topic.html logic: reads ?topic=slug, loads JSON, renders
    components/
      argument-tree.js       # renders premise -> conclusion argument map
      objections.js           # renders expandable objection/response accordion
  data/
    topics.json              # registry: [{slug, title, teaser, icon}, ...]
    universe.json             # topic content for "Beginning of the Universe"
    morality.json
    jesus.json
  assets/                    # icons/images if needed
```

## Core architectural decision: one template, N data files

Rather than one HTML file per topic, there is a single `topic.html` that reads
a `?topic=<slug>` query parameter, fetches `data/<slug>.json`, and renders the
page from that data. Adding a new topic later requires only:

1. A new `data/<newtopic>.json` file with the topic's content.
2. One new entry in `data/topics.json` (slug, title, teaser, icon).

No HTML or JS changes are needed to add a topic. This directly satisfies the
requirement that more topics can be added later without restructuring.

## Data model

`data/topics.json`:
```json
[
  { "slug": "universe", "title": "The Beginning of the Universe", "teaser": "...", "icon": "..." },
  { "slug": "morality", "title": "Morality", "teaser": "...", "icon": "..." },
  { "slug": "jesus", "title": "Jesus", "teaser": "...", "icon": "..." }
]
```

`data/<slug>.json` (per-topic content):
```json
{
  "slug": "universe",
  "title": "The Beginning of the Universe",
  "summary": "One-paragraph framing of the argument.",
  "argument": {
    "conclusion": "The universe has a cause.",
    "premises": [
      {
        "id": "p1",
        "text": "Whatever begins to exist has a cause.",
        "support": "Explanatory text supporting this premise.",
        "children": []
      },
      {
        "id": "p2",
        "text": "The universe began to exist.",
        "support": "Explanatory text supporting this premise.",
        "children": []
      }
    ]
  },
  "objections": [
    { "id": "o1", "text": "Objection text.", "response": "Response text." }
  ]
}
```

`children` on a premise is an optional array of the same shape (nested
sub-points), allowing arbitrarily deep argument trees without any code
changes.

## Components

- **argument-tree.js**: Takes an `argument` object and renders the
  conclusion plus a list of premises. Each premise is a clickable node that
  expands to show its `support` text and (recursively) its `children`. Pure
  function of data in, DOM out — no dependency on which topic it's rendering.
- **objections.js**: Takes an `objections` array and renders each as an
  accordion row (objection text, click to reveal response). Same
  data-in/DOM-out shape as argument-tree.js.
- **main.js**: Loads `topics.json` once, renders the shared nav (used on both
  `index.html` and `topic.html`) and the home page's topic cards. Also
  handles a simple light/dark theme toggle.
- **topic-page.js**: Reads the `topic` query param, fetches the matching
  `data/<slug>.json`, and calls `argument-tree.js` / `objections.js` to
  render the page body. Handles the "topic not found" error case (unknown
  slug) with a simple message and a link back to the home page.

## Navigation and progress

A shared nav bar (rendered by `main.js` from `topics.json`) appears on every
page, listing all topics so the user can jump directly between them.
"Progress" (which topics have been visited) is tracked in the browser's
`localStorage` and shown as a checkmark next to visited topics in the nav.
This is a per-browser convenience only — not synced anywhere, no account
system, and it degrades gracefully (nav still works fully) if `localStorage`
is unavailable.

## Error handling

- Unknown `?topic=` slug in `topic.html`: render a "topic not found" message
  with a link back to `index.html`, rather than a broken page.
- Missing/malformed JSON for a topic: caught at fetch time, same fallback
  message.
- `localStorage` access wrapped in try/catch (private browsing / blocked
  storage should not break the page).

## Local development and deployment

Static `fetch()` of local JSON files requires the site to be served over
`http://`, not opened directly via `file://` (browser CORS restrictions on
local file access). For local preview, any static file server works (e.g.
the Browser tool's own preview server, or `npx serve`). For deployment, any
static host works as-is (GitHub Pages, Netlify, Vercel static, etc.) — no
build step required.

## Testing / verification plan

No automated test suite for this static content site. Verification is
manual, in-browser, after implementation:

1. Home page lists all three topics as cards.
2. Clicking a topic card navigates to `topic.html?topic=<slug>` and renders
   correctly.
3. Nav bar allows jumping directly between all topics from any page.
4. Argument-tree premises expand/collapse and show nested children correctly.
5. Objections accordion expands/collapses and shows responses correctly.
6. Visiting a topic marks it visited (checkmark) in the nav, persisting
   across a page reload.
7. Adding a 4th, dummy topic (one JSON file + one `topics.json` entry only)
   works end-to-end with zero code changes — proves the extensibility goal.
8. Navigating to an unknown `?topic=` slug shows the not-found fallback
   instead of a broken page.

## Content status

The actual argument content (premises, support text, objections, responses)
for Universe, Morality, and Jesus is **not** part of this phase and will be
supplied by the user afterward. This phase produces the architecture and
placeholder/sample content sufficient to verify the structure works.
