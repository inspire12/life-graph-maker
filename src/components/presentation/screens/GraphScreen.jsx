import { motion } from 'framer-motion';
import { FiMaximize, FiMinimize } from 'react-icons/fi';
import PresentationGraph from '../PresentationGraph';

function GraphScreen({ 
  events, 
  currentEventIndex, 
  currentTheme, 
  onToggleFullscreen,
  isFullscreen,
  position,
  size 
}) {
  const getHeight = () => {
    if (isFullscreen) return window.innerHeight - 100;
    if (size === 'xl') return 600;
    if (size === 'large') return 400;
    return 300;
  };

  return (
    <motion.div 
      className="screen-container graph-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="screen-header">
        <h3>인생 그래프</h3>
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
        <PresentationGraph
          events={events}
          currentEventIndex={currentEventIndex}
          viewMode="timeline"
          height={getHeight()}
          theme={currentTheme}
        />
      </div>
      
      {isFullscreen && (
        <div className="screen-fullscreen-info">
          <span>그래프 전체화면 모드 - ESC로 종료</span>
        </div>
      )}
    </motion.div>
  );
}

export default GraphScreen;