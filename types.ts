export enum ProcessingStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

export type Language = 'en' | 'vi';

export interface ComicPage {
  id: string;
  name: string;
  file: File;
  path: string;
  previewUrl: string;
  status: ProcessingStatus;
  result: string | null;
  error?: string;
}

export interface Chapter {
  id: string;
  name: string; // The folder name
  pages: ComicPage[];
  order: number; // For sorting
  isSpecial: boolean; // For "Extra", "Bonus" etc.
}

export interface ComicData {
  chapters: Chapter[];
}

export interface ProcessingStats {
  total: number;
  completed: number;
  failed: number;
  processing: number;
}