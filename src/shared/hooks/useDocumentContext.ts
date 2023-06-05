import { useContext } from 'react';

import DocumentContext from '../../DocumentContext';

export default function useDocumentContext() {
  return useContext(DocumentContext);
}
