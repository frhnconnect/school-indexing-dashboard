/* national-dashboard.js — Dashboard Nasional
   Peta Indonesia (Leaflet + GeoJSON), ranking provinsi, charts
   Supports provinsi POV: default provinsi, "Semua Provinsi" for national view
*/

const NC = {
  green: '#22C55E', orange: '#F97316', red: '#EF444',
  blue: '#3B82F6', yellow: '#F59E0B', purple: '#8B5CF6',
  textMuted: '#9CA3AF', textSecondary: '#6B7280', gridColor: '#F3F4F6',
  idxColors: ['#C2410C', '#C026D3', '#2563EB', '#06B6D4', '#F59E0B'],
};

let charts = {};
let map = null;
let geojsonLayer = null;
let provinsiData = null;

const PROVINSI_MAP = {
  'BALI': 'bali',
  'DKI JAKARTA': 'dki-jakarta',
  'JAWA BARAT': 'jawa-barat',
  'JAWA TENGAH': 'jawa-tengah',
  'DAERAH ISTIMEWA YOGYAKARTA': 'diy',
  'JAWA TIMUR': 'jawa-timur',
  'BANTEN': 'banten',
  'SUMATERA UTARA': 'sumatera-utara',
  'SULAWESI SELATAN': 'sulawesi-selatan',
  'KALIMANTAN TIMUR': 'kalimantan-timur',
};

document.addEventListener('DOMContentLoaded', async () => {
  Auth.requireAuth();
  document.getElementById('user-name').textContent = Auth.getUserName();
  if (Auth.applyNavRole) Auth.applyNavRole();

  // Init provinsi select (with "Semua Provinsi" option)
  var provSel = document.getElementById('provinsi-select');
  if (provSel) {
    var provList = sbAPI.PROVINSI;
    var opts = '<option value="all">Semua Provinsi</option>';
    opts += provList.map(function(p) {
      return '<option value="' + p.code + '">' + p.name + '</option>';
    }).join('');
    provSel.innerHTML = opts;
    provSel.value = 'all'; // Default to national view
  }

  await initMonthSelect();
  initMap();
  loadData();
});

async function initMonthSelect() {
  var taList = sbAPI.getTahunAjaranList();
  var taSel = document.getElementById('ta-select');
  if (taSel) {
    taSel.innerHTML = taList.map(function(ta) {
      return '<option value="' + ta.code + '">' + ta.label + '</option>';
    }).join('');
    taSel.value = taList[taList.length - 1].code;
    taSel.addEventListener('change', function() { initMonthSelect(); loadData(); });
  }

  var taCode = taSel ? taSel.value : taList[taList.length - 1].code;
  var months = sbAPI.getMonthsForTahunAjaran(taCode);
  var sel = document.getElementById('month-select');
  if (sel) {
    sel.innerHTML = months.map(function(m) {
      return '<option value="' + m + '">' + sbAPI.formatMonth(m) + '</option>';
    }).join('');
    sel.value = months[months.length - 1];
  }
}

