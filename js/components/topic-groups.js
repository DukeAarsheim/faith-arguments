window.FaithApp = window.FaithApp || {};

(function (FaithApp) {
  const GROUPS = [
    { id: 1, title: 'Does God Exist?' },
    { id: 2, title: 'Why Christianity?' },
    { id: 3, title: 'Common Objections' }
  ];
  const BLANK_SLOTS = { 3: 2 };

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

  function buildStar(className, spec) {
    const span = document.createElement('span');
    span.className = className;
    span.style.top = spec.top;
    span.style.left = spec.left;
    span.style.width = spec.size / 1.5 + 'cqw';
    span.style.height = spec.size / 1.5 + 'cqw';
    span.style.opacity = spec.opacity;
    span.setAttribute('aria-hidden', 'true');
    return span;
  }

  function buildStarfield(pattern) {
    const frag = document.createDocumentFragment();
    pattern.dots.forEach(function (dot) { frag.appendChild(buildStar('star-dot', dot)); });
    pattern.sparkles.forEach(function (sparkle) { frag.appendChild(buildStar('star-sparkle', sparkle)); });
    return frag;
  }

  function buildSurface(patternIndex) {
    const surface = document.createElement('div');
    surface.className = 'tile-surface';
    surface.appendChild(buildStarfield(STAR_PATTERNS[patternIndex % STAR_PATTERNS.length]));
    return surface;
  }

  function buildTile(topic, patternIndex) {
    const tile = document.createElement('a');
    tile.className = 'topic-tile';
    tile.href = 'topic.html?topic=' + encodeURIComponent(topic.slug);

    const surface = buildSurface(patternIndex);
    const label = document.createElement('span');
    label.className = 'tile-label';
    label.textContent = topic.title;
    surface.appendChild(label);

    tile.appendChild(surface);
    return tile;
  }

  function buildBlankTile(patternIndex) {
    const tile = document.createElement('div');
    tile.className = 'topic-tile is-blank';
    tile.setAttribute('aria-hidden', 'true');
    tile.appendChild(buildSurface(patternIndex));
    return tile;
  }

  FaithApp.renderTopicGroups = function (topics, containerEl) {
    containerEl.innerHTML = '';
    let patternIndex = 0;

    GROUPS.forEach(function (group) {
      const groupTopics = topics.filter(function (t) { return t.group === group.id; });
      const blanks = BLANK_SLOTS[group.id] || 0;
      if (groupTopics.length === 0 && blanks === 0) return;

      const box = document.createElement('section');
      box.className = 'topic-group';

      const title = document.createElement('h2');
      title.className = 'topic-group-title';
      title.textContent = group.title;
      box.appendChild(title);

      const tiles = document.createElement('div');
      tiles.className = 'topic-group-tiles';

      groupTopics.forEach(function (topic) {
        tiles.appendChild(buildTile(topic, patternIndex));
        patternIndex += 1;
      });
      for (let b = 0; b < blanks; b++) {
        tiles.appendChild(buildBlankTile(patternIndex));
        patternIndex += 1;
      }

      tiles.style.setProperty('--cols', String(groupTopics.length + blanks));
      box.appendChild(tiles);
      containerEl.appendChild(box);
    });
  };
})(window.FaithApp);
