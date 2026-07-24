/* school-detail.js — Page 2: Detail Sekolah (v2)
   Jenjang tabs (pagination), TA 2025/2026 annual POV.
   Each section: bar chart (annual snapshot) + line chart (month-to-month).
*/

const D = {
  idxA: '#C2410C', idxB: '#C026D3', idxC: '#2563EB', idxD: '#06B6D4', idxE: '#F59E0B',
  total: '#F97316',
  textMuted: '#9CA3AF', textSecondary: '#6B7280', gridColor: '#F3F4F6',
};

const JENJANG_COLORS = { SD: '#DC2626', SMP: '#2563EB', SMA: '#6B7280' };
const KAB_PALETTE = ['#F97316','#2563EB','#22C55E','#C026D3','#06B6D4','#F59E0B','#EF444','#8B5CF6'];
const INDEX_KEYS = { A: 'indexA', B: 'indexB', C: 'indexC', D: 'indexD', E: 'indexE' };
const INDEX_COLORS = { A: D.idxA, B: D.idxB, C: D.idxC, D: D.idxD, E: D.idxE };
const INDEX_LABELS = {
  A: 'Index A — Hasil Belajar',
  B: 'Index B — Pemerataan Pendidikan',
  C: 'Index C — Kualitas Guru',
  D: 'Index D — Proses Pembelajaran',
  E: 'Index E — Digitalisasi',
};
let charts = {};
let currentJenjang = 'SD';

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  document.getElementById('user-name').textContent = Auth.getUserName();
  if (Auth.applyNavRole) Auth.applyNavRole();
  initProvinsiSelect();
  initMonthSelect();
  loadData();
});

async function initProvinsiSelect() {
  const provinsi = sbAPI.getProvinsi();
  const sel = document.getElementById('provinsi-select');
  if (!sel) return;
  sel.innerHTML = provinsi.map(p => `<option value="${p.code}" ${p.available ? '' : 'disabled'}>${p.name}</option>`).join('');
  sel.addEventListener('change', () => loadData());
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
  loadData();
}

async function loadData() {
  const month = document.getElementById('month-select').value || '2026-06';
  const provSel = document.getElementById('provinsi-select');
  const provCode = provSel ? provSel.value : 'bali';
  const jenjang = currentJenjang;

  document.querySelector('h1').textContent = `Tren & Index — ${jenjang}`;

  if (sbAPI.applyModeUI) sbAPI.applyModeUI();
  else if (sbAPI.isDemo()) {
    document.getElementById('warn-banner').style.display = 'flex';
    document.getElementById('demo-card').classList.add('show');
  }

  const detail = await sbAPI.getJenjangDetail(month, jenjang, provCode);
  const trend = await sbAPI.getJenjangTrend(month, jenjang, provCode);

  renderKPIs(detail, jenjang);
  renderTotalPair(detail, trend);
  renderIndexPair(detail, trend);
  renderKabTotalPair(detail, trend);
  renderKabDetailPair(trend);
}

function renderKPIs(detail, jenjang) {
  var color = JENJANG_COLORS[jenjang] || '#F97316';
  document.getElementById('kpi-row-1').innerHTML = `
    <div class="kpi-card" style="border-left:3px solid ${color}">
      <div class="kpi-label">Total Sekolah</div>
      <div class="kpi-value">${detail.totalSchools}</div>
      <div class="kpi-sub">${jenjang}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Total Siswa</div>
      <div class="kpi-value">${detail.totalStudents.toLocaleString('id-ID')}</div>
      <div class="kpi-sub">Terdaftar</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Total Guru</div>
      <div class="kpi-value">${detail.totalTeachers.toLocaleString('id-ID')}</div>
      <div class="kpi-sub">${jenjang}</div>
    </div>
  `;
}

function chartOpts() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end', labels: { boxWidth: 8, boxHeight: 8, font: { size: 11 }, color: D.textSecondary, usePointStyle: true } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: D.textMuted, font: { size: 11 } } },
      y: { beginAtZero: true, max: 100, grid: { color: D.gridColor }, ticks: { color: D.textMuted, font: { size: 11 } } },
    },
  };
}

function chartOptsWide() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end', labels: { boxWidth: 8, boxHeight: 8, font: { size: 11 }, color: D.textSecondary, usePointStyle: true } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: D.textMuted, font: { size: 10 } } },
      y: { beginAtZero: true, max: 100, grid: { color: D.gridColor }, ticks: { color: D.textMuted, font: { size: 11 } } },
    },
  };
}

// ─── Section 1: Index Total (bar + line) ───

function renderTotalPair(detail, trend) {
  if (charts.barTotal) charts.barTotal.destroy();
  charts.barTotal = new Chart(document.getElementById('chart-bar-total'), {
    type: 'bar',
    data: {
      labels: ['Index Total'],
      datasets: [{
        label: currentJenjang,
        data: [Math.round(detail.indexTotal * 10) / 10],
        backgroundColor: D.total,
        borderRadius: 4,
        barPercentage: 0.4,
      }],
    },
    options: chartOpts(),
  });

  if (charts.trendTotal) charts.trendTotal.destroy();
  var labels = trend.months.map(m => sbAPI.formatMonth(m));
  charts.trendTotal = new Chart(document.getElementById('chart-trend-total'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Index Total',
        data: trend.indexTotal,
        borderColor: D.total,
        backgroundColor: D.total + '15',
        pointBackgroundColor: D.total,
        pointRadius: 4,
        tension: 0.3,
        borderWidth: 2,
        fill: true,
      }],
    },
    options: chartOpts(),
  });
}