async function loadData() {
  var monthEl = document.getElementById('month-select');
  var month = monthEl ? monthEl.value : '2026-06';
  var provSel = document.getElementById('provinsi-select');
  var provCode = provSel ? provSel.value : 'all';

  if (provCode === 'all') {
    // National view
    var results = await Promise.all([
      sbAPI.getNationalOverview(month),
      sbAPI.getProvinsiRanking(month),
      sbAPI.getActiveInactiveStats(month),
    ]);
    var overview = results[0];
    var ranking = results[1];
    var activeStats = results[2];

    provinsiData = overview.provinsi;

    if (sbAPI.applyModeUI) sbAPI.applyModeUI();
    else if (sbAPI.isDemo()) {
      document.getElementById('warn-banner').style.display = 'flex';
      document.getElementById('demo-card').classList.add('show');
    }

    renderKPIs(overview.nasional);
    updateLabels(true);
    renderRanking(ranking);
    renderDetailTable(ranking);
    renderMap(overview.provinsi);
    renderIndexChart(ranking);
    renderActiveChart(activeStats);
    renderLevelDist(overview);
    renderTrendNasional(month);

    var h1 = document.querySelector('h1');
    if (h1) h1.textContent = 'Dashboard Nasional — Indonesia';
  } else {
    // Provinsi view — filter data for selected provinsi
    var allScores = await sbAPI.getScoresForMonth(month);
    var scores = allScores.filter(function(s) {
      return (s.schools ? s.schools.provinsi_code : s.provinsi_code) === provCode;
    });
    var provInfo = sbAPI.PROVINSI.find(function(p) { return p.code === provCode; }) || { name: provCode };

    // Aggregate by kabupaten
    var kabMap = {};
    var totalActive = 0, totalInactive = 0, totalScore = 0, scoreCount = 0;

    for (var j = 0; j < scores.length; j++) {
      var s = scores[j];
      var kab = (s.schools ? s.schools.kabupaten_kota : s.kabupaten_kota) || 'Unknown';
      if (!kabMap[kab]) {
        kabMap[kab] = { name: kab, count: 0, active: 0, inactive: 0, totalScore: 0, indexA: 0, indexB: 0, indexC: 0, indexD: 0, indexE: 0 };
      }
      var p = kabMap[kab];
      p.count++;
      if (s.is_active) { p.active++; totalActive++; } else { p.inactive++; totalInactive++; }
      p.totalScore += s.final_score || 0;
      totalScore += s.final_score || 0;
      scoreCount++;
      p.indexA += s.index_a || 0;
      p.indexB += s.index_b || 0;
      p.indexC += s.index_c || 0;
      p.indexD += s.index_d || 0;
      p.indexE += s.index_e || 0;
    }

    var kabArr = [];
    for (var key in kabMap) {
      var pr = kabMap[key];
      pr.avgScore = pr.count > 0 ? pr.totalScore / pr.count : 0;
      pr.indexA = pr.count > 0 ? pr.indexA / pr.count : 0;
      pr.indexB = pr.count > 0 ? pr.indexB / pr.count : 0;
      pr.indexC = pr.count > 0 ? pr.indexC / pr.count : 0;
      pr.indexD = pr.count > 0 ? pr.indexD / pr.count : 0;
      pr.indexE = pr.count > 0 ? pr.indexE / pr.count : 0;
      pr.level = pr.avgScore >= 60 ? 'Baik' : pr.avgScore >= 40 ? 'Sedang' : 'Kurang';
      kabArr.push(pr);
    }
    kabArr.sort(function(a, b) { return b.avgScore - a.avgScore; });

    var nas = {
      provinsiCount: kabArr.length,
      totalSchools: scores.length,
      avgScore: scoreCount > 0 ? totalScore / scoreCount : 0,
      activeCount: totalActive,
      inactiveCount: totalInactive,
      activeRate: scores.length > 0 ? Math.round((totalActive / scores.length) * 1000) / 10 : 0,
    };

    var activeStats = { provinsi: kabArr };

    if (sbAPI.applyModeUI) sbAPI.applyModeUI();
    else if (sbAPI.isDemo()) {
      document.getElementById('warn-banner').style.display = 'flex';
      document.getElementById('demo-card').classList.add('show');
    }

    renderKPIs(nas);
    updateLabels(false);
    renderRanking(kabArr);
    renderDetailTable(kabArr);
    renderMap([]);
    renderIndexChart(kabArr);
    renderActiveChart(activeStats);
    renderLevelDist({ provinsi: kabArr });
    renderTrendProvinsi(month, provCode);

    var h1 = document.querySelector('h1');
    if (h1) h1.textContent = 'Dashboard — ' + provInfo.name;
  }
}

function updateLabels(isNational) {
  var regionLabel = isNational ? 'Provinsi' : 'Kabupaten/Kota';
  var kpiLabel = isNational ? 'Total Provinsi' : 'Total Kabupaten/Kota';

  // KPI card label
  var kpiProv = document.querySelector('.kpi-card .kpi-label');
  if (kpiProv) kpiProv.textContent = kpiLabel;

  // Ranking card title + table header
  var rankingTitle = document.querySelectorAll('.card-title')[1];
  if (rankingTitle) rankingTitle.textContent = 'Ranking ' + regionLabel;
  var rankingTh = document.querySelector('.ranking-table th:nth-child(2)');
  if (rankingTh) rankingTh.textContent = regionLabel;

  // Detail card title + table header
  var detailTitle = document.querySelectorAll('.card-title')[4];
  if (detailTitle) detailTitle.textContent = 'Detail per ' + regionLabel;
  var detailTh = document.querySelector('table:not(.ranking-table) th:nth-child(2)');
  if (detailTh) detailTh.textContent = regionLabel.toUpperCase();

  // Index chart title
  var indexChartTitle = document.querySelectorAll('.card-title')[2];
  if (indexChartTitle) indexChartTitle.textContent = 'Index A-E per ' + regionLabel + ' (Top 10)';

  // Active chart title
  var activeChartTitle = document.querySelectorAll('.card-title')[3];
  if (activeChartTitle) activeChartTitle.textContent = 'Aktif vs Inaktif per ' + regionLabel;
}

