
import { createContext, useContext } from 'react';
import { supabaseServices } from "@/services/supabase";

// Create a context for the API functionality
export const ApiContext = createContext<ReturnType<typeof supabaseServices> | null>(null);

// This hook allows components to access the API functions
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

// The provider component
export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const api = supabaseServices;
  
  return (
    <ApiContext.Provider value={api}>
      {children}
    </ApiContext.Provider>
  );
};
