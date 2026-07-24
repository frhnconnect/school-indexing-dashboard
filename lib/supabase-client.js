// Supabase Client — konfigurasi koneksi
// Ganti URL & ANON KEY dengan project Supabase Anda

const SUPABASE_URL = 'https://lxcilwofomteokxbaunx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4Y2lsd29mb210ZW9reGJhdW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NTQ0NDcsImV4cCI6MjEwMDQzMDQ0N30.VDAXjYIbvC_WXOk3ANVuWJtMcYmM-3owUq-ZG26d1Wk';

// Initialize Supabase client (menggunakan supabase-js dari CDN)
// supabase-js di-load di HTML sebelum file ini
let _sbClient = null;

try {
  if (typeof window.supabase !== 'undefined' && !SUPABASE_URL.includes('YOUR_PROJECT')) {
    _sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.warn('Supabase belum dikonfigurasi. Running in demo mode. Edit lib/supabase-client.js untuk koneksi real.');
  }
} catch (e) {
  console.warn('Supabase init gagal, running in demo mode:', e.message);
  _sbClient = null;
}

// ─── Constants ───

var DEMO_PROVINSI = [
  { code: 'bali', name: 'Bali', available: true },
  { code: 'dki-jakarta', name: 'DKI Jakarta', available: true },
  { code: 'jawa-barat', name: 'Jawa Barat', available: true },
  { code: 'jawa-tengah', name: 'Jawa Tengah', available: true },
  { code: 'diy', name: 'DI Yogyakarta', available: true },
  { code: 'jawa-timur', name: 'Jawa Timur', available: true },
  { code: 'banten', name: 'Banten', available: true },
  { code: 'sumatera-utara', name: 'Sumatera Utara', available: true },
  { code: 'sulawesi-selatan', name: 'Sulawesi Selatan', available: true },
  { code: 'kalimantan-timur', name: 'Kalimantan Timur', available: true },
];

// Flat list of all kabupaten across all provinsi (untuk backward-compat dengan getKabList)
var DEMO_KABS = [
  // Bali
  'Denpasar', 'Badung', 'Gianyar', 'Tabanan', 'Klungkung', 'Bangli', 'Buleleng', 'Jembrana',
  // DKI Jakarta
  'Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara',
  // Jawa Barat
  'Bandung', 'Bekasi', 'Depok', 'Bogor', 'Cimahi',
  // Jawa Tengah
  'Semarang', 'Surakarta', 'Magelang', 'Tegal', 'Pekalongan',
  // DI Yogyakarta
  'Yogyakarta', 'Sleman', 'Bantul', 'Kulon Progo', 'Gunungkidul',
  // Jawa Timur
  'Surabaya', 'Malang', 'Sidoarjo', 'Gresik', 'Mojokerto',
  // Banten
  'Serang', 'Tangerang', 'Cilegon', 'Pandeglang', 'Lebak',
  // Sumatera Utara
  'Medan', 'Binjai', 'Pematangsiantar', 'Tebing Tinggi', 'Deli Serdang',
  // Sulawesi Selatan
  'Makassar', 'Parepare', 'Palopo', 'Maros', 'Gowa',
  // Kalimantan Timur
  'Samarinda', 'Balikpapan', 'Bontang', 'Kutai Kartanegara', 'Pasir',
];

// Mapping provinsi code → array of kabupaten names
var DEMO_PROVINSI_KABS = {
  'bali': ['Denpasar', 'Badung', 'Gianyar', 'Tabanan', 'Klungkung', 'Bangli', 'Buleleng', 'Jembrana'],
  'dki-jakarta': ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara'],
  'jawa-barat': ['Bandung', 'Bekasi', 'Depok', 'Bogor', 'Cimahi'],
  'jawa-tengah': ['Semarang', 'Surakarta', 'Magelang', 'Tegal', 'Pekalongan'],
  'diy': ['Yogyakarta', 'Sleman', 'Bantul', 'Kulon Progo', 'Gunungkidul'],
  'jawa-timur': ['Surabaya', 'Malang', 'Sidoarjo', 'Gresik', 'Mojokerto'],
  'banten': ['Serang', 'Tangerang', 'Cilegon', 'Pandeglang', 'Lebak'],
  'sumatera-utara': ['Medan', 'Binjai', 'Pematangsiantar', 'Tebing Tinggi', 'Deli Serdang'],
  'sulawesi-selatan': ['Makassar', 'Parepare', 'Palopo', 'Maros', 'Gowa'],
  'kalimantan-timur': ['Samarinda', 'Balikpapan', 'Bontang', 'Kutai Kartanegara', 'Pasir'],
};

// Total sekolah per provinsi (sumber Dapodik) — denominator adopsi KP.
// ponytail: demo constants, ganti dengan query tabel wilayah saat koneksi real.
var DEMO_WILAYAH_TOTAL = {
  'bali': { SD: 200, SMP: 200, SMA: 200 },
  'dki-jakarta': { SD: 500, SMP: 400, SMA: 350 },
  'jawa-barat': { SD: 1200, SMP: 900, SMA: 700 },
  'jawa-tengah': { SD: 1100, SMP: 850, SMA: 650 },
  'diy': { SD: 350, SMP: 250, SMA: 200 },
  'jawa-timur': { SD: 1300, SMP: 950, SMA: 750 },
  'banten': { SD: 600, SMP: 450, SMA: 350 },
  'sumatera-utara': { SD: 700, SMP: 500, SMA: 400 },
  'sulawesi-selatan': { SD: 650, SMP: 480, SMA: 380 },
  'kalimantan-timur': { SD: 300, SMP: 220, SMA: 180 },
};

// Reverse lookup: kabupaten name → provinsi code
var DEMO_KAB_PROV = {};
(function() {
  for (var pcode in DEMO_PROVINSI_KABS) {
    DEMO_PROVINSI_KABS[pcode].forEach(function(kab) {
      DEMO_KAB_PROV[kab] = pcode;
    });
  }
})();

// Helper: get provinsi name from code
function provinsiName(pcode) {
  var p = DEMO_PROVINSI.find(function(x) { return x.code === pcode; });
  return p ? p.name : pcode;
}

var DEMO_KEC = {
  // Bali
  'Denpasar': ['Denpasar Selatan', 'Denpasar Barat', 'Denpasar Utara', 'Denpasar Timur'],
  'Badung': ['Kuta', 'Kuta Utara', 'Kuta Selatan', 'Mengwi', 'Abiansemal', 'Petang'],
  'Gianyar': ['Gianyar', 'Sukawati', 'Ubud', 'Blahbatuh', 'Tampaksiring', 'Tegallalang'],
  'Tabanan': ['Tabanan', 'Kediri', 'Marga', 'Penebel', 'Baturiti', 'Selemadeg'],
  'Klungkung': ['Klungkung', 'Banjarangkan', 'Dawan', 'Nusa Penida'],
  'Bangli': ['Bangli', 'Kintamani', 'Susut', 'Tembuku'],
  'Buleleng': ['Singaraja', 'Buleleng', 'Gerokgak', 'Kubutambahan', 'Sawan', 'Seririt'],
  'Jembrana': ['Negara', 'Melaya', 'Mendoyo', 'Pekutatan'],
  // DKI Jakarta
  'Jakarta Pusat': ['Gambir', 'Tanah Abang', 'Menteng', 'Senen', 'Cempaka Putih'],
  'Jakarta Selatan': ['Kebayoran Baru', 'Cilandak', 'Pasar Minggu', 'Jagakarsa', 'Mampang Prapatan'],
  'Jakarta Barat': ['Kebon Jeruk', 'Palmerah', 'Grogol Petamburan', 'Tambora', 'Kembangan'],
  'Jakarta Timur': ['Matraman', 'Pulo Gadung', 'Jatinegara', 'Duren Sawit', 'Cakung'],
  'Jakarta Utara': ['Tanjung Priok', 'Koja', 'Kelapa Gading', 'Pademangan', 'Penjaringan'],
  // Jawa Barat
  'Bandung': ['Bandung Wetan', 'Coblong', 'Cidadap', 'Sukajadi', 'Regol', 'Bandung Kulon'],
  'Bekasi': ['Bekasi Barat', 'Bekasi Timur', 'Bekasi Selatan', 'Bekasi Utara', 'Rawalumbu'],
  'Depok': ['Pancoran Mas', 'Beji', 'Sukmajaya', 'Cimanggis', 'Limo'],
  'Bogor': ['Bogor Tengah', 'Bogor Utara', 'Bogor Selatan', 'Bogor Barat', 'Bogor Timur'],
  'Cimahi': ['Cimahi Selatan', 'Cimahi Tengah', 'Cimahi Utara'],
  // Jawa Tengah
  'Semarang': ['Semarang Tengah', 'Semarang Utara', 'Semarang Selatan', 'Semarang Barat', 'Semarang Timur'],
  'Surakarta': ['Banjarsari', 'Jebres', 'Laweyan', 'Pasar Kliwon', 'Serengan'],
  'Magelang': ['Magelang Selatan', 'Magelang Utara', 'Magelang Tengah', 'Magelang Timur'],
  'Tegal': ['Tegal Selatan', 'Tegal Timur', 'Tegal Barat', 'Margadana'],
  'Pekalongan': ['Pekalongan Utara', 'Pekalongan Selatan', 'Pekalongan Barat', 'Pekalongan Timur'],
  // DI Yogyakarta
  'Yogyakarta': ['Gondokusuman', 'Danurejan', 'Jetis', 'Mantrijeron', 'Kraton', 'Wirobrajan'],
  'Sleman': ['Sleman', 'Godean', 'Minggir', 'Moyudan', 'Kalasan', 'Depok'],
  'Bantul': ['Bantul', 'Sewon', 'Kasihan', 'Banguntapan', 'Pleret', 'Jetis'],
  'Kulon Progo': ['Wates', 'Sentolo', 'Pengasih', 'Lendah', 'Temon'],
  'Gunungkidul': ['Wonosari', 'Playen', 'Semanu', 'Karangmojo', 'Nglipar'],
  // Jawa Timur
  'Surabaya': ['Genteng', 'Tegalsari', 'Wonokromo', 'Rungkut', 'Sukolilo', 'Tambaksari'],
  'Malang': ['Klojen', 'Sukun', 'Blimbing', 'Kedungkandang', 'Lowokwaru'],
  'Sidoarjo': ['Sidoarjo', 'Waru', 'Tanggulangin', 'Candi', 'Buduran'],
  'Gresik': ['Gresik', 'Manyar', 'Menganti', 'Kebomas', 'Wringinanom'],
  'Mojokerto': ['Mojokerto', 'Prajekan', 'Kranggan', 'Magersari'],
  // Banten
  'Serang': ['Serang', 'Cipocok Jaya', 'Curug', 'Walantaka', 'Taktakan'],
  'Tangerang': ['Tangerang', 'Ciledug', 'Pinang', 'Batu Ceper', 'Jatiuwung'],
  'Cilegon': ['Cilegon', 'Ciwandan', 'Jombang', 'Pulomerak'],
  'Pandeglang': ['Pandeglang', 'Majasari', 'Kaduhejo', 'Sobang'],
  'Lebak': ['Rangkasbitung', 'Maja', 'Cipanas', 'Cikulur', 'Muncang'],
  // Sumatera Utara
  'Medan': ['Medan Kota', 'Medan Petisah', 'Medan Baru', 'Medan Polonia', 'Medan Amplas'],
  'Binjai': ['Binjai Kota', 'Binjai Utara', 'Binjai Selatan', 'Binjai Barat'],
  'Pematangsiantar': ['Siantar Timur', 'Siantar Barat', 'Siantar Utara', 'Siantar Selatan'],
  'Tebing Tinggi': ['Tebing Tinggi Kota', 'Rantauprapat', 'Bajenis'],
  'Deli Serdang': ['Belawan', 'Percut Sei Tuan', 'Sunggal', 'Tanjung Morawa', 'Lubuk Pakam'],
  // Sulawesi Selatan
  'Makassar': ['Mariso', 'Mamajang', 'Tamalate', 'Rappocini', 'Bontoala', 'Ujung Pandang'],
  'Parepare': ['Parepare', 'Bacukiki', 'Soreang'],
  'Palopo': ['Palopo Barat', 'Palopo Utara', 'Palopo Timur', 'Tellu Wanua'],
  'Maros': ['Mandai', 'Marusu', 'Bantimurung', 'Simbang', 'Camba'],
  'Gowa': ['Somba Opu', 'Bontomarannu', 'Pallangga', 'Bajeng', 'Tombolopao'],
  // Kalimantan Timur
  'Samarinda': ['Samarinda Ulu', 'Samarinda Ilir', 'Samarinda Kota', 'Samarinda Seberang', 'Palaran'],
  'Balikpapan': ['Balikpapan Selatan', 'Balikpapan Utara', 'Balikpapan Tengah', 'Balikpapan Barat', 'Balikpapan Timur'],
  'Bontang': ['Bontang Utara', 'Bontang Selatan', 'Bontang Barat'],
  'Kutai Kartanegara': ['Tenggarong', 'Loa Janan', 'Sanga-Sanga', 'Muara Jawa', 'Sebulu'],
  'Pasir': ['Tanah Grogot', 'Long Ikis', 'Batu Sopang', 'Muara Samu'],
};

