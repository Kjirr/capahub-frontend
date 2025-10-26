import React from 'react'
import ReactDOM from 'react-dom/client'
// --- START WIJZIGING: BrowserRouter importeren ---
import { BrowserRouter } from 'react-router-dom';
// --- EINDE WIJZIGING ---
import App from './App.jsx'
import './index.css'
import 'reactflow/dist/style.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* --- START WIJZIGING: App omhullen met BrowserRouter --- */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
    {/* --- EINDE WIJZIGING --- */}
  </React.StrictMode>,
)