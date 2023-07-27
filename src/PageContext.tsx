'use client';

import { createContext } from 'react';

import type { PageContextType } from './shared/types.js';

export default createContext<PageContextType>(null);
