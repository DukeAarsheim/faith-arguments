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
      '<h1></h1>' +
      '<p class="summary"></p>' +
      '<div id="argument-root"></div>';

    rootEl.querySelector('h1').textContent = topic.title;
    rootEl.querySelector('.summary').textContent = topic.summary;

    FaithApp.renderArgumentTree(topic.argument, topic.objections, document.getElementById('argument-root'));
  }

  init();
})();
