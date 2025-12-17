import React from 'react';
import { Chapter, ProcessingStatus, Language } from '../types';
import { Folder, CheckCircle2, Loader2, AlertCircle, Circle } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface SidebarProps {
  chapters: Chapter[];
  currentChapterId: string | null;
  currentPageId: string | null;
  onSelectPage: (chapterId: string, pageId: string) => void;
  language: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  chapters, 
  currentChapterId, 
  currentPageId, 
  onSelectPage,
  language
}) => {
  const t = TRANSLATIONS[language];

  const getStatusIcon = (status: ProcessingStatus) => {
    switch(status) {
      case ProcessingStatus.DONE: return <CheckCircle2 size={14} className="text-green-500" />;
      case ProcessingStatus.PROCESSING: return <Loader2 size={14} className="text-indigo-400 animate-spin" />;
      case ProcessingStatus.ERROR: return <AlertCircle size={14} className="text-red-500" />;
      default: return <Circle size={14} className="text-zinc-700" />;
    }
  };

  return (
    <div className="w-80 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 h-full overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Folder size={20} className="text-indigo-500" />
          {t.explorer}
        </h2>
        <div className="text-xs text-zinc-500 mt-1">
          {chapters.length} {t.chaptersLoaded}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {chapters.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">
            {t.noFolder}
          </div>
        ) : (
          chapters.map(chapter => (
            <div key={chapter.id} className="mb-2">
              <div className="px-4 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider sticky top-0 bg-zinc-900/95 backdrop-blur-sm z-10 flex justify-between items-center group">
                 <span className="truncate" title={chapter.name}>{chapter.name}</span>
                 <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">{chapter.pages.length}</span>
              </div>
              <div className="px-2">
                {chapter.pages.map(page => {
                  const isActive = page.id === currentPageId;
                  return (
                    <button
                      key={page.id}
                      onClick={() => onSelectPage(chapter.id, page.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-left text-sm mb-0.5
                        ${isActive 
                          ? 'bg-indigo-600/10 text-indigo-300 border border-indigo-500/20' 
                          : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-transparent'
                        }`}
                    >
                      {getStatusIcon(page.status)}
                      <span className="truncate flex-1">{page.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};