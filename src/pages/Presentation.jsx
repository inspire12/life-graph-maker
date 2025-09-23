import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiX, FiChevronLeft, FiChevronRight, FiPlay, FiPause } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { graphService } from '../services/graphService';
import { eventService } from '../services/eventService';
import PresentationGraph from '../components/presentation/PresentationGraph';

function Presentation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [graph, setGraph] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [minImportance, setMinImportance] = useState(3);
  const [autoPlayInterval, setAutoPlayInterval] = useState(5000); // 5초

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

  const handleKeyPress = (e) => {
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
      default:
        // 다른 키 입력 시에는 자동 진행을 정지하지 않음
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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
      <header className="presentation-header">
        <div className="presentation-title">
          <h1>{graph.title}</h1>
          <div className="presentation-progress">
            <span>이벤트 {currentEventIndex + 1} / {events.length}</span>
            <div className="progress-bar">
              <motion.div 
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${((currentEventIndex + 1) / events.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        </div>
        <button onClick={handleExit} className="btn btn-close">
          <FiX /> ESC로 나가기
        </button>
      </header>

      <main className="presentation-main">
        <div className="graph-section">
          <PresentationGraph
            events={events}
            currentEventIndex={currentEventIndex}
            viewMode="timeline"
            height={350}
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

              <motion.div 
                className="event-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p>{currentEvent.description}</p>
              </motion.div>

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
                  <strong>감정 점수:</strong> 
                  <span className={`emotion-value ${currentEvent.emotionScore >= 0 ? 'positive' : 'negative'}`}>
                    {currentEvent.emotionScore > 0 ? '+' : ''}{currentEvent.emotionScore}/10
                  </span>
                </motion.div>
                <motion.div 
                  className="importance-rate"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                >
                  <strong>중요도:</strong> 
                  <span className="stars">{'★'.repeat(currentEvent.importanceRate)}</span>
                </motion.div>
                <motion.div 
                  className="category"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                >
                  <strong>카테고리:</strong> {currentEvent.category}
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="presentation-controls" onClick={handleStopAutoPlay}>
        <div className="importance-filter">
          <label>중요도 필터:</label>
          <select 
            value={minImportance} 
            onChange={(e) => setMinImportance(Number(e.target.value))}
          >
            <option value={1}>⭐ 1점 이상</option>
            <option value={2}>⭐⭐ 2점 이상</option>
            <option value={3}>⭐⭐⭐ 3점 이상</option>
            <option value={4}>⭐⭐⭐⭐ 4점 이상</option>
            <option value={5}>⭐⭐⭐⭐⭐ 5점만</option>
          </select>
        </div>

        <div className="auto-play-controls">
          <label>자동 진행 속도:</label>
          <select 
            value={autoPlayInterval} 
            onChange={(e) => setAutoPlayInterval(Number(e.target.value))}
            disabled={isAutoPlay}
          >
            <option value={2000}>빠름 (2초)</option>
            <option value={3000}>보통 (3초)</option>
            <option value={5000}>느림 (5초)</option>
            <option value={8000}>매우 느림 (8초)</option>
          </select>
        </div>

        <div className="navigation-controls">
          <button onClick={handlePrevious} className="btn btn-control">
            <FiChevronLeft /> 이전
          </button>
          
          <button onClick={toggleAutoPlay} className="btn btn-control auto-play-btn">
            {isAutoPlay ? <FiPause /> : <FiPlay />}
            {isAutoPlay ? '정지' : '자동'}
            {isAutoPlay && (
              <div className="auto-play-indicator">
                <div className="pulse-dot"></div>
              </div>
            )}
          </button>
          
          <button onClick={handleNext} className="btn btn-control">
            다음 <FiChevronRight />
          </button>
        </div>

        <div className="keyboard-hints">
          ← 이전 | 스페이스/→ 다음 | P 자동진행 | ESC 나가기
          {isAutoPlay && <span className="auto-status"> | 🔄 자동 진행 중</span>}
        </div>
      </footer>
    </div>
  );
}

export default Presentation;