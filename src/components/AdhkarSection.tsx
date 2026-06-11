import React from 'react';
import { DhikrItem, RoutineType } from '../types';
import { Check, RotateCw, Award, Volume2, VolumeX, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdhkarProps {
  adhkar: DhikrItem[];
  onAdhkarChange: (updatedAdhkar: DhikrItem[]) => void;
  activeCategory: RoutineType;
}

export default function AdhkarSection({ adhkar, onAdhkarChange, activeCategory }: AdhkarProps) {
  // Filter adhkar based on selected routine category
  const filteredAdhkar = adhkar.filter(item => item.category === activeCategory);

  // Sound feedback preferences
  const [isSoundEnabled, setIsSoundEnabled] = React.useState(true);

  // Play custom auditory tactile feedback click
  const playClickSound = (isCompletedNow: boolean) => {
    if (!isSoundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (isCompletedNow) {
        // High pitched pleasant double-tone for completion success
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        // Clean high-quality soft click
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.07);
      }
    } catch (e) {
      console.log('Audio Context error:', e);
    }
  };

  // Click handler to increment / advance current count
  const handleDhikrClick = (id: string) => {
    let completedNow = false;
    const updated = adhkar.map(item => {
      if (item.id === id) {
        if (item.currentCount < item.count) {
          const nextCount = item.currentCount + 1;
          if (nextCount === item.count) {
            completedNow = true;
          }
          return { ...item, currentCount: nextCount };
        }
      }
      return item;
    });
    
    playClickSound(completedNow);
    onAdhkarChange(updated);
  };

  // Reset progress for active subset of adhkar
  const resetCategoryAdhkar = () => {
    const updated = adhkar.map(item => {
      if (item.category === activeCategory) {
        return { ...item, currentCount: 0 };
      }
      return item;
    });
    onAdhkarChange(updated);
    if (isSoundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(350, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start(); osc.stop(audioCtx.currentTime + 0.25);
      } catch (e) {}
    }
  };

  // Calculate global summary of progress
  const completedDhiksCount = filteredAdhkar.filter(i => i.currentCount >= i.count).length;
  const totalDhiksCount = filteredAdhkar.length;

  // Render proper coloring based on state
  const getThemeClass = () => {
    switch (activeCategory) {
      case 'morning':
        return {
          headerGrad: 'from-amber-500 to-orange-600',
          btnBg: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 focus:ring-amber-300',
          accentText: 'text-amber-600',
          badgeBg: 'bg-amber-100 text-amber-800',
          cardBorder: 'border-amber-100',
          btnLight: 'bg-amber-50 text-amber-800 hover:bg-amber-100'
        };
      case 'evening':
        return {
          headerGrad: 'from-indigo-500 to-indigo-700',
          btnBg: 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus:ring-indigo-300',
          accentText: 'text-indigo-600',
          badgeBg: 'bg-indigo-100 text-indigo-800',
          cardBorder: 'border-indigo-100',
          btnLight: 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
        };
      case 'night':
        return {
          headerGrad: 'from-purple-800 to-indigo-950',
          btnBg: 'bg-purple-700 hover:bg-purple-800 active:bg-purple-900 focus:ring-purple-300',
          accentText: 'text-purple-450',
          badgeBg: 'bg-purple-900 text-purple-200',
          cardBorder: 'border-purple-900/40',
          btnLight: 'bg-purple-950/40 text-purple-200 hover:bg-purple-900/60'
        };
    }
  };

  const theme = getThemeClass();

  return (
    <div id="adhkar-component" className="space-y-6">
      
      {/* Top Banner and Summary Stats */}
      <div className={`bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden`}>
        <div className={`p-6 bg-gradient-to-r ${theme.headerGrad} text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              ✨ {activeCategory === 'morning' && 'أذكار الصباح المنيرة'}
              {activeCategory === 'evening' && 'أذكار المساء الوقائية'}
              {activeCategory === 'night' && 'أذكار وصحابة النوم الهادئ'}
            </h2>
            <p className="text-xs opacity-90 mt-1">
              قال تعالى: &quot;أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ&quot;. انقر على البطاقة لتسجيل تكرار الذكر.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className="p-2 rounded-xl bg-white/25 hover:bg-white/35 transition-colors text-white"
              title={isSoundEnabled ? "كتم الصوت التفاعلي" : "تفعيل الصوت التفاعلي"}
              id="sound-toggle-btn"
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            
            {/* Reset Button */}
            <button
              onClick={resetCategoryAdhkar}
              className="px-3.5 py-1.5 rounded-xl bg-white text-slate-800 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              id="reset-adhkar-btn"
            >
              <RotateCw className="w-3.5 h-3.5" />
              تصفير العداد لليوم
            </button>
          </div>
        </div>

        {/* Global Progress Grid */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <span className="block text-xs text-slate-400 font-bold">الأذكار المنجزة</span>
            <span className="text-xl font-extrabold text-slate-800">{completedDhiksCount} / {totalDhiksCount}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-bold">النسبة المكتملة</span>
            <span className="text-xl font-extrabold text-slate-800">
              {totalDhiksCount > 0 ? Math.round((completedDhiksCount / totalDhiksCount) * 100) : 0}%
            </span>
          </div>
          <div className="col-span-2 text-right md:text-left flex items-center justify-end px-3">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 justify-end">
              <Sparkles className="w-4 h-4 text-amber-500" />
              الأذكار تحفظك وتحصن يومك وأهلك بإذن الله تعالى.
            </span>
          </div>
        </div>
      </div>

      {/* Adhkar Interactive Loop List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="adhkar-grid">
        <AnimatePresence>
          {filteredAdhkar.map((item) => {
            const isCompleted = item.currentCount >= item.count;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={() => handleDhikrClick(item.id)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer select-none flex flex-col justify-between relative overflow-hidden h-full min-h-[190px] ${
                  isCompleted 
                    ? 'bg-emerald-50/60 border-emerald-200' 
                    : `bg-white hover:bg-slate-50/70 border-slate-100 shadow-sm hover:translate-y-[-1px]`
                }`}
                id={`dhikr-card-${item.id}`}
              >
                {/* Header: counter badge */}
                <div className="flex justify-between items-center mb-3.5">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${
                    isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    التكرار المطلوبة: {item.count} مرات
                  </span>
                  
                  {isCompleted ? (
                    <span className="text-emerald-600 flex items-center gap-1 text-xs font-bold bg-emerald-100/30 px-2 py-0.5 rounded-md">
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      مكتمل
                    </span>
                  ) : (
                    <span className={`text-xs font-bold font-mono tracking-tight px-2.5 py-0.5 rounded-full ${theme.badgeBg}`}>
                      انجزت {item.currentCount}
                    </span>
                  )}
                </div>

                {/* Primary Content: Arabic text */}
                <div className="flex-1 mb-4 flex items-center">
                  <p className="text-slate-800 text-[15px] sm:text-base leading-relaxed font-medium font-serif tracking-normal text-right w-full block whitespace-pre-line select-text">
                    {item.text}
                  </p>
                </div>

                {/* Footer: Benefit & Interactive Click Progress visual */}
                <div className="mt-2 pt-3 border-t border-slate-100/70 space-y-2">
                  {item.benefit && (
                    <p className="text-xs text-slate-500 leading-snug font-normal italic flex items-start gap-1">
                      <BookOpen className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                      <span>{item.benefit}</span>
                    </p>
                  )}
                  
                  {/* Visual Step-Dot Counters */}
                  <div className="flex gap-1.5 pt-1 justify-end">
                    {Array.from({ length: item.count }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          idx < item.currentCount
                            ? 'w-5 bg-emerald-500' // completed steps
                            : 'w-2 bg-slate-200' // pending steps
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Tactile glow background ripple for active tap */}
                <div 
                  className="absolute bottom-0 right-0 left-0 h-1 bg-slate-100 transition-all duration-500"
                  style={{ width: `${(item.currentCount / item.count) * 100}%` }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
    </div>
  );
}
