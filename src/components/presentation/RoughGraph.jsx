import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import rough from 'roughjs';
import { FiMaximize, FiMinimize } from 'react-icons/fi';
import { getGraphStyles, getPresentationBackground } from '../../styles/graphThemes';
import { 
  prepareGraphData, 
  calculateXAxisDomain, 
  calculateYAxisDomain,
  formatXAxisTick,
  clusterEventsByDate
} from '../../utils/graphHelpers';

function RoughGraph({ 
  events = [], 
  currentEventIndex = 0,
  viewMode = 'timeline',
  height = 300,
  theme = 'handwritten'
}) {
  const svgRef = useRef(null);
  const [visibleDataPoints, setVisibleDataPoints] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [roughSvg, setRoughSvg] = useState(null);

  // 그래프 데이터 준비
  const { clusteredData, xDomain, yDomain } = useMemo(() => {
    const raw = prepareGraphData(events, viewMode);
    const clustered = clusterEventsByDate(raw, viewMode);
    const xDom = calculateXAxisDomain(raw, viewMode);
    const yDom = calculateYAxisDomain(raw);
    
    return {
      clusteredData: clustered,
      xDomain: xDom,
      yDomain: yDom
    };
  }, [events, viewMode]);

  // 현재 이벤트까지의 데이터만 표시
  useEffect(() => {
    if (!events.length || !clusteredData.length) return;
    
    const currentEventId = events[currentEventIndex]?.id;
    if (!currentEventId) return;
    
    const currentPointIndex = clusteredData.findIndex(
      point => point.originalEvent?.id === currentEventId
    );
    
    if (currentPointIndex !== -1) {
      const visibleData = clusteredData.slice(0, currentPointIndex + 1);
      setVisibleDataPoints(visibleData);
    }
  }, [currentEventIndex, events.length, clusteredData]);

  // Rough.js SVG 초기화
  useEffect(() => {
    if (svgRef.current) {
      const rc = rough.svg(svgRef.current);
      setRoughSvg(rc);
    }
  }, []);

  // 좌표 변환 함수들
  const getScaleX = (width, margin) => {
    const dataWidth = width - margin.left - margin.right;
    const [minX, maxX] = xDomain;
    return (x) => margin.left + ((x - minX) / (maxX - minX)) * dataWidth;
  };

  const getScaleY = (height, margin) => {
    const dataHeight = height - margin.top - margin.bottom;
    const [minY, maxY] = yDomain;
    return (y) => margin.top + dataHeight - ((y - minY) / (maxY - minY)) * dataHeight;
  };

  // 감정에 따른 색상 계산
  const getEmotionColor = (emotionScore) => {
    if (emotionScore >= 7) return '#48bb78'; // 매우 좋음 - 초록
    if (emotionScore >= 3) return '#4a5568'; // 보통 - 회색
    if (emotionScore >= 0) return '#ed8936'; // 약간 나쁨 - 주황
    return '#f56565'; // 나쁨 - 빨강
  };

  // Rough 라인 그리기 (감정에 따른 색상 변화)
  const drawRoughLine = (points, emotionScores, roughness = 1.8) => {
    if (!roughSvg || points.length < 2) return [];

    const elements = [];
    
    // 선분별로 다른 색상 적용
    for (let i = 0; i < points.length - 1; i++) {
      const startPoint = points[i];
      const endPoint = points[i + 1];
      const avgEmotion = (emotionScores[i] + emotionScores[i + 1]) / 2;
      
      const pathData = `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`;
      
      const element = roughSvg.path(pathData, {
        stroke: getEmotionColor(avgEmotion),
        strokeWidth: 4,
        roughness: roughness,
        bowing: 3,
        fill: 'none'
      });
      
      elements.push(element);
    }
    
    return elements;
  };

  // Rough 점 그리기 (감정별 색상)
  const drawRoughDot = (x, y, radius = 6, isActive = false, importance = 1, emotionScore = 0) => {
    if (!roughSvg) return null;

    const scale = isFullscreen ? 1.5 : 1;
    const actualRadius = (radius + importance) * scale;
    const emotionColor = getEmotionColor(emotionScore);

    // 현재 이벤트는 특별한 스타일
    if (isActive) {
      return roughSvg.circle(x, y, actualRadius * 2.5, {
        stroke: emotionColor,
        strokeWidth: 4 * scale,
        fill: emotionColor,
        fillStyle: 'zigzag',
        roughness: 2.5,
        hachureAngle: 45,
        hachureGap: 2 * scale
      });
    }

    // 일반 점들 (감정에 따른 색상)
    return roughSvg.circle(x, y, actualRadius * 2, {
      stroke: emotionColor,
      strokeWidth: 2.5 * scale,
      fill: 'white',
      fillStyle: 'hachure',
      roughness: 2.0,
      hachureAngle: Math.random() * 180,
      hachureGap: 3 * scale
    });
  };

  // 격자 그리기
  const drawRoughGrid = (width, height, margin) => {
    if (!roughSvg) return [];

    const elements = [];
    const gridColor = '#e8e8e8';
    const roughness = 0.8;

    // 세로 격자선
    const xStep = (width - margin.left - margin.right) / 8;
    for (let i = 1; i < 8; i++) {
      const x = margin.left + i * xStep;
      const line = roughSvg.line(x, margin.top, x, height - margin.bottom, {
        stroke: gridColor,
        strokeWidth: 1,
        roughness: roughness,
        strokeDasharray: '2 4'
      });
      elements.push(line);
    }

    // 가로 격자선
    const yStep = (height - margin.top - margin.bottom) / 6;
    for (let i = 1; i < 6; i++) {
      const y = margin.top + i * yStep;
      const line = roughSvg.line(margin.left, y, width - margin.right, y, {
        stroke: gridColor,
        strokeWidth: 1,
        roughness: roughness,
        strokeDasharray: '2 4'
      });
      elements.push(line);
    }

    return elements;
  };

  // 축 그리기
  const drawRoughAxes = (width, height, margin) => {
    if (!roughSvg) return [];

    const elements = [];
    const axisColor = '#4a5568';
    const roughness = 1.2;

    // X축
    const xAxis = roughSvg.line(
      margin.left, 
      height - margin.bottom,
      width - margin.right, 
      height - margin.bottom,
      {
        stroke: axisColor,
        strokeWidth: 2,
        roughness: roughness
      }
    );
    elements.push(xAxis);

    // Y축
    const yAxis = roughSvg.line(
      margin.left, 
      margin.top,
      margin.left, 
      height - margin.bottom,
      {
        stroke: axisColor,
        strokeWidth: 2,
        roughness: roughness
      }
    );
    elements.push(yAxis);

    // 0선 참조선
    const scaleY = getScaleY(height, margin);
    const zeroY = scaleY(0);
    if (zeroY >= margin.top && zeroY <= height - margin.bottom) {
      const zeroLine = roughSvg.line(
        margin.left,
        zeroY,
        width - margin.right,
        zeroY,
        {
          stroke: '#a0aec0',
          strokeWidth: 1.5,
          roughness: 0.8,
          strokeDasharray: '3 3'
        }
      );
      elements.push(zeroLine);
    }

    return elements;
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
    const presentationBackground = getPresentationBackground(theme);
    const containerWidth = isFullscreen ? window.innerWidth * 0.9 : 800;
    const containerHeight = isFullscreen ? window.innerHeight * 0.8 : height;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };

    const scaleX = getScaleX(containerWidth, margin);
    const scaleY = getScaleY(containerHeight, margin);

    // 라인 포인트와 감정 점수 계산
    const linePoints = visibleDataPoints.map(point => ({
      x: scaleX(viewMode === 'timeline' ? point.timestamp : point.order),
      y: scaleY(point.emotionScore)
    }));
    
    const emotionScores = visibleDataPoints.map(point => point.emotionScore);

    return (
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: isFullscreen ? '100vh' : containerHeight,
        background: presentationBackground,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* 현재 테마 정보 표시 */}
        <div style={{
          position: 'absolute',
          top: isFullscreen ? 20 : 10,
          left: isFullscreen ? 20 : 10,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: isFullscreen ? '8px 16px' : '6px 12px',
          borderRadius: '8px',
          fontSize: isFullscreen ? '14px' : '12px',
          backdropFilter: 'blur(8px)',
          fontWeight: '500',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <span style={{ opacity: 0.8 }}>테마:</span> {theme} rough
        </div>

        {/* 전체화면 토글 버튼 */}
        <button
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

        {/* SVG 캔버스 */}
        <svg 
          ref={svgRef}
          width={containerWidth} 
          height={containerHeight}
          style={{ 
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          {/* 격자와 축은 roughSvg가 준비되면 렌더링 */}
          {roughSvg && (
            <g>
              {/* 격자 */}
              {drawRoughGrid(containerWidth, containerHeight, margin).map((element, index) => (
                <g key={`grid-${index}`} dangerouslySetInnerHTML={{ __html: element.innerHTML }} />
              ))}
              
              {/* 축 */}
              {drawRoughAxes(containerWidth, containerHeight, margin).map((element, index) => (
                <g key={`axis-${index}`} dangerouslySetInnerHTML={{ __html: element.innerHTML }} />
              ))}
              
              {/* 라인들 (감정별 색상) */}
              {linePoints.length > 1 && 
                drawRoughLine(linePoints, emotionScores, 1.8).map((element, index) => (
                  <g 
                    key={`line-${index}`}
                    dangerouslySetInnerHTML={{ __html: element.innerHTML }} 
                  />
                ))
              }
              
              {/* 점들 */}
              {visibleDataPoints.map((point, index) => {
                const x = scaleX(viewMode === 'timeline' ? point.timestamp : point.order);
                const y = scaleY(point.emotionScore);
                const isCurrentEvent = events[currentEventIndex] && 
                  point.originalEvent && 
                  point.originalEvent.id === events[currentEventIndex].id;
                
                const importance = point.originalEvent?.importanceRate || 1;
                const emotionScore = point.emotionScore;
                const dotElement = drawRoughDot(
                  x, 
                  y, 
                  isCurrentEvent ? 8 : 6, 
                  isCurrentEvent, 
                  importance,
                  emotionScore
                );
                
                return dotElement ? (
                  <g 
                    key={`dot-${index}`} 
                    dangerouslySetInnerHTML={{ __html: dotElement.innerHTML }}
                  >
                    {/* 현재 이벤트 주변 효과 */}
                    {isCurrentEvent && (
                      <>
                        <circle
                          cx={x}
                          cy={y}
                          r="20"
                          fill="none"
                          stroke={getEmotionColor(emotionScore)}
                          strokeWidth="1"
                          opacity="0.3"
                          strokeDasharray="2 3"
                        >
                          <animate
                            attributeName="r"
                            values="20;25;20"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.3;0.1;0.3"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        <circle
                          cx={x}
                          cy={y}
                          r="30"
                          fill="none"
                          stroke={getEmotionColor(emotionScore)}
                          strokeWidth="1"
                          opacity="0.2"
                          strokeDasharray="1 4"
                        >
                          <animate
                            attributeName="r"
                            values="30;35;30"
                            dur="3s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </>
                    )}
                  </g>
                ) : null;
              })}
            </g>
          )}
          
          {/* 축 레이블 */}
          <text 
            x={containerWidth / 2} 
            y={containerHeight - 10} 
            textAnchor="middle" 
            fontSize="12" 
            fontFamily="Kalam, Gaegu, Do Hyeon, Nanum Pen Script, Comic Sans MS, cursive"
            fill="#4a5568"
          >
            {viewMode === 'timeline' ? '시간' : '순서'}
          </text>
          
          <text 
            x="15" 
            y={containerHeight / 2} 
            textAnchor="middle" 
            fontSize="12" 
            fontFamily="Kalam, Gaegu, Do Hyeon, Nanum Pen Script, Comic Sans MS, cursive"
            fill="#4a5568"
            transform={`rotate(-90, 15, ${containerHeight / 2})`}
          >
            감정 점수
          </text>
        </svg>

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
            background: getPresentationBackground(theme),
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

export default RoughGraph;