/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sun, Sunset, Moon, Sparkles, BookOpen, Video, CheckSquare, 
  HelpCircle, Clock, Calendar, CheckCircle2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { RoutineTask, DhikrItem, QuranVerse, VideoItem, RoutineType } from './types';
import { defaultTasks, defaultAdhkar, quranVerses, defaultVideos } from './data/templates';
import RoutineSection from './components/RoutineSection';
import AdhkarSection from './components/AdhkarSection';
import QuranSection from './components/QuranSection';
import VideoSection from './components/VideoSection';
import { motion, AnimatePresence } from 'motion/react';

// Subcategories inside each routine slot
type SectionType = 'tasks' | 'adhkar' | 'quran' | 'videos';

export default function App() {
  // ----------------------------------------------------
  // Persistent State Initializations via LocalStorage
  // ----------------------------------------------------
  const [tasks, setTasks] = useState<RoutineTask[]>(() => {
    const saved = localStorage.getItem('routine_app_tasks');
    return saved ? JSON.parse(saved) : defaultTasks;
  });

  const [adhkar, setAdhkar] = useState<DhikrItem[]>(() => {
    const saved = localStorage.getItem('routine_app_adhkar');
    return saved ? JSON.parse(saved) : defaultAdhkar;
  });

  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const saved = localStorage.getItem('routine_app_videos');
    return saved ? JSON.parse(saved) : defaultVideos;
  });

  // Category view tab: 'morning' | 'evening' | 'night'
  const [activeCategory, setActiveCategory] = useState<RoutineType>(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) return 'morning';
    if (currentHour >= 12 && currentHour < 17) return 'evening';
    return 'night';
  });

  // Secondary sub-tab: 'tasks' | 'adhkar' | 'quran' | 'videos'
  const [activeSection, setActiveSection] = useState<SectionType>('tasks');

  // Trigger LocalStorage saves when states edit
  useEffect(() => {
    localStorage.setItem('routine_app_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('routine_app_adhkar', JSON.stringify(adhkar));
  }, [adhkar]);

  useEffect(() => {
    localStorage.setItem('routine_app_videos', JSON.stringify(videos));
  }, [videos]);

  // Handle updates from child components
  const handleTasksUpdate = (updated: RoutineTask[]) => {
    setTasks(updated);
  };

  const handleAdhkarUpdate = (updated: DhikrItem[]) => {
    setAdhkar(updated);
  };

  const handleVideosUpdate = (updated: VideoItem[]) => {
    setVideos(updated);
  };

  // ----------------------------------------------------
  // Dynamic UI Greetings details
  // ----------------------------------------------------
  const getDynamicGreetingDetails = () => {
    switch (activeCategory) {
      case 'morning':
        return {
          title: 'روتين البركة والنشاط الصباحي',
          welcome: 'صباح الخير والبركة والنشاط الباكر! ☀️',
          desc: 'ابدأ يومك بتنظيم دقيق وورد مبارك ليكون نهارك مليئاً بالرحمة والتيسير والإنتاجية الطيبة.',
          decorBg: 'from-amber-500/10 via-yellow-500/5 to-transparent',
          badgeText: 'text-amber-700 bg-amber-100 border-amber-200',
          accentBorder: 'border-amber-400',
        };
      case 'evening':
        return {
          title: 'روتين السكينة والوقار المسائي',
          welcome: 'طاب مساؤك بالخير واليمن والطمأنينة! 🌆',
          desc: 'تذكر أن تأخذ قسطاً من الاسترخاء، مراجعة أوراق ما أنجزت وتلاوة أوراد الحفظ لطمأنينة النفس.',
          decorBg: 'from-indigo-550/10 via-pink-500/5 to-transparent',
          badgeText: 'text-indigo-750 bg-indigo-100 border-indigo-200',
          accentBorder: 'border-indigo-400',
        };
      case 'night':
        return {
          title: 'روتين الهدوء والتهيئة لليل هانئ',
          welcome: 'ليلة هادئة محفوفة بالسلامة والراحة النفسية! 🌙',
          desc: 'حان الوقت لفك الارتباط بضجيج الصخب الرقمي، قراءة الورد المنجي وسؤال الله العافية التامة.',
          decorBg: 'from-purple-950/20 via-slate-900/5 to-transparent',
          badgeText: 'text-purple-300 bg-purple-950 border-purple-800',
          accentBorder: 'border-purple-600',
        };
    }
  };

  const greeting = getDynamicGreetingDetails();

  // Tasks score computation for top metric bars
  const totalTasksCount = tasks.filter(t => t.category === activeCategory).length;
  const completedTasksCount = tasks.filter(t => t.category === activeCategory && t.completed).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-16 antialiased" id="app-root">
      
      {/* Top Bento-Style Header Section */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-xs" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-extrabold shadow-sm text-base transition-transform hover:rotate-3">
              ورد
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 leading-tight">
                منظم الورد اليومي والعبادات
                <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">V2.1</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">رفيقـك اليـومي للروتيـن والأذكـار والقرآن الكريم</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs text-slate-500 font-bold flex items-center gap-1.5 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-slate-450" />
              {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-2xs">
                الإنتاجية: {totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}%
              </span>
              <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-2xs border border-white">
                أ
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Hero Welcome Bento Card Row with dynamic time adjustments */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6" id="welcome-bento-section">
        <div className={`relative overflow-hidden bg-gradient-to-br ${greeting.decorBg} border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6`} id="welcome-banner">
          
          <div className="space-y-3 text-right flex-1 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${greeting.badgeText} bg-white/80 backdrop-blur-xs`}>
                {greeting.title}
              </span>
              <span className="text-xs text-emerald-800 font-bold bg-emerald-50/80 backdrop-blur-xs px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                تم إكمال {completedTasksCount} من {totalTasksCount} عادات
              </span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-slate-950 font-sans tracking-tight leading-none">
              {greeting.welcome}
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
              {greeting.desc}
            </p>
          </div>

          <div className="hidden md:flex justify-end shrink-0">
            {activeCategory === 'morning' && (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="h-24 w-24 bg-amber-400/20 rounded-3xl border border-amber-300 flex items-center justify-center p-3 text-amber-500 shadow-inner">
                <Sun className="w-12 h-12 stroke-[1.5]" />
              </motion.div>
            )}
            {activeCategory === 'evening' && (
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="h-24 w-24 bg-indigo-100 rounded-3xl border border-indigo-200 flex items-center justify-center p-3 text-indigo-500 shadow-inner">
                <Sunset className="w-12 h-12 stroke-[1.5]" />
              </motion.div>
            )}
            {activeCategory === 'night' && (
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="h-24 w-24 bg-purple-950/40 rounded-3xl border border-purple-800/50 flex items-center justify-center p-3 text-purple-400 shadow-inner">
                <Moon className="w-12 h-12 stroke-[1.5]" />
              </motion.div>
            )}
          </div>

        </div>
      </div>

      {/* Main Core Content Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Step 1: Global Time Selector Tab Panels (Bento Styled Pills) */}
        <div className="flex gap-2 p-1.5 bg-white border border-slate-100 rounded-3xl shadow-xs mb-6 max-w-xl mx-auto" id="routine-tabs-panel">
          
          <button
            onClick={() => {
              setActiveCategory('morning');
              setActiveSection('tasks');
            }}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm tracking-tight flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeCategory === 'morning'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
            id="tab-morning-btn"
          >
            <Sun className="w-4 h-4" />
            فترة الصباح
          </button>

          <button
            onClick={() => {
              setActiveCategory('evening');
              setActiveSection('tasks');
            }}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm tracking-tight flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeCategory === 'evening'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
            id="tab-evening-btn"
          >
            <Sunset className="w-4 h-4" />
            فترة المساء
          </button>

          <button
            onClick={() => {
              setActiveCategory('night');
              setActiveSection('tasks');
            }}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm tracking-tight flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeCategory === 'night'
                ? 'bg-purple-950 text-purple-100 shadow-md border border-purple-900/40'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
            id="tab-night-btn"
          >
            <Moon className="w-4 h-4" />
            فترة الليل
          </button>
        </div>

        {/* Step 2: Content Sub-sections navigation */}
        <div className="flex justify-center border-b border-slate-100 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none" id="sub-navigation">
          <nav className="flex gap-6 md:gap-8 pb-3 px-2">
            
            <button
              onClick={() => setActiveSection('tasks')}
              className={`pb-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'tasks'
                  ? 'border-slate-800 text-slate-900 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              العادات والمهام
            </button>

            <button
              onClick={() => setActiveSection('adhkar')}
              className={`pb-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'adhkar'
                  ? 'border-slate-800 text-slate-900 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              أذكار الورد التكراري
            </button>

            <button
              onClick={() => setActiveSection('quran')}
              className={`pb-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'quran'
                  ? 'border-slate-800 text-slate-900 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              الورد القرآني الحافظ
            </button>

            <button
              onClick={() => setActiveSection('videos')}
              className={`pb-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'videos'
                  ? 'border-slate-800 text-slate-900 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Video className="w-4 h-4" />
              المرئيات والفيديوهات
            </button>

          </nav>
        </div>

        {/* Dynamic Section Contents Injection Rendering */}
        <div className="min-h-[450px]" id="dynamic-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${activeSection}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {activeSection === 'tasks' && (
                <RoutineSection
                  tasks={tasks}
                  onTasksChange={handleTasksUpdate}
                  activeCategory={activeCategory}
                />
              )}

              {activeSection === 'adhkar' && (
                <AdhkarSection
                  adhkar={adhkar}
                  onAdhkarChange={handleAdhkarUpdate}
                  activeCategory={activeCategory}
                />
              )}

              {activeSection === 'quran' && (
                <QuranSection
                  verses={quranVerses}
                  activeCategory={activeCategory}
                />
              )}

              {activeSection === 'videos' && (
                <VideoSection
                  videos={videos}
                  onVideosChange={handleVideosUpdate}
                  activeCategory={activeCategory}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* Footer copyright and advice citation */}
      <footer className="mt-16 border-t border-slate-200 py-8 bg-white" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400 font-medium space-y-2">
          <p className="flex items-center justify-center gap-1 text-slate-500 font-bold">
            💡 رَتِّبْ روتينك، اذكُر مَوْلاك، ارقَ بحياتِك واملأ قلبَك بالاطْمِئنَان واليَقِين.
          </p>
          <p>
            تطبيق الروتين والعبادات اليومي © {new Date().getFullYear()} - تم برمجته بحرفية لتلبية تنظيم حياتك اليومية بسلاسة تامة.
          </p>
        </div>
      </footer>

    </div>
  );
}
