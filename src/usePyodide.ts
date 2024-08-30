'use client';

import { PyodideInterface, loadPyodide } from 'pyodide';
import { useEffect, useState } from 'react';

export type UsePyodideProps = {
  packages?: string[]
};

export type UsePyodideState = {
  pyodide?: PyodideInterface
  isLoading: boolean
};

export const PYODIDE_INDEX_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/';

export const usePyodide = () => {
  const [pyodideState, setPyodideState] = useState<UsePyodideState>({
    pyodide: undefined,
    isLoading: true,
  });

  useEffect(() => {
    if (typeof window === undefined) return;
    if (pyodideState.pyodide !== undefined) {
      setPyodideState({ isLoading: true });
    }
    loadPyodide({ indexURL: PYODIDE_INDEX_URL })
      .then((pyodide) => {
        setPyodideState({ pyodide, isLoading: false });
      })
      // eslint-disable-next-line no-console
      .catch((err) => console.error('Pyodide could not be loaded:', err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return pyodideState;
};
