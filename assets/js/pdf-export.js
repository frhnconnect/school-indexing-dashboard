/**
 * PDF Export — School Indexing Dashboard
 * Uses html2pdf.js (loaded from CDN) to generate PDF from current DOM.
 */

const HTML2PDF_CDN = 'https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js';

async function loadHtml2Pdf() {
    if (window.html2pdf) return;
    await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = HTML2PDF_CDN;
        s.onload = resolve;
        s.onerror = () => reject(new Error('Failed to load html2pdf.js'));
        document.head.appendChild(s);
    });
}

async function exportPDF(elementId, filename) {
    const element = document.getElementById(elementId) || document.querySelector('.container');
    if (!element) return;

    await loadHtml2Pdf();

    const opt = {
        margin: [10, 10, 10, 10],
        filename: filename || `school-indexing-${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    };

    await window.html2pdf().set(opt).from(element).save();
}

window.exportPDF = exportPDF;
