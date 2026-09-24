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

  function computeWebPositions(count) {
    const positions = [];
    const hub = { x: 50, y: 52 };
    const baseRadius = 32;
    const ringGap = 32;
    let remaining = count;
    let ring = 0;

    while (remaining > 0) {
      const capacity = ring === 0 ? 6 : 6 + ring * 2;
      const inRing = Math.min(remaining, capacity);
      const radius = baseRadius + ring * ringGap;
      const angleOffset = ring > 0 ? 180 / inRing : 0;
      for (let i = 0; i < inRing; i++) {
        const angle = ((-90 + angleOffset + (360 / inRing) * i) * Math.PI) / 180;
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
    svg.setAttribute('aria-hidden', 'true');

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
