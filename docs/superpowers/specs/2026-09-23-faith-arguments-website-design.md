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
- A light theme / theme toggle — the site has one fixed dark (black) look.
- Extending the web/starfield visual treatment to the argument-tree or
  objections UI inside a topic page — those stay the plain expandable-list
  design from the original mockup.

## Tech stack

Plain HTML/CSS/JS. No build step, no framework, no dependencies. Chosen for
long-term low-maintenance ownership of a content-focused site, and because a
build pipeline adds no value at this scale.

## Directory structure

```
faith-arguments/
  index.html              # home page: topic web (hub + nodes) / grid toggle
  topic.html               # single template page for ALL topics
  css/
    style.css              # shared styles, fixed dark/black theme
  js/
    main.js                # topics registry loading, shared nav rendering
    topic-page.js            # topic.html logic: reads ?topic=slug, loads JSON, renders
    components/
      argument-tree.js       # renders premise -> conclusion argument map
      objections.js           # renders expandable objection/response accordion
      topic-web.js             # renders index.html's web-of-topics + grid layout toggle
  data/
    topics.json              # registry: [{slug, title, teaser}, ...]
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
2. One new entry in `data/topics.json` (slug, title, teaser).

No HTML or JS changes are needed to add a topic. This directly satisfies the
requirement that more topics can be added later without restructuring.

## Visual design: fixed dark theme + topic web

The site has one fixed visual theme — no light mode: black page background,
white/gray text and borders, no other saturated colors. Confirmed via
interactive mockups during design.

**Home page (`index.html`)** renders topics as a web rather than a card grid:

- A central hub node (decorative, labeled with the site's core question)
  sits in the middle, connected by thin lines to one node per topic.
- Topic nodes are circles with the topic title set directly inside the
  bubble (no icons), positioned around the hub. For N topics, positions are
  computed (not hand-placed) — evenly spaced around the hub, adding
  further rings as the topic count grows — so this scales automatically as
  topics are added to `topics.json`.
- Each topic bubble has a subtle decorative "starfield" behind the title:
  a handful of small white dots plus 1-2 faint sparkle accents, at low,
  varied opacity. Purely decorative (`aria-hidden`), generated the same way
  for every bubble (small randomized jitter is fine, exact positions don't
  matter).
- Hovering a topic bubble scales it up (~1.15x) and brightens its border
  and connecting line to full white. Implemented with a CSS transition on
  `transform`/`border-color`, no JS animation library needed.
- A dashed, unlabeled "+" node hints that more topics can be added, staying
  purely decorative (not a real link).

**Layout toggle**: a three-dot ("kebab") icon button in the top-right of the
header opens a small dropdown with two options, "Web view" and "Grid view":

- *Web view* (default) is the hub-and-nodes layout described above.
- *Grid view* drops the hub/lines and lays the same topic bubbles out in a
  responsive CSS grid (`repeat(auto-fit, minmax(...))`), for users who find
  scanning rows/columns easier than the radial layout.
- The chosen layout is saved to `localStorage` (same mechanism as visited-
  topic progress, see below) and restored on the next visit; if
  `localStorage` is unavailable, the page simply always starts in Web view.

Implementation note: because node positions in Web view must be computed
from the topic count, `topic-web.js` is responsible for both layouts (it
switches between rendering the radial layout and the CSS grid layout based
on the saved/selected mode) rather than splitting this across two files.

## Data model

`data/topics.json`:
```json
[
  { "slug": "universe", "title": "The Beginning of the Universe", "teaser": "..." },
  { "slug": "morality", "title": "Morality", "teaser": "..." },
  { "slug": "jesus", "title": "Jesus", "teaser": "..." }
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

`teaser` is currently unused by the UI — it is not rendered anywhere (the
topic web/grid bubbles show only the title). It is reserved for potential
future use, e.g. a tooltip or a card subtitle in a future layout.

## Components

- **argument-tree.js**: Takes an `argument` object and renders the
  conclusion plus a list of premises. Each premise is a clickable node that
  expands to show its `support` text and (recursively) its `children`. Pure
  function of data in, DOM out — no dependency on which topic it's rendering.
- **objections.js**: Takes an `objections` array and renders each as an
  accordion row (objection text, click to reveal response). Same
  data-in/DOM-out shape as argument-tree.js.
- **main.js**: Loads `topics.json` once and renders the shared top nav (used
  on both `index.html` and `topic.html`), including the visited checkmarks.
- **topic-web.js**: On `index.html` only. Takes the loaded topics list and
  renders the Web-view (hub + computed node positions + starfield bubbles +
  hover effects) or Grid-view layout, plus the kebab menu that switches
  between them and persists the choice.
- **topic-page.js**: Reads the `topic` query param, fetches the matching
  `data/<slug>.json`, and calls `argument-tree.js` / `objections.js` to
  render the page body. Handles the "topic not found" error case (unknown
  slug) with a simple message and a link back to the home page.

## Navigation, progress, and layout preference

A shared nav bar (rendered by `main.js` from `topics.json`) appears on every
page, listing all topics so the user can jump directly between them.
"Progress" (which topics have been visited) and the home page's chosen
layout (Web vs Grid) are both tracked in the browser's `localStorage`;
visited topics show a checkmark in the nav. This is a per-browser
convenience only — not synced anywhere, no account system — and everything
degrades gracefully (nav and layout still work, just unpersisted) if
`localStorage` is unavailable.

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

1. Home page renders all three topics as bubbles in the Web layout by
   default (hub, connecting lines, starfield, dashed "+" node).
2. Hovering a topic bubble grows it and brightens its connecting line.
3. Clicking a topic bubble navigates to `topic.html?topic=<slug>` and
   renders correctly.
4. The kebab menu switches to Grid view (bubbles in rows/columns, no
   hub/lines) and back to Web view; the chosen layout persists across a
   page reload.
5. Nav bar allows jumping directly between all topics from any page.
6. Argument-tree premises expand/collapse and show nested children correctly.
7. Objections accordion expands/collapses and shows responses correctly.
8. Visiting a topic marks it visited (checkmark) in the nav, persisting
   across a page reload.
9. Adding a 4th, dummy topic (one JSON file + one `topics.json` entry only)
   works end-to-end with zero code changes, including its bubble position
   in Web view being computed automatically — proves the extensibility goal.
10. Navigating to an unknown `?topic=` slug shows the not-found fallback
    instead of a broken page.

## Content status

The actual argument content (premises, support text, objections, responses)
for Universe, Morality, and Jesus is **not** part of this phase and will be
supplied by the user afterward. This phase produces the architecture and
placeholder/sample content sufficient to verify the structure works.
