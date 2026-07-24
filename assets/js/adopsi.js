/* adopsi.js — Adopsi Kelas Pintar, tab per jenjang */

let _jenjang = [];
let _tab = 'SD';

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  document.getElementById('user-name').textContent = Auth.getUserName();
  if (Auth.applyNavRole) Auth.applyNavRole();
  initProvinsiSelect();
  document.getElementById('adopsi-tabs').addEventListener('click', onTabClick);
  loadData();
});

function initProvinsiSelect() {
  const provinsi = sbAPI.getProvinsi();
  const sel = document.getElementById('provinsi-select');
  if (!sel) return;
  sel.innerHTML = provinsi.map(p =>
    `<option value="${p.code}" ${p.available ? '' : 'disabled'}>${p.name}${p.available ? '' : ' (segera)'}</option>`
  ).join('');
  sel.addEventListener('change', () => loadData());
}

function loadData() {
  const provSel = document.getElementById('provinsi-select');
  const provName = provSel ? provSel.options[provSel.selectedIndex].text : 'Bali';
  const provCode = provSel ? provSel.value : 'bali';
  document.querySelector('h1').textContent = `Adopsi Kelas Pintar — ${provName}`;

  if (sbAPI.applyModeUI) sbAPI.applyModeUI();
  else if (sbAPI.isDemo()) {
    document.getElementById('warn-banner').style.display = 'flex';
    document.getElementById('demo-card').classList.add('show');
  }

  const a = sbAPI.getAdopsiKP(provCode);
  _jenjang = a.jenjang || [];
  if (!_jenjang.find(j => j.jenjang === _tab)) _tab = (_jenjang[0] && _jenjang[0].jenjang) || 'SD';
  renderTabs();
  showTab(_tab);
}

function renderTabs() {
  document.getElementById('adopsi-tabs').innerHTML = _jenjang.map(j =>
    `<button type="button" class="tab${j.jenjang === _tab ? ' active' : ''}" data-jj="${j.jenjang}">${j.jenjang}</button>`
  ).join('');
}

function onTabClick(e) {
  const btn = e.target.closest('.tab');
  if (!btn) return;
  showTab(btn.dataset.jj);
}

function showTab(jj) {
  _tab = jj;
  document.querySelectorAll('#adopsi-tabs .tab').forEach(b => {
    b.classList.toggle('active', b.dataset.jj === jj);
  });
  const j = _jenjang.find(x => x.jenjang === jj);
  if (!j) return;
  renderKpi(j);
  renderTable(j);
}

// Order: Pakai KP → Belum Pakai → Total → % Adopsi
function renderKpi(j) {
  document.getElementById('adopsi-kpi').innerHTML = `
    <div class="adopsi-kpi"><div class="adopsi-kpi-label">Pakai KP</div><div class="adopsi-kpi-value orange">${j.kp.toLocaleString('id-ID')}</div></div>
    <div class="adopsi-kpi"><div class="adopsi-kpi-label">Belum Pakai</div><div class="adopsi-kpi-value red">${j.gap.toLocaleString('id-ID')}</div></div>
    <div class="adopsi-kpi"><div class="adopsi-kpi-label">Total</div><div class="adopsi-kpi-value">${j.total.toLocaleString('id-ID')}</div></div>
    <div class="adopsi-kpi"><div class="adopsi-kpi-label">% Adopsi</div><div class="adopsi-kpi-value green">${j.pct}%</div></div>
  `;
}

function renderTable(j) {
  const el = document.getElementById('adopsi-jenjang');
  el.innerHTML = `
    <div class="adopsi-bar-track" style="margin-bottom:14px"><div class="adopsi-bar-fill" style="width:${Math.min(100, j.pct)}%"></div></div>
    <div class="adopsi-table-wrap">
      <table class="adopsi-table">
        <thead>
          <tr>
            <th>Kabupaten/Kota</th>
            <th class="num">Pakai KP</th>
            <th class="num">Belum</th>
            <th class="num">Total</th>
            <th class="num">%</th>
          </tr>
        </thead>
        <tbody>
          ${j.kab.map(k => `
            <tr>
              <td>${k.kab}</td>
              <td class="num">${k.kp.toLocaleString('id-ID')}</td>
              <td class="num">${k.gap.toLocaleString('id-ID')}</td>
              <td class="num">${k.total.toLocaleString('id-ID')}</td>
              <td class="num">${k.pct}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
