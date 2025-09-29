import { motion } from 'framer-motion';

const CATEGORY_ICONS = {
  '교육': '🎓',
  '직업': '💼',
  '가족': '👨‍👩‍👧‍👦',
  '관계': '❤️',
  '건강': '🏥',
  '취미': '🎨',
  '여행': '✈️',
  '성취': '🏆',
  '도전': '🎯',
  '기타': '📌'
};

function EnhancedPlaceholder({ event, theme }) {
  const getEmotionGradient = (score) => {
    if (score > 0) {
      return `linear-gradient(135deg, 
        rgba(72, 187, 120, 0.1) 0%, 
        rgba(72, 187, 120, 0.3) 100%)`;
    } else if (score < 0) {
      return `linear-gradient(135deg, 
        rgba(245, 101, 101, 0.1) 0%, 
        rgba(245, 101, 101, 0.3) 100%)`;
    } else {
      return `linear-gradient(135deg, 
        rgba(160, 174, 192, 0.1) 0%, 
        rgba(160, 174, 192, 0.3) 100%)`;
    }
  };

  const getThemeStyles = () => {
    if (theme === 'handwritten') {
      return {
        fontFamily: '"Kalam", "Gaegu", "Do Hyeon", "Nanum Pen Script", cursive',
        borderStyle: 'dashed',
        borderWidth: '2px'
      };
    }
    return {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      borderStyle: 'solid',
      borderWidth: '1px'
    };
  };

  const categoryIcon = CATEGORY_ICONS[event.category] || CATEGORY_ICONS['기타'];
  const emotionGradient = getEmotionGradient(event.emotionScore);
  const themeStyles = getThemeStyles();

  return (
    <motion.div 
      className="enhanced-placeholder"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        background: emotionGradient,
        borderColor: theme === 'handwritten' ? '#4a5568' : '#e1e5e9',
        ...themeStyles
      }}
    >
      {/* 메인 아이콘 */}
      <motion.div 
        className="main-icon"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <span>{categoryIcon}</span>
      </motion.div>

      {/* 이벤트 정보 */}
      <motion.div 
        className="event-info"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3>{event.title}</h3>
        <p className="category">{event.category}</p>
      </motion.div>

      {/* 감정 점수 시각화 */}
      <motion.div 
        className="emotion-visual"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="emotion-bar">
          <div 
            className="emotion-fill"
            style={{
              width: `${Math.abs(event.emotionScore) * 10}%`,
              background: event.emotionScore >= 0 ? '#48bb78' : '#f56565'
            }}
          />
        </div>
        <span className="emotion-score">
          {event.emotionScore > 0 ? '+' : ''}{event.emotionScore}
        </span>
      </motion.div>

      {/* 중요도 표시 */}
      <motion.div 
        className="importance-display"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="stars">
          {'★'.repeat(event.importanceRate)}
          {'☆'.repeat(5 - event.importanceRate)}
        </div>
      </motion.div>

      {/* 기간 정보 */}
      {event.date && (
        <motion.div 
          className="date-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <div className="date-display">
            <span className="date-label">시작일</span>
            <span className="date-value">
              {new Date(event.date).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          {event.endDate && (
            <div className="date-display">
              <span className="date-label">종료일</span>
              <span className="date-value">
                {new Date(event.endDate).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}
          {event.endDate && (
            <div className="duration-info">
              <span>
                {Math.ceil((new Date(event.endDate) - new Date(event.date)) / (1000 * 60 * 60 * 24))}일간
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* 추가 시각적 요소 */}
      <motion.div 
        className="visual-elements"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        {/* 감정 그래프 미니어처 */}
        <div className="mini-emotion-chart">
          <svg width="100" height="30" viewBox="0 0 100 30">
            <defs>
              <linearGradient id="emotion-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: event.emotionScore >= 0 ? '#48bb78' : '#f56565', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: event.emotionScore >= 0 ? '#48bb78' : '#f56565', stopOpacity: 0.8 }} />
              </linearGradient>
            </defs>
            
            {/* 기준선 */}
            <line x1="0" y1="15" x2="100" y2="15" stroke="rgba(0,0,0,0.2)" strokeWidth="1" strokeDasharray="2 2" />
            
            {/* 감정 라인 */}
            <path
              d={`M10,15 L30,${15 - (event.emotionScore * 2)} L50,${15 - (event.emotionScore * 1.5)} L70,${15 - (event.emotionScore * 2.5)} L90,${15 - (event.emotionScore * 2)}`}
              fill="none"
              stroke="url(#emotion-gradient)"
              strokeWidth="2"
              opacity="0.8"
            />
            
            {/* 포인트 */}
            <circle cx="90" cy={15 - (event.emotionScore * 2)} r="3" fill={event.emotionScore >= 0 ? '#48bb78' : '#f56565'} opacity="0.9" />
          </svg>
        </div>
      </motion.div>

      <style>{`
        .enhanced-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 32px 24px;
          min-height: 300px;
          border-radius: 16px;
          border: 1px solid #e1e5e9;
          position: relative;
          overflow: hidden;
          text-align: center;
        }

        .enhanced-placeholder::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255, 255, 255, 0.1) 10px,
            rgba(255, 255, 255, 0.1) 20px
          );
          pointer-events: none;
        }

        .main-icon {
          position: relative;
          z-index: 1;
        }

        .main-icon span {
          font-size: 48px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .event-info {
          position: relative;
          z-index: 1;
        }

        .event-info h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 600;
          color: var(--color-text-primary);
          line-height: 1.3;
        }

        .event-info .category {
          margin: 0;
          font-size: 14px;
          color: var(--color-text-secondary);
          opacity: 0.8;
        }

        .emotion-visual {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 100%;
          max-width: 200px;
        }

        .emotion-bar {
          width: 100%;
          height: 8px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        .emotion-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
          position: relative;
        }

        .emotion-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .emotion-score {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .importance-display {
          position: relative;
          z-index: 1;
        }

        .stars {
          font-size: 18px;
          letter-spacing: 2px;
        }

        .date-info {
          position: relative;
          z-index: 1;
          font-size: 14px;
          color: var(--color-text-secondary);
          opacity: 0.7;
        }

        /* 테마별 추가 스타일 */
        .enhanced-placeholder[style*="Kalam"] {
          transform: rotate(-0.5deg);
        }

        .enhanced-placeholder[style*="Kalam"] .main-icon {
          transform: rotate(1deg);
        }

        .enhanced-placeholder[style*="Kalam"] .event-info h3 {
          transform: rotate(-0.3deg);
        }
      `}</style>
    </motion.div>
  );
}

export default EnhancedPlaceholder;