// ─── Section 2: Index A-E Detail (grouped bar + multi-line) ───

function renderIndexPair(detail, trend) {
  var indices = ['A','B','C','D','E'];

  if (charts.barIndex) charts.barIndex.destroy();
  charts.barIndex = new Chart(document.getElementById('chart-bar-index'), {
    type: 'bar',
    data: {
      labels: indices.map(function(i) { return 'Index ' + i; }),
      datasets: [{
        label: 'Skor',
        data: indices.map(function(i) { return Math.round(detail[INDEX_KEYS[i]] * 10) / 10; }),
        backgroundColor: indices.map(function(i) { return INDEX_COLORS[i]; }),
        borderRadius: 4,
      }],
    },
    options: chartOpts(),
  });

  if (charts.trendIndex) charts.trendIndex.destroy();
  var labels = trend.months.map(m => sbAPI.formatMonth(m));
  charts.trendIndex = new Chart(document.getElementById('chart-trend-index'), {
    type: 'line',
    data: {
      labels,
      datasets: indices.map(function(i) {
        var c = INDEX_COLORS[i];
        return {
          label: 'Index ' + i,
          data: trend[INDEX_KEYS[i]],
          borderColor: c,
          backgroundColor: c + '10',
          pointBackgroundColor: c,
          pointRadius: 3,
          tension: 0.3,
          borderWidth: 2,
        };
      }),
    },
    options: chartOpts(),
  });
}

// ─── Section 3: Index Total per Kabupaten (bar + line) ───

function renderKabTotalPair(detail, trend) {
  var kabs = detail.kabupaten;

  if (charts.barKabTotal) charts.barKabTotal.destroy();
  charts.barKabTotal = new Chart(document.getElementById('chart-bar-kab-total'), {
    type: 'bar',
    data: {
      labels: kabs.map(function(k) { return k.kab; }),
      datasets: [{
        label: 'Index Total',
        data: kabs.map(function(k) { return Math.round(k.indexTotal * 10) / 10; }),
        backgroundColor: kabs.map(function(_, i) { return KAB_PALETTE[i % KAB_PALETTE.length]; }),
        borderRadius: 4,
      }],
    },
    options: chartOpts(),
  });

  if (charts.kabTotal) charts.kabTotal.destroy();
  var labels = trend.months.map(m => sbAPI.formatMonth(m));
  charts.kabTotal = new Chart(document.getElementById('chart-trend-kab-total'), {
    type: 'line',
    data: {
      labels,
      datasets: trend.kabupaten.map(function(k, i) {
        var c = KAB_PALETTE[i % KAB_PALETTE.length];
        return {
          label: k.kab,
          data: k.indexTotal,
          borderColor: c,
          backgroundColor: c + '10',
          pointBackgroundColor: c,
          pointRadius: 3,
          tension: 0.3,
          borderWidth: 2,
        };
      }),
    },
    options: chartOpts(),
  });
}

// ─── Section 4: Index Detail per Kabupaten (grouped bar + line with selector) ───

let _trendData = null; // cache for trend line re-render on index change

function renderKabDetailPair(trend) {
  _trendData = trend;
  var indices = ['A','B','C','D','E'];
  var kabs = trend.kabupaten;

  // Grouped bar: x = kabupaten, 5 bars (A-E) per kab
  if (charts.kabBarAll) charts.kabBarAll.destroy();
  charts.kabBarAll = new Chart(document.getElementById('chart-kab-bar-all'), {
    type: 'bar',
    data: {
      labels: kabs.map(function(k) { return k.kab; }),
      datasets: indices.map(function(idx) {
        return {
          label: 'Index ' + idx,
          data: kabs.map(function(k) { return k[INDEX_KEYS[idx]][k[INDEX_KEYS[idx]].length - 1]; }),
          backgroundColor: INDEX_COLORS[idx],
          borderRadius: 3,
        };
      }),
    },
    options: chartOptsWide(),
  });

  // Populate index selector
  var sel = document.getElementById('kab-trend-index-select');
  sel.innerHTML = '<option value="indexTotal">Index Total</option>' +
    indices.map(function(i) { return '<option value="' + INDEX_KEYS[i] + '">Index ' + i + '</option>'; }).join('');

  renderKabTrendLine();
}

function renderKabTrendLine() {
  if (!_trendData) return;
  var trend = _trendData;
  var sel = document.getElementById('kab-trend-index-select');
  var key = sel ? sel.value : 'indexTotal';
  var labels = trend.months.map(m => sbAPI.formatMonth(m));

  if (charts.kabTrendAll) charts.kabTrendAll.destroy();
  charts.kabTrendAll = new Chart(document.getElementById('chart-kab-trend-all'), {
    type: 'line',
    data: {
      labels,
      datasets: trend.kabupaten.map(function(k, i) {
        var c = KAB_PALETTE[i % KAB_PALETTE.length];
        return {
          label: k.kab,
          data: k[key],
          borderColor: c,
          backgroundColor: c + '10',
          pointBackgroundColor: c,
          pointRadius: 3,
          tension: 0.3,
          borderWidth: 2,
        };
      }),
    },
    options: chartOptsWide(),
  });
}
