import { Chapter, ComicPage, ProcessingStatus } from '../types';
import { CHAPTER_KEYWORDS } from '../constants';

// Helper to extract number from string (e.g., "Chap 10.5" -> 10.5)
const extractChapterNumber = (name: string): number | null => {
  const normalized = name.toLowerCase();
  // Check if it contains any chapter keyword
  const hasKeyword = CHAPTER_KEYWORDS.some(k => normalized.includes(k));
  
  if (!hasKeyword) return null;

  // Regex to find numbers, allowing decimals (1, 01, 1.5, 10.5)
  // We look for a number that might follow a keyword or just be in the string
  const match = normalized.match(/(\d+(\.\d+)?)/);
  if (match) {
    return parseFloat(match[0]);
  }
  return null;
};

// Check if a file is an image
const isImage = (file: File) => {
  return file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(file.name);
};

export const parseFolderUpload = (files: FileList): Chapter[] => {
  const chaptersMap: Record<string, ComicPage[]> = {};
  const unsortedFiles: File[] = [];

  Array.from(files).forEach((file) => {
    if (!isImage(file)) return;

    // file.webkitRelativePath gives "Folder/Subfolder/File.jpg"
    const pathParts = file.webkitRelativePath.split('/');
    
    // If it's just in the root, put in a "Root" bucket or handle separately
    if (pathParts.length < 2) {
      unsortedFiles.push(file);
      return;
    }

    // The chapter folder is usually the second to last part, 
    // but typically user uploads "ComicName/Chapter 1/img.jpg"
    // So chapter folder is pathParts[pathParts.length - 2]
    const chapterName = pathParts[pathParts.length - 2];
    
    if (!chaptersMap[chapterName]) {
      chaptersMap[chapterName] = [];
    }

    const page: ComicPage = {
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      file: file,
      path: file.webkitRelativePath,
      previewUrl: URL.createObjectURL(file),
      status: ProcessingStatus.IDLE,
      result: null,
    };

    chaptersMap[chapterName].push(page);
  });

  // Sort pages within chapters (alphanumeric sort for filenames: 001.jpg, 002.jpg)
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

  const chapters: Chapter[] = Object.entries(chaptersMap).map(([name, pages]) => {
    const number = extractChapterNumber(name);
    return {
      id: name,
      name,
      pages: pages.sort((a, b) => collator.compare(a.name, b.name)),
      order: number !== null ? number : Infinity,
      isSpecial: number === null, // If no number found, treat as special/extra
    };
  });

  // Sort Chapters
  // 1. By extracted number
  // 2. Specials go to end, keeping their relative alphabetic order
  chapters.sort((a, b) => {
    // Both have numbers
    if (!a.isSpecial && !b.isSpecial) {
      return a.order - b.order;
    }
    // Only A is special -> B comes first
    if (a.isSpecial && !b.isSpecial) return 1;
    // Only B is special -> A comes first
    if (!a.isSpecial && b.isSpecial) return -1;
    
    // Both special -> Alphabetical
    return collator.compare(a.name, b.name);
  });

  return chapters;
};