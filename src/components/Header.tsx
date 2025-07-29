import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MoonIcon, SunIcon, CompletedIcon, SettingsIcon } from './Icons';

interface HeaderProps {
  onToggleTheme: () => void;
  onShowCompleted: () => void;
  onShowSettings: () => void;
  theme: 'light' | 'dark';
}

export const Header: React.FC<HeaderProps> = ({
  onToggleTheme,
  onShowCompleted,
  onShowSettings,
  theme
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* ロゴ・タイトル */}
          <div className="flex items-center space-x-4">
            <div 
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer"
              onClick={() => navigate('/')}
            >
              Monotask
            </div>
            <span className={`text-sm text-gray-500 dark:text-gray-400 font-medium transition-opacity duration-200 ${
                location.pathname === '/manage' ? 'opacity-100' : 'opacity-0'
              }`}>
              管理画面
            </span>
          </div>

          {/* ナビゲーション */}
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === '/'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              トップ
            </button>
            <button
              onClick={() => navigate('/manage')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === '/manage'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              管理画面
            </button>
          </nav>

          {/* アクションアイコン */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onShowCompleted}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
              title="完了タスク一覧"
            >
              <CompletedIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </button>
            
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
              title={theme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'}
            >
              {theme === 'light' ? (
                <MoonIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              ) : (
                <SunIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              )}
            </button>
            
            <button
              onClick={onShowSettings}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
              title="設定"
            >
              <SettingsIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}; 