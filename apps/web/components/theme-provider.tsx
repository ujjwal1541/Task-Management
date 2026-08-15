'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Mode = 'light' | 'dark' | 'system';
export type Accent = 'amber' | 'blue' | 'pink' | 'rose' | 'emerald' | 'black';

export const ACCENTS: { key: Accent; label: string; swatch: string }[] = [
  { key: 'amber', label: 'Amber', swatch: '#f59e0b' },
  { key: 'blue', label: 'Blue', swatch: '#6366f1' },
  { key: 'pink', label: 'Pink', swatch: '#ec4899' },
  { key: 'rose', label: 'Rose', swatch: '#f43f5e' },
  { key: 'emerald', label: 'Emerald', swatch: '#059669' },
  { key: 'black', label: 'Black', swatch: '#111111' },
];

interface ThemeContextValue {
  mode: Mode;
  accent: Accent;
  setMode: (mode: Mode) => void;
  setAccent: (accent: Accent) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'ablespace.theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('light');
  const [accent, setAccent] = useState<Accent>('black');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { mode?: Mode; accent?: Accent };
        if (saved.mode) setMode(saved.mode);
        if (saved.accent) setAccent(saved.accent);
      }
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const isDark = mode === 'dark' || (mode === 'system' && media.matches);
      root.classList.toggle('dark', isDark);
      root.dataset.accent = accent;
    };
    apply();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, accent }));
    if (mode !== 'system') return;
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [mode, accent]);

  const value = useMemo(() => ({ mode, accent, setMode, setAccent }), [mode, accent]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
