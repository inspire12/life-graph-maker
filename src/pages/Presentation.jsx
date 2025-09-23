import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiX, FiChevronLeft, FiChevronRight, FiPlay, FiPause } from 'react-icons/fi';
import { graphService } from '../services/graphService';
import { eventService } from '../services/eventService';

function Presentation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [graph, setGraph] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [minImportance, setMinImportance] = useState(3);

  useEffect(() => {
    loadGraph();
  }, [id]);

  useEffect(() => {
    if (graph) {
      loadFilteredEvents();
    }
  }, [graph, minImportance]);

  useEffect(() => {
    let interval;
    if (isAutoPlay && events.length > 0) {
      interval = setInterval(() => {
        setCurrentEventIndex(prev => 
          prev < events.length - 1 ? prev + 1 : 0
        );
      }, 5000); // 5초마다 자동 진행
    }
    return () => clearInterval(interval);
  }, [isAutoPlay, events.length]);

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
    setCurrentEventIndex(prev => 
      prev > 0 ? prev - 1 : events.length - 1
    );
  };

  const handleNext = () => {
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
        handlePrevious();
        break;
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        handleNext();
        break;
      case 'p':
      case 'P':
        toggleAutoPlay();
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
          <span>이벤트 {currentEventIndex + 1} / {events.length}</span>
        </div>
        <button onClick={handleExit} className="btn btn-close">
          <FiX /> ESC로 나가기
        </button>
      </header>

      <main className="presentation-main">
        <div className="graph-section">
          <div className="graph-placeholder">
            <h3>그래프 시각화</h3>
            <p>현재 이벤트: {currentEvent.title}</p>
            <p>감정 점수: {currentEvent.emotionScore}</p>
            {/* TODO: PresentationGraph 컴포넌트 구현 */}
          </div>
        </div>

        <div className="story-section">
          <div className="event-story">
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
            </div>
            
            <h2>{currentEvent.title}</h2>
            
            <div className="event-content">
              <p>{currentEvent.description}</p>
            </div>

            <div className="event-details">
              <div className="emotion-score">
                <strong>감정 점수:</strong> {currentEvent.emotionScore > 0 ? '+' : ''}{currentEvent.emotionScore}/10
              </div>
              <div className="importance-rate">
                <strong>중요도:</strong> {'★'.repeat(currentEvent.importanceRate)}
              </div>
              <div className="category">
                <strong>카테고리:</strong> {currentEvent.category}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="presentation-controls">
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

        <div className="navigation-controls">
          <button onClick={handlePrevious} className="btn btn-control">
            <FiChevronLeft /> 이전
          </button>
          
          <button onClick={toggleAutoPlay} className="btn btn-control">
            {isAutoPlay ? <FiPause /> : <FiPlay />}
            {isAutoPlay ? '정지' : '자동'}
          </button>
          
          <button onClick={handleNext} className="btn btn-control">
            다음 <FiChevronRight />
          </button>
        </div>

        <div className="keyboard-hints">
          ← 이전 | 스페이스/→ 다음 | P 자동진행 | ESC 나가기
        </div>
      </footer>
    </div>
  );
}

export default Presentation;