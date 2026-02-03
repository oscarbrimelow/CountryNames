import React from 'react'
import ReactDOM from 'react-dom/client'

const waitForGlobals = (attempts = 0) => {
  const required = ['App', 'MapBoard', 'GameUI', 'StudyModal', 'StatsModal', 'CountryList', 'ListModal', 'countries', 'gameHelpers'];
  const missing = required.filter(k => !window[k]);
  
  if (missing.length === 0) {
    const App = window.App;
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    if (attempts > 100) { // 5 seconds
      document.body.innerHTML = `
        <div style="color: white; padding: 20px; font-family: sans-serif;">
          <h1>Error Loading Game</h1>
          <p>The following modules failed to load:</p>
          <ul>${missing.map(m => `<li>${m}</li>`).join('')}</ul>
          <p>Please check your internet connection or console for errors.</p>
        </div>
      `;
      console.error('Failed to load globals:', missing);
    } else {
      setTimeout(() => waitForGlobals(attempts + 1), 50);
    }
  }
};

waitForGlobals();