function renderKPIs(nas) {
  document.getElementById('kpi-provinsi').textContent = nas.provinsiCount;
  document.getElementById('kpi-sekolah').textContent = nas.totalSchools.toLocaleString('id-ID');
  document.getElementById('kpi-avg').textContent = nas.avgScore.toFixed(1);
  document.getElementById('kpi-aktif').textContent = nas.activeCount.toLocaleString('id-ID');
  document.getElementById('kpi-aktif-pct').textContent = nas.activeRate + '% dari total';
  document.getElementById('kpi-inaktif').textContent = nas.inactiveCount.toLocaleString('id-ID');
  document.getElementById('kpi-inaktif-pct').textContent = (100 - nas.activeRate).toFixed(1) + '% dari total';
}

function renderRanking(ranking) {
  var badge = function(lvl) {
    var cls = lvl === 'Baik' ? 'badge-baik' : lvl === 'Sedang' ? 'badge-sedang' : 'badge-kurang';
    return '<span class="badge ' + cls + '">' + lvl + '</span>';
  };

  document.getElementById('ranking-body').innerHTML = ranking.map(function(p, i) {
    return '<tr><td class="rank-num">' + (i + 1) + '</td>' +
      '<td>' + p.name + '</td>' +
      '<td>' + p.count + '</td>' +
      '<td><strong>' + p.avgScore.toFixed(1) + '</strong></td>' +
      '<td>' + p.active + '/' + p.count + '</td>' +
      '<td>' + badge(p.level) + '</td></tr>';
  }).join('');
}

function renderDetailTable(ranking) {
  var badge = function(lvl) {
    var cls = lvl === 'Baik' ? 'badge-baik' : lvl === 'Sedang' ? 'badge-sedang' : 'badge-kurang';
    return '<span class="badge ' + cls + '">' + lvl + '</span>';
  };

  document.getElementById('detail-body').innerHTML = ranking.map(function(p, i) {
    var activePct = p.count ? ((p.active / p.count) * 100).toFixed(1) : '0.0';
    return '<tr><td class="rank-num">' + (i + 1) + '</td>' +
      '<td>' + p.name + '</td>' +
      '<td>' + p.count + '</td>' +
      '<td><strong>' + p.avgScore.toFixed(1) + '</strong></td>' +
      '<td>' + p.indexA.toFixed(1) + '</td>' +
      '<td>' + p.indexB.toFixed(1) + '</td>' +
      '<td>' + p.indexC.toFixed(1) + '</td>' +
      '<td>' + p.indexD.toFixed(1) + '</td>' +
      '<td>' + p.indexE.toFixed(1) + '</td>' +
      '<td>' + p.active + '</td>' +
      '<td>' + p.inactive + '</td>' +
      '<td>' + activePct + '%</td>' +
      '<td>' + badge(p.level) + '</td></tr>';
  }).join('');
}

// ─── Map (Leaflet + GeoJSON) ───

function initMap() {
  map = L.map('map-container', {
    zoomControl: true,
    scrollWheelZoom: true,
    dragging: true,
    doubleClickZoom: true,
    attributionControl: false,
    minZoom: 4,
    maxZoom: 7,
  }).setView([-2.5, 118], 5);

  fetch('assets/indonesia-province.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      geojsonLayer = L.geoJSON(data, {
        style: function(feature) { return getMapStyle(feature); },
        onEachFeature: function(feature, layer) {
          var provName = feature.properties.Propinsi || '';
          var popup = buildPopup(provName);
          layer.bindPopup(popup, { maxWidth: 250 });
          layer.bindTooltip(provName, { sticky: true });
          layer.on({
            mouseover: function(e) {
              e.target.setStyle({ weight: 2.5, color: '#1F2937', fillOpacity: 0.9 });
              e.target.openTooltip();
            },
            mouseout: function(e) { geojsonLayer.resetStyle(e.target); },
          });
        },
      }).addTo(map);
      map.fitBounds(geojsonLayer.getBounds(), { padding: [20, 20] });
    })
    .catch(function(err) { console.warn('GeoJSON load error:', err); });
}

