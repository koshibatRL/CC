import React from 'react';
import {render, screen} from '@testing-library/react';
import App from './App';

// Firebase関連のモジュールをモック化
jest.mock('./firebase', () => ({
  auth: {
    // 必要に応じて最小限のモック実装
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
  },
}));

// モックを追加
jest.mock('react-ga4', () => ({
  initialize: jest.fn(),
  send: jest.fn(),
}));

test('renders JobApplicationTracker', () => {
  render(<App />);
  const trackerElement = screen.getByText(/Career Compass/i);
  expect(trackerElement).toBeInTheDocument();
});
