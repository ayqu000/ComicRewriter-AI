import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ApiKeyInputProps {
  onKeySet: (key: string) => void;
  language: Language;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onKeySet, language }) => {
  const [key, setKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const t = TRANSLATIONS[language];

  useEffect(() => {
    // Check if env var exists (for development or pre-config)
    if (process.env.API_KEY) {
      onKeySet(process.env.API_KEY);
      setIsSaved(true);
      return;
    }
    
    // Check local storage
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) {
      setKey(stored);
      onKeySet(stored);
      setIsSaved(true);
    }
  }, [onKeySet]);

  const handleSave = () => {
    if (key.trim()) {
      localStorage.setItem('gemini_api_key', key.trim());
      onKeySet(key.trim());
      setIsSaved(true);
    }
  };

  const handleClear = () => {
    localStorage.removeItem('gemini_api_key');
    setKey('');
    setIsSaved(false);
    onKeySet('');
  };

  if (isSaved) {
    return (
      <div className="flex items-center space-x-2 text-sm text-green-400 bg-green-400/10 px-3 py-2 rounded-md border border-green-400/20">
        <Key size={16} />
        <span>{t.apiKeySet}</span>
        <button 
          onClick={handleClear}
          className="ml-auto text-zinc-400 hover:text-white underline text-xs"
        >
          {t.change}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-xs font-medium text-zinc-400">{t.apiKeyLabel}</label>
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <input
            type={isVisible ? "text" : "password"}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={t.apiKeyPlaceholder}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 pl-3 pr-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
          >
            {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={!key}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {t.save}
        </button>
      </div>
      <p className="text-[10px] text-zinc-500">
        {t.apiKeyNote} <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Google AI Studio</a>.
      </p>
    </div>
  );
};