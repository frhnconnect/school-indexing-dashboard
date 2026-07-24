/* school-list.js — Daftar Sekolah: filter by jenjang/kab/kec, summary card, school table */

const SL = {
  idxA: '#C2410C', idxB: '#C026D3', idxC: '#2563EB', idxD: '#06B6D4', idxE: '#F59E0B',
  textMuted: '#9CA3AF', textSecondary: '#6B7280',
};

let currentJenjang = 'SD';
let allSchools = [];

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  document.getElementById('user-name').textContent = Auth.getUserName();
  if (Auth.applyNavRole) Auth.applyNavRole();
  initProvinsiSelect();
  initMonthSelect();
  initKabSelect();
  loadData();
});

async function initProvinsiSelect() {
  const provinsi = sbAPI.getProvinsi();
  const sel = document.getElementById('provinsi-select');
  if (!sel) return;
  sel.innerHTML = provinsi.map(p => `<option value="${p.code}" ${p.available ? '' : 'disabled'}>${p.name}</option>`).join('');
  sel.addEventListener('change', () => { initKabSelect(); loadData(); });
}

async function initMonthSelect() {
  var taList = sbAPI.getTahunAjaranList();
  var taSel = document.getElementById('ta-select');
  if (taSel) {
    taSel.innerHTML = taList.map(ta => `<option value="${ta.code}">${ta.label}</option>`).join('');
    taSel.value = taList[taList.length - 1].code;
    taSel.addEventListener('change', () => { initMonthSelect(); loadData(); });
  }
  var taCode = taSel ? taSel.value : taList[taList.length - 1].code;
  var months = sbAPI.getMonthsForTahunAjaran(taCode);
  var sel = document.getElementById('month-select');
  if (sel) {
    sel.innerHTML = months.map(m => `<option value="${m}">${sbAPI.formatMonth(m)}</option>`).join('');
    sel.value = months[months.length - 1];
  }
}

function switchJenjang(jj) {
  currentJenjang = jj;
  document.querySelectorAll('.jenjang-tab').forEach(t => t.classList.toggle('active', t.dataset.jenjang === jj));
  initKabSelect();
  loadData();
}

function initKabSelect() {
  const provSel = document.getElementById('provinsi-select');
  const provCode = provSel ? provSel.value : 'bali';
  const kabs = sbAPI.getKabByProvinsi(provCode);
  const sel = document.getElementById('kab-select');
  if (!sel) return;
  sel.innerHTML = '<option value="">Semua Kab/Kota</option>' + kabs.map(k => `<option value="${k}">${k}</option>`).join('');
  updateKec();
}

function updateKec() {
  const kab = document.getElementById('kab-select').value;
  const sel = document.getElementById('kec-select');
  if (!sel) return;
  const kecs = kab ? sbAPI.getKecamatan(kab) : [];
  sel.innerHTML = '<option value="">Semua Kecamatan</option>' + kecs.map(k => `<option value="${k}">${k}</option>`).join('');
}

async function loadData() {
  const month = document.getElementById('month-select').value || '2026-06';
  const provSel = document.getElementById('provinsi-select');
  const provName = provSel ? provSel.options[provSel.selectedIndex].text : 'Bali';
  const provCode = provSel ? provSel.value : 'bali';

  document.querySelector('h1').textContent = `Daftar Sekolah — ${provName}`;

  if (sbAPI.applyModeUI) sbAPI.applyModeUI();
  else if (sbAPI.isDemo()) {
    document.getElementById('warn-banner').style.display = 'flex';
    document.getElementById('demo-card').classList.add('show');
  }

  allSchools = await sbAPI.getSchools(month, provCode);
  render();
}

function getFiltered() {
  const kab = document.getElementById('kab-select').value;
  const kec = document.getElementById('kec-select').value;
  return allSchools.filter(s => {
    if (s.jenjang !== currentJenjang) return false;
    if (kab && s.kabupaten_kota !== kab) return false;
    if (kec && s.kecamatan !== kec) return false;
    return true;
  });
}

function render() {
  const schools = getFiltered();

  // Summary
  const n = schools.length || 1;
  const avg = key => schools.length ? schools.reduce((s, x) => s + (x[key] || 0), 0) / n : 0;
  const score = avg('final_score');
  document.getElementById('summary-score').innerHTML = score > 0 ? score.toFixed(1) : '—';
  document.getElementById('summary-subs').innerHTML = schools.length ? `
    <span style="color:${SL.idxA}">A ${avg('index_a').toFixed(0)}</span>
    <span style="color:${SL.idxB}">B ${avg('index_b').toFixed(0)}</span>
    <span style="color:${SL.idxC}">C ${avg('index_c').toFixed(0)}</span>
    <span style="color:${SL.idxD}">D ${avg('index_d').toFixed(0)}</span>
    <span style="color:${SL.idxE}">E ${avg('index_e').toFixed(0)}</span>
  ` : '';

  // Table
  document.getElementById('school-count').textContent = schools.length;
  const badge = active => active
    ? '<span class="badge badge-baik">Aktif</span>'
    : '<span class="badge badge-kurang">Tidak Aktif</span>';

  document.getElementById('school-table-body').innerHTML = schools.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td style="text-align:left"><strong>${s.school_name}</strong></td>
      <td>${s.kecamatan || '—'}</td>
      <td><strong>${(s.final_score || 0).toFixed(1)}</strong></td>
      <td>${(s.index_a || 0).toFixed(1)}</td>
      <td>${(s.index_b || 0).toFixed(1)}</td>
      <td>${(s.index_c || 0).toFixed(1)}</td>
      <td>${(s.index_d || 0).toFixed(1)}</td>
      <td>${(s.index_e || 0).toFixed(1)}</td>
      <td>${badge(s.is_active)}</td>
    </tr>
  `).join('') || '<tr><td colspan="10" style="text-align:center;color:var(--text-muted);padding:24px">Tidak ada sekolah pada filter ini.</td></tr>';
}
