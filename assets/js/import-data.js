/* import-data.js — scores → Supabase (preferred) / local fallback */

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAdmin()) return;
  document.getElementById('user-name').textContent = Auth.getUserName();
  if (Auth.applyNavRole) Auth.applyNavRole();
  if (sbAPI.applyModeUI) sbAPI.applyModeUI();
  refreshStatus();
  document.getElementById('file-input').addEventListener('change', e => onFile(e, 'scores'));
  document.getElementById('file-wilayah').addEventListener('change', e => onFile(e, 'wilayah'));
  document.getElementById('btn-clear').addEventListener('click', onClear);
  document.getElementById('btn-template').addEventListener('click', () => {
    window.location.href = 'templates/import-scores.csv';
  });
  document.getElementById('btn-template-wilayah').addEventListener('click', () => {
    window.location.href = 'templates/import-wilayah.csv';
  });
  document.getElementById('btn-source-demo').addEventListener('click', () => switchSource('demo'));
  document.getElementById('btn-source-import').addEventListener('click', () => switchSource('real'));
});

function switchSource(src) {
  const log = document.getElementById('import-log');
  try {
    if (src === 'real') {
      // prefer supabase when wired
      try { sbAPI.setDataSource('supabase'); }
      catch (e) { sbAPI.setDataSource('import'); }
      log.textContent = 'Mode Real aktif (Supabase/DB atau CSV lokal).';
    } else {
      sbAPI.setDataSource('demo');
      log.textContent = 'Mode Demo. Sample seed (hanya jika Supabase off).';
    }
    refreshStatus();
    if (sbAPI.applyModeUI) sbAPI.applyModeUI();
  } catch (err) {
    log.textContent = 'Error: ' + (err.message || err);
  }
}

function refreshStatus() {
  const st = document.getElementById('import-status');
  const src = sbAPI.getDataSource ? sbAPI.getDataSource() : 'demo';
  const meta = sbAPI.getImportMeta ? sbAPI.getImportMeta() : null;
  const btnDemo = document.getElementById('btn-source-demo');
  const btnImp = document.getElementById('btn-source-import');
  const isReal = src === 'import' || src === 'supabase';
  btnDemo.classList.toggle('active-source', !isReal);
  btnImp.classList.toggle('active-source', isReal);
  btnImp.disabled = false;
  document.getElementById('btn-clear').disabled = !(meta && (meta.target === 'local' || meta.hasWilayah));

  if (src === 'supabase') {
    const bits = [];
    if (meta && meta.rowCount) bits.push(`upload terakhir: ${meta.rowCount} baris / ${meta.schoolCount} sekolah`);
    if (meta && meta.months && meta.months.length) bits.push(`bulan ${meta.months.join(', ')}`);
    bits.push('sumber: Supabase');
    st.innerHTML = `<span class="status-dot green"></span> <strong>Mode Real (Supabase)</strong> — ${bits.join(' · ')}`;
    return;
  }
  if (src === 'import' && meta) {
    st.innerHTML = `<span class="status-dot green"></span> <strong>Mode Real (CSV lokal)</strong> — ${meta.rowCount} baris / ${meta.schoolCount} sekolah`;
    return;
  }
  st.innerHTML = `<span class="status-dot orange"></span> <strong>Mode Demo</strong> — sample. Upload CSV untuk tulis ke Supabase.`;
}

function onClear() {
  if (!confirm('Hapus import lokal di browser? Data Supabase tidak dihapus.')) return;
  sbAPI.clearImport();
  document.getElementById('import-log').textContent = 'Import lokal dihapus. Mode Real Supabase tetap jika DB connected.';
  refreshStatus();
  if (sbAPI.applyModeUI) sbAPI.applyModeUI();
}

function onFile(e, kind) {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file) return;
  const log = document.getElementById('import-log');
  log.textContent = 'Membaca…';
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      if (kind === 'wilayah') {
        const r = sbAPI.importWilayahCSV(reader.result);
        log.textContent = `OK wilayah (local): ${r.rowCount} baris, ${r.provCount} provinsi.`;
      } else {
        log.textContent = 'Upload ke Supabase…';
        const r = await sbAPI.importCSV(reader.result);
        log.textContent = r.target === 'supabase'
          ? `OK Supabase: ${r.rowCount} baris, ${r.schoolCount} sekolah → DB. Mode Real (Supabase).`
          : `OK local: ${r.rowCount} baris, ${r.schoolCount} sekolah. Mode Real (CSV lokal).`;
      }
      refreshStatus();
      if (sbAPI.applyModeUI) sbAPI.applyModeUI();
    } catch (err) {
      log.textContent = 'Error: ' + (err.message || err);
    }
  };
  reader.onerror = () => { log.textContent = 'Gagal baca file.'; };
  reader.readAsText(file);
}
