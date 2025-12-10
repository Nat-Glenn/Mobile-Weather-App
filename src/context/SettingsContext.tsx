import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';

export type ThemeName = 'purple' | 'light' | 'dark';
export type TempUnit = 'C' | 'F';

interface SettingsContextValue {
  theme: ThemeName;
  tempUnit: TempUnit;
  setTheme: (theme: ThemeName) => void;
  setTempUnit: (unit: TempUnit) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>('purple');
  const [tempUnit, setTempUnit] = useState<TempUnit>('C');

  return (
    <SettingsContext.Provider
      value={{ theme, tempUnit, setTheme, setTempUnit }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}
