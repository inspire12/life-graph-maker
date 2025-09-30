import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const GLOBAL_THEMES = {

  book: {
    id: 'book',
    name: 'Book',
    displayName: '북',
    description: '따뜻하고 아늑한 책 느낌의 테마',
    colors: {
      primary: '#d97706',
      secondary: '#dc2626',
      background: 'linear-gradient(135deg, #fef7ed 0%, #fef3c7 100%)',
      surface: 'rgba(254, 252, 232, 0.9)',
      card: 'rgba(255, 251, 235, 0.95)',
      border: 'rgba(217, 119, 6, 0.2)',
      text: {
        primary: '#451a03',
        secondary: '#92400e',
        disabled: '#d97706'
      },
      button: {
        primary: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
        primaryHover: 'linear-gradient(135deg, #b45309 0%, #c2410c 100%)',
        secondary: 'rgba(254, 252, 232, 0.8)',
        secondaryHover: 'rgba(252, 211, 77, 0.3)'
      },
      shadow: '0 10px 25px rgba(217, 119, 6, 0.2)',
      shadowHover: '0 20px 40px rgba(217, 119, 6, 0.3)'
    }
  },
  handwritten: {
    id: 'handwritten',
    name: 'Handwritten',
    displayName: '손글씨',
    description: '손으로 그린 스케치 느낌의 테마',
    colors: {
      primary: '#4a5568',
      secondary: '#48bb78',
      background: 'linear-gradient(135deg, #fdfdfd 0%, #f7fafc 100%)',
      surface: 'rgba(247, 250, 252, 0.8)',
      card: 'rgba(255, 255, 255, 0.9)',
      border: 'rgba(74, 85, 104, 0.2)',
      text: {
        primary: '#2d3748',
        secondary: '#4a5568',
        disabled: '#a0aec0'
      },
      button: {
        primary: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
        primaryHover: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
        secondary: 'rgba(247, 250, 252, 0.8)',
        secondaryHover: 'rgba(237, 242, 247, 0.9)'
      },
      shadow: '0 8px 20px rgba(74, 85, 104, 0.15)',
      shadowHover: '0 15px 35px rgba(74, 85, 104, 0.25)'
    }
  },
  light: {
    id: 'light',
    name: 'Light',
    displayName: '라이트',
    description: '깔끔하고 현대적인 밝은 테마',
    colors: {
      primary: '#6366f1',
      secondary: '#f59e0b',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      surface: 'rgba(255, 255, 255, 0.8)',
      card: 'rgba(255, 255, 255, 0.95)',
      border: 'rgba(148, 163, 184, 0.2)',
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        disabled: '#94a3b8'
      },
      button: {
        primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        primaryHover: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        secondary: 'rgba(255, 255, 255, 0.8)',
        secondaryHover: 'rgba(248, 250, 252, 0.9)'
      },
      shadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      shadowHover: '0 20px 40px rgba(0, 0, 0, 0.15)'
    }
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    displayName: '다크',
    description: '고급스럽고 세련된 어두운 테마',
    colors: {
      primary: '#3b82f6',
      secondary: '#fbbf24',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      surface: 'rgba(30, 41, 59, 0.8)',
      card: 'rgba(51, 65, 85, 0.9)',
      border: 'rgba(71, 85, 105, 0.3)',
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        disabled: '#64748b'
      },
      button: {
        primary: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
        primaryHover: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
        secondary: 'rgba(51, 65, 85, 0.8)',
        secondaryHover: 'rgba(71, 85, 105, 0.8)'
      },
      shadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
      shadowHover: '0 20px 40px rgba(0, 0, 0, 0.6)'
    }
  },

};

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('app-theme');
    return saved || 'book';
  });

  const [controlsVisible, setControlsVisible] = useState(true);

  const theme = GLOBAL_THEMES[currentTheme];

  const changeTheme = (themeId) => {
    if (GLOBAL_THEMES[themeId]) {
      setCurrentTheme(themeId);
      localStorage.setItem('app-theme', themeId);
    }
  };

  const toggleControls = () => {
    setControlsVisible(prev => !prev);
  };

  useEffect(() => {
    // CSS 커스텀 속성으로 테마 색상 적용
    const root = document.documentElement;
    const colors = theme.colors;

    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-card', colors.card);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-text-primary', colors.text.primary);
    root.style.setProperty('--color-text-secondary', colors.text.secondary);
    root.style.setProperty('--color-text-disabled', colors.text.disabled);
    root.style.setProperty('--color-button-primary', colors.button.primary);
    root.style.setProperty('--color-button-primary-hover', colors.button.primaryHover);
    root.style.setProperty('--color-button-secondary', colors.button.secondary);
    root.style.setProperty('--color-button-secondary-hover', colors.button.secondaryHover);
    root.style.setProperty('--shadow-default', colors.shadow);
    root.style.setProperty('--shadow-hover', colors.shadowHover);

    // 테마에 따른 다크 모드 클래스 적용
    document.body.className = `theme-${currentTheme}`;
  }, [theme, currentTheme]);

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      theme,
      changeTheme,
      controlsVisible,
      toggleControls,
      availableThemes: Object.values(GLOBAL_THEMES)
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;