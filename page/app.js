// MOTD-Studio – Seite und Reiter: Beschreibung des Servers in der Serverliste mit Farben gestalten, Vorschau wie im Spiel,
// speichern über Hostwerk (change:minecraft – Hostwerk fragt vorher). Läuft der Server, wirkt die Änderung nach einem Neustart.
const { html, t } = Hostwerk;
const M = Motd;
const CODES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
const FMT = [['l', 'B'], ['o', 'I'], ['n', 'U'], ['m', 'S'], ['r', '↺']];
let servers = [];
let current = null;

const $ = (id) => document.getElementById(id);
function preview(text) {
  const lines = M.parse(text);
  return html`${lines.map((line) => html`<div class="motd-line">${line.map((s) => html`<span style="${`color:${s.color};${s.bold ? 'font-weight:700;' : ''}${s.italic ? 'font-style:italic;' : ''}${s.underline || s.strike ? `text-decoration:${s.underline ? 'underline ' : ''}${s.strike ? 'line-through' : ''};` : ''}`}">${s.obfuscated ? s.text.replace(/\S/g, '▒') : s.text}</span>`)}</div>`)}`;
}
function renderEditor() {
  const s = servers.find((x) => x.id === current);
  if (!s) { Hostwerk.render('#editor', html`<div class="empty"><b>${t('noServer')}</b></div>`); return; }
  const value = M.normalize(s.motd || '');
  Hostwerk.render('#editor', html`
    <div class="grid grid-2 motd-grid">
      <div class="card card-pad stack">
        <label class="label" for="motd">${t('text')}</label>
        <textarea class="input mono" id="motd" rows="3">${value}</textarea>
        <div class="motd-tools">${CODES.map((c) => html`<button type="button" class="swatch" data-code="${c}" title="§${c}" style="${`background:${M.COLORS[c]}`}"></button>`)}${FMT.map(([c, l]) => html`<button type="button" class="btn sm ghost" data-code="${c}" title="§${c}">${l}</button>`)}</div>
        <div id="problems" class="small"></div>
        <div class="row"><span class="grow muted small">${s.state === 'running' ? t('restartHint') : ''}</span><button class="btn primary" id="save">${t('save')}</button></div>
      </div>
      <div class="card card-pad stack">
        <div class="label">${t('preview')}</div>
        <div class="motd-box"><div class="motd-icon">${s.name.slice(0, 1).toUpperCase()}</div><div class="grow"><div class="motd-name">${s.name}</div><div id="pv"></div></div><div class="motd-players">${s.state === 'running' ? `${s.players != null ? s.players : 0}/${s.maxPlayers || 20}` : '–'}</div></div>
      </div>
    </div>`);
  const ta = $('motd');
  const update = () => {
    Hostwerk.render('#pv', preview(ta.value));
    const p = M.check(ta.value);
    Hostwerk.render('#problems', p.length ? html`${p.map((x) => html`<div class="c-warn">${t('problem.' + x.code, { line: x.line, n: x.length })}</div>`)}` : html`<span class="muted">${t('ok')}</span>`);
  };
  ta.addEventListener('input', update);
  for (const b of document.querySelectorAll('[data-code]')) b.addEventListener('click', () => { const r = M.insert(ta.value, ta.selectionStart, ta.selectionEnd, b.dataset.code); ta.value = r.text; ta.focus(); ta.setSelectionRange(r.cursor, r.cursor); update(); });
  $('save').addEventListener('click', async () => {
    try { await Hostwerk.put(`/mc/servers/${encodeURIComponent(s.id)}/properties`, { motd: M.toProperty(ta.value) }); s.motd = M.toProperty(ta.value); Hostwerk.toast(t('saved'), { kind: 'success' }); } catch (e) { if (!/Abgelehnt|Declined/.test(e.message)) Hostwerk.toast(e.message, { kind: 'error' }); }
  });
  update();
}
function renderPicker() {
  const pick = $('server');
  if (!pick) return;
  Hostwerk.render(pick, html`${servers.map((s) => html`<option value="${s.id}" ${s.id === current ? Hostwerk.raw('selected') : ''}>${s.name}</option>`)}`);
  pick.onchange = () => { current = pick.value; renderEditor(); };
}
async function load() {
  const list = await Hostwerk.get('/mc/servers');
  servers = (Array.isArray(list) ? list : []).map((s) => ({ id: s.id, name: s.name, motd: s.motd || '', state: (s.proc && s.proc.state) || 'stopped', players: s.proc && s.proc.extra && s.proc.extra.players ? s.proc.extra.players.length : null, maxPlayers: s.maxPlayers }));
  const ctx = Hostwerk.context;
  if (ctx && ctx.kind === 'minecraft') current = ctx.id;
  if (!current || !servers.some((s) => s.id === current)) current = servers[0] && servers[0].id;
  renderPicker();
  renderEditor();
}
function showTab(tab) { for (const el of document.querySelectorAll('[data-tab]')) el.hidden = el.dataset.tab !== (tab || 'editor'); }
Hostwerk.ready().then((info) => {
  showTab(info.tab);
  Hostwerk.on('tab', showTab);
  // Aus dem Rechtsklick-Menü eines Minecraft-Servers oder der Schnellsuche: diesen Server bearbeiten
  const act = (a) => { if (a && a.id === 'edit' && a.target) { current = a.target; renderPicker(); renderEditor(); } };
  Hostwerk.on('action', act);
  load().then(() => act(info.action)).catch((e) => Hostwerk.toast(e.message, { kind: 'error' }));
  Hostwerk.on('lang', load);
});
