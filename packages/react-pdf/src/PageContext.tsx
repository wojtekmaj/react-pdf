'use client';

import { createContext } from 'react';

import type { PageContextType } from './shared/types.js';

const pageContext: React.Context<PageContextType> = createContext<PageContextType>(null);

export default pageContext;
