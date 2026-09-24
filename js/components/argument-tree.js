window.FaithApp = window.FaithApp || {};

(function (FaithApp) {
  function renderPremise(premise, parentEl) {
    const row = document.createElement('div');
    row.className = 'premise';
    row.setAttribute('data-open', 'false');

    const head = document.createElement('button');
    head.className = 'premise-head';
    head.type = 'button';
    head.innerHTML = '<span>' + premise.text + '</span><span class="chevron">▾</span>';

    const body = document.createElement('div');
    body.className = 'premise-body';
    body.textContent = premise.support || '';

    if (premise.children && premise.children.length > 0) {
      const childrenWrap = document.createElement('div');
      childrenWrap.className = 'premise-children';
      premise.children.forEach(function (child) {
        renderPremise(child, childrenWrap);
      });
      body.appendChild(childrenWrap);
    }

    head.addEventListener('click', function () {
      const isOpen = row.getAttribute('data-open') === 'true';
      row.setAttribute('data-open', isOpen ? 'false' : 'true');
    });

    row.appendChild(head);
    row.appendChild(body);
    parentEl.appendChild(row);
  }

  FaithApp.renderArgumentTree = function (argument, containerEl) {
    containerEl.innerHTML = '';

    const conclusion = document.createElement('div');
    conclusion.className = 'argument-conclusion';
    conclusion.innerHTML =
      '<p class="label">Conclusion</p><p class="value">' + argument.conclusion + '</p>';
    containerEl.appendChild(conclusion);

    argument.premises.forEach(function (premise) {
      renderPremise(premise, containerEl);
    });
  };
})(window.FaithApp);
