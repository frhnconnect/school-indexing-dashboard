/* index-breakdown.js — Page 3: Index Breakdown (v2)
   Section per index A-E: score + sub-scores + month-to-month line.
   Per kabupaten/kota table at bottom.
*/

const BC = {
  idxA: '#C2410C', idxB: '#C026D3', idxC: '#2563EB', idxD: '#06B6D4', idxE: '#F59E0B',
  green: '#22C55E', orange: '#F97316', red: '#EF444',
  textMuted: '#9CA3AF', textSecondary: '#6B7280', gridColor: '#F3F4F6',
};

const INDEX_META = [
  { key: 'a', label: 'Index A — Hasil Belajar', color: BC.idxA,
    tip: 'Seberapa bagus hasil belajar siswa di sekolah, digabung dari 5 area: baca-tulis, hitung, sains, sosial, dan karakter.',
    subs: [
      { key: 'index_a_literasi', label: 'Literasi', tip: 'Kemampuan baca-tulis dan bahasa (Bahasa Indonesia & Inggris).' },
      { key: 'index_a_numerasi', label: 'Numerasi', tip: 'Kemampuan berhitung dan matematika.' },
      { key: 'index_a_sains', label: 'Sains', tip: 'Hasil belajar di bidang sains / IPA (termasuk biologi, kimia, fisika di SMA).' },
      { key: 'index_a_sosial', label: 'Sosial', tip: 'Hasil belajar di bidang sosial (IPS, geografi, ekonomi, sejarah, dsb.).' },
      { key: 'index_a_karakter', label: 'Karakter', tip: 'Pembentukan karakter lewat PPKN, agama, dan seni.' },
    ],
  },
  { key: 'b', label: 'Index B — Pemerataan Pendidikan', color: BC.idxB,
    tip: 'Apakah hasil belajar merata di sekolah, atau hanya sebagian siswa yang unggul sementara yang lain tertinggal jauh.',
    subs: [
      { key: 'index_b_avg_max', label: 'AVG Max', tip: 'Rata-rata nilai tertinggi di sekolah. Semakin tinggi = ada siswa yang sangat unggul.' },
      { key: 'index_b_avg_min', label: 'AVG Min', tip: 'Rata-rata nilai terendah di sekolah. Semakin tinggi = siswa paling lemah pun masih cukup baik.' },
      { key: 'index_b_gap', label: 'Gap', tip: 'Jarak antara nilai tertinggi dan terendah. Semakin kecil gap = hasil belajar lebih merata.' },
    ],
  },
  { key: 'c', label: 'Index C — Kualitas Guru', color: BC.idxC,
    tip: 'Seberapa aktif guru memakai Kelas Pintar: login, memberi tugas, membuka materi, dan memakai fitur AI.',
    subs: [
      { key: 'index_c_guru_aktif', label: 'Guru Aktif (%)', tip: 'Persentase guru yang masuk ke platform di periode ini.' },
      { key: 'index_c_guru_assign', label: 'Guru Assign (%)', tip: 'Persentase guru yang memberi tugas / ujian lewat platform.' },
      { key: 'index_c_guru_content', label: 'Guru Content (%)', tip: 'Persentase guru yang membuka atau memakai materi pembelajaran.' },
      { key: 'index_c_guru_ai', label: 'Guru AI (%)', tip: 'Persentase guru yang memakai bantuan AI di platform.' },
    ],
  },
  { key: 'd', label: 'Index D — Proses Pembelajaran', color: BC.idxD,
    tip: 'Seberapa aktif siswa belajar lewat Kelas Pintar: masuk platform, mengerjakan tugas, membuka materi, dan memakai AI.',
    subs: [
      { key: 'index_d_siswa_aktif', label: 'Siswa Aktif (%)', tip: 'Persentase siswa yang masuk ke platform di periode ini.' },
      { key: 'index_d_siswa_attend', label: 'Siswa Attend (%)', tip: 'Persentase siswa yang mengerjakan / mengumpulkan tugas atau ujian.' },
      { key: 'index_d_siswa_content', label: 'Siswa Content (%)', tip: 'Persentase siswa yang membuka materi pembelajaran.' },
      { key: 'index_d_siswa_ai', label: 'Siswa AI (%)', tip: 'Persentase siswa yang memakai bantuan AI di platform.' },
    ],
  },
  { key: 'e', label: 'Index E — Digitalisasi', color: BC.idxE,
    tip: 'Seberapa lengkap akun guru dan siswa di sekolah sudah terdaftar di Kelas Pintar dibanding yang seharusnya.',
    subs: [
      { key: 'index_e_registered', label: 'Registered', tip: 'Jumlah akun yang sudah terdaftar di platform.' },
      { key: 'index_e_target', label: 'Target', tip: 'Jumlah akun yang seharusnya ada (berdasarkan jumlah siswa/guru di sekolah).' },
      { key: 'index_e_ratio', label: 'Ratio (%)', tip: 'Persentase pemenuhan akun: yang sudah terdaftar dibanding target.' },
    ],
    scoreFrom: 'ratio',
  },
];

