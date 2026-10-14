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

    const isMarkdown = topicMeta.format === 'markdown';
    let topic;
    let markdown;
    try {
      const response = await fetch('data/' + slug + (isMarkdown ? '.md' : '.json'));
      if (!response.ok) throw new Error('Not found');
      if (isMarkdown) {
        markdown = await response.text();
      } else {
        topic = await response.json();
      }
    } catch (err) {
      FaithApp.renderNav(topics, null, navEl);
      renderNotFound(rootEl);
      return;
    }

    FaithApp.markVisited(slug);
    FaithApp.renderNav(topics, slug, navEl);

    if (isMarkdown) {
      rootEl.innerHTML =
        '<p class="eyebrow">Topic</p>' +
        '<h1></h1>' +
        '<div id="markdown-root"></div>';
      const result = FaithApp.renderMarkdownTopic(markdown, document.getElementById('markdown-root'));
      rootEl.querySelector('h1').textContent = result.title || topicMeta.title;
      return;
    }

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
