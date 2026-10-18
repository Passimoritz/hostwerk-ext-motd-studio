/* Motd – pure logic without DOM, tested in tests/lib.test.js (node --test). */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; else root.Motd = api;
}(typeof self !== 'undefined' ? self : this, () => {
  /** Minecraft colour codes (§0–§f) with the colours the client uses in the server list. */
  const COLORS = {
    0: '#000000', 1: '#0000AA', 2: '#00AA00', 3: '#00AAAA', 4: '#AA0000', 5: '#AA00AA', 6: '#FFAA00', 7: '#AAAAAA',
    8: '#555555', 9: '#5555FF', a: '#55FF55', b: '#55FFFF', c: '#FF5555', d: '#FF55FF', e: '#FFFF55', f: '#FFFFFF',
  };
  const FORMATS = { k: 'obfuscated', l: 'bold', m: 'strike', n: 'underline', o: 'italic' };
  const MAX_LINE = 59; // more characters per line are cut off in the default server list

  /** server.properties writes § as § – both forms are accepted, line breaks as real "\n" or the two characters \n. */
  function normalize(text) {
    return String(text || '').replace(/\\u00a7/gi, '§').replace(/\\n/g, '\n').replace(/\r/g, '');
  }

  /** Text → lines of segments [{ text, color, bold, italic, underline, strike, obfuscated }]. Max. 2 lines like Minecraft. */
  function parse(text) {
    const lines = normalize(text).split('\n').slice(0, 2);
    return lines.map((line) => {
      const out = [];
      let st = { color: COLORS[7], bold: false, italic: false, underline: false, strike: false, obfuscated: false };
      let buf = '';
      const flush = () => { if (buf) { out.push({ text: buf, ...st }); buf = ''; } };
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '§' && i + 1 < line.length) {
          const c = line[i + 1].toLowerCase();
          if (COLORS[c] || FORMATS[c] || c === 'r') {
            flush();
            if (COLORS[c]) st = { color: COLORS[c], bold: false, italic: false, underline: false, strike: false, obfuscated: false };
            else if (c === 'r') st = { color: COLORS[7], bold: false, italic: false, underline: false, strike: false, obfuscated: false };
            else st = { ...st, [FORMATS[c]]: true };
            i++; continue;
          }
        }
        buf += ch;
      }
      flush();
      return out;
    });
  }

  /** Visible text without codes (for length and copy). */
  function plain(text) { return parse(text).map((l) => l.map((s) => s.text).join('')).join('\n'); }

  /** Problems: too many lines, too long, unknown codes. → [{ code, line }] */
  function check(text) {
    const n = normalize(text);
    const problems = [];
    const lines = n.split('\n');
    if (lines.length > 2) problems.push({ code: 'lines' });
    plain(text).split('\n').forEach((l, i) => { if (l.length > MAX_LINE) problems.push({ code: 'long', line: i + 1, length: l.length }); });
    if (/§(?![0-9a-fk-or])/i.test(n)) problems.push({ code: 'unknown' });
    return problems;
  }

  /** For server.properties: § and line break written the way Minecraft reads them. */
  function toProperty(text) { return normalize(text).replace(/§/g, '\\u00A7').replace(/\n/g, '\\n'); }

  /** Insert a code at the cursor (or wrap a selection: code + text + §r). */
  function insert(text, start, end, code) {
    const s = String(text || '');
    const a = Math.max(0, Math.min(start, s.length)); const b = Math.max(a, Math.min(end, s.length));
    const sel = s.slice(a, b);
    const piece = sel ? `§${code}${sel}§r` : `§${code}`;
    return { text: s.slice(0, a) + piece + s.slice(b), cursor: a + piece.length };
  }

  return { COLORS, FORMATS, MAX_LINE, normalize, parse, plain, check, toProperty, insert };
}));
