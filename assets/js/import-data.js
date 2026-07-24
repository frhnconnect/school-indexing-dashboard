/* import-data.js — scores + wilayah CSV, Demo/Real switch */

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
  document.getElementById('btn-source-import').addEventListener('click', () => switchSource('import'));
});

function switchSource(src) {
  const log = document.getElementById('import-log');
  try {
    sbAPI.setDataSource(src);
    log.textContent = src === 'demo'
      ? 'Mode Demo. Sample aktif; file import tetap tersimpan.'
      : 'Mode Real. Scores (+ wilayah jika ada) dipakai dashboard.';
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
  btnDemo.classList.toggle('active-source', src === 'demo');
  btnImp.classList.toggle('active-source', src === 'import');
  btnImp.disabled = !(meta && meta.hasScores);
  document.getElementById('btn-clear').disabled = !meta;

  if (!meta) {
    st.innerHTML = '<span class="status-dot red"></span> <strong>Mode Demo</strong> — belum ada import.';
    return;
  }
  const bits = [];
  if (meta.hasScores) bits.push(`${meta.rowCount} baris skor / ${meta.schoolCount} sekolah / bulan ${meta.months.join(', ') || '—'}`);
  if (meta.hasWilayah) bits.push(`wilayah ${meta.wilayahRows} baris`);
  else bits.push('wilayah: demo defaults (upload CSV wilayah utk Dapodik real)');
  const mode = src === 'import' ? 'Mode Real' : 'Mode Demo';
  const dot = src === 'import' ? 'green' : 'orange';
  st.innerHTML = `<span class="status-dot ${dot}"></span> <strong>${mode}</strong> — ${bits.join(' · ')}`;
}

function onClear() {
  if (!confirm('Hapus import skor + wilayah? Demo tetap ada.')) return;
  sbAPI.clearImport();
  document.getElementById('import-log').textContent = 'Import dihapus. Mode Demo.';
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
  reader.onload = () => {
    try {
      if (kind === 'wilayah') {
        const r = sbAPI.importWilayahCSV(reader.result);
        log.textContent = `OK wilayah: ${r.rowCount} baris, ${r.provCount} provinsi. Pakai Mode Real + scores utk Adopsi penuh.`;
      } else {
        const r = sbAPI.importCSV(reader.result);
        log.textContent = `OK scores: ${r.rowCount} baris, ${r.schoolCount} sekolah. Mode Real aktif.`;
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
