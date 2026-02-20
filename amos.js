/**
 * amos.js — Sovereign Nexus Commander Amos Dashboard Logic
 * Run: 019c6bc2 | Dashboard JavaScript Logic
 */

'use strict';

// ── State ────────────────────────────────────────────────────────────────────
const STATE = {
  currentPage: 'overview',
  lastRefresh: Date.now(),
  tickInterval: null,
  alerts: [],
};

// ── Data ─────────────────────────────────────────────────────────────────────
const DATA = {
  missions: [
    { id: 'm001', name: 'Operation Iron Veil', sub: 'Sector 7 — Recon', priority: 'critical', status: 'ms-critical', statusLabel: 'Critical' },
    { id: 'm002', name: 'Secure Northern Pass', sub: 'Border Force Alpha', priority: 'high', status: 'ms-active', statusLabel: 'Active' },
    { id: 'm003', name: 'Trade Route Escort', sub: 'Eastern Corridor', priority: 'medium', status: 'ms-active', statusLabel: 'Active' },
    { id: 'm004', name: 'Alliance Summit Prep', sub: 'Diplomatic Wing', priority: 'medium', status: 'ms-planning', statusLabel: 'Planning' },
    { id: 'm005', name: 'Resource Extraction', sub: 'Southern Mines', priority: 'low', status: 'ms-pending', statusLabel: 'Pending' },
    { id: 'm006', name: 'Counterintelligence Op', sub: 'Shadow Division', priority: 'high', status: 'ms-active', statusLabel: 'Active' },
  ],

  resources: [
    { name: 'Gold (AU)', value: '12,840 / 20,000', pct: 64, color: '#c9a84c' },
    { name: 'Iron Ore', value: '8,420 / 15,000', pct: 56, color: '#8892a4' },
    { name: 'Grain Stores', value: '5,100 / 10,000', pct: 51, color: '#22c55e' },
    { name: 'Manpower', value: '3,412 / 5,000', pct: 68, color: '#3a7bd5' },
    { name: 'Arcane Crystals', value: '340 / 1,000', pct: 34, color: '#a855f7' },
  ],

  production: [
    { day: 'Mon', val: 72 },
    { day: 'Tue', val: 85 },
    { day: 'Wed', val: 60 },
    { day: 'Thu', val: 91 },
    { day: 'Fri', val: 78 },
    { day: 'Sat', val: 55 },
    { day: 'Sun', val: 88 },
  ],

  roster: [
    { initials: 'AM', name: 'Commander Amos', role: 'Supreme Commander', color: '#c9a84c', online: true },
    { initials: 'LR', name: 'Lady Reva', role: 'Spymaster', color: '#a855f7', online: true },
    { initials: 'BK', name: 'Baron Keld', role: 'Marshal of Armies', color: '#3a7bd5', online: true },
    { initials: 'SA', name: 'Ser Aldric', role: 'Knight Commander', color: '#22c55e', online: false },
    { initials: 'TC', name: 'Treasurer Cora', role: 'Chancellor of Gold', color: '#f97316', online: true },
    { initials: 'MX', name: 'Magister Xen', role: 'Arcane Advisor', color: '#ef4444', online: false },
  ],

  activity: [
    { icon: '⚔️', bg: 'rgba(239,68,68,0.15)', text: '<strong>Alert:</strong> Hostile force spotted near Sector 7 border. Recon team deployed.', time: '2 min ago' },
    { icon: '💰', bg: 'rgba(201,168,76,0.15)', text: '<strong>Treasury:</strong> 840 AU received from eastern trade convoy.', time: '14 min ago' },
    { icon: '🤝', bg: 'rgba(168,85,247,0.15)', text: '<strong>Diplomacy:</strong> Lady Reva confirmed alliance summit attendance.', time: '1h ago' },
    { icon: '🌐', bg: 'rgba(45,212,191,0.15)', text: '<strong>Zenith Nexus:</strong> Node-4 sync complete. Uplink refreshed.', time: '1h 12m ago' },
    { icon: '📦', bg: 'rgba(34,197,94,0.15)', text: '<strong>Supply:</strong> Grain shipment arrived at Southern Depot.', time: '2h ago' },
    { icon: '🔍', bg: 'rgba(58,123,213,0.15)', text: '<strong>Intel:</strong> Counterintelligence flagged 3 espionage attempts.', time: '3h ago' },
  ],

  intel: [
    { title: 'Faction X Mobilisation', tag: 'tag-threat', tagLabel: 'Threat', body: 'Scouts report Faction X has moved 2,000 troops toward Sector 7. Estimated arrival: 48 hours.' },
    { title: 'Northern Trade Opening', tag: 'tag-econ', tagLabel: 'Economic', body: 'Northern Passage now viable for bulk goods transit. Estimated +400 AU/week revenue boost.' },
    { title: 'Double Agent Identified', tag: 'tag-intel', tagLabel: 'Intel', body: 'Spymaster Reva confirmed a mole within Tier-2 communications. Investigation ongoing.' },
    { title: 'Alliance Talks — Veloran Pact', tag: 'tag-diplo', tagLabel: 'Diplomacy', body: 'Veloran emissaries seek mutual defense treaty. Summit set for 18:00 UTC this cycle.' },
  ],

  comms: [
    { title: 'Baron Keld → Amos', tag: 'tag-intel', tagLabel: 'Secure', body: '"Northern battalions ready. Awaiting your order to advance, Commander."' },
    { title: 'Lady Reva → Amos', tag: 'tag-threat', tagLabel: 'Urgent', body: '"Three shadow agents neutralized. A fourth may still be active in the eastern wing."' },
    { title: 'Treasurer Cora → Amos', tag: 'tag-econ', tagLabel: 'Finance', body: '"Q3 projections ahead by 12%. Recommend expanding the arcane research fund."' },
    { title: 'Zenith Nexus System', tag: 'tag-intel', tagLabel: 'System', body: '"All nodes nominal. Quantum uplink latency: 4ms. Next sync in 8 minutes."' },
  ],

  mapNodes: [
    { x: 48, y: 42, type: 'nexus', label: 'Zenith Nexus', color: 'var(--accent-teal)' },
    { x: 22, y: 28, type: 'allied', label: 'Fort Aldric', color: 'var(--accent-gold)' },
    { x: 68, y: 20, type: 'hostile', label: 'Sector 7', color: 'var(--accent-red)' },
    { x: 75, y: 58, type: 'hostile', label: 'Faction X', color: 'var(--accent-red)' },
    { x: 30, y: 65, type: 'allied', label: 'Southern Mines', color: 'var(--accent-gold)' },
    { x: 55, y: 75, type: 'neutral', label: 'Veloran', color: 'var(--text-muted)' },
    { x: 15, y: 50, type: 'allied', label: 'Western Gate', color: 'var(--accent-gold)' },
  ],
};

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initDate();
  renderAll();
  startAutoRefresh();
  setTimeout(() => showToast('Zenith Nexus uplink confirmed. Welcome, Commander Amos.', 'success'), 800);
  setTimeout(() => showToast('2 critical alerts require attention.', 'error'), 2200);
});

