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
        color: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800',
        headerColor: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
        iconColor: 'text-blue-600 dark:text-blue-400',
      };
    case 'personal':
      return {
        title: 'プライベート',
        icon: UserIcon,
        color: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800',
        headerColor: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
        iconColor: 'text-green-600 dark:text-green-400',
      };
    case 'uncategorized':
      return {
        title: '未分類',
        icon: () => <div className="w-5 h-5 rounded-full bg-gray-400" />,
        color: 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700',
        headerColor: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        iconColor: 'text-gray-600 dark:text-gray-400',
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
    <div className={`rounded-xl border-2 transition-all duration-200 ${categoryInfo.color} shadow-sm hover:shadow-md`}>
      {/* カテゴリヘッダー */}
      <div className={`p-4 rounded-t-xl ${categoryInfo.headerColor} border-b border-opacity-20`}>
        <div className="flex items-center gap-2">
          <IconComponent className={`w-5 h-5 ${categoryInfo.iconColor}`} />
          <h3 className="font-medium text-sm">{categoryInfo.title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${
            tasks.length > 0 
              ? 'bg-white bg-opacity-50 text-current' 
              : 'opacity-50'
          }`}>
            {tasks.length}
          </span>
        </div>
      </div>

      {/* タスクリスト */}
      <Droppable droppableId={category}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`p-3 min-h-[120px] transition-all duration-200 rounded-b-xl ${
              snapshot.isDraggingOver 
                ? 'bg-blue-100/50 dark:bg-blue-900/20 scale-[1.02]' 
                : ''
            }`}
          >
            {sortedTasks.length === 0 ? (
              <div className="text-center py-6">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full border-2 border-dashed flex items-center justify-center ${categoryInfo.iconColor} border-current opacity-30`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {snapshot.isDraggingOver ? 'ここにドロップ' : 'タスクをドラッグ'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`transition-all duration-200 ${
                          snapshot.isDragging ? 'rotate-1 scale-105 shadow-2xl z-50' : ''
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