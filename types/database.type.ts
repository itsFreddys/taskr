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
