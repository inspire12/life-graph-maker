import { useState } from 'react';
import { FiCalendar, FiClock, FiEdit3, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { getEmotionColor } from '../../utils/colorHelpers';

function EventTimeline({ events = [], onEventClick }) {
  const [selectedYear, setSelectedYear] = useState(null);
  
  // 이벤트를 날짜 순으로 정렬
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });

  // 연도별로 이벤트 그룹화
  const eventsByYear = sortedEvents.reduce((acc, event) => {
    const year = new Date(event.date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(event);
    return acc;
  }, {});

  // 연도 목록 (최신순)
  const years = Object.keys(eventsByYear).sort((a, b) => b - a);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEmotionLabel = (score) => {
    if (score >= 7) return '매우 긍정적';
    if (score >= 4) return '긍정적';
    if (score >= 1) return '약간 긍정적';
    if (score === 0) return '중립적';
    if (score >= -3) return '약간 부정적';
    if (score >= -6) return '부정적';
    return '매우 부정적';
  };


  if (!sortedEvents.length) {
    return (
      <div className="timeline-empty">
        <div className="empty-content">
          <FiCalendar size={48} />
          <h3>아직 이벤트가 없습니다</h3>
          <p>첫 번째 인생 이벤트를 추가해보세요!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-timeline">
      <div className="timeline-header">
        <h3>타임라인 뷰</h3>
        <div className="year-filter">
          <button 
            className={`year-btn ${selectedYear === null ? 'active' : ''}`}
            onClick={() => setSelectedYear(null)}
          >
            전체
          </button>
          {years.map(year => (
            <button
              key={year}
              className={`year-btn ${selectedYear === year ? 'active' : ''}`}
              onClick={() => setSelectedYear(year)}
            >
              {year}년 ({eventsByYear[year].length})
            </button>
          ))}
        </div>
      </div>

      <div className="timeline-container">
        {years
          .filter(year => selectedYear === null || year === selectedYear)
          .map(year => (
            <motion.div 
              key={year} 
              className="timeline-year-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="timeline-year-header">
                <h4>{year}년</h4>
                <span className="event-count">{eventsByYear[year].length}개 이벤트</span>
              </div>
              
              <div className="timeline-events">
                {eventsByYear[year].map((event, index) => (
                  <motion.div
                    key={event.id}
                    className="timeline-event"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => onEventClick && onEventClick(event)}
                  >
                    <div className="timeline-dot" style={{ backgroundColor: getEmotionColor(event.emotionScore) }} />
                    
                    <div className="timeline-content">
                      <div className="timeline-card">
                        <div className="event-header">
                          <div className="event-title-section">
                            <h5>{event.title}</h5>
                            <span className="event-category">{event.category}</span>
                          </div>
                          <div className="event-meta">
                            <div className="importance-rating">
                              {'★'.repeat(event.importanceRate || 3)}
                            </div>
                            {onEventClick && (
                              <button className="edit-btn" title="수정">
                                <FiEdit3 size={16} />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="event-date-info">
                          <FiCalendar size={14} />
                          <span>{formatDate(event.date)}</span>
                          {event.endDate && (
                            <span> ~ {formatDate(event.endDate)}</span>
                          )}
                        </div>

                        {event.image && (
                          <div className="event-image">
                            <img src={event.image} alt={event.title} />
                          </div>
                        )}

                        {event.description && (
                          <p className="event-description">{event.description}</p>
                        )}

                        <div className="event-stats">
                          <div 
                            className="emotion-indicator"
                            style={{ 
                              backgroundColor: getEmotionColor(event.emotionScore),
                              color: 'white' 
                            }}
                          >
                            <span className="emotion-score">
                              {event.emotionScore > 0 ? '+' : ''}{event.emotionScore}
                            </span>
                            <span className="emotion-label">{getEmotionLabel(event.emotionScore)}</span>
                          </div>
                          
                          <div className="timeline-time" title={formatFullDate(event.date)}>
                            <FiClock size={12} />
                            {event.createdAt && (
                              <span>{new Date(event.createdAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
}

export default EventTimeline;