var DEMO_JENJANG = ['SD', 'SMP', 'SMA'];

// ─── Tahun Pelajaran (Jul–Jun) ───
// Format: "2025/2026" = Jul 2025 s/d Jun 2026
// Internal month keys tetap pakai "YYYY-MM" untuk kompatibilitas

var DEMO_TAHUN_AJARAN = [
  { code: '2024/2025', label: 'Tahun Ajaran 2024/2025', startMonth: '2024-07', endMonth: '2025-06' },
  { code: '2025/2026', label: 'Tahun Ajaran 2025/2026', startMonth: '2025-07', endMonth: '2026-06' },
];

// Bulan dalam tahun ajaran (Jul→Jun)
var TA_MONTH_ORDER = ['07', '08', '09', '10', '11', '12', '01', '02', '03', '04', '05', '06'];

// Bulan dalam Bahasa Indonesia
var MONTH_NAMES_ID = {
  '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
  '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
  '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember'
};

function getTahunAjaran(monthStr) {
  var parts = monthStr.split('-');
  var year = parseInt(parts[0], 10);
  var month = parts[1];
  if (parseInt(month, 10) >= 7) {
    return year + '/' + (year + 1);
  } else {
    return (year - 1) + '/' + year;
  }
}

function getMonthsForTahunAjaran(taCode) {
  var ta = DEMO_TAHUN_AJARAN.find(function(t) { return t.code === taCode; });
  if (!ta) return [];
  var startYear = parseInt(ta.startMonth.split('-')[0], 10);
  var months = [];
  for (var i = 0; i < TA_MONTH_ORDER.length; i++) {
    var m = TA_MONTH_ORDER[i];
    var year = parseInt(m, 10) >= 7 ? startYear : startYear + 1;
    months.push(year + '-' + m);
  }
  return months;
}

function getAvailableTahunAjaran() {
  return DEMO_TAHUN_AJARAN;
}

function formatMonthID(monthStr) {
  var parts = monthStr.split('-');
  var year = parts[0];
  var monthNum = parts[1];
  var ta = getTahunAjaran(monthStr);
  return (MONTH_NAMES_ID[monthNum] || monthNum) + ' ' + year + ' (TA ' + ta + ')';
}

// ─── API helpers ───

/**
 * Ambil daftar bulan yang tersedia di database.
 */
// ─── CSV import (localStorage) ───
// ponytail: browser-only; demo seed stays in memory always. Switch source, don't delete demo.
var IMPORT_KEY = 'si_import_scores_v2';
var WILAYAH_KEY = 'si_import_wilayah_v1';
var SOURCE_KEY = 'si_data_source_v1'; // 'demo' | 'import'
var _importCache = null;
var _wilayahCache = null;

function loadImport() {
  if (_importCache) return _importCache;
  try {
    var raw = localStorage.getItem(IMPORT_KEY);
    if (!raw) return null;
    _importCache = JSON.parse(raw);
    return _importCache;
  } catch (e) {
    return null;
  }
}

function saveImport(payload) {
  localStorage.setItem(IMPORT_KEY, JSON.stringify(payload));
  _importCache = payload;
}

function loadWilayahImport() {
  if (_wilayahCache) return _wilayahCache;
  try {
    var raw = localStorage.getItem(WILAYAH_KEY);
    if (!raw) return null;
    _wilayahCache = JSON.parse(raw);
    return _wilayahCache;
  } catch (e) {
    return null;
  }
}

function saveWilayahImport(payload) {
  localStorage.setItem(WILAYAH_KEY, JSON.stringify(payload));
  _wilayahCache = payload;
}

function clearImportStore() {
  localStorage.removeItem(IMPORT_KEY);
  localStorage.removeItem(WILAYAH_KEY);
  _importCache = null;
  _wilayahCache = null;
  try { localStorage.setItem(SOURCE_KEY, 'demo'); } catch (e) {}
}

/** Active feed: demo seed always available; import only when chosen + present. */
function getDataSource() {
  var saved = null;
  try { saved = localStorage.getItem(SOURCE_KEY); } catch (e) {}
  if (saved === 'import' && loadImport()) return 'import';
  if (saved === 'demo') return 'demo';
  // default: prefer import if uploaded, else demo (or supabase later)
  return loadImport() ? 'import' : 'demo';
}

function setDataSource(src) {
  if (src !== 'demo' && src !== 'import') throw new Error('source harus demo atau import');
  if (src === 'import' && !loadImport()) throw new Error('Belum ada data import. Upload CSV dulu.');
  try { localStorage.setItem(SOURCE_KEY, src); } catch (e) {}
  return getDataSource();
}

function useImport() {
  return getDataSource() === 'import' && !!loadImport();
}

function applyModeUI() {
  var src = getDataSource();
  var banner = document.getElementById('warn-banner');
  var card = document.getElementById('demo-card');
  var text = banner && banner.querySelector('.warn-banner-text');
  var title = card && card.querySelector('.demo-card-title');
  var desc = card && card.querySelector('.demo-card-desc');
  var link = card && card.querySelector('.demo-card-link');
  if (src === 'import') {
    if (banner) banner.style.display = 'flex';
    if (text) text.textContent = 'Mode Real (Import CSV) — data dari file upload di browser. Demo tetap tersedia di menu Import Data.';
    if (card) {
      card.classList.add('show');
      if (title) title.textContent = 'Mode Real';
      if (desc) desc.textContent = 'Import aktif. Ganti ke Mode Demo kapan saja tanpa hapus file.';
      if (link) { link.textContent = 'Buka Import Data →'; link.href = 'import-data.html'; }
    }
  } else if (!_sbClient) {
    if (banner) banner.style.display = 'flex';
    if (text) text.textContent = 'Mode Demo — data sample. Upload CSV di Import Data untuk Mode Real.';
    if (card) {
      card.classList.add('show');
      if (title) title.textContent = 'Mode Demo';
      if (desc) desc.textContent = 'Data sample ditampilkan. Import CSV atau hubungkan Supabase untuk data real.';
      if (link) { link.textContent = 'Import Data →'; link.href = 'import-data.html'; }
    }
  }
}

function parseCSV(text) {
  // ponytail: no quoted commas — keep template clean
  var lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(function(l) { return l.trim().length; });
  if (lines.length < 2) throw new Error('CSV kosong atau hanya header');
  var headers = lines[0].split(',').map(function(h) { return h.trim(); });
  var required = ['month', 'school_code', 'school_name', 'jenjang', 'kabupaten_kota', 'provinsi', 'provinsi_code'];
  for (var r = 0; r < required.length; r++) {
    if (headers.indexOf(required[r]) < 0) throw new Error('Kolom wajib hilang: ' + required[r]);
  }
  var rows = [];
  for (var i = 1; i < lines.length; i++) {
    var cols = lines[i].split(',');
    if (cols.length < headers.length) continue;
    var obj = {};
    for (var c = 0; c < headers.length; c++) obj[headers[c]] = (cols[c] || '').trim();
    if (!obj.month || !obj.school_code) continue;
    rows.push(obj);
  }
  if (!rows.length) throw new Error('Tidak ada baris data valid');
  return rows;
}

function num(v, fallback) {
  if (v === '' || v == null) return fallback != null ? fallback : NaN;
  var n = parseFloat(v);
  return isNaN(n) ? (fallback != null ? fallback : 0) : n;
}

function avg4(a, b, c, d) {
  return Math.round(((a + b + c + d) / 4) * 100) / 100;
}

function hasSubMetrics(obj) {
  return obj.a1_literasi !== undefined && obj.a1_literasi !== ''
    || obj.b_avg_max !== undefined && obj.b_avg_max !== ''
    || obj.c1_login !== undefined && obj.c1_login !== ''
    || obj.e_student_reg !== undefined && obj.e_student_reg !== '';
}

function hasRawCounts(obj) {
  return (obj.c_total_teachers !== undefined && obj.c_total_teachers !== '')
    || (obj.d_total_students !== undefined && obj.d_total_students !== '')
    || (obj.c_login_count !== undefined && obj.c_login_count !== '');
}

