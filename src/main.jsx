import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Initialize Teams SDK when available
const initTeams = () => {
  if (window.microsoftTeams) {
    window.microsoftTeams.app.initialize().then(() => {
      window.microsoftTeams.app.notifySuccess();
      console.log('✅ Teams SDK initialized');
    }).catch((error) => {
      // Only log in development, suppress in production
      if (import.meta.env.DEV) {
        console.warn('⚠️ Teams SDK initialization failed (expected when running locally):', error.message);
      }
    });
  }
};

// Try to initialize immediately if SDK is already loaded
if (window.microsoftTeams) {
  initTeams();
} else {
  // Wait for SDK to load
  window.addEventListener('load', () => {
    if (window.microsoftTeams) {
      initTeams();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

