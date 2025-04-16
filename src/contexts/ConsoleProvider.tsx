
import React, { createContext, useContext, useState } from 'react';

// Define the interface for our console system
interface ConsoleSystem {
  logs: Array<{ timestamp: number, message: string, type: 'info' | 'error' | 'warning' | 'debug' }>;
  addLog: (message: string, type?: 'info' | 'error' | 'warning' | 'debug') => void;
  clearLogs: () => void;
}

// Create the context
const ConsoleContext = createContext<ConsoleSystem | null>(null);

// Factory function to create a console system
export function createConsole(): ConsoleSystem {
  const logs: Array<{ timestamp: number, message: string, type: 'info' | 'error' | 'warning' | 'debug' }> = [];
  
  return {
    logs,
    addLog: (message: string, type: 'info' | 'error' | 'warning' | 'debug' = 'info') => {
      logs.push({ timestamp: Date.now(), message, type });
      // Also log to browser console for debugging
      switch (type) {
        case 'error':
          console.error(message);
          break;
        case 'warning':
          console.warn(message);
          break;
        case 'debug':
          console.debug(message);
          break;
        default:
          console.log(message);
      }
    },
    clearLogs: () => {
      logs.length = 0;
    }
  };
}

// Console Provider component
export const ConsoleProvider: React.FC<{
  children: React.ReactNode;
  console: ConsoleSystem;
}> = ({ children, console }) => {
  return (
    <ConsoleContext.Provider value={console}>
      {children}
    </ConsoleContext.Provider>
  );
};

// Hook to use the console context
export const useConsole = () => {
  const context = useContext(ConsoleContext);
  if (!context) {
    throw new Error('useConsole must be used within a ConsoleProvider');
  }
  return context;
};
