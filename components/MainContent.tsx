import React from 'react';
import { ComicPage, ProcessingStatus, Language } from '../types';
import { Loader2, AlertTriangle, RefreshCw, Wand2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface MainContentProps {
  page: ComicPage | null;
  isProcessing: boolean;
  onRetry: () => void;
  onProcessSingle: () => void;
  language: Language;
}

export const MainContent: React.FC<MainContentProps> = ({ 
  page, 
  isProcessing,
  onRetry,
  onProcessSingle,
  language
}) => {
  const t = TRANSLATIONS[language];

  if (!page) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 text-zinc-500 h-full p-8 text-center">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
            <Wand2 className="text-zinc-600" size={32} />
        </div>
        <h3 className="text-xl font-medium text-zinc-300 mb-2">{t.ready}</h3>
        <p className="max-w-md">{t.readyDesc}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-zinc-950 overflow-hidden">
      {/* Toolbar */}
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900">
        <div className="flex items-center space-x-4">
           <h3 className="text-white font-medium truncate max-w-md" title={page.name}>
             {page.name}
           </h3>
           <span className={`text-xs px-2 py-0.5 rounded-full border 
             ${page.status === ProcessingStatus.DONE ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
               page.status === ProcessingStatus.PROCESSING ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
               page.status === ProcessingStatus.ERROR ? 'bg-red-500/10 text-red-400 border-red-500/20' :
               'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
             {page.status}
           </span>
        </div>
        <div className="flex space-x-2">
          {page.status === ProcessingStatus.ERROR && (
             <button 
                onClick={onRetry}
                className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-md text-sm transition-colors border border-red-500/20"
             >
                <RefreshCw size={14} /> <span>{t.retry}</span>
             </button>
          )}
          {(page.status === ProcessingStatus.IDLE || page.status === ProcessingStatus.DONE) && (
              <button 
                onClick={onProcessSingle}
                disabled={isProcessing}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-md text-sm transition-colors font-medium shadow-sm shadow-indigo-900/20"
              >
                {isProcessing ? <Loader2 size={14} className="animate-spin"/> : <Wand2 size={14} />}
                <span>{page.status === ProcessingStatus.DONE ? t.reprocess : t.processPage}</span>
              </button>
          )}
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Image */}
        <div className="flex-1 bg-zinc-950 p-4 overflow-auto flex items-center justify-center border-r border-zinc-800 relative">
             <div className="shadow-2xl shadow-black ring-1 ring-zinc-800">
               <img 
                 src={page.previewUrl} 
                 alt="Comic Page" 
                 className="max-h-[calc(100vh-160px)] object-contain max-w-full"
               />
             </div>
        </div>

        {/* Right: Result */}
        <div className="flex-1 bg-zinc-900/50 flex flex-col overflow-hidden min-w-[300px] max-w-[600px]">
           <div className="p-3 bg-zinc-900 border-b border-zinc-800 text-xs font-medium text-zinc-400 uppercase tracking-wider flex justify-between">
              <span>{t.aiOutput}</span>
              {page.result && (
                <button 
                  onClick={() => {navigator.clipboard.writeText(page.result || '')}}
                  className="hover:text-white transition-colors"
                >
                  {t.copyText}
                </button>
              )}
           </div>
           
           <div className="flex-1 p-6 overflow-auto font-mono text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
              {page.status === ProcessingStatus.PROCESSING ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                  <Loader2 size={32} className="animate-spin text-indigo-500" />
                  <p className="animate-pulse">{t.analyzing}</p>
                </div>
              ) : page.status === ProcessingStatus.ERROR ? (
                <div className="h-full flex flex-col items-center justify-center text-red-400 space-y-4">
                  <AlertTriangle size={32} />
                  <p>{t.failed}</p>
                  <p className="text-xs text-zinc-500 max-w-xs text-center">{page.error}</p>
                </div>
              ) : page.result ? (
                page.result
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic">
                  {t.waiting}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};