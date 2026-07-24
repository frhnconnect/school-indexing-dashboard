/* annual-report.js — Laporan Tahunan
   Aggregates all months for annual summary, active/inactive, insights, recommendations
*/

var AnnualReport = (function () {
  'use strict';

  var state = {
    months: [],
    perMonthData: {},
    summary: null,
  };

  var charts = {};

  var CRITERIA_HTML =
    '<p>Sekolah diklasifikasikan <strong>Aktif</strong> jika melaksanakan <strong>minimal 4 dari 5 index (A-E)</strong>, berapa pun jumlah kelasnya.</p>' +
    '<ul>' +
    '<li><strong>Index A</strong> — Academic & Learning Behaviors (Literasi, Numerasi, Sains, Sosial, Karakter)</li>' +
    '<li><strong>Index B</strong> — Education Quality / Within-school Equity</li>' +
    '<li><strong>Index C</strong> — Teacher Engagement & Readiness</li>' +
    '<li><strong>Index D</strong> — Digital Learning Engagement</li>' +
    '<li><strong>Index E</strong> — Digital Adoption Readiness</li>' +
    '</ul>' +
    '<p>"Dilaksanakan" = index score &ge; 20 (threshold minimal partisipasi). Sekolah yang melaksanakan kurang dari 4 index diklasifikasikan <strong>Inaktif</strong>.</p>';

  async function init() {
    Auth.requireAuth();
    var nameEl = document.getElementById('user-name');
    if (nameEl) nameEl.textContent = Auth.getUserName();

    if (sbAPI.applyModeUI) sbAPI.applyModeUI();
    else if (sbAPI.isDemo && sbAPI.isDemo()) {
      var wb = document.getElementById('warn-banner');
      if (wb) wb.style.display = 'flex';
    }

    var criteriaEl = document.getElementById('criteria-text');
    if (criteriaEl) criteriaEl.innerHTML = CRITERIA_HTML;

    // Init tahun ajaran select
    var taList = sbAPI.getTahunAjaranList();
    var taSel = document.getElementById('ta-select');
    if (taSel) {
      taSel.innerHTML = taList.map(ta => '<option value="' + ta.code + '">' + ta.label + '</option>').join('');
      taSel.value = taList[taList.length - 1].code;
      taSel.addEventListener('change', () => { loadData().then(renderAll); });
    }

    // Init provinsi select
    var provList = sbAPI.PROVINSI;
    var provSel = document.getElementById('provinsi-select');
    if (provSel) {
      provSel.innerHTML = provList.map(p => '<option value="' + p.code + '">' + p.name + '</option>').join('');
      provSel.value = 'bali'; // Default provinsi
      provSel.addEventListener('change', () => { loadData().then(renderAll); });
    }

    await loadData();
    renderAll();
  }

  async function loadData() {
    var taSel = document.getElementById('ta-select');
    var taCode = taSel ? taSel.value : '2025/2026';
    var months = sbAPI.getMonthsForTahunAjaran(taCode);
    state.months = months;
    state.taCode = taCode;

    // Check if TA is complete (last month = June)
    var lastMonth = months[months.length - 1];
    var isTAComplete = parseInt(lastMonth.split('-')[1], 10) === 6;
    state.isTAComplete = isTAComplete;

    var provSel = document.getElementById('provinsi-select');
    var provCode = provSel ? provSel.value : 'bali';
    state.provCode = provCode;

    var perMonth = {};
    for (var i = 0; i < months.length; i++) {
      var m = months[i];
      var allScores = await sbAPI.getScoresForMonth(m);
      // Filter by provinsi
      var scores = allScores.filter(s => (s.schools?.provinsi_code || s.provinsi_code) === provCode);
      perMonth[m] = scores;
    }
    state.perMonthData = perMonth;

    // Use latest month as representative data
    var latestMonth = months[months.length - 1];
    var latestScores = perMonth[latestMonth];

    // Aggregate by kabupaten (within selected provinsi)
    var kabMap = {};
    var totalActive = 0;
    var totalInactive = 0;
    var totalScore = 0;
    var scoreCount = 0;

    for (var j = 0; j < latestScores.length; j++) {
      var s = latestScores[j];
      var kab = s.schools?.kabupaten_kota || s.kabupaten_kota || 'Unknown';

      if (!kabMap[kab]) {
        kabMap[kab] = {
          kab: kab,
          schools: [],
          active: 0,
          inactive: 0,
          totalScore: 0,
          indexA: 0,
          indexB: 0,
          indexC: 0,
          indexD: 0,
          indexE: 0,
        };
      }

      var p = kabMap[kab];
      p.schools.push(s);
      var isActive = s.is_active || false;
      if (isActive) {
        p.active++;
        totalActive++;
      } else {
        p.inactive++;
        totalInactive++;
      }

      var fs = s.final_score || 0;
      p.totalScore += fs;
      totalScore += fs;
      scoreCount++;

      p.indexA += (s.index_a || 0);
      p.indexB += (s.index_b || 0);
      p.indexC += (s.index_c || 0);
      p.indexD += (s.index_d || 0);
      p.indexE += (s.index_e || 0);
    }

    var kabArr = [];
    for (var key in kabMap) {
      var pr = kabMap[key];
      pr.count = pr.schools.length;
      pr.avgScore = pr.count > 0 ? pr.totalScore / pr.count : 0;
      pr.avgIndexA = pr.count > 0 ? pr.indexA / pr.count : 0;
      pr.avgIndexB = pr.count > 0 ? pr.indexB / pr.count : 0;
      pr.avgIndexC = pr.count > 0 ? pr.indexC / pr.count : 0;
      pr.avgIndexD = pr.count > 0 ? pr.indexD / pr.count : 0;
      pr.avgIndexE = pr.count > 0 ? pr.indexE / pr.count : 0;
      pr.activePct = pr.count > 0 ? Math.round((pr.active / pr.count) * 100) : 0;
      pr.level = pr.avgScore >= 60 ? 'Baik' : pr.avgScore >= 40 ? 'Sedang' : 'Kurang';
      kabArr.push(pr);
    }

    kabArr.sort(function (a, b) { return b.avgScore - a.avgScore; });

    // Build trend data across months (for selected provinsi)
    var trend = { months: months, provinsi: [], indexA: [], indexB: [], indexC: [], indexD: [], indexE: [] };
    for (var t = 0; t < months.length; t++) {
      var mScores = perMonth[months[t]];
      var mSum = 0, mA = 0, mB = 0, mC = 0, mD = 0, mE = 0;
      for (var k = 0; k < mScores.length; k++) {
        mSum += mScores[k].final_score || 0;
        mA += mScores[k].index_a || 0;
        mB += mScores[k].index_b || 0;
        mC += mScores[k].index_c || 0;
        mD += mScores[k].index_d || 0;
        mE += mScores[k].index_e || 0;
      }
      var n = mScores.length || 1;
      trend.provinsi.push(Math.round((mSum / n) * 10) / 10);
      trend.indexA.push(Math.round((mA / n) * 10) / 10);
      trend.indexB.push(Math.round((mB / n) * 10) / 10);
      trend.indexC.push(Math.round((mC / n) * 10) / 10);
      trend.indexD.push(Math.round((mD / n) * 10) / 10);
      trend.indexE.push(Math.round((mE / n) * 10) / 10);
    }

    state.summary = {
      totalSchools: latestScores.length,
      active: totalActive,
      inactive: totalInactive,
      activePct: latestScores.length > 0 ? Math.round((totalActive / latestScores.length) * 1000) / 10 : 0,
      inactivePct: latestScores.length > 0 ? Math.round((totalInactive / latestScores.length) * 1000) / 10 : 0,
      avgScore: scoreCount > 0 ? Math.round((totalScore / scoreCount) * 10) / 10 : 0,
      kabupaten: kabArr,
      bestKabupaten: kabArr.length > 0 ? kabArr[0] : null,
      worstKabupaten: kabArr.length > 0 ? kabArr[kabArr.length - 1] : null,
      trend: trend,
      monthCount: months.length,
      firstMonth: months[0],
      lastMonth: months[months.length - 1],
    };
  }

  function renderAll() {
    renderExecSummary();
    renderActiveInactive();
    renderIndexInsights();
    renderRanking();
    renderRecommendations();
  }

  // ─── Section 1: Executive Summary ───
  function renderExecSummary() {
    var s = state.summary;
    if (!s) return;

    setText('kpi-total', s.totalSchools.toLocaleString('id-ID'));
    setText('kpi-aktif', s.active.toLocaleString('id-ID'));
    setText('kpi-aktif-pct', s.activePct + '% dari total');
    setText('kpi-inaktif', s.inactive.toLocaleString('id-ID'));
    setText('kpi-inaktif-pct', s.inactivePct + '% dari total');
    setText('kpi-pct-aktif', s.activePct + '%');
    setText('kpi-avg', s.avgScore.toFixed(1));

    if (s.bestKabupaten) {
      setText('kpi-best-provinsi', s.bestKabupaten.kab);
      setText('kpi-best-score', 'Score: ' + s.bestKabupaten.avgScore.toFixed(1));
    }

    setText('kpi-provinsi-count', s.kabupaten.length);

    var fm = sbAPI.formatMonth ? sbAPI.formatMonth(s.firstMonth) : s.firstMonth;
    var lm = sbAPI.formatMonth ? sbAPI.formatMonth(s.lastMonth) : s.lastMonth;
    setText('kpi-periode', fm + ' — ' + lm);

    var sub = document.getElementById('report-subtitle');
    if (sub) sub.textContent = 'Aggregasi data ' + fm + ' — ' + lm + ' (TA ' + state.taCode + ', ' + s.monthCount + ' bulan)';

    // Update page title
    var titleEl = document.querySelector('h1');
    if (titleEl) titleEl.textContent = 'Laporan Tahunan — TA ' + state.taCode;

    // Show TA completion status
    if (!state.isTAComplete) {
      var warnEl = document.getElementById('warn-banner');
      if (warnEl) {
        warnEl.style.display = 'flex';
        warnEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;flex-shrink:0"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> <span>Tahun ajaran belum selesai. Data terakhir: ' + lm + '.</span>';
      }
    }
  }

  // ─── Section 2: Active vs Inactive ───
  function renderActiveInactive() {
    var s = state.summary;
    if (!s) return;

    // Doughnut chart
    var ctx1 = document.getElementById('chart-doughnut');
    if (ctx1) {
      if (charts.doughnut) charts.doughnut.destroy();
      charts.doughnut = new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: ['Aktif', 'Inaktif'],
          datasets: [{
            data: [s.active, s.inactive],
            backgroundColor: ['#22C55E', '#EF444'],
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { font: { size: 12 } }, }
          },
        },
      });
    }

    // Bar chart per kabupaten
    var ctx2 = document.getElementById('chart-active-bar');
    if (ctx2) {
      if (charts.activeBar) charts.activeBar.destroy();
      var kabs = s.kabupaten;
      charts.activeBar = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: kabs.map(function (p) { return p.kab; }),
          datasets: [
            { label: 'Aktif', data: kabs.map(function (p) { return p.active; }), backgroundColor: '#22C55E' },
            { label: 'Inaktif', data: kabs.map(function (p) { return p.inactive; }), backgroundColor: '#EF444' },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          scales: {
            x: { stacked: true, ticks: { font: { size: 10 }, maxRotation: 45 } },
            y: { stacked: true, beginAtZero: true },
          },
        },
      });
    }
  }

  // ─── Section 3: Index Insights ───
  function renderIndexInsights() {
    var s = state.summary;
    if (!s) return;
    var trend = s.trend;
    var months = trend.months;

    var monthLabels = months.map(function (m) {
      return sbAPI.formatMonth ? sbAPI.formatMonth(m) : m;
    });

    // Line chart: trend index A-E
    var ctx1 = document.getElementById('chart-index-trend');
    if (ctx1) {
      if (charts.indexTrend) charts.indexTrend.destroy();
      charts.indexTrend = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: monthLabels,
          datasets: [
            { label: 'Index A', data: trend.indexA, borderColor: '#3B82F6', tension: 0.3, fill: false },
            { label: 'Index B', data: trend.indexB, borderColor: '#8B5CF6', tension: 0.3, fill: false },
            { label: 'Index C', data: trend.indexC, borderColor: '#F59E0B', tension: 0.3, fill: false },
            { label: 'Index D', data: trend.indexD, borderColor: '#EC489', tension: 0.3, fill: false },
            { label: 'Index E', data: trend.indexE, borderColor: '#10B981', tension: 0.3, fill: false },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          scales: {
            y: { beginAtZero: false, max: 100 },
          },
        },
      });
    }

    // Bar chart: avg index per kabupaten
    var ctx2 = document.getElementById('chart-index-provinsi');
    if (ctx2) {
      if (charts.indexProvinsi) charts.indexProvinsi.destroy();
      var kabs = s.kabupaten.slice(0, 10);
      charts.indexProvinsi = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: kabs.map(function (p) { return p.kab; }),
          datasets: [
            { label: 'A', data: kabs.map(function (p) { return p.avgIndexA.toFixed(1); }), backgroundColor: '#3B82F6' },
            { label: 'B', data: kabs.map(function (p) { return p.avgIndexB.toFixed(1); }), backgroundColor: '#8B5CF6' },
            { label: 'C', data: kabs.map(function (p) { return p.avgIndexC.toFixed(1); }), backgroundColor: '#F59E0B' },
            { label: 'D', data: kabs.map(function (p) { return p.avgIndexD.toFixed(1); }), backgroundColor: '#EC489' },
            { label: 'E', data: kabs.map(function (p) { return p.avgIndexE.toFixed(1); }), backgroundColor: '#10B981' },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          scales: {
            x: { ticks: { font: { size: 10 }, maxRotation: 45 } },
            y: { beginAtZero: true, max: 100 },
          },
        },
      });
    }

    // Auto-generate insight text
    var insightEl = document.getElementById('insight-index-body');
    if (insightEl) {
      var insights = [];

      // Trend insight
      if (trend.provinsi.length >= 2) {
        var first = trend.provinsi[0];
        var last = trend.provinsi[trend.provinsi.length - 1];
        var delta = Math.round((last - first) * 10) / 10;
        var provName = state.provCode ? sbAPI.PROVINSI.find(p => p.code === state.provCode)?.name : 'Provinsi';
        if (delta > 0) {
          insights.push('Tren ' + provName + ' menunjukkan peningkatan <strong>' + delta + ' poin</strong> dari ' + monthLabels[0] + ' ke ' + monthLabels[monthLabels.length - 1] + '.');
        } else if (delta < 0) {
          insights.push('Tren ' + provName + ' menurun <strong>' + Math.abs(delta) + ' poin</strong> dari ' + monthLabels[0] + ' ke ' + monthLabels[monthLabels.length - 1] + '. Evaluasi diperlukan.');
        } else {
          insights.push('Tren ' + provName + ' stabil. Diperlukan inisiatif baru untuk mendorong peningkatan.');
        }
      }

      // Best/worst index
      var indexes = [
        { name: 'Index A', val: trend.indexA[trend.indexA.length - 1] },
        { name: 'Index B', val: trend.indexB[trend.indexB.length - 1] },
        { name: 'Index C', val: trend.indexC[trend.indexC.length - 1] },
        { name: 'Index D', val: trend.indexD[trend.indexD.length - 1] },
        { name: 'Index E', val: trend.indexE[trend.indexE.length - 1] },
      ];
      indexes.sort(function (a, b) { return a.val - b.val; });
      var weakest = indexes[0];
      var strongest = indexes[indexes.length - 1];
      insights.push('Index terlemah: <strong>' + weakest.name + '</strong> (' + weakest.val.toFixed(1) + '). Index terkuat: <strong>' + strongest.name + '</strong> (' + strongest.val.toFixed(1) + ').');

      // Best kabupaten
      if (s.bestKabupaten) {
        insights.push('Kabupaten terbaik: <strong>' + s.bestKabupaten.kab + '</strong> dengan skor rata-rata ' + s.bestKabupaten.avgScore.toFixed(1) + ' dan ' + s.bestKabupaten.activePct + '% sekolah aktif.');
      }

      insightEl.innerHTML = insights.map(function (t) { return '<p style="margin-bottom:8px;">• ' + t + '</p>'; }).join('');
    }
  }

  // ─── Section 4: Ranking ───
  function renderRanking() {
    var s = state.summary;
    if (!s) return;

    var tbody = document.getElementById('ranking-body');
    if (!tbody) return;

    var trend = s.trend;
    var trendUp = '↗', trendDown = '↘', trendFlat = '→';

    tbody.innerHTML = s.kabupaten.map(function (p, i) {
      var trendIcon = trendFlat;
      var trendColor = '#9CA3AF';
      if (trend.provinsi.length >= 2) {
        var delta = trend.provinsi[trend.provinsi.length - 1] - trend.provinsi[0];
        if (delta > 0.5) { trendIcon = trendUp; trendColor = '#22C55E'; }
        else if (delta < -0.5) { trendIcon = trendDown; trendColor = '#EF444'; }
      }

      var lvlColor = p.level === 'Baik' ? '#22C55E' : p.level === 'Sedang' ? '#F59E0B' : '#EF444';

      return '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td><strong>' + p.kab + '</strong></td>' +
        '<td>' + p.count + '</td>' +
        '<td>' + p.avgIndexA.toFixed(1) + '</td>' +
        '<td>' + p.avgIndexB.toFixed(1) + '</td>' +
        '<td>' + p.avgIndexC.toFixed(1) + '</td>' +
        '<td>' + p.avgIndexD.toFixed(1) + '</td>' +
        '<td>' + p.avgIndexE.toFixed(1) + '</td>' +
        '<td><strong>' + p.avgScore.toFixed(1) + '</strong></td>' +
        '<td style="color:#22C55E;">' + p.active + '</td>' +
        '<td style="color:#EF444;">' + p.inactive + '</td>' +
        '<td>' + p.activePct + '%</td>' +
        '<td style="color:' + trendColor + ';font-size:16px;">' + trendIcon + '</td>' +
        '</tr>';
    }).join('');
  }

  // ─── Section 5: Recommendations ───
  function renderRecommendations() {
    var s = state.summary;
    if (!s) return;

    var recs = [];

    // 1. Active rate
    if (s.activePct < 50) {
      recs.push('Lebih dari <strong>' + (100 - s.activePct) + '%</strong> sekolah masih inaktif. Fokus pada pelatihan guru dan sosialisasi assessment untuk meningkatkan partisipasi.');
    } else {
      recs.push('Tingkat partisipasi aktif mencapai <strong>' + s.activePct + '%</strong>. Lanjutkan Dorong sekolah inaktif untuk memenuhi kriteria assessment.');
    }

    // 2. Avg score
    var provName = state.provCode ? (sbAPI.PROVINSI.find(function(p) { return p.code === state.provCode; }) || {}).name : 'Provinsi';
    if (s.avgScore < 50) {
      recs.push('Rata-rata skor ' + provName + ' masih di bawah 50 (' + s.avgScore.toFixed(1) + '). Perlu intervensi pada index yang lemah.');
    } else {
      recs.push('Rata-rata skor ' + provName + ' ' + s.avgScore.toFixed(1) + '. Pertahankan kualitas dan target peningkatan 10% tahun depan.');
    }

    // 3. Worst kabupaten
    if (s.kabupaten.length > 0) {
      var wp = s.kabupaten[s.kabupaten.length - 1];
      recs.push('Kabupaten dengan skor terendah: <strong>' + wp.kab + '</strong> (' + wp.avgScore.toFixed(1) + '). Disarankan program pendampingan khusus.');
    }

    // 4. Weakest index
    var indexes = [
      { name: 'Index A', val: s.trend.indexA[s.trend.indexA.length - 1] },
      { name: 'Index B', val: s.trend.indexB[s.trend.indexB.length - 1] },
      { name: 'Index C', val: s.trend.indexC[s.trend.indexC.length - 1] },
      { name: 'Index D', val: s.trend.indexD[s.trend.indexD.length - 1] },
      { name: 'Index E', val: s.trend.indexE[s.trend.indexE.length - 1] },
    ];
    indexes.sort(function (a, b) { return a.val - b.val; });
    var weakest = indexes[0];
    recs.push('Index terlemah: <strong>' + weakest.name + '</strong> (' + weakest.val.toFixed(1) + '). Prioritaskan program perbaikan pada area ini.');

    // 5. Trend
    var trend = s.trend;
    if (trend.provinsi.length >= 2) {
      var delta = Math.round((trend.provinsi[trend.provinsi.length - 1] - trend.provinsi[0]) * 10) / 10;
      if (delta > 0) {
        recs.push('Tren ' + provName + ' menunjukkan peningkatan ' + delta + ' poin. Pertahankan momentum dan replikasi best practice.');
      } else if (delta < 0) {
        recs.push('Tren ' + provName + ' menurun ' + Math.abs(delta) + ' poin. Evaluasi strategi pembelajaran dan lakukan intervensi segera.');
      }
    }

    var el = document.getElementById('recommendations-body');
    if (el) {
      el.innerHTML = recs.map(function (r, i) {
        return '<div style="margin-bottom:12px;padding:10px 14px;background:rgba(59,130,246,0.05);border-radius:6px;">' +
          '<strong style="color:#1E40AF;">' + (i + 1) + '.</strong> ' + r +
          '</div>';
      }).join('');
    }
  }

  async function changeYear() {
    try {
      await loadData();
      renderAll();
    } catch (err) {
      console.error('changeYear error:', err);
    }
  }

  // ─── Helpers ───
  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  return {
    init: init,
    changeYear: changeYear,
    getAnnualSummary: function () { return state.summary; },
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  AnnualReport.init();
});
