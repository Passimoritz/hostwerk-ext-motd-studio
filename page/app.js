// MOTD-Studio – Seite und Reiter: Beschreibung des Servers in der Serverliste mit Farben gestalten, Vorschau wie im Spiel,
// speichern über Hostwerk (change:minecraft – Hostwerk fragt vorher). Läuft der Server, bietet die Seite danach
// „Jetzt neu starten“ an (control:services, fragt ebenfalls). Dazu: Vorlagen, Zentrieren, Server-Symbol zuschneiden.
const { html, t } = Hostwerk;
const M = Motd;
const CODES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
const FMT = [['l', 'B', 'bold'], ['o', 'I', 'italic'], ['n', 'U', 'underline'], ['m', 'S', 'strike'], ['k', '?', 'obfuscated'], ['r', '↺', 'reset']];
let servers = [];
let current = null;
let shownFor = null; // Server, dessen Text gerade im Editor steht (Liste aktualisieren, ohne Getipptes zu verlieren)
let icon = null; // { img, zoom, x, y } – Bild für das Server-Symbol, noch nicht gespeichert
const savedIcons = new Map(); // Server → data-URL des zuletzt gespeicherten Symbols (für die Vorschau)

const $ = (id) => document.getElementById(id);
const server = () => servers.find((x) => x.id === current);
function preview(text) {
  const lines = M.parse(text);
  return html`${lines.map((line) => html`<div class="motd-line">${line.map((s) => html`<span style="${`color:${s.color};${s.bold ? 'font-weight:700;' : ''}${s.italic ? 'font-style:italic;' : ''}${s.underline || s.strike ? `text-decoration:${s.underline ? 'underline ' : ''}${s.strike ? 'line-through' : ''};` : ''}`}">${s.obfuscated ? s.text.replace(/\S/g, '▒') : s.text}</span>`)}</div>`)}`;
}

/** Zeile unter dem Editor: läuft der Server, wirkt die Änderung erst nach einem Neustart – mit Knopf. */
function renderStatus() {
  const s = server();
  const el = $('status');
  if (!s || !el) return;
  Hostwerk.render(el, s.state === 'running'
    ? html`<span class="muted small">${t(s.dirty ? 'restartNeeded' : 'restartHint')}</span>${s.dirty ? html` <button type="button" class="btn sm" id="restart">${t('restartNow')}</button>` : ''}`
    : html`<span class="muted small">${t('stoppedHint')}</span>`);
  const r = $('restart');
  if (r) r.addEventListener('click', restart);
  const pl = $('players');
  if (pl) pl.textContent = s.state === 'running' ? `${s.players != null ? s.players : 0}/${s.maxPlayers || 20}` : '–';
}

async function restart() {
  const s = server();
  if (!s) return;
  try { await Hostwerk.service('minecraft', s.id).restart(); s.dirty = false; Hostwerk.toast(t('restarting', { name: s.name }), { kind: 'success' }); renderStatus(); } catch (e) { if (!/Abgelehnt|Declined/i.test(e.message)) Hostwerk.toast(e.message, { kind: 'error' }); }
}

function iconPreview() {
  const s = server();
  const box = $('icon-pv');
  if (!box || !s) return;
  const url = icon ? drawIcon() : savedIcons.get(s.id);
  Hostwerk.render(box, url ? html`<img src="${url}" alt="" width="48" height="48">` : html`<span aria-hidden="true">${s.name.slice(0, 1).toUpperCase()}</span>`);
}

/** Zuschnitt auf 64×64 zeichnen → data-URL (PNG), wie Minecraft das Symbol verlangt. */
function drawIcon() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const g = c.getContext('2d');
  const { sx, sy, size } = M.crop(icon.img.naturalWidth, icon.img.naturalHeight, icon.zoom, icon.x, icon.y);
  g.imageSmoothingQuality = 'high';
  g.drawImage(icon.img, sx, sy, size, size, 0, 0, 64, 64);
  return c.toDataURL('image/png');
}

