import React, { useState } from 'react';
import { Task } from '../types/Task';
import { CheckIcon, TrashIcon, CalendarIcon, GripIcon, FileTextIcon } from './Icons';

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  dragHandleProps?: React.HTMLAttributes<Element>;
  categoryColor?: string;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isSelected,
  onToggleComplete,
  onDelete,
  onUpdateTask,
  dragHandleProps,
  categoryColor = 'text-gray-400',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [dueType, setDueType] = useState<'single' | 'period'>(task.duePeriod ? 'period' : 'single');
  const [editDueDate, setEditDueDate] = useState(task.dueDateTime ? task.dueDateTime.toISOString().slice(0, 10) : '');
  const [editDueStart, setEditDueStart] = useState(task.duePeriod?.start ? new Date(task.duePeriod.start).toISOString().slice(0, 10) : '');
  const [editDueEnd, setEditDueEnd] = useState(task.duePeriod?.end ? new Date(task.duePeriod.end).toISOString().slice(0, 10) : '');
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editDescription, setEditDescription] = useState(task.description || '');

  const handleDeleteClick = () => {
    if (deleteConfirm) {
      onDelete(task.id);
      setDeleteConfirm(false);
    } else {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 3000);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditDueDate(e.target.value);
  };
  const handleDueStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditDueStart(e.target.value);
  };
  const handleDueEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditDueEnd(e.target.value);
  };
  const handleDueTypeChange = (type: 'single' | 'period') => {
    setDueType(type);
    if (type === 'single') {
      setEditDueStart('');
      setEditDueEnd('');
    } else {
      setEditDueDate('');
    }
  };
  const handleDueSave = () => {
    if (dueType === 'single' && editDueDate) {
      onUpdateTask(task.id, { dueDateTime: new Date(editDueDate + 'T00:00:00'), duePeriod: undefined });
    } else if (dueType === 'period' && editDueStart && editDueEnd) {
      onUpdateTask(task.id, { dueDateTime: undefined, duePeriod: { start: new Date(editDueStart + 'T00:00:00'), end: new Date(editDueEnd + 'T00:00:00') } });
    }
    setShowDateTimePicker(false);
  };

  const handleEditSave = () => {
    if (editText.trim()) {
      onUpdateTask(task.id, {
        text: editText.trim(),
        description: editDescription.trim() || undefined,
      });
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditText(task.text);
    setEditDescription(task.description || '');
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const formatDateTime = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    if (isToday) {
      return `今日`;
    } else if (isTomorrow) {
      return `明日`;
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  // 指定日付の曜日（日本語1文字）を返す
  const getWeekday = (date: Date) => {
    return ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  };

  const isOverdue = task.dueDateTime && new Date() > task.dueDateTime && !task.completed;

  return (
    <div
      className={`
        group relative p-4 bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-300
        ${isSelected
          ? 'border-blue-500 ring-4 ring-blue-500/20 shadow-lg'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
        hover:shadow-lg hover:-translate-y-0.5
        ${task.completed ? 'opacity-75' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        zIndex: 'auto',
      }}
    >
      <div className="flex items-start gap-3">
        {/* ドラッグハンドル */}
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg touch-none"
            style={{ userSelect: 'none' }}
          >
            <GripIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
          </div>
        )}

        {/* 完了チェックボタン */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`
            w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 mt-0.5 flex-shrink-0 cursor-pointer hover:scale-110
            ${task.completed
              ? `${categoryColor.replace('text-', 'bg-gradient-to-r ').replace('dark:text-', 'dark:bg-gradient-to-r ')} border-current text-white shadow-lg`
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
            }
          `}
        >
          {task.completed && <CheckIcon className="w-4 h-4" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleEditKeyDown}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={handleEditKeyDown}
                placeholder="詳細・メモ"
                rows={2}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all duration-200"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEditSave}
                  className="px-4 py-2 text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-md"
                >
                  保存
                </button>
                <button
                  onClick={handleEditCancel}
                  className="px-4 py-2 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition-all duration-200 font-medium"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <span
                className={`
                  block text-sm font-semibold transition-all duration-200 leading-tight cursor-pointer
                  ${task.completed
                    ? 'line-through text-gray-500 dark:text-gray-400'
                    : 'text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400'
                  }
                `}
                onClick={() => !task.completed && setIsEditing(true)}
                title={!task.completed ? "クリックして編集" : ""}
              >
                {task.text}
              </span>
              
              {/* 詳細説明 */}
              {task.description && (
                <p 
                  className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                  onClick={() => !task.completed && setIsEditing(true)}
                  title={!task.completed ? "クリックして編集" : ""}
                >
                  {task.description}
                </p>
              )}
              
              {/* 納期表示 */}
              {(task.dueDateTime || task.duePeriod) && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="p-1 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                    <CalendarIcon className="w-3 h-3 text-blue-500" />
                  </div>
                  <span
                    className={`
                      text-xs px-3 py-1 rounded-full font-medium
                      ${isOverdue && !task.completed
                        ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-600 dark:from-red-900/20 dark:to-pink-900/20 dark:text-red-400 border border-red-200 dark:border-red-700'
                        : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 dark:from-gray-700 dark:to-slate-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                      }
                    `}
                  >
                    {task.dueDateTime
                      ? `${formatDateTime(task.dueDateTime)}（${getWeekday(task.dueDateTime)}）`
                      : task.duePeriod
                        ? `${new Date(task.duePeriod.start).toLocaleDateString()}（${getWeekday(new Date(task.duePeriod.start))}） 〜 ${new Date(task.duePeriod.end).toLocaleDateString()}（${getWeekday(new Date(task.duePeriod.end))}）`
                        : ''}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={`flex items-center gap-1 transition-all duration-300 ${isHovered || isSelected || isEditing ? 'opacity-100' : 'opacity-0'}`}>
          {/* 編集ボタン */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-all duration-200 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
              title="タスクを編集"
            >
              <FileTextIcon className="w-4 h-4" />
            </button>
          )}

          {/* 納期設定ボタン */}
          {!isEditing && (
            <div className="relative">
              <button
                onClick={() => setShowDateTimePicker(!showDateTimePicker)}
                className="p-2 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-all duration-200 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                title="納期を設定"
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
              
              {showDateTimePicker && (
                <div className="absolute right-0 top-10 z-20 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border-2 border-gray-200 dark:border-gray-700 flex flex-col gap-3 min-w-[280px]">
                  <div className="flex gap-4 mb-2">
                    <label className="flex items-center text-sm cursor-pointer group">
                      <input
                        type="radio"
                        name="dueType"
                        value="single"
                        checked={dueType === 'single'}
                        onChange={() => handleDueTypeChange('single')}
                        className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="group-hover:text-blue-600 transition-colors duration-200">日付</span>
                    </label>
                    <label className="flex items-center text-sm cursor-pointer group">
                      <input
                        type="radio"
                        name="dueType"
                        value="period"
                        checked={dueType === 'period'}
                        onChange={() => handleDueTypeChange('period')}
                        className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="group-hover:text-blue-600 transition-colors duration-200">期間</span>
                    </label>
                  </div>
                  {dueType === 'single' && (
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={handleDateChange}
                      className="px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      autoFocus
                    />
                  )}
                  {dueType === 'period' && (
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={editDueStart}
                        onChange={handleDueStartChange}
                        className="flex-1 px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        placeholder="開始日"
                      />
                      <input
                        type="date"
                        value={editDueEnd}
                        onChange={handleDueEndChange}
                        className="flex-1 px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        placeholder="終了日"
                      />
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleDueSave}
                      className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-md"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setShowDateTimePicker(false)}
                      className="flex-1 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition-all duration-200 font-medium"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delete Button */}
          {!isEditing && (
            <button
              onClick={handleDeleteClick}
              className={`
                p-2 transition-all duration-200 rounded-lg
                ${deleteConfirm
                  ? 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                }
              `}
              title={deleteConfirm ? "もう一度クリックして削除確定" : "タスクを削除"}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};