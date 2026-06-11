import React, { useState } from 'react';
import { VideoItem, RoutineType } from '../types';
import { Play, ExternalLink, Plus, Trash2, Video, Clock, Bookmark, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoSectionProps {
  videos: VideoItem[];
  onVideosChange: (updatedVideos: VideoItem[]) => void;
  activeCategory: RoutineType;
}

export default function VideoSection({ videos, onVideosChange, activeCategory }: VideoSectionProps) {
  const filteredVideos = videos.filter(v => v.category === activeCategory);

  // States
  const [activeIFrameId, setActiveIFrameId] = useState<string | null>(null);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoDuration, setNewVideoDuration] = useState('5 دقائق');
  const [inputError, setInputError] = useState('');

  // YouTube parser to extract video ID recursively
  const extractYoutubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Add custom video link handler
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError('');

    if (!newVideoTitle.trim()) {
      setInputError('يرجى كتابة عنوان للفيديو.');
      return;
    }

    const ytid = extractYoutubeId(newVideoUrl);
    if (!ytid) {
      setInputError('يرجى إدخال رابط يوتيوب صحيح (يحتوي على معرف الفيديو 11 حرفاً).');
      return;
    }

    const newVideo: VideoItem = {
      id: 'custom-vid-' + Date.now(),
      title: newVideoTitle.trim(),
      url: `https://www.youtube.com/embed/${ytid}`,
      youtubeId: ytid,
      duration: newVideoDuration.trim() || '5 دقائق',
      category: activeCategory,
      thumbnail: `https://img.youtube.com/vi/${ytid}/0.jpg`, // YouTube high quality thumbnail
      channelName: 'رابط مخصص للشخص',
      description: 'تم إضافة هذا الفيديو من قبل المستخدم المخصص لتفعيل روتينه الفردي.'
    };

    onVideosChange([...videos, newVideo]);
    setNewVideoUrl('');
    setNewVideoTitle('');
    setNewVideoDuration('5 دقائق');
  };

  // Delete video handler
  const handleDeleteVideo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIFrameId === id) {
      setActiveIFrameId(null);
    }
    const filtered = videos.filter(v => v.id !== id);
    onVideosChange(filtered);
  };

  const getThemeClass = () => {
    switch (activeCategory) {
      case 'morning':
        return {
          btnBg: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-300',
          btnLight: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
          focusBorder: 'focus:border-amber-500 focus:ring-amber-500',
          accentText: 'text-amber-600',
          badge: 'bg-amber-150 text-amber-900'
        };
      case 'evening':
        return {
          btnBg: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300',
          btnLight: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
          focusBorder: 'focus:border-indigo-500 focus:ring-indigo-500',
          accentText: 'text-indigo-600',
          badge: 'bg-indigo-150 text-indigo-900'
        };
      case 'night':
        return {
          btnBg: 'bg-purple-700 hover:bg-purple-800 focus:ring-purple-300',
          btnLight: 'bg-purple-900 text-purple-200 hover:bg-purple-850',
          focusBorder: 'focus:border-purple-500 focus:ring-purple-500',
          accentText: 'text-purple-400',
          badge: 'bg-purple-900 text-purple-100'
        };
    }
  };

  const theme = getThemeClass();

  return (
    <div id="video-section-component" className="space-y-6">
      
      {/* Upper header note */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
          📹 مكتبة المرئيات التفاعلية وقنوات الغذاء الروحي والبدني
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          قائمة فيديوهات منتقاة للتدريب، الاسترخاء، تلاوات خاشعة، وتوضيحات روتينية. يمكنك تصفحها وتشغيلها مدمجة، أو فتحها في يوتيوب مباشرة.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* List & Screen Container: col-span-8 */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {filteredVideos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white p-12 text-center rounded-3xl border border-slate-150"
              >
                <Video className="w-12 h-12 mx-auto mb-3 text-slate-350" />
                <p className="text-slate-500 font-bold mb-1">لا توجد مرئيات مرتبطة في هذا الورد حالياً.</p>
                <p className="text-xs text-slate-400">يمكنك إضافة فيديوهات مخصصة باستخدام النموذج الجانبي.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="videos-grid">
                {filteredVideos.map((video) => {
                  const isPlaying = activeIFrameId === video.id;
                  return (
                    <motion.div
                      key={video.id}
                      layout
                      className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between"
                      id={`video-card-${video.id}`}
                    >
                      {/* Video Player or Thumbnail display */}
                      <div className="relative aspect-video bg-black w-full overflow-hidden">
                        {isPlaying ? (
                          <iframe
                            className="w-full h-full"
                            src={`${video.url}?autoplay=1`}
                            title={video.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <>
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover opacity-85 hover:scale-[1.03] transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            {/* Dark overlay with play button */}
                            <div className="absolute inset-0 bg-black/35 hover:bg-black/45 transition-colors flex items-center justify-center">
                              <button
                                onClick={() => setActiveIFrameId(video.id)}
                                className={`h-14 w-14 rounded-full bg-white text-slate-900 border border-slate-200 shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer`}
                                title="تشغيل الفيديو مدمج"
                              >
                                <Play className="w-6 h-6 fill-current translate-x-[-1px]" />
                              </button>
                            </div>

                            {/* Duration Badge */}
                            <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[11px] font-bold px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {video.duration}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Video explanation and meta */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[11px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                              {video.channelName}
                            </span>
                            
                            <button
                              onClick={(e) => handleDeleteVideo(video.id, e)}
                              className="text-slate-350 hover:text-red-650 p-1 rounded-md hover:bg-red-50 transition-colors"
                              title="حذف هذا الفيديو"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <h3 className="font-extrabold text-slate-800 text-sm md:text-base leading-snug line-clamp-2">
                            {video.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                            {video.description}
                          </p>
                        </div>

                        {/* External youtube link out */}
                        <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-50">
                          {isPlaying && (
                            <button
                              onClick={() => setActiveIFrameId(null)}
                              className="text-xs font-bold text-red-600 hover:underline"
                            >
                              إيقاف التشغيل المدمج
                            </button>
                          )}
                          <a
                            href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 hover:underline ml-auto"
                          >
                            <ExternalLink className="w-3 h-3" />
                            فتح في رابط خارجي (يوتيوب)
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Options to append customized visual links: col-span-4 */}
        <div className="lg:col-span-4 xl:col-span-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                <Plus className={`w-5 h-5 ${theme.accentText}`} />
                إضافة فيديو مخصص للروتين
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                انسخ وألصق عنوان رابط من يوتيوب لتربط فيديو تمدد أو حلقة الذكر الخاصة بك ضمن روتينك اليومي.
              </p>
            </div>

            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">عنوان الفيديو</label>
                <input
                  type="text"
                  placeholder="مثال: رقية الاسترخاء والتهوية"
                  value={newVideoTitle}
                  onChange={e => setNewVideoTitle(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none ${theme.focusBorder}`}
                  maxLength={70}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">رابط يوتيوب (URL)</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={newVideoUrl}
                  onChange={e => setNewVideoUrl(e.target.value)}
                  className={`w-full px-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none font-mono text-left ${theme.focusBorder}`}
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">المدة</label>
                <input
                  type="text"
                  placeholder="مثال: 12 دقيقة"
                  value={newVideoDuration}
                  onChange={e => setNewVideoDuration(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none ${theme.focusBorder}`}
                />
              </div>

              {inputError && (
                <div className="p-3 bg-red-55 text-red-700 text-xs font-bold rounded-lg border border-red-150 leading-relaxed">
                  {inputError}
                </div>
              )}

              <button
                type="submit"
                disabled={!newVideoUrl.trim() || !newVideoTitle.trim()}
                className={`w-full py-3 px-4 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${theme.btnBg} disabled:opacity-55 disabled:cursor-not-allowed`}
                id="submit-video-btn"
              >
                <Video className="w-4 h-4" />
                إضافة الفيديو لقائمتي
              </button>
            </form>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-450 leading-relaxed font-medium">
              <span className="font-bold block text-slate-600 mb-0.5">💡 نصيحة للإنتاجية:</span>
              اختر الفيديوهات الهادئة التي تساعدك على الدخول السريع في الوعي، وتجنب الفيديوهات التي تشتت ذهنك بالصخب قبل النوم أو في الصباح الباكر!
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
