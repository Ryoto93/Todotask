import React, { useState, useRef, useEffect } from 'react';
import { CalendarIcon } from './Icons';

interface AddTaskFormProps {
  onAddTask: (text: string, category: 'work' | 'personal' | 'uncategorized', description?: string, dueDateTime?: Date, duePeriod?: { start: Date; end: Date }) => void;
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
  const [category, setCategory] = useState<'work' | 'personal' | 'uncategorized'>('uncategorized');
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
        category,
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
      setCategory('uncategorized');
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
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* カテゴリ選択 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">カテゴリ</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as 'work' | 'personal' | 'uncategorized')}
            className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
          >
            <option value="uncategorized">未分類</option>
            <option value="work">仕事</option>
            <option value="personal">プライベート</option>
          </select>
        </div>
        
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
              w-full px-6 py-4 text-base bg-white dark:bg-gray-800 border-2 rounded-xl
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              text-gray-900 dark:text-gray-100
              transition-all duration-300 ease-out
              ${isFocused
                ? 'border-blue-500 ring-4 ring-blue-500/20 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
              }
              focus:outline-none
            `}
          />
          {/* 詳細入力展開ボタン（モバイル用） */}
          {taskText.trim() && !isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 md:hidden"
            >
              詳細
            </button>
          )}
        </div>
        
        {/* 追加ボタン（常時表示） */}
        <div className="flex justify-end">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!taskText.trim()}
            className={`
              px-8 py-3 text-sm font-medium rounded-xl transition-all duration-300 shadow-lg transform hover:-translate-y-0.5
              ${taskText.trim()
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
          >
            タスク追加
          </button>
        </div>

        {/* 詳細入力エリア - 条件付き表示 */}
        {(isExpanded || taskText.trim()) && (
          <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                詳細オプション
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setDescription('');
                  setDueDate('');
                }}
                className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
              >
                閉じる
              </button>
            </div>
            
          {/* 詳細説明 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              詳細・メモ
            </label>
            <textarea
              ref={descriptionRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleDescriptionKeyDown}
              placeholder="タスクの詳細や補足情報を入力... (Enter で追加、Shift+Enter で改行)"
              rows={3}
              className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all duration-200"
            />
          </div>

          {/* 納期設定 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              納期
            </label>
            {/* 納期タイプ選択 */}
            <div className="flex gap-6 mb-4">
              <label className="flex items-center text-sm cursor-pointer group">
                <input
                  type="radio"
                  name="dueType"
                  value="single"
                  checked={dueType === 'single'}
                  onChange={() => setDueType('single')}
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
                  onChange={() => setDueType('period')}
                  className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="group-hover:text-blue-600 transition-colors duration-200">期間</span>
              </label>
            </div>
            {/* クイック選択ボタン */}
            {dueType === 'single' && (
              <div className="flex gap-3 mb-4 flex-wrap">
              {getQuickDateOptions().map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setDueDate(option.value)}
                  className={`
                      px-4 py-2 text-sm rounded-xl border-2 transition-all duration-200 font-medium
                    ${dueDate === option.value
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-500 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md'
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
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors duration-200"
                    onClick={() => dueDateInputRef.current?.focus()}
                  />
                  <input
                    ref={dueDateInputRef}
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    onKeyDown={handleDueInputKeyDown}
                    className="w-full pl-12 pr-4 py-3 text-sm bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                {/* 日付プレビュー（曜日付き） */}
                {dueDate && (
                  <div className="mt-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl text-sm text-gray-700 dark:text-gray-200 flex items-center border border-blue-200 dark:border-blue-700">
                    <CalendarIcon className="w-4 h-4 mr-2 text-blue-500 cursor-pointer hover:text-blue-600 transition-colors duration-200" onClick={() => dueDateInputRef.current?.focus()} />
                    {dueDate.replace(/-/g, '/')}（{getWeekday(dueDate)}）
                  </div>
                )}
              </div>
            )}
            {dueType === 'period' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <CalendarIcon
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors duration-200"
                      onClick={() => dueStartInputRef.current?.focus()}
                    />
                    <input
                      ref={dueStartInputRef}
                      type="date"
                      value={dueStart}
                      onChange={(e) => setDueStart(e.target.value)}
                      onKeyDown={handleDueInputKeyDown}
                      className="w-full pl-12 pr-4 py-3 text-sm bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="開始日"
                    />
                  </div>
                  <div className="relative flex-1">
                    <CalendarIcon
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors duration-200"
                      onClick={() => dueEndInputRef.current?.focus()}
                    />
                    <input
                      ref={dueEndInputRef}
                      type="date"
                      value={dueEnd}
                      onChange={(e) => setDueEnd(e.target.value)}
                      onKeyDown={handleDueInputKeyDown}
                      className="w-full pl-12 pr-4 py-3 text-sm bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="終了日"
                    />
                  </div>
                </div>
                {/* 期間プレビュー（曜日付き） */}
                {(dueStart || dueEnd) && (
                  <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl text-sm text-gray-700 dark:text-gray-200 flex items-center border border-green-200 dark:border-green-700">
                    <CalendarIcon className="w-4 h-4 mr-2 text-green-500 cursor-pointer hover:text-green-600 transition-colors duration-200" onClick={() => dueStartInputRef.current?.focus()} />
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
                className="mt-4 px-4 py-2 text-sm bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition-all duration-200 font-medium"
              >
                納期をクリア
              </button>
            ) : null}
          </div>
          </div>
        )}

        {/* 追加ボタン（モバイル用） */}
        {taskText.trim() && (
          <div className="flex gap-3 md:hidden">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              タスクを追加
            </button>
            {!isExpanded && (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="px-6 py-3 bg-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
              >
                詳細
              </button>
            )}
          </div>
        )}
        {/* ヘルプテキスト */}
        <div className="mt-4 text-center">
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