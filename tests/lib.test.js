const test = require('node:test');
const assert = require('node:assert');
const M = require('../page/lib.js');

test('Farben und Formate werden zu Abschnitten', () => {
  const l = M.parse('§aGrün §lfett§r normal');
  assert.strictEqual(l.length, 1);
  assert.deepStrictEqual(l[0].map((s) => [s.text, s.color, s.bold]), [['Grün ', '#55FF55', false], ['fett', '#55FF55', true], [' normal', '#AAAAAA', false]]);
});

test('Farbe setzt Formate zurück (wie im Spiel)', () => {
  const l = M.parse('§c§lRot fett §9blau');
  assert.strictEqual(l[0][0].bold, true);
  assert.strictEqual(l[0][1].bold, false);
  assert.strictEqual(l[0][1].color, '#5555FF');
});

test('server.properties-Schreibweise wird verstanden und geschrieben', () => {
  assert.strictEqual(M.plain('\\u00A7aHallo\\nWelt'), 'Hallo\nWelt');
  assert.strictEqual(M.toProperty('§aHallo\nWelt'), '\\u00A7aHallo\\nWelt');
});

test('Prüfung: zu viele Zeilen, zu lang, unbekannter Code', () => {
  assert.deepStrictEqual(M.check('§aOk'), []);
  assert.ok(M.check('a\nb\nc').some((p) => p.code === 'lines'));
  assert.ok(M.check('x'.repeat(70)).some((p) => p.code === 'long' && p.length === 70));
  assert.ok(M.check('§zFalsch').some((p) => p.code === 'unknown'));
});

test('Einfügen: Code an der Stelle oder Auswahl einfassen', () => {
  assert.deepStrictEqual(M.insert('Hallo', 5, 5, 'a'), { text: 'Hallo§a', cursor: 7 });
  assert.deepStrictEqual(M.insert('Hallo Welt', 6, 10, 'l'), { text: 'Hallo §lWelt§r', cursor: 14 });
});

test('§k gehört zu den Formaten (Werkzeugleiste und Tabelle)', () => {
  assert.strictEqual(M.FORMATS.k, 'obfuscated');
  assert.strictEqual(M.parse('§kGeheim')[0][0].obfuscated, true);
});

test('Breite wie Minecrafts Schrift: Codes zählen nicht, fett ist breiter', () => {
  assert.strictEqual(M.width('aaa'), 18);
  assert.strictEqual(M.width('§aaaa'), 18);
  assert.strictEqual(M.width('§laaa'), 21);
  assert.strictEqual(M.width('il!'), 7);
});

test('Zentrieren: Leerzeichen davor, Codes bleiben vorn, alte Einrückung wird ersetzt', () => {
  const c = M.center('§6§lHallo\n   §7Welt');
  const [a, b] = c.split('\n');
  assert.match(a, /^ +§6§lHallo$/); assert.match(b, /^ +§7Welt$/);
  const pad = (s) => s.match(/^ */)[0].length;
  assert.strictEqual(pad(a), Math.floor((M.LIST_WIDTH - M.width('§6§lHallo')) / 8));
  assert.strictEqual(M.center(M.center('§aX')), M.center('§aX'), 'zweimal zentrieren ändert nichts');
  assert.strictEqual(M.center('x'.repeat(80)).startsWith('x'), true, 'zu lange Zeile bleibt links');
});

test('Vorlagen: Name eingesetzt, beide Sprachen, ohne § aus dem Namen', () => {
  for (const tpl of M.TEMPLATES) {
    const de = M.template(tpl.id, '§cFreunde', 'de'); const en = M.template(tpl.id, 'Friends', 'en');
    assert.ok(de && en, tpl.id);
    assert.deepStrictEqual(M.check(de).filter((p) => p.code !== 'long'), [], `${tpl.id}: gültig`);
    assert.ok(!de.includes('{name}') && !/§cFreunde/.test(de));
  }
  assert.strictEqual(M.template('gibtsnicht', 'x'), '');
});

test('Symbol-Zuschnitt: quadratisch, mittig, Zoom und Verschiebung bleiben im Bild', () => {
  assert.deepStrictEqual(M.crop(200, 100), { sx: 50, sy: 0, size: 100 });
  assert.deepStrictEqual(M.crop(200, 100, 2), { sx: 75, sy: 25, size: 50 });
  assert.deepStrictEqual(M.crop(200, 100, 2, -1, 1), { sx: 0, sy: 50, size: 50 });
  assert.deepStrictEqual(M.crop(200, 100, 1, 5, 0), { sx: 100, sy: 0, size: 100 }, 'Verschiebung begrenzt');
});
