window.FaithApp = window.FaithApp || {};

(function (FaithApp) {
  const MIN_BODY_CHARS = 160;
  const FLAT_FROM_DEPTH = 4;
  const OBJECTION_NOTE = /^\*(Objection:[^*]+)\*$/;

  function renderInline(text, parent) {
    let buffer = '';
    let i = 0;

    function flush() {
      if (buffer) {
        parent.appendChild(document.createTextNode(buffer));
        buffer = '';
      }
    }

    while (i < text.length) {
      if (text.startsWith('**', i)) {
        const end = text.indexOf('**', i + 2);
        if (end > i + 2) {
          flush();
          const strong = document.createElement('strong');
          renderInline(text.slice(i + 2, end), strong);
          parent.appendChild(strong);
          i = end + 2;
          continue;
        }
      } else if (text.charAt(i) === '*') {
        const end = text.indexOf('*', i + 1);
        if (end > i + 1) {
          flush();
          const em = document.createElement('em');
          renderInline(text.slice(i + 1, end), em);
          parent.appendChild(em);
          i = end + 1;
          continue;
        }
      }
      buffer += text.charAt(i);
      i += 1;
    }
    flush();
  }

  function splitLead(text) {
    if (text.startsWith('**')) {
      const end = text.indexOf('**', 2);
      if (end > 2) {
        return { lead: text.slice(2, end), rest: text.slice(end + 2).trim() };
      }
    }
    return { lead: null, rest: text };
  }

  function plainLength(text) {
    return text.replace(/\*/g, '').length;
  }

  function buildOutline(blocks) {
    const root = { level: 0, title: '', items: [] };
    const stack = [root];
    blocks.forEach(function (block) {
      if (block.type === 'heading') {
        const node = { level: block.level, title: block.text, items: [] };
        while (stack[stack.length - 1].level >= block.level) stack.pop();
        stack[stack.length - 1].items.push({ type: 'node', node: node });
        stack.push(node);
      } else {
        stack[stack.length - 1].items.push(block);
      }
    });
    return root;
  }

  function createDropdown(titleText, className, depth, fillBody) {
    const root = document.createElement('div');
    root.className = 'md-dd ' + className;
    root.setAttribute('data-open', 'false');

    const head = document.createElement('button');
    head.type = 'button';
    head.className = 'md-dd-head';
    head.setAttribute('aria-expanded', 'false');

    const label = document.createElement('span');
    label.className = 'md-dd-title';
    renderInline(titleText, label);

    const chevron = document.createElement('span');
    chevron.className = 'md-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.textContent = '▾';

    head.appendChild(label);
    head.appendChild(chevron);

    const body = document.createElement('div');
    body.className = 'md-dd-body' + (depth >= FLAT_FROM_DEPTH ? ' md-flat' : '');
    body.setAttribute('hidden', 'until-found');
    fillBody(body);

    function setOpen(open) {
      root.setAttribute('data-open', open ? 'true' : 'false');
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        body.removeAttribute('hidden');
      } else {
        body.setAttribute('hidden', 'until-found');
      }
    }

    head.addEventListener('click', function () {
      setOpen(root.getAttribute('data-open') !== 'true');
    });
    body.addEventListener('beforematch', function () {
      setOpen(true);
    });

    root.appendChild(head);
    root.appendChild(body);
    return root;
  }

  function renderListItem(item, ordered, depth) {
    const li = document.createElement('li');
    const parts = splitLead(item.text);
    const hasChildren = item.items.length > 0;
    const isDropdown = !ordered && parts.lead !== null && (hasChildren || plainLength(parts.rest) >= MIN_BODY_CHARS);

    if (!isDropdown) {
      li.className = 'md-li';
      renderInline(item.text, li);
      if (hasChildren) li.appendChild(renderList(item.items, false, depth));
      return li;
    }

    li.className = 'md-li md-li-dd';
    li.appendChild(createDropdown(parts.lead.replace(/\.$/, ''), 'md-dd-bullet', depth + 1, function (body) {
      if (parts.rest) {
        const p = document.createElement('p');
        p.className = 'md-p';
        renderInline(parts.rest, p);
        body.appendChild(p);
      }
      if (hasChildren) body.appendChild(renderList(item.items, false, depth + 1));
    }));
    return li;
  }

  function renderList(items, ordered, depth) {
    const list = document.createElement(ordered ? 'ol' : 'ul');
    list.className = 'md-list' + (ordered ? ' md-ol' : '');
    items.forEach(function (item) {
      list.appendChild(renderListItem(item, ordered, depth));
    });
    return list;
  }

  function renderTable(block) {
    const wrap = document.createElement('div');
    wrap.className = 'md-table-wrap';
    const table = document.createElement('table');
    table.className = 'md-table';

    const headRow = document.createElement('tr');
    block.header.forEach(function (cell) {
      const th = document.createElement('th');
      renderInline(cell, th);
      headRow.appendChild(th);
    });
    const thead = document.createElement('thead');
    thead.appendChild(headRow);

    const tbody = document.createElement('tbody');
    block.rows.forEach(function (row) {
      const tr = document.createElement('tr');
      row.forEach(function (cell) {
        const td = document.createElement('td');
        renderInline(cell, td);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  function renderBlock(block, depth) {
    if (block.type === 'blockquote') {
      const quote = document.createElement('blockquote');
      quote.className = 'md-note';
      renderInline(block.text, quote);
      return quote;
    }
    if (block.type === 'list') return renderList(block.items, block.ordered, depth);
    if (block.type === 'table') return renderTable(block);

    const p = document.createElement('p');
    p.className = 'md-p';
    renderInline(block.text, p);
    return p;
  }

  function renderNode(node, depth) {
    if (node.level <= 2) {
      const section = document.createElement('section');
      section.className = 'md-section';
      const heading = document.createElement('h2');
      heading.className = 'md-section-title';
      renderInline(node.title, heading);
      const body = document.createElement('div');
      renderItems(node.items, body, depth);
      section.appendChild(heading);
      section.appendChild(body);
      return section;
    }

    const className = node.level === 3 ? 'md-dd-part' : 'md-dd-fact';
    return createDropdown(node.title, className, depth + 1, function (body) {
      renderItems(node.items, body, depth + 1);
    });
  }

  function renderItems(items, parentEl, depth) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type === 'node') {
        parentEl.appendChild(renderNode(item.node, depth));
      } else if (item.type === 'paragraph' && OBJECTION_NOTE.test(item.text)) {
        const rest = items.slice(i + 1);
        parentEl.appendChild(createDropdown(OBJECTION_NOTE.exec(item.text)[1], 'md-dd-bullet', depth + 1, function (body) {
          renderItems(rest, body, depth + 1);
        }));
        return;
      } else {
        parentEl.appendChild(renderBlock(item, depth));
      }
    }
  }

  FaithApp.renderMarkdownTopic = function (source, containerEl) {
    containerEl.innerHTML = '';
    const outline = buildOutline(FaithApp.parseMarkdown(source));

    let title = '';
    let items = outline.items;
    const first = items[0];
    if (first && first.type === 'node' && first.node.level === 1) {
      title = first.node.title;
      items = first.node.items;
    }

    renderItems(items, containerEl, 0);
    return { title: title };
  };
})(window.FaithApp);
