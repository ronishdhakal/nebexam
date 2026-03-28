'use client';

import { createContext, useContext, useRef, useCallback } from 'react';

const AnswerGateContext = createContext(null);

/** Wrap a question paper page with this to enable the 4-free-answer gate. */
export function AnswerGateProvider({ children }) {
  const countRef = useRef(0);

  const tryReveal = useCallback(() => {
    countRef.current += 1;
    return countRef.current;
  }, []);

  return (
    <AnswerGateContext.Provider value={{ tryReveal }}>
      {children}
    </AnswerGateContext.Provider>
  );
}

export const useAnswerGate = () => useContext(AnswerGateContext);
