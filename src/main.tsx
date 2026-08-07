import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      typeof event.reason.message === 'string' &&
      (event.reason.message.includes('message channel closed before a response was received') ||
       event.reason.message.includes('listener indicated an asynchronous response'))
    ) {
      // Suppress harmless browser extension message channel noise
      event.preventDefault();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
