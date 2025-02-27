import React, { useState, useEffect } from 'react';
import { subscribeToAuthChanges } from '../services/authService';
import Login from './Login';
import Register from './Register';
import JobApplicationTracker from './JobApplicationTracker';

const AuthContainer = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState('login'); // 'login' または 'register'
  
  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user);
      setLoading(false);
    });
    
    // クリーンアップ関数
    return () => unsubscribe();
  }, []);
  
  // ユーザー認証イベントハンドラ
  const handleLogin = (user) => {
    setUser(user);
  };
  
  const handleRegister = (user) => {
    setUser(user);
  };
  
  // 認証ビューの切り替え
  const switchToLogin = () => {
    setAuthView('login');
  };
  
  const switchToRegister = () => {
    setAuthView('register');
  };
  
  // ローディング状態の表示
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }
  
  // 未認証の場合、ログインまたは登録フォームを表示
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Career Compass</h1>
            <p className="mt-2 text-sm text-gray-600">
              あなたのキャリアの道しるべ
            </p>
          </div>
          
          {authView === 'login' ? (
            <Login onLogin={handleLogin} switchToRegister={switchToRegister} />
          ) : (
            <Register onRegister={handleRegister} switchToLogin={switchToLogin} />
          )}
        </div>
      </div>
    );
  }
  
  // 認証済みの場合、JobApplicationTrackerを表示
  return <JobApplicationTracker user={user} />;
};

export default AuthContainer;
