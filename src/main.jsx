import React from 'react'
import ReactDOM from 'react-dom/client'

const waitForGlobals = () => {
  const required = ['App', 'MapBoard', 'GameUI', 'StudyModal', 'StatsModal', 'CountryList', 'ListModal', 'countries'];
  const missing = required.filter(k => !window[k]);
  
  if (missing.length === 0) {
    const App = window.App;
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    // console.log('Waiting for:', missing.join(', '));
    setTimeout(waitForGlobals, 50);
  }
};

waitForGlobals();
