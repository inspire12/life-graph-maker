import { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine,
  Scatter,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { FiMaximize, FiMinimize } from 'react-icons/fi';
import { 
  prepareGraphData, 
  calculateXAxisDomain, 
  calculateYAxisDomain,
  formatXAxisTick,
  generateXAxisTicks,
  clusterEventsByDate
} from '../../utils/graphHelpers';

function LifeGraph({ 
  events = [], 
  viewMode = 'timeline', 
  onEventClick,
  onGraphClick,
  height = 400 
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 그래프 데이터 준비
  const rawData = prepareGraphData(events, viewMode);
  const clusteredData = clusterEventsByDate(rawData, viewMode);
  
  // 축 범위 계산
  const xDomain = calculateXAxisDomain(rawData, viewMode);
  const yDomain = calculateYAxisDomain(rawData);
  const xTicks = generateXAxisTicks(xDomain, viewMode);

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;
    
    return (
      <div className="graph-tooltip">
        <div className="tooltip-header">
          <h4>{data.title}</h4>
          <div className="tooltip-rating">
            {'★'.repeat(data.importanceRate)}
          </div>
        </div>
        <div className="tooltip-content">
          <p><strong>날짜:</strong> {data.displayDate}</p>
          <p><strong>감정 점수:</strong> {data.originalEmotionScore || data.emotionScore > 0 ? '+' : ''}{data.originalEmotionScore || data.emotionScore}</p>
          <p><strong>카테고리:</strong> {data.category}</p>
          {data.description && (
            <p><strong>설명:</strong> {data.description}</p>
          )}
        </div>
      </div>
    );
  };

  // 커스텀 점 렌더링
  const CustomDot = ({ cx, cy, payload }) => {
    if (!payload) return null;

    const scale = isFullscreen ? 1.5 : 1;
    const size = (4 + payload.importanceRate * 2) * scale; // 중요도에 따른 크기
    
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={size}
          fill={payload.color}
          stroke="#fff"
          strokeWidth={2 * scale}
          style={{ cursor: 'pointer' }}
          onClick={() => onEventClick && onEventClick(payload.originalEvent)}
        />
        {payload.importanceRate >= 4 && (
          <circle
            cx={cx}
            cy={cy}
            r={size + 3 * scale}
            fill="none"
            stroke={payload.color}
            strokeWidth={1 * scale}
            opacity={0.5}
          />
        )}
      </g>
    );
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape' && isFullscreen) {
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    if (isFullscreen) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isFullscreen]);

  // 그래프 클릭 처리 함수
  const handleGraphClick = (event) => {
    if (!onGraphClick || !event || !event.activeCoordinate) return;
    
    const { x, y } = event.activeCoordinate;
    
    // 클릭한 위치를 실제 데이터 값으로 변환
    let clickedX, clickedY;
    
    if (viewMode === 'timeline') {
      // 타임라인 모드: X축은 timestamp
      const xRange = xDomain[1] - xDomain[0];
      const chartWidth = event.chartX || 800; // 기본값
      const relativeX = (x - 20) / (chartWidth - 50); // 마진 고려
      clickedX = xDomain[0] + (xRange * relativeX);
    } else {
      // 시퀀스 모드: X축은 순서
      const xRange = xDomain[1] - xDomain[0];
      const chartWidth = event.chartX || 800;
      const relativeX = (x - 20) / (chartWidth - 50);
      clickedX = Math.round(xDomain[0] + (xRange * relativeX));
    }
    
    // Y축은 감정 점수 (-10 ~ 10)
    const yRange = yDomain[1] - yDomain[0];
    const chartHeight = event.chartY || 400;
    const relativeY = 1 - ((y - 20) / (chartHeight - 40)); // Y축은 반전
    clickedY = Math.round(yDomain[0] + (yRange * relativeY));
    
    // 클릭 위치 정보를 상위 컴포넌트로 전달
    onGraphClick({
      x: clickedX,
      y: clickedY,
      viewMode,
      timestamp: viewMode === 'timeline' ? clickedX : null,
      order: viewMode === 'sequence' ? clickedX : null,
      emotionScore: clickedY
    });
  };

  // X축 틱 포맷터
  const formatXTick = (value) => {
    return formatXAxisTick(value, viewMode);
  };

  // Y축 틱 포맷터
  const formatYTick = (value) => {
    return value > 0 ? `+${value}` : value.toString();
  };

  if (!clusteredData || clusteredData.length === 0) {
    return (
      <div className="graph-empty">
        <div className="empty-content">
          <h3>아직 표시할 이벤트가 없습니다</h3>
          <p>첫 번째 인생 이벤트를 추가해보세요!</p>
        </div>
      </div>
    );
  }

  const GraphContent = () => (
    <div style={{ position: 'relative', width: '100%', height: isFullscreen ? '100vh' : height }}>
      {/* 전체화면 토글 버튼 */}
      <button
        className="fullscreen-toggle-btn"
        onClick={toggleFullscreen}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #ddd',
          borderRadius: '6px',
          padding: '8px',
          cursor: 'pointer',
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {isFullscreen ? <FiMinimize size={16} /> : <FiMaximize size={16} />}
        {isFullscreen ? '축소' : '확대'}
      </button>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={clusteredData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          onClick={handleGraphClick}
          style={{ cursor: onGraphClick ? 'crosshair' : 'default' }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          
          <XAxis
            type={viewMode === 'timeline' ? 'number' : 'number'}
            dataKey={viewMode === 'timeline' ? 'timestamp' : 'order'}
            domain={xDomain}
            ticks={viewMode === 'timeline' ? xTicks : undefined}
            tickFormatter={formatXTick}
            stroke="#666"
            fontSize={isFullscreen ? 14 : 12}
          />
          
          <YAxis
            domain={yDomain}
            tickFormatter={formatYTick}
            stroke="#666"
            fontSize={isFullscreen ? 14 : 12}
          />
          
          {/* 0선 참조선 */}
          <ReferenceLine y={0} stroke="#999" strokeDasharray="2 2" />
          
          {/* 감정 영역 참조선 */}
          <ReferenceLine y={5} stroke="#4CAF50" strokeDasharray="1 1" opacity={0.3} />
          <ReferenceLine y={-5} stroke="#f44336" strokeDasharray="1 1" opacity={0.3} />
          
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: '#2196F3', strokeWidth: 1 }}
          />
          
          {/* 메인 라인 */}
          <Line
            type="monotone"
            dataKey="emotionScore"
            stroke="#2196F3"
            strokeWidth={isFullscreen ? 3 : 2}
            dot={<CustomDot />}
            activeDot={{ 
              r: isFullscreen ? 12 : 8, 
              stroke: '#2196F3', 
              strokeWidth: isFullscreen ? 3 : 2, 
              fill: '#fff' 
            }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* 전체화면 상태 안내 */}
      {isFullscreen && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.9)',
          color: '#333',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #ddd'
        }}>
          ESC 키를 눌러 전체화면을 종료하세요
          {onGraphClick && (
            <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
              그래프를 클릭하여 이벤트를 추가할 수 있습니다
            </div>
          )}
        </div>
      )}

      {/* 그래프 클릭 안내 */}
      {!isFullscreen && onGraphClick && (
        <div style={{
          position: 'absolute',
          top: 50,
          left: 20,
          background: 'rgba(33, 150, 243, 0.1)',
          color: '#1976D2',
          padding: '6px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          border: '1px solid rgba(33, 150, 243, 0.3)',
          backdropFilter: 'blur(4px)'
        }}>
          💡 그래프를 클릭하여 이벤트 추가
        </div>
      )}
      
      {/* 범례 */}
      {!isFullscreen && (
        <div className="graph-legend">
          <div className="legend-item">
            <div className="legend-color positive"></div>
            <span>긍정적 경험 (+)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color neutral"></div>
            <span>중립적 경험 (0)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color negative"></div>
            <span>부정적 경험 (-)</span>
          </div>
          <div className="legend-item">
            <span className="legend-text">점 크기 = 중요도</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {isFullscreen && (
        <motion.div
          className="life-graph-fullscreen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#f5f5f5',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <GraphContent />
        </motion.div>
      )}
      
      {!isFullscreen && (
        <div className="life-graph">
          <GraphContent />
        </div>
      )}
    </>
  );
}

export default LifeGraph;