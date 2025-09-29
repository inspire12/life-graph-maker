import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { graphService } from '../services/graphService';
import { eventService } from '../services/eventService';
import PresentationGraph from '../components/presentation/PresentationGraph';
import ControlPanel from '../components/presentation/ControlPanel';
import EnhancedPlaceholder from '../components/presentation/EnhancedPlaceholder';
import SmartPaginatedText from '../components/presentation/SmartPaginatedText';

function Presentation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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
      'dark': 'modern',
      'book': 'modern',
      'handwritten': 'handwritten'
    };
    return themeMapping[globalTheme] || 'modern';
  };
  
  const [currentTheme, setCurrentTheme] = useState(() => getGraphThemeFromGlobalTheme(globalTheme));
  const [layoutMode, setLayoutMode] = useState('vertical'); // 'horizontal' | 'vertical'
  const [sidebarOpen, setSidebarOpen] = useState(false); // 그래프 사이드바 토글
  const [sidebarMode, setSidebarMode] = useState('overlay'); // 'overlay' | 'push'

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

  // URL 파라미터에 따른 시작 인덱스 설정
  useEffect(() => {
    if (events.length === 0) return;

    const startParam = searchParams.get('start');
    const eventIdParam = searchParams.get('eventId');
    
    if (eventIdParam) {
      // 특정 이벤트 ID에서 시작
      const eventIndex = events.findIndex(event => event.id === eventIdParam);
      if (eventIndex !== -1) {
        setCurrentEventIndex(eventIndex);
      }
    } else if (startParam) {
      // 특정 인덱스에서 시작 (1-based to 0-based conversion)
      const startIndex = parseInt(startParam, 10) - 1;
      if (!isNaN(startIndex) && startIndex >= 0) {
        if (startIndex >= events.length) {
          // 최대 길이를 초과하면 마지막 페이지로
          setCurrentEventIndex(events.length - 1);
        } else {
          setCurrentEventIndex(startIndex);
        }
      }
    }
  }, [events, searchParams]);

  // 현재 이벤트 인덱스가 변경되면 URL 파라미터 업데이트
  useEffect(() => {
    if (events.length === 0) return;
    
    // URL에 현재 위치 반영 (0이 아닐 때만, 1-based index로 저장)
    if (currentEventIndex > 0) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('start', (currentEventIndex + 1).toString());
      setSearchParams(newSearchParams, { replace: true });
    } else {
      // 첫 번째 이벤트면 start 파라미터 제거
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('start');
      newSearchParams.delete('eventId');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [currentEventIndex, events.length, searchParams, setSearchParams]);

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
      case 'g':
      case 'G':
        e.preventDefault();
        toggleSidebar();
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        setSidebarMode(prev => prev === 'overlay' ? 'push' : 'overlay');
        break;
      case 'l':
      case 'L':
        e.preventDefault();
        setLayoutMode(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
        break;
      // 테마 변경 단축키 (1-2)
      case '1':
        e.preventDefault();
        setCurrentTheme('modern');
        break;
      case '2':
        e.preventDefault();
        setCurrentTheme('handwritten');
        break;
      default:
        // 다른 키 입력 시에는 자동 진행을 정지하지 않음
        break;
    }
  }, [handleExit, handlePrevious, handleNext, toggleAutoPlay, toggleControls, toggleSidebar, setLayoutMode, setCurrentTheme, setSidebarMode]);

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
    <div className={`presentation-container ${sidebarMode === 'push' && sidebarOpen ? 'sidebar-push-mode' : ''}`}>
      {/* 그래프 사이드바 */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            className={`graph-sidebar ${sidebarMode === 'push' ? 'sidebar-push' : 'sidebar-overlay'}`}
            initial={{ x: -800 }}
            animate={{ x: 0 }}
            exit={{ x: -800 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="sidebar-header">
              <h3>인생 그래프</h3>
              <button onClick={toggleSidebar} className="sidebar-close">
                ✕
              </button>
            </div>
            <div className="sidebar-content">
              <PresentationGraph
                events={events}
                currentEventIndex={currentEventIndex}
                viewMode="timeline"
                height={500}
                theme="modern"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 사이드바 오버레이 */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            className={`${sidebarMode === 'overlay' ? 'overlay-mode' : 'push-mode'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* 그래프 토글 버튼 */}
      <button 
        className="graph-toggle-btn"
        onClick={toggleSidebar}
        title="그래프 보기/숨기기 (G)"
      >
        📊
      </button>

      {/* 메인 컨텐츠 영역 */}
      <main className="presentation-main-new">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentEventIndex}
            className="content-wrapper"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
          >


            {/* 메인 컨텐츠: 좌우 레이아웃 유지 */}
            <div className="main-content-grid">
              {/* 왼쪽: 이미지 또는 플레이스홀더 */}
              <motion.div 
                className="image-section"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {currentEvent.image ? (
                  <img 
                    src={currentEvent.image} 
                    alt={currentEvent.title}
                    className="main-event-image"
                  />
                ) : (
                  <EnhancedPlaceholder event={currentEvent} theme={currentTheme} />
                )}
              </motion.div>

              {/* 오른쪽: 텍스트 섹션 */}
              <motion.div 
                className="text-section"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <motion.div
                    className="event-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                  <div className="event-title-container">
                    <h2 className="event-title">{currentEvent.title}</h2>

                    <div className="event-date">
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
                                      {<br/>}' ~ '
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
                    </div>
                  </div>
                </motion.div>
                <div className="event-description">
                  <SmartPaginatedText 
                    text={currentEvent.description}
                    className="presentation-text"
                  />
                </div>

                {/* 이벤트 상세 정보 */}
                <motion.div 
                  className="event-meta"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="meta-item">
                    <span className={`emotion-value ${currentEvent.emotionScore >= 0 ? 'positive' : 'negative'}`}>
                      {currentEvent.emotionScore > 0 ? '+' : ''}{currentEvent.emotionScore}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="stars">{'★'.repeat(currentEvent.importanceRate)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="category">{currentEvent.category}</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
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
        sidebarMode={sidebarMode}
        setSidebarMode={setSidebarMode}
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