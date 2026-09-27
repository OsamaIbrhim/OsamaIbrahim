import { createContext, useContext, useState, type ReactNode } from 'react';

// Whether the opening preloader has finished; hero animations wait for it so
// the two never compete for attention.
const IntroContext = createContext<{ done: boolean; finish: () => void }>({ done: true, finish: () => {} });

export function IntroProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState(false);
  return <IntroContext.Provider value={{ done, finish: () => setDone(true) }}>{children}</IntroContext.Provider>;
}

export const useIntro = () => useContext(IntroContext);
