import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext';
import { Auth0Provider } from './context/Auth0Context';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Auth0Provider>
  </React.StrictMode>,
);