let charts = {};
let _trendCache = {};

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

async function loadData() {
  const month = document.getElementById('month-select').value || '2026-06';
  const provSel = document.getElementById('provinsi-select');
  const provName = provSel ? provSel.options[provSel.selectedIndex].text : 'Bali';
  const provCode = provSel ? provSel.value : 'bali';

  document.querySelector('h1').textContent = `Indeks Breakdown — ${provName}`;

  if (sbAPI.applyModeUI) sbAPI.applyModeUI();
  else if (sbAPI.isDemo()) {
    document.getElementById('warn-banner').style.display = 'flex';
    document.getElementById('demo-card').classList.add('show');
  }

  const data = await sbAPI.getBreakdown(month);
  // Filter by provinsi
  const scores = data.schools.filter(s => !provCode || (s.schools?.provinsi_code || s.provinsi_code) === provCode);

  // Aggregate per jenjang
  const jenjangList = ['SD', 'SMP', 'SMA'];
  const jenjangAgg = {};
  jenjangList.forEach(jj => {
    const ss = scores.filter(s => s.schools?.jenjang === jj);
    jenjangAgg[jj] = ss.length ? aggIndex(ss) : null;
  });

  // Get trend data (cache by provCode+month)
  const trendKey = provCode + '_' + month;
  if (!_trendCache[trendKey]) {
    // Build trend by fetching all months up to selected
    const taCode = document.getElementById('ta-select')?.value || '2025/2026';
    const allMonths = sbAPI.getMonthsForTahunAjaran(taCode);
    const filtered = allMonths.filter(m => m <= month);
    const trendData = { months: filtered, a: [], b: [], c: [], d: [], e: [] };
    for (const m of filtered) {
      const bd = await sbAPI.getBreakdown(m);
      const ms = bd.schools.filter(s => !provCode || (s.schools?.provinsi_code || s.provinsi_code) === provCode);
      // Compute index scores from sub-scores for consistency
      const aSubs = ['index_a_literasi','index_a_numerasi','index_a_sains','index_a_sosial','index_a_karakter'];
      const bSubs = ['index_b_avg_max','index_b_avg_min','index_b_gap'];
      const cSubs = ['index_c_guru_aktif','index_c_guru_assign','index_c_guru_content','index_c_guru_ai'];
      const dSubs = ['index_d_siswa_aktif','index_d_siswa_attend','index_d_siswa_content','index_d_siswa_ai'];
      const a = ms.length ? aSubs.reduce((s, k) => s + avg(ms, k), 0) / aSubs.length : 0;
      const b = ms.length ? bSubs.reduce((s, k) => s + avg(ms, k), 0) / bSubs.length : 0;
      const c = ms.length ? cSubs.reduce((s, k) => s + avg(ms, k), 0) / cSubs.length : 0;
      const d = ms.length ? dSubs.reduce((s, k) => s + avg(ms, k), 0) / dSubs.length : 0;
      const e = ms.length ? avg(ms, 'index_e_ratio') * 100 : 0;
      trendData.a.push(Math.round(a * 10) / 10);
      trendData.b.push(Math.round(b * 10) / 10);
      trendData.c.push(Math.round(c * 10) / 10);
      trendData.d.push(Math.round(d * 10) / 10);
      trendData.e.push(Math.round(e * 10) / 10);
    }
    _trendCache = {};
    _trendCache[trendKey] = trendData;
  }
  const trend = _trendCache[trendKey];

  renderBreakdownSections(jenjangAgg, trend);
  renderKabTable(scores);
}

function avg(arr, key) {
  if (!arr.length) return 0;
  return arr.reduce((s, x) => s + (x[key] || 0), 0) / arr.length;
}

function aggIndex(schools) {
  const r = { score: avg(schools, 'final_score') };
  INDEX_META.forEach(meta => {
    // Compute index score from sub-scores if available, else use raw index value
    if (meta.scoreFrom === 'ratio') {
      r['index_' + meta.key] = avg(schools, 'index_e_ratio') * 100;
    } else if (meta.subs.length) {
      const subAvgs = meta.subs.map(sub => avg(schools, sub.key));
      r['index_' + meta.key] = subAvgs.reduce((a, b) => a + b, 0) / subAvgs.length;
    } else {
      r['index_' + meta.key] = avg(schools, 'index_' + meta.key);
    }
    meta.subs.forEach(sub => {
      r[sub.key] = avg(schools, sub.key);
    });
  });
  return r;
}

function chartOpts() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end', labels: { boxWidth: 8, boxHeight: 8, font: { size: 11 }, color: BC.textSecondary, usePointStyle: true } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: BC.textMuted, font: { size: 10 } } },
      y: { grid: { color: BC.gridColor }, ticks: { color: BC.textMuted, font: { size: 11 } } },
    },
  };
}

