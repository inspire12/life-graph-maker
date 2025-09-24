import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiSun, FiMoon, FiBook, FiCheck, FiChevronUp, FiEdit3 } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';

const THEME_ICONS = {
  light: FiSun,
  dark: FiMoon,
  book: FiBook,
  handwritten: FiEdit3
};

function GlobalThemeSelector({ className = '', showUpward = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme, changeTheme, availableThemes } = useTheme();

  const handleThemeSelect = (themeId) => {
    changeTheme(themeId);
    setIsOpen(false);
  };

  const currentThemeObj = availableThemes.find(t => t.id === currentTheme);
  const CurrentIcon = THEME_ICONS[currentTheme];

  return (
    <div className={`global-theme-selector ${className}`}>
      <button
        className="global-theme-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="전역 테마 선택"
      >
        <CurrentIcon size={16} />
        <span className="theme-name">{currentThemeObj?.displayName}</span>
        <motion.div
          className="chevron"
          animate={{ rotate: isOpen ? (showUpward ? 0 : 180) : (showUpward ? 180 : 0) }}
          transition={{ duration: 0.2 }}
        >
          <FiChevronUp size={14} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* 오버레이 */}
            <motion.div
              className="theme-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* 드롭다운 메뉴 */}
            <motion.div
              className={`theme-dropdown ${showUpward ? 'upward' : 'downward'}`}
              initial={{ opacity: 0, y: showUpward ? 10 : -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: showUpward ? 10 : -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="theme-list">
                {availableThemes.map((theme) => {
                  const isSelected = theme.id === currentTheme;
                  const ThemeIcon = THEME_ICONS[theme.id];
                  
                  return (
                    <motion.button
                      key={theme.id}
                      className={`theme-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleThemeSelect(theme.id)}
                      whileHover={{ backgroundColor: 'var(--color-button-secondary-hover)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="theme-icon">
                        <ThemeIcon size={18} />
                      </div>
                      
                      <div className="theme-info">
                        <div className="theme-title">
                          {theme.displayName}
                          {isSelected && <FiCheck size={14} className="check-icon" />}
                        </div>
                        <div className="theme-description">{theme.description}</div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              
              <div className="theme-footer">
                <small>테마는 실시간으로 적용됩니다</small>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .global-theme-selector {
          position: relative;
          display: inline-block;
        }

        .global-theme-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background-color: var(--color-button-secondary);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          color: var(--color-text-primary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 120px;
          justify-content: space-between;
        }

        .global-theme-trigger:hover {
          background-color: var(--color-button-secondary-hover);
          box-shadow: var(--shadow-sm);
        }

        .theme-name {
          font-weight: 500;
        }

        .chevron {
          opacity: 0.6;
        }

        .theme-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          background: transparent;
        }

        .theme-dropdown {
          position: absolute;
          left: 0;
          right: 0;
          background-color: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          z-index: 1001;
          overflow: hidden;
          min-width: 240px;
        }

        .theme-dropdown.downward {
          top: calc(100% + 8px);
        }

        .theme-dropdown.upward {
          bottom: calc(100% + 8px);
        }

        .theme-list {
          max-height: 280px;
          overflow-y: auto;
        }

        .theme-option {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .theme-option:hover {
          background-color: var(--color-button-secondary-hover);
        }

        .theme-option.selected {
          background-color: var(--color-surface);
          border-left: 3px solid var(--color-primary);
        }

        .theme-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background-color: var(--color-surface);
          color: var(--color-text-primary);
        }

        .theme-info {
          flex: 1;
          min-width: 0;
        }

        .theme-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 2px;
        }

        .check-icon {
          color: var(--color-primary);
        }

        .theme-description {
          font-size: 12px;
          color: var(--color-text-secondary);
          line-height: 1.3;
        }

        .theme-footer {
          padding: 8px 16px;
          background-color: var(--color-surface);
          border-top: 1px solid var(--color-border);
          text-align: center;
        }

        .theme-footer small {
          color: var(--color-text-secondary);
          font-size: 11px;
        }

        /* 스크롤바 스타일링 */
        .theme-list::-webkit-scrollbar {
          width: 6px;
        }

        .theme-list::-webkit-scrollbar-track {
          background: var(--color-surface);
        }

        .theme-list::-webkit-scrollbar-thumb {
          background: var(--color-border);
          border-radius: 3px;
        }

        .theme-list::-webkit-scrollbar-thumb:hover {
          background: var(--color-text-disabled);
        }
      `}</style>
    </div>
  );
}

export default GlobalThemeSelector;