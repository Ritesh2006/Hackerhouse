import { create } from 'zustand';

interface UIState {
  theme: string;
  customHex: string;
  isMobileMenuOpen: boolean;
  setTheme: (theme: string, hex?: string) => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: localStorage.getItem('hackerhouse_theme') || 'indigo',
  customHex: localStorage.getItem('hackerhouse_custom_color') || '#6366f1',
  isMobileMenuOpen: false,

  setTheme: (theme, hex) => {
    localStorage.setItem('hackerhouse_theme', theme);
    if (hex) {
      localStorage.setItem('hackerhouse_custom_color', hex);
    }
    set({ theme, customHex: hex || '#6366f1' });
  },

  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
}));
