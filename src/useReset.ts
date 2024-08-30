import { useCallback, useState } from 'react';

export default function useReset() {
  const [resetCounter, setResetCounter] = useState(0);
  const newReset = useCallback(() => setResetCounter((prev) => prev + 1), []);
  return {
    resetCounter,
    newReset,
  };
}
