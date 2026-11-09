window.FaithApp = window.FaithApp || {};

(function (FaithApp) {
  const GROUPS = FaithApp.GROUPS;
  const BLANK_SLOTS = { 3: 2 };

  function buildCard(topic) {
    const card = document.createElement('a');
    card.className = 'topic-card';
    card.href = 'topic.html?topic=' + encodeURIComponent(topic.slug);

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

  function buildBlankCard() {
    const card = document.createElement('div');
    card.className = 'topic-card is-blank';
    card.setAttribute('aria-hidden', 'true');
    return card;
  }

  FaithApp.renderTopicGroups = function (topics, containerEl) {
    containerEl.innerHTML = '';

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
        cards.appendChild(buildCard(topic));
      });
      for (let b = 0; b < blanks; b++) {
        cards.appendChild(buildBlankCard());
      }

      section.appendChild(cards);
      containerEl.appendChild(section);
    });
  };
})(window.FaithApp);
