import React, { useRef } from 'react';
import { AppSettings } from '../types/Task';
import { CloseIcon, DownloadIcon, UploadIcon, SettingsIcon } from './Icons';
import { exportData, importData } from '../utils/storage';

interface SettingsProps {
  settings: AppSettings;
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: Partial<AppSettings>) => void;
  onDataImported: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  isOpen,
  onClose,
  onSettingsChange,
  onDataImported,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importData(file);
      onDataImported();
      alert('データのインポートが完了しました。ページを再読み込みします。');
      window.location.reload();
    } catch (error) {
      alert('インポートに失敗しました: ' + (error as Error).message);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border-t sm:border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              設定
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* テーマ設定 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              テーマ
            </h3>
            
            <div className="flex items-center gap-6">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={settings.theme === 'light'}
                  onChange={(e) => onSettingsChange({ theme: e.target.value as 'light' | 'dark' })}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors duration-200">ライト</span>
              </label>
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={settings.theme === 'dark'}
                  onChange={(e) => onSettingsChange({ theme: e.target.value as 'light' | 'dark' })}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors duration-200">ダーク</span>
              </label>
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              データ管理
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={exportData}
                className="flex items-center justify-center gap-3 w-full px-4 py-3 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <DownloadIcon className="w-4 h-4" />
                データをエクスポート
              </button>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-3 w-full px-4 py-3 text-sm bg-gradient-to-r from-gray-600 to-slate-600 text-white rounded-xl hover:from-gray-700 hover:to-slate-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <UploadIcon className="w-4 h-4" />
                  データをインポート
                </button>
              </div>
            </div>
          </div>

          {/* Shortcuts */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              キーボードショートカット
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700/50 dark:to-slate-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <span className="text-gray-700 dark:text-gray-300 font-medium">タスク追加</span>
                <code className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-mono text-xs font-medium">Ctrl+A / Ctrl+N</code>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700/50 dark:to-slate-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <span className="text-gray-700 dark:text-gray-300 font-medium">タスク完了</span>
                <code className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 rounded-lg font-mono text-xs font-medium">Ctrl+D / Ctrl+Space</code>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700/50 dark:to-slate-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <span className="text-gray-700 dark:text-gray-300 font-medium">タスク削除</span>
                <code className="px-3 py-1 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-700 dark:text-red-300 rounded-lg font-mono text-xs font-medium">Ctrl+Backspace</code>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700/50 dark:to-slate-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <span className="text-gray-700 dark:text-gray-300 font-medium">完了済み表示</span>
                <code className="px-3 py-1 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 text-orange-700 dark:text-orange-300 rounded-lg font-mono text-xs font-medium">Ctrl+H</code>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700/50 dark:to-slate-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <span className="text-gray-700 dark:text-gray-300 font-medium">テーマ変更</span>
                <code className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg font-mono text-xs font-medium">Ctrl+T</code>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700/50 dark:to-slate-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <span className="text-gray-700 dark:text-gray-300 font-medium">カテゴリ移動</span>
                <code className="px-3 py-1 bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-600 dark:to-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-mono text-xs font-medium">ドラッグ&ドロップ</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};