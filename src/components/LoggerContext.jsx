// src/components/LoggerContext.jsx
import React, { createContext, useState, useCallback } from 'react';

export const LoggerContext = createContext(null);

export const LoggerProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((message, level = 'info') => {
    const timestamp = new Date().toLocaleTimeString('nl-NL', { hour12: false });
    const newLog = { timestamp, message, level };
    console.log(`[${level.toUpperCase()}] ${message}`); // Blijf ook loggen naar de console
    setLogs(prevLogs => [...prevLogs, newLog]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <LoggerContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </LoggerContext.Provider>
  );
};