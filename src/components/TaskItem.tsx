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
        group relative flex items-start gap-3 p-3 rounded-lg border transition-all duration-200
        ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        ${task.completed 
          ? 'bg-gray-50/50 dark:bg-gray-800/30 border-gray-200/50 dark:border-gray-700/50' 
          : 'bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
        }
        ${isOverdue ? 'border-red-300 dark:border-red-600 bg-red-50/50 dark:bg-red-900/10' : ''}
        backdrop-blur-sm
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* カテゴリインジケーター */}
      <div className={`w-1 h-full absolute left-0 top-0 rounded-l-lg ${categoryColor.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')}`} />
      
      {/* Drag Handle */}
      <div
        {...dragHandleProps}
        className={`
          cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1
          ${categoryColor} hover:opacity-80
        `}
      >
        <GripIcon className="w-4 h-4" />
      </div>

      {/* Checkbox */}
      <button
        onClick={() => onToggleComplete(task.id)}
        className={`
          w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 mt-0.5 flex-shrink-0 cursor-pointer
          ${task.completed
            ? `${categoryColor.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')} border-current text-white`
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
      >
        {task.completed && <CheckIcon className="w-3 h-3" />}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleEditKeyDown}
              className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onKeyDown={handleEditKeyDown}
              placeholder="詳細・メモ"
              rows={2}
              className="w-full px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleEditSave}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
              >
                保存
              </button>
              <button
                onClick={handleEditCancel}
                className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <span
              className={`
                block text-sm font-medium transition-all duration-200 leading-tight cursor-pointer
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
                className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => !task.completed && setIsEditing(true)}
                title={!task.completed ? "クリックして編集" : ""}
              >
                {task.description}
              </p>
            )}
            
            {/* 納期表示 */}
            {(task.dueDateTime || task.duePeriod) && (
              <div className="flex items-center gap-1 mt-1">
                <CalendarIcon className="w-3 h-3 text-gray-400" />
                <span
                  className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${isOverdue && !task.completed
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
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
      <div className={`flex items-center gap-1 transition-opacity duration-200 mt-1 ${isHovered || isSelected || isEditing ? 'opacity-100' : 'opacity-0'}`}>
        {/* 編集ボタン */}
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors duration-200 rounded"
            title="タスクを編集"
          >
            <FileTextIcon className="w-3.5 h-3.5" />
          </button>
        )}

        {/* 納期設定ボタン */}
        {!isEditing && (
          <div className="relative">
            <button
              onClick={() => setShowDateTimePicker(!showDateTimePicker)}
              className="p-1 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors duration-200 rounded"
              title="納期を設定"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
            </button>
            
            {showDateTimePicker && (
              <div className="absolute right-0 top-8 z-20 bg-white dark:bg-gray-700 p-3 rounded shadow-lg border border-gray-300 dark:border-gray-600 flex flex-col gap-2">
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center text-xs">
                    <input
                      type="radio"
                      name="dueType"
                      value="single"
                      checked={dueType === 'single'}
                      onChange={() => handleDueTypeChange('single')}
                      className="mr-1"
                    />
                    日付
                  </label>
                  <label className="flex items-center text-xs">
                    <input
                      type="radio"
                      name="dueType"
                      value="period"
                      checked={dueType === 'period'}
                      onChange={() => handleDueTypeChange('period')}
                      className="mr-1"
                    />
                    期間
                  </label>
                </div>
                {dueType === 'single' && (
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={handleDateChange}
                    className="px-2 py-1 text-xs border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    autoFocus
                  />
                )}
                {dueType === 'period' && (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={editDueStart}
                      onChange={handleDueStartChange}
                      className="px-2 py-1 text-xs border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      placeholder="開始日"
                    />
                    <input
                      type="date"
                      value={editDueEnd}
                      onChange={handleDueEndChange}
                      className="px-2 py-1 text-xs border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      placeholder="終了日"
                    />
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleDueSave}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setShowDateTimePicker(false)}
                    className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
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
              p-1 transition-colors duration-200 rounded
              ${deleteConfirm
                ? 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300'
                : 'text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400'
              }
            `}
            title={deleteConfirm ? "もう一度クリックして削除確定" : "タスクを削除"}
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};