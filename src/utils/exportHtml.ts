import { SheetConfig, EssayData } from '../types';

export function generateStandaloneHtml(
  config: SheetConfig,
  _essayData: EssayData,
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
  <title>${escapeHtml(title)} - Foglio di Quaderno</title>

  <!-- Google Fonts: Supporto per Caratteri Cinesi, Russi, Coreani e Tipografia Italiana -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Gowun+Batang:wght@400;700&family=Marck+Script&family=Noto+Sans+KR:wght@400;600;700&family=Noto+Sans+SC:wght@400;600;700&family=Noto+Serif+KR:wght@400;700&family=Noto+Serif+SC:wght@400;700&family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- Tailwind CSS per styling affidabile -->
  <script src="https://cdn.tailwindcss.com"></script>

  <style>
    *, *::before, *::after {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      overflow-x: hidden;
    }

    body {
      background-color: #f3f4f6;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    .notebook-paper-shadow {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04);
    }

    #chinese-continuous-sheet,
    #korean-continuous-sheet,
    #russian-continuous-sheet {
      container-type: inline-size;
      width: 100%;
    }

    .grid-cell {
      box-sizing: border-box !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      position: relative !important;
      background-color: #ffffff !important;
    }

    /* Regole di Stampa A4 */
    @page {
      size: A4 portrait;
      margin: 10mm 8mm;
    }

    @media print {
      .no-print {
        display: none !important;
      }
      body {
        background-color: #ffffff !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .page-wrapper {
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
      }
      #printable-notebook-page {
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        min-height: auto !important;
      }
    }
  </style>
</head>
<body>

  <!-- Barra Superiore Azioni (Nascosta durante la stampa) -->
  <div class="no-print w-full max-w-[760px] mb-4 bg-white border border-neutral-200 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
        A4
      </div>
      <div>
        <h1 class="text-sm font-bold text-neutral-900 leading-tight">
          ${escapeHtml(title)}
        </h1>
        <p class="text-xs text-neutral-500">
          File HTML autonomo &bull; Lettura fluida e stampa pronta
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <button
        type="button"
        onclick="window.print()"
        class="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
      >
        <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        <span>Stampa / Salva in PDF</span>
      </button>
    </div>
  </div>

  <!-- Foglio di Quaderno A4 Centrato e Fluido -->
  <div class="page-wrapper w-full max-w-[760px] flex justify-center">
    <div id="printable-notebook-page" class="bg-white rounded-xl border border-neutral-200 p-4 sm:p-6 md:p-8 notebook-paper-shadow relative w-full">
      ${sheetInnerHtml}
    </div>
  </div>

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
