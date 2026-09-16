import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';

/**
 * Cattura in modo sicuro un elemento DOM come immagine PNG ad alta risoluzione (Data URL).
 * Utilizza html2canvas come motore primario (immune da SecurityError su Google Fonts e CORS)
 * con fallback progressivo su html-to-image configurato per bypassare i controlli CORS dei font.
 */
export async function captureElementAsDataUrl(element: HTMLElement): Promise<string> {
  // Attendi che i web font abbiano completato il caricamento nel documento
  if (typeof document !== 'undefined' && 'fonts' in document && document.fonts.ready) {
    try {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
    } catch (_) {
      // Procedi comunque se document.fonts non è supportato
    }
  }

  // Tentativo 1: html2canvas
  // Imposta windowWidth a 780px e onclone per garantire che anche su smartphone/tablet
  // l'elemento venga renderizzato e catturato alle esatte dimensioni canoniche A4 desktop (740px)
  // senza tagli, colonne mancanti o compressioni anomale.
  try {
    const canvas = await html2canvas(element, {
      scale: 2.2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowWidth: 780,
      onclone: (clonedDoc, clonedElement) => {
        // Normalizza body del documento clonato
        if (clonedDoc.body) {
          clonedDoc.body.style.width = '780px';
          clonedDoc.body.style.minWidth = '780px';
        }

        // Forza le dimensioni canoniche A4 sull'elemento catturato
        clonedElement.style.width = '740px';
        clonedElement.style.minWidth = '740px';
        clonedElement.style.maxWidth = '740px';
        clonedElement.style.padding = '30px 34px';
        clonedElement.style.transform = 'none';
        clonedElement.style.margin = '0 auto';
        clonedElement.style.boxSizing = 'border-box';

        // Disattiva limitazioni di overflow orizzontale su tutti i contenitori figli
        // così da includere tutte le colonne della griglia (Cinese, Russo, Coreano)
        const scrollables = clonedElement.querySelectorAll('.overflow-x-auto, .overflow-hidden');
        scrollables.forEach((node) => {
          const el = node as HTMLElement;
          el.style.overflow = 'visible';
          el.style.width = '100%';
          el.style.maxWidth = 'none';
        });
      },
      ignoreElements: (el) => el.classList && el.classList.contains('print-hidden'),
    });

    const dataUrl = canvas.toDataURL('image/png');
    if (dataUrl && dataUrl.length > 500) {
      return dataUrl;
    }
  } catch (canvasErr) {
    console.warn('Cattura con html2canvas fallita, avvio fallback con html-to-image:', canvasErr);
  }

  // Tentativo 2: html-to-image con skipFonts: true e normalizzazione dimensioni A4
  try {
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      skipFonts: true,
      fontEmbedCSS: '',
      cacheBust: false,
      width: 740,
      style: {
        width: '740px',
        minWidth: '740px',
        maxWidth: '740px',
        transform: 'none',
      },
      filter: (node: HTMLElement) => {
        return !node.classList || !node.classList.contains('print-hidden');
      },
    });

    if (dataUrl && dataUrl.length > 500) {
      return dataUrl;
    }
  } catch (htmlToImgErr) {
    console.warn('Cattura con html-to-image fallita:', htmlToImgErr);
  }

  // Tentativo 3: html2canvas con parametri di emergenza (scala standard 1.5)
  const fallbackCanvas = await html2canvas(element, {
    scale: 1.5,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    windowWidth: 860,
  });

  const finalUrl = fallbackCanvas.toDataURL('image/png');
  if (!finalUrl || finalUrl.length < 200) {
    throw new Error('Impossibile generare la rappresentazione grafica del foglio.');
  }

  return finalUrl;
}
