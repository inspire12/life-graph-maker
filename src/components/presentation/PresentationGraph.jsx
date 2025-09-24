import { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMaximize, FiMinimize } from 'react-icons/fi';
import { getGraphStyles, getPresentationBackground, getThemeSVGFilters, getCustomDotStyle } from '../../styles/graphThemes';
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
  height = 300,
  theme = 'modern' // 프리젠테이션에서 전달받는 테마
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

  // 프리젠테이션용 커스텀 점 (테마 지원)
  const PresentationCustomDot = ({ cx, cy, payload, index }) => {
    if (!payload) return null;

    const isCurrentEvent = events[currentEventIndex] && 
      payload.originalEvent && 
      payload.originalEvent.id === events[currentEventIndex].id;

    const isPastEvent = index < visibleDataPoints.length - 1;
    const isFutureEvent = !visibleDataPoints.some(p => p.id === payload.id);

    const size = isCurrentEvent ? 14 : isPastEvent ? 8 : 6;
    const opacity = isFutureEvent ? 0.2 : isCurrentEvent ? 1 : 0.7;
    const scale = isFullscreen ? 1.5 : 1;
    const dotStyle = getCustomDotStyle(theme, payload, isCurrentEvent, scale);

    return (
      <g>
        {/* 메인 점 */}
        <circle
          cx={cx}
          cy={cy}
          r={size * scale}
          {...dotStyle}
          opacity={opacity}
          style={{
            ...dotStyle.style,
            filter: isCurrentEvent ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' : dotStyle.filter
          }}
        />
        
        {/* 현재 이벤트 강조 효과 */}
        {isCurrentEvent && (
          <>
            <circle
              cx={cx}
              cy={cy}
              r={(size + 6) * scale}
              fill="none"
              stroke="#fff"
              strokeWidth={2 * scale}
              opacity={0.6}
            >
              <animate
                attributeName="r"
                values={`${(size + 6) * scale};${(size + 12) * scale};${(size + 6) * scale}`}
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
              r={(size + 12) * scale}
              fill="none"
              stroke={payload.color}
              strokeWidth={1 * scale}
              opacity={0.4}
            >
              <animate
                attributeName="r"
                values={`${(size + 12) * scale};${(size + 20) * scale};${(size + 12) * scale}`}
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
            r={(size + 4) * scale}
            fill="none"
            stroke="#ffc107"
            strokeWidth={1 * scale}
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

  const GraphContent = () => {
    const themeStyles = getGraphStyles(theme, isFullscreen);
    const presentationBackground = getPresentationBackground(theme);
    const svgFilters = getThemeSVGFilters({ id: theme, styles: themeStyles });

    return (
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: isFullscreen ? '100vh' : height,
        minHeight: isFullscreen ? '100vh' : `${height}px`,
        background: presentationBackground
      }}>
        {/* SVG 필터 정의 */}
        {svgFilters.length > 0 && (
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs dangerouslySetInnerHTML={{ 
              __html: svgFilters.join('') 
            }} />
          </svg>
        )}

        {/* 현재 테마 정보 표시 */}
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          backdropFilter: 'blur(4px)'
        }}>
          {theme} 테마
        </div>

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

        {/* 배경 그래프 (전체 경로 - 흐릿하게) */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.3 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={clusteredData}
              margin={{ 
                top: 20, 
                right: 30, 
                left: theme === 'notebook' ? 80 : 20, 
                bottom: 20 
              }}
            >
              <CartesianGrid 
                stroke={themeStyles.cartesianGrid.stroke}
                strokeDasharray={themeStyles.cartesianGrid.strokeDasharray}
                opacity={0.2} 
              />
              
              <XAxis
                type={viewMode === 'timeline' ? 'number' : 'number'}
                dataKey={viewMode === 'timeline' ? 'timestamp' : 'order'}
                domain={xDomain}
                ticks={viewMode === 'timeline' ? xTicks : undefined}
                tickFormatter={formatXTick}
                stroke="rgba(255,255,255,0.6)"
                fontSize={themeStyles.xAxis.fontSize}
                fontFamily={themeStyles.xAxis.fontFamily}
              />
              
              <YAxis
                domain={yDomain}
                tickFormatter={formatYTick}
                stroke="rgba(255,255,255,0.6)"
                fontSize={themeStyles.yAxis.fontSize}
                fontFamily={themeStyles.yAxis.fontFamily}
              />
              
              {/* 0선 참조선 */}
              <ReferenceLine 
                y={0} 
                stroke={themeStyles.referenceLine.stroke}
                strokeDasharray={themeStyles.referenceLine.strokeDasharray}
                opacity={0.3} 
              />
              
              {/* 감정 영역 참조선 */}
              <ReferenceLine 
                y={5} 
                stroke={themeStyles.positiveReferenceLine.stroke}
                strokeDasharray={themeStyles.positiveReferenceLine.strokeDasharray}
                opacity={0.2} 
              />
              <ReferenceLine 
                y={-5} 
                stroke={themeStyles.negativeReferenceLine.stroke}
                strokeDasharray={themeStyles.negativeReferenceLine.strokeDasharray}
                opacity={0.2} 
              />
              
              {/* 전체 라인 (미래 이벤트들 - 흐릿하게) */}
              <Line
                type="monotone"
                dataKey="emotionScore"
                stroke="rgba(100, 181, 246, 0.2)"
                strokeWidth={isFullscreen ? 3 : 2}
                strokeDasharray="5 5"
                dot={false}
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
                margin={{ 
                  top: 20, 
                  right: 30, 
                  left: theme === 'notebook' ? 80 : 20, 
                  bottom: 20 
                }}
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
                  stroke={themeStyles.line.stroke}
                  strokeWidth={isFullscreen ? 6 : 4}
                  strokeDasharray={themeStyles.line.strokeDasharray}
                  dot={<PresentationCustomDot />}
                  connectNulls={false}
                  animationDuration={1000}
                  animationBegin={0}
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
  };

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