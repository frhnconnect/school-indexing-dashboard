/* overview.js — Page 1: Overview (rombak v3)
   Annual POV: TA 2025/2026 (Jul 2025 – Jun 2026), aggregate all 12 months.
   3 jenjang sections: SD, SMP, SMA
*/

const C = {
  green: '#22C55E', orange: '#F97316', red: '#EF444',
  idxA: '#C2410C', idxB: '#C026D3', idxC: '#2563EB', idxD: '#06B6D4', idxE: '#F59E0B',
  textMuted: '#9CA3AF', textSecondary: '#6B7280', textPrimary: '#1F2937',
  gridColor: '#F3F4F6',
};

// Topi Tut Wuri Handayani icon (simplified)
const TOPI_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M2 18h20"/>
  <path d="M4 18c0-4 3-7 8-7s8 3 8 7"/>
  <circle cx="12" cy="5" r="2"/>
  <line x1="12" y1="7" x2="12" y2="11"/>
  <path d="M8 11c0-2 2-3 4-3s4 1 4 3"/>
</svg>`;

let charts = {};

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  document.getElementById('user-name').textContent = Auth.getUserName();
  if (Auth.applyNavRole) Auth.applyNavRole();
  initProvinsiSelect();
  loadData();
});

async function initProvinsiSelect() {
  const provinsi = sbAPI.getProvinsi();
  const sel = document.getElementById('provinsi-select');
  if (!sel) return;
  sel.innerHTML = provinsi.map(p =>
    `<option value="${p.code}" ${p.available ? '' : 'disabled'}>${p.name}${p.available ? '' : ' (segera)'}</option>`
  ).join('');
  sel.addEventListener('change', () => loadData());
}

async function loadData() {
  const provSel = document.getElementById('provinsi-select');
  const provName = provSel ? provSel.options[provSel.selectedIndex].text : 'Bali';
  const provCode = provSel ? provSel.value : 'bali';

  document.querySelector('h1').textContent = `Overview — ${provName}`;

  if (sbAPI.applyModeUI) sbAPI.applyModeUI();
  else if (sbAPI.isDemo()) {
    document.getElementById('warn-banner').style.display = 'flex';
    document.getElementById('demo-card').classList.add('show');
  }

  // Annual: aggregate all 12 months of TA 2025/2026
  const schools = await sbAPI.getSchoolsAnnual('2025/2026', provCode);

  const jenjangList = ['SD', 'SMP', 'SMA'];
  jenjangList.forEach(jj => {
    renderJenjangSection(jj, schools.filter(s => s.jenjang === jj));
  });

  renderKriteria();
}

function pct(n, total) { return total ? `${Math.round(n / total * 100)}%` : '0%'; }
function fmt(v) { return v != null ? v.toFixed(1) : '—'; }

function renderJenjangSection(jenjang, schools) {
  const cls = jenjang.toLowerCase();
  const active = schools.filter(s => s.is_active);
  const inactive = schools.filter(s => !s.is_active);

  const activeIdx = active.length ? calcIdx(active) : null;
  const inactiveIdx = inactive.length ? calcIdx(inactive) : null;

  document.getElementById(`section-${cls}`).innerHTML = `
    <div class="jenjang-section-header">
      <div class="jenjang-icon">${TOPI_SVG}</div>
      <div class="jenjang-section-title">${jenjang}</div>
      <div class="jenjang-section-count">${schools.length} sekolah · ${active.length} aktif · ${inactive.length} tidak aktif</div>
    </div>
    <div class="jenjang-kpi-row">
      <div class="jenjang-kpi">
        <div class="jenjang-kpi-label">Aktif</div>
        <div class="jenjang-kpi-value green">${active.length}</div>
        <div class="jenjang-kpi-pct">${pct(active.length, schools.length)}</div>
      </div>
      <div class="jenjang-kpi">
        <div class="jenjang-kpi-label">Tidak Aktif</div>
        <div class="jenjang-kpi-value red">${inactive.length}</div>
        <div class="jenjang-kpi-pct">${pct(inactive.length, schools.length)}</div>
      </div>
      <div class="jenjang-kpi">
        <div class="jenjang-kpi-label">Total</div>
        <div class="jenjang-kpi-value">${schools.length}</div>
      </div>
    </div>
    <div class="jenjang-index-detail">
      ${renderIndexGroup('Aktif', active.length, activeIdx, 'green')}
      ${renderIndexGroup('Tidak Aktif', inactive.length, inactiveIdx, 'red')}
    </div>
  `;
}

function calcIdx(schools) {
  const n = schools.length;
  return {
    a: schools.reduce((s, x) => s + (x.index_a || 0), 0) / n,
    b: schools.reduce((s, x) => s + (x.index_b || 0), 0) / n,
    c: schools.reduce((s, x) => s + (x.index_c || 0), 0) / n,
    d: schools.reduce((s, x) => s + (x.index_d || 0), 0) / n,
    e: schools.reduce((s, x) => s + (x.index_e || 0), 0) / n,
    score: schools.reduce((s, x) => s + (x.final_score || 0), 0) / n,
  };
}

function renderIndexGroup(label, count, idx, colorClass) {
  if (!idx || count === 0) {
    return `<div class="jenjang-index-group">
      <div class="jenjang-index-group-header"><span class="status-dot ${colorClass}"></span>${label}</div>
      <p class="empty-state">Tidak ada sekolah ${label.toLowerCase()} pada periode ini.</p>
    </div>`;
  }
  return `<div class="jenjang-index-group">
    <div class="jenjang-index-group-header"><span class="status-dot ${colorClass}"></span>${label} (${count} sekolah)</div>
    <div class="jenjang-index-score ${colorClass}">${fmt(idx.score)}</div>
    <div class="index-bars">
      ${renderIndexBar('A', idx.a, C.idxA)}
      ${renderIndexBar('B', idx.b, C.idxB)}
      ${renderIndexBar('C', idx.c, C.idxC)}
      ${renderIndexBar('D', idx.d, C.idxD)}
      ${renderIndexBar('E', idx.e, C.idxE)}
    </div>
  </div>`;
}

function renderIndexBar(label, value, color) {
  const v = value || 0;
  const w = Math.min(100, Math.max(0, v));
  return `<div class="idx-bar">
    <div class="idx-bar-label">${label}</div>
    <div class="idx-bar-track"><div class="idx-bar-fill" style="width:${w}%;background:${color}"></div></div>
    <div class="idx-bar-value">${v.toFixed(1)}</div>
  </div>`;
}

function renderKriteria() {
  document.getElementById('kriteria-section').innerHTML = `
    <div class="card-title">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
      Kriteria Sekolah Aktif
    </div>
    <div class="kriteria-content">
      <div class="kriteria-item">
        <div class="kriteria-header"><span class="status-dot green"></span><strong>Sekolah Aktif</strong></div>
        <p>Sekolah dikategorikan <strong>aktif</strong> apabila memenuhi keempat kriteria berikut:</p>
        <ul class="kriteria-list">
          <li><strong>Index A — Hasil Belajar:</strong> Melaksanakan minimal 4 dari 4 tipe ujian: Tengah Semester Ganjil, Akhir Semester Ganjil, Tengah Semester Genap, dan Akhir Tahun.</li>
          <li><strong>Index B — Pemerataan Pendidikan:</strong> Minimal 20% siswa dari total siswa terdaftar ikut serta dalam assessment.</li>
          <li><strong>Index C & D:</strong> Minimal 20% partisipasi (Index C — Kualitas Guru, Index D — Proses Pembelajaran).</li>
          <li><strong>Index E:</strong> Minimal 20% akun Kelas Pintar aktif dari total siswa terdaftar di sekolah (Index E — Digitalisasi).</li>
        </ul>
      </div>
      <div class="kriteria-item">
        <div class="kriteria-header"><span class="status-dot red"></span><strong>Sekolah Tidak Aktif</strong></div>
        <p>Sekolah dikategorikan <strong>tidak aktif</strong> apabila tidak memenuhi salah satu dari keempat kriteria di atas.</p>
        <p style="margin-top:8px;font-size:12px;color:var(--text-muted)">Catatan: Index B (Pemerataan Pendidikan) juga menjadi penentu status aktif/tidak aktif melalui persentase partisipasi siswa dalam assessment.</p>
      </div>
      <div class="kriteria-index-list">
        <div class="kriteria-index"><span class="ki-label" style="color:var(--idx-a)">A</span> Hasil Belajar</div>
        <div class="kriteria-index"><span class="ki-label" style="color:var(--idx-b)">B</span> Pemerataan Pendidikan</div>
        <div class="kriteria-index"><span class="ki-label" style="color:var(--idx-c)">C</span> Kualitas Guru</div>
        <div class="kriteria-index"><span class="ki-label" style="color:var(--idx-d)">D</span> Proses Pembelajaran</div>
        <div class="kriteria-index"><span class="ki-label" style="color:var(--idx-e)">E</span> Digitalisasi</div>
      </div>
    </div>
  `;
}
