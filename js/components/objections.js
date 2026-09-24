window.FaithApp = window.FaithApp || {};

(function (FaithApp) {
  FaithApp.renderObjections = function (objections, containerEl) {
    containerEl.innerHTML = '';

    objections.forEach(function (objection) {
      const row = document.createElement('div');
      row.className = 'objection';
      row.setAttribute('data-open', 'false');

      const head = document.createElement('button');
      head.className = 'objection-head';
      head.type = 'button';
      head.setAttribute('aria-expanded', 'false');

      const textSpan = document.createElement('span');
      textSpan.textContent = objection.text;
      const chevron = document.createElement('span');
      chevron.className = 'chevron';
      chevron.textContent = '▾';
      head.appendChild(textSpan);
      head.appendChild(chevron);

      const body = document.createElement('div');
      body.className = 'objection-body';
      body.textContent = objection.response;

      head.addEventListener('click', function () {
        const isOpen = row.getAttribute('data-open') === 'true';
        row.setAttribute('data-open', isOpen ? 'false' : 'true');
        head.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      });

      row.appendChild(head);
      row.appendChild(body);
      containerEl.appendChild(row);
    });
  };
})(window.FaithApp);
