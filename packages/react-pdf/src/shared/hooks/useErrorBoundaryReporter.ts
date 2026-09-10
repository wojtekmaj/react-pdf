import { useReducer } from 'react';

export default function useErrorBoundaryReporter(suspense: boolean): (error: unknown) => void {
  // Dispatch stays stable while the reducer checks the current rendering mode.
  const [failure, reportError] = useReducer(
    (_previous: { error: unknown } | undefined, error: unknown) =>
      suspense ? { error } : undefined,
    undefined,
  );

  if (suspense && failure) {
    throw failure.error;
  }

  return reportError;
}
