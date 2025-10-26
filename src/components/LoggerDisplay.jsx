// src/components/LoggerDisplay.jsx
import React, { useContext } from 'react';
import { LoggerContext } from './LoggerContext';

const LoggerDisplay = () => {
  const { logs, clearLogs } = useContext(LoggerContext);

  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      width: '450px',
      height: '300px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div className="bg-gray-900 text-white font-mono rounded-lg shadow-xl border border-gray-700 flex flex-col h-full">
        <div className="p-2 border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-bold text-sm">Live Applicatie Logboek</h3>
          <button onClick={clearLogs} className="text-xs bg-gray-700 hover:bg-red-500 px-2 py-1 rounded">Wissen</button>
        </div>
        <div className="p-2 text-xs overflow-y-auto flex-grow">
          {logs.map((log, index) => (
            <div key={index} className="flex">
              <span className="text-gray-500 mr-2">{log.timestamp}</span>
              <span className={getLevelColor(log.level)}>{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoggerDisplay;