"use client";
import { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationState {
  currentPage: 'login' | 'register' | 'home' | 'profile' | 'cleaning';
  userId?: number;
}

interface NavigationContextType {
  nav: NavigationState;
  navigate: (page: NavigationState['currentPage'], userId?: number) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [nav, setNav] = useState<NavigationState>({ currentPage: 'login' });

  const navigate = (page: NavigationState['currentPage'], userId?: number) => {
    setNav({ currentPage: page, userId });
  };

  return (
    <NavigationContext.Provider value={{ nav, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};
