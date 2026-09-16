import React from 'react';
import { SheetConfig, EssayData, GridColor } from '../types';

interface RussianContinuousSheetProps {
  config: SheetConfig;
  data: EssayData;
}

const colorMap: Record<GridColor, { line: string; diagonal: string; margin: string }> = {
  blue: {
    line: '#3b82f6',
    diagonal: '#93c5fd',
    margin: '#ef4444',
  },
  green: {
    line: '#10b981',
    diagonal: '#a7f3d0',
    margin: '#ef4444',
  },
  red: {
    line: '#f87171',
    diagonal: '#fca5a5',
    margin: '#b91c1c',
  },
  gray: {
    line: '#6b7280',
    diagonal: '#d1d5db',
    margin: '#ef4444',
  },
};

const fontMap: Record<string, string> = {
  handwriting: '"Caveat", "Marck Script", cursive',
  serif: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
  sans: '"Plus Jakarta Sans", system-ui, sans-serif',
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
  const maxCharsPerLine = config.gridSize === 'small' ? 38 : config.gridSize === 'medium' ? 30 : 24;

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
  const rowHeight = config.gridSize === 'small' ? 36 : config.gridSize === 'medium' ? 42 : 50;

  // Font multiplier for user-selectable font size
  const fontMultiplier =
    config.fontSizeModifier === 'huge'
      ? 1.25
      : config.fontSizeModifier === 'large'
      ? 1.12
      : 1.0;

  const baseCalculatedFontSize =
    config.fontFamily === 'handwriting'
      ? Math.round(rowHeight * 0.68 * fontMultiplier)
      : Math.round(rowHeight * 0.58 * fontMultiplier);

  return (
    <div
      id="russian-continuous-sheet"
      className="w-full flex flex-col"
      style={{ containerType: 'inline-size' }}
    >
      {/* Continuous Russian Notebook Page with Left Margin (Красные поля) */}
      <div className="relative w-full bg-white border border-neutral-300 rounded-lg shadow-2xs overflow-hidden">
        {/* Authentic Russian Left Margin Line (Red Line) */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-20"
          style={{
            left: '52px',
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
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `repeating-linear-gradient(65deg, transparent, transparent 23px, ${colors.diagonal} 23px, ${colors.diagonal} 24px)`,
                      opacity: 0.65,
                    }}
                  />
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

                {/* Secondary auxiliary line for Kosaya */}
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
                  className="w-[48px] pl-2 text-[10px] font-mono text-neutral-400 select-none z-10 flex-shrink-0"
                >
                  {idx + 1}
                </div>

                {/* Handwritten/cursive text flowing continuously on the baseline */}
                <div
                  className="flex-1 pl-3 pr-3 relative z-10 flex items-baseline overflow-hidden"
                  style={{
                    transform: 'translateY(-2px)',
                  }}
                >
                  {lineText ? (
                    <span
                      className="text-neutral-950 leading-none select-none font-semibold truncate max-w-full"
                      style={{
                        fontFamily: selectedFont,
                        fontSize: `clamp(14px, ${3.5 * fontMultiplier}cqi, ${baseCalculatedFontSize}px)`,
                        letterSpacing: config.fontFamily === 'handwriting' ? '0.03em' : '0.015em',
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

      {/* Transcription & Translation Section */}
      <div className="w-full mt-6 space-y-3">
        {config.showTranscription && data.transcription && (
          <div className="p-3.5 sm:p-4 bg-blue-50/90 border border-blue-200 rounded-lg">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
              Trascrizione Fonetica & Accenti
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
