import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppTheme } from '../types';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('t18_theme') as AppTheme;
    return saved || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('t18_theme', theme);
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-light', 'theme-minimal', 'dark');

    if (theme === 'light') {
      root.classList.add('theme-light');
    } else if (theme === 'minimal') {
      root.classList.add('theme-minimal', 'dark');
    } else {
      root.classList.add('theme-dark', 'dark');
    }
  }, [theme]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'minimal';
      return 'dark';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
};
