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
