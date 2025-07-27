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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <SettingsIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              設定
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* テーマ設定 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              テーマ
            </h3>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={settings.theme === 'light'}
                  onChange={(e) => onSettingsChange({ theme: e.target.value as 'light' | 'dark' })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">ライト</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={settings.theme === 'dark'}
                  onChange={(e) => onSettingsChange({ theme: e.target.value as 'light' | 'dark' })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">ダーク</span>
              </label>
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              データ管理
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={exportData}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
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
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  <UploadIcon className="w-4 h-4" />
                  データをインポート
                </button>
              </div>
            </div>
          </div>

          {/* Shortcuts */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              キーボードショートカット
            </h3>
            
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>タスク追加</span>
                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">A / N</code>
              </div>
              <div className="flex justify-between">
                <span>タスク完了</span>
                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">D / Space</code>
              </div>
              <div className="flex justify-between">
                <span>タスク削除</span>
                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+Backspace</code>
              </div>
              <div className="flex justify-between">
                <span>完了済み表示</span>
                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+H</code>
              </div>
              <div className="flex justify-between">
                <span>テーマ変更</span>
                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+T</code>
              </div>
              <div className="flex justify-between">
                <span>カテゴリ移動</span>
                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">ドラッグ&ドロップ</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};