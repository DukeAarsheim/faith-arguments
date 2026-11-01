window.FaithApp = window.FaithApp || {};

(function (FaithApp) {
  FaithApp.STORAGE_KEYS = {
    VISITED: 'faithArguments.visitedTopics'
  };

  FaithApp.GROUPS = [
    { id: 1, title: 'Does God Exist?' },
    { id: 2, title: 'Why Christianity?' },
    { id: 3, title: 'Common Objections' }
  ];

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

  let openGroup = null;
  let lastWidth = window.innerWidth;
  let dismissHandlersBound = false;

  function closeMenu(returnFocus) {
    if (!openGroup) return;
    const group = openGroup;
    openGroup = null;
    const trigger = group.querySelector('.nav-trigger');
    group.classList.remove('open');
    group.querySelector('.nav-menu').hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) trigger.focus();
  }

  function positionMenu(trigger, menu) {
    const header = trigger.closest('.site-header');
    const headerRect = header.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const maxLeft = headerRect.width - menu.offsetWidth - 8;
    const left = Math.max(8, Math.min(triggerRect.left - headerRect.left, maxLeft));
    menu.style.left = left + 'px';
    menu.style.top = (triggerRect.bottom - headerRect.top + 8) + 'px';
  }

  function openMenu(group) {
    closeMenu(false);
    const trigger = group.querySelector('.nav-trigger');
    const menu = group.querySelector('.nav-menu');
    menu.hidden = false;
    group.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    positionMenu(trigger, menu);
    openGroup = group;
  }

  function bindDismissHandlers() {
    if (dismissHandlersBound) return;
    dismissHandlersBound = true;
    document.addEventListener('click', function (e) {
      if (openGroup && !openGroup.contains(e.target)) closeMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && openGroup) closeMenu(true);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      closeMenu(false);
    });
  }

  function buildNavGroup(group, groupTopics, activeSlug, visited) {
    const wrap = document.createElement('div');
    wrap.className = 'nav-group' + (groupTopics.some(function (t) { return t.slug === activeSlug; }) ? ' active' : '');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'nav-trigger';
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    const label = document.createElement('span');
    label.textContent = group.title;
    const chevron = document.createElement('span');
    chevron.className = 'nav-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.textContent = '▾';
    trigger.appendChild(label);
    trigger.appendChild(chevron);

    const menu = document.createElement('div');
    menu.className = 'nav-menu';
    menu.tabIndex = -1;
    menu.hidden = true;

    groupTopics.forEach(function (topic) {
      const link = document.createElement('a');
      link.className = 'nav-menu-link' + (activeSlug === topic.slug ? ' active' : '');
      link.href = 'topic.html?topic=' + encodeURIComponent(topic.slug);
      if (activeSlug === topic.slug) link.setAttribute('aria-current', 'page');
      const text = document.createElement('span');
      text.textContent = topic.title;
      link.appendChild(text);
      if (visited.indexOf(topic.slug) !== -1) {
        const check = document.createElement('span');
        check.className = 'nav-check';
        check.textContent = '✓';
        link.appendChild(check);
      }
      menu.appendChild(link);
    });

    trigger.addEventListener('click', function () {
      if (openGroup === wrap) {
        closeMenu(false);
      } else {
        openMenu(wrap);
      }
    });
    wrap.addEventListener('focusout', function (e) {
      if (openGroup === wrap && !wrap.contains(e.relatedTarget)) closeMenu(false);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    return wrap;
  }

  FaithApp.renderNav = function (topics, activeSlug, containerEl) {
    const visited = FaithApp.getVisitedTopics();
    openGroup = null;
    containerEl.innerHTML = '';

    const homeLink = document.createElement('a');
    homeLink.className = 'nav-link' + (activeSlug === null ? ' active' : '');
    homeLink.href = 'index.html';
    homeLink.textContent = 'Home';
    containerEl.appendChild(homeLink);

    FaithApp.GROUPS.forEach(function (group) {
      const groupTopics = topics.filter(function (t) { return t.group === group.id; });
      if (groupTopics.length === 0) return;
      containerEl.appendChild(buildNavGroup(group, groupTopics, activeSlug, visited));
    });

    bindDismissHandlers();
  };
})(window.FaithApp);
