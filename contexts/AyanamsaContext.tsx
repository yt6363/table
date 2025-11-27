import React, { createContext, useContext, useState, PropsWithChildren } from 'react';

export type AyanamsaType = 'lahiri' | 'raman' | 'kp' | 'tropical';

interface AyanamsaContextType {
  ayanamsa: AyanamsaType;
  setAyanamsa: (value: AyanamsaType) => void;
}

const AyanamsaContext = createContext<AyanamsaContextType | undefined>(undefined);

export const AyanamsaProvider = ({ children }: PropsWithChildren) => {
  const [ayanamsa, setAyanamsa] = useState<AyanamsaType>('lahiri');

  return (
    <AyanamsaContext.Provider value={{ ayanamsa, setAyanamsa }}>
      {children}
    </AyanamsaContext.Provider>
  );
};

export const useAyanamsa = () => {
  const context = useContext(AyanamsaContext);
  if (!context) {
    throw new Error('useAyanamsa must be used within an AyanamsaProvider');
  }
  return context;
};