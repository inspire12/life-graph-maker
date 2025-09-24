import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowDown, FiCheck } from 'react-icons/fi';
import { getThemeList } from '../../styles/graphThemes';

function ThemeSelector({ currentTheme, onThemeChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const themes = getThemeList();

  const handleThemeSelect = (theme) => {
    onThemeChange(theme.id);
    setIsOpen(false);
  };

  const currentThemeObj = themes.find(t => t.id === currentTheme) || themes[0];

  return (
    <div className={`theme-selector ${className}`}>
      <button
        className="theme-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="테마 선택"
      >
        <FiArrowDown size={18} />
        <span className="theme-name">{currentThemeObj.name}</span>
        <motion.div
          className="chevron"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* 오버레이 */}
            <motion.div
              className="theme-selector-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* 드롭다운 메뉴 */}
            <motion.div
              className="theme-selector-dropdown"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="theme-list">
                {themes.map((theme) => {
                  const isSelected = theme.id === currentTheme;
                  
                  return (
                    <motion.button
                      key={theme.id}
                      className={`theme-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleThemeSelect(theme)}
                      whileHover={{ backgroundColor: 'rgba(33, 150, 243, 0.08)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="theme-preview">
                        {/* 테마 미리보기 */}
                        <div className="mini-graph">
                          <svg width="40" height="24" viewBox="0 0 40 24">
                            <defs>
                              <linearGradient id={`gradient-${theme.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: theme.styles.lineColor, stopOpacity: 0.3 }} />
                                <stop offset="100%" style={{ stopColor: theme.styles.lineColor, stopOpacity: 0.7 }} />
                              </linearGradient>
                            </defs>
                            
                            {/* 격자 (테마별로 다른 스타일) */}
                            {!theme.styles.hideGrid && (
                              <g stroke={theme.styles.gridColor} strokeWidth="0.5" opacity="0.5">
                                <line x1="0" y1="6" x2="40" y2="6" strokeDasharray={theme.styles.gridPattern} />
                                <line x1="0" y1="12" x2="40" y2="12" strokeDasharray={theme.styles.gridPattern} />
                                <line x1="0" y1="18" x2="40" y2="18" strokeDasharray={theme.styles.gridPattern} />
                                <line x1="10" y1="0" x2="10" y2="24" strokeDasharray={theme.styles.gridPattern} />
                                <line x1="20" y1="0" x2="20" y2="24" strokeDasharray={theme.styles.gridPattern} />
                                <line x1="30" y1="0" x2="30" y2="24" strokeDasharray={theme.styles.gridPattern} />
                              </g>
                            )}
                            
                            {/* 샘플 라인 */}
                            <path
                              d="M2,20 Q10,8 18,12 Q26,16 38,6"
                              fill="none"
                              stroke={theme.styles.lineColor}
                              strokeWidth={theme.styles.lineWidth * 0.5}
                              strokeDasharray={theme.styles.lineDashArray}
                              opacity="0.8"
                              style={{
                                filter: theme.styles.roughPath ? 'url(#rough-path)' : 'none'
                              }}
                            />
                            
                            {/* 샘플 점들 */}
                            <circle cx="8" cy="14" r="2" fill={theme.styles.lineColor} opacity="0.9" />
                            <circle cx="18" cy="10" r="2" fill={theme.styles.positiveReferenceColor} opacity="0.9" />
                            <circle cx="28" cy="16" r="2" fill={theme.styles.negativeReferenceColor} opacity="0.9" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="theme-info">
                        <div className="theme-title">
                          {theme.name}
                          {isSelected && <FiCheck size={14} className="check-icon" />}
                        </div>
                        <div className="theme-description">{theme.description}</div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              
              <div className="theme-selector-footer">
                <small>테마는 실시간으로 적용됩니다</small>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .theme-selector {
          position: relative;
          display: inline-block;
        }

        .theme-selector-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          color: #374151;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 140px;
          justify-content: space-between;
        }

        .theme-selector-trigger:hover {
          border-color: #2196f3;
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
        }

        .theme-name {
          font-weight: 500;
        }

        .chevron {
          font-size: 10px;
          opacity: 0.6;
        }

        .theme-selector-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          background: transparent;
        }

        .theme-selector-dropdown {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e1e5e9;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          z-index: 1001;
          overflow: hidden;
          min-width: 280px;
        }

        .theme-list {
          max-height: 320px;
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
          background: rgba(33, 150, 243, 0.05);
        }

        .theme-option.selected {
          background: rgba(33, 150, 243, 0.1);
          border-left: 3px solid #2196f3;
        }

        .theme-preview {
          flex-shrink: 0;
        }

        .mini-graph {
          padding: 4px;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e9ecef;
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
          color: #1f2937;
          margin-bottom: 2px;
        }

        .check-icon {
          color: #2196f3;
        }

        .theme-description {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.3;
        }

        .theme-selector-footer {
          padding: 8px 16px;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
          text-align: center;
        }

        .theme-selector-footer small {
          color: #6b7280;
          font-size: 11px;
        }

        /* 스크롤바 스타일링 */
        .theme-list::-webkit-scrollbar {
          width: 6px;
        }

        .theme-list::-webkit-scrollbar-track {
          background: #f1f3f4;
        }

        .theme-list::-webkit-scrollbar-thumb {
          background: #c1c8cd;
          border-radius: 3px;
        }

        .theme-list::-webkit-scrollbar-thumb:hover {
          background: #a8b0b8;
        }
      `}</style>
    </div>
  );
}

export default ThemeSelector;