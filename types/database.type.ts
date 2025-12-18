import { Models } from "react-native-appwrite";

export interface Habit extends Models.Document {
    user_id: string;
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
    description: string;
    user_id_updated: string;
    last_updated: string;
    created_at: string;
}