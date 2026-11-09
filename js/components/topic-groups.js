window.FaithApp = window.FaithApp || {};

(function (FaithApp) {
  const GROUPS = FaithApp.GROUPS;
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
    span.style.width = spec.size * 0.4 + 'cqw';
    span.style.height = spec.size * 0.4 + 'cqw';
    span.style.opacity = spec.opacity;
    return span;
  }

  function buildArt(patternIndex) {
    const pattern = STAR_PATTERNS[patternIndex % STAR_PATTERNS.length];
    const art = document.createElement('div');
    art.className = 'card-art';
    art.setAttribute('aria-hidden', 'true');
    pattern.dots.forEach(function (dot) { art.appendChild(buildStar('star-dot', dot)); });
    pattern.sparkles.forEach(function (sparkle) { art.appendChild(buildStar('star-sparkle', sparkle)); });
    return art;
  }

  function buildCard(topic, patternIndex) {
    const card = document.createElement('a');
    card.className = 'topic-card';
    card.href = 'topic.html?topic=' + encodeURIComponent(topic.slug);
    card.appendChild(buildArt(patternIndex));

    const arrow = document.createElement('span');
    arrow.className = 'card-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    card.appendChild(arrow);

    const text = document.createElement('div');
    text.className = 'card-text';
    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = topic.title;
    text.appendChild(title);
    if (topic.teaser) {
      const teaser = document.createElement('p');
      teaser.className = 'card-teaser';
      teaser.textContent = topic.teaser;
      text.appendChild(teaser);
    }
    card.appendChild(text);
    return card;
  }

  function buildBlankCard(patternIndex) {
    const card = document.createElement('div');
    card.className = 'topic-card is-blank';
    card.setAttribute('aria-hidden', 'true');
    card.appendChild(buildArt(patternIndex));
    return card;
  }

  FaithApp.renderTopicGroups = function (topics, containerEl) {
    containerEl.innerHTML = '';
    let patternIndex = 0;

    GROUPS.forEach(function (group) {
      const groupTopics = topics.filter(function (t) { return t.group === group.id; });
      const blanks = BLANK_SLOTS[group.id] || 0;
      if (groupTopics.length === 0 && blanks === 0) return;

      const section = document.createElement('section');
      section.className = 'topic-section';

      const title = document.createElement('h2');
      title.className = 'topic-section-title';
      title.textContent = group.title;
      section.appendChild(title);

      const cards = document.createElement('div');
      cards.className = 'topic-cards';
      groupTopics.forEach(function (topic) {
        cards.appendChild(buildCard(topic, patternIndex));
        patternIndex += 1;
      });
      for (let b = 0; b < blanks; b++) {
        cards.appendChild(buildBlankCard(patternIndex));
        patternIndex += 1;
      }

      section.appendChild(cards);
      containerEl.appendChild(section);
    });
  };
})(window.FaithApp);
