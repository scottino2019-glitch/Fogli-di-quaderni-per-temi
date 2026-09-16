import React from 'react';
import { SheetConfig, EssayData, GridColor } from '../types';

interface KoreanContinuousSheetProps {
  config: SheetConfig;
  data: EssayData;
}

const colorMap: Record<GridColor, { border: string; guide: string; light: string }> = {
  green: {
    border: '#15803d',
    guide: '#86efac',
    light: '#f0fdf4',
  },
  red: {
    border: '#b91c1c',
    guide: '#fca5a5',
    light: '#fef2f2',
  },
  blue: {
    border: '#1d4ed8',
    guide: '#93c5fd',
    light: '#eff6ff',
  },
  gray: {
    border: '#374151',
    guide: '#d1d5db',
    light: '#f9fafb',
  },
};

const columnMap = {
  small: 14,
  medium: 12,
  large: 10,
};

export const KoreanContinuousSheet: React.FC<KoreanContinuousSheetProps> = ({
  config,
  data,
}) => {
  const colors = colorMap[config.gridColor] || colorMap.green;
  const cols = columnMap[config.gridSize] || columnMap.medium;

  // Font multiplier for user-selectable font size
  const fontMultiplier =
    config.fontSizeModifier === 'huge'
      ? 1.25
      : config.fontSizeModifier === 'large'
      ? 1.12
      : 1.0;

  // Wongoji rules: characters and spaces fill cells sequentially
  const fullText = (data.originalText || '').trim();
  const chars: string[] = fullText.split('');

  const totalContentRows = Math.max(1, Math.ceil(chars.length / cols));
  const totalRows = Math.max(totalContentRows + config.extraBlankLines, 8);

  const rows: string[][] = [];
  for (let r = 0; r < totalRows; r++) {
    const startIdx = r * cols;
    const rowChars = chars.slice(startIdx, startIdx + cols);
    while (rowChars.length < cols) {
      rowChars.push('');
    }
    rows.push(rowChars);
  }

  return (
    <div
      id="korean-continuous-sheet"
      className="w-full flex flex-col"
      style={{ containerType: 'inline-size' }}
    >
      {/* Wongoji Block */}
      <div className="w-full bg-white p-2.5 sm:p-3.5 border-2 border-neutral-300 rounded-lg shadow-2xs">
        {/* Top header indicator with authentic Wongoji look */}
        <div className="flex justify-between items-center px-1 mb-2 text-[11px] font-mono text-neutral-500">
          <span>200字 / 原稿紙 (Wŏn'go-ji)</span>
          <span>한국어 원고지 형식</span>
        </div>

        <div className="w-full flex flex-col space-y-2">
          {rows.map((rowChars, rIdx) => {
            return (
              <div
                key={`ko-row-${rIdx}`}
                className="w-full"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `24px repeat(${cols}, minmax(0, 1fr))`,
                  alignItems: 'center',
                }}
              >
                {/* Row index */}
                <span className="text-[10px] font-mono text-neutral-400 select-none text-right pr-1.5">
                  {rIdx + 1}
                </span>

                {/* Squares row */}
                {rowChars.map((char, cIdx) => {
                  const isSpace = char === ' ';
                  const isPunctuation = /[.,!?"'~…]/.test(char);

                  return (
                    <div
                      key={`ko-cell-${rIdx}-${cIdx}`}
                      className="grid-cell relative flex items-center justify-center select-none"
                      style={{
                        width: '100%',
                        aspectRatio: '1 / 1',
                        borderTop: `1px solid ${colors.border}`,
                        borderBottom: `1px solid ${colors.border}`,
                        borderRight: `1px solid ${colors.border}`,
                        borderLeft: cIdx === 0 ? `1px solid ${colors.border}` : 'none',
                        backgroundColor: '#ffffff',
                        boxSizing: 'border-box',
                      }}
                    >
                      {/* Inner soft cross guide */}
                      {config.gridType === 'hangul_cross' && (
                        <svg
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          viewBox="0 0 100 100"
                        >
                          <line
                            x1="0"
                            y1="50"
                            x2="100"
                            y2="50"
                            stroke={colors.guide}
                            strokeWidth="0.8"
                            strokeDasharray="2 2"
                          />
                          <line
                            x1="50"
                            y1="0"
                            x2="50"
                            y2="100"
                            stroke={colors.guide}
                            strokeWidth="0.8"
                            strokeDasharray="2 2"
                          />
                        </svg>
                      )}

                      {/* Small corner guides inside Wongoji cell */}
                      <div
                        className="absolute top-0 left-0 w-1.5 h-1.5 pointer-events-none"
                        style={{
                          borderTop: `1px solid ${colors.guide}`,
                          borderLeft: `1px solid ${colors.guide}`,
                        }}
                      />
                      <div
                        className="absolute bottom-0 right-0 w-1.5 h-1.5 pointer-events-none"
                        style={{
                          borderBottom: `1px solid ${colors.guide}`,
                          borderRight: `1px solid ${colors.guide}`,
                        }}
                      />

                      {/* Character content */}
                      {char && !isSpace && (
                        <span
                          className={`relative z-10 font-bold leading-none select-none ${
                            isPunctuation ? 'text-neutral-700 translate-x-[-15%] translate-y-[-15%]' : 'text-neutral-950'
                          }`}
                          style={{
                            fontSize: `clamp(13px, ${4.8 * fontMultiplier}cqi, ${28 * fontMultiplier}px)`,
                            fontFamily: '"Noto Serif KR", "Gowun Batang", "Noto Sans KR", serif',
                          }}
                        >
                          {char}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Transcription & Translation Section */}
      <div className="w-full mt-6 space-y-3">
        {config.showTranscription && data.transcription && (
          <div className="p-3.5 sm:p-4 bg-emerald-50/90 border border-emerald-200 rounded-lg">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">
              Romanizzazione Ufficiale (Revised Romanization)
            </div>
            <p className="text-sm sm:text-base font-mono text-neutral-900 font-medium leading-relaxed">
              {data.transcription}
            </p>
          </div>
        )}

        {config.showTranslation && data.translation && (
          <div className="p-3.5 sm:p-4 bg-neutral-50/90 border border-neutral-200 rounded-lg">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Traduzione del Tema (Italiano)
            </div>
            <p className="text-sm sm:text-base text-neutral-800 leading-relaxed italic font-serif">
              {data.translation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
