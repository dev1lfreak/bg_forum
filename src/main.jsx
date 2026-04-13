import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppProvider } from './state/AppContext.jsx';
import './styles/index.scss';

ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter basename="/bg_forum">
    <AppProvider>
      <App />
    </AppProvider>
  </HashRouter>
);