function renderIconTools() {
  const el = $('icon-tools');
  if (!el) return;
  Hostwerk.render(el, icon
    ? html`<div class="stack icon-crop">
        <label class="label" for="zoom">${t('iconZoom')}</label><input type="range" id="zoom" min="1" max="4" step="0.05" value="${icon.zoom}">
        <label class="label" for="ix">${t('iconX')}</label><input type="range" id="ix" min="-1" max="1" step="0.02" value="${icon.x}">
        <label class="label" for="iy">${t('iconY')}</label><input type="range" id="iy" min="-1" max="1" step="0.02" value="${icon.y}">
        <div class="row"><button type="button" class="btn" id="icon-cancel">${t('cancel')}</button><button type="button" class="btn primary" id="icon-save">${t('iconSave')}</button></div>
      </div>`
    : html`<button type="button" class="btn" id="icon-btn">${t('iconPick')}</button><input type="file" id="icon-file" accept="image/png,image/jpeg,image/webp,image/gif" hidden>`);
  const f = $('icon-file');
  if (f) f.addEventListener('change', () => pickIcon(f.files && f.files[0]));
  const fb = $('icon-btn'); if (fb && f) fb.addEventListener('click', () => f.click());
  for (const [id, key] of [['zoom', 'zoom'], ['ix', 'x'], ['iy', 'y']]) { const r = $(id); if (r) r.addEventListener('input', () => { icon[key] = Number(r.value); iconPreview(); }); }
  const c = $('icon-cancel'); if (c) c.addEventListener('click', () => { icon = null; renderIconTools(); iconPreview(); });
  const sv = $('icon-save'); if (sv) sv.addEventListener('click', saveIcon);
}

function pickIcon(file) {
  if (!file) return;
  if (file.size > 15 * 1048576) { Hostwerk.toast(t('iconTooBig'), { kind: 'error' }); return; }
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => { icon = { img, zoom: 1, x: 0, y: 0 }; renderIconTools(); iconPreview(); };
    img.onerror = () => Hostwerk.toast(t('iconBroken'), { kind: 'error' });
    img.src = String(r.result);
  };
  r.readAsDataURL(file);
}

async function saveIcon() {
  const s = server();
  if (!s || !icon) return;
  const png = drawIcon();
  try {
    await Hostwerk.put(`/mc/servers/${encodeURIComponent(s.id)}/icon`, { png });
    savedIcons.set(s.id, png); icon = null;
    if (s.state === 'running') s.dirty = true;
    Hostwerk.toast(t('iconSaved'), { kind: 'success' });
    renderIconTools(); iconPreview(); renderStatus();
  } catch (e) { if (!/Abgelehnt|Declined/i.test(e.message)) Hostwerk.toast(e.message, { kind: 'error' }); }
}

