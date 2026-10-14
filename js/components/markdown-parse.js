window.FaithApp = window.FaithApp || {};

(function (FaithApp) {
  const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
  const RULE = /^(?:-{3,}|\*{3,}|_{3,})$/;
  const LIST_ITEM = /^(\s*)([-*+]|\d+\.)\s+(.*)$/;
  const TABLE_SEPARATOR = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/;

  function splitTableRow(line) {
    let row = line.trim();
    if (row.charAt(0) === '|') row = row.slice(1);
    if (row.charAt(row.length - 1) === '|') row = row.slice(0, -1);
    return row.split('|').map(function (cell) { return cell.trim(); });
  }

  FaithApp.parseMarkdown = function (source) {
    const lines = source.replace(/\r\n?/g, '\n').split('\n');
    const blocks = [];
    let paragraph = [];
    let list = null;

    function flushParagraph() {
      if (paragraph.length > 0) {
        blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
        paragraph = [];
      }
    }

    function flushList() {
      if (list) {
        blocks.push({ type: 'list', ordered: list.ordered, items: list.root.items });
        list = null;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed === '') {
        flushParagraph();
        flushList();
        continue;
      }

      const heading = HEADING.exec(trimmed);
      if (heading && trimmed.charAt(0) === '#') {
        flushParagraph();
        flushList();
        blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] });
        continue;
      }

      if (RULE.test(trimmed)) {
        flushParagraph();
        flushList();
        continue;
      }

      if (trimmed.charAt(0) === '>') {
        flushParagraph();
        flushList();
        const quote = [];
        while (i < lines.length && lines[i].trim().charAt(0) === '>') {
          quote.push(lines[i].trim().replace(/^>\s?/, ''));
          i += 1;
        }
        i -= 1;
        blocks.push({ type: 'blockquote', text: quote.join(' ') });
        continue;
      }

      if (trimmed.charAt(0) === '|' && i + 1 < lines.length && TABLE_SEPARATOR.test(lines[i + 1].trim())) {
        flushParagraph();
        flushList();
        const header = splitTableRow(trimmed);
        const rows = [];
        i += 2;
        while (i < lines.length && lines[i].trim().charAt(0) === '|') {
          rows.push(splitTableRow(lines[i]));
          i += 1;
        }
        i -= 1;
        blocks.push({ type: 'table', header: header, rows: rows });
        continue;
      }

      const itemMatch = LIST_ITEM.exec(line);
      if (itemMatch) {
        flushParagraph();
        const indent = itemMatch[1].replace(/\t/g, '    ').length;
        const ordered = /\d/.test(itemMatch[2]);
        if (list && indent === list.baseIndent && ordered !== list.ordered) flushList();
        if (!list) {
          const root = { items: [] };
          list = { ordered: ordered, baseIndent: indent, root: root, stack: [{ indent: -1, node: root }], last: null };
        }
        while (list.stack.length > 1 && list.stack[list.stack.length - 1].indent >= indent) {
          list.stack.pop();
        }
        const item = { text: itemMatch[3].trim(), items: [] };
        list.stack[list.stack.length - 1].node.items.push(item);
        list.stack.push({ indent: indent, node: item });
        list.last = item;
        continue;
      }

      if (list && /^\s/.test(line)) {
        list.last.text += ' ' + trimmed;
        continue;
      }

      flushList();
      paragraph.push(trimmed);
    }

    flushParagraph();
    flushList();
    return blocks;
  };
})(window.FaithApp);
