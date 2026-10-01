window.FaithApp = window.FaithApp || {};

(function (FaithApp) {
  FaithApp.buildObjectionCard = function (objection) {
    const card = document.createElement('div');
    card.className = 'objection-card';

    const label = document.createElement('p');
    label.className = 'objection-label';
    label.textContent = 'Objection';

    const text = document.createElement('p');
    text.className = 'objection-text';
    text.textContent = objection.text;

    const response = document.createElement('p');
    response.className = 'objection-response';
    response.textContent = objection.response;

    card.appendChild(label);
    card.appendChild(text);
    card.appendChild(response);
    return card;
  };
})(window.FaithApp);
