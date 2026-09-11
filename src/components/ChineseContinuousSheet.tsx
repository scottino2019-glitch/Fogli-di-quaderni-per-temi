import React from 'react';
import { SheetConfig, EssayData, GridColor } from '../types';

interface ChineseContinuousSheetProps {
  config: SheetConfig;
  data: EssayData;
}

interface CellData {
  char: string;
  pinyin: string;
  isPunctuation: boolean;
}

const colorMap: Record<GridColor, { border: string; inner: string; pinyinGuide: string; fill: string }> = {
  red: {
    border: '#dc2626',
    inner: '#fca5a5',
    pinyinGuide: '#fecaca',
    fill: '#fef2f2',
  },
  green: {
    border: '#16a34a',
    inner: '#86efac',
    pinyinGuide: '#bbf7d0',
    fill: '#f0fdf4',
  },
  blue: {
    border: '#2563eb',
    inner: '#93c5fd',
    pinyinGuide: '#bfdbfe',
    fill: '#eff6ff',
  },
  gray: {
    border: '#4b5563',
    inner: '#d1d5db',
    pinyinGuide: '#e5e7eb',
    fill: '#f9fafb',
  },
};

const sizeMap = {
  small: { cellSize: 34, fontSize: 'text-xl', cols: 14, pinyinHeight: 18, pinyinFontSize: '10px' },
  medium: { cellSize: 42, fontSize: 'text-2xl', cols: 12, pinyinHeight: 21, pinyinFontSize: '11.5px' },
  large: { cellSize: 52, fontSize: 'text-3xl', cols: 10, pinyinHeight: 25, pinyinFontSize: '13px' },
};

/**
 * Pinyin syllable extractor that supports:
 * - Single syllables: Shàng, gè, hǎo, wǒ
 * - Compound words: zhōumò -> [zhōu, mò], tiānqì -> [tiān, qì], fēicháng -> [fēi, cháng]
 * - Tone numbers: ni3 -> ni3, hao3 -> hao3
 */
