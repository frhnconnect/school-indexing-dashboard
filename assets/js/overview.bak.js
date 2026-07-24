/* overview.js — Page 1: Overview
   Light theme · Orange accent · Card-based UI
   Chart colors: Baik=green, Sedang=orange, Kurang=red
   Index colors: A=#C2410C, B=#C026D3, C=#2563EB, D=#06B6D4, E=#F59E0B
*/

const C = {
  green: '#22C55E', orange: '#F97316', red: '#EF444',
  idxA: '#C2410C', idxB: '#C026D3', idxC: '#2563EB', idxD: '#06B6D4', idxE: '#F59E0B',
  textMuted: '#9CA3AF', textSecondary: '#6B7280', textPrimary: '#1F2937',
  gridColor: '#F3F4F6',
};

let charts = {};
let currentData = null;

document.addEventListener('DOMContentLoaded', () => {
  initMonthSelect();
  loadData();
});

async function initMonthSelect() {
  const months = await sbAPI.getMonths();
  const sel = document.getElementById('month-select');
  sel.innerHTML = months.map(m => `<option value="${m}">${m}</option>`).join('');
}

async function loadData() {
  const month = document.getElementById('month-select').value || '2026-01';
  const data = await sbAPI.getOverview(month);
  currentData = data;

  if (sbAPI.isDemo) {
    document.getElementById('warn-banner').style.display = 'flex';
    document.getElementById('demo-card').classList.add('show');
  }

  renderKPIs(data);
  renderLevelChart(data);
  renderIndexChart(data);
  renderTopBottom(data);
  renderTrendJenjang();
  renderTrendKab();
  renderKabRanking(month);
}

function renderKPIs(data) {
  const levelColor = v => v > 75 ? 'green' : v >= 40 ? 'orange' : 'red';

  document.getElementById('kpi-row-1').innerHTML = `
    <div class="kpi-card">
      <div class="kpi-label">Total Sekolah</div>
      <div class="kpi-value">${data.totalSchools}</div>
      <div class="kpi-sub">Provinsi Bali</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Avg Final Score</div>
      <div class="kpi-value ${levelColor(data.avgScore)}">${data.avgScore.toFixed(1)}</div>
      <div class="kpi-sub">Semua jenjang</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Baik</div>
      <div class="kpi-value green">${data.levelCount.baik}</div>
      <div class="kpi-sub">${pct(data.levelCount.baik, data.totalSchools)} dari total</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Sedang</div>
      <div class="kpi-value orange">${data.levelCount.sedang}</div>
      <div class="kpi-sub">${pct(data.levelCount.sedang, data.totalSchools)} dari total</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Kurang</div>
      <div class="kpi-value red">${data.levelCount.kurang}</div>
      <div class="kpi-sub">${pct(data.levelCount.kurang, data.totalSchools)} dari total</div>
    </div>
  `;

  document.getElementById('kpi-row-2').innerHTML = data.jenjang.map(j => `
    <div class="kpi-card">
      <div class="kpi-label">Avg Score — ${j.jenjang}</div>
      <div class="kpi-value ${levelColor(j.avgScore)}">${j.avgScore.toFixed(1)}</div>
      <div class="kpi-sub">${j.count} sekolah</div>
    </div>
  `).join('');
}

function pct(n, total) {
  return total ? `${Math.round(n / total * 100)}%` : '0%';
}

function renderLevelChart(data) {
  if (charts.level) charts.level.destroy();
  const labels = data.jenjang.map(j => j.jenjang);
  const baik = data.jenjang.map(j => j.levelCount.baik);
  const sedang = data.jenjang.map(j => j.levelCount.sedang);
  const kurang = data.jenjang.map(j => j.levelCount.kurang);

  charts.level = new Chart(document.getElementById('chart-level'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Baik', data: baik, backgroundColor: C.green, borderRadius: 4 },
        { label: 'Sedang', data: sedang, backgroundColor: C.orange, borderRadius: 4 },
        { label: 'Kurang', data: kurang, backgroundColor: C.red, borderRadius: 4 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', align: 'end', labels: { boxWidth: 8, boxHeight: 8, font: { size: 11 }, color: C.textSecondary, usePointStyle: true } },
      },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { color: C.textMuted, font: { size: 12 } },
        y: { stacked: true, beginAtZero: true, grid: { color: C.gridColor }, ticks: { color: C.textMuted, font: { size: 11 } },
      },
    },
  });
}