function rowToScore(obj) {
  // ponytail: 1.Raw export has a1–a5 + count cols; convert counts→% before sub path
  if (hasRawCounts(obj)) {
    var totT = num(obj.c_total_teachers, 0);
    var totS = num(obj.d_total_students, 0);
    function rate(n, d) { return d > 0 ? Math.round((num(n, 0) / d) * 1000) / 10 : 0; }
    obj = Object.assign({}, obj, {
      c1_login: rate(obj.c_login_count, totT),
      c2_assign: rate(obj.c_assign_count, totT),
      c3_content: rate(obj.c_content_count, totT),
      c4_ai: rate(obj.c_ai_count, totT),
      d1_login: rate(obj.d_login_count, totS),
      d2_attempt: rate(obj.d_attempt_count, totS),
      d3_content: rate(obj.d_content_count, totS),
      d4_ai: rate(obj.d_ai_count, totS),
      e_student_reg: obj.e_student_reg,
      e_student_real: obj.e_student_real || totS,
      e_teacher_reg: obj.e_teacher_reg,
      e_teacher_needed: obj.e_teacher_needed || totT,
    });
  }
  var a, b, c, d, e;
  var a1, a2, a3, a4, a5, bmax, bmin, bgap, c1, c2, c3, c4, d1, d2, d3, d4;
  var sReg, sReal, tReg, tNeed;

  if (hasSubMetrics(obj)) {
    // Full path: sub-metrics → indexes (same as Excel template)
    a1 = num(obj.a1_literasi, 0);
    a2 = num(obj.a2_numerasi, 0);
    a3 = num(obj.a3_sains, 0);
    a4 = num(obj.a4_sosial, 0);
    a5 = num(obj.a5_karakter, 0);
    a = Math.round(((a1 + a2 + a3 + a4 + a5) / 5) * 100) / 100;

    bmax = num(obj.b_avg_max, 0);
    bmin = num(obj.b_avg_min, 0);
    bgap = num(obj.b_avg_gap, 0);
    b = Math.round(((bmax + bmin + (100 - bgap)) / 3) * 100) / 100;

    c1 = num(obj.c1_login, 0);
    c2 = num(obj.c2_assign, 0);
    c3 = num(obj.c3_content, 0);
    c4 = num(obj.c4_ai, 0);
    c = avg4(c1, c2, c3, c4);

    d1 = num(obj.d1_login, 0);
    d2 = num(obj.d2_attempt, 0);
    d3 = num(obj.d3_content, 0);
    d4 = num(obj.d4_ai, 0);
    d = avg4(d1, d2, d3, d4);

    sReg = num(obj.e_student_reg, 0);
    sReal = num(obj.e_student_real, 0);
    tReg = num(obj.e_teacher_reg, 0);
    tNeed = num(obj.e_teacher_needed, 0);
    var eStud = sReal > 0 ? Math.min(sReg / sReal, 1) * 100 : 100;
    var eTeach = tNeed > 0 ? Math.min(tReg / tNeed, 1) * 100 : 100;
    e = Math.round(((eStud + eTeach) / 2) * 100) / 100;
  } else {
    // Legacy: precomputed index_a…e
    a = num(obj.index_a, 0);
    b = num(obj.index_b, 0);
    c = num(obj.index_c, 0);
    d = num(obj.index_d, 0);
    e = num(obj.index_e, 0);
    a1 = a2 = a3 = a4 = a5 = a;
    bmax = b; bmin = b; bgap = 0;
    c1 = c2 = c3 = c4 = c;
    d1 = d2 = d3 = d4 = d;
    sReg = num(obj.total_students, 0);
    sReal = sReg;
    tReg = num(obj.total_teachers, 0);
    tNeed = tReg;
  }

  var finalScore = (obj.final_score !== '' && obj.final_score != null && !isNaN(parseFloat(obj.final_score)))
    ? num(obj.final_score)
    : Math.round(((a + b + c + d + e) / 5) * 100) / 100;
  var level = finalScore > 75 ? 'Baik' : finalScore >= 40 ? 'Sedang' : 'Kurang';
  var thr = 20;
  var impl = (a >= thr ? 1 : 0) + (b >= thr ? 1 : 0) + (c >= thr ? 1 : 0) + (d >= thr ? 1 : 0) + (e >= thr ? 1 : 0);
  var is_active = impl >= 4;
  var eRatio = sReal > 0 ? Math.min(sReg / sReal, 1) : 1;

  return {
    school_code: obj.school_code,
    month: obj.month,
    schools: {
      school_name: obj.school_name,
      jenjang: obj.jenjang,
      kabupaten_kota: obj.kabupaten_kota,
      kecamatan: obj.kecamatan || '',
      provinsi: obj.provinsi,
      provinsi_code: obj.provinsi_code,
    },
    indexes_implemented: impl,
    is_active: is_active,
    active_reason: is_active
      ? ('Sekolah aktif: ' + impl + '/5 index dilaksanakan')
      : ('Sekolah tidak aktif: hanya ' + impl + '/5 index dilaksanakan'),
    total_students: sReal || num(obj.total_students, 0),
    total_teachers: tNeed || num(obj.total_teachers, 0),
    index_a: a,
    index_a_literasi: a1,
    index_a_numerasi: a2,
    index_a_sains: a3,
    index_a_sosial: a4,
    index_a_karakter: a5,
    index_b: b,
    index_b_avg_max: bmax,
    index_b_avg_min: bmin,
    index_b_gap: bgap,
    index_c: c,
    index_c_guru_aktif: c1,
    index_c_guru_assign: c2,
    index_c_guru_content: c3,
    index_c_guru_ai: c4,
    index_d: d,
    index_d_siswa_aktif: d1,
    index_d_siswa_attend: d2,
    index_d_siswa_content: d3,
    index_d_siswa_ai: d4,
    index_e: e,
    index_e_registered: sReg,
    index_e_target: sReal,
    index_e_ratio: Math.round(eRatio * 100) / 100,
    final_score: finalScore,
    level: level,
  };
}

function importFromCSV(text) {
  var rawRows = parseCSV(text);
  var byMonth = {};
  var schools = {};
  var flat = [];
  for (var i = 0; i < rawRows.length; i++) {
    var s = rowToScore(rawRows[i]);
    flat.push(s);
    if (!byMonth[s.month]) byMonth[s.month] = [];
    byMonth[s.month].push(s);
    schools[s.school_code] = true;
  }
  var months = Object.keys(byMonth).sort();
  for (var m = 0; m < months.length; m++) {
    byMonth[months[m]].sort(function(a, b) { return b.final_score - a.final_score; });
  }
  var payload = {
    byMonth: byMonth,
    months: months,
    rowCount: rawRows.length,
    schoolCount: Object.keys(schools).length,
    importedAt: new Date().toISOString(),
  };
  // Prefer Supabase when wired — shared data; localStorage only offline fallback
  if (_sbClient) {
    return upsertScoresToSupabase(flat).then(function(r) {
      // clear local override so all clients/pages read DB
      try { localStorage.removeItem(IMPORT_KEY); } catch (e) {}
      _importCache = null;
      try { localStorage.setItem(SOURCE_KEY, 'demo'); } catch (e) {} // 'demo' key = not local import; sb path used
      return {
        rowCount: payload.rowCount,
        schoolCount: payload.schoolCount,
        months: months,
        target: 'supabase',
        schoolsUpserted: r.schools,
        scoresUpserted: r.scores,
      };
    });
  }
  saveImport(payload);
  setDataSource('import');
  return Promise.resolve({
    rowCount: payload.rowCount,
    schoolCount: payload.schoolCount,
    months: months,
    target: 'local',
  });
}

async function upsertScoresToSupabase(flat) {
  // dedupe schools
  var schoolMap = {};
  var scoreRows = [];
  for (var i = 0; i < flat.length; i++) {
    var s = flat[i];
    schoolMap[s.school_code] = {
      school_code: s.school_code,
      school_name: s.schools.school_name,
      jenjang: s.schools.jenjang,
      kabupaten_kota: s.schools.kabupaten_kota,
      kecamatan: s.schools.kecamatan || null,
      provinsi: s.schools.provinsi,
      provinsi_code: s.schools.provinsi_code,
    };
    scoreRows.push({
      school_code: s.school_code,
      month: s.month,
      index_a: s.index_a,
      index_a_literasi: s.index_a_literasi,
      index_a_numerasi: s.index_a_numerasi,
      index_a_sains: s.index_a_sains,
      index_a_sosial: s.index_a_sosial,
      index_a_karakter: s.index_a_karakter,
      index_b: s.index_b,
      index_b_avg_max: s.index_b_avg_max,
      index_b_avg_min: s.index_b_avg_min,
      index_b_gap: s.index_b_gap,
      index_c: s.index_c,
      index_c_guru_aktif: s.index_c_guru_aktif,
      index_c_guru_assign: s.index_c_guru_assign,
      index_c_guru_content: s.index_c_guru_content,
      index_c_guru_ai: s.index_c_guru_ai,
      index_d: s.index_d,
      index_d_siswa_aktif: s.index_d_siswa_aktif,
      index_d_siswa_attend: s.index_d_siswa_attend,
      index_d_siswa_content: s.index_d_siswa_content,
      index_d_siswa_ai: s.index_d_siswa_ai,
      index_e: s.index_e,
      index_e_registered: s.index_e_registered,
      index_e_target: s.index_e_target,
      index_e_ratio: s.index_e_ratio,
      final_score: s.final_score,
      level: s.level,
      total_students: s.total_students,
      total_teachers: s.total_teachers,
      is_active: s.is_active,
      indexes_implemented: s.indexes_implemented,
      active_reason: s.active_reason,
    });
  }
  var schoolList = Object.values(schoolMap);
  // chunk upserts
  async function chunkedUpsert(table, rows, onConflict, size) {
    var n = 0;
    for (var i = 0; i < rows.length; i += size) {
      var chunk = rows.slice(i, i + size);
      var res = await _sbClient.from(table).upsert(chunk, { onConflict: onConflict });
      if (res.error) throw new Error(table + ': ' + res.error.message);
      n += chunk.length;
    }
    return n;
  }
  var sn = await chunkedUpsert('schools', schoolList, 'school_code', 100);
  var sc = await chunkedUpsert('monthly_scores', scoreRows, 'school_code,month', 100);
  return { schools: sn, scores: sc };
}

