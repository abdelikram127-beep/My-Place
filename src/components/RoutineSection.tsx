import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, Compass, BookOpen, Flame, Coffee, CheckSquare, 
  Sunset, CupSoda, Footprints, Home, BarChart2, Moon, 
  Smartphone, Book, Heart, Clock, Play, Pause, RotateCw, Trash2, Plus, Edit2, Check, AlertCircle, PlusCircle, CheckCircle2
} from 'lucide-react';
import { RoutineTask, RoutineType } from '../types';
import { motion, AnimatePresence } from 'motion/react';

// Maps icon name string to Lucide React component
const getIcon = (iconName: string, className: string = "w-5 h-5") => {
  switch (iconName) {
    case 'Sun': return <Sun className={className} />;
    case 'Compass': return <Compass className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'Coffee': return <Coffee className={className} />;
    case 'CheckSquare': return <CheckSquare className={className} />;
    case 'Sunset': return <Sunset className={className} />;
    case 'CupSoda': return <CupSoda className={className} />;
    case 'Footprints': return <Footprints className={className} />;
    case 'Home': return <Home className={className} />;
    case 'BarChart2': return <BarChart2 className={className} />;
    case 'Moon': return <Moon className={className} />;
    case 'SmartphoneOff': return <Smartphone className={className} />;
    case 'Book': return <Book className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Clock': return <Clock className={className} />;
    default: return <CheckSquare className={className} />;
  }
};

interface RoutineProps {
  tasks: RoutineTask[];
  onTasksChange: (updatedTasks: RoutineTask[]) => void;
  activeCategory: RoutineType;
}

