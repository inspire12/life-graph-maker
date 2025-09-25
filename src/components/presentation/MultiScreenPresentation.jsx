import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMaximize, FiMinimize, FiGrid, FiMonitor, FiSettings, FiX, FiPlay, FiPause } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import { graphService } from '../../services/graphService';
import { eventService } from '../../services/eventService';

// 개별 스크린 컴포넌트들
import GraphScreen from './screens/GraphScreen';
import EventDetailScreen from './screens/EventDetailScreen';
import ControlScreen from './screens/ControlScreen';
import TimelineOverviewScreen from './screens/TimelineOverviewScreen';

const LAYOUT_MODES = {
  GRID_2x2: '2x2',
  MAIN_DETAIL: 'main-detail',
  TRIPLE_RIGHT: 'triple-right',
  GRAPH_FOCUS: 'graph-focus',
  DETAIL_FOCUS: 'detail-focus'
};

const SCREEN_TYPES = {
  GRAPH: 'graph',
  DETAIL: 'detail', 
  CONTROL: 'control',
  TIMELINE: 'timeline'
};

function MultiScreenPresentation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentTheme: globalTheme } = useTheme();
  
  // 데이터 상태
  const [graph, setGraph] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // 프리젠테이션 상태
  const [layoutMode, setLayoutMode] = useState(LAYOUT_MODES.GRID_2x2);
  const [fullscreenScreen, setFullscreenScreen] = useState(null);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(5000);
  const [minImportance, setMinImportance] = useState(3);
  
  // 테마 매핑
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
    setIsAutoPlay(false);
    setCurrentEventIndex(prev => 
      prev > 0 ? prev - 1 : events.length - 1
    );
  };

  const handleNext = () => {
    setIsAutoPlay(false);
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

  const toggleFullscreen = (screenType) => {
    setFullscreenScreen(fullscreenScreen === screenType ? null : screenType);
  };

  const handleKeyPress = useCallback((e) => {
    switch (e.key) {
      case 'Escape':
        if (fullscreenScreen) {
          setFullscreenScreen(null);
        } else {
          handleExit();
        }
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
      case '1':
        e.preventDefault();
        setLayoutMode(LAYOUT_MODES.GRID_2x2);
        break;
      case '2':
        e.preventDefault();
        setLayoutMode(LAYOUT_MODES.MAIN_DETAIL);
        break;
      case '3':
        e.preventDefault();
        setLayoutMode(LAYOUT_MODES.TRIPLE_RIGHT);
        break;
      case '4':
        e.preventDefault();
        setLayoutMode(LAYOUT_MODES.GRAPH_FOCUS);
        break;
      case '5':
        e.preventDefault();
        setLayoutMode(LAYOUT_MODES.DETAIL_FOCUS);
        break;
    }
  }, [fullscreenScreen, handlePrevious, handleNext, toggleAutoPlay, handleExit]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const getLayoutConfig = () => {
    switch (layoutMode) {
      case LAYOUT_MODES.GRID_2x2:
        return {
          containerClass: 'multiscreen-grid-2x2',
          screens: [
            { type: SCREEN_TYPES.GRAPH, position: 'top-left' },
            { type: SCREEN_TYPES.DETAIL, position: 'top-right' },
            { type: SCREEN_TYPES.TIMELINE, position: 'bottom-left' },
            { type: SCREEN_TYPES.CONTROL, position: 'bottom-right' }
          ]
        };
      case LAYOUT_MODES.MAIN_DETAIL:
        return {
          containerClass: 'multiscreen-main-detail',
          screens: [
            { type: SCREEN_TYPES.GRAPH, position: 'main', size: 'large' },
            { type: SCREEN_TYPES.DETAIL, position: 'detail' },
            { type: SCREEN_TYPES.CONTROL, position: 'control' }
          ]
        };
      case LAYOUT_MODES.TRIPLE_RIGHT:
        return {
          containerClass: 'multiscreen-triple-right',
          screens: [
            { type: SCREEN_TYPES.GRAPH, position: 'main', size: 'large' },
            { type: SCREEN_TYPES.DETAIL, position: 'right-top' },
            { type: SCREEN_TYPES.TIMELINE, position: 'right-middle' },
            { type: SCREEN_TYPES.CONTROL, position: 'right-bottom' }
          ]
        };
      case LAYOUT_MODES.GRAPH_FOCUS:
        return {
          containerClass: 'multiscreen-graph-focus',
          screens: [
            { type: SCREEN_TYPES.GRAPH, position: 'main', size: 'xl' },
            { type: SCREEN_TYPES.CONTROL, position: 'overlay' }
          ]
        };
      case LAYOUT_MODES.DETAIL_FOCUS:
        return {
          containerClass: 'multiscreen-detail-focus',
          screens: [
            { type: SCREEN_TYPES.DETAIL, position: 'main', size: 'xl' },
            { type: SCREEN_TYPES.CONTROL, position: 'overlay' }
          ]
        };
      default:
        return getLayoutConfig(LAYOUT_MODES.GRID_2x2);
    }
  };

  const renderScreen = (screenConfig) => {
    const { type, position, size } = screenConfig;
    const isFullscreen = fullscreenScreen === type;
    const commonProps = {
      graph,
      events,
      currentEventIndex,
      currentTheme,
      isAutoPlay,
      autoPlayInterval,
      minImportance,
      onEventChange: setCurrentEventIndex,
      onPrevious: handlePrevious,
      onNext: handleNext,
      onToggleAutoPlay: toggleAutoPlay,
      onToggleFullscreen: () => toggleFullscreen(type),
      onThemeChange: setCurrentTheme,
      onImportanceChange: setMinImportance,
      onAutoPlayIntervalChange: setAutoPlayInterval,
      onExit: handleExit,
      isFullscreen,
      position,
      size
    };

    const screenComponent = (() => {
      switch (type) {
        case SCREEN_TYPES.GRAPH:
          return <GraphScreen {...commonProps} />;
        case SCREEN_TYPES.DETAIL:
          return <EventDetailScreen {...commonProps} />;
        case SCREEN_TYPES.CONTROL:
          return <ControlScreen {...commonProps} />;
        case SCREEN_TYPES.TIMELINE:
          return <TimelineOverviewScreen {...commonProps} />;
        default:
          return null;
      }
    })();

    if (isFullscreen) {
      return (
        <motion.div
          key={`${type}-fullscreen`}
          className="multiscreen-fullscreen-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {screenComponent}
        </motion.div>
      );
    }

    return (
      <div
        key={`${type}-${position}`}
        className={`multiscreen-item multiscreen-${position} ${size ? `multiscreen-${size}` : ''}`}
      >
        {screenComponent}
      </div>
    );
  };

  if (loading) {
    return <div className="multiscreen-loading">로딩 중...</div>;
  }

  if (!graph || events.length === 0) {
    return (
      <div className="multiscreen-empty">
        <div className="empty-content">
          <h2>표시할 이벤트가 없습니다</h2>
          <p>중요도 {minImportance}점 이상의 이벤트가 없습니다.</p>
          <button onClick={handleExit} className="btn btn-primary">
            편집 모드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const layoutConfig = getLayoutConfig();

  return (
    <div className="multiscreen-container">
      {/* 헤더 컨트롤 */}
      <div className="multiscreen-header">
        <div className="multiscreen-title">
          <h2>{graph.title}</h2>
          <span>이벤트 {currentEventIndex + 1} / {events.length}</span>
        </div>
        
        <div className="multiscreen-header-controls">
          <div className="layout-selector">
            <button 
              className={`layout-btn ${layoutMode === LAYOUT_MODES.GRID_2x2 ? 'active' : ''}`}
              onClick={() => setLayoutMode(LAYOUT_MODES.GRID_2x2)}
              title="2x2 그리드 (1)"
            >
              <FiGrid />
            </button>
            <button 
              className={`layout-btn ${layoutMode === LAYOUT_MODES.MAIN_DETAIL ? 'active' : ''}`}
              onClick={() => setLayoutMode(LAYOUT_MODES.MAIN_DETAIL)}
              title="메인+상세 (2)"
            >
              <FiMonitor />
            </button>
            <button 
              className={`layout-btn ${layoutMode === LAYOUT_MODES.TRIPLE_RIGHT ? 'active' : ''}`}
              onClick={() => setLayoutMode(LAYOUT_MODES.TRIPLE_RIGHT)}
              title="삼분할 우측 (3)"
            >
              <FiSettings />
            </button>
          </div>
          
          <button onClick={handleExit} className="btn btn-close">
            <FiX /> 나가기
          </button>
        </div>
      </div>

      {/* 메인 멀티스크린 영역 */}
      <div className={`multiscreen-layout ${layoutConfig.containerClass}`}>
        {layoutConfig.screens.map(renderScreen)}
      </div>

      {/* 전체화면 모드 */}
      <AnimatePresence>
        {fullscreenScreen && layoutConfig.screens
          .filter(screen => screen.type === fullscreenScreen)
          .map(renderScreen)}
      </AnimatePresence>

      {/* 키보드 힌트 */}
      <div className="multiscreen-keyboard-hints">
        <span>← → 이벤트 네비게이션</span>
        <span>P 자동진행</span>
        <span>1-5 레이아웃 변경</span>
        <span>ESC 나가기</span>
        {isAutoPlay && <span className="auto-indicator">🔄 자동 진행 중</span>}
      </div>
    </div>
  );
}

export default MultiScreenPresentation;