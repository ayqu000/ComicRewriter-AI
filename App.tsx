import React, { useState, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { ApiKeyInput } from './components/ApiKeyInput';
import { Chapter, ComicData, ProcessingStatus, Language } from './types';
import { parseFolderUpload } from './utils/fileHelpers';
import { processImageWithGemini } from './services/geminiService';
import { Upload, Play, Ban, Download, Globe } from 'lucide-react';
import { TRANSLATIONS, SYSTEM_INSTRUCTIONS } from './constants';

export default function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [data, setData] = useState<ComicData>({ chapters: [] });
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [language, setLanguage] = useState<Language>('vi');
  
  // Ref to stop queue processing
  const stopProcessingRef = useRef(false);

  const t = TRANSLATIONS[language];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const parsedChapters = parseFolderUpload(e.target.files);
      setData({ chapters: parsedChapters });
      
      // Auto-select first page if available
      if (parsedChapters.length > 0 && parsedChapters[0].pages.length > 0) {
        setCurrentChapterId(parsedChapters[0].id);
        setCurrentPageId(parsedChapters[0].pages[0].id);
      }
    }
  };

  const handleSelectPage = (chapterId: string, pageId: string) => {
    setCurrentChapterId(chapterId);
    setCurrentPageId(pageId);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'vi' : 'en');
  };

  // Helper to update page status in state (deep immutable update)
  const updatePageStatus = (
    chapterId: string, 
    pageId: string, 
    status: ProcessingStatus, 
    result: string | null = null,
    error: string | undefined = undefined
  ) => {
    setData(prev => ({
      chapters: prev.chapters.map(ch => {
        if (ch.id !== chapterId) return ch;
        return {
          ...ch,
          pages: ch.pages.map(pg => {
            if (pg.id !== pageId) return pg;
            return { ...pg, status, result, error };
          })
        };
      })
    }));
  };

  const processPage = async (chapterId: string, pageId: string) => {
    const chapter = data.chapters.find(c => c.id === chapterId);
    const page = chapter?.pages.find(p => p.id === pageId);

    if (!chapter || !page || !apiKey) return;

    updatePageStatus(chapterId, pageId, ProcessingStatus.PROCESSING);

    try {
      // Select instructions based on current language
      const instruction = SYSTEM_INSTRUCTIONS[language];
      const result = await processImageWithGemini(apiKey, page.file, instruction);
      updatePageStatus(chapterId, pageId, ProcessingStatus.DONE, result);
    } catch (err: any) {
      updatePageStatus(chapterId, pageId, ProcessingStatus.ERROR, null, err.message);
    }
  };

  const startQueue = async () => {
    if (!apiKey) {
      alert("Please set an API Key first.");
      return;
    }
    
    setIsProcessingQueue(true);
    stopProcessingRef.current = false;

    // Flatten all pages to create a sequence
    for (const chapter of data.chapters) {
      for (const page of chapter.pages) {
        if (stopProcessingRef.current) break;
        
        // Skip already done or processing
        if (page.status === ProcessingStatus.DONE) continue;
        
        // Select the page being processed so the user sees it
        setCurrentChapterId(chapter.id);
        setCurrentPageId(page.id);

        await processPage(chapter.id, page.id);
        
        // Small delay to be gentle on rate limits (even though sequential)
        await new Promise(r => setTimeout(r, 1000));
      }
      if (stopProcessingRef.current) break;
    }

    setIsProcessingQueue(false);
  };

  const stopQueue = () => {
    stopProcessingRef.current = true;
    setIsProcessingQueue(false);
  };

  const exportData = () => {
    const exportContent = data.chapters.map(ch => {
        const pagesContent = ch.pages
            .filter(p => p.status === ProcessingStatus.DONE && p.result)
            .map(p => `--- PAGE: ${p.name} ---\n${p.result}`)
            .join('\n\n');
        return `=== CHAPTER: ${ch.name} ===\n\n${pagesContent}`;
    }).join('\n\n==========================================\n\n');

    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comic_rewrite_output.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentChapter = data.chapters.find(c => c.id === currentChapterId);
  const currentPage = currentChapter?.pages.find(p => p.id === currentPageId);

  // Stats
  const totalPages = data.chapters.reduce((acc, ch) => acc + ch.pages.length, 0);
  const donePages = data.chapters.reduce((acc, ch) => acc + ch.pages.filter(p => p.status === ProcessingStatus.DONE).length, 0);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            CR
          </div>
          <h1 className="font-semibold text-lg tracking-tight hidden sm:block">ComicRewriter <span className="text-zinc-500 font-normal">AI</span></h1>
        </div>

        <div className="flex items-center space-x-4 sm:space-x-6 flex-1 justify-end">
          {/* Progress Bar */}
          {totalPages > 0 && (
            <div className="hidden md:flex flex-col w-48 space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                 <span>{t.progress}</span>
                 <span>{Math.round((donePages / totalPages) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300" 
                  style={{ width: `${(donePages / totalPages) * 100}%` }} 
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
             <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-zinc-700 flex items-center gap-2">
                <Upload size={16} />
                <span className="hidden sm:inline">{t.openFolder}</span>
                <input 
                  type="file" 
                  className="hidden" 
                  // @ts-ignore - directory attributes are non-standard but supported
                  webkitdirectory="" 
                  directory="" 
                  onChange={handleFileUpload} 
                />
             </label>

             {totalPages > 0 && (
                 <>
                   {!isProcessingQueue ? (
                      <button 
                        onClick={startQueue}
                        disabled={!apiKey}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-900/20"
                      >
                        <Play size={16} fill="currentColor" />
                        <span className="hidden sm:inline">{t.processAll}</span>
                      </button>
                   ) : (
                      <button 
                        onClick={stopQueue}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 border border-red-500/20"
                      >
                        <Ban size={16} />
                        <span className="hidden sm:inline">{t.stop}</span>
                      </button>
                   )}

                   <button 
                     onClick={exportData}
                     className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-zinc-700 flex items-center gap-2"
                   >
                     <Download size={16} />
                     <span className="hidden sm:inline">{t.export}</span>
                   </button>
                 </>
             )}
          </div>
          
          <div className="w-px h-8 bg-zinc-800 mx-2"></div>
          
          {/* Language Switcher */}
          <button 
            onClick={toggleLanguage}
            className="flex items-center space-x-1 text-zinc-400 hover:text-white transition-colors"
            title="Switch Language"
          >
             <Globe size={16} />
             <span className="text-sm font-medium uppercase">{language}</span>
          </button>

          <div className="w-px h-8 bg-zinc-800 mx-2 hidden sm:block"></div>
          
          <div className="hidden sm:block w-64">
            <ApiKeyInput onKeySet={setApiKey} language={language} />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          chapters={data.chapters}
          currentChapterId={currentChapterId}
          currentPageId={currentPageId}
          onSelectPage={handleSelectPage}
          language={language}
        />
        <MainContent 
          page={currentPage || null}
          isProcessing={currentPage?.status === ProcessingStatus.PROCESSING}
          onRetry={() => currentChapterId && currentPageId && processPage(currentChapterId, currentPageId)}
          onProcessSingle={() => currentChapterId && currentPageId && processPage(currentChapterId, currentPageId)}
          language={language}
        />
      </div>
    </div>
  );
}