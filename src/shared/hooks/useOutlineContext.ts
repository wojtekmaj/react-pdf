import { useContext } from 'react';

import OutlineContext from '../../OutlineContext';

export default function useOutlineContext() {
  return useContext(OutlineContext);
}