/** Dapodik-style totals: provinsi_code,jenjang,total_sekolah[,kabupaten_kota,total_sekolah_kab] */
function importWilayahCSV(text) {
  var lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(function(l) { return l.trim().length; });
  if (lines.length < 2) throw new Error('CSV wilayah kosong');
  var headers = lines[0].split(',').map(function(h) { return h.trim(); });
  var need = ['provinsi_code', 'jenjang', 'total_sekolah'];
  for (var i = 0; i < need.length; i++) {
    if (headers.indexOf(need[i]) < 0) throw new Error('Kolom wilayah wajib hilang: ' + need[i]);
  }
  var byProv = {};
  var kabMap = {}; // pcode -> kab -> {SD,SMP,SMA}
  var rows = 0;
  for (var r = 1; r < lines.length; r++) {
    var cols = lines[r].split(',');
    if (cols.length < headers.length) continue;
    var obj = {};
    for (var c = 0; c < headers.length; c++) obj[headers[c]] = (cols[c] || '').trim();
    var pcode = obj.provinsi_code;
    var jj = obj.jenjang;
    if (!pcode || !jj) continue;
    if (!byProv[pcode]) byProv[pcode] = { SD: 0, SMP: 0, SMA: 0 };
    byProv[pcode][jj] = num(obj.total_sekolah, 0);
    var kab = obj.kabupaten_kota;
    if (kab) {
      if (!kabMap[pcode]) kabMap[pcode] = {};
      if (!kabMap[pcode][kab]) kabMap[pcode][kab] = { SD: 0, SMP: 0, SMA: 0 };
      // optional per-kab total; fallback empty = use estimate later
      if (obj.total_sekolah_kab !== undefined && obj.total_sekolah_kab !== '') {
        kabMap[pcode][kab][jj] = num(obj.total_sekolah_kab, 0);
      }
    }
    rows++;
  }
  if (!rows) throw new Error('Tidak ada baris wilayah valid');
  var payload = { byProv: byProv, kab: kabMap, rowCount: rows, importedAt: new Date().toISOString() };
  saveWilayahImport(payload);
  return { rowCount: rows, provCount: Object.keys(byProv).length };
}

async function getAvailableMonths() {
  if (useImport()) {
    var imp = loadImport();
    return imp.months.slice().reverse();
  }
  if (!_sbClient) return demoMonths();
  const { data, error } = await _sbClient
    .from('monthly_scores')
    .select('month')
    .order('month', { ascending: false });
  if (error) throw error;
  return [...new Set(data.map(r => r.month))];
}

/**
 * Ambil semua scores untuk bulan tertentu, join dengan schools.
 */
async function getScoresForMonth(month) {
  if (useImport()) {
    var imp = loadImport();
    if (imp.byMonth && imp.byMonth[month]) return imp.byMonth[month].slice();
    return []; // import mode: missing month = empty (not demo mix)
  }
  if (!_sbClient) return demoScores(month);
  try {
    const { data, error } = await _sbClient
      .from('monthly_scores')
      .select(`
        *,
        schools:school_code (school_name, jenjang, kabupaten_kota, kecamatan, provinsi, provinsi_code)
      `)
      .eq('month', month)
      .order('final_score', { ascending: false });
    if (error) throw error;
    // ponytail: empty remote → demo seed so UI never 0 after partial seed
    if (!data || !data.length) return demoScores(month);
    // normalize: ensure schools.provinsi_code always set for filters
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      if (row.schools && !row.schools.provinsi_code) {
        row.schools.provinsi_code = DEMO_KAB_PROV[row.schools.kabupaten_kota] || null;
      }
    }
    return data;
  } catch (e) {
    console.warn('Supabase getScoresForMonth failed, demo fallback:', e.message || e);
    return demoScores(month);
  }
}

/**
 * Ambil detail satu sekolah (semua bulan untuk sparkline).
 */
