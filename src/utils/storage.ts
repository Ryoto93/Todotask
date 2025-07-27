import { Task, AppSettings } from '../types/Task';

const TASKS_KEY = 'monotask_tasks';
const SETTINGS_KEY = 'monotask_settings';

export const loadTasks = (): Task[] => {
  try {
    const stored = localStorage.getItem(TASKS_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored).map((task: any) => ({
      ...task,
      category: task.category || 'uncategorized',
      createdAt: new Date(task.createdAt),
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      dueDateTime: task.dueDateTime ? new Date(task.dueDateTime) : undefined,
    }));
  } catch (error) {
    console.error('Failed to load tasks:', error);
    return [];
  }
};

export const saveTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks:', error);
  }
};

export const loadSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) {
      return {
        theme: 'light',
      };
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {
      theme: 'light',
    };
  }
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

export const exportData = () => {
  const tasks = loadTasks();
  const settings = loadSettings();
  
  const data = {
    tasks,
    settings,
    exportedAt: new Date().toISOString(),
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `monotask-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importData = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.tasks) {
          saveTasks(data.tasks);
        }
        if (data.settings) {
          saveSettings(data.settings);
        }
        
        resolve();
      } catch (error) {
        reject(new Error('Invalid file format'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};