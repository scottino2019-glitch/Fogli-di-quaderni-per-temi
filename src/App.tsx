import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  FileCode,
  FileDown,
  Printer,
  Sparkles,
  BookOpen,
  Settings2,
  Trash2,
  Check,
  PenTool,
  Eye,
  Copy,
  X,
  CheckCheck,
  Code,
  Columns2,
  Maximize2,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { captureElementAsDataUrl } from './utils/capture';
import {
  SupportedLanguage,
  GridColor,
  SheetConfig,
  EssayData,
} from './types';
import { LANGUAGE_SAMPLES } from './data/samples';
import { ChineseContinuousSheet } from './components/ChineseContinuousSheet';
import { RussianContinuousSheet } from './components/RussianContinuousSheet';
import { KoreanContinuousSheet } from './components/KoreanContinuousSheet';
import { generateStandaloneHtml } from './utils/exportHtml';

export default function App() {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('zh');

  // Essay content state
  const initialSample = LANGUAGE_SAMPLES.zh;
  const [essayData, setEssayData] = useState<EssayData>({
    originalText: initialSample.originalText,
    transcription: initialSample.transcription,
    translation: initialSample.translation,
  });

  // Sheet configuration state
  const [config, setConfig] = useState<SheetConfig>({
    language: 'zh',
    gridType: 'tianzige',
    gridColor: 'red',
    gridSize: 'medium',
    fontSizeModifier: 'normal',
    showTranscription: true,
    showTranslation: true,
    translationPosition: 'footer',
    fontFamily: 'serif',
    extraBlankLines: 4,
    header: {
      title: initialSample.title,
      studentName: initialSample.studentName,
      date: new Date().toLocaleDateString('it-IT'),
      levelOrTopic: initialSample.levelOrTopic,
    },
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [htmlPreviewCode, setHtmlPreviewCode] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const [modalTab, setModalTab] = useState<'visual' | 'code'>('visual');
  const [viewMode, setViewMode] = useState<'split' | 'sheet'>('split');
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showHtmlModal) {
        setShowHtmlModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHtmlModal]);

  // Switch language and update defaults
  const handleLanguageChange = (lang: SupportedLanguage) => {
    setCurrentLang(lang);
    const sample = LANGUAGE_SAMPLES[lang];

    setConfig((prev) => ({
      ...prev,
      language: lang,
      gridType: sample.recommendedGrid,
      gridColor: sample.recommendedColor,
      fontFamily: lang === 'ru' ? 'handwriting' : 'serif',
      header: {
        ...prev.header,
        title: sample.title,
        studentName: sample.studentName,
        levelOrTopic: sample.levelOrTopic,
      },
    }));

    setEssayData({
      originalText: sample.originalText,
      transcription: sample.transcription,
      translation: sample.translation,
    });

    showFeedback(`Passato a ${lang === 'zh' ? 'Cinese' : lang === 'ru' ? 'Russo' : 'Coreano'}`);
  };

  // Load sample content for the current language
  const handleLoadSample = () => {
    const sample = LANGUAGE_SAMPLES[currentLang];
    setEssayData({
      originalText: sample.originalText,
      transcription: sample.transcription,
      translation: sample.translation,
    });
    setConfig((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        title: sample.title,
        studentName: sample.studentName,
        levelOrTopic: sample.levelOrTopic,
      },
    }));
    showFeedback('Tema di esempio caricato con successo!');
  };

  // Clear text
  const handleClearText = () => {
    setEssayData({
      originalText: '',
      transcription: '',
      translation: '',
    });
    showFeedback('Testo del tema azzerato.');
  };

  const showFeedback = (msg: string) => {
    setExportMessage(msg);
    setTimeout(() => {
      setExportMessage(null);
    }, 3200);
  };

  // Export to PNG Image
  const handleExportPNG = async () => {
    if (!sheetRef.current) return;
    setIsExporting(true);
    setExportMessage('Generazione immagine in corso...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 80));

      const dataUrl = await captureElementAsDataUrl(sheetRef.current);

      const safeTitle = (config.header.title || 'foglio_quaderno')
        .toLowerCase()
        .replace(/[^a-z0-9_\u4e00-\u9fa5\u0400-\u04ff\uac00-\ud7af]/gi, '_')
        .slice(0, 30);

      const link = document.createElement('a');
      link.download = `${safeTitle}_${currentLang}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showFeedback('Immagine PNG esportata con successo!');
    } catch (err) {
      console.error('Errore esportazione PNG:', err);
      showFeedback('Errore durante la generazione dell\'immagine PNG.');
    } finally {
      setIsExporting(false);
    }
  };

  // Helper to compile standalone HTML with complete styling
  const getCompiledHtml = (): string => {
    if (!sheetRef.current) return '';
    const activeStyles = Array.from(document.querySelectorAll('style'))
      .map((s) => s.textContent || s.innerHTML)
      .join('\n');
    const sheetHtml = sheetRef.current.innerHTML;
    return generateStandaloneHtml(config, essayData, sheetHtml, activeStyles);
  };

  // Export to Standalone HTML file
  const handleExportHTML = () => {
    const fullHtml = getCompiledHtml();
    if (!fullHtml) return;

    try {
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const safeTitle = (config.header.title || 'foglio_quaderno')
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, '_')
        .slice(0, 30);

      const link = document.createElement('a');
      link.download = `${safeTitle}_${currentLang}.html`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      showFeedback('File HTML scaricato! Pronto per browser e stampa.');
    } catch (err) {
      console.error('Errore esportazione HTML:', err);
      showFeedback('Errore durante la creazione del file HTML.');
    }
  };

  // Open interactive HTML Preview modal
  const handleOpenHtmlPreview = () => {
    const fullHtml = getCompiledHtml();
    if (!fullHtml) return;
    setHtmlPreviewCode(fullHtml);
    setShowHtmlModal(true);
  };

  // Copy HTML code to clipboard
  const handleCopyHtml = async () => {
    if (!htmlPreviewCode) return;
    try {
      await navigator.clipboard.writeText(htmlPreviewCode);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
      showFeedback('Codice HTML copiato negli appunti!');
    } catch (err) {
      console.error('Errore copia:', err);
      showFeedback('Impossibile copiare negli appunti.');
    }
  };

  // Export direct High-Fidelity A4 PDF file using jsPDF
  const handleExportPDF = async () => {
    if (!sheetRef.current) return;
    setIsExporting(true);
    setExportMessage('Generazione PDF in corso...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 80));

      const dataUrl = await captureElementAsDataUrl(sheetRef.current);

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 8;
      const printableWidth = pageWidth - margin * 2;
      const printableHeight = pageHeight - margin * 2;

      const imgRatio = img.width / img.height;
      let renderWidth = printableWidth;
      let renderHeight = printableWidth / imgRatio;

      if (renderHeight <= printableHeight) {
        // Fits on single page
        const posX = margin;
        const posY = margin + (printableHeight - renderHeight) / 2;
        pdf.addImage(dataUrl, 'PNG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');
      } else if (renderHeight / printableHeight < 1.35) {
        // Slightly taller than 1 page: scale proportionally to preserve single-sheet A4 layout
        renderHeight = printableHeight;
        renderWidth = printableHeight * imgRatio;
        const posX = margin + (printableWidth - renderWidth) / 2;
        const posY = margin;
        pdf.addImage(dataUrl, 'PNG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');
      } else {
        // Very long essay: cleanly split into multiple A4 pages
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const slicePixelHeight = Math.floor(img.width * (printableHeight / printableWidth));
        let sourceY = 0;
        let pageIdx = 0;

        while (sourceY < img.height) {
          const currentSliceH = Math.min(slicePixelHeight, img.height - sourceY);
          canvas.width = img.width;
          canvas.height = currentSliceH;

          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, sourceY, img.width, currentSliceH, 0, 0, img.width, currentSliceH);
          }

          const sliceData = canvas.toDataURL('image/png');
          const sliceRenderH = (currentSliceH / img.width) * printableWidth;

          if (pageIdx > 0) {
            pdf.addPage();
          }
          pdf.addImage(sliceData, 'PNG', margin, margin, printableWidth, sliceRenderH, undefined, 'FAST');

          sourceY += currentSliceH;
          pageIdx++;
        }
      }

      const safeTitle = (config.header.title || 'tema_quaderno')
        .toLowerCase()
        .replace(/[^a-z0-9_\u4e00-\u9fa5\u0400-\u04ff\uac00-\ud7af]/gi, '_')
        .slice(0, 30);

      pdf.save(`${safeTitle}_${currentLang}.pdf`);
      showFeedback('File PDF scaricato con successo!');
    } catch (err) {
      console.error('Errore esportazione PDF:', err);
      showFeedback('Errore generazione PDF. Prova il pulsante Stampa.');
    } finally {
      setIsExporting(false);
    }
  };

  // Print or Save to PDF with isolated printing iframe to eliminate preview/iframe clipping
  const handlePrint = () => {
    try {
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '820px';
      printIframe.style.height = '1160px';
      printIframe.style.border = '0';
      printIframe.style.opacity = '0';
      printIframe.style.pointerEvents = 'none';
      printIframe.style.zIndex = '-9999';
      document.body.appendChild(printIframe);

      const content = getCompiledHtml();
      const iframeDoc = printIframe.contentWindow?.document;
      if (iframeDoc && printIframe.contentWindow) {
        iframeDoc.open();
        iframeDoc.write(content);
        iframeDoc.close();

        setTimeout(() => {
          try {
            printIframe.contentWindow?.focus();
            printIframe.contentWindow?.print();
          } catch (e) {
            console.error('Print iframe error:', e);
            window.print();
          } finally {
            setTimeout(() => {
              try {
                if (document.body.contains(printIframe)) {
                  document.body.removeChild(printIframe);
                }
              } catch (_) {}
            }, 3000);
          }
        }, 500);
      } else {
        window.print();
      }
    } catch (e) {
      console.error('Print fallback:', e);
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-800 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-xs print-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-neutral-900 leading-tight">
                Fogli di Quaderno per Temi
              </h1>
              <p className="text-xs text-neutral-500">
                Griglie autentiche continue per Cinese, Russo e Coreano
              </p>
            </div>
          </div>

          {/* Right Toolbar: Language Tabs & View Mode */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-neutral-100 p-1 rounded-lg border border-neutral-200">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                title="Visualizza affiancati editor e foglio"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Affiancato</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('sheet')}
                title="Ingrandisci il foglio a larghezza piena per leggere comodamente"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'sheet'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Solo Foglio</span>
              </button>
            </div>

            {/* Language Selector Tabs */}
            <div className="flex items-center bg-neutral-100 p-1 rounded-lg border border-neutral-200">
              <button
                id="lang-tab-zh"
                type="button"
                onClick={() => handleLanguageChange('zh')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  currentLang === 'zh'
                    ? 'bg-white text-red-700 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span className="text-base">🇨🇳</span>
                <span>Cinese</span>
              </button>

              <button
                id="lang-tab-ru"
                type="button"
                onClick={() => handleLanguageChange('ru')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  currentLang === 'ru'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span className="text-base">🇷🇺</span>
                <span>Russo</span>
              </button>

              <button
                id="lang-tab-ko"
                type="button"
                onClick={() => handleLanguageChange('ko')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  currentLang === 'ko'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span className="text-base">🇰🇷</span>
                <span>Coreano</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main
        className={`flex-1 w-full mx-auto p-3 sm:p-5 lg:p-6 transition-all ${
          viewMode === 'sheet'
            ? 'max-w-4xl flex flex-col items-center'
            : 'max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'
        }`}
      >
        {/* Left Column: Editor & Controls */}
        <div
          id="app-sidebar"
          className={`flex flex-col space-y-5 print-hidden ${
            viewMode === 'sheet' ? 'hidden' : 'lg:col-span-5 w-full'
          }`}
        >
          {/* Box 1: Incolla o Modifica il Tema */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-neutral-600" />
                <h2 className="text-sm font-bold text-neutral-800">
                  1. Il Tuo Tema ({currentLang === 'zh' ? 'Cinese' : currentLang === 'ru' ? 'Russo' : 'Coreano'})
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  title="Carica un tema di esempio già pronto"
                  className="flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Esempio pronto</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearText}
                  title="Cancella tutto il testo"
                  className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              {/* Header Fields: Title, Student, Date */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Titolo del Tema</label>
                  <input
                    type="text"
                    value={config.header.title}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        header: { ...prev.header, title: e.target.value },
                      }))
                    }
                    placeholder="Es. 我的周末生活 / My Essay"
                    className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Nome Studente</label>
                  <input
                    type="text"
                    value={config.header.studentName}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        header: { ...prev.header, studentName: e.target.value },
                      }))
                    }
                    placeholder="Nome e cognome"
                    className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 text-xs"
                  />
                </div>
              </div>

              {/* Main Text Area (Continuo, unificato) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-neutral-700">
                    Testo del Tema (incolla qui il tema intero)
                  </label>
                  <span className="text-[10px] text-neutral-400">
                    {essayData.originalText.length} caratteri
                  </span>
                </div>
                <textarea
                  id="essay-original-textarea"
                  rows={6}
                  value={essayData.originalText}
                  onChange={(e) =>
                    setEssayData((prev) => ({ ...prev, originalText: e.target.value }))
                  }
                  placeholder={`Incolla o scrivi qui il testo completo in ${
                    currentLang === 'zh' ? 'cinese' : currentLang === 'ru' ? 'russo' : 'coreano'
                  }...`}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 text-xs font-mono leading-relaxed"
                />
              </div>

              {/* Transcription Area (Pinyin / Accenti / Romanizzazione) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-neutral-700">
                    {currentLang === 'zh'
                      ? 'Pinyin (trascrizione fonetica)'
                      : currentLang === 'ru'
                      ? 'Trascrizione fonetica & accenti'
                      : 'Romanizzazione coreana (RR)'}
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-neutral-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showTranscription}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, showTranscription: e.target.checked }))
                      }
                      className="rounded text-neutral-900 focus:ring-neutral-900"
                    />
                    <span>Mostra sul foglio</span>
                  </label>
                </div>
                <textarea
                  id="essay-transcription-textarea"
                  rows={2}
                  value={essayData.transcription}
                  onChange={(e) =>
                    setEssayData((prev) => ({ ...prev, transcription: e.target.value }))
                  }
                  placeholder="Trascrizione fonetica opzionale..."
                  className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 text-xs font-mono"
                />
              </div>

              {/* Italian Translation Area */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-neutral-700">
                    Traduzione del Tema in Italiano
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-neutral-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showTranslation}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, showTranslation: e.target.checked }))
                      }
                      className="rounded text-neutral-900 focus:ring-neutral-900"
                    />
                    <span>Mostra sul foglio</span>
                  </label>
                </div>
                <textarea
                  id="essay-translation-textarea"
                  rows={3}
                  value={essayData.translation}
                  onChange={(e) =>
                    setEssayData((prev) => ({ ...prev, translation: e.target.value }))
                  }
                  placeholder="Incolla o scrivi qui la traduzione del tema in italiano..."
                  className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 text-xs italic"
                />
              </div>
            </div>
          </div>

          {/* Box 2: Impostazioni Foglio di Quaderno */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-4 space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
              <Settings2 className="w-4 h-4 text-neutral-600" />
              <h3 className="font-bold text-neutral-800 text-sm">2. Stile e Griglia del Foglio</h3>
            </div>

            {/* Grid Type Selector */}
            <div>
              <label className="block text-neutral-600 font-medium mb-1.5">
                Tipo di Griglia / Righe
              </label>
              <div className="grid grid-cols-2 gap-2">
                {currentLang === 'zh' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, gridType: 'tianzige' }))}
                      className={`p-2 rounded border text-left cursor-pointer transition-all ${
                        config.gridType === 'tianzige'
                          ? 'border-red-600 bg-red-50 text-red-950 font-bold'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="font-semibold">田字格 Tianzige</div>
                      <div className="text-[10px] text-neutral-500">Croce centrale classica</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, gridType: 'mige' }))}
                      className={`p-2 rounded border text-left cursor-pointer transition-all ${
                        config.gridType === 'mige'
                          ? 'border-red-600 bg-red-50 text-red-950 font-bold'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="font-semibold">米字格 Mige</div>
                      <div className="text-[10px] text-neutral-500">Croce + Diagonali a 8 raggi</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, gridType: 'fangge' }))}
                      className={`p-2 rounded border text-left cursor-pointer transition-all col-span-2 ${
                        config.gridType === 'fangge'
                          ? 'border-red-600 bg-red-50 text-red-950 font-bold'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="font-semibold">方格 Fangge</div>
                      <div className="text-[10px] text-neutral-500">Caselle quadrate pulite senza guide</div>
                    </button>
                  </>
                )}

                {currentLang === 'ru' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, gridType: 'kosaya' }))}
                      className={`p-2 rounded border text-left cursor-pointer transition-all ${
                        config.gridType === 'kosaya'
                          ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="font-semibold">Косая линейка</div>
                      <div className="text-[10px] text-neutral-500">Righe calligrafiche a 65°</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, gridType: 'shirokaya' }))}
                      className={`p-2 rounded border text-left cursor-pointer transition-all ${
                        config.gridType === 'shirokaya'
                          ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="font-semibold">Широкая линейка</div>
                      <div className="text-[10px] text-neutral-500">Righe larghe da tema</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, gridType: 'kletka' }))}
                      className={`p-2 rounded border text-left cursor-pointer transition-all col-span-2 ${
                        config.gridType === 'kletka'
                          ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="font-semibold">Клетка (Quadretti)</div>
                      <div className="text-[10px] text-neutral-500">Quadrettatura classica con margine rosso</div>
                    </button>
                  </>
                )}

                {currentLang === 'ko' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, gridType: 'wongoji' }))}
                      className={`p-2 rounded border text-left cursor-pointer transition-all ${
                        config.gridType === 'wongoji'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="font-semibold">원고지 Wongoji</div>
                      <div className="text-[10px] text-neutral-500">200 caratteri classico</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, gridType: 'hangul_cross' }))}
                      className={`p-2 rounded border text-left cursor-pointer transition-all ${
                        config.gridType === 'hangul_cross'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="font-semibold">Guida a Croce</div>
                      <div className="text-[10px] text-neutral-500">Per l'equilibrio dei blocchi</div>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Colors & Size */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-600 font-medium mb-1">Colore Inchiostro</label>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'red', label: 'Rosso', bg: 'bg-red-500' },
                    { id: 'blue', label: 'Blu', bg: 'bg-blue-500' },
                    { id: 'green', label: 'Verde', bg: 'bg-emerald-600' },
                    { id: 'gray', label: 'Grigio', bg: 'bg-neutral-600' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, gridColor: c.id as GridColor }))}
                      title={c.label}
                      className={`w-6 h-6 rounded-full ${c.bg} transition-transform flex items-center justify-center cursor-pointer ${
                        config.gridColor === c.id ? 'ring-2 ring-offset-2 ring-neutral-900 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {config.gridColor === c.id && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Dimensione Griglia</label>
                <div className="flex bg-neutral-100 p-0.5 rounded border border-neutral-200">
                  {(['small', 'medium', 'large'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, gridSize: s }))}
                      className={`flex-1 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                        config.gridSize === s ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500'
                      }`}
                    >
                      {s === 'small' ? 'Compatta' : s === 'medium' ? 'Media' : 'Grande'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dimensione Caratteri / Font */}
            <div className="pt-2 border-t border-neutral-100">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-neutral-800 font-bold">
                  Dimensione Caratteri / Font
                </label>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {config.fontSizeModifier === 'huge'
                    ? 'Molto Grande (+25%)'
                    : config.fontSizeModifier === 'large'
                    ? 'Grande (+12%)'
                    : 'Normale (Già Ingrandito)'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 bg-neutral-100 p-1 rounded-md border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, fontSizeModifier: 'normal' }))}
                  className={`py-1.5 px-2 rounded text-xs font-semibold cursor-pointer transition-all ${
                    (!config.fontSizeModifier || config.fontSizeModifier === 'normal')
                      ? 'bg-white shadow-xs text-neutral-950 font-bold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Normale
                </button>
                <button
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, fontSizeModifier: 'large' }))}
                  className={`py-1.5 px-2 rounded text-xs font-semibold cursor-pointer transition-all ${
                    config.fontSizeModifier === 'large'
                      ? 'bg-white shadow-xs text-blue-700 font-bold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Grande
                </button>
                <button
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, fontSizeModifier: 'huge' }))}
                  className={`py-1.5 px-2 rounded text-xs font-semibold cursor-pointer transition-all ${
                    config.fontSizeModifier === 'huge'
                      ? 'bg-white shadow-xs text-blue-800 font-bold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Molto Grande
                </button>
              </div>
            </div>

            {/* Stile Carattere Russo se lingua russa */}
            {currentLang === 'ru' && (
              <div>
                <label className="block text-neutral-700 font-bold mb-1">Stile Carattere Russo</label>
                <div className="flex bg-neutral-100 p-1 rounded-md border border-neutral-200 gap-1">
                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, fontFamily: 'handwriting' }))}
                    className={`flex-1 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${
                      config.fontFamily === 'handwriting' ? 'bg-white shadow-xs text-neutral-950 font-bold' : 'text-neutral-600'
                    }`}
                  >
                    Corsivo (Прописи)
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, fontFamily: 'serif' }))}
                    className={`flex-1 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${
                      config.fontFamily !== 'handwriting' ? 'bg-white shadow-xs text-neutral-950 font-bold' : 'text-neutral-600'
                    }`}
                  >
                    Stampatello
                  </button>
                </div>
              </div>
            )}

            {/* Extra Blank Lines for Manual Handwriting Exercise */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-neutral-600 font-medium">
                  Righe vuote extra del quaderno (per scrivere a mano)
                </label>
                <span className="font-bold text-neutral-900">{config.extraBlankLines} righe</span>
              </div>
              <input
                type="range"
                min={0}
                max={14}
                step={2}
                value={config.extraBlankLines}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, extraBlankLines: parseInt(e.target.value) || 0 }))
                }
                className="w-full accent-neutral-900 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: High-Fidelity Continuous Notebook Sheet & Action Bar */}
        <div
          className={`flex flex-col space-y-4 ${
            viewMode === 'sheet' ? 'w-full' : 'lg:col-span-7 min-w-0 w-full'
          }`}
        >
          {/* Action Export Bar */}
          <div
            id="export-toolbar"
            className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs flex flex-wrap items-center justify-between gap-3 print-hidden"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Esporta Foglio:
              </span>
              {exportMessage && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md animate-fade-in border border-emerald-200">
                  {exportMessage}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Direct PDF Download */}
              <button
                id="btn-export-pdf"
                type="button"
                onClick={handleExportPDF}
                disabled={isExporting}
                title="Scarica direttamente il file PDF in formato A4 ad alta risoluzione"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Generazione...' : 'Scarica PDF'}</span>
              </button>

              {/* Print / Save to PDF */}
              <button
                id="btn-print-pdf"
                type="button"
                onClick={handlePrint}
                title="Apri finestra di stampa o salva PDF tramite browser"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Stampa / PDF Browser</span>
              </button>

              {/* Export PNG */}
              <button
                id="btn-export-png"
                type="button"
                onClick={handleExportPNG}
                disabled={isExporting}
                title="Esporta foglio come immagine PNG"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-neutral-600" />
                <span>PNG</span>
              </button>

              {/* Export Standalone HTML */}
              <button
                id="btn-export-html"
                type="button"
                onClick={handleExportHTML}
                title="Scarica file HTML completo autonomo con caratteri e stili"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5 text-blue-600" />
                <span>HTML</span>
              </button>

              {/* Preview Standalone HTML */}
              <button
                id="btn-preview-html"
                type="button"
                onClick={handleOpenHtmlPreview}
                title="Visualizza e verifica l'HTML autonomo prima di scaricare"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Anteprima HTML</span>
              </button>
            </div>
          </div>

          {/* Real Continuous Notebook Sheet (A4 format representation) */}
          <div className="w-full flex flex-col items-center">
            <div className="w-full flex justify-center py-1">
              <div
                id="printable-notebook-page"
                ref={sheetRef}
                className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-6 md:p-8 notebook-paper-shadow relative w-full max-w-[760px] min-h-[860px] box-border"
              >
                {/* Authentic Notebook Header */}
                <div className="border-b-2 border-neutral-800 pb-3 mb-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-1.5 mb-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight font-serif">
                      {config.header.title || 'Tema di Esercitazione'}
                    </h2>
                    <span className="text-xs font-mono font-medium text-neutral-500 uppercase tracking-wider">
                      {currentLang === 'zh'
                        ? '作文练习本 / Quaderno Cinese'
                        : currentLang === 'ru'
                        ? 'Тетрадь для сочинений / Quaderno Russo'
                        : '원고지 작문 / Quaderno Coreano'}
                    </span>
                  </div>

                  {/* Student Info Bar */}
                  <div className="grid grid-cols-3 gap-2 text-xs border-t border-neutral-300 pt-2.5 text-neutral-600">
                    <div>
                      <span className="font-bold text-neutral-900">Studente: </span>
                      <span className="font-medium text-neutral-800">{config.header.studentName || '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-neutral-900">Data: </span>
                      <span className="font-medium text-neutral-800">{config.header.date || '—'}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-neutral-900">Livello: </span>
                      <span className="font-medium text-neutral-800">{config.header.levelOrTopic || 'Standard'}</span>
                    </div>
                  </div>
                </div>

                {/* Continuous Sheet Content based on Language */}
                {currentLang === 'zh' && (
                  <ChineseContinuousSheet config={config} data={essayData} />
                )}

                {currentLang === 'ru' && (
                  <RussianContinuousSheet config={config} data={essayData} />
                )}

                {currentLang === 'ko' && (
                  <KoreanContinuousSheet config={config} data={essayData} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Standalone HTML Preview Modal */}
      {showHtmlModal && (
        <div
          id="html-preview-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5"
          onClick={() => setShowHtmlModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-5xl h-[90vh] max-h-[850px] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 border-b border-neutral-200 flex flex-wrap items-center justify-between bg-neutral-50 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shadow-xs">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 leading-tight">
                    File HTML Autonomo (Quaderno A4)
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Include Tailwind CSS, Google Fonts e layout di stampa pronto
                  </p>
                </div>
              </div>

              {/* Tab Switcher & Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Visual vs Code Tab Switcher */}
                <div className="flex items-center bg-neutral-200/80 p-1 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setModalTab('visual')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      modalTab === 'visual'
                        ? 'bg-white text-neutral-900 shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Anteprima Foglio</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('code')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      modalTab === 'code'
                        ? 'bg-white text-neutral-900 shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>Codice HTML</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyHtml}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-xs"
                >
                  {hasCopied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{hasCopied ? 'Copiato!' : 'Copia'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportHTML}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Scarica .html</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowHtmlModal(false)}
                  aria-label="Chiudi"
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200/70 cursor-pointer ml-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 min-h-0 bg-neutral-100 p-3 sm:p-5 overflow-hidden flex flex-col">
              {modalTab === 'visual' ? (
                <div className="w-full h-full bg-neutral-200/60 rounded-xl border border-neutral-300 overflow-hidden flex flex-col shadow-inner">
                  <iframe
                    title="Anteprima HTML Quaderno"
                    srcDoc={htmlPreviewCode}
                    className="w-full h-full border-none bg-white"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-neutral-950 rounded-xl border border-neutral-800 p-4 overflow-auto flex flex-col font-mono text-xs text-neutral-200">
                  <pre className="whitespace-pre-wrap break-all leading-relaxed select-all">
                    {htmlPreviewCode}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-2.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
              <span>
                {modalTab === 'visual'
                  ? 'Il foglio HTML è autonomo e pronto da aprire in qualsiasi browser o stampare.'
                  : 'Codice HTML completo con Tailwind CSS e font Google pronti per l\'uso.'}
              </span>
              <button
                type="button"
                onClick={() => setShowHtmlModal(false)}
                className="px-4 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-md font-medium cursor-pointer transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
