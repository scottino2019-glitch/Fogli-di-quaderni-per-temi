export type SupportedLanguage = 'zh' | 'ru' | 'ko';

export type ChineseGridType = 'tianzige' | 'mige' | 'fangge';
export type RussianGridType = 'kosaya' | 'shirokaya' | 'kletka';
export type KoreanGridType = 'wongoji' | 'hangul_cross';

export type GridColor = 'red' | 'green' | 'blue' | 'gray';

export interface SheetHeader {
  title: string;
  studentName: string;
  date: string;
  levelOrTopic: string;
}

export interface EssayData {
  originalText: string;
  transcription: string;
  translation: string;
}

export interface SheetConfig {
  language: SupportedLanguage;
  gridType: string;
  gridColor: GridColor;
  gridSize: 'small' | 'medium' | 'large';
  fontSizeModifier?: 'normal' | 'large' | 'huge';
  showTranscription: boolean;
  showTranslation: boolean;
  translationPosition: 'interlinear' | 'footer';
  fontFamily: 'standard' | 'serif' | 'handwriting';
  extraBlankLines: number;
  header: SheetHeader;
}

export interface LanguageSample {
  language: SupportedLanguage;
  title: string;
  studentName: string;
  levelOrTopic: string;
  originalText: string;
  transcription: string;
  translation: string;
  recommendedGrid: string;
  recommendedColor: GridColor;
}
