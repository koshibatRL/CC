// Login.jsx
import React, { useState } from 'react';
import { loginUser, resetPassword } from '../services/authService';

const Login = ({ onLogin, switchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await loginUser(email, password);
      onLogin(user);
    } catch (error) {
      // エラーメッセージの処理
      let errorMessage = 'ログインに失敗しました。';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'アカウントが見つかりません。';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'メールアドレスまたはパスワードが間違っています。';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'ログイン試行回数が多すぎます。しばらく経ってから再試行してください。';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '有効なメールアドレスを入力してください。';
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('パスワードリセットにはメールアドレスが必要です。');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (error) {
      setError('パスワードリセットメールの送信に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Career Compass へログイン</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {resetSent && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          パスワードリセット用のメールを送信しました。メールを確認してください。
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          disabled={isLoading}
        >
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          onClick={handleResetPassword}
          className="text-sm text-blue-600 hover:text-blue-800"
          disabled={isLoading}
        >
          パスワードをお忘れですか？
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          アカウントをお持ちでない場合は
          <button
            onClick={switchToRegister}
            className="ml-1 text-blue-600 hover:text-blue-800"
          >
            新規登録
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
