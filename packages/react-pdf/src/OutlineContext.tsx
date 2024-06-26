'use client';

import { createContext } from 'react';

import type { OutlineContextType } from './shared/types.js';

const outlineContext: React.Context<OutlineContextType> = createContext<OutlineContextType>(null);

export default outlineContext;
