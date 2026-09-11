import React from 'react';
import { SheetConfig, EssayData, GridColor } from '../types';

interface RussianContinuousSheetProps {
  config: SheetConfig;
  data: EssayData;
}

const colorMap: Record<GridColor, { line: string; diagonal: string; bg: string }> = {
  blue: {
    line: '#3b82f6',
    diagonal: '#bfdbfe',
    bg: '#eff6ff',
  },
  green: {
    line: '#16a34a',
    diagonal: '#bbf7d0',
    bg: '#f0fdf4',
  },
  red: {
    line: '#dc2626',
    diagonal: '#fca5a5',
    bg: '#fef2f2',
  },
  gray: {
    line: '#6b7280',
    diagonal: '#e5e7eb',
    bg: '#f9fafb',
  },
};

const fontMap = {
  standard: '"Cormorant Garamond", Georgia, serif',
  serif: '"Cormorant Garamond", "Times New Roman", serif',
  handwriting: '"Marck Script", "Caveat", cursive',
};

export const RussianContinuousSheet: React.FC<RussianContinuousSheetProps> = ({
  config,
  data,
}) => {
  const colors = colorMap[config.gridColor] || colorMap.blue;
  const selectedFont = fontMap[config.fontFamily] || fontMap.handwriting;

  // Split original text into sentences or continuous lines
  const text = (data.originalText || '').trim();
  const words = text ? text.split(/\s+/) : [];

  // Group words into lines that fit the page width naturally
  const lines: string[] = [];
  let currentLine = '';
  const maxCharsPerLine = config.gridSize === 'small' ? 65 : config.gridSize === 'medium' ? 52 : 40;

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length > maxCharsPerLine) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += (currentLine ? ' ' : '') + word;
    }
  }
  if (currentLine) {
    lines.push(currentLine.trim());
  }

  const contentLineCount = Math.max(1, lines.length);
  const totalLineCount = Math.max(contentLineCount + config.extraBlankLines, 8);

  const allDisplayLines: string[] = [];
  for (let i = 0; i < totalLineCount; i++) {
    allDisplayLines.push(lines[i] || '');
  }

  // Row heights based on selected size
  const rowHeight = config.gridSize === 'small' ? 44 : config.gridSize === 'medium' ? 54 : 64;

  return (
    <div id="russian-continuous-sheet" className="w-full flex flex-col items-center">
      <div className="w-full overflow-x-auto py-2">
        {/* Continuous Russian Notebook Page with Left Margin (Красные поля) */}
        <div
          className="relative mx-auto bg-white border border-neutral-300 rounded shadow-sm overflow-hidden"
          style={{ width: '100%', maxWidth: '780px' }}
        >
          {/* Authentic Russian Left Margin Line (Red Line at ~65px from left) */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-20"
            style={{
              left: '68px',
              width: '1.5px',
              backgroundColor: '#ef4444',
            }}
          />

          {/* Lines container */}
          <div className="w-full flex flex-col">
            {allDisplayLines.map((lineText, idx) => {
              return (
                <div
                  key={`ru-line-${idx}`}
                  className="relative w-full flex items-center"
                  style={{
                    height: `${rowHeight}px`,
                    borderBottom: `1px solid ${colors.line}`,
                  }}
                >
                  {/* Diagonal slanted lines (Косая линейка) */}
                  {config.gridType === 'kosaya' && (
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{ opacity: 0.65 }}
                    >
                      <defs>
                        <pattern
                          id={`kosaya-pattern-${idx}`}
                          width="24"
                          height={rowHeight}
                          patternUnits="userSpaceOnUse"
                        >
                          <line
                            x1="0"
                            y1={rowHeight}
                            x2="14"
                            y2="0"
                            stroke={colors.diagonal}
                            strokeWidth="0.8"
                          />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#kosaya-pattern-${idx})`} />
                    </svg>
                  )}

                  {/* Kletka (Grid/Checkers) pattern */}
                  {config.gridType === 'kletka' && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: `linear-gradient(to right, ${colors.diagonal} 1px, transparent 1px), linear-gradient(to bottom, ${colors.diagonal} 1px, transparent 1px)`,
                        backgroundSize: '16px 16px',
                        opacity: 0.5,
                      }}
                    />
                  )}

                  {/* Secondary auxiliary line for Kosaya (midline for lowercase letters) */}
                  {config.gridType === 'kosaya' && (
                    <div
                      className="absolute inset-x-0 pointer-events-none"
                      style={{
                        top: '38%',
                        borderBottom: `0.8px dashed ${colors.diagonal}`,
                      }}
                    />
                  )}

                  {/* Line index on left margin */}
                  <div
                    className="w-[60px] pl-2 text-[10px] font-mono text-neutral-400 select-none z-10"
                    style={{ flexShrink: 0 }}
                  >
                    {idx + 1}
                  </div>

                  {/* The actual handwritten/cursive text flowing continuously on the baseline */}
                  <div
                    className="flex-1 pl-4 pr-6 relative z-10 flex items-baseline overflow-hidden"
                    style={{
                      transform: 'translateY(-2px)',
                    }}
                  >
                    {lineText ? (
                      <span
                        className="text-neutral-900 leading-none"
                        style={{
                          fontFamily: selectedFont,
                          fontSize:
                            config.fontFamily === 'handwriting'
                              ? `${rowHeight * 0.52}px`
                              : `${rowHeight * 0.38}px`,
                          letterSpacing: config.fontFamily === 'handwriting' ? '0.04em' : '0.02em',
                        }}
                      >
                        {lineText}
                      </span>
                    ) : (
                      <span className="text-transparent select-none">&nbsp;</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transcription & Translation Section */}
      <div className="w-full mt-6 space-y-4">
        {config.showTranscription && data.transcription && (
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-1.5 flex items-center gap-1.5">
              <span>Trascrizione Fonetica & Accenti</span>
            </div>
            <p className="text-sm font-mono text-neutral-800 leading-relaxed">
              {data.transcription}
            </p>
          </div>
        )}

        {config.showTranslation && data.translation && (
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Traduzione del Tema (Italiano)
            </div>
            <p className="text-sm text-neutral-800 leading-relaxed italic font-serif">
              {data.translation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
