import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Runs as a useState initialiser, i.e. during render — which also happens in
  // Node when the public pages are prerendered at build time, where
  // localStorage does not exist. Light is the right answer there: the
  // prerendered HTML is theme-neutral, and the class is applied by the effect
  // below as soon as this runs in a browser.
  const [dark, setDark] = useState(() => {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem('talentifyx-theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('talentifyx-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
