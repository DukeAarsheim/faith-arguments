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
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
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
