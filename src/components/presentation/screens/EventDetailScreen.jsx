import { motion, AnimatePresence } from 'framer-motion';
import { FiMaximize, FiMinimize } from 'react-icons/fi';

function EventDetailScreen({ 
  events, 
  currentEventIndex, 
  onToggleFullscreen,
  isFullscreen,
  position,
  size 
}) {
  if (!events.length) return null;
  
  const currentEvent = events[currentEventIndex];

  return (
    <motion.div 
      className="screen-container event-detail-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="screen-header">
        <h3>이벤트 상세</h3>
        <div className="screen-controls">
          <button 
            onClick={onToggleFullscreen}
            className="screen-control-btn"
          >
            {isFullscreen ? <FiMinimize size={16} /> : <FiMaximize size={16} />}
          </button>
        </div>
      </div>
      
      <div className="screen-content">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentEventIndex}
            className="event-detail-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* 이벤트 날짜 */}
            <motion.div 
              className="event-date"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {currentEvent.date 
                ? new Date(currentEvent.date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric'
                  })
                : `${currentEvent.order}번째 이벤트`
              }
              {currentEvent.endDate && (
                <>
                  {' ~ '}
                  {new Date(currentEvent.endDate).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </>
              )}
            </motion.div>
            
            {/* 이벤트 제목 */}
            <motion.h2
              className="event-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {currentEvent.title}
            </motion.h2>
            
            {/* 이벤트 이미지 */}
            {currentEvent.image && (
              <motion.div 
                className="event-image-container"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <img 
                  src={currentEvent.image} 
                  alt={currentEvent.title}
                  className="event-detail-image"
                />
              </motion.div>
            )}

            {/* 이벤트 설명 */}
            {currentEvent.description && (
              <motion.div 
                className="event-description"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p>{currentEvent.description}</p>
              </motion.div>
            )}

            {/* 이벤트 메타 정보 */}
            <motion.div 
              className="event-meta"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="meta-item emotion-score">
                <span className={`emotion-value ${currentEvent.emotionScore >= 0 ? 'positive' : 'negative'}`}>
                  {currentEvent.emotionScore > 0 ? '+' : ''}{currentEvent.emotionScore}
                </span>
              </div>
              <div className="meta-item importance-rate">
                <span className="stars">{'★'.repeat(currentEvent.importanceRate)}</span>
              </div>
              <div className="meta-item category">
                {currentEvent.category}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {isFullscreen && (
        <div className="screen-fullscreen-info">
          <span>이벤트 상세 전체화면 모드 - ESC로 종료</span>
        </div>
      )}
    </motion.div>
  );
}

export default EventDetailScreen;