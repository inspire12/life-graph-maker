import { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ReferenceLine,
  Dot
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMaximize, FiMinimize } from 'react-icons/fi';
import { 
  prepareGraphData, 
  calculateXAxisDomain, 
  calculateYAxisDomain,
  formatXAxisTick,
  generateXAxisTicks,
  clusterEventsByDate
} from '../../utils/graphHelpers';

function PresentationGraph({ 
  events = [], 
  currentEventIndex = 0,
  viewMode = 'timeline',
  height = 300 
}) {
  const [visibleDataPoints, setVisibleDataPoints] = useState([]);
  const [animationKey, setAnimationKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // 그래프 데이터 준비 (메모화로 최적화)
  const { rawData, clusteredData, xDomain, yDomain, xTicks } = useMemo(() => {
    const raw = prepareGraphData(events, viewMode);
    const clustered = clusterEventsByDate(raw, viewMode);
    const xDom = calculateXAxisDomain(raw, viewMode);
    const yDom = calculateYAxisDomain(raw);
    const xTic = generateXAxisTicks(xDom, viewMode);
    
    return {
      rawData: raw,
      clusteredData: clustered,
      xDomain: xDom,
      yDomain: yDom,
      xTicks: xTic
    };
  }, [events, viewMode]);

  // 현재 이벤트까지의 데이터만 표시 (진행형 애니메이션)
  useEffect(() => {
    if (!events.length || !clusteredData.length) return;
    
    // 현재 이벤트까지의 데이터 포인트만 표시
    const currentEventId = events[currentEventIndex]?.id;
    if (!currentEventId) return;
    
    const currentPointIndex = clusteredData.findIndex(
      point => point.originalEvent?.id === currentEventId
    );
    
    if (currentPointIndex !== -1) {
      const visibleData = clusteredData.slice(0, currentPointIndex + 1);
      setVisibleDataPoints(prev => {
        // 같은 데이터면 업데이트하지 않음
        if (prev.length === visibleData.length && 
            prev.every((item, idx) => item.id === visibleData[idx]?.id)) {
          return prev;
        }
        return visibleData;
      });
      setAnimationKey(prev => prev + 1);
    }
  }, [currentEventIndex, events.length]);

  // 현재 이벤트 강조를 위한 커스텀 점
  const CustomDot = ({ cx, cy, payload, index }) => {
    if (!payload) return null;

    const isCurrentEvent = events[currentEventIndex] && 
      payload.originalEvent && 
      payload.originalEvent.id === events[currentEventIndex].id;

    const isPastEvent = index < visibleDataPoints.length - 1;
    const isFutureEvent = !visibleDataPoints.some(p => p.id === payload.id);

    const size = isCurrentEvent ? 14 : isPastEvent ? 8 : 6;
    const opacity = isFutureEvent ? 0.2 : isCurrentEvent ? 1 : 0.7;

    return (
      <g>
        {/* 메인 점 */}
        <circle
          cx={cx}
          cy={cy}
          r={size}
          fill={payload.color}
          stroke="#fff"
          strokeWidth={2}
          opacity={opacity}
          style={{
            filter: isCurrentEvent ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' : 'none'
          }}
        />
        
        {/* 현재 이벤트 강조 효과 */}
        {isCurrentEvent && (
          <>
            <circle
              cx={cx}
              cy={cy}
              r={size + 6}
              fill="none"
              stroke="#fff"
              strokeWidth={2}
              opacity={0.6}
            >
              <animate
                attributeName="r"
                values={`${size + 6};${size + 12};${size + 6}`}
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.6;0.2;0.6"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx={cx}
              cy={cy}
              r={size + 12}
              fill="none"
              stroke={payload.color}
              strokeWidth={1}
              opacity={0.4}
            >
              <animate
                attributeName="r"
                values={`${size + 12};${size + 20};${size + 12}`}
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.4;0.1;0.4"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
          </>
        )}
        
        {/* 중요도가 높은 이벤트 강조 */}
        {payload.importanceRate >= 4 && !isFutureEvent && (
          <circle
            cx={cx}
            cy={cy}
            r={size + 4}
            fill="none"
            stroke="#ffc107"
            strokeWidth={1}
            opacity={0.5}
          />
        )}
      </g>
    );
  };

  // X축 틱 포맷터
  const formatXTick = (value) => {
    return formatXAxisTick(value, viewMode);
  };

  // Y축 틱 포맷터
  const formatYTick = (value) => {
    return value > 0 ? `+${value}` : value.toString();
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

  if (!clusteredData || clusteredData.length === 0) {
    return (
      <div className="presentation-graph-empty">
        <div className="empty-content">
          <h3>표시할 이벤트가 없습니다</h3>
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
          background: 'rgba(0, 0, 0, 0.8)',
          border: 'none',
          borderRadius: '6px',
          padding: '8px',
          cursor: 'pointer',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '12px',
          backdropFilter: 'blur(4px)'
        }}
      >
        {isFullscreen ? <FiMinimize size={16} /> : <FiMaximize size={16} />}
        {isFullscreen ? '축소' : '확대'}
      </button>

      {/* 배경 그래프 (전체 경로) */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={clusteredData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
            
            <XAxis
              type={viewMode === 'timeline' ? 'number' : 'number'}
              dataKey={viewMode === 'timeline' ? 'timestamp' : 'order'}
              domain={xDomain}
              ticks={viewMode === 'timeline' ? xTicks : undefined}
              tickFormatter={formatXTick}
              stroke="rgba(255,255,255,0.8)"
              fontSize={isFullscreen ? 14 : 12}
            />
            
            <YAxis
              domain={yDomain}
              tickFormatter={formatYTick}
              stroke="rgba(255,255,255,0.8)"
              fontSize={isFullscreen ? 14 : 12}
            />
            
            {/* 0선 참조선 */}
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.5)" strokeDasharray="2 2" />
            
            {/* 감정 영역 참조선 */}
            <ReferenceLine y={5} stroke="rgba(76,175,80,0.5)" strokeDasharray="1 1" />
            <ReferenceLine y={-5} stroke="rgba(244,67,54,0.5)" strokeDasharray="1 1" />
            
            {/* 전체 라인 (미래 이벤트들 - 흐릿하게) */}
            <Line
              type="monotone"
              dataKey="emotionScore"
              stroke="rgba(100, 181, 246, 0.3)"
              strokeWidth={isFullscreen ? 3 : 2}
              strokeDasharray="5 5"
              dot={<CustomDot />}
              connectNulls={false}
              animationDuration={0}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 진행된 라인 (현재 이벤트까지) */}
      {visibleDataPoints.length > 0 && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={visibleDataPoints}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              key={animationKey}
            >
              <XAxis
                type={viewMode === 'timeline' ? 'number' : 'number'}
                dataKey={viewMode === 'timeline' ? 'timestamp' : 'order'}
                domain={xDomain}
                hide
              />
              
              <YAxis domain={yDomain} hide />
              
              {/* 진행된 라인 */}
              <Line
                type="monotone"
                dataKey="emotionScore"
                stroke="#64B5F6"
                strokeWidth={isFullscreen ? 6 : 4}
                dot={false}
                connectNulls={false}
                animationDuration={1000}
                animationBegin={0}
              />
              
              {/* 현재 이벤트 강조 점 */}
              <Line
                type="monotone"
                dataKey="emotionScore"
                stroke="transparent"
                strokeWidth={0}
                dot={(props) => {
                  const { cx, cy, payload, index } = props;
                  if (!payload || index !== visibleDataPoints.length - 1) return null;
                  
                  const currentEvent = events[currentEventIndex];
                  const isCurrentEvent = currentEvent && payload.originalEvent && 
                    payload.originalEvent.id === currentEvent.id;
                  
                  if (!isCurrentEvent) return null;
                  
                  const scale = isFullscreen ? 1.5 : 1;
                  const mainRadius = 16 * scale;
                  const innerRadius = 8 * scale;
                  
                  return (
                    <g>
                      {/* 메인 점 */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={mainRadius}
                        fill="#64B5F6"
                        stroke="#fff"
                        strokeWidth={3 * scale}
                        style={{
                          filter: `drop-shadow(0 0 ${12 * scale}px rgba(100, 181, 246, 0.8))`
                        }}
                      />
                      
                      {/* 내부 하이라이트 */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={innerRadius}
                        fill="#fff"
                        opacity={0.8}
                      />
                      
                      {/* 펄스 애니메이션 레이어 1 */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={20 * scale}
                        fill="none"
                        stroke="#fff"
                        strokeWidth={2 * scale}
                        opacity={0.6}
                      >
                        <animate
                          attributeName="r"
                          values={`${20 * scale};${35 * scale};${20 * scale}`}
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.6;0.1;0.6"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      
                      {/* 펄스 애니메이션 레이어 2 */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={25 * scale}
                        fill="none"
                        stroke="#64B5F6"
                        strokeWidth={1 * scale}
                        opacity={0.4}
                      >
                        <animate
                          attributeName="r"
                          values={`${25 * scale};${45 * scale};${25 * scale}`}
                          dur="3s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.4;0.05;0.4"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      
                      {/* 이벤트 정보 라벨 */}
                      <foreignObject
                        x={cx + 25 * scale}
                        y={cy - 15 * scale}
                        width={150 * scale}
                        height={30 * scale}
                        style={{ pointerEvents: 'none' }}
                      >
                        <div style={{
                          background: 'rgba(0, 0, 0, 0.8)',
                          color: 'white',
                          padding: `${4 * scale}px ${8 * scale}px`,
                          borderRadius: `${4 * scale}px`,
                          fontSize: `${12 * scale}px`,
                          whiteSpace: 'nowrap',
                          border: `1px solid rgba(100, 181, 246, 0.5)`,
                          backdropFilter: 'blur(4px)'
                        }}>
                          {payload.title}
                        </div>
                      </foreignObject>
                      
                      {/* 감정 점수 표시 */}
                      <text
                        x={cx}
                        y={cy + 35 * scale}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={14 * scale}
                        fontWeight="bold"
                        style={{
                          textShadow: '0 0 4px rgba(0,0,0,0.8)',
                          filter: 'drop-shadow(0 0 2px rgba(100, 181, 246, 0.8))'
                        }}
                      >
                        {payload.emotionScore > 0 ? '+' : ''}{payload.emotionScore}
                      </text>
                    </g>
                  );
                }}
                connectNulls={false}
                animationDuration={500}
                animationBegin={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 전체화면 상태 안내 */}
      {isFullscreen && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          ESC 키를 눌러 전체화면을 종료하세요
        </div>
      )}
    </div>
  );

  return (
    <>
      {isFullscreen && (
        <motion.div
          className="presentation-graph-fullscreen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        <div className="presentation-graph">
          <GraphContent />
        </div>
      )}
    </>
  );
}

export default PresentationGraph;