import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import DemoMode from './components/DemoMode';
import './index.css';

// Special entry point that forces DemoMode to be active and autostart
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="demo-standalone-wrapper">
      <App demoModeOverride={true} />
    </div>
  </React.StrictMode>
);
