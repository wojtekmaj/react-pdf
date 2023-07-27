import { useContext } from 'react';

import OutlineContext from '../../OutlineContext.js';

export default function useOutlineContext() {
  return useContext(OutlineContext);
}
