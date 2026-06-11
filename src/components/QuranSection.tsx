import React, { useState } from 'react';
import { QuranVerse, RoutineType } from '../types';
import { Check, Sparkles, Sliders, Eye, EyeOff, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

interface QuranProps {
  verses: QuranVerse[];
  activeCategory: RoutineType;
}

export default function QuranSection({ verses, activeCategory }: QuranProps) {
  // Filter Quranic portions
  const filteredVerses = verses.filter(v => v.category === activeCategory);

  // Layout customization states
  const [fontSize, setFontSize] = useState<number>(20); // range 16-32px
  const [isSepia, setIsSepia] = useState<boolean>(false); // Sepia mode
  const [readCompletedMap, setReadCompletedMap] = useState<Record<string, boolean>>({});

  const toggleReadStatus = (id: string) => {
    setReadCompletedMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getThemeClass = () => {
    switch (activeCategory) {
      case 'morning':
        return {
          headerGrad: 'from-amber-500 to-orange-600',
          accentText: 'text-amber-600',
          btnLight: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
          completionBadge: 'bg-emerald-100 text-emerald-800',
          focusText: 'text-orange-950',
          btnActive: 'bg-amber-600 text-white'
        };
      case 'evening':
        return {
          headerGrad: 'from-indigo-500 to-indigo-700',
          accentText: 'text-indigo-600',
          btnLight: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
          completionBadge: 'bg-emerald-100 text-emerald-800',
          focusText: 'text-indigo-950',
          btnActive: 'bg-indigo-600 text-white'
        };
      case 'night':
        return {
          headerGrad: 'from-purple-800 to-indigo-950',
          accentText: 'text-purple-400',
          btnLight: 'bg-purple-900 text-purple-200 hover:bg-purple-800',
          completionBadge: 'bg-emerald-900 text-emerald-200',
          focusText: 'text-purple-200',
          btnActive: 'bg-purple-700 text-white'
        };
    }
  };

  const theme = getThemeClass();

  return (
    <div id="quran-component" className="space-y-6">
      
      {/* Settings Panel: Font size and visual modes */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className={`w-5 h-5 ${theme.accentText}`} />
          <h3 className="font-bold text-slate-800 text-sm md:text-base">تخصيص لوحة القراءة</h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
          {/* FontSize adjust slider */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-slate-400 font-bold">حجم الخط:</span>
            <input
              type="range"
              min="16"
              max="32"
              value={fontSize}
              onChange={e => setFontSize(Number(e.target.value))}
              className="w-24 md:w-32 accent-slate-700 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-700 font-mono">{fontSize}px</span>
          </div>

          {/* Sepia filter toggle */}
          <button
            onClick={() => setIsSepia(!isSepia)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isSepia 
                ? 'bg-amber-100/60 border-amber-350 text-amber-900' 
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            🌙 الرؤية الليلية (ورق معتق)
          </button>
        </div>
      </div>

      {/* Main Quran Verses Stack */}
      <div className="space-y-6" id="quran-verses-stack">
        {filteredVerses.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="text-slate-500 font-medium text-sm">لا تتوفر آيات مخصصة مسجلة لهذه الفئة حالياً.</p>
          </div>
        ) : (
          filteredVerses.map((item) => {
            const isCompleted = readCompletedMap[item.id] || false;
            return (
              <div
                key={item.id}
                className={`rounded-3xl border transition-all overflow-hidden shadow-sm ${
                  isSepia 
                    ? 'bg-[#fbf4e6] border-[#ecc697] text-[#5e4b33]' 
                    : 'bg-white border-slate-100 text-slate-800'
                }`}
                id={`quran-card-${item.id}`}
              >
                {/* Header banner */}
                <div className={`p-4 md:p-5 flex justify-between items-center border-b ${
                  isSepia ? 'border-[#ecc697]/40 bg-[#f4e6ce]' : 'bg-slate-50/70 border-slate-100'
                }`}>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block mb-1">الورد القرآني المقترح</span>
                    <h3 className={`font-extrabold text-[#2a2a2a] text-base md:text-lg ${isSepia ? 'text-[#302113]' : ''}`}>
                      {item.title} - <span className="font-serif text-sm font-normal text-slate-500">{item.surahName}</span>
                    </h3>
                  </div>

                  {/* Complete Checkbutton */}
                  <button
                    onClick={() => toggleReadStatus(item.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                      isCompleted 
                        ? 'bg-emerald-500 text-white border-none' 
                        : `${theme.btnLight}`
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        قرأت الورد اليوم
                      </>
                    ) : (
                      'تعليم كـ مقروء'
                    )}
                  </button>
                </div>

                {/* Body Content - Arabic Holy Texts */}
                <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center relative">
                  
                  {/* Backdrop ornament */}
                  <div className={`absolute select-none pointer-events-none opacity-5 text-7xl font-serif text-slate-500 flex items-center justify-center`}>
                    ﷽
                  </div>

                  <p 
                    className="quran-text select-all text-slate-900 leading-loose w-full max-w-4xl font-serif font-semibold text-center tracking-wide"
                    style={{ 
                      fontSize: `${fontSize}px`,
                      color: isSepia ? '#3e2714' : '#1e293b'
                    }}
                  >
                    {item.verses}
                  </p>
                </div>

                {/* Footer instructions/benefit */}
                {item.benefit && (
                  <div className={`p-4 text-xs font-medium border-t leading-relaxed flex items-start gap-2.5 ${
                    isSepia ? 'border-[#ecc697]/40 bg-[#fbf4e6] text-[#6d553a]' : 'bg-slate-50/50 border-slate-100 text-slate-500'
                  }`}>
                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-slate-700 mb-0.5">فضل قراءته في هذا الروتين:</span>
                      <span>{item.benefit}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