async function getSchoolHistory(schoolCode) {
  if (!_sbClient) return [];
  const { data, error } = await _sbClient
    .from('monthly_scores')
    .select('*')
    .eq('school_code', schoolCode)
    .order('month', { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Ambil ringkasan per jenjang untuk bulan tertentu (via view).
 */
async function getMonthlySummary(month) {
  if (!_sbClient) return [];
  const { data, error } = await _sbClient
    .from('v_monthly_summary')
    .select('*')
    .eq('month', month);
  if (error) throw error;
  return data;
}

// ─── Demo data (fallback ketika Supabase belum dikonfigurasi) ───
// Seed-based supaya data konsisten antar bulan (trend terlihat)
// Generate 300 sekolah secara programatik (8 kabupaten Bali, 3 jenjang)
// Jenjang punya base score berbeda: SD ~45-65, SMP ~55-75, SMA ~35-55
// Trend per bulan juga berbeda per jenjang

// Base score offset per jenjang
var JENJANG_BASE = { SD: 50, SMP: 62, SMA: 42 };
// Trend per bulan per jenjang (point per bulan)
var JENJANG_TREND = { SD: 2.5, SMP: 4.0, SMA: 5.5 };

// Per-provinsi base score offset & trend multiplier supaya grafik provinsi berbeda
var PROV_OFFSET = {
  'bali': 0,
  'dki-jakarta': 8,
  'jawa-barat': 6,
  'jawa-tengah': 4,
  'diy': 7,
  'jawa-timur': 5,
  'banten': -2,
  'sumatera-utara': -3,
  'sulawesi-selatan': -1,
  'kalimantan-timur': -4,
};
var PROV_TREND_MULT = {
  'bali': 1.0,
  'dki-jakarta': 1.25,
  'jawa-barat': 1.2,
  'jawa-tengah': 1.1,
  'diy': 1.15,
  'jawa-timur': 1.18,
  'banten': 0.9,
  'sumatera-utara': 0.85,
  'sulawesi-selatan': 0.92,
  'kalimantan-timur': 0.8,
};

// Per-kabupaten offset & trend multiplier supaya grafik kabupaten berbeda
// Bali entries preserved; non-Bali entries fall back to 0 / 1.0
var KAB_OFFSET = {
  'Denpasar': 6, 'Badung': 4, 'Gianyar': 0, 'Tabanan': -2,
  'Klungkung': -3, 'Bangli': -5, 'Buleleng': -7, 'Jembrana': -8,
  // DKI Jakarta
  'Jakarta Pusat': 5, 'Jakarta Selatan': 3, 'Jakarta Barat': 1, 'Jakarta Timur': -1, 'Jakarta Utara': 0,
  // Jawa Barat
  'Bandung': 4, 'Bekasi': 2, 'Depok': 3, 'Bogor': 1, 'Cimahi': -2,
  // Jawa Tengah
  'Semarang': 3, 'Surakarta': 4, 'Magelang': -1, 'Tegal': -3, 'Pekalongan': -2,
  // DI Yogyakarta
  'Yogyakarta': 5, 'Sleman': 3, 'Bantul': 0, 'Kulon Progo': -2, 'Gunungkidul': -3,
  // Jawa Timur
  'Surabaya': 6, 'Malang': 3, 'Sidoarjo': 2, 'Gresik': -1, 'Mojokerto': -2,
  // Banten
  'Serang': 0, 'Tangerang': 2, 'Cilegon': 1, 'Pandeglang': -4, 'Lebak': -5,
  // Sumatera Utara
  'Medan': 3, 'Binjai': -1, 'Pematangsiantar': -2, 'Tebing Tinggi': -3, 'Deli Serdang': 0,
  // Sulawesi Selatan
  'Makassar': 2, 'Parepare': -2, 'Palopo': -4, 'Maros': -1, 'Gowa': 0,
  // Kalimantan Timur
  'Samarinda': 1, 'Balikpapan': 3, 'Bontang': 0, 'Kutai Kartanegara': -2, 'Pasir': -4,
};
var KAB_TREND_MULT = {
  'Denpasar': 1.3, 'Badung': 1.15, 'Gianyar': 1.0, 'Tabanan': 0.95,
  'Klungkung': 0.9, 'Bangli': 0.8, 'Buleleng': 0.7, 'Jembrana': 0.65,
  // DKI Jakarta
  'Jakarta Pusat': 1.2, 'Jakarta Selatan': 1.25, 'Jakarta Barat': 1.1, 'Jakarta Timur': 1.05, 'Jakarta Utara': 1.0,
  // Jawa Barat
  'Bandung': 1.2, 'Bekasi': 1.15, 'Depok': 1.1, 'Bogor': 1.05, 'Cimahi': 0.95,
  // Jawa Tengah
  'Semarang': 1.1, 'Surakarta': 1.15, 'Magelang': 0.9, 'Tegal': 0.85, 'Pekalongan': 0.88,
  // DI Yogyakarta
  'Yogyakarta': 1.2, 'Sleman': 1.1, 'Bantul': 0.95, 'Kulon Progo': 0.85, 'Gunungkidul': 0.8,
  // Jawa Timur
  'Surabaya': 1.25, 'Malang': 1.1, 'Sidoarjo': 1.08, 'Gresik': 0.95, 'Mojokerto': 0.9,
  // Banten
  'Serang': 1.0, 'Tangerang': 1.1, 'Cilegon': 1.05, 'Pandeglang': 0.8, 'Lebak': 0.75,
  // Sumatera Utara
  'Medan': 1.1, 'Binjai': 0.9, 'Pematangsiantar': 0.85, 'Tebing Tinggi': 0.8, 'Deli Serdang': 1.0,
  // Sulawesi Selatan
  'Makassar': 1.1, 'Parepare': 0.9, 'Palopo': 0.8, 'Maros': 0.92, 'Gowa': 0.95,
  // Kalimantan Timur
  'Samarinda': 1.05, 'Balikpapan': 1.1, 'Bontang': 1.0, 'Kutai Kartanegara': 0.85, 'Pasir': 0.75,
};

function buildDemoSchools() {
  var schools = [];
  var idx = 1;
  for (var p = 0; p < DEMO_PROVINSI.length; p++) {
    var prov = DEMO_PROVINSI[p];
    var pcode = prov.code;
    var kabs = DEMO_PROVINSI_KABS[pcode] || [];
    for (var k = 0; k < kabs.length; k++) {
      var kab = kabs[k];
      var kecs = DEMO_KEC[kab] || [kab];
      for (var j = 0; j < DEMO_JENJANG.length; j++) {
        var jenjang = DEMO_JENJANG[j];
        // ~7-9 sekolah per jenjang per kabupaten → 100-200 per provinsi
        var count = 7 + (k % 3); // 7, 8, or 9
        for (var n = 1; n <= count; n++) {
          // Code format: ProvCode-NN (e.g. BALI-0001, DKI-0001)
          var codePrefix = pcode.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4) || 'PROV';
          var code = codePrefix + '-' + String(idx).padStart(4, '0');
          var name = jenjang + ' Negeri ' + n + ' ' + kab;
          var kec = kecs[(n - 1) % kecs.length];
          var baseOffset = ((idx * 17 + k * 11 + j * 23) % 20) - 10; // -10 to +10
          var provOffset = PROV_OFFSET[pcode] || 0;
          var base = JENJANG_BASE[jenjang] + baseOffset + provOffset;
          // ~20% sekolah inactive: tandai dengan flag, index C/D/E akan di-nol-kan
          var inactiveFlag = seededRandom(idx * 3 + 7) > 0.55;

          // Deterministic seeded assessments — ~60% aktif, 40% inaktif
          var aSeed = idx * 7 + 3;
          var tsGanjil = seededRandom(aSeed) > 0.35;      // ~65% true
          var asGanjil = seededRandom(aSeed + 1) > 0.35;  // ~65% true
          var tsGenap = seededRandom(aSeed + 2) > 0.35;   // ~65% true
          var akhirTahun = seededRandom(aSeed + 3) > 0.45; // ~55% true
          var assessments = {
            ts_ganjil: tsGanjil,
            as_ganjil: asGanjil,
            ts_genap: tsGenap,
            akhir_tahun: akhirTahun,
          };

          schools.push({
            code: code,
            name: name,
            jenjang: jenjang,
            kab: kab,
            kec: kec,
            provinsi: prov.name,
            provinsi_code: pcode,
            base: base,
            assessments: assessments,
            inactive_flag: inactiveFlag,
            total_students: 80 + Math.floor(seededRandom(idx * 5 + 1) * 220),   // 80–300
            total_teachers: 8 + Math.floor(seededRandom(idx * 5 + 2) * 22),      // 8–30
          });
          idx++;
        }
      }
    }
  }
  return schools;
}

var DEMO_SEED_SCHOOLS = buildDemoSchools();

function demoMonths() {
  // Default: tahun ajaran 2025/2026 (Jul 2025 – Jun 2026)
  return getMonthsForTahunAjaran('2025/2026');
}

function seededRandom(seed) {
  var x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function demoScores(month) {
  // Parse month index untuk trend berdasarkan urutan tahun ajaran (Jul=0, Aug=1, ..., Jun=11)
  var monthNum = parseInt(month.split('-')[1], 10);
  var monthIdx = TA_MONTH_ORDER.indexOf(String(monthNum).padStart(2, '0'));

  var schools = [];

  for (var i = 0; i < DEMO_SEED_SCHOOLS.length; i++) {
    var s = DEMO_SEED_SCHOOLS[i];
    var seed = i + 1;
    var noise = (seededRandom(seed * 100 + monthIdx) - 0.5) * 8; // ±4 variance

    // Trend bonus berbeda per jenjang + per kabupaten + per provinsi
    var kabTrendMult = KAB_TREND_MULT[s.kab] || 1.0;
    var provTrendMult = PROV_TREND_MULT[s.provinsi_code] || 1.0;
    var kabOffset = KAB_OFFSET[s.kab] || 0;
    var trendBonus = JENJANG_TREND[s.jenjang] * monthIdx * kabTrendMult * provTrendMult;
    var kabBase = s.base + kabOffset;

    var finalScore = Math.round(Math.max(20, Math.min(95, kabBase + trendBonus + noise)) * 100) / 100;
    var level = finalScore > 75 ? 'Baik' : finalScore >= 40 ? 'Sedang' : 'Kurang';

    var idxBase = kabBase + trendBonus;

    var indexC = Math.round(Math.max(5, Math.min(95, idxBase * 0.85 + noise)) * 100) / 100;
    var indexD = Math.round(Math.max(5, Math.min(95, idxBase * 0.9 + noise)) * 100) / 100;
    var indexERegistered = Math.floor(50 + (idxBase / 100) * 150);
    var indexETarget = 200;
    var indexERatio = indexERegistered / indexETarget;

    // Active/inactive: minimal 4 dari 5 index (A-E) dilaksanakan
    // "Dilaksanakan" = index score >= 20 (threshold minimal partisipasi)
    var indexThreshold = 20;
    var indexesImplemented = 0;
    var index_a_val = Math.round(Math.max(5, Math.min(95, idxBase * 0.95 + noise)) * 100) / 100;
    var index_b_val = Math.round(Math.max(5, Math.min(95, idxBase * 0.9 + noise)) * 100) / 100;
    var index_c_val = indexC;
    var index_d_val = indexD;
    var index_e_val = Math.round(Math.max(5, Math.min(100, Math.min((idxBase + trendBonus * 2) / 100, 1) * 100)) * 100) / 100;

    // Inactive schools: degrade ALL indexes significantly (not just zero some)
    // Active schools keep normal values; inactive schools get much lower scores
    if (s.inactive_flag) {
      // Zero out 2-3 random indexes (below threshold 20)
      var skipSeed = seededRandom(seed * 13 + 5);
      if (skipSeed > 0.6) index_a_val = 0;
      else if (skipSeed > 0.3) index_b_val = 0;
      else index_c_val = 0;
      // Always skip one more
      if (seededRandom(seed * 17 + 9) > 0.5) index_d_val = 0;
      else index_e_val = 0;

      // Degrade remaining non-zero indexes to 30-50% of original (well below active)
      var degradeFactor = 0.35 + seededRandom(seed * 19 + 3) * 0.15; // 0.35-0.50
      if (index_a_val > 0) index_a_val = Math.round(index_a_val * degradeFactor * 100) / 100;
      if (index_b_val > 0) index_b_val = Math.round(index_b_val * degradeFactor * 100) / 100;
      if (index_c_val > 0) index_c_val = Math.round(index_c_val * degradeFactor * 100) / 100;
      if (index_d_val > 0) index_d_val = Math.round(index_d_val * degradeFactor * 100) / 100;
      if (index_e_val > 0) index_e_val = Math.round(index_e_val * degradeFactor * 100) / 100;

      // Also degrade final score
      finalScore = Math.round(Math.max(10, Math.min(40, finalScore * degradeFactor)) * 100) / 100;
      level = finalScore > 75 ? 'Baik' : finalScore >= 40 ? 'Sedang' : 'Kurang';
    }

    if (index_a_val >= indexThreshold) indexesImplemented++;
    if (index_b_val >= indexThreshold) indexesImplemented++;
    if (index_c_val >= indexThreshold) indexesImplemented++;
    if (index_d_val >= indexThreshold) indexesImplemented++;
    if (index_e_val >= indexThreshold) indexesImplemented++;

    var is_active = indexesImplemented >= 4;

    var reasons = [];
    if (index_a_val < indexThreshold) reasons.push('Index A < 20 (' + index_a_val + ')');
    if (index_b_val < indexThreshold) reasons.push('Index B < 20 (' + index_b_val + ')');
    if (index_c_val < indexThreshold) reasons.push('Index C < 20 (' + index_c_val + ')');
    if (index_d_val < indexThreshold) reasons.push('Index D < 20 (' + index_d_val + ')');
    if (index_e_val < indexThreshold) reasons.push('Index E < 20 (' + index_e_val + ')');
    var active_reason = is_active
      ? 'Sekolah aktif: ' + indexesImplemented + '/5 index dilaksanakan'
      : 'Sekolah tidak aktif: hanya ' + indexesImplemented + '/5 index dilaksanakan. ' + reasons.join('; ');

    schools.push({
      school_code: s.code,
      month: month,
      schools: {
        school_name: s.name,
        jenjang: s.jenjang,
        kabupaten_kota: s.kab,
        kecamatan: s.kec,
        provinsi: s.provinsi,
        provinsi_code: s.provinsi_code,
      },
      assessments: s.assessments,
      indexes_implemented: indexesImplemented,
      is_active: is_active,
      active_reason: active_reason,
      total_students: s.total_students || 0,
      total_teachers: s.total_teachers || 0,
      index_a: index_a_val,
      index_a_literasi: Math.round(Math.max(20, Math.min(95, idxBase + noise + 5)) * 100) / 100,
      index_a_numerasi: Math.round(Math.max(20, Math.min(95, idxBase + noise - 5)) * 100) / 100,
      index_a_sains: Math.round(Math.max(20, Math.min(95, idxBase + noise - 8)) * 100) / 100,
      index_a_sosial: Math.round(Math.max(20, Math.min(95, idxBase + noise + 3)) * 100) / 100,
      index_a_karakter: Math.round(Math.max(20, Math.min(95, idxBase + noise + 8)) * 100) / 100,
      index_b: index_b_val,
      index_b_avg_max: Math.round(Math.max(50, Math.min(98, idxBase + 20 + noise)) * 100) / 100,
      index_b_avg_min: Math.round(Math.max(20, Math.min(70, idxBase - 20 + noise)) * 100) / 100,
      index_b_gap: Math.round((15 + Math.abs(noise) * 2) * 100) / 100,
      index_c: index_c_val,
      index_c_guru_aktif: Math.round(Math.max(5, Math.min(95, idxBase * 0.9 + noise + 3)) * 100) / 100,
      index_c_guru_assign: Math.round(Math.max(5, Math.min(95, idxBase * 0.82 + noise - 2)) * 100) / 100,
      index_c_guru_content: Math.round(Math.max(5, Math.min(95, idxBase * 0.78 + noise - 5)) * 100) / 100,
      index_c_guru_ai: Math.round(Math.max(5, Math.min(95, idxBase * 0.7 + noise - 8)) * 100) / 100,
      index_d: index_d_val,
      index_d_siswa_aktif: Math.round(Math.max(5, Math.min(95, idxBase * 0.88 + noise + 2)) * 100) / 100,
      index_d_siswa_attend: Math.round(Math.max(5, Math.min(95, idxBase * 0.8 + noise - 3)) * 100) / 100,
      index_d_siswa_content: Math.round(Math.max(5, Math.min(95, idxBase * 0.75 + noise - 6)) * 100) / 100,
      index_d_siswa_ai: Math.round(Math.max(5, Math.min(95, idxBase * 0.65 + noise - 10)) * 100) / 100,
      index_e: index_e_val,
      index_e_registered: indexERegistered,
      index_e_target: indexETarget,
      index_e_ratio: Math.round(indexERatio * 100) / 100,
      final_score: finalScore,
      level: level
    });
  }
  return schools.sort(function(a, b) { return b.final_score - a.final_score; });
}

/**
 * Ambil semua scores untuk SEMUA bulan (untuk trend charts).
 * Demo mode: generate dari semua bulan.
 */
async function getAllMonthsScores() {
  var months = await getAvailableMonths();
  var allData = [];
  for (var i = 0; i < months.length; i++) {
    var monthData = await getScoresForMonth(months[i]);
    allData = allData.concat(monthData);
  }
  return allData;
}

// Export untuk digunakan di halaman lain
// Raw API + convenience wrappers for dashboard pages
window.sbAPI = {
  // ─ Raw API ─
  getAvailableMonths,
  getScoresForMonth,
  getSchoolHistory,
  getMonthlySummary,
  getAllMonthsScores,
  isDemo: () => !_sbClient && !useImport(),
  getDataSource,
  setDataSource,
  applyModeUI,
  useImport,

  // ─ CSV import (localStorage) ─
  importCSV: importFromCSV,
  importWilayahCSV: importWilayahCSV,
  clearImport: clearImportStore,
  getImportMeta() {
    var imp = loadImport();
    var wil = loadWilayahImport();
    if (!imp && !wil) return null;
    return {
      rowCount: imp ? imp.rowCount : 0,
      schoolCount: imp ? imp.schoolCount : 0,
      months: imp ? (imp.months || []) : [],
      importedAt: imp ? imp.importedAt : null,
      active: useImport(),
      wilayahRows: wil ? wil.rowCount : 0,
      hasScores: !!imp,
      hasWilayah: !!wil,
    };
  },
  hasImport: () => !!loadImport() || !!loadWilayahImport(),

  // ─ Tahun Ajaran ─
  getTahunAjaranList: getAvailableTahunAjaran,
  getMonthsForTahunAjaran,
  getTahunAjaran,

  // ─ Constants ─
  PROVINSI: DEMO_PROVINSI,

  // ─ Helpers ─
  formatMonth: formatMonthID,

  /** Get available provinsi list */
  getProvinsi() {
    return DEMO_PROVINSI;
  },

  /** Get kecamatan list for a kabupaten */
  getKecamatan(kab) {
    return DEMO_KEC[kab] || [];
  },

  /** Get all kabupaten list, optionally filtered by provinsi code */
  getKabList(provinsiCode) {
    if (provinsiCode && DEMO_PROVINSI_KABS[provinsiCode]) {
      return DEMO_PROVINSI_KABS[provinsiCode];
    }
    return DEMO_KABS;
  },

  /** Get kabupaten list for a specific provinsi */
  getKabByProvinsi(provinsiCode) {
    return DEMO_PROVINSI_KABS[provinsiCode] || [];
  },

  /** Get provinsi code for a given kabupaten */
  getProvinsiByKab(kab) {
    return DEMO_KAB_PROV[kab] || null;
  },

  /**
     * Adopsi KP: pakai KP vs total wilayah (Dapodik), split per jenjang.
     * Real: KP from import scores; totals from wilayah CSV if present, else DEMO_WILAYAH_TOTAL.
     * kab.total: wilayah kab if present, else demo estimate.
     */
    getAdopsiKP(provinsiCode) {
      var pcode = provinsiCode || 'bali';
      var wImp = useImport() ? loadWilayahImport() : null;
      var wilayah = (wImp && wImp.byProv && wImp.byProv[pcode]) || DEMO_WILAYAH_TOTAL[pcode] || { SD: 0, SMP: 0, SMA: 0 };
      var kabTotals = (wImp && wImp.kab && wImp.kab[pcode]) || null;
      var schools = [];
      var imp = useImport() ? loadImport() : null;
      if (imp && imp.byMonth) {
        var seen = {};
        var months = imp.months || [];
        for (var mi = 0; mi < months.length; mi++) {
          var arr = imp.byMonth[months[mi]] || [];
          for (var si = 0; si < arr.length; si++) {
            var sc = arr[si];
            var pc = sc.schools && sc.schools.provinsi_code;
            if (pc !== pcode) continue;
            if (seen[sc.school_code]) continue;
            seen[sc.school_code] = true;
            schools.push({
              code: sc.school_code,
              jenjang: sc.schools.jenjang,
              kab: sc.schools.kabupaten_kota,
              provinsi_code: pc,
            });
          }
        }
      } else {
        schools = DEMO_SEED_SCHOOLS.filter(function(s) { return s.provinsi_code === pcode; });
      }
      var byJenjang = { SD: 0, SMP: 0, SMA: 0 };
      var kabJj = {};
      for (var i = 0; i < schools.length; i++) {
        var s = schools[i];
        byJenjang[s.jenjang] = (byJenjang[s.jenjang] || 0) + 1;
        if (!kabJj[s.kab]) kabJj[s.kab] = { SD: 0, SMP: 0, SMA: 0 };
        kabJj[s.kab][s.jenjang] = (kabJj[s.kab][s.jenjang] || 0) + 1;
      }
      var kpTotal = schools.length;
      var wilayahTotal = (wilayah.SD || 0) + (wilayah.SMP || 0) + (wilayah.SMA || 0);
      var jenjang = ['SD', 'SMP', 'SMA'].map(function(jj) {
        var kp = byJenjang[jj] || 0;
        var total = wilayah[jj] || 0;
        var kab = Object.keys(kabJj).map(function(name) {
          var kKp = kabJj[name][jj] || 0;
          var kTotal;
          if (kabTotals && kabTotals[name] && kabTotals[name][jj] > 0) {
            kTotal = Math.max(kKp, kabTotals[name][jj]);
          } else {
            // ponytail: no kab master → estimate 25–80% rate for ranking only
            var seed = name.length * 97 + (name.charCodeAt(0) || 0) * 13 + jj.charCodeAt(0) * 7;
            var rate = 0.25 + seededRandom(seed) * 0.55;
            kTotal = Math.max(kKp, Math.round(kKp / rate) || 0);
          }
          return {
            kab: name,
            kp: kKp,
            total: kTotal,
            gap: kTotal - kKp,
            pct: kTotal ? Math.round(kKp / kTotal * 1000) / 10 : 0,
          };
        }).sort(function(a, b) { return a.pct - b.pct; });
        return {
          jenjang: jj,
          kp: kp,
          total: total,
          gap: Math.max(0, total - kp),
          pct: total ? Math.round(kp / total * 1000) / 10 : 0,
          kab: kab,
        };
      });
      return {
        kpTotal: kpTotal,
        wilayahTotal: wilayahTotal,
        gap: Math.max(0, wilayahTotal - kpTotal),
        pct: wilayahTotal ? Math.round(kpTotal / wilayahTotal * 1000) / 10 : 0,
        jenjang: jenjang,
        wilayahSource: (wImp && wImp.byProv && wImp.byProv[pcode]) ? 'import' : 'demo',
      };
    },

  /** Get all kecamatan across all kabupaten */
  getAllKecamatan() {
    var all = [];
    for (var kab in DEMO_KEC) {
      DEMO_KEC[kab].forEach(function(kec) {
        all.push({ kec: kec, kab: kab });
      });
    }
    return all;
  },

  // ─ Wrappers for dashboard pages ─

  /** Overview page: getMonths */
  async getMonths() {
    return await getAvailableMonths();
  },

  /** Overview page: aggregated data for KPIs, charts. Optional provinsiCode filter. */
  async getOverview(month, provinsiCode) {
    const allScores = await getScoresForMonth(month);
    const scores = provinsiCode
      ? allScores.filter(s => (s.schools?.provinsi_code || s.provinsi_code) === provinsiCode)
      : allScores;
    const totalSchools = scores.length;

    const levelCount = { baik: 0, sedang: 0, kurang: 0 };
    let sumScore = 0;
    const jenjangMap = {};

    scores.forEach(s => {
      const lvl = s.level || (s.final_score > 75 ? 'Baik' : s.final_score >= 40 ? 'Sedang' : 'Kurang');
      if (lvl === 'Baik') levelCount.baik++;
      else if (lvl === 'Sedang') levelCount.sedang++;
      else levelCount.kurang++;

      sumScore += s.final_score;

      const jj = s.schools?.jenjang || 'SD';
      if (!jenjangMap[jj]) {
        jenjangMap[jj] = { jenjang: jj, count: 0, scores: [], avgA: 0, avgB: 0, avgC: 0, avgD: 0, avgE: 0, levelCount: { baik: 0, sedang: 0, kurang: 0 } };
      }
      jenjangMap[jj].count++;
      jenjangMap[jj].scores.push(s.final_score);
      jenjangMap[jj].avgA += s.index_a || 0;
      jenjangMap[jj].avgB += s.index_b || 0;
      jenjangMap[jj].avgC += s.index_c || 0;
      jenjangMap[jj].avgD += s.index_d || 0;
      jenjangMap[jj].avgE += s.index_e || 0;
      if (lvl === 'Baik') jenjangMap[jj].levelCount.baik++;
      else if (lvl === 'Sedang') jenjangMap[jj].levelCount.sedang++;
      else jenjangMap[jj].levelCount.kurang++;
    });

    const jenjang = Object.values(jenjangMap).map(j => {
      const c = j.count || 1;
      j.avgScore = j.scores.reduce((a, b) => a + b, 0) / c;
      j.avgA /= c; j.avgB /= c; j.avgC /= c; j.avgD /= c; j.avgE /= c;
      return j;
    }).sort((a, b) => a.jenjang.localeCompare(b.jenjang));

    return {
      totalSchools,
      avgScore: totalSchools ? sumScore / totalSchools : 0,
      levelCount,
      jenjang,
      topSchools: scores.slice(0, 5),
      bottomSchools: scores.slice(-5).reverse(),
    };
  },

  /** Overview page: aggregated annual data for TA. Aggregates all 12 months, averages per school. */
  async getSchoolsAnnual(taCode, provinsiCode) {
    var months = getMonthsForTahunAjaran(taCode);
    // Collect all monthly scores per school
    var schoolMap = {};
    for (var i = 0; i < months.length; i++) {
      var m = months[i];
      var monthly = await getScoresForMonth(m);
      for (var j = 0; j < monthly.length; j++) {
        var s = monthly[j];
        var pcode = s.schools?.provinsi_code || s.provinsi_code;
        if (provinsiCode && pcode !== provinsiCode) continue;
        var code = s.school_code;
        if (!schoolMap[code]) {
          schoolMap[code] = {
            school_code: code,
            school_name: s.schools?.school_name || 'Unknown',
            jenjang: s.schools?.jenjang || 'SD',
            kabupaten_kota: s.schools?.kabupaten_kota || '',
            kecamatan: s.schools?.kecamatan || '',
            final_score: 0,
            index_a: 0, index_b: 0, index_c: 0, index_d: 0, index_e: 0,
            is_active: true,
            total_students: s.total_students || 0,
            total_teachers: s.total_teachers || 0,
            monthCount: 0,
            activeCount: 0,
          };
        }
        var sc = schoolMap[code];
        sc.final_score += s.final_score || 0;
        sc.index_a += s.index_a || 0;
        sc.index_b += s.index_b || 0;
        sc.index_c += s.index_c || 0;
        sc.index_d += s.index_d || 0;
        sc.index_e += s.index_e || 0;
        sc.monthCount++;
        if (s.is_active) sc.activeCount++;
      }
    }
    // Average per school across months
    return Object.values(schoolMap).map(function(sc) {
      var n = sc.monthCount || 1;
      sc.final_score = Math.round((sc.final_score / n) * 100) / 100;
      sc.index_a = Math.round((sc.index_a / n) * 100) / 100;
      sc.index_b = Math.round((sc.index_b / n) * 100) / 100;
      sc.index_c = Math.round((sc.index_c / n) * 100) / 100;
      sc.index_d = Math.round((sc.index_d / n) * 100) / 100;
      sc.index_e = Math.round((sc.index_e / n) * 100) / 100;
      // Active if active in >= 75% of months
      sc.is_active = sc.activeCount >= Math.ceil(n * 0.75);
      return sc;
    }).sort(function(a, b) { return b.final_score - a.final_score; });
  },

  /** School detail page: get all schools for a month. Optional provinsiCode filter. */
  async getSchools(month, provinsiCode) {
    const allScores = await getScoresForMonth(month);
    const scores = provinsiCode
      ? allScores.filter(s => (s.schools?.provinsi_code || s.provinsi_code) === provinsiCode)
      : allScores;
    return scores.map(s => ({
      school_code: s.school_code,
      school_name: s.schools?.school_name || 'Unknown',
      jenjang: s.schools?.jenjang || 'SD',
      kabupaten_kota: s.schools?.kabupaten_kota || '',
      kecamatan: s.schools?.kecamatan || '',
      final_score: s.final_score,
      level: s.level,
      is_active: s.is_active,
      indexes_implemented: s.indexes_implemented,
      total_students: s.total_students || 0,
      total_teachers: s.total_teachers || 0,
      index_a: s.index_a, index_b: s.index_b, index_c: s.index_c, index_d: s.index_d, index_e: s.index_e,
    }));
  },

  /**
   * Page 2: Jenjang detail — aggregate per jenjang for a month.
   * Returns: { totalSchools, totalStudents, totalTeachers, indexTotal, indexA, indexB, indexC, indexD, indexE, kabupaten: [{kab, totalSchools, totalStudents, totalTeachers, indexTotal, indexA-E, level}] }
   */
  async getJenjangDetail(month, jenjang, provinsiCode) {
    const allScores = await getScoresForMonth(month);
    const scores = allScores.filter(s =>
      (s.schools?.jenjang === jenjang) &&
      (!provinsiCode || (s.schools?.provinsi_code || s.provinsi_code) === provinsiCode)
    );

    var totalStudents = 0, totalTeachers = 0;
    var sumA = 0, sumB = 0, sumC = 0, sumD = 0, sumE = 0, sumFinal = 0;
    var kabMap = {};

    scores.forEach(function(s) {
      var students = s.total_students || 0;
      var teachers = s.total_teachers || 0;
      var kab = s.schools?.kabupaten_kota || 'Unknown';

      totalStudents += students;
      totalTeachers += teachers;
      sumA += s.index_a || 0;
      sumB += s.index_b || 0;
      sumC += s.index_c || 0;
      sumD += s.index_d || 0;
      sumE += s.index_e || 0;
      sumFinal += s.final_score || 0;

      if (!kabMap[kab]) {
        kabMap[kab] = { kab: kab, totalSchools: 0, totalStudents: 0, totalTeachers: 0, sumA: 0, sumB: 0, sumC: 0, sumD: 0, sumE: 0, sumFinal: 0 };
      }
      var k = kabMap[kab];
      k.totalSchools++;
      k.totalStudents += students;
      k.totalTeachers += teachers;
      k.sumA += s.index_a || 0;
      k.sumB += s.index_b || 0;
      k.sumC += s.index_c || 0;
      k.sumD += s.index_d || 0;
      k.sumE += s.index_e || 0;
      k.sumFinal += s.final_score || 0;
    });

    var n = scores.length || 1;
    var kabupaten = Object.values(kabMap).map(function(k) {
      var c = k.totalSchools || 1;
      var indexTotal = k.sumFinal / c;
      return {
        kab: k.kab,
        totalSchools: k.totalSchools,
        totalStudents: k.totalStudents,
        totalTeachers: k.totalTeachers,
        indexTotal: indexTotal,
        indexA: k.sumA / c,
        indexB: k.sumB / c,
        indexC: k.sumC / c,
        indexD: k.sumD / c,
        indexE: k.sumE / c,
        level: indexTotal > 75 ? 'Baik' : indexTotal >= 40 ? 'Sedang' : 'Kurang',
      };
    }).sort(function(a, b) { return b.indexTotal - a.indexTotal; });

    var indexTotal = sumFinal / n;
    return {
      totalSchools: scores.length,
      totalStudents: totalStudents,
      totalTeachers: totalTeachers,
      indexTotal: indexTotal,
      indexA: sumA / n,
      indexB: sumB / n,
      indexC: sumC / n,
      indexD: sumD / n,
      indexE: sumE / n,
      level: indexTotal > 75 ? 'Baik' : indexTotal >= 40 ? 'Sedang' : 'Kurang',
      kabupaten: kabupaten,
    };
  },

  /**
   * Page 2: Trend month-to-month for a jenjang.
   * Returns: { months: string[], indexTotal: number[], indexA: number[], ..., indexE: number[], kabupaten: [{kab, indexTotal: number[], indexA: number[], ..., indexE: number[]}] }
   */
  async getJenjangTrend(untilMonth, jenjang, provinsiCode) {
    const months = await getAvailableMonths();
    const sorted = [...months].sort();
    const filtered = untilMonth ? sorted.filter(m => m <= untilMonth) : sorted;

    var trendData = {
      months: filtered,
      indexTotal: [],
      indexA: [], indexB: [], indexC: [], indexD: [], indexE: [],
    };

    // Collect all kabupaten names first
    var kabNames = {};
    filtered.forEach(function(m) {
      // We'll build kabupaten trend lazily in a second pass
    });

    var kabTrend = {};

    for (var i = 0; i < filtered.length; i++) {
      var m = filtered[i];
      var detail = await this.getJenjangDetail(m, jenjang, provinsiCode);

      trendData.indexTotal.push(Math.round(detail.indexTotal * 10) / 10);
      trendData.indexA.push(Math.round(detail.indexA * 10) / 10);
      trendData.indexB.push(Math.round(detail.indexB * 10) / 10);
      trendData.indexC.push(Math.round(detail.indexC * 10) / 10);
      trendData.indexD.push(Math.round(detail.indexD * 10) / 10);
      trendData.indexE.push(Math.round(detail.indexE * 10) / 10);

      // Kabupaten trend
      detail.kabupaten.forEach(function(k) {
        if (!kabTrend[k.kab]) {
          kabTrend[k.kab] = { kab: k.kab, indexTotal: [], indexA: [], indexB: [], indexC: [], indexD: [], indexE: [] };
          // Backfill previous months with null
          for (var j = 0; j < i; j++) {
            kabTrend[k.kab].indexTotal.push(null);
            kabTrend[k.kab].indexA.push(null);
            kabTrend[k.kab].indexB.push(null);
            kabTrend[k.kab].indexC.push(null);
            kabTrend[k.kab].indexD.push(null);
            kabTrend[k.kab].indexE.push(null);
          }
        }
        kabTrend[k.kab].indexTotal.push(Math.round(k.indexTotal * 10) / 10);
        kabTrend[k.kab].indexA.push(Math.round(k.indexA * 10) / 10);
        kabTrend[k.kab].indexB.push(Math.round(k.indexB * 10) / 10);
        kabTrend[k.kab].indexC.push(Math.round(k.indexC * 10) / 10);
        kabTrend[k.kab].indexD.push(Math.round(k.indexD * 10) / 10);
        kabTrend[k.kab].indexE.push(Math.round(k.indexE * 10) / 10);
        kabNames[k.kab] = true;
      });

      // Backfill kabupaten that don't appear in this month
      Object.keys(kabTrend).forEach(function(kn) {
        if (kabTrend[kn].indexTotal.length < i + 1) {
          kabTrend[kn].indexTotal.push(null);
          kabTrend[kn].indexA.push(null);
          kabTrend[kn].indexB.push(null);
          kabTrend[kn].indexC.push(null);
          kabTrend[kn].indexD.push(null);
          kabTrend[kn].indexE.push(null);
        }
      });
    }

    trendData.kabupaten = Object.values(kabTrend);
    return trendData;
  },

  /** Trend: per jenjang across months (sampai untilMonth). Optional provinsiCode filter. */
  async getTrendJenjang(untilMonth, provinsiCode) {
    const months = await getAvailableMonths();
    const sorted = [...months].sort();
    const filtered = untilMonth ? sorted.filter(m => m <= untilMonth) : sorted;
    const jenjangList = ['SD', 'SMP', 'SMA'];
    const result = jenjangList.map(jj => ({ jenjang: jj, scores: [] }));

    for (const m of filtered) {
      const allScores = await getScoresForMonth(m);
      const scores = provinsiCode
        ? allScores.filter(s => (s.schools?.provinsi_code || s.provinsi_code) === provinsiCode)
        : allScores;
      jenjangList.forEach((jj, i) => {
        const fl = scores.filter(s => s.schools?.jenjang === jj);
        const avg = fl.length ? fl.reduce((a, s) => a + s.final_score, 0) / fl.length : 0;
        result[i].scores.push(Math.round(avg * 10) / 10);
      });
    }

    return { months: filtered, jenjang: result };
  },

  /** Trend: per kabupaten across months (sampai untilMonth). Optional provinsiCode filter. */
  async getTrendKab(untilMonth, provinsiCode) {
    const months = await getAvailableMonths();
    const sorted = [...months].sort();
    const filtered = untilMonth ? sorted.filter(m => m <= untilMonth) : sorted;
    const kabs = provinsiCode ? DEMO_PROVINSI_KABS[provinsiCode] || [] : DEMO_KABS;
    const result = kabs.map(k => ({ kab: k, scores: [] }));

    for (const m of filtered) {
      const allScores = await getScoresForMonth(m);
      const scores = provinsiCode
        ? allScores.filter(s => (s.schools?.provinsi_code || s.provinsi_code) === provinsiCode)
        : allScores;
      kabs.forEach((k, i) => {
        const fl = scores.filter(s => s.schools?.kabupaten_kota === k);
        const avg = fl.length ? fl.reduce((a, s) => a + s.final_score, 0) / fl.length : 0;
        result[i].scores.push(Math.round(avg * 10) / 10);
      });
    }

    return { months: filtered, kab: result };
  },

  /** Ranking: per kabupaten for a month. Optional provinsiCode filter. */
  async getKabRanking(month, provinsiCode) {
    const allScores = await getScoresForMonth(month);
    const scores = provinsiCode
      ? allScores.filter(s => (s.schools?.provinsi_code || s.provinsi_code) === provinsiCode)
      : allScores;
    const kabMap = {};

    scores.forEach(s => {
      const kab = s.schools?.kabupaten_kota || 'Unknown';
      if (!kabMap[kab]) {
        kabMap[kab] = { kab, count: 0, scores: [], indexA: 0, indexB: 0, indexC: 0, indexD: 0, indexE: 0 };
      }
      kabMap[kab].count++;
      kabMap[kab].scores.push(s.final_score);
      kabMap[kab].indexA += s.index_a || 0;
      kabMap[kab].indexB += s.index_b || 0;
      kabMap[kab].indexC += s.index_c || 0;
      kabMap[kab].indexD += s.index_d || 0;
      kabMap[kab].indexE += s.index_e || 0;
    });

    // Get previous month for trend
    const months = await getAvailableMonths();
    const sorted = [...months].sort();
    const monthIdx = sorted.indexOf(month);
    let prevAvg = null;
    if (monthIdx > 0) {
      const prevMonth = sorted[monthIdx - 1];
      const prevScores = await getScoresForMonth(prevMonth);
      prevAvg = prevScores.length ? prevScores.reduce((a, s) => a + s.final_score, 0) / prevScores.length : 0;
    }

    const currAvg = scores.length ? scores.reduce((a, s) => a + s.final_score, 0) / scores.length : 0;
    const trend = prevAvg !== null ? Math.round((currAvg - prevAvg) * 10) / 10 : 0;

    return Object.values(kabMap).map(k => {
      const c = k.count || 1;
      k.finalScore = k.scores.reduce((a, b) => a + b, 0) / c;
      k.indexA /= c; k.indexB /= c; k.indexC /= c; k.indexD /= c; k.indexE /= c;
      k.level = k.finalScore > 75 ? 'Baik' : k.finalScore >= 40 ? 'Sedang' : 'Kurang';
      k.trend = trend;
      return k;
    }).sort((a, b) => b.finalScore - a.finalScore);
  },

  /** Ranking: per kecamatan for a month */
  async getKecRanking(month) {
    const scores = await getScoresForMonth(month);
    const kecMap = {};

    scores.forEach(s => {
      const kec = s.schools?.kecamatan || 'Unknown';
      const kab = s.schools?.kabupaten_kota || '';
      if (!kecMap[kec]) {
        kecMap[kec] = { kec, kab, count: 0, scores: [], indexA: 0, indexB: 0, indexC: 0, indexD: 0, indexE: 0 };
      }
      kecMap[kec].count++;
      kecMap[kec].scores.push(s.final_score);
      kecMap[kec].indexA += s.index_a || 0;
      kecMap[kec].indexB += s.index_b || 0;
      kecMap[kec].indexC += s.index_c || 0;
      kecMap[kec].indexD += s.index_d || 0;
      kecMap[kec].indexE += s.index_e || 0;
    });

    // Get previous month for trend
    const months = await getAvailableMonths();
    const sorted = [...months].sort();
    const monthIdx = sorted.indexOf(month);
    let prevAvg = null;
    if (monthIdx > 0) {
      const prevMonth = sorted[monthIdx - 1];
      const prevScores = await getScoresForMonth(prevMonth);
      prevAvg = prevScores.length ? prevScores.reduce((a, s) => a + s.final_score, 0) / prevScores.length : 0;
    }

    const currAvg = scores.length ? scores.reduce((a, s) => a + s.final_score, 0) / scores.length : 0;
    const trend = prevAvg !== null ? Math.round((currAvg - prevAvg) * 10) / 10 : 0;

    return Object.values(kecMap).map(k => {
      const c = k.count || 1;
      k.finalScore = k.scores.reduce((a, b) => a + b, 0) / c;
      k.indexA /= c; k.indexB /= c; k.indexC /= c; k.indexD /= c; k.indexE /= c;
      k.level = k.finalScore > 75 ? 'Baik' : k.finalScore >= 40 ? 'Sedang' : 'Kurang';
      k.trend = trend;
      return k;
    }).sort((a, b) => b.finalScore - a.finalScore);
  },

  /** Breakdown page: get all data for a month */
  async getBreakdown(month) {
    const scores = await getScoresForMonth(month);

    // Aggregate per jenjang
    const jenjangMap = {};
    scores.forEach(s => {
      const jj = s.schools?.jenjang || 'SD';
      if (!jenjangMap[jj]) {
        jenjangMap[jj] = { jenjang: jj, count: 0, literasi: 0, numerasi: 0, sains: 0, sosial: 0, karakter: 0 };
      }
      jenjangMap[jj].count++;
      jenjangMap[jj].literasi += s.index_a_literasi || 0;
      jenjangMap[jj].numerasi += s.index_a_numerasi || 0;
      jenjangMap[jj].sains += s.index_a_sains || 0;
      jenjangMap[jj].sosial += s.index_a_sosial || 0;
      jenjangMap[jj].karakter += s.index_a_karakter || 0;
    });

    const jenjang = Object.values(jenjangMap).map(j => {
      const c = j.count || 1;
      j.literasi /= c; j.numerasi /= c; j.sains /= c; j.sosial /= c; j.karakter /= c;
      return j;
    }).sort((a, b) => a.jenjang.localeCompare(b.jenjang));

    // Aggregate per kecamatan
    const kecMap = {};
    scores.forEach(s => {
      const kec = s.schools?.kecamatan || 'Unknown';
      const kab = s.schools?.kabupaten_kota || '';
      if (!kecMap[kec]) {
        kecMap[kec] = { kec, kab, count: 0, literasi: 0, numerasi: 0, sains: 0, sosial: 0, karakter: 0, indexA: 0, indexB: 0, indexC: 0, indexD: 0, indexE: 0, finalScore: 0 };
      }
      kecMap[kec].count++;
      kecMap[kec].literasi += s.index_a_literasi || 0;
      kecMap[kec].numerasi += s.index_a_numerasi || 0;
      kecMap[kec].sains += s.index_a_sains || 0;
      kecMap[kec].sosial += s.index_a_sosial || 0;
      kecMap[kec].karakter += s.index_a_karakter || 0;
      kecMap[kec].indexA += s.index_a || 0;
      kecMap[kec].indexB += s.index_b || 0;
      kecMap[kec].indexC += s.index_c || 0;
      kecMap[kec].indexD += s.index_d || 0;
      kecMap[kec].indexE += s.index_e || 0;
      kecMap[kec].finalScore += s.final_score || 0;
    });

    const kecamatan = Object.values(kecMap).map(k => {
      const c = k.count || 1;
      k.literasi /= c; k.numerasi /= c; k.sains /= c; k.sosial /= c; k.karakter /= c;
      k.indexA /= c; k.indexB /= c; k.indexC /= c; k.indexD /= c; k.indexE /= c;
      k.finalScore /= c;
      k.level = k.finalScore > 75 ? 'Baik' : k.finalScore >= 40 ? 'Sedang' : 'Kurang';
      return k;
    }).sort((a, b) => a.kab.localeCompare(b.kab) || a.kec.localeCompare(b.kec));

    return { jenjang, kecamatan, schools: scores.map(s => ({
      ...s,
      school_name: s.schools?.school_name || 'Unknown',
      jenjang: s.schools?.jenjang || 'SD',
      kabupaten_kota: s.schools?.kabupaten_kota || '',
      kecamatan: s.schools?.kecamatan || '',
    })) };
  },

  // ─ National / multi-provinsi methods ─

  /**
   * National overview: aggregate semua provinsi untuk suatu bulan.
   * Returns: { nasional: {avgScore, totalSchools, activeCount, inactiveCount, ...},
   *            provinsi: [{code, name, count, avgScore, avgA..avgE, active, inactive, ...}] }
   */
  async getNationalOverview(month) {
    const scores = await getScoresForMonth(month);

    const provMap = {};
    let nasionalSum = 0;
    let nasionalActive = 0;
    let nasionalInactive = 0;

    scores.forEach(s => {
      const pcode = s.schools?.provinsi_code || DEMO_KAB_PROV[s.schools?.kabupaten_kota] || 'unknown';
      const pname = s.schools?.provinsi || provinsiName(pcode);
      if (!provMap[pcode]) {
        provMap[pcode] = {
          code: pcode, name: pname, count: 0,
          scores: [], indexA: 0, indexB: 0, indexC: 0, indexD: 0, indexE: 0,
          active: 0, inactive: 0,
        };
      }
      provMap[pcode].count++;
      provMap[pcode].scores.push(s.final_score);
      provMap[pcode].indexA += s.index_a || 0;
      provMap[pcode].indexB += s.index_b || 0;
      provMap[pcode].indexC += s.index_c || 0;
      provMap[pcode].indexD += s.index_d || 0;
      provMap[pcode].indexE += s.index_e || 0;
      if (s.is_active) { provMap[pcode].active++; nasionalActive++; }
      else { provMap[pcode].inactive++; nasionalInactive++; }
      nasionalSum += s.final_score;
    });

    const provinsi = Object.values(provMap).map(p => {
      const c = p.count || 1;
      p.avgScore = p.scores.reduce((a, b) => a + b, 0) / c;
      p.indexA /= c; p.indexB /= c; p.indexC /= c; p.indexD /= c; p.indexE /= c;
      p.level = p.avgScore > 75 ? 'Baik' : p.avgScore >= 40 ? 'Sedang' : 'Kurang';
      delete p.scores;
      return p;
    }).sort((a, b) => a.name.localeCompare(b.name));

    const totalSchools = scores.length;
    return {
      nasional: {
        totalSchools,
        avgScore: totalSchools ? nasionalSum / totalSchools : 0,
        activeCount: nasionalActive,
        inactiveCount: nasionalInactive,
        activeRate: totalSchools ? Math.round((nasionalActive / totalSchools) * 1000) / 10 : 0,
        provinsiCount: provinsi.length,
      },
      provinsi,
    };
  },

  /**
   * Provinsi ranking: ranking semua provinsi by avg score untuk suatu bulan.
   * Returns array sorted desc by avgScore, each with indexA-E, active/inactive counts, level.
   */
  async getProvinsiRanking(month) {
    const overview = await this.getNationalOverview(month);

    // Get previous month for trend
    const months = await getAvailableMonths();
    const sorted = [...months].sort();
    const monthIdx = sorted.indexOf(month);
    let prevAvg = null;
    if (monthIdx > 0) {
      const prevMonth = sorted[monthIdx - 1];
      const prevOverview = await this.getNationalOverview(prevMonth);
      prevAvg = prevOverview.nasional.avgScore;
    }
    const trend = prevAvg !== null ? Math.round((overview.nasional.avgScore - prevAvg) * 10) / 10 : 0;

    return overview.provinsi
      .map(p => ({ ...p, trend }))
      .sort((a, b) => b.avgScore - a.avgScore);
  },

  /**
   * Active/inactive stats per provinsi untuk suatu bulan.
   * Returns: { nasional: {total, active, inactive, activeRate}, provinsi: [{code, name, total, active, inactive, activeRate}] }
   */
  async getActiveInactiveStats(month) {
    const overview = await this.getNationalOverview(month);

    const provinsi = overview.provinsi.map(p => ({
      code: p.code,
      name: p.name,
      total: p.count,
      active: p.active,
      inactive: p.inactive,
      activeRate: p.count ? Math.round((p.active / p.count) * 1000) / 10 : 0,
    })).sort((a, b) => b.activeRate - a.activeRate);

    return {
      nasional: {
        total: overview.nasional.totalSchools,
        active: overview.nasional.activeCount,
        inactive: overview.nasional.inactiveCount,
        activeRate: overview.nasional.activeRate,
      },
      provinsi,
    };
  },
};
