window.FaithApp = window.FaithApp || {};

(function (FaithApp) {
  const RINGS = [
    { id: 1, title: 'Does God Exist?', radius: 29 },
    { id: 2, title: 'Why Christianity?', radius: 58 },
    { id: 3, title: 'Common Objections', radius: 87 }
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
      span.setAttribute('aria-hidden', 'true');
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
      span.setAttribute('aria-hidden', 'true');
      frag.appendChild(span);
    });
    return frag;
  }

  function groupByRing(topics) {
    return RINGS.map(function (ring, ringIndex) {
      const ringTopics = topics.filter(function (t) { return t.ring === ring.id; });
      const blanks = BLANK_SLOTS[ring.id] || 0;
      return { ring: ring, ringIndex: ringIndex, topics: ringTopics, blanks: blanks };
    });
  }

  function computeRingPositions(count, radius) {
    const positions = [];
    if (count === 0) return positions;
    const angleOffset = 180 / count;
    for (let i = 0; i < count; i++) {
      const angle = ((-90 + angleOffset + (360 / count) * i) * Math.PI) / 180;
      positions.push({
        x: 50 + radius * Math.cos(angle),
        y: 50 + radius * Math.sin(angle)
      });
    }
    return positions;
  }

  function buildNode(topic, patternIndex) {
    const node = document.createElement('a');
    node.className = 'topic-node';
    node.href = 'topic.html?topic=' + encodeURIComponent(topic.slug);

    const circle = document.createElement('div');
    circle.className = 'node-circle';
    circle.appendChild(buildStarfield(STAR_PATTERNS[patternIndex % STAR_PATTERNS.length]));

    const label = document.createElement('span');
    label.className = 'node-label';
    label.textContent = topic.title;
    circle.appendChild(label);

    node.appendChild(circle);
    return node;
  }

  function buildBlankNode(patternIndex) {
    const node = document.createElement('div');
    node.className = 'topic-node is-blank';
    node.setAttribute('aria-hidden', 'true');

    const circle = document.createElement('div');
    circle.className = 'node-circle';
    circle.appendChild(buildStarfield(STAR_PATTERNS[patternIndex % STAR_PATTERNS.length]));

    node.appendChild(circle);
    return node;
  }

  function measureBoundingBox(nodes) {
    if (nodes.length === 0) return null;
    const rects = nodes.map(function (n) { return n.getBoundingClientRect(); });
    const left = Math.min.apply(null, rects.map(function (r) { return r.left; }));
    const right = Math.max.apply(null, rects.map(function (r) { return r.right; }));
    const top = Math.min.apply(null, rects.map(function (r) { return r.top; }));
    const bottom = Math.max.apply(null, rects.map(function (r) { return r.bottom; }));
    return { width: right - left, height: bottom - top };
  }

  function measureZoomBounds(stageEl, ring1Nodes, outerRingNodes) {
    const viewportMin = Math.min(window.innerWidth, window.innerHeight);
    const originalTransform = stageEl.style.transform;
    stageEl.style.transform = 'scale(1)';

    const stageSize = stageEl.getBoundingClientRect().width || 1;
    const outerRingRadius = RINGS[RINGS.length - 1].radius;
    const outerCircleDiameterPx = 2 * (outerRingRadius / 100) * stageSize;

    const ring1Box = measureBoundingBox(ring1Nodes);
    const outerBox = measureBoundingBox(outerRingNodes);

    let startZoom = 2;
    if (ring1Box) {
      const ring1Max = Math.max(ring1Box.width, ring1Box.height, 1);
      startZoom = (viewportMin * 0.58) / ring1Max;
    }

    let endZoom = 1;
    if (outerBox) {
      const outerMax = Math.max(outerBox.width, outerBox.height, 1);
      endZoom = Math.min(1, (viewportMin * 0.92) / outerMax);
    }
    endZoom = Math.min(endZoom, (viewportMin * 0.88) / outerCircleDiameterPx);

    if (startZoom < endZoom * 1.4) {
      startZoom = endZoom * 1.8;
    }

    stageEl.style.transform = originalTransform;
    return { startZoom: startZoom, endZoom: endZoom };
  }

  function setupScrollZoom(stageEl, outerEl, ring1Nodes, outerRingNodes) {
    let bounds = measureZoomBounds(stageEl, ring1Nodes, outerRingNodes);
    let ticking = false;

    function update() {
      const scrollableHeight = outerEl.offsetHeight - window.innerHeight;
      const rect = outerEl.getBoundingClientRect();
      const progress = scrollableHeight > 0
        ? Math.min(1, Math.max(0, -rect.top / scrollableHeight))
        : 1;
      const zoom = bounds.startZoom + (bounds.endZoom - bounds.startZoom) * progress;
      stageEl.style.transform = 'scale(' + zoom.toFixed(3) + ')';
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    function onResize() {
      bounds = measureZoomBounds(stageEl, ring1Nodes, outerRingNodes);
      update();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    update();

    return function cleanup() {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }

  function measureBubbleDiameterPx(stageEl) {
    const probe = document.createElement('div');
    probe.className = 'node-circle';
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    stageEl.appendChild(probe);
    const width = probe.getBoundingClientRect().width;
    stageEl.removeChild(probe);
    return width || 92;
  }

  function renderWebLayout(topics, containerEl) {
    containerEl.innerHTML = '';
    containerEl.className = '';

    const outer = document.createElement('div');
    outer.className = 'web-scroll-outer';
    outer.style.height = '300vh';

    const sticky = document.createElement('div');
    sticky.className = 'web-scroll-sticky';

    const stage = document.createElement('div');
    stage.className = 'web-stage';

    // Attach early so the stage has real layout dimensions to measure against.
    sticky.appendChild(stage);
    outer.appendChild(sticky);
    containerEl.appendChild(outer);

    const stageSize = stage.getBoundingClientRect().width || 1;
    const bubbleDiameterPx = measureBubbleDiameterPx(stage);
    const insetUnits = ((bubbleDiameterPx / 2 + 8) / stageSize) * 100;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('aria-hidden', 'true');

    const grouped = groupByRing(topics);
    let patternIndex = 0;
    const nodesByRing = [];

    grouped.forEach(function (group) {
      const ringNodes = [];

      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('class', 'ring-circle');
      circle.setAttribute('cx', '50');
      circle.setAttribute('cy', '50');
      circle.setAttribute('r', String(group.ring.radius));
      svg.appendChild(circle);

      const placementRadius = Math.max(group.ring.radius - insetUnits, insetUnits);
      const totalSlots = group.topics.length + group.blanks;
      const positions = computeRingPositions(totalSlots, placementRadius);

      group.topics.forEach(function (topic, i) {
        const pos = positions[i];
        const node = buildNode(topic, patternIndex);
        patternIndex += 1;
        node.style.left = pos.x + '%';
        node.style.top = pos.y + '%';
        stage.appendChild(node);
        ringNodes.push(node);
      });

      for (let b = 0; b < group.blanks; b++) {
        const pos = positions[group.topics.length + b];
        const node = buildBlankNode(patternIndex);
        patternIndex += 1;
        node.style.left = pos.x + '%';
        node.style.top = pos.y + '%';
        stage.appendChild(node);
        ringNodes.push(node);
      }

      const label = document.createElement('div');
      label.className = 'ring-label';
      label.textContent = group.ring.title;
      label.style.left = '50%';
      label.style.top = (50 - group.ring.radius - 5) + '%';
      stage.appendChild(label);

      nodesByRing.push(ringNodes);
    });

    stage.appendChild(svg);

    const ring1Nodes = nodesByRing[0] || [];
    const outerRingNodes = nodesByRing[nodesByRing.length - 1] || [];

    return setupScrollZoom(stage, outer, ring1Nodes, outerRingNodes);
  }

  function renderGridLayout(topics, containerEl) {
    containerEl.innerHTML = '';
    containerEl.className = '';

    const grouped = groupByRing(topics);
    let patternIndex = 0;

    grouped.forEach(function (group) {
      if (group.topics.length === 0 && group.blanks === 0) return;

      const section = document.createElement('div');
      section.className = 'topic-grid-section';

      const title = document.createElement('p');
      title.className = 'topic-grid-section-title';
      title.textContent = group.ring.title;
      section.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'topic-grid';

      group.topics.forEach(function (topic) {
        grid.appendChild(buildNode(topic, patternIndex));
        patternIndex += 1;
      });
      for (let b = 0; b < group.blanks; b++) {
        grid.appendChild(buildBlankNode(patternIndex));
        patternIndex += 1;
      }

      section.appendChild(grid);
      containerEl.appendChild(section);
    });

    return null;
  }

  FaithApp.renderTopicWeb = function (topics, containerEl) {
    let mode = FaithApp.getLayoutPreference();
    let cleanupScroll = null;

    function draw() {
      if (cleanupScroll) {
        cleanupScroll();
        cleanupScroll = null;
      }
      if (mode === 'grid') {
        renderGridLayout(topics, containerEl);
      } else {
        cleanupScroll = renderWebLayout(topics, containerEl);
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

    const kebabBtn = document.getElementById('kebab-btn');
    kebabBtn.setAttribute('aria-haspopup', 'true');
    kebabBtn.setAttribute('aria-expanded', 'false');

    function setMenuOpen(open) {
      menu.classList.toggle('open', open);
      kebabBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    [webOption, gridOption].forEach(function (option) {
      option.addEventListener('click', function () {
        mode = option.getAttribute('data-mode');
        FaithApp.setLayoutPreference(mode);
        syncChecks();
        draw();
        setMenuOpen(false);
      });
    });

    kebabBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setMenuOpen(!menu.classList.contains('open'));
    });
    document.addEventListener('click', function () {
      setMenuOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        setMenuOpen(false);
      }
    });
  };
})(window.FaithApp);
