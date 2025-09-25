import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { graphService } from '../services/graphService';
import { eventService } from '../services/eventService';
import PresentationGraph from '../components/presentation/PresentationGraph';
import ControlPanel from '../components/presentation/ControlPanel';

function Presentation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { controlsVisible, toggleControls, currentTheme: globalTheme } = useTheme();
  const [graph, setGraph] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [minImportance, setMinImportance] = useState(3);
  const [autoPlayInterval, setAutoPlayInterval] = useState(5000); // 5초
  
  // 전역 테마에 따라 그래프 테마 자동 매핑
  const getGraphThemeFromGlobalTheme = (globalTheme) => {
    const themeMapping = {
      'light': 'modern',
      'dark': 'minimal',
      'book': 'notebook',
      'handwritten': 'handwritten'
    };
    return themeMapping[globalTheme] || 'modern';
  };
  
  const [currentTheme, setCurrentTheme] = useState(() => getGraphThemeFromGlobalTheme(globalTheme));
  const [layoutMode, setLayoutMode] = useState('vertical'); // 'horizontal' | 'vertical'

  // 전역 테마 변경 시 그래프 테마도 자동 업데이트
  useEffect(() => {
    setCurrentTheme(getGraphThemeFromGlobalTheme(globalTheme));
  }, [globalTheme]);

  useEffect(() => {
    loadGraph();
  }, [id]);

  useEffect(() => {
    if (graph) {
      loadFilteredEvents();
    }
  }, [graph, minImportance]);

  // 자동 진행 효과
  useEffect(() => {
    let interval = null;
    
    if (isAutoPlay && events.length > 0) {
      interval = setInterval(() => {
        setCurrentEventIndex(prev => {
          const nextIndex = prev < events.length - 1 ? prev + 1 : 0;
          console.log('Auto advancing from', prev, 'to', nextIndex);
          return nextIndex;
        });
      }, autoPlayInterval);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAutoPlay, events.length, autoPlayInterval]);

  // 자동 진행 중 특정 클릭으로만 정지하도록 변경
  const handleStopAutoPlay = (e) => {
    // 네비게이션 버튼 클릭 시에만 자동 진행 정지
    if (e.target.closest('.navigation-controls') || e.target.closest('.btn-control')) {
      setIsAutoPlay(false);
    }
  };

  const loadGraph = async () => {
    try {
      const data = await graphService.getGraphById(id);
      if (!data) {
        alert('그래프를 찾을 수 없습니다.');
        navigate('/');
        return;
      }
      setGraph(data);
    } catch (error) {
      console.error('Failed to load graph:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadFilteredEvents = async () => {
    try {
      const filteredEvents = await eventService.getEventsByImportance(id, minImportance);
      const sortedEvents = eventService.sortEventsByTime(filteredEvents);
      setEvents(sortedEvents);
      setCurrentEventIndex(0);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const handlePrevious = () => {
    setIsAutoPlay(false); // 수동 조작 시 자동 진행 정지
    setCurrentEventIndex(prev => 
      prev > 0 ? prev - 1 : events.length - 1
    );
  };

  const handleNext = () => {
    setIsAutoPlay(false); // 수동 조작 시 자동 진행 정지
    setCurrentEventIndex(prev => 
      prev < events.length - 1 ? prev + 1 : 0
    );
  };

  const handleExit = () => {
    navigate(`/graph/${id}`);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  const handleKeyPress = useCallback((e) => {
    switch (e.key) {
      case 'Escape':
        handleExit();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        handlePrevious();
        break;
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        handleNext();
        break;
      case 'p':
      case 'P':
        e.preventDefault();
        toggleAutoPlay();
        break;
      case 'h':
      case 'H':
        e.preventDefault();
        toggleControls();
        break;
      case 'l':
      case 'L':
        e.preventDefault();
        setLayoutMode(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
        break;
      // 테마 변경 단축키 (1-5)
      case '1':
        e.preventDefault();
        setCurrentTheme('modern');
        break;
      case '2':
        e.preventDefault();
        setCurrentTheme('analog');
        break;
      case '3':
        e.preventDefault();
        setCurrentTheme('handwritten');
        break;
      case '4':
        e.preventDefault();
        setCurrentTheme('notebook');
        break;
      case '5':
        e.preventDefault();
        setCurrentTheme('minimal');
        break;
      default:
        // 다른 키 입력 시에는 자동 진행을 정지하지 않음
        break;
    }
  }, [handleExit, handlePrevious, handleNext, toggleAutoPlay, toggleControls, setLayoutMode, setCurrentTheme]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (loading) {
    return <div className="presentation-loading">로딩 중...</div>;
  }

  if (!graph || events.length === 0) {
    return (
      <div className="presentation-container">
        <div className="presentation-error">
          <h2>표시할 이벤트가 없습니다</h2>
          <p>중요도 {minImportance}점 이상의 이벤트가 없습니다.</p>
          <button onClick={handleExit} className="btn btn-primary">
            편집 모드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const currentEvent = events[currentEventIndex];

  return (
    <div className="presentation-container">
      {/* 깔끔한 프리젠테이션 화면 */}
      <main className={`presentation-main ${layoutMode === 'vertical' ? 'vertical-layout' : 'horizontal-layout'}`}>
        <div className="graph-section">
          <PresentationGraph
            events={events}
            currentEventIndex={currentEventIndex}
            viewMode="timeline"
            height={layoutMode === 'vertical' ? 300 : 400}
            theme={currentTheme}
          />
        </div>

        <div className="story-section">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentEventIndex}
              className="event-story"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ 
                duration: 0.5, 
                ease: "easeInOut" 
              }}
            >
              <motion.div 
                className="event-date"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {currentEvent.date 
                  ? (
                    <>
                      {new Date(currentEvent.date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
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
                    </>
                  )
                  : `${currentEvent.order}번째 이벤트`
                }
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {currentEvent.title}
              </motion.h2>
              
              {currentEvent.image && (
                <motion.div 
                  className="event-image-presentation"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <img 
                    src={currentEvent.image} 
                    alt={currentEvent.title}
                    className="presentation-event-image"
                  />
                </motion.div>
              )}

              {currentEvent.description && (
                <motion.div 
                  className="event-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <p>{currentEvent.description}</p>
                </motion.div>
              )}

              <motion.div 
                className="event-details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div 
                  className="emotion-score"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  <span className={`emotion-value ${currentEvent.emotionScore >= 0 ? 'positive' : 'negative'}`}>
                    {currentEvent.emotionScore > 0 ? '+' : ''}{currentEvent.emotionScore}
                  </span>
                </motion.div>
                <motion.div 
                  className="importance-rate"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                >
                  <span className="stars">{'★'.repeat(currentEvent.importanceRate)}</span>
                </motion.div>
                <motion.div 
                  className="category"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                >
                  {currentEvent.category}
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* 플로팅 컨트롤 패널 */}
      <ControlPanel
        handlePrevious={handlePrevious}
        handleNext={handleNext}
        toggleAutoPlay={toggleAutoPlay}
        isAutoPlay={isAutoPlay}
        minImportance={minImportance}
        setMinImportance={setMinImportance}
        currentTheme={currentTheme}
        setCurrentTheme={setCurrentTheme}
        autoPlayInterval={autoPlayInterval}
        setAutoPlayInterval={setAutoPlayInterval}
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
        controlsVisible={controlsVisible}
        toggleControls={toggleControls}
        handleExit={handleExit}
        currentEventIndex={currentEventIndex}
        totalEvents={events.length}
      />
    </div>
  );
}

export default Presentation;