function renderEditor() {
  const s = server();
  if (!s) { shownFor = null; Hostwerk.render('#editor', html`<div class="empty"><h3>${t('noServer')}</h3><p class="muted small">${t('noServerHint')}</p></div>`); return; }
  shownFor = s.id;
  const value = s.draft != null ? s.draft : M.normalize(s.motd || '');
  Hostwerk.render('#editor', html`
    <div class="grid grid-2 motd-grid">
      <div class="card card-pad stack">
        <label class="label" for="motd">${t('text')}</label>
        <textarea class="input mono" id="motd" rows="3">${value}</textarea>
        <div class="motd-tools" role="toolbar" aria-label="${t('toolbar')}">${CODES.map((c) => html`<button type="button" class="swatch" data-code="${c}" title="${`§${c} ${t('color.' + c)}`}" aria-label="${t('color.' + c)}" style="${`background:${M.COLORS[c]}`}"></button>`)}${FMT.map(([c, l, k]) => html`<button type="button" class="btn sm ghost" data-code="${c}" title="${`§${c} ${t('fmt.' + k)}`}" aria-label="${t('fmt.' + k)}">${l}</button>`)}</div>
        <div class="row motd-more">
          <label class="label" for="tpl">${t('template')}</label>
          <select class="select" id="tpl"><option value="">${t('templatePick')}</option>${M.TEMPLATES.map((x) => html`<option value="${x.id}">${t('tpl.' + x.id)}</option>`)}</select>
          <button type="button" class="btn sm" id="center">${t('center')}</button>
        </div>
        <div id="problems" class="small" aria-live="polite"></div>
        <div class="row"><span class="grow" id="status"></span><button type="button" class="btn primary" id="save">${t('save')}</button></div>
      </div>
      <div class="card card-pad stack">
        <div class="label">${t('preview')}</div>
        <div class="motd-box"><div class="motd-icon" id="icon-pv"></div><div class="grow"><div class="motd-name">${s.name}</div><div id="pv"></div></div><div class="motd-players" id="players"></div></div>
        <div class="label">${t('icon')}</div>
        <p class="tiny muted">${t('iconHint')}</p>
        <div id="icon-tools"></div>
      </div>
    </div>`);
  const ta = $('motd');
  const update = () => {
    s.draft = ta.value; // Entwurf überlebt Sprachwechsel und neue Serverliste
    Hostwerk.render('#pv', preview(ta.value));
    const p = M.check(ta.value);
    Hostwerk.render('#problems', p.length ? html`${p.map((x) => html`<div class="c-warn">${t('problem.' + x.code, { line: x.line, n: x.length })}</div>`)}` : html`<span class="muted">${t('ok')}</span>`);
  };
  ta.addEventListener('input', update);
  for (const b of document.querySelectorAll('[data-code]')) b.addEventListener('click', () => { const r = M.insert(ta.value, ta.selectionStart, ta.selectionEnd, b.dataset.code); ta.value = r.text; ta.focus(); ta.setSelectionRange(r.cursor, r.cursor); update(); });
  $('tpl').addEventListener('change', (e) => { if (!e.target.value) return; ta.value = M.template(e.target.value, s.name, Hostwerk.lang); e.target.value = ''; update(); ta.focus(); });
  $('center').addEventListener('click', () => { ta.value = M.center(ta.value); update(); });
  $('save').addEventListener('click', async () => {
    try {
      await Hostwerk.put(`/mc/servers/${encodeURIComponent(s.id)}/properties`, { motd: M.toProperty(ta.value) });
      s.motd = M.toProperty(ta.value);
      if (s.state === 'running') s.dirty = true;
      Hostwerk.toast(t('saved'), { kind: 'success' });
      renderStatus();
    } catch (e) { if (!/Abgelehnt|Declined/i.test(e.message)) Hostwerk.toast(e.message, { kind: 'error' }); }
  });
  update(); renderStatus(); iconPreview(); renderIconTools();
}
function renderPicker() {
  const pick = $('server');
  if (!pick) return;
  Hostwerk.render(pick, html`${servers.map((s) => html`<option value="${s.id}" ${s.id === current ? Hostwerk.raw('selected') : ''}>${s.name}</option>`)}`);
  pick.setAttribute('aria-label', t('server'));
  pick.onchange = () => { current = pick.value; icon = null; renderEditor(); };
}
async function load() {
  const list = await Hostwerk.get('/mc/servers');
  const before = new Map(servers.map((s) => [s.id, s]));
  servers = (Array.isArray(list) ? list : []).map((s) => ({ id: s.id, name: s.name, motd: s.motd || '', state: (s.proc && s.proc.state) || 'stopped', players: s.proc && s.proc.extra && s.proc.extra.players ? s.proc.extra.players.length : null, maxPlayers: s.maxPlayers, draft: before.get(s.id) ? before.get(s.id).draft : undefined, dirty: !!(before.get(s.id) && before.get(s.id).dirty && ((s.proc && s.proc.state) || 'stopped') === 'running') }));
  const ctx = Hostwerk.context;
  if (ctx && ctx.kind === 'minecraft') current = ctx.id;
  if (!current || !servers.some((s) => s.id === current)) current = servers[0] && servers[0].id;
  renderPicker();
  // Liste live halten, aber den Editor nur neu zeichnen, wenn ein anderer Server dran ist – sonst wäre Getipptes weg
  if (shownFor !== current || !$('motd')) renderEditor(); else renderStatus();
}
const reload = () => Live.guard(Hostwerk, '#editor', load);
function showTab(tab) { for (const el of document.querySelectorAll('[data-tab]')) el.hidden = el.dataset.tab !== (tab || 'editor'); }
Hostwerk.ready().then((info) => {
  showTab(info.tab);
  Hostwerk.on('tab', showTab);
  // Aus dem Rechtsklick-Menü eines Minecraft-Servers oder der Schnellsuche: diesen Server bearbeiten
  let lastAction = '';
  const act = (a) => { if (!a || a.id !== 'edit' || !a.target || `${a.target}@${a.at}` === lastAction) return; lastAction = `${a.target}@${a.at}`; current = a.target; icon = null; renderPicker(); renderEditor(); };
  Hostwerk.on('action', act);
  reload().then(() => act(info.action));
  // Server gestartet/gestoppt, neue Server: Liste und Neustart-Hinweis aktualisieren (Getipptes bleibt)
  Hostwerk.on('service', Live.throttle((s) => { if (!s || s.kind === 'minecraft') reload(); }, 2000));
  Hostwerk.on('minecraft', Live.throttle(() => reload(), 5000));
  Hostwerk.on('lang', () => { shownFor = null; reload(); });
  Live.every(60000, reload);
});
