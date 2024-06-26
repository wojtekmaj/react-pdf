'use client';

import { createContext } from 'react';

import type { DocumentContextType } from './shared/types.js';

const documentContext: React.Context<DocumentContextType> =
  createContext<DocumentContextType>(null);

export default documentContext;
