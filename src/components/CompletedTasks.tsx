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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border-t sm:border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
              <CheckIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                完了したタスク
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {completedTasks.length} 件の完了タスク
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {completedTasks.length === 0 ? (
            <div className="p-16 text-center">
              <div className="p-6 bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-700 dark:to-slate-700 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                <CheckIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
                完了したタスクはありません
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                タスクを完了するとここに表示されます
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700/50 dark:to-slate-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-md">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300 line-through">
                        {task.text}
                      </p>
                      {task.completedAt && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">
                          完了日: {formatDate(task.completedAt)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => onRestoreTask(task.id)}
                        className="px-4 py-2 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium shadow-md"
                      >
                        復元
                      </button>
                      <button
                        onClick={() => onPermanentDelete(task.id)}
                        className="px-4 py-2 text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-medium shadow-md"
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