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
import RoughGraph from './RoughGraph';

function PresentationGraph({ 
  events = [], 
  currentEventIndex = 0,
  viewMode = 'timeline',
  height = 300,
  theme = 'modern' // 프리젠테이션에서 전달받는 테마
}) {
  // handwritten 테마일 때는 RoughGraph 사용
  if (theme === 'handwritten') {
    return (
      <RoughGraph
        events={events}
        currentEventIndex={currentEventIndex}
        viewMode={viewMode}
        height={height}
        theme={theme}
      />
    );
  }
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
    if (value === 0) return '0';
    if (value > 0) return `+${value}`;
    return value.toString();
  };

  // 축 레이블 추가
  const getAxisLabels = () => ({
    xAxisLabel: viewMode === 'timeline' ? '시간 흐름' : '이벤트 순서',
    yAxisLabel: '감정 점수'
  });

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

        {/*/!* 현재 테마 정보 표시 *!/*/}
        {/*<div style={{*/}
        {/*  position: 'absolute',*/}
        {/*  top: isFullscreen ? 20 : 10,*/}
        {/*  left: isFullscreen ? 20 : 10,*/}
        {/*  zIndex: 1000,*/}
        {/*  background: 'rgba(0, 0, 0, 0.8)',*/}
        {/*  color: 'white',*/}
        {/*  padding: isFullscreen ? '8px 16px' : '6px 12px',*/}
        {/*  borderRadius: '8px',*/}
        {/*  fontSize: isFullscreen ? '14px' : '12px',*/}
        {/*  backdropFilter: 'blur(8px)',*/}
        {/*  fontWeight: '500',*/}
        {/*  border: '1px solid rgba(255, 255, 255, 0.2)'*/}
        {/*}}>*/}
        {/*  <span style={{ opacity: 0.8 }}>테마:</span> {theme}*/}
        {/*</div>*/}

        {/* 전체화면 토글 버튼 */}
        <button
          className="fullscreen-toggle-btn"
          onClick={toggleFullscreen}
          style={{
            position: 'absolute',
            top: isFullscreen ? 20 : 10,
            right: isFullscreen ? 20 : 10,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: isFullscreen ? '12px 16px' : '8px 12px',
            cursor: 'pointer',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: isFullscreen ? '14px' : '12px',
            fontWeight: '500',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease'
          }}
        >
          {isFullscreen ? <FiMinimize size={18} /> : <FiMaximize size={16} />}
          {isFullscreen ? '축소' : '확대'}
        </button>

        {/* 배경 그래프 (전체 경로 - 흐릿하게) */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          opacity: 0.3,
          background: themeStyles.container.background,
          borderRadius: themeStyles.container.borderRadius
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={clusteredData}
              margin={{ 
                top: isFullscreen ? 40 : 30, 
                right: isFullscreen ? 50 : 40, 
                left: theme === 'notebook' ? (isFullscreen ? 120 : 80) : (isFullscreen ? 50 : 30), 
                bottom: isFullscreen ? 60 : 40 
              }}
            >
              <CartesianGrid 
                stroke={themeStyles.cartesianGrid.stroke}
                strokeDasharray={themeStyles.cartesianGrid.strokeDasharray}
                opacity={isFullscreen ? 0.4 : 0.2}
                strokeWidth={isFullscreen ? 1.5 : 1}
              />
              
              <XAxis
                type={viewMode === 'timeline' ? 'number' : 'number'}
                dataKey={viewMode === 'timeline' ? 'timestamp' : 'order'}
                domain={xDomain}
                ticks={viewMode === 'timeline' ? xTicks : undefined}
                tickFormatter={formatXTick}
                stroke="rgba(102, 102, 102, 0.3)"
                fontSize={isFullscreen ? themeStyles.xAxis.fontSize * 1.4 : themeStyles.xAxis.fontSize}
                fontFamily={themeStyles.xAxis.fontFamily}
                height={isFullscreen ? 50 : 30}
                axisLine={{ stroke: 'rgba(102, 102, 102, 0.3)', strokeWidth: 1 }}
                tickLine={{ stroke: 'rgba(102, 102, 102, 0.3)', strokeWidth: 1 }}
              />
              
              <YAxis
                domain={yDomain}
                tickFormatter={formatYTick}
                stroke="rgba(102, 102, 102, 0.3)"
                fontSize={isFullscreen ? themeStyles.yAxis.fontSize * 1.4 : themeStyles.yAxis.fontSize}
                fontFamily={themeStyles.yAxis.fontFamily}
                width={isFullscreen ? 80 : 50}
                axisLine={{ stroke: 'rgba(102, 102, 102, 0.3)', strokeWidth: 1 }}
                tickLine={{ stroke: 'rgba(102, 102, 102, 0.3)', strokeWidth: 1 }}
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
                opacity={isFullscreen ? 0.4 : 0.2}
                strokeWidth={isFullscreen ? 2 : 1}
              />
              <ReferenceLine 
                y={-5} 
                stroke={themeStyles.negativeReferenceLine.stroke}
                strokeDasharray={themeStyles.negativeReferenceLine.strokeDasharray}
                opacity={isFullscreen ? 0.4 : 0.2}
                strokeWidth={isFullscreen ? 2 : 1}
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
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            pointerEvents: 'none',
            background: themeStyles.container.background,
            borderRadius: themeStyles.container.borderRadius
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={visibleDataPoints}
                margin={{ 
                  top: isFullscreen ? 40 : 30, 
                  right: isFullscreen ? 50 : 40, 
                  left: theme === 'notebook' ? (isFullscreen ? 120 : 80) : (isFullscreen ? 50 : 30), 
                  bottom: isFullscreen ? 60 : 40 
                }}
                key={animationKey}
              >
                <XAxis
                  type={viewMode === 'timeline' ? 'number' : 'number'}
                  dataKey={viewMode === 'timeline' ? 'timestamp' : 'order'}
                  domain={xDomain}
                  ticks={viewMode === 'timeline' ? xTicks : undefined}
                  tickFormatter={formatXTick}
                  stroke={themeStyles.xAxis.stroke}
                  fontSize={isFullscreen ? themeStyles.xAxis.fontSize * 1.4 : themeStyles.xAxis.fontSize}
                  fontFamily={themeStyles.xAxis.fontFamily}
                  height={isFullscreen ? 50 : 30}
                  axisLine={themeStyles.xAxis.axisLine}
                  tickLine={themeStyles.xAxis.tickLine}
                />
                
                <YAxis 
                  domain={yDomain}
                  tickFormatter={formatYTick}
                  stroke={themeStyles.yAxis.stroke}
                  fontSize={isFullscreen ? themeStyles.yAxis.fontSize * 1.4 : themeStyles.yAxis.fontSize}
                  fontFamily={themeStyles.yAxis.fontFamily}
                  width={isFullscreen ? 80 : 50}
                  axisLine={themeStyles.yAxis.axisLine}
                  tickLine={themeStyles.yAxis.tickLine}
                />
                
                {/* 진행된 라인 */}
                <Line
                  type="monotone"
                  dataKey="emotionScore"
                  stroke={themeStyles.line.stroke}
                  strokeWidth={isFullscreen ? 8 : 5}
                  strokeDasharray={themeStyles.line.strokeDasharray}
                  dot={<PresentationCustomDot />}
                  connectNulls={false}
                  animationDuration={1500}
                  animationBegin={0}
                  style={{
                    filter: isFullscreen ? 'drop-shadow(0 0 12px rgba(100, 181, 246, 0.6))' : 'drop-shadow(0 0 8px rgba(100, 181, 246, 0.4))'
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 축 레이블 추가 (전체화면에서만) */}
        {isFullscreen && (
          <>
            <div style={{
              position: 'absolute',
              bottom: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '16px',
              fontWeight: '500',
              textShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
            }}>
              {getAxisLabels().xAxisLabel}
            </div>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 10,
              transform: 'translateY(-50%) rotate(-90deg)',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '16px',
              fontWeight: '500',
              textShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
            }}>
              {getAxisLabels().yAxisLabel}
            </div>
          </>
        )}

        {/* 전체화면 상태 안내 */}
        {isFullscreen && (
          <div style={{
            position: 'absolute',
            bottom: 50,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: '500',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
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