function renderBreakdownSections(jenjangAgg, trend) {
  const container = document.getElementById('breakdown-sections');
  const jenjangList = ['SD', 'SMP', 'SMA'];
  const jenjangColors = { SD: '#DC2626', SMP: '#2563EB', SMA: '#6B7280' };

  container.innerHTML = INDEX_META.map(meta => {
    const score = jenjangAgg['SD'] ? avg(jenjangList.map(jj => jenjangAgg[jj] ? jenjangAgg[jj]['index_' + meta.key] : 0), '_') : 0;
    // Actually compute overall avg across all jenjang
    const allScores = jenjangList.map(jj => jenjangAgg[jj] ? jenjangAgg[jj]['index_' + meta.key] : null).filter(v => v !== null);
    const overallScore = allScores.length ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;

    const esc = (s) => String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
    const subsHtml = meta.subs.length ? `<div class="breakdown-subs">${meta.subs.map(sub => {
      const subScores = jenjangList.map(jj => jenjangAgg[jj] ? jenjangAgg[jj][sub.key] : null).filter(v => v !== null);
      const subAvg = subScores.length ? subScores.reduce((a, b) => a + b, 0) / subScores.length : 0;
      const tip = esc(sub.tip);
      return `<div class="breakdown-sub has-tip" data-tip="${tip}">
        <div class="breakdown-sub-label">${sub.label}<span class="tip-i" aria-hidden="true">?</span></div>
        <div class="breakdown-sub-value">${subAvg.toFixed(1)}</div>
        <div class="tip-bubble">${tip}</div>
      </div>`;
    }).join('')}</div>` : '';

    const metaTip = esc(meta.tip);
    return `<div class="card breakdown-section">
      <div class="card-title breakdown-header has-tip" data-tip="${metaTip}">
        <span class="index-color-dot" style="background:${meta.color}"></span>
        ${meta.label}<span class="tip-i" aria-hidden="true">?</span>
        <span class="breakdown-score" style="color:${meta.color}">${overallScore.toFixed(1)}</span>
        <div class="tip-bubble tip-bubble-wide">${metaTip}</div>
      </div>
      ${subsHtml}
      <div style="margin-top:12px; height:200px; position:relative">
        <canvas id="chart-trend-${meta.key}"></canvas>
      </div>
    </div>`;
  }).join('');

  // Render trend charts
  INDEX_META.forEach(meta => {
    const key = meta.key;
    if (charts['trend_' + key]) charts['trend_' + key].destroy();
    const labels = trend.months.map(m => sbAPI.formatMonth(m));
    charts['trend_' + key] = new Chart(document.getElementById('chart-trend-' + key), {
      type: 'line',
      data: {
        labels,
        datasets: [{
        label: meta.label,
        data: trend[key],
        borderColor: meta.color,
        backgroundColor: meta.color + '15',
        pointBackgroundColor: meta.color,
        pointRadius: 4,
        tension: 0.3,
        borderWidth: 2,
        fill: true,
      }],
      },
      options: chartOpts(),
    });
  });
}

function renderKabTable(scores) {
  // Aggregate per kabupaten
  const kabMap = {};
  scores.forEach(s => {
    const kab = s.schools?.kabupaten_kota || 'Unknown';
    if (!kabMap[kab]) {
      kabMap[kab] = { kab, count: 0, sumA: 0, sumB: 0, sumC: 0, sumD: 0, sumE: 0, sumFinal: 0 };
    }
    const k = kabMap[kab];
    k.count++;
    k.sumA += s.index_a || 0;
    k.sumB += s.index_b || 0;
    k.sumC += s.index_c || 0;
    k.sumD += s.index_d || 0;
    k.sumE += s.index_e || 0;
    k.sumFinal += s.final_score || 0;
  });

  const badge = lvl => {
    const cls = lvl === 'Baik' ? 'badge-baik' : lvl === 'Sedang' ? 'badge-sedang' : 'badge-kurang';
    return `<span class="badge ${cls}">${lvl}</span>`;
  };

  const rows = Object.values(kabMap).map(k => {
    const c = k.count || 1;
    const fs = k.sumFinal / c;
    const lvl = fs > 75 ? 'Baik' : fs >= 40 ? 'Sedang' : 'Kurang';
    return `<tr>
      <td><strong>${k.kab}</strong></td>
      <td>${k.count}</td>
      <td><strong>${fs.toFixed(1)}</strong></td>
      <td>${(k.sumA / c).toFixed(1)}</td>
      <td>${(k.sumB / c).toFixed(1)}</td>
      <td>${(k.sumC / c).toFixed(1)}</td>
      <td>${(k.sumD / c).toFixed(1)}</td>
      <td>${(k.sumE / c).toFixed(1)}</td>
      <td>${badge(lvl)}</td>
    </tr>`;
  }).join('');

  document.getElementById('kab-table-body').innerHTML = rows;
}
