
import React, { createContext } from 'react';
import { ApiContextType } from './types';

// Create the context
export const ApiContext = createContext<ApiContextType | undefined>(undefined);