const PINYIN_SYLLABLE_REGEX = /(?:zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?[aeiouüvāáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜ]+(?:ng|n|r)?[1-5]?/gi;

const PUNCTUATION_REGEX = /[，。！？、“”：；《》、（）,.!?:;—…\s]/;

export const ChineseContinuousSheet: React.FC<ChineseContinuousSheetProps> = ({
  config,
  data,
}) => {
  const colors = colorMap[config.gridColor] || colorMap.red;
  const currentSize = sizeMap[config.gridSize] || sizeMap.medium;
  const cols = currentSize.cols;

  // Extract all individual Pinyin syllables
  const pinyinMatches = (data.transcription || '').match(PINYIN_SYLLABLE_REGEX) || [];

  // Align each ideogram with its exact Pinyin syllable
  const allChars: string[] = Array.from((data.originalText || '').trim());
  const alignedCells: CellData[] = [];
  let pinyinIdx = 0;

  for (let i = 0; i < allChars.length; i++) {
    const char = allChars[i];

    // Check for newline (paragraph break)
    if (char === '\n') {
      // Pad to the end of the current row so the next paragraph starts on a new line
      const remainder = alignedCells.length % cols;
      if (remainder > 0) {
        const fillCount = cols - remainder;
        for (let k = 0; k < fillCount; k++) {
          alignedCells.push({ char: '', pinyin: '', isPunctuation: false });
        }
      }
      continue;
    }

    const isPunct = PUNCTUATION_REGEX.test(char);
    if (isPunct) {
      // Punctuation occupies its own cell without a pinyin syllable
      alignedCells.push({
        char,
        pinyin: '',
        isPunctuation: true,
      });
    } else {
      // Chinese character gets its 1-to-1 corresponding Pinyin syllable
      const pinyin = pinyinIdx < pinyinMatches.length ? pinyinMatches[pinyinIdx] : '';
      pinyinIdx++;
      alignedCells.push({
        char,
        pinyin,
        isPunctuation: false,
      });
    }
  }

  // Divide into continuous notebook lines
  const totalContentRows = Math.max(1, Math.ceil(alignedCells.length / cols));
  const totalRows = Math.max(totalContentRows + config.extraBlankLines, 6);

  const rows: CellData[][] = [];
  for (let r = 0; r < totalRows; r++) {
    const startIdx = r * cols;
    const rowCells = alignedCells.slice(startIdx, startIdx + cols);

    // Fill the rest of the row with empty cells
    while (rowCells.length < cols) {
      rowCells.push({ char: '', pinyin: '', isPunctuation: false });
    }

    rows.push(rowCells);
  }

  // Render a Tianzige / Mige / Fangge cell
  const renderCell = (cell: CellData, cellIdx: number, rowIdx: number) => {
    return (
      <div
        key={`zh-cell-${rowIdx}-${cellIdx}`}
        className="grid-cell relative flex items-center justify-center select-none overflow-hidden"
        style={{
          width: `${currentSize.cellSize}px`,
          height: `${currentSize.cellSize}px`,
          borderLeft: `1.5px solid ${colors.border}`,
          borderRight: cellIdx === cols - 1 ? `1.5px solid ${colors.border}` : 'none',
          borderTop: config.showTranscription ? 'none' : `1.5px solid ${colors.border}`,
          borderBottom: `1.5px solid ${colors.border}`,
          backgroundColor: '#ffffff',
          marginRight: cellIdx === cols - 1 ? '0px' : '-1.5px',
          boxSizing: 'border-box',
        }}
      >
        {/* SVG Guides inside cell */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {config.gridType === 'tianzige' && (
            <>
              <line x1="0" y1="50" x2="100" y2="50" stroke={colors.inner} strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1="50" y1="0" x2="50" y2="100" stroke={colors.inner} strokeWidth="1.2" strokeDasharray="3 3" />
            </>
          )}
          {config.gridType === 'mige' && (
            <>
              <line x1="0" y1="0" x2="100" y2="100" stroke={colors.inner} strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1="100" y1="0" x2="0" y2="100" stroke={colors.inner} strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1="0" y1="50" x2="100" y2="50" stroke={colors.inner} strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1="50" y1="0" x2="50" y2="100" stroke={colors.inner} strokeWidth="1.2" strokeDasharray="3 3" />
            </>
          )}
        </svg>

        {/* Character */}
        {cell.char && (
          <span
            className={`relative z-10 font-bold leading-none ${currentSize.fontSize} ${
              cell.isPunctuation ? 'text-neutral-600 translate-x-[-15%] translate-y-[-15%]' : 'text-neutral-900'
            }`}
            style={{ fontFamily: '"Noto Serif SC", "Noto Sans SC", STKaiti, KaiTi, serif' }}
          >
            {cell.char}
          </span>
        )}
      </div>
    );
  };

  return (
    <div id="chinese-continuous-sheet" className="w-full flex flex-col items-center">
      {/* Grid container */}
      <div className="w-full overflow-x-auto py-2">
        <div className="inline-flex flex-col space-y-3 min-w-full items-center">
          {rows.map((row, rIdx) => {
            return (
              <div key={`zh-row-${rIdx}`} className="flex flex-col">
                {/* Upper Pinyin row: each Pinyin cell is placed directly above its corresponding ideogram */}
                {config.showTranscription && (
                  <div className="flex flex-row">
                    {row.map((cell, cIdx) => (
                      <div
                        key={`zh-pinyin-${rIdx}-${cIdx}`}
                        className="relative flex items-center justify-center select-none overflow-hidden"
                        style={{
                          width: `${currentSize.cellSize}px`,
                          height: `${currentSize.pinyinHeight}px`,
                          borderTop: `1.5px solid ${colors.border}`,
                          borderLeft: `1.5px solid ${colors.border}`,
                          borderRight: cIdx === cols - 1 ? `1.5px solid ${colors.border}` : 'none',
                          borderBottom: `1px solid ${colors.inner}`,
                          marginRight: cIdx === cols - 1 ? '0px' : '-1.5px',
                          backgroundColor: colors.fill,
                          boxSizing: 'border-box',
                        }}
                      >
                        {/* Authentic Sì Xiàn Sān Gé (四线三格) Pinyin notebook guide lines */}
                        <div
                          className="absolute inset-x-0 pointer-events-none"
                          style={{
                            top: '33%',
                            borderBottom: `0.8px dotted ${colors.pinyinGuide}`,
                          }}
                        />
                        <div
                          className="absolute inset-x-0 pointer-events-none"
                          style={{
                            top: '66%',
                            borderBottom: `0.8px dotted ${colors.pinyinGuide}`,
                          }}
                        />

                        {/* Perfectly aligned Pinyin syllable */}
                        {cell.pinyin && (
                          <span
                            className="relative z-10 font-medium text-neutral-800 tracking-tight leading-none text-center truncate max-w-full px-0.5"
                            style={{
                              fontSize: currentSize.pinyinFontSize,
                              fontFamily: 'system-ui, -apple-system, sans-serif',
                            }}
                          >
                            {cell.pinyin}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Character grid row */}
                <div className="flex flex-row">
                  {row.map((cell, cIdx) => renderCell(cell, cIdx, rIdx))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Translation Section (Clean, unified layout) */}
      {config.showTranslation && data.translation && (
        <div className="w-full mt-8 pt-4 border-t-2 border-neutral-200">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white"
              style={{ backgroundColor: colors.border }}
            >
              Traduzione del Tema (Italiano)
            </span>
          </div>
          <div className="bg-neutral-50/80 p-4 rounded-lg border border-neutral-200">
            <p className="text-sm text-neutral-800 leading-relaxed italic font-serif">
              {data.translation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