export default function RoutineSection({ tasks, onTasksChange, activeCategory }: RoutineProps) {
  // Filtered tasks based on active category
  const filteredTasks = tasks.filter(task => task.category === activeCategory);

  // States
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(10);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDuration, setEditDuration] = useState(10);

  // Timer states
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [totalTimerDuration, setTotalTimerDuration] = useState(0); // in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound Synth Synthesizer for completion
  const playCompletionSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
      oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
      oscillator.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.45); // C6

      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.log('Audio context not started/allowed:', e);
    }
  };

  // Timer runner
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            playCompletionSound();
            // Automatically mark current task as completed when timer finishes!
            if (activeTimerTaskId) {
              toggleTaskCompletion(activeTimerTaskId, true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeLeft, activeTimerTaskId]);

  // Handle task check/uncheck
  const toggleTaskCompletion = (taskId: string, forceStatus?: boolean) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, completed: forceStatus !== undefined ? forceStatus : !t.completed };
      }
      return t;
    });
    onTasksChange(updated);
  };

  // Add a new task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: RoutineTask = {
      id: 'custom-' + Date.now(),
      title: newTaskTitle.trim(),
      duration: Number(newTaskDuration) || 10,
      completed: false,
      category: activeCategory,
      iconName: activeCategory === 'morning' ? 'Sun' : activeCategory === 'evening' ? 'Sunset' : 'Moon'
    };

    onTasksChange([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskDuration(10);
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    if (activeTimerTaskId === taskId) {
      stopTimer();
    }
    const filtered = tasks.filter(t => t.id !== taskId);
    onTasksChange(filtered);
  };

  // Start editing mode
  const startEditing = (task: RoutineTask) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDuration(task.duration);
  };

  // Save changes from editing a task
  const saveEditedTask = (taskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, title: editTitle.trim(), duration: Number(editDuration) || 5 };
      }
      return t;
    });
    onTasksChange(updated);
    
    // If this is the active timer, adjust time
    if (activeTimerTaskId === taskId) {
      setTimeLeft(editDuration * 60);
      setTotalTimerDuration(editDuration * 60);
    }
    
    setEditingTaskId(null);
  };

  // Start timer for a task
  const startTimerForTask = (task: RoutineTask) => {
    setActiveTimerTaskId(task.id);
    setTimeLeft(task.duration * 60);
    setTotalTimerDuration(task.duration * 60);
    setIsTimerRunning(true);
  };

  // Toggle play pause on active timer
  const toggleTimerPause = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  // Stop / clear active timer
  const stopTimer = () => {
    setIsTimerRunning(false);
    setActiveTimerTaskId(null);
    setTimeLeft(0);
    setTotalTimerDuration(0);
  };

  // Reset all tasks of this category to uncompleted
  const resetAllTasks = () => {
    const updated = tasks.map(t => {
      if (t.category === activeCategory) {
        return { ...t, completed: false };
      }
      return t;
    });
    onTasksChange(updated);
    stopTimer();
  };

  // Done percentage
  const doneCount = filteredTasks.filter(t => t.completed).length;
  const totalCount = filteredTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Theme color styling mapper
  const getThemeClass = () => {
    switch (activeCategory) {
      case 'morning':
        return {
          bg: 'bg-amber-50',
          accent: 'text-amber-600',
          border: 'border-amber-200',
          headerGrad: 'from-amber-500 to-orange-600',
          btnBg: 'bg-amber-600 hover:bg-amber-700',
          btnLight: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
          progressColor: 'bg-amber-500',
          badge: 'bg-amber-100 text-amber-800',
          focusBorder: 'focus:border-amber-500 focus:ring-amber-500',
          glow: 'morning-glow'
        };
      case 'evening':
        return {
          bg: 'bg-indigo-50',
          accent: 'text-indigo-600',
          border: 'border-indigo-200',
          headerGrad: 'from-indigo-500 to-indigo-700',
          btnBg: 'bg-indigo-600 hover:bg-indigo-700',
          btnLight: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
          progressColor: 'bg-indigo-600',
          badge: 'bg-indigo-100 text-indigo-800',
          focusBorder: 'focus:border-indigo-500 focus:ring-indigo-500',
          glow: 'evening-glow'
        };
      case 'night':
        return {
          bg: 'bg-purple-950/20',
          accent: 'text-purple-400',
          border: 'border-purple-800/30',
          headerGrad: 'from-purple-800 to-purple-950',
          btnBg: 'bg-purple-700 hover:bg-purple-850',
          btnLight: 'bg-purple-950 text-purple-300 hover:bg-purple-900',
          progressColor: 'bg-purple-500',
          badge: 'bg-purple-900 text-purple-200',
          focusBorder: 'focus:border-purple-500 focus:ring-purple-500',
          glow: 'night-glow'
        };
    }
  };

  const theme = getThemeClass();
  const activeTimerTask = filteredTasks.find(t => t.id === activeTimerTaskId);

  return (
    <div id="routine-component" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Sidebar: New task adder + Current performance metrics */}
      <div id="routine-sidebar" className="lg:col-span-4 xl:col-span-4 space-y-6">
        
        {/* Dynamic Timer Widget */}
        <AnimatePresence mode="wait">
          {activeTimerTaskId && activeTimerTask && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              className={`p-6 rounded-3xl bg-white shadow-md border ${theme.border} overflow-hidden relative`}
              id="active-timer-widget"
            >
              <div className={`absolute top-0 right-0 left-0 h-1.5 bg-gray-100`}>
                <div 
                  className={`h-full transition-all duration-300 ${theme.progressColor}`}
                  style={{ width: `${(timeLeft / totalTimerDuration) * 100}%` }}
                />
              </div>

              <div className="flex justify-between items-start mb-4 mt-2">
                <div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${theme.badge}`}>
                    جاري التنفيذ
                  </span>
                  <h3 className="font-bold text-gray-850 text-lg mt-2 leading-snug">
                    {activeTimerTask.title}
                  </h3>
                </div>
                <div className={`p-2.5 rounded-xl ${theme.bg} ${theme.accent}`}>
                  {getIcon(activeTimerTask.iconName, "w-6 h-6")}
                </div>
              </div>

              {/* Graphical Timer Face */}
              <div className="flex flex-col items-center justify-center py-6">
                <span className="text-4xl md:text-5xl font-bold font-mono tracking-tight text-gray-900">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs text-gray-400 mt-2 font-medium">
                  المتبقي من الوقت الإجمالي {activeTimerTask.duration} دقائق
                </span>
              </div>

              {/* Timer Controls */}
              <div className="flex gap-2.5 mt-2">
                <button
                  onClick={toggleTimerPause}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-white transition-all cursor-pointer ${theme.btnBg} shadow-sm`}
                  id="timer-play-pause-btn"
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-5 h-5" />
                      إيقاف مؤقت
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      مواصلة
                    </>
                  )}
                </button>
                <button
                  onClick={stopTimer}
                  className="p-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-all cursor-pointer border border-red-200"
                  title="إنهاء الجلسة"
                  id="timer-stop-btn"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Tracker Card */}
        <div id="progress-card" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
            📊 نسبة الإنجاز اليومي
          </h3>
          <p className="text-sm text-slate-500 mb-4 leading-relaxed">
            حافظ على استمرارك اليومي لتبني عادات دقيقة ومتكاملة.
          </p>

          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className={`text-sm font-extrabold inline-block py-1 px-2.5 uppercase rounded-full ${theme.badge}`}>
                  {progressPercent}% مكتمل
                </span>
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-slate-700">
                  {doneCount} من أصل {totalCount}
                </span>
              </div>
            </div>
            
            {/* Visual Progress Bar Wrapper */}
            <div className="overflow-hidden h-3.5 mb-2 text-xs flex rounded-full bg-slate-100 relative">
              <div
                style={{ width: `${progressPercent}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${theme.progressColor}`}
              />
            </div>
          </div>
          
          <button
            onClick={resetAllTasks}
            disabled={totalCount === 0}
            className="w-full mt-4 py-2.5 px-4 bg-slate-150 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-bold rounded-xl transition-all border border-slate-200 text-sm flex items-center justify-center gap-2 cursor-pointer"
            id="reset-tasks-btn"
          >
            <RotateCw className="w-4 h-4" />
            إعادة تعيين كافة المهام لبدء جديد
          </button>
        </div>

        {/* Add custom mission templates */}
        <div id="add-task-card" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
            <PlusCircle className={`w-5 h-5 ${theme.accent}`} />
            إضافة مهمة مخصصة الروتين
          </h3>

          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">عنوان المهمة</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="مثال: القراءة اليومية، شرب شاي أخضر..."
                className={`w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none ${theme.focusBorder}`}
                maxLength={60}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">الوقت المقدر (بالدقائق)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={newTaskDuration}
                  onChange={e => setNewTaskDuration(Math.max(1, Number(e.target.value)))}
                  className={`w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none ${theme.focusBorder}`}
                />
                <span className="text-slate-500 text-sm font-bold whitespace-nowrap">دقيقة</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className={`w-full py-3 px-4 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${theme.btnBg} disabled:opacity-55 disabled:cursor-not-allowed`}
              id="submit-new-task-btn"
            >
              <Plus className="w-4 h-4" />
              إضافة المهمة للجدول
            </button>
          </form>
        </div>
      </div>

      {/* Main Column: Tasks List */}
      <div id="routine-main" className="lg:col-span-8 xl:col-span-8">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          
          <div className={`p-6 bg-gradient-to-r ${theme.headerGrad} text-white flex justify-between items-center`}>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {activeCategory === 'morning' && '☀️ الروتين الصباحي المبارك'}
                {activeCategory === 'evening' && '🌆 الروتين المسائي الهادئ'}
                {activeCategory === 'night' && '🌙 الروتين الليلي الساكن'}
              </h2>
              <p className="text-xs opacity-90 mt-1">
                تصفح قائمة المهام المقترحة، قم بتشغيل المؤقت واحرص على الالتزام.
              </p>
            </div>
            <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">
              {filteredTasks.length} مهام
            </span>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-60" />
              <p className="text-sm font-medium">لا توجد مهام حالياً في هذا الروتين.</p>
              <p className="text-xs mt-1">أضف مهاماً جديدة مخصصة باستخدام النموذج الجانبي.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100" id="tasks-list">
              <AnimatePresence initial={false}>
                {filteredTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                      task.completed ? 'bg-slate-50' : 'bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Mission Core Details */}
                    <div className="flex items-start gap-4 flex-1">
                      
                      {/* Completion check container */}
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className={`mt-1 h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                          task.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : `border-slate-300 hover:border-slate-500`
                        }`}
                        id={`check-task-${task.id}`}
                      >
                        {task.completed && <Check className="w-4 h-4" />}
                      </button>

                      <div className="flex-1">
                        {editingTaskId === task.id ? (
                          <div className="flex flex-col gap-2 md:flex-row md:items-center w-full">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              className="px-3 py-1.5 text-sm border border-slate-350 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-500 flex-1"
                            />
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="1"
                                value={editDuration}
                                onChange={e => setEditDuration(Math.max(1, Number(e.target.value)))}
                                className="px-2 py-1.5 text-sm border border-slate-350 rounded-lg w-20 text-center"
                              />
                              <span className="text-xs text-slate-500 font-bold">د</span>
                              <button
                                onClick={() => saveEditedTask(task.id)}
                                className="p-1 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                              >
                                حفظ
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className={`font-semibold text-slate-800 text-base block ${task.completed ? 'line-through text-slate-450' : ''}`}>
                              {task.title}
                            </span>
                            <div className="flex items-center gap-2.5 mt-1">
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {task.duration} دقيقة
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1 ${
                                task.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {task.completed ? 'مكتملة' : 'قيد الانتظار'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Controls / Interactive buttons */}
                    <div className="flex items-center gap-2 justify-end">
                      {editingTaskId !== task.id && (
                        <>
                          {/* Timer trigger button */}
                          {!task.completed && (
                            <button
                              onClick={() => startTimerForTask(task)}
                              title="بدء مؤقت المهمة"
                              className={`p-2 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                activeTimerTaskId === task.id
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : `${theme.btnLight}`
                              }`}
                              id={`timer-task-${task.id}`}
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              {activeTimerTaskId === task.id ? 'يشتغل حالياً' : 'ابدأ العداد'}
                            </button>
                          )}

                          {/* Edit button */}
                          <button
                            onClick={() => startEditing(task)}
                            title="تعديل المهمة"
                            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            title="حذف المهمة"
                            className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
