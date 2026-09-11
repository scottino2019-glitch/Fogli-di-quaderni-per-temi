import { SheetConfig, EssayData } from '../types';

export function generateStandaloneHtml(
  config: SheetConfig,
  essayData: EssayData,
  sheetInnerHtml: string,
  _activeDocumentStyles?: string
): string {
  const languageNames: Record<string, string> = {
    zh: 'Cinese (中文)',
    ru: 'Russo (Русский)',
    ko: 'Coreano (한국어)',
  };

  const title = config.header.title || `Quaderno ${languageNames[config.language] || ''}`;

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>

  <!-- Google Fonts: Supporto per Caratteri Cinesi, Russi, Coreani e Tipografia Italiana -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Gowun+Batang:wght@400;700&family=Marck+Script&family=Noto+Sans+KR:wght@400;600;700&family=Noto+Sans+SC:wght@400;600;700&family=Noto+Serif+KR:wght@400;700&family=Noto+Serif+SC:wght@400;700&family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- Librerie per esportazione PDF diretta autonoma ad alta risoluzione -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

  <!-- Stili incorporati completi, autonomi e ottimizzati per Stampa e Schermo -->
  <style>
    /* Reset & Standard Box Model */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: #f3f4f6;
      color: #1f2937;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      padding: 24px 16px;
      margin: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    .page-container {
      width: 100%;
      max-width: 860px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* Barra comandi superiore */
    .print-bar {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding: 14px 20px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }

    .actions-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .action-btn {
      border: none;
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      transition: all 0.2s;
    }

    .btn-pdf {
      background: #b91c1c;
      color: #ffffff;
    }
    .btn-pdf:hover {
      background: #991b1b;
    }

    .btn-print {
      background: #111827;
      color: #ffffff;
    }
    .btn-print:hover {
      background: #374151;
    }

    /* Foglio di Quaderno A4 */
    .notebook-sheet,
    #printable-notebook-page {
      background: #ffffff;
      width: 100%;
      max-width: 820px;
      box-shadow: 0 4px 25px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 36px 42px;
      min-height: 1020px;
      position: relative;
      background-color: #ffffff;
    }

    /* Celle di Griglia (Cinese & Coreano) */
    .grid-cell {
      box-sizing: border-box !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      position: relative !important;
      background-color: #ffffff !important;
      flex-shrink: 0 !important;
    }

    /* Regole di Layout Flexbox e Griglia fondamentali */
    .flex { display: flex !important; }
    .inline-flex { display: inline-flex !important; }
    .flex-col { flex-direction: column !important; }
    .flex-row { flex-direction: row !important; }
    .items-center { align-items: center !important; }
    .items-start { align-items: flex-start !important; }
    .items-baseline { align-items: baseline !important; }
    .justify-between { justify-content: space-between !important; }
    .justify-center { justify-content: center !important; }
    .justify-end { justify-content: flex-end !important; }
    .flex-1 { flex: 1 1 0% !important; }

    .grid { display: grid !important; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
    .gap-1 { gap: 0.25rem !important; }
    .gap-1\\.5 { gap: 0.375rem !important; }
    .gap-2 { gap: 0.5rem !important; }
    .gap-2\\.5 { gap: 0.625rem !important; }
    .gap-3 { gap: 0.75rem !important; }
    .gap-4 { gap: 1rem !important; }

    .space-y-2 > * + * { margin-top: 0.5rem !important; }
    .space-y-3 > * + * { margin-top: 0.75rem !important; }
    .space-y-4 > * + * { margin-top: 1rem !important; }

    /* Posizionamento */
    .relative { position: relative !important; }
    .absolute { position: absolute !important; }
    .inset-0 { top: 0 !important; right: 0 !important; bottom: 0 !important; left: 0 !important; }
    .inset-x-0 { left: 0 !important; right: 0 !important; }
    .top-0 { top: 0 !important; }
    .bottom-0 { bottom: 0 !important; }
    .left-0 { left: 0 !important; }
    .right-0 { right: 0 !important; }
    .z-10 { z-index: 10 !important; }
    .z-20 { z-index: 20 !important; }
    .pointer-events-none { pointer-events: none !important; }

    /* Dimensionamento */
    .w-full { width: 100% !important; }
    .h-full { height: 100% !important; }
    .min-w-full { min-width: 100% !important; }
    .overflow-hidden { overflow: hidden !important; }
    .overflow-x-auto { overflow-x: auto !important; }
    .select-none { user-select: none !important; }
    .truncate { overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }

    /* Tipografia e font */
    .font-serif { font-family: 'Noto Serif SC', 'Noto Serif KR', 'Cormorant Garamond', Georgia, serif !important; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important; }
    .font-sans { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important; }
    .font-bold { font-weight: 700 !important; }
    .font-semibold { font-weight: 600 !important; }
    .font-medium { font-weight: 500 !important; }
    .italic { font-style: italic !important; }
    .uppercase { text-transform: uppercase !important; }
    .tracking-tight { letter-spacing: -0.025em !important; }
    .tracking-wider { letter-spacing: 0.05em !important; }
    .leading-none { line-height: 1 !important; }
    .leading-relaxed { line-height: 1.625 !important; }
    .text-right { text-align: right !important; }

    .text-\\[10px\\] { font-size: 10px !important; }
    .text-\\[11px\\] { font-size: 11px !important; }
    .text-xs { font-size: 0.75rem !important; line-height: 1rem !important; }
    .text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
    .text-base { font-size: 1rem !important; line-height: 1.5rem !important; }
    .text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
    .text-xl { font-size: 1.25rem !important; line-height: 1.75rem !important; }
    .text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
    .text-3xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }

    /* Colori del testo */
    .text-neutral-900 { color: #111827 !important; }
    .text-neutral-800 { color: #1f2937 !important; }
    .text-neutral-700 { color: #374151 !important; }
    .text-neutral-600 { color: #4b5563 !important; }
    .text-neutral-500 { color: #6b7280 !important; }
    .text-neutral-400 { color: #9ca3af !important; }
    .text-blue-800 { color: #1e40af !important; }
    .text-emerald-800 { color: #065f46 !important; }
    .text-white { color: #ffffff !important; }
    .text-transparent { color: transparent !important; }

    /* Sfondi e bordi */
    .bg-white { background-color: #ffffff !important; }
    .bg-neutral-50 { background-color: #f9fafb !important; }
    .bg-neutral-50\\/80 { background-color: rgba(249, 250, 251, 0.8) !important; }
    .bg-blue-50\\/70 { background-color: rgba(239, 246, 255, 0.7) !important; }
    .bg-emerald-50\\/70 { background-color: rgba(236, 253, 245, 0.7) !important; }

    .border { border: 1px solid #e5e7eb !important; }
    .border-2 { border: 2px solid #e5e7eb !important; }
    .border-t { border-top: 1px solid #e5e7eb !important; }
    .border-b { border-bottom: 1px solid #e5e7eb !important; }
    .border-t-2 { border-top: 2px solid #e5e7eb !important; }
    .border-b-2 { border-bottom: 2px solid #1f2937 !important; }
    .border-neutral-200 { border-color: #e5e7eb !important; }
    .border-neutral-300 { border-color: #d1d5db !important; }
    .border-neutral-800 { border-color: #1f2937 !important; }
    .border-blue-200 { border-color: #bfdbfe !important; }
    .border-emerald-200 { border-color: #a7f3d0 !important; }

    .rounded { border-radius: 0.25rem !important; }
    .rounded-md { border-radius: 0.375rem !important; }
    .rounded-lg { border-radius: 0.5rem !important; }
    .rounded-xl { border-radius: 0.75rem !important; }

    .p-1 { padding: 0.25rem !important; }
    .p-2 { padding: 0.5rem !important; }
    .p-2\\.5 { padding: 0.625rem !important; }
    .p-3 { padding: 0.75rem !important; }
    .p-4 { padding: 1rem !important; }
    .px-1 { padding-left: 0.25rem !important; padding-right: 0.25rem !important; }
    .px-2 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
    .py-0\\.5 { padding-top: 0.125rem !important; padding-bottom: 0.125rem !important; }
    .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
    .pt-2 { padding-top: 0.5rem !important; }
    .pt-4 { padding-top: 1rem !important; }
    .pb-4 { padding-bottom: 1rem !important; }
    .pl-2 { padding-left: 0.5rem !important; }
    .pl-4 { padding-left: 1rem !important; }
    .pr-2 { padding-right: 0.5rem !important; }
    .pr-6 { padding-right: 1.5rem !important; }

    .mb-1 { margin-bottom: 0.25rem !important; }
    .mb-1\\.5 { margin-bottom: 0.375rem !important; }
    .mb-2 { margin-bottom: 0.5rem !important; }
    .mb-3 { margin-bottom: 0.75rem !important; }
    .mb-6 { margin-bottom: 1.5rem !important; }
    .mt-6 { margin-top: 1.5rem !important; }
    .mt-8 { margin-top: 2rem !important; }
    .mx-auto { margin-left: auto !important; margin-right: auto !important; }

    /* Offset per punteggiatura orientale */
    .translate-x-\\[-15\\%\\] { transform: translateX(-15%) !important; }
    .translate-y-\\[-15\\%\\] { transform: translateY(-15%) !important; }

    /* REGOLE DI STAMPA A4 ASSOLUTE ED ESATTE (Risolvono completamente il problema pagina bianca/vuota) */
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
        box-sizing: border-box !important;
      }

      /* html e body DEVONO essere a flusso naturale a blocchi, mai flex */
      html, body {
        display: block !important;
        background: #ffffff !important;
        background-color: #ffffff !important;
        color: #000000 !important;
        padding: 0 !important;
        margin: 0 !important;
        width: 100% !important;
        height: auto !important;
        min-height: auto !important;
        max-height: none !important;
        overflow: visible !important;
        position: static !important;
      }

      /* Nascondi toolbar ed elementi non stampabili */
      .print-bar,
      .print-hidden,
      button {
        display: none !important;
        visibility: hidden !important;
      }

      /* Il contenitore deve essere un blocco a tutta larghezza senza limiti rigidi di altezza */
      .page-container {
        display: block !important;
        max-width: 100% !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        height: auto !important;
        min-height: auto !important;
        overflow: visible !important;
        position: static !important;
      }

      /* Il foglio vero e proprio: visibile, bordo leggero, impaginazione continua fluida */
      .notebook-sheet,
      #printable-notebook-page {
        display: block !important;
        visibility: visible !important;
        box-shadow: none !important;
        border: 1px solid #d1d5db !important;
        border-radius: 0 !important;
        padding: 6mm 8mm !important;
        margin: 0 auto !important;
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        min-height: auto !important;
        background: #ffffff !important;
        background-color: #ffffff !important;
        overflow: visible !important;
        position: relative !important;
        page-break-inside: auto !important;
        break-inside: auto !important;
      }

      /* MAI troncare contenitori orizzontali o a scorrimento in fase di stampa */
      .overflow-x-auto,
      .overflow-hidden,
      [class*="overflow-"] {
        overflow: visible !important;
        max-width: 100% !important;
      }

      /* Assicura che linee, bordi e celle siano sempre visibili */
      .grid-cell {
        display: inline-flex !important;
        background-color: #ffffff !important;
        visibility: visible !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      svg {
        visibility: visible !important;
        overflow: visible !important;
      }

      /* Assicura che le righe mantengano la corretta direzione flex */
      .flex-row {
        display: flex !important;
        flex-direction: row !important;
      }

      .flex-col {
        display: flex !important;
        flex-direction: column !important;
      }

      @page {
        size: A4 portrait;
        margin: 6mm 8mm;
      }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <!-- Barra comandi con Stampa Browser e Download Diretto PDF -->
    <div class="print-bar">
      <div>
        <h2 style="font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 2px;">${escapeHtml(title)}</h2>
        <p style="font-size: 12px; color: #6b7280;">Foglio di quaderno autentico per ${languageNames[config.language] || ''}</p>
      </div>

      <div class="actions-group">
        <!-- Download PDF Diretto (ad altissima fedeltà, senza dipendere dal browser) -->
        <button id="btn-direct-pdf" class="action-btn btn-pdf" onclick="downloadDirectPDF()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          <span id="btn-pdf-label">Scarica PDF Diretto (A4)</span>
        </button>

        <!-- Stampa o Salva PDF tramite finestra del Browser -->
        <button class="action-btn btn-print" onclick="printDocument()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          <span>Stampa / PDF Browser</span>
        </button>
      </div>
    </div>

    <!-- Contenitore del Foglio di Quaderno -->
    <div id="printable-notebook-page" class="notebook-sheet">
      ${sheetInnerHtml}
    </div>
  </div>

  <script>
    // Stampa documento con garanzia di messa a fuoco e re-layout attivo
    function printDocument() {
      window.focus();
      setTimeout(function() {
        window.print();
      }, 150);
    }

    // Esportazione PDF diretta ad alta risoluzione tramite jsPDF + html2canvas
    async function downloadDirectPDF() {
      var btn = document.getElementById('btn-direct-pdf');
      var label = document.getElementById('btn-pdf-label');
      var sheet = document.getElementById('printable-notebook-page');

      if (!sheet) return;

      if (label) label.textContent = 'Generazione PDF...';
      if (btn) btn.disabled = true;

      try {
        if (!window.html2canvas || !window.jspdf) {
          throw new Error('Libreria PDF non ancora caricata.');
        }

        var canvas = await window.html2canvas(sheet, {
          scale: 2.2,
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false
        });

        var imgData = canvas.toDataURL('image/png');
        var jsPDF = window.jspdf.jsPDF;
        var pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        var pageWidth = 210;
        var pageHeight = 297;
        var margin = 8;
        var printW = pageWidth - margin * 2;
        var printH = pageHeight - margin * 2;

        var imgRatio = canvas.width / canvas.height;
        var renderW = printW;
        var renderH = printW / imgRatio;

        if (renderH <= printH) {
          var posX = margin;
          var posY = margin + (printH - renderH) / 2;
          pdf.addImage(imgData, 'PNG', posX, posY, renderW, renderH, undefined, 'FAST');
        } else if (renderH / printH < 1.35) {
          renderH = printH;
          renderW = printH * imgRatio;
          var posX = margin + (printW - renderW) / 2;
          var posY = margin;
          pdf.addImage(imgData, 'PNG', posX, posY, renderW, renderH, undefined, 'FAST');
        } else {
          var sliceH = Math.floor(canvas.width * (printH / printW));
          var currentY = 0;
          var pageIdx = 0;

          while (currentY < canvas.height) {
            var currentSliceH = Math.min(sliceH, canvas.height - currentY);
            var tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = currentSliceH;
            var ctx = tempCanvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
              ctx.drawImage(canvas, 0, currentY, canvas.width, currentSliceH, 0, 0, canvas.width, currentSliceH);
            }

            var sliceData = tempCanvas.toDataURL('image/png');
            var sliceRenderH = (currentSliceH / canvas.width) * printW;

            if (pageIdx > 0) {
              pdf.addPage();
            }
            pdf.addImage(sliceData, 'PNG', margin, margin, printW, sliceRenderH, undefined, 'FAST');

            currentY += currentSliceH;
            pageIdx++;
          }
        }

        var fileName = ('${escapeHtml(title)}' || 'foglio_quaderno')
          .toLowerCase()
          .replace(/[^a-z0-9_\u4e00-\u9fa5\u0400-\u04ff\uac00-\ud7af]/gi, '_')
          .slice(0, 35) + '.pdf';

        pdf.save(fileName);
      } catch (err) {
        console.error('Errore esportazione PDF:', err);
        alert('Impossibile generare il PDF direttamente, procedo con la finestra di stampa.');
        printDocument();
      } finally {
        if (label) label.textContent = 'Scarica PDF Diretto (A4)';
        if (btn) btn.disabled = false;
      }
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
