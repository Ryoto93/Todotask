import React from 'react';
import { Task } from '../types/Task';
import { CloseIcon, CheckIcon } from './Icons';

interface CompletedTasksProps {
  completedTasks: Task[];
  isOpen: boolean;
  onClose: () => void;
  onRestoreTask: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

export const CompletedTasks: React.FC<CompletedTasksProps> = ({
  completedTasks,
  isOpen,
  onClose,
  onRestoreTask,
  onPermanentDelete,
}) => {
  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[80vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                完了したタスク
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {completedTasks.length} 件の完了タスク
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {completedTasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                完了したタスクはありません
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="p-1 bg-green-100 dark:bg-green-900/20 rounded">
                      <CheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-through">
                        {task.text}
                      </p>
                      {task.completedAt && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          完了日: {formatDate(task.completedAt)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => onRestoreTask(task.id)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors duration-200"
                      >
                        復元
                      </button>
                      <button
                        onClick={() => onPermanentDelete(task.id)}
                        className="px-3 py-1 text-xs bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors duration-200"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};