function renderIndexChart(data) {
  if (charts.index) charts.index.destroy();
  const labels = data.jenjang.map(j => j.jenjang);
  const mk = key => data.jenjang.map(j => j[key]?.toFixed(1) || 0);

  charts.index = new Chart(document.getElementById('chart-index'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'A', data: mk('avgA'), backgroundColor: C.idxA, borderRadius: 3 },
        { label: 'B', data: mk('avgB'), backgroundColor: C.idxB, borderRadius: 3 },
        { label: 'C', data: mk('avgC'), backgroundColor: C.idxC, borderRadius: 3 },
        { label: 'D', data: mk('avgD'), backgroundColor: C.idxD, borderRadius: 3 },
        { label: 'E', data: mk('avgE'), backgroundColor: C.idxE, borderRadius: 3 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', align: 'end', labels: { boxWidth: 8, boxHeight: 8, font: { size: 11 }, color: C.textSecondary, usePointStyle: true } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: C.textMuted, font: { size: 12 } },
        y: { beginAtZero: true, max: 100, grid: { color: C.gridColor }, ticks: { color: C.textMuted, font: { size: 11 } },
      },
    },
  });
}

function renderTopBottom(data) {
  const badge = lvl => {
    const cls = lvl === 'Baik' ? 'badge-baik' : lvl === 'Sedang' ? 'badge-sedang' : 'badge-kurang';
    return `<span class="badge ${cls}">${lvl}</span>`;
  };

  document.getElementById('top5-body').innerHTML = data.topSchools.map((s, i) => `
    <tr><td class="rank-num">${i + 1}</td><td>${s.school_name}</td><td>${s.final_score.toFixed(1)}</td><td>${badge(s.level)}</td></tr>
  `).join('');

  document.getElementById('bottom5-body').innerHTML = data.bottomSchools.map((s, i) => `
    <tr><td class="rank-num">${i + 1}</td><td>${s.school_name}</td><td>${s.final_score.toFixed(1)}</td><td>${badge(s.level)}</td></tr>
  `).join('');
}

async function renderTrendJenjang() {
  if (charts.trendJenjang) charts.trendJenjang.destroy();
  const trend = await sbAPI.getTrendJenjang();
  const colors = { SD: '#F97316', SMP: '#2563EB', SMA: '#22C55E' };

  charts.trendJenjang = new Chart(document.getElementById('chart-trend-jenjang'), {
    type: 'line',
    data: {
      labels: trend.months,
      datasets: trend.jenjang.map(j => ({
        label: j.jenjang,
        data: j.scores,
        borderColor: colors[j.jenjang],
        backgroundColor: colors[j.jenjang] + '15',
        pointBackgroundColor: colors[j.jenjang],
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        borderWidth: 2,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', align: 'end', labels: { boxWidth: 12, boxHeight: 2, font: { size: 11 }, color: C.textSecondary, usePointStyle: false } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: C.textMuted, font: { size: 11 } },
        y: { beginAtZero: true, max: 100, grid: { color: C.gridColor }, ticks: { color: C.textMuted, font: { size: 11 } },
      },
    },
  });
}

async function renderTrendKab() {
  if (charts.trendKab) charts.trendKab.destroy();
  const trend = await sbAPI.getTrendKab();
  const palette = ['#F97316', '#2563EB', '#22C55E', '#C026D3', '#06B6D4', '#F59E0B', '#EF444', '#8B5CF6'];

  charts.trendKab = new Chart(document.getElementById('chart-trend-kab'), {
    type: 'line',
    data: {
      labels: trend.months,
      datasets: trend.kab.map((k, i) => ({
        label: k.kab,
        data: k.scores,
        borderColor: palette[i % palette.length],
        backgroundColor: palette[i % palette.length] + '10',
        pointBackgroundColor: palette[i % palette.length],
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.3,
        borderWidth: 2,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', align: 'end', labels: { boxWidth: 12, boxHeight: 2, font: { size: 10 }, color: C.textSecondary, usePointStyle: false } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: C.textMuted, font: { size: 11 } },
        y: { beginAtZero: true, max: 100, grid: { color: C.gridColor }, ticks: { color: C.textMuted, font: { size: 11 } },
      },
    },
  });
}

async function renderKabRanking(month) {
  const ranking = await sbAPI.getKabRanking(month);
  const badge = lvl => {
    const cls = lvl === 'Baik' ? 'badge-baik' : lvl === 'Sedang' ? 'badge-sedang' : 'badge-kurang';
    return `<span class="badge ${cls}">${lvl}</span>`;
  };

  document.getElementById('kab-ranking-body').innerHTML = ranking.map((k, i) => `
    <tr>
      <td class="rank-num">${i + 1}</td>
      <td>${k.kab} <span style="color:var(--text-muted);font-size:11px">(${k.count} sekolah)</span></td>
      <td><strong>${k.finalScore.toFixed(1)}</strong></td>
      <td>${k.indexA.toFixed(1)}</td>
      <td>${k.indexB.toFixed(1)}</td>
      <td>${k.indexC.toFixed(1)}</td>
      <td>${k.indexD.toFixed(1)}</td>
      <td>${k.indexE.toFixed(1)}</td>
      <td>${badge(k.level)}</td>
      <td class="${k.trend > 0 ? 'trend-up' : k.trend < 0 ? 'trend-down' : 'trend-flat'}">${k.trend > 0 ? '↑' : k.trend < 0 ? '↓' : '→'} ${Math.abs(k.trend).toFixed(1)}</td>
    </tr>
  `).join('');
}
