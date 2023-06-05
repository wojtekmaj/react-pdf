import { useContext } from 'react';

import PageContext from '../../PageContext';

export default function usePageContext() {
  return useContext(PageContext);
}