function buildPopup(provName) {
  var pcode = PROVINSI_MAP[provName.toUpperCase()];
  var prov = provinsiData ? provinsiData.find(function(p) { return p.code === pcode; }) : null;
  if (!prov) {
    return '<div style="font-size:13px;"><strong>' + provName + '</strong><br><span style="color:#9CA3AF;">Data belum tersedia</span></div>';
  }
  var activePct = prov.count ? ((prov.active / prov.count) * 100).toFixed(1) : '0';
  return '<div style="font-size:13px;line-height:1.7;">' +
    '<strong style="font-size:14px;">' + prov.name + '</strong>' +
    '<div style="display:flex;justify-content:space-between;gap:16px;"><span style="color:#6B7280;">Sekolah</span><strong>' + prov.count + '</strong></div>' +
    '<div style="display:flex;justify-content:space-between;gap:16px;"><span style="color:#6B7280;">Avg Score</span><strong>' + prov.avgScore.toFixed(1) + '</strong></div>' +
    '<div style="display:flex;justify-content:space-between;gap:16px;"><span style="color:#6B7280;">Index A-E</span><strong>' + prov.indexA.toFixed(0) + ' / ' + prov.indexB.toFixed(0) + ' / ' + prov.indexC.toFixed(0) + ' / ' + prov.indexD.toFixed(0) + ' / ' + prov.indexE.toFixed(0) + '</strong></div>' +
    '<div style="display:flex;justify-content:space-between;gap:16px;"><span style="color:#6B7280;">Aktif</span><strong style="color:#22C55E;">' + prov.active + ' (' + activePct + '%)</strong></div>' +
    '<div style="display:flex;justify-content:space-between;gap:16px;"><span style="color:#6B7280;">Inaktif</span><strong style="color:#EF444;">' + prov.inactive + '</strong></div>' +
    '<div style="margin-top:6px;"><span style="background:' + (prov.level === 'Baik' ? '#DCFCE7' : prov.level === 'Sedang' ? '#FEF3C7' : '#FEE2E2') + ';color:' + (prov.level === 'Baik' ? '#166534' : prov.level === 'Sedang' ? '#92400E' : '#991B1B') + ';padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">' + prov.level + '</span></div>' +
    '</div>';
}

function getMapStyle(feature) {
  var provName = (feature.properties.Propinsi || '').toUpperCase();
  var pcode = PROVINSI_MAP[provName];
  var prov = provinsiData ? provinsiData.find(function(p) { return p.code === pcode; }) : null;

  if (!prov) {
    return { fillColor: '#E5E7EB', weight: 0.5, color: '#fff', fillOpacity: 0.6 };
  }

  var score = prov.avgScore;
  var color = '#EF444';
  if (score > 75) color = '#22C55E';
  else if (score >= 50) color = '#F59E0B';
  else if (score >= 40) color = '#F97316';

  return { fillColor: color, weight: 0.8, color: '#fff', fillOpacity: 0.7 };
}

function onProvinsiClick(provName) {
  var pcode = PROVINSI_MAP[provName.toUpperCase()];
  if (!pcode) return;
  window.location.href = 'index.html?provinsi=' + pcode;
}

function renderMap(provinsi) {
  provinsiData = provinsi;
  if (geojsonLayer) {
    geojsonLayer.eachLayer(function(layer) {
      layer.setStyle(getMapStyle(layer.feature));
    });
  }
}

// ─── Charts ───

function chartOpts(showLegend) {
  var opts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: showLegend
        ? { position: 'top', align: 'end', labels: { boxWidth: 8, boxHeight: 8, font: { size: 11 }, color: NC.textSecondary, usePointStyle: true } }
        : { display: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: NC.textMuted, font: { size: 9 }, maxRotation: 45 } },
      y: { beginAtZero: true, max: 100, grid: { color: NC.gridColor }, ticks: { color: NC.textMuted, font: { size: 11 } }},
    },
  };
  return opts;
}

function renderIndexChart(ranking) {
  if (charts.index) charts.index.destroy();
  var top10 = ranking.slice(0, 10);
  var labels = top10.map(function(p) { return p.name.substring(0, 15); });

  charts.index = new Chart(document.getElementById('chart-index-provinsi'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Index A', data: top10.map(function(p) { return p.indexA.toFixed(1); }), backgroundColor: NC.idxColors[0], borderRadius: 2 },
        { label: 'Index B', data: top10.map(function(p) { return p.indexB.toFixed(1); }), backgroundColor: NC.idxColors[1], borderRadius: 2 },
        { label: 'Index C', data: top10.map(function(p) { return p.indexC.toFixed(1); }), backgroundColor: NC.idxColors[2], borderRadius: 2 },
        { label: 'Index D', data: top10.map(function(p) { return p.indexD.toFixed(1); }), backgroundColor: NC.idxColors[3], borderRadius: 2 },
        { label: 'Index E', data: top10.map(function(p) { return p.indexE.toFixed(1); }), backgroundColor: NC.idxColors[4], borderRadius: 2 },
      ],
    },
    options: chartOpts(true),
  });
}

