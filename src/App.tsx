import React, { useState, useEffect, useCallback } from 'react';
import { Task, AppSettings } from './types/Task';
import { TaskList } from './components/TaskList';
import { AddTaskForm } from './components/AddTaskForm';
import { CompletedTasks } from './components/CompletedTasks';
import { Settings } from './components/Settings';
import { Header } from './components/Header';
import { loadTasks, saveTasks, loadSettings, saveSettings } from './utils/storage';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';

// トップページ: タスク追加＋直近3日タスク
const TopPage: React.FC<{
  tasks: Task[];
  onAddTask: (text: string, category: 'work' | 'personal' | 'uncategorized', description?: string, dueDateTime?: Date, duePeriod?: { start: Date; end: Date }) => void;
  focusInput: boolean;
  onInputFocusChange: (focused: boolean) => void;
  onToggleTheme: () => void;
  onShowCompleted: () => void;
  onShowSettings: () => void;
  theme: 'light' | 'dark';
}> = ({ tasks, onAddTask, focusInput, onInputFocusChange, onToggleTheme, onShowCompleted, onShowSettings, theme }) => {
  // 直近3日タスク抽出
  const now = new Date();
  now.setHours(0, 0, 0, 0); // 今日の開始時刻
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  threeDaysLater.setHours(23, 59, 59, 999); // 3日後の終了時刻
  
  const isWithin3Days = (task: Task) => {
    if (task.completed) return false;
    
    // 単一日付の場合
    if (task.dueDateTime) {
      const dueDate = new Date(task.dueDateTime);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= now && dueDate <= threeDaysLater;
    }
    
    // 期間の場合
    if (task.duePeriod?.start) {
      const startDate = new Date(task.duePeriod.start);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(task.duePeriod.end);
      endDate.setHours(23, 59, 59, 999);
      
      // 期間が3日以内と重複するかチェック
      return startDate <= threeDaysLater && endDate >= now;
    }
    
    return false;
  };
  const recentTasks = tasks.filter(isWithin3Days);
  
  // 曜日を取得する関数
  const getWeekday = (date: Date) => {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return weekdays[date.getDay()];
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header
        onToggleTheme={onToggleTheme}
        onShowCompleted={onShowCompleted}
        onShowSettings={onShowSettings}
        theme={theme}
      />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            新しいタスクを追加
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            シンプルで効率的なタスク管理を始めましょう
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <AddTaskForm onAddTask={onAddTask} focusInput={focusInput} onInputFocusChange={onInputFocusChange} />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">直近3日以内のタスク</h2>
            <button 
              onClick={() => window.location.href = '/manage'} 
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              全タスクを管理
            </button>
          </div>
          
          {recentTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">直近3日以内のタスクはありません</div>
              <div className="text-gray-300 dark:text-gray-600 text-sm">新しいタスクを追加してみましょう</div>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map(task => (
                <div key={task.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900 dark:text-white">{task.text}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.category === 'work' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : task.category === 'personal'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                      }`}>
                        {task.category === 'work' ? '仕事' : task.category === 'personal' ? 'プライベート' : '未分類'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {task.dueDateTime && (
                        <span className="flex items-center gap-1">
                          <span>📅</span>
                          <span>{new Date(task.dueDateTime).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}</span>
                          <span className="text-xs">({getWeekday(new Date(task.dueDateTime))})</span>
                        </span>
                      )}
                      {task.duePeriod && (
                        <span className="flex items-center gap-1">
                          <span>📅</span>
                          <span>{new Date(task.duePeriod.start).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}〜{new Date(task.duePeriod.end).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 管理画面: カテゴリ別タスク管理
const ManagePage: React.FC<{
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onToggleTheme: () => void;
  onShowCompleted: () => void;
  onShowSettings: () => void;
  theme: 'light' | 'dark';
}> = ({ tasks, onToggleTask, onDeleteTask, onUpdateTask, onToggleTheme, onShowCompleted, onShowSettings, theme }) => {
  // ドラッグ＆ドロップ時のカテゴリ移動処理
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    // カテゴリ移動
    const newCategory = destination.droppableId as 'work' | 'personal' | 'uncategorized';
    onUpdateTask(draggableId, { category: newCategory });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header
        onToggleTheme={onToggleTheme}
        onShowCompleted={onShowCompleted}
        onShowSettings={onShowSettings}
        theme={theme}
      />
      <div className="max-w-7xl mx-auto px-6 py-8 relative" style={{ zIndex: 10 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">タスク管理</h1>
          <p className="text-gray-600 dark:text-gray-300">ドラッグ＆ドロップでカテゴリを変更できます</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 relative" style={{ zIndex: 20 }}>
          <DragDropContext onDragEnd={handleDragEnd}>
            <TaskList
              tasks={tasks}
              onToggleTask={onToggleTask}
              onDeleteTask={onDeleteTask}
              onUpdateTask={onUpdateTask}
            />
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};

function App() {
  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
  });
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [focusInput, setFocusInput] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedTasks = loadTasks();
    const loadedSettings = loadSettings();
    
    setTasks(loadedTasks);
    setSettings(loadedSettings);
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Apply theme to document
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // 完了タスクを1週間ごとに自動削除
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => prev.filter(task => {
        if (!task.completed || !task.completedAt) return true;
        const now = new Date();
        const completedAt = new Date(task.completedAt);
        const diff = now.getTime() - completedAt.getTime();
        return diff < 7 * 24 * 60 * 60 * 1000; // 1週間未満なら残す
      }));
    }, 60 * 60 * 1000); // 1時間ごとにチェック
    return () => clearInterval(interval);
  }, []);

  // Task management functions
  const addTask = useCallback((text: string, category: 'work' | 'personal' | 'uncategorized', description?: string, dueDateTime?: Date, duePeriod?: { start: Date; end: Date }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      description,
      completed: false,
      createdAt: new Date(),
      category,
      dueDateTime,
      duePeriod,
    };
    setTasks(prev => [...prev, newTask]);
    setSelectedTaskIndex(tasks.filter(t => !t.completed).length);
  }, [tasks]);

  const toggleTaskComplete = useCallback((id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? new Date() : undefined
          }
        : task
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    setSelectedTaskIndex(prev => Math.max(0, prev - 1));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  }, []);

  const restoreTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, completed: false, completedAt: undefined }
        : task
    ));
  }, []);

  const permanentDeleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  // UI functions
  const toggleTheme = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Navigation functions
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const navigateUp = useCallback(() => {
    setSelectedTaskIndex(prev => Math.max(0, prev - 1));
  }, []);

  const navigateDown = useCallback(() => {
    setSelectedTaskIndex(prev => Math.min(activeTasks.length - 1, prev + 1));
  }, [activeTasks.length]);

  const handleSelectedTaskAction = useCallback((action: 'complete' | 'delete') => {
    if (activeTasks[selectedTaskIndex]) {
      const task = activeTasks[selectedTaskIndex];
      if (action === 'complete') {
        toggleTaskComplete(task.id);
      } else if (action === 'delete') {
        deleteTask(task.id);
      }
    }
  }, [activeTasks, selectedTaskIndex, toggleTaskComplete, deleteTask]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onAddTask: () => setFocusInput(true),
    onToggleCompleted: () => handleSelectedTaskAction('complete'),
    onDeleteTask: () => handleSelectedTaskAction('delete'),
    onNavigateUp: navigateUp,
    onNavigateDown: navigateDown,
    onToggleTheme: toggleTheme,
    onShowCompleted: () => setShowCompletedModal(true),
  }, isInputFocused);

  // Reset focus flag after triggering
  useEffect(() => {
    if (focusInput) {
      setFocusInput(false);
    }
  }, [focusInput]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <TopPage
            tasks={tasks}
            onAddTask={addTask}
            focusInput={focusInput}
            onInputFocusChange={setIsInputFocused}
            onToggleTheme={toggleTheme}
            onShowCompleted={() => setShowCompletedModal(true)}
            onShowSettings={() => setShowSettingsModal(true)}
            theme={settings.theme}
          />
        } />
        <Route path="/manage" element={
          <ManagePage
            tasks={tasks}
            onToggleTask={toggleTaskComplete}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
            onToggleTheme={toggleTheme}
            onShowCompleted={() => setShowCompletedModal(true)}
            onShowSettings={() => setShowSettingsModal(true)}
            theme={settings.theme}
          />
        } />
      </Routes>
      {/* モーダルや設定は共通で表示 */}
      <CompletedTasks
        completedTasks={completedTasks}
        isOpen={showCompletedModal}
        onClose={() => setShowCompletedModal(false)}
        onRestoreTask={restoreTask}
        onPermanentDelete={permanentDeleteTask}
      />
      <Settings
        settings={settings}
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSettingsChange={updateSettings}
        onDataImported={() => {
          setTasks(loadTasks());
          setSettings(loadSettings());
        }}
      />
    </Router>
  );
}

export default App;