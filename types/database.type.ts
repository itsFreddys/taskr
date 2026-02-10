import { Models } from "react-native-appwrite";

export interface Habit extends Models.Document {
  user_id: string;
  emote_pic: string;
  title: string;
  description: string;
  frequency: string;
  streak_count: number;
  last_completed: string;
  created_at: string;
}

export type Frequency = "once" | "daily" | "weekly" | "monthly";

export interface Task extends Models.Document {
  // identity & basics
  creatorId: string;
  isShared: boolean;
  teamId?: string;
  emotePic: string;
  title: string;
  description: string;
  category?: string;
  status: "active" | "completed" | "inactive";

  // logic type
  type: "one-time" | "recurring";
  frequency: Frequency;
  adHocDate?: string | null;

  // date & recurrence
  startDate: string;
  endDate?: string;
  daysOfWeek?: string; // [1,3,5] => 1.3.5 for mon, wed, fri
  lastCompletedDate?: string | null;

  // timing (schedule logic)
  isAllDay: boolean;
  startTime?: string;
  endTime?: string;
  defaultTimer?: number | null;

  // time limits & progress
  hasTimeLimit: boolean;
  isCompleted: boolean; // only for 'one-time' tasks
  streakCount: number;
}

export interface HabitCompletion extends Models.Document {
  habit_id: string;
  user_id: string;
  completed_at: string;
}

export interface Note extends Models.Document {
  note_id: string;
  habit_id: string;
  user_id: string;
  username: string;
  description: string;
  created_at: string;
  updated_at: string;
}