function renderActiveChart(stats) {
  if (charts.active) charts.active.destroy();
  var provs = stats.provinsi;
  var labels = provs.map(function(p) { return p.name.substring(0, 15); });

  var cfg = chartOpts(true);
  cfg.scales = {
    x: { grid: { display: false }, ticks: { color: NC.textMuted, font: { size: 9 }, maxRotation: 45 } },
    y: { beginAtZero: true, grid: { color: NC.gridColor }, ticks: { color: NC.textMuted, font: { size: 11 } }},

  };

  charts.active = new Chart(document.getElementById('chart-active-provinsi'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Aktif', data: provs.map(function(p) { return p.active; }), backgroundColor: NC.green, borderRadius: 2 },
        { label: 'Inaktif', data: provs.map(function(p) { return p.inactive; }), backgroundColor: NC.red, borderRadius: 2 },
      ],
    },
    options: cfg,
  });
}

function renderLevelDist(overview) {
  if (charts.level) charts.level.destroy();
  var baik = 0, sedang = 0, kurang = 0;
  overview.provinsi.forEach(function(p) {
    if (p.level === 'Baik') baik++;
    else if (p.level === 'Sedang') sedang++;
    else kurang++;
  });

  charts.level = new Chart(document.getElementById('chart-level-dist'), {
    type: 'doughnut',
    data: {
      labels: ['Baik', 'Sedang', 'Kurang'],
      datasets: [{
        data: [baik, sedang, kurang],
        backgroundColor: [NC.green, NC.yellow, NC.red],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 10, font: { size: 12 }, color: NC.textSecondary } },
      },
    },
  });
}

async function renderTrendNasional(month) {
  if (charts.trend) charts.trend.destroy();
  var taSel = document.getElementById('ta-select');
  var taCode = taSel ? taSel.value : '2025/2026';
  var months = sbAPI.getMonthsForTahunAjaran(taCode);
  var sorted = months.slice().sort();
  var filtered = sorted.filter(function(m) { return m <= month; });

  var nasAvgs = [];
  for (var i = 0; i < filtered.length; i++) {
    var ov = await sbAPI.getNationalOverview(filtered[i]);
    nasAvgs.push(Math.round(ov.nasional.avgScore * 10) / 10);
  }

  var cfg = chartOpts(false);
  cfg.scales = {
    x: { grid: { display: false }, ticks: { color: NC.textMuted, font: { size: 10 } } },
    y: { beginAtZero: false, grid: { color: NC.gridColor }, ticks: { color: NC.textMuted, font: { size: 11 } } },
  };

  charts.trend = new Chart(document.getElementById('chart-trend-nasional'), {
    type: 'line',
    data: {
      labels: filtered.map(function(m) { return sbAPI.formatMonth(m); }),
      datasets: [{
        label: 'Rata-rata Nasional',
        data: nasAvgs,
        borderColor: NC.blue,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: NC.blue,
      }],
    },
    options: cfg,
  });
}

async function renderTrendProvinsi(month, provCode) {
  if (charts.trend) charts.trend.destroy();
  var taSel = document.getElementById('ta-select');
  var taCode = taSel ? taSel.value : '2025/2026';
  var months = sbAPI.getMonthsForTahunAjaran(taCode);
  var sorted = months.slice().sort();
  var filtered = sorted.filter(function(m) { return m <= month; });

  var provAvgs = [];
  for (var i = 0; i < filtered.length; i++) {
    var allScores = await sbAPI.getScoresForMonth(filtered[i]);
    var scores = allScores.filter(function(s) {
      return (s.schools ? s.schools.provinsi_code : s.provinsi_code) === provCode;
    });
    var avg = scores.length > 0 ? scores.reduce(function(sum, s) { return sum + (s.final_score || 0); }, 0) / scores.length : 0;
    provAvgs.push(Math.round(avg * 10) / 10);
  }

  var provInfo = sbAPI.PROVINSI.find(function(p) { return p.code === provCode; }) || { name: provCode };

  var cfg = chartOpts(false);
  cfg.scales = {
    x: { grid: { display: false }, ticks: { color: NC.textMuted, font: { size: 10 } } },
    y: { beginAtZero: false, grid: { color: NC.gridColor }, ticks: { color: NC.textMuted, font: { size: 11 } } },
  };

  charts.trend = new Chart(document.getElementById('chart-trend-nasional'), {
    type: 'line',
    data: {
      labels: filtered.map(function(m) { return sbAPI.formatMonth(m); }),
      datasets: [{
        label: 'Rata-rata ' + provInfo.name,
        data: provAvgs,
        borderColor: NC.orange,
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: NC.orange,
      }],
    },
    options: cfg,
  });
}
