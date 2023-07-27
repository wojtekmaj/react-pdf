import { useContext } from 'react';

import PageContext from '../../PageContext.js';

export default function usePageContext() {
  return useContext(PageContext);
}
