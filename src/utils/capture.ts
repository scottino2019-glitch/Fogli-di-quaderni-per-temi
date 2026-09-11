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

  // Tentativo 1: html2canvas (Usa getComputedStyle e canvas 2D nativo, nessuna richiesta fetch per i font esterni)
  try {
    const canvas = await html2canvas(element, {
      scale: 2.2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      logging: false,
      ignoreElements: (el) => el.classList && el.classList.contains('print-hidden'),
    });

    const dataUrl = canvas.toDataURL('image/png');
    if (dataUrl && dataUrl.length > 500) {
      return dataUrl;
    }
  } catch (canvasErr) {
    console.warn('Cattura con html2canvas fallita, avvio fallback con html-to-image:', canvasErr);
  }

  // Tentativo 2: html-to-image con skipFonts: true e fontEmbedCSS disabilitato per evitare SecurityError CORS
  try {
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      skipFonts: true,
      fontEmbedCSS: '',
      cacheBust: false,
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
  });

  const finalUrl = fallbackCanvas.toDataURL('image/png');
  if (!finalUrl || finalUrl.length < 200) {
    throw new Error('Impossibile generare la rappresentazione grafica del foglio.');
  }

  return finalUrl;
}
