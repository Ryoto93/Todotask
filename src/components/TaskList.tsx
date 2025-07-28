import React from 'react';
import { Task } from '../types/Task';
import { CategoryColumn } from './CategoryColumn';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

export function TaskList({ tasks, onToggleTask, onDeleteTask, onUpdateTask }: TaskListProps) {
  const workTasks = tasks.filter(task => task.category === 'work' && !task.completed);
  const personalTasks = tasks.filter(task => task.category === 'personal' && !task.completed);
  const uncategorizedTasks = tasks.filter(task => task.category === 'uncategorized' && !task.completed);

  return (
    <div className="space-y-8">
      {/* Main categories in a grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CategoryColumn
          category="work"
          tasks={workTasks}
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
          onUpdateTask={onUpdateTask}
        />
        <CategoryColumn
          category="personal"
          tasks={personalTasks}
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
          onUpdateTask={onUpdateTask}
        />
      </div>

      {/* Uncategorized tasks at the bottom, only show if there are tasks */}
      {uncategorizedTasks.length > 0 && (
        <div className="mt-8">
          <CategoryColumn
            category="uncategorized"
            tasks={uncategorizedTasks}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
            onUpdateTask={onUpdateTask}
          />
        </div>
      )}
    </div>
  );
}