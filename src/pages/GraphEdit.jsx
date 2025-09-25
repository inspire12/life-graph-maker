import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlay, FiSettings, FiPlus, FiDownload, FiUpload, FiGrid, FiClock } from 'react-icons/fi';
import { graphService } from '../services/graphService';
import { eventService } from '../services/eventService';
import { exportToJson, exportToCsv, importFromJson, importFromCsv, validateImportFile } from '../utils/exportHelpers';
import Header from '../components/common/Header';
import Modal from '../components/common/Modal';
import CategoryFilter from '../components/common/CategoryFilter';
import EventForm from '../components/events/EventForm';
import EventTimeline from '../components/events/EventTimeline';
import LifeGraph from '../components/graph/LifeGraph';

function GraphEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'sequence'
  const [listViewMode, setListViewMode] = useState('timeline'); // 'grid' or 'timeline'
  const [selectedCategories, setSelectedCategories] = useState([]); // 카테고리 필터
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [prefilledData, setPrefilledData] = useState(null);
  const fileInputRef = useRef(null);

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
    setPrefilledData(null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setPrefilledData(null);
    setIsEventModalOpen(true);
  };

  const handleGraphClick = (clickData) => {
    // 클릭 위치를 기반으로 이벤트 추가 모달 열기
    const prefilledEventData = {
      emotionScore: clickData.emotionScore
    };

    // 타임라인 모드일 때는 클릭한 위치를 날짜로 변환
    if (clickData.viewMode === 'timeline' && clickData.timestamp) {
      const clickedDate = new Date(clickData.timestamp);
      if (!isNaN(clickedDate.getTime())) {
        prefilledEventData.date = clickedDate.toISOString().split('T')[0];
      }
    }

    setEditingEvent(null);
    setPrefilledData(prefilledEventData);
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
    setPrefilledData(null);
  };

  const handlePresentationMode = () => {
    navigate(`/graph/${id}/present`);
  };

  // 카테고리 필터 처리
  const handleCategoryChange = (categories) => {
    setSelectedCategories(categories);
  };

  // 필터링된 이벤트 계산
  const filteredEvents = graph?.events ? 
    (selectedCategories.length === 0 
      ? graph.events 
      : graph.events.filter(event => selectedCategories.includes(event.category))
    ) : [];

  // Export 기능들
  const handleExportJson = () => {
    try {
      exportToJson(graph);
    } catch (error) {
      console.error('JSON export failed:', error);
      alert('JSON 내보내기에 실패했습니다.');
    }
  };

  const handleExportCsv = () => {
    try {
      exportToCsv(graph);
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('CSV 내보내기에 실패했습니다.');
    }
  };

  // Import 기능들
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileType = validateImportFile(file);
      let importedData;

      if (fileType === 'json') {
        importedData = await importFromJson(file);
      } else if (fileType === 'csv') {
        importedData = await importFromCsv(file);
      }

      // 확인 대화상자
      const shouldImport = window.confirm(
        `${importedData.events.length}개의 이벤트를 가져오겠습니다. 기존 데이터에 추가됩니다. 계속하시겠습니까?`
      );

      if (shouldImport) {
        // 기존 이벤트에 추가
        for (const event of importedData.events) {
          await eventService.createEvent(id, event);
        }
        
        await loadGraph(); // 그래프 새로고침
        alert(`${importedData.events.length}개의 이벤트를 성공적으로 가져왔습니다.`);
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert(`가져오기 실패: ${error.message}`);
    } finally {
      // 파일 입력 초기화
      event.target.value = '';
    }
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
            <div className="dropdown">
              <button className="btn btn-secondary dropdown-toggle" title="설정 및 데이터 관리">
                <FiSettings /> 설정
              </button>
              <div className="dropdown-menu">
                <button onClick={handleImportClick} className="dropdown-item">
                  <FiUpload /> JSON/CSV 가져오기
                </button>
                <div className="dropdown-divider"></div>
                <button onClick={handleExportJson} className="dropdown-item">
                  <FiDownload /> JSON 내보내기
                </button>
                <button onClick={handleExportCsv} className="dropdown-item">
                  <FiDownload /> CSV 내보내기
                </button>
              </div>
            </div>
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
              타임라인
            </button>
            <button
              className={`btn ${viewMode === 'sequence' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleViewModeChange('sequence')}
            >
              순서별
            </button>
          </div>
          
          <div className="filter-section">
            <CategoryFilter 
              events={graph.events || []}
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>

        <div className="graph-container">
          <LifeGraph
            events={filteredEvents}
            viewMode={viewMode}
            onEventClick={handleEditEvent}
            onGraphClick={handleGraphClick}
            height={500}
          />
        </div>

        <div className="events-panel">
          <div className="events-panel-header">
            <div className="panel-title-section">
              <h3>이벤트 목록 ({filteredEvents.length}개{selectedCategories.length > 0 ? ` / 전체 ${graph.events?.length || 0}개` : ''})</h3>
              <div className="view-toggle">
                <button
                  className={`view-toggle-btn ${listViewMode === 'timeline' ? 'active' : ''}`}
                  onClick={() => setListViewMode('timeline')}
                  title="타임라인 보기"
                >
                  <FiClock size={16} />
                </button>
                <button
                    className={`view-toggle-btn ${listViewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setListViewMode('grid')}
                    title="그리드 보기"
                >
                  <FiGrid size={16} />
                </button>
              </div>
            </div>
            <button onClick={handleAddEvent} className="btn btn-primary">
              <FiPlus /> 이벤트 추가
            </button>
          </div>
          
          {filteredEvents.length > 0 ? (
            listViewMode === 'timeline' ? (
              <EventTimeline 
                events={filteredEvents}
                onEventClick={handleEditEvent}
              />
            ) : (
              <div className="events-grid">
                {filteredEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="event-grid-card"
                    onClick={() => handleEditEvent(event)}
                    style={{ borderLeft: `4px solid ${event.color}` }}
                  >
                    <div className="event-card-header">
                      <div className="event-title-section">
                        <h4>{event.title}</h4>
                        <div className="event-category">{event.category}</div>
                      </div>
                      <div className="event-rating">
                        {'★'.repeat(event.importanceRate || 3)}
                      </div>
                    </div>
                    
                    {event.image && (
                      <div className="event-image">
                        <img 
                          src={event.image} 
                          alt={event.title}
                          className="event-card-image"
                        />
                      </div>
                    )}
                    
                    <div className="event-emotion-score" data-score={event.emotionScore}>
                      <span className="emotion-label">감정점수</span>
                      <span className="emotion-value">
                        {event.emotionScore > 0 ? '+' : ''}{event.emotionScore}
                      </span>
                    </div>
                    
                    {event.description && (
                      <p className="event-description">{event.description}</p>
                    )}
                    
                    <div className="event-date-info">
                      {event.date && (
                        <span className="event-date">
                          📅 {new Date(event.date).toLocaleDateString()}
                          {event.endDate && (
                            <> ~ {new Date(event.endDate).toLocaleDateString()}</>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="empty-events">
              <div className="empty-content">
                {selectedCategories.length > 0 ? (
                  <>
                    <h4>선택한 카테고리에 이벤트가 없습니다</h4>
                    <p>다른 카테고리를 선택하거나 새 이벤트를 추가해보세요!</p>
                  </>
                ) : (
                  <>
                    <h4>아직 이벤트가 없습니다</h4>
                    <p>첫 번째 인생 이벤트를 추가해보세요!</p>
                  </>
                )}
                <button onClick={handleAddEvent} className="btn btn-primary btn-large">
                  <FiPlus /> 이벤트 추가
                </button>
              </div>
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
          prefilledData={prefilledData}
          mode={editingEvent ? 'edit' : 'create'}
          onSave={handleSaveEvent}
          onDelete={editingEvent ? handleDeleteEvent : null}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.csv"
        onChange={handleFileImport}
        style={{ display: 'none' }}
      />

    </div>
  );
}

export default GraphEdit;