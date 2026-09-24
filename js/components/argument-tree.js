window.FaithApp = window.FaithApp || {};

(function (FaithApp) {
  function renderPremise(premise, parentEl) {
    const row = document.createElement('div');
    row.className = 'premise';
    row.setAttribute('data-open', 'false');

    const head = document.createElement('button');
    head.className = 'premise-head';
    head.type = 'button';
    head.setAttribute('aria-expanded', 'false');

    const textSpan = document.createElement('span');
    textSpan.textContent = premise.text;
    const chevron = document.createElement('span');
    chevron.className = 'chevron';
    chevron.textContent = '▾';
    head.appendChild(textSpan);
    head.appendChild(chevron);

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
      head.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });

    row.appendChild(head);
    row.appendChild(body);
    parentEl.appendChild(row);
  }

  FaithApp.renderArgumentTree = function (argument, containerEl) {
    containerEl.innerHTML = '';

    const conclusion = document.createElement('div');
    conclusion.className = 'argument-conclusion';
    const label = document.createElement('p');
    label.className = 'label';
    label.textContent = 'Conclusion';
    const value = document.createElement('p');
    value.className = 'value';
    value.textContent = argument.conclusion;
    conclusion.appendChild(label);
    conclusion.appendChild(value);
    containerEl.appendChild(conclusion);

    argument.premises.forEach(function (premise) {
      renderPremise(premise, containerEl);
    });
  };
})(window.FaithApp);
