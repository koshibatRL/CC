import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {auth} from '../firebase';

// ユーザー登録
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
        auth, email, password,
    );
    // ユーザープロフィール更新（表示名を設定）
    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });
    }
    return userCredential.user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// ログイン
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
        auth, email, password,
    );
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// ログアウト
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// 認証状態の監視
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

// パスワードリセットメールの送信
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// 現在のユーザーを取得
export const getCurrentUser = () => {
  return auth.currentUser;
};
