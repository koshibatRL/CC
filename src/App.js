import React, { useEffect } from 'react';
import ReactGA from 'react-ga4';
import JobApplicationTracker from './components/JobApplicationTracker';
import './App.css';

function App() {
  useEffect(() => {
    // Google Analyticsの初期化とページビュー送信
    ReactGA.initialize('G-PJFKFCMZLP');
    ReactGA.send('pageview');
  }, []); // 空の依存配列で最初のレンダー時のみ実行

  return (
    <div className="App">
      <JobApplicationTracker />
    </div>
  );
}

export default App;