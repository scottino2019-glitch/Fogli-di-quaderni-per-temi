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

const columnMap = {
  small: 14,
  medium: 12,
  large: 10,
};

const PINYIN_SYLLABLE_REGEX = /(?:zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?[aeiouüvāáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜ]+(?:ng|n|r)?[1-5]?/gi;
const PUNCTUATION_REGEX = /[，。！？、“”：；《》、（）,.!?:;—…\s]/;

export const ChineseContinuousSheet: React.FC<ChineseContinuousSheetProps> = ({
  config,
  data,
}) => {
  const colors = colorMap[config.gridColor] || colorMap.red;
  const cols = columnMap[config.gridSize] || columnMap.medium;

  // Font multiplier for user-selectable font size
  const fontMultiplier =
    config.fontSizeModifier === 'huge'
      ? 1.25
      : config.fontSizeModifier === 'large'
      ? 1.12
      : 1.0;

  // Extract all individual Pinyin syllables
  const pinyinMatches = (data.transcription || '').match(PINYIN_SYLLABLE_REGEX) || [];

  // Align each ideogram with its exact Pinyin syllable
  const allChars: string[] = Array.from((data.originalText || '').trim());
  const alignedCells: CellData[] = [];
  let pinyinIdx = 0;

  for (let i = 0; i < allChars.length; i++) {
    const char = allChars[i];

    // Paragraph break
    if (char === '\n') {
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
      alignedCells.push({
        char,
        pinyin: '',
        isPunctuation: true,
      });
    } else {
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

    while (rowCells.length < cols) {
      rowCells.push({ char: '', pinyin: '', isPunctuation: false });
    }

    rows.push(rowCells);
  }

  return (
    <div
      id="chinese-continuous-sheet"
      className="w-full flex flex-col"
      style={{ containerType: 'inline-size' }}
    >
      {/* Grid container: 100% fluid, zero horizontal scrolling */}
      <div className="w-full flex flex-col space-y-2.5 py-1">
        {rows.map((row, rIdx) => {
          return (
            <div key={`zh-row-${rIdx}`} className="w-full flex flex-col">
              {/* Upper Pinyin row: 1-to-1 matching cell above ideogram */}
              {config.showTranscription && (
                <div
                  className="w-full"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  }}
                >
                  {row.map((cell, cIdx) => (
                    <div
                      key={`zh-pinyin-${rIdx}-${cIdx}`}
                      className="relative flex items-center justify-center select-none overflow-hidden"
                      style={{
                        width: '100%',
                        aspectRatio: '1 / 0.52',
                        borderTop: `1.5px solid ${colors.border}`,
                        borderLeft: `1.5px solid ${colors.border}`,
                        borderRight: cIdx === cols - 1 ? `1.5px solid ${colors.border}` : 'none',
                        borderBottom: `1px solid ${colors.inner}`,
                        backgroundColor: colors.fill,
                        boxSizing: 'border-box',
                      }}
                    >
                      {/* Sì Xiàn Sān Gé (四线三格) Pinyin notebook guide lines */}
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

                      {/* Aligned Pinyin syllable */}
                      {cell.pinyin && (
                        <span
                          className="relative z-10 font-bold text-neutral-950 tracking-tight leading-none text-center truncate max-w-full px-0.5"
                          style={{
                            fontSize: `clamp(8px, ${2.2 * fontMultiplier}cqi, ${14 * fontMultiplier}px)`,
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
              <div
                className="w-full"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                }}
              >
                {row.map((cell, cIdx) => (
                  <div
                    key={`zh-cell-${rIdx}-${cIdx}`}
                    className="grid-cell relative flex items-center justify-center select-none overflow-hidden"
                    style={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      borderLeft: `1.5px solid ${colors.border}`,
                      borderRight: cIdx === cols - 1 ? `1.5px solid ${colors.border}` : 'none',
                      borderTop: config.showTranscription ? 'none' : `1.5px solid ${colors.border}`,
                      borderBottom: `1.5px solid ${colors.border}`,
                      backgroundColor: '#ffffff',
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
                        className={`relative z-10 font-bold leading-none select-none ${
                          cell.isPunctuation ? 'text-neutral-700 translate-x-[-15%] translate-y-[-15%]' : 'text-neutral-950'
                        }`}
                        style={{
                          fontSize: `clamp(13px, ${4.8 * fontMultiplier}cqi, ${28 * fontMultiplier}px)`,
                          fontFamily: '"Noto Serif SC", "Noto Sans SC", STKaiti, KaiTi, serif',
                        }}
                      >
                        {cell.char}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Translation Section */}
      {config.showTranslation && data.translation && (
        <div className="w-full mt-6 pt-4 border-t border-neutral-200">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded text-white shadow-2xs"
              style={{ backgroundColor: colors.border }}
            >
              Traduzione del Tema (Italiano)
            </span>
          </div>
          <div className="bg-neutral-50/90 p-3.5 sm:p-4 rounded-lg border border-neutral-200">
            <p className="text-sm sm:text-base text-neutral-800 leading-relaxed italic font-serif">
              {data.translation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
