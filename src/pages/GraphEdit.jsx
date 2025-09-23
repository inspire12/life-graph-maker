import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlay, FiSettings, FiPlus } from 'react-icons/fi';
import { graphService } from '../services/graphService';
import { eventService } from '../services/eventService';
import Header from '../components/common/Header';
import Modal from '../components/common/Modal';
import EventForm from '../components/events/EventForm';

function GraphEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'sequence'
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    loadGraph();
  }, [id]);

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
      alert('그래프 로딩에 실패했습니다.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (editingEvent) {
        // 수정
        await eventService.updateEvent(id, editingEvent.id, eventData);
      } else {
        // 추가
        await eventService.createEvent(id, eventData);
      }
      
      await loadGraph(); // 그래프 새로고침
      setIsEventModalOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Failed to save event:', error);
      alert('이벤트 저장에 실패했습니다.');
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent) return;
    
    try {
      await eventService.deleteEvent(id, editingEvent.id);
      await loadGraph(); // 그래프 새로고침
      setIsEventModalOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('이벤트 삭제에 실패했습니다.');
    }
  };

  const handleCloseModal = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handlePresentationMode = () => {
    navigate(`/graph/${id}/present`);
  };

  if (loading) {
    return (
      <div className="app-container">
        <Header />
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (!graph) {
    return (
      <div className="app-container">
        <Header />
        <div className="error">그래프를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content">
        <div className="page-header">
          <button onClick={() => navigate('/')} className="btn btn-secondary">
            <FiArrowLeft /> 목록
          </button>
          <div className="header-title">
            <h1>{graph.title}</h1>
            <p>{graph.description}</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary">
              <FiSettings /> 설정
            </button>
            <button onClick={handlePresentationMode} className="btn btn-primary">
              <FiPlay /> 발표 모드
            </button>
          </div>
        </div>

        <div className="graph-controls">
          <div className="view-mode-toggle">
            <button
              className={`btn ${viewMode === 'timeline' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleViewModeChange('timeline')}
            >
              시간순
            </button>
            <button
              className={`btn ${viewMode === 'sequence' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleViewModeChange('sequence')}
            >
              이벤트순
            </button>
          </div>
          <button onClick={handleAddEvent} className="btn btn-primary">
            <FiPlus /> 이벤트 추가
          </button>
        </div>

        <div className="graph-container">
          <div className="graph-placeholder">
            <h3>그래프 영역</h3>
            <p>모드: {viewMode === 'timeline' ? '시간순' : '이벤트순'}</p>
            <p>이벤트 수: {graph.events?.length || 0}개</p>
            {/* TODO: LifeGraph 컴포넌트 구현 */}
          </div>
        </div>

        <div className="events-panel">
          <h3>이벤트 목록</h3>
          {graph.events && graph.events.length > 0 ? (
            <div className="events-list">
              {graph.events.map(event => (
                <div 
                  key={event.id} 
                  className="event-card clickable"
                  onClick={() => handleEditEvent(event)}
                >
                  <div className="event-header">
                    <h4>{event.title}</h4>
                    <div className="event-rating">
                      {'★'.repeat(event.importanceRate || 3)}
                    </div>
                  </div>
                  <p>{event.description}</p>
                  <div className="event-meta">
                    <span>감정: {event.emotionScore > 0 ? '+' : ''}{event.emotionScore}</span>
                    <span>카테고리: {event.category}</span>
                    {event.date && (
                      <span>
                        {new Date(event.date).toLocaleDateString()}
                        {event.endDate && (
                          <> ~ {new Date(event.endDate).toLocaleDateString()}</>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-events">
              <p>아직 이벤트가 없습니다.</p>
              <button onClick={handleAddEvent} className="btn btn-primary">
                <FiPlus /> 첫 번째 이벤트 추가
              </button>
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isEventModalOpen}
        onClose={handleCloseModal}
        title={editingEvent ? '이벤트 편집' : '새 이벤트 추가'}
        className="event-modal"
      >
        <EventForm
          event={editingEvent}
          mode={editingEvent ? 'edit' : 'create'}
          onSave={handleSaveEvent}
          onDelete={editingEvent ? handleDeleteEvent : null}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}

export default GraphEdit;