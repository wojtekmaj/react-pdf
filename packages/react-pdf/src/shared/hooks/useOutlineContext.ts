import { useContext } from 'react';

import OutlineContext from '../../OutlineContext.js';

import type { OutlineContextType } from '../types.js';

export default function useOutlineContext(): OutlineContextType {
  return useContext(OutlineContext);
}
