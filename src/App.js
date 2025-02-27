import React, {useEffect} from 'react';
import ReactGA from 'react-ga4';
import AuthContainer from './components/AuthContainer';
import './App.css';
/**
 * Main App component for the Career Compass application.
 * @return {JSX.Element} The rendered App component
 */
function App() {
  useEffect(() => {
    // Google Analyticsの初期化とページビュー送信
    ReactGA.initialize('G-PJFKFCMZLP');
    ReactGA.send('pageview');
  }, []); // 空の依存配列で最初のレンダー時のみ実行

  return (
    <div className="App">
      <AuthContainer />
    </div>
  );
}

export default App;
