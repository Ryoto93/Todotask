import React, { useState, useRef, useEffect } from 'react';
import { CalendarIcon } from './Icons';

interface AddTaskFormProps {
  onAddTask: (text: string, description?: string, dueDateTime?: Date, duePeriod?: { start: Date; end: Date }) => void;
  focusInput: boolean;
  onInputFocusChange: (focused: boolean) => void;
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({
  onAddTask,
  focusInput,
  onInputFocusChange,
}) => {
  const [taskText, setTaskText] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueStart, setDueStart] = useState('');
  const [dueEnd, setDueEnd] = useState('');
  const [dueType, setDueType] = useState<'single' | 'period'>('single');
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const dueDateInputRef = useRef<HTMLInputElement>(null);
  const dueStartInputRef = useRef<HTMLInputElement>(null);
  const dueEndInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [focusInput]);

  // Ctrl+Fで納期inputにフォーカス
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        if (isExpanded) {
          if (dueType === 'single') {
            dueDateInputRef.current?.focus();
          } else {
            dueStartInputRef.current?.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isExpanded, dueType]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (taskText.trim()) {
      let dueDateTimeObj: Date | undefined;
      let duePeriodObj: { start: Date; end: Date } | undefined;
      if (dueType === 'single' && dueDate) {
        dueDateTimeObj = new Date(`${dueDate}T00:00:00`);
      } else if (dueType === 'period' && dueStart && dueEnd) {
        duePeriodObj = { start: new Date(`${dueStart}T00:00:00`), end: new Date(`${dueEnd}T00:00:00`) };
      }
      onAddTask(
        taskText.trim(),
        description.trim() || undefined,
        dueDateTimeObj,
        duePeriodObj
      );
      setTaskText('');
      setDescription('');
      setDueDate('');
      setDueStart('');
      setDueEnd('');
      setDueType('single');
      setIsExpanded(false);
    }
  };

  const handleMainInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setTaskText('');
      setDescription('');
      setDueDate('');
      setIsExpanded(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (taskText.trim()) {
        handleSubmit();
      }
    } else if (e.key === 'Tab' && taskText.trim()) {
      e.preventDefault();
      setIsExpanded(true);
      setTimeout(() => descriptionRef.current?.focus(), 100);
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setDescription('');
      setDueDate('');
      setIsExpanded(false);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    onInputFocusChange(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onInputFocusChange(false);
  };

  const handleMainInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskText(e.target.value);
    if (e.target.value.trim() && !isExpanded) {
      // Auto-expand when user starts typing
    }
  };

  const getQuickDateOptions = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      { label: '今日', value: today.toISOString().split('T')[0] },
      { label: '明日', value: tomorrow.toISOString().split('T')[0] },
      { label: '来週', value: nextWeek.toISOString().split('T')[0] },
    ];
  };

  // 指定日付の曜日（日本語1文字）を返す
  const getWeekday = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  };

  // 納期入力欄でCtrl+Enterでタスク追加
  const handleDueInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* メインタスク入力 */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={taskText}
            onChange={handleMainInputChange}
            onKeyDown={handleMainInputKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="新しいタスクを追加... (Enter で追加、Tab で詳細入力)"
            className={`
              w-full px-4 py-3 text-sm bg-white dark:bg-gray-800 border-2 rounded-lg
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              text-gray-900 dark:text-gray-100
              transition-all duration-200 ease-out
              ${isFocused
                ? 'border-blue-500 ring-4 ring-blue-500 ring-opacity-10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
              focus:outline-none
            `}
          />
          
          {/* 詳細入力展開ボタン（モバイル用） */}
          {taskText.trim() && !isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors duration-200 md:hidden"
            >
              詳細
            </button>
          )}
        </div>

        {/* 詳細入力エリア - 条件付き表示 */}
        {(isExpanded || taskText.trim()) && (
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                詳細オプション
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setDescription('');
                  setDueDate('');
                }}
                className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                閉じる
              </button>
            </div>
            
          {/* 詳細説明 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              詳細・メモ
            </label>
            <textarea
              ref={descriptionRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleDescriptionKeyDown}
              placeholder="タスクの詳細や補足情報を入力... (Enter で追加、Shift+Enter で改行)"
              rows={2}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* 納期設定 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              納期
            </label>
            {/* 納期タイプ選択 */}
            <div className="flex gap-4 mb-2">
              <label className="flex items-center text-xs">
                <input
                  type="radio"
                  name="dueType"
                  value="single"
                  checked={dueType === 'single'}
                  onChange={() => setDueType('single')}
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
                  onChange={() => setDueType('period')}
                  className="mr-1"
                />
                期間
              </label>
            </div>
            {/* クイック選択ボタン */}
            {dueType === 'single' && (
              <div className="flex gap-2 mb-3">
                {getQuickDateOptions().map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setDueDate(option.value)}
                    className={`
                      px-3 py-1 text-xs rounded-full border transition-colors duration-200
                      ${dueDate === option.value
                        ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
            {/* 日付・時間入力 */}
            {dueType === 'single' && (
              <div>
                <div className="relative">
                  <CalendarIcon
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer"
                    onClick={() => dueDateInputRef.current?.focus()}
                  />
                  <input
                    ref={dueDateInputRef}
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    onKeyDown={handleDueInputKeyDown}
                    className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {/* 日付プレビュー（曜日付き） */}
                {dueDate && (
                  <div className="mt-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-200 flex items-center">
                    <CalendarIcon className="w-3 h-3 mr-1 text-gray-400 cursor-pointer" onClick={() => dueDateInputRef.current?.focus()} />
                    {dueDate.replace(/-/g, '/')}（{getWeekday(dueDate)}）
                  </div>
                )}
              </div>
            )}
            {dueType === 'period' && (
              <div className="flex gap-2">
                <div className="relative w-1/2">
                  <CalendarIcon
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer"
                    onClick={() => dueStartInputRef.current?.focus()}
                  />
                  <input
                    ref={dueStartInputRef}
                    type="date"
                    value={dueStart}
                    onChange={(e) => setDueStart(e.target.value)}
                    onKeyDown={handleDueInputKeyDown}
                    className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="開始日"
                  />
                </div>
                <div className="relative w-1/2">
                  <CalendarIcon
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer"
                    onClick={() => dueEndInputRef.current?.focus()}
                  />
                  <input
                    ref={dueEndInputRef}
                    type="date"
                    value={dueEnd}
                    onChange={(e) => setDueEnd(e.target.value)}
                    onKeyDown={handleDueInputKeyDown}
                    className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="終了日"
                  />
                </div>
                {/* 期間プレビュー（曜日付き） */}
                {(dueStart || dueEnd) && (
                  <div className="mt-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-200 flex items-center w-full">
                    <CalendarIcon className="w-3 h-3 mr-1 text-gray-400 cursor-pointer" onClick={() => dueStartInputRef.current?.focus()} />
                    {dueStart && `${dueStart.replace(/-/g, '/')}（${getWeekday(dueStart)}）`} 〜 {dueEnd && `${dueEnd.replace(/-/g, '/')}（${getWeekday(dueEnd)}）`}
                  </div>
                )}
              </div>
            )}
            {/* クリアボタン */}
            {(dueType === 'single' && dueDate) || (dueType === 'period' && (dueStart || dueEnd)) ? (
              <button
                type="button"
                onClick={() => {
                  setDueDate('');
                  setDueStart('');
                  setDueEnd('');
                  setDueType('single');
                }}
                className="mt-2 px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
              >
                納期をクリア
              </button>
            ) : null}
          </div>
          </div>
        )}

        {/* 追加ボタン（モバイル用） */}
        {taskText.trim() && (
          <div className="flex gap-2 md:hidden">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              タスクを追加
            </button>
            {!isExpanded && (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                詳細
              </button>
            )}
          </div>
        )}
        {/* ヘルプテキスト */}
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            <span className="hidden md:inline">Enter でタスクを追加、Tab で詳細入力</span>
            <span className="md:hidden">タップして詳細入力、</span>
            <span className="hidden md:inline">、Esc でリセット</span>
          </span>
        </div>
      </form>
    </div>
  );
};

export default AddTaskForm;