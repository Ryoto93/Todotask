export interface Task {
  id: string;
  text: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  dueDateTime?: Date; // 単一日付
  duePeriod?: {
    start: Date;
    end: Date;
  }; // 期間
  category: 'work' | 'personal' | 'uncategorized';
}

export interface AppSettings {
  theme: 'light' | 'dark';
}
