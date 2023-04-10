import { useReducer } from 'react';

export function useResolver() {
  return useReducer(
    (state, action) => {
      switch (action.type) {
        case 'RESOLVE':
          return { value: action.value, error: undefined };
        case 'REJECT':
          return { value: false, error: action.error };
        case 'RESET':
          return { value: undefined, error: undefined };
        default:
          return state;
      }
    },
    { value: undefined, error: undefined },
  );
}
