/* VietMuse V14 — paragraph-aware image placement.
 * Matches the prose paragraph boundaries used by VMStoryBody in v3.js:
 * blank lines break paragraphs; headings, quotes, lists and photo blocks do not count.
 * Pure functions for deterministic testing; no backend or elevated credentials involved.
 */
(function (root) {
  'use strict';
  const mediaLine = /^\[\[(?:image|video)\|https:\/\/[^|\]\s]+\|[^|\]]*(?:\|[^\]]*)?\]\]$/;

  function findParagraphs(body) {
    const input = String(body ?? '').replace(/\r\n?/g, '\n');
    const out = [];
    let offset = 0;
    let current = null;
    const finish = () => {
      if (current) { out.push(current); current = null; }
    };
    for (const raw of input.split('\n')) {
      const line = raw.trim();
      const special = !line || mediaLine.test(line) || /^#{2,3} /.test(line) ||
        line.startsWith('> ') || line.startsWith('- ');
      if (special) {
        finish();
      } else if (!current) {
        current = {number: out.length + 1, start: offset, end: offset + raw.length, text: line};
      } else {
        current.end = offset + raw.length;
        current.text += ' ' + line;
      }
      offset += raw.length + 1;
    }
    finish();
    return out;
  }

  function insertAfter(body, paragraphNumber, mediaMarker) {
    const normalized = String(body ?? '').replace(/\r\n?/g, '\n');
    const paras = findParagraphs(normalized);
    const number = Number(paragraphNumber);
    if (!Number.isInteger(number) || number < 1 || number > paras.length) {
      throw new RangeError('Choose a paragraph in the article before inserting the image.');
    }
    const marker = String(mediaMarker ?? '').trim();
    if (!/^\[\[(?:image|video)\|https:\/\//.test(marker) || !mediaLine.test(marker)) {
      throw new TypeError('A valid media marker is required.');
    }
    // Preserve editor insertion order when several photos/videos follow the same paragraph.
    let index = paras[number - 1].end;
    const inlineMedia = /^(?:\n+\[\[(?:image|video)\|[^\r\n]+\]\])+/;
    const existing = normalized.slice(index).match(inlineMedia);
    if (existing) index += existing[0].length;
    const before = normalized.slice(0, index);
    const after = normalized.slice(index);
    // Keep image on its own line. Existing following newlines supply part of the separator.
    const trailingNewlines = after.match(/^\n*/)[0].length;
    const suffix = !after ? '\n' : trailingNewlines >= 2 ? '' : trailingNewlines === 1 ? '\n' : '\n\n';
    const inserted = '\n\n' + marker + suffix;
    return {value: before + inserted + after, cursor: index + inserted.length,
      paragraphNumber: number, totalParagraphs: paras.length};
  }

  root.VMParagraphTools = Object.freeze({findParagraphs, insertAfter});
})(window);
