import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import colorPaletteSwitcher from './utils/colorPaletteSwitcher';

// Initialize color palette system
colorPaletteSwitcher.init();

// #region agent log
if (typeof window !== 'undefined') {
  setTimeout(() => {
    try {
      const root = document.documentElement;
      const computedStyle = window.getComputedStyle(root);
      const colorPrimary = computedStyle.getPropertyValue('--color-primary').trim();
      const colorSecondary = computedStyle.getPropertyValue('--color-secondary').trim();
      const localStoragePalette = localStorage.getItem('colorPalette');
      fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.js:9',message:'App initialization - checking color palette system',data:{colorPrimary,colorSecondary,localStoragePalette,hasCSSVariables:!!(colorPrimary||colorSecondary),hasLocalStoragePalette:!!localStoragePalette},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    } catch(e) {
      fetch('http://127.0.0.1:7242/ingest/e1fd222d-4bbd-4d1f-896a-e639b5e7b121',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.js:9',message:'Error checking color palette system',data:{error:e.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
  }, 100);
}
// #endregion

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
