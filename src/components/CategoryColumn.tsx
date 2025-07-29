import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Task } from '../types/Task';
import { TaskItem } from './TaskItem';
import { BriefcaseIcon, UserIcon } from './Icons';

interface CategoryColumnProps {
  category: 'work' | 'personal' | 'uncategorized';
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

const getCategoryInfo = (category: 'work' | 'personal' | 'uncategorized') => {
  switch (category) {
    case 'work':
      return {
        title: '仕事',
        icon: BriefcaseIcon,
        color: 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border-red-200 dark:border-red-800',
        headerColor: 'bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 text-red-700 dark:text-red-300',
        iconColor: 'text-red-600 dark:text-red-400',
        gradient: 'from-red-500 to-orange-500',
      };
    case 'personal':
      return {
        title: 'プライベート',
        icon: UserIcon,
        color: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200 dark:border-green-800',
        headerColor: 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300',
        iconColor: 'text-green-600 dark:text-green-400',
        gradient: 'from-green-500 to-emerald-500',
      };
    case 'uncategorized':
      return {
        title: '未分類',
        icon: () => <div className="w-5 h-5 rounded-full bg-gray-400" />,
        color: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-200 dark:border-gray-700',
        headerColor: 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800 text-gray-700 dark:text-gray-300',
        iconColor: 'text-gray-600 dark:text-gray-400',
        gradient: 'from-gray-500 to-slate-500',
      };
  }
};

export const CategoryColumn: React.FC<CategoryColumnProps> = ({
  category,
  tasks,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
}) => {
  const categoryInfo = getCategoryInfo(category);
  const IconComponent = categoryInfo.icon;

  // 納期順でタスクをソート
  const sortedTasks = [...tasks].sort((a, b) => {
    // 1. dueDateTime優先、2. duePeriod.start、3. 未設定は最後
    const getDue = (task: Task) => {
      if (task.dueDateTime) return new Date(task.dueDateTime).getTime();
      if (task.duePeriod?.start) return new Date(task.duePeriod.start).getTime();
      return Infinity;
    };
    return getDue(a) - getDue(b);
  });

  return (
    <div 
      className={`rounded-2xl border-2 transition-all duration-300 ${categoryInfo.color} shadow-lg hover:shadow-xl relative`}
    >
      {/* カテゴリヘッダー */}
      <div className={`p-6 rounded-t-2xl ${categoryInfo.headerColor} border-b border-opacity-20`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-r ${categoryInfo.gradient} shadow-md`}>
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{categoryInfo.title}</h3>
              <p className="text-xs opacity-75">タスク管理</p>
            </div>
          </div>
          <div className={`text-sm font-bold px-3 py-1 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm ${
            tasks.length > 0 
              ? 'text-current' 
              : 'opacity-50'
          }`}>
            {tasks.length}
          </div>
        </div>
      </div>

      {/* タスクリスト */}
      <Droppable droppableId={category}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`p-4 min-h-[200px] transition-all duration-300 rounded-b-2xl relative ${
              snapshot.isDraggingOver 
                ? `bg-gradient-to-br from-blue-100/50 to-purple-100/50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-lg border-2 border-blue-300 dark:border-blue-600` 
                : ''
            }`}
          >
            {sortedTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl border-2 border-dashed flex items-center justify-center ${categoryInfo.iconColor} border-current opacity-30 bg-gradient-to-br from-current/5 to-current/10`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                  {snapshot.isDraggingOver ? 'ここにドロップ' : 'タスクをドラッグ'}
                </p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
                  {snapshot.isDraggingOver ? 'カテゴリを変更' : 'または新規作成'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                          ...provided.draggableProps.style,
                          zIndex: snapshot.isDragging ? 999999 : 'auto',
                        }}
                        className={`transition-all duration-300 ${
                          snapshot.isDragging ? 'shadow-2xl' : ''
                        }`}
                      >
                        <TaskItem
                          task={task}
                          isSelected={false}
                          onToggleComplete={onToggleTask}
                          onDelete={onDeleteTask}
                          onUpdateTask={onUpdateTask}
                          dragHandleProps={provided.dragHandleProps ?? undefined}
                          categoryColor={categoryInfo.iconColor}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};