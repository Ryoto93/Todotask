import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Task, AppSettings } from './types/Task';
import { TaskList } from './components/TaskList';
import { AddTaskForm } from './components/AddTaskForm';
import { CompletedTasks } from './components/CompletedTasks';
import { Settings } from './components/Settings';
import { MoonIcon, SunIcon, CompletedIcon, SettingsIcon } from './components/Icons';
import { loadTasks, saveTasks, loadSettings, saveSettings } from './utils/storage';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

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

  const moveTaskToCategory = useCallback((taskId: string, newCategory: 'work' | 'personal' | 'uncategorized') => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, category: newCategory } : task
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

  // Drag and drop handler
  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) {
      return;
    }

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Move task to different category
    const newCategory = destination.droppableId as 'work' | 'personal' | 'uncategorized';
    moveTaskToCategory(draggableId, newCategory);
  }, [moveTaskToCategory]);

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
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-light text-gray-900 dark:text-gray-100 tracking-wide">
              MonoTask
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              思考の延長線上にある、静かなタスク管理空間
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Completed Tasks Button */}
            <button
              onClick={() => setShowCompletedModal(true)}
              className="p-2 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              title={`完了したタスク (${completedTasks.length})`}
            >
              <div className="relative">
                <CompletedIcon className="w-5 h-5" />
                {completedTasks.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center text-[10px]">
                    {completedTasks.length > 9 ? '9+' : completedTasks.length}
                  </span>
                )}
              </div>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              title="設定"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              title="テーマを切り替え"
            >
              {settings.theme === 'light' ? (
                <MoonIcon className="w-5 h-5" />
              ) : (
                <SunIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </header>

        {/* Add Task Form */}
        <div className="mb-6">
          <AddTaskForm
            onAddTask={addTask}
            focusInput={focusInput}
            onInputFocusChange={setIsInputFocused}
          />
        </div>

        {/* Task List */}
        <main>
          <DragDropContext onDragEnd={handleDragEnd}>
            <TaskList
              tasks={tasks}
              onToggleTask={toggleTaskComplete}
              onDeleteTask={deleteTask}
              onUpdateTask={updateTask}
            />
          </DragDropContext>
        </main>

        {/* Task Count */}
        {activeTasks.length > 0 && (
          <footer className="mt-6 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {activeTasks.length} 件の未完了タスク
              {completedTasks.length > 0 && `, ${completedTasks.length} 件完了済み`}
            </p>
          </footer>
        )}
      </div>

      {/* Modals */}
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
          // Reload data after import
          setTasks(loadTasks());
          setSettings(loadSettings());
        }}
      />
    </div>
  );
}

export default App;