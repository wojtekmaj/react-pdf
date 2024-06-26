import { useReducer } from 'react';

type State<T> =
  | { value: T; error: undefined }
  | { value: false; error: Error }
  | { value: undefined; error: undefined };

type Action<T> =
  | { type: 'RESOLVE'; value: T }
  | { type: 'REJECT'; error: Error }
  | { type: 'RESET' };

function reducer<T>(state: State<T>, action: Action<T>): State<T> {
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
}

export default function useResolver<T>(): [State<T>, React.Dispatch<Action<T>>] {
  return useReducer(reducer<T>, { value: undefined, error: undefined });
}
