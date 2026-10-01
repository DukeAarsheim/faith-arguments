window.FaithApp = window.FaithApp || {};

(function (FaithApp) {
  function renderPremiseContent(premise, parentEl, level) {
    const heading = document.createElement(level === 0 ? 'h2' : 'h3');
    heading.className = level === 0 ? 'premise-heading' : 'premise-subheading';
    heading.textContent = premise.text;
    parentEl.appendChild(heading);

    const paragraph = document.createElement('p');
    paragraph.className = 'premise-text';
    paragraph.textContent = premise.support || '';
    parentEl.appendChild(paragraph);

    if (premise.children && premise.children.length > 0) {
      const childrenWrap = document.createElement('div');
      childrenWrap.className = 'premise-children';
      premise.children.forEach(function (child) {
        renderPremiseContent(child, childrenWrap, level + 1);
      });
      parentEl.appendChild(childrenWrap);
    }
  }

  function groupObjectionsByPremise(objections) {
    const map = {};
    (objections || []).forEach(function (objection) {
      const key = objection.relatesTo || '';
      if (!map[key]) map[key] = [];
      map[key].push(objection);
    });
    return map;
  }

  FaithApp.renderArgumentTree = function (argument, objections, containerEl) {
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

    const objectionsByPremise = groupObjectionsByPremise(objections);

    argument.premises.forEach(function (premise) {
      const related = objectionsByPremise[premise.id] || [];

      const row = document.createElement('div');
      row.className = 'article-row' + (related.length > 0 ? ' has-objection' : '');

      const main = document.createElement('div');
      main.className = 'article-main';
      renderPremiseContent(premise, main, 0);
      row.appendChild(main);

      if (related.length > 0) {
        const aside = document.createElement('aside');
        aside.className = 'article-objections';
        related.forEach(function (objection) {
          aside.appendChild(FaithApp.buildObjectionCard(objection));
        });
        row.appendChild(aside);
      }

      containerEl.appendChild(row);
    });
  };
})(window.FaithApp);