// ── Clock ─────────────────────────────────────────────────────────────────────
function initClock() {
  updateClock();
  setInterval(updateClock, 1000);
}

function updateClock() {
  const el = document.getElementById('nav-clock');
  if (!el) return;
  const now = new Date();
  const h = String(now.getUTCHours()).padStart(2, '0');
  const m = String(now.getUTCMinutes()).padStart(2, '0');
  const s = String(now.getUTCSeconds()).padStart(2, '0');
  el.textContent = `${h}:${m}:${s} UTC`;
}

function initDate() {
  const el = document.getElementById('current-date');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ── Render All ────────────────────────────────────────────────────────────────
function renderAll() {
  renderMissions();
  renderResources();
  renderProductionChart();
  renderRoster();
  renderActivityFeed();
  renderIntel();
  renderComms();
  renderMapNodes();
}

// ── Missions ──────────────────────────────────────────────────────────────────
function renderMissions() {
  const container = document.getElementById('mission-list');
  if (!container) return;
  container.innerHTML = DATA.missions.map(m => `
    <div class="mission-item" onclick="missionClick('${m.id}')">
      <div class="mission-priority p-${m.priority}"></div>
      <div class="mission-info">
        <div class="mission-name">${m.name}</div>
        <div class="mission-sub">${m.sub}</div>
      </div>
      <div class="mission-status ${m.status}">${m.statusLabel}</div>
    </div>
  `).join('');
}

function missionClick(id) {
  const m = DATA.missions.find(x => x.id === id);
  if (m) showToast(`Mission: ${m.name} — ${m.sub}`);
}

// ── Resources ─────────────────────────────────────────────────────────────────
function renderResources() {
  const container = document.getElementById('resource-list');
  if (!container) return;
  container.innerHTML = DATA.resources.map(r => `
    <div class="resource-item">
      <div class="resource-header">
        <span class="resource-name">${r.name}</span>
        <span class="resource-value">${r.value}</span>
      </div>
      <div class="resource-bar">
        <div class="resource-fill" style="width:${r.pct}%; background:${r.color}"></div>
      </div>
    </div>
  `).join('');
}

// ── Production Chart ──────────────────────────────────────────────────────────
function renderProductionChart() {
  const container = document.getElementById('production-chart');
  if (!container) return;
  const max = Math.max(...DATA.production.map(d => d.val));
  container.innerHTML = DATA.production.map(d => {
    const h = Math.round((d.val / max) * 90);
    const intensity = Math.round((d.val / max) * 255);
    return `
      <div class="chart-bar-wrap">
        <div class="chart-bar" style="height:${h}px; background: linear-gradient(180deg, #3a7bd5, #1a3a6b);"></div>
        <div class="chart-bar-label">${d.day}</div>
      </div>
    `;
  }).join('');
}

// ── Roster ────────────────────────────────────────────────────────────────────
function renderRoster() {
  const container = document.getElementById('roster-list');
  if (!container) return;
  container.innerHTML = DATA.roster.map(r => `
    <div class="roster-item">
      <div class="roster-avatar" style="background:${r.color}">${r.initials}</div>
      <div class="roster-info">
        <div class="roster-name">${r.name}</div>
        <div class="roster-role">${r.role}</div>
      </div>
      <div class="roster-online${r.online ? '' : ' roster-offline'}"></div>
    </div>
  `).join('');
}

// ── Activity Feed ─────────────────────────────────────────────────────────────
function renderActivityFeed() {
  const container = document.getElementById('activity-feed');
  if (!container) return;
  container.innerHTML = DATA.activity.map(a => `
    <div class="feed-item">
      <div class="feed-icon" style="background:${a.bg}">${a.icon}</div>
      <div class="feed-content">
        <div class="feed-text">${a.text}</div>
        <div class="feed-time">${a.time}</div>
      </div>
    </div>
  `).join('');
}

// ── Intel ─────────────────────────────────────────────────────────────────────
function renderIntel() {
  const container = document.getElementById('intel-list');
  if (!container) return;
  container.innerHTML = DATA.intel.map(i => `
    <div class="intel-item">
      <div class="intel-header">
        <span class="intel-title">${i.title}</span>
        <span class="intel-tag ${i.tag}">${i.tagLabel}</span>
      </div>
      <div class="intel-body">${i.body}</div>
    </div>
  `).join('');
}

// ── Comms ─────────────────────────────────────────────────────────────────────
function renderComms() {
  const container = document.getElementById('comms-list');
  if (!container) return;
  container.innerHTML = DATA.comms.map(c => `
    <div class="intel-item">
      <div class="intel-header">
        <span class="intel-title">${c.title}</span>
        <span class="intel-tag ${c.tag}">${c.tagLabel}</span>
      </div>
      <div class="intel-body">${c.body}</div>
    </div>
  `).join('');
}

// ── Map Nodes ─────────────────────────────────────────────────────────────────
function renderMapNodes() {
  const container = document.getElementById('territory-map');
  if (!container) return;
  // Remove old nodes
  container.querySelectorAll('.map-node-wrap').forEach(n => n.remove());

  DATA.mapNodes.forEach(node => {
    const wrap = document.createElement('div');
    wrap.className = 'map-node-wrap';
    wrap.style.cssText = `position:absolute; left:${node.x}%; top:${node.y}%; transform:translate(-50%,-50%);`;

    const dot = document.createElement('div');
    dot.className = 'map-node';
    dot.style.cssText = `color:${node.color}; border-color:${node.color};`;
    dot.title = node.label;
    dot.addEventListener('click', () => showToast(`${node.label} — ${node.type} territory`));

    const label = document.createElement('div');
    label.className = 'map-label';
    label.style.cssText = `color:${node.color};`;
    label.textContent = node.label;

    wrap.appendChild(dot);
    wrap.appendChild(label);
    container.appendChild(wrap);
  });
}

// ── Auto Refresh ──────────────────────────────────────────────────────────────
function startAutoRefresh() {
  STATE.tickInterval = setInterval(() => {
    nudgeKPIs();
  }, 12000);
}

function nudgeKPIs() {
  // Slightly animate KPI values to simulate live data
  const powerEl = document.getElementById('kpi-power');
  const treasuryEl = document.getElementById('kpi-treasury');
  if (powerEl) {
    const base = 84200;
    const delta = Math.floor((Math.random() - 0.45) * 200);
    const val = base + delta;
    powerEl.textContent = val.toLocaleString();
  }
  if (treasuryEl) {
    const base = 12840;
    const delta = Math.floor(Math.random() * 40);
    const val = base + delta;
    treasuryEl.textContent = `${val.toLocaleString()} AU`;
  }
}

// ── Actions ───────────────────────────────────────────────────────────────────
function refreshData() {
  renderAll();
  STATE.lastRefresh = Date.now();
  showToast('Dashboard data refreshed.', 'success');
}

function newMission() {
  showToast('Mission creation panel — coming in next build.', 'warn');
}

function broadcastAlert() {
  showToast('Broadcast channel open. All commanders notified.', 'success');
}

function setPage(page) {
  STATE.currentPage = page;
  // Update sidebar active state
  document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
  const clicked = [...document.querySelectorAll('.sidebar-item')].find(
    el => el.getAttribute('onclick') === `setPage('${page}')`
  );
  if (clicked) clicked.classList.add('active');

  const pageNames = {
    overview: 'Command Overview',
    missions: 'Missions',
    intel: 'Intelligence',
    nexus: 'Zenith Nexus',
    alliances: 'Alliances',
    economy: 'Economy',
    military: 'Military',
    comms: 'Communications',
    settings: 'Settings',
  };
  showToast(`Navigated to: ${pageNames[page] || page}`);
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast${type !== 'info' ? ' ' + type : ''}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 420);
  }, 3500);
}

// ── Utility ───────────────────────────────────────────────────────────────────
function formatNumber(n) {
  return n.toLocaleString();
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}
