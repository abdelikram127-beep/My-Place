export type RoutineType = 'morning' | 'evening' | 'night';

export interface RoutineTask {
  id: string;
  title: string;
  duration: number; // in minutes
  completed: boolean;
  category: RoutineType;
  iconName: string; // lucide icon name
  arabicName?: string;
}

export interface DhikrItem {
  id: string;
  text: string;
  count: number; // target count (e.g. 3, 33, 100)
  currentCount: number; // current progress
  benefit?: string;
  category: RoutineType;
}

export interface QuranVerse {
  id: string;
  title: string;
  surahName: string;
  verses: string;
  benefit?: string;
  category: RoutineType;
}

export interface VideoItem {
  id: string;
  title: string;
  url: string; // youtube embedded URL or normal video link
  youtubeId: string;
  duration: string;
  category: RoutineType;
  thumbnail: string;
  channelName: string;
  description: string;
}
