import React from 'react';
import { SheetConfig, EssayData, GridColor } from '../types';

interface ChineseContinuousSheetProps {
  config: SheetConfig;
  data: EssayData;
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
  small: { cellSize: 34, fontSize: 'text-xl', cols: 14, pinyinHeight: 18 },
  medium: { cellSize: 42, fontSize: 'text-2xl', cols: 12, pinyinHeight: 20 },
  large: { cellSize: 52, fontSize: 'text-3xl', cols: 10, pinyinHeight: 24 },
};

export const ChineseContinuousSheet: React.FC<ChineseContinuousSheetProps> = ({
  config,
  data,
}) => {
  const colors = colorMap[config.gridColor] || colorMap.red;
  const currentSize = sizeMap[config.gridSize] || sizeMap.medium;

  // Split text into characters (including punctuation)
  const allChars: string[] = Array.from((data.originalText || '').trim());
  const cols = currentSize.cols;

  // Split pinyin into tokens roughly matching characters or lines
  const pinyinTokens = (data.transcription || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  // Divide into continuous notebook lines
  const totalContentRows = Math.max(1, Math.ceil(allChars.length / cols));
  const totalRows = Math.max(totalContentRows + config.extraBlankLines, 6);

  const rows: { chars: string[]; pinyinSnippet?: string }[] = [];
  for (let r = 0; r < totalRows; r++) {
    const startIdx = r * cols;
    const rowChars = allChars.slice(startIdx, startIdx + cols);

    // Fill the rest of the row with empty cells
    while (rowChars.length < cols) {
      rowChars.push('');
    }

    // Rough matching for pinyin line if transcription is present
    let pinyinSnippet = '';
    if (r < totalContentRows && pinyinTokens.length > 0) {
      const pinyinStart = r * cols;
      pinyinSnippet = pinyinTokens.slice(pinyinStart, pinyinStart + cols).join(' ');
    }

    rows.push({ chars: rowChars, pinyinSnippet });
  }

  // Render a Tianzige / Mige / Fangge cell
  const renderCell = (char: string, cellIdx: number, rowIdx: number) => {
    const isPunctuation = /[，。！？、“”：；《》、（）]/.test(char);

    return (
      <div
        key={`zh-cell-${rowIdx}-${cellIdx}`}
        className="grid-cell"
        style={{
          width: `${currentSize.cellSize}px`,
          height: `${currentSize.cellSize}px`,
          border: `1.5px solid ${colors.border}`,
          backgroundColor: '#ffffff',
          marginRight: '-1.5px', // Merges borders into continuous grid
          marginBottom: '-1.5px',
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
        {char && (
          <span
            className={`relative z-10 font-bold leading-none ${currentSize.fontSize} ${
              isPunctuation ? 'text-neutral-600 translate-x-[-15%] translate-y-[-15%]' : 'text-neutral-900'
            }`}
            style={{ fontFamily: '"Noto Serif SC", "Noto Sans SC", STKaiti, KaiTi, serif' }}
          >
            {char}
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
            const hasContentInRow = row.chars.some((c) => Boolean(c));

            return (
              <div key={`zh-row-${rIdx}`} className="flex flex-col">
                {/* Upper Pinyin strip (authentic Chinese 拼音田字格本 style) */}
                {config.showTranscription && (
                  <div
                    className="relative flex items-center px-1"
                    style={{
                      width: `${currentSize.cellSize * cols}px`,
                      height: `${currentSize.pinyinHeight}px`,
                      borderTop: `1px dashed ${colors.pinyinGuide}`,
                      borderBottom: `1px solid ${colors.border}`,
                      backgroundColor: colors.fill,
                    }}
                  >
                    {/* Intermediate guiding line for Pinyin diacritics */}
                    <div
                      className="absolute inset-x-0 pointer-events-none"
                      style={{
                        top: '50%',
                        borderBottom: `0.8px dotted ${colors.pinyinGuide}`,
                      }}
                    />
                    <span
                      className="relative z-10 text-[11px] font-medium tracking-wider text-neutral-700 font-sans truncate"
                      style={{ letterSpacing: '0.08em' }}
                    >
                      {row.pinyinSnippet || (hasContentInRow ? '' : '')}
                    </span>
                  </div>
                )}

                {/* Character grid row */}
                <div className="flex flex-row">
                  {row.chars.map((char, cIdx) => renderCell(char, cIdx, rIdx))}
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
