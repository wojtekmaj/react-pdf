import { useReducer, useState } from 'react';

export type State<T> = { value: T | undefined; error: undefined } | { value: false; error: Error };

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

export default function useResolver<T>(resetKey?: unknown): [State<T>, React.Dispatch<Action<T>>] {
  const [previousResetKey, setPreviousResetKey] = useState(() => resetKey);
  const [state, dispatch] = useReducer(reducer<T>, { value: undefined, error: undefined });

  // Reset before effects can report a result belonging to the previous input.
  if (!Object.is(previousResetKey, resetKey)) {
    setPreviousResetKey(() => resetKey);
    dispatch({ type: 'RESET' });
  }

  return [state, dispatch];
}
