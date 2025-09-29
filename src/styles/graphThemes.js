// 그래프 테마 정의
export const GRAPH_THEMES = {
  modern: {
    id: 'modern',
    name: '기본',
    description: '깔끔한 디지털 스타일',
    styles: {
      background: '#ffffff',
      gridColor: '#e0e0e0',
      gridPattern: '3 3',
      axisColor: '#666',
      lineColor: '#2196F3',
      lineWidth: 2,
      lineDashArray: null,
      dotStroke: '#fff',
      dotStrokeWidth: 2,
      fontSize: 12,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      referenceLineColor: '#999',
      referenceLineDashArray: '2 2',
      positiveReferenceColor: '#4CAF50',
      negativeReferenceColor: '#f44336',
      tooltipBackground: 'rgba(255, 255, 255, 0.95)',
      tooltipBorder: '1px solid #ddd',
      tooltipShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }
  },
  
  handwritten: {
    id: 'handwritten',
    name: '손글씨',
    description: '손으로 그린 스케치 느낌',
    styles: {
      background: '#fdfdfd',
      gridColor: '#e8e8e8',
      gridPattern: '1 3',
      axisColor: '#555',
      lineColor: '#4a5568',
      lineWidth: 3,
      lineDashArray: null,
      dotStroke: '#4a5568',
      dotStrokeWidth: 2,
      fontSize: 12,
      fontFamily: '"Kalam", "Gaegu", "Do Hyeon", "Nanum Pen Script", "Comic Sans MS", cursive',
      referenceLineColor: '#a0aec0',
      referenceLineDashArray: '3 5',
      positiveReferenceColor: '#48bb78',
      negativeReferenceColor: '#f56565',
      tooltipBackground: 'rgba(255, 255, 255, 0.95)',
      tooltipBorder: '2px solid #4a5568',
      tooltipShadow: '0 2px 8px rgba(74, 85, 104, 0.2)',
      // 손글씨 특유의 효과
      roughPath: true,
      sketchyLines: true,
      handdrawnDots: true
    }
  }
};

// 기본 테마
export const DEFAULT_THEME = GRAPH_THEMES.modern;

// 테마 관련 유틸리티 함수
export const getTheme = (themeId) => {
  return GRAPH_THEMES[themeId] || DEFAULT_THEME;
};

export const getThemeList = () => {
  return Object.values(GRAPH_THEMES);
};

// 특수 효과를 위한 SVG 필터 정의
export const getThemeSVGFilters = (theme) => {
  const filters = [];
  
  if (theme.styles.paperTexture) {
    filters.push(`
      <filter id="paper-texture" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1"/>
        <feColorMatrix values="1 0 0 0 0.05
                               0 1 0 0 0.03
                               0 0 1 0 0.02
                               0 0 0 1 0"/>
      </filter>
    `);
  }
  
  if (theme.styles.inkBleed) {
    filters.push(`
      <filter id="ink-bleed" x="0%" y="0%" width="100%" height="100%">
        <feGaussianBlur stdDeviation="0.5" result="blur"/>
        <feOffset dx="0.5" dy="0.5" result="offset"/>
        <feFlood flood-color="${theme.styles.lineColor}" flood-opacity="0.3"/>
        <feComposite in2="offset" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    `);
  }
  
  if (theme.styles.roughPath) {
    filters.push(`
      <filter id="rough-path" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence baseFrequency="0.02" numOctaves="3" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8"/>
      </filter>
    `);
  }
  
  return filters;
};

// 테마별 Recharts 스타일 생성기
export const getGraphStyles = (theme, isFullscreen = false) => {
  const themeConfig = getTheme(theme);
  const scale = isFullscreen ? 1.5 : 1;
  
  return {
    // 컨테이너 스타일
    container: {
      background: themeConfig.styles.background,
      borderRadius: themeConfig.id === 'notebook' ? '0' : '8px',
      position: 'relative',
      overflow: 'hidden',
      // 노트북 테마의 경우 ruled lines 효과
      ...(themeConfig.styles.ruledLines && {
        backgroundImage: `
          repeating-linear-gradient(
            transparent,
            transparent 19px,
            ${themeConfig.styles.gridColor} 20px
          )
        `,
      }),
      // 아날로그 테마의 경우 종이 질감
      ...(themeConfig.styles.paperTexture && {
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(120, 119, 108, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(120, 119, 108, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(120, 119, 108, 0.03) 0%, transparent 50%)
        `,
      }),
    },
    
    // CartesianGrid 스타일
    cartesianGrid: {
      stroke: themeConfig.styles.gridColor,
      strokeDasharray: themeConfig.styles.gridPattern,
      opacity: themeConfig.styles.hideGrid ? 0 : 0.5
    },
    
    // X축 스타일
    xAxis: {
      stroke: themeConfig.styles.axisColor,
      fontSize: Math.round(themeConfig.styles.fontSize * scale),
      fontFamily: themeConfig.styles.fontFamily,
      axisLine: {
        stroke: themeConfig.styles.axisColor,
        strokeWidth: themeConfig.id === 'handwritten' ? 2 : 1
      },
      tickLine: {
        stroke: themeConfig.styles.axisColor,
        strokeWidth: 1
      }
    },
    
    // Y축 스타일
    yAxis: {
      stroke: themeConfig.styles.axisColor,
      fontSize: Math.round(themeConfig.styles.fontSize * scale),
      fontFamily: themeConfig.styles.fontFamily,
      axisLine: {
        stroke: themeConfig.styles.axisColor,
        strokeWidth: themeConfig.id === 'handwritten' ? 2 : 1
      },
      tickLine: {
        stroke: themeConfig.styles.axisColor,
        strokeWidth: 1
      }
    },
    
    // 메인 라인 스타일
    line: {
      stroke: themeConfig.styles.lineColor,
      strokeWidth: Math.round(themeConfig.styles.lineWidth * scale),
      strokeDasharray: themeConfig.styles.lineDashArray,
      filter: themeConfig.styles.inkBleed ? 'url(#ink-bleed)' : 
              themeConfig.styles.roughPath ? 'url(#rough-path)' : 'none'
    },
    
    // 참조선 스타일
    referenceLine: {
      stroke: themeConfig.styles.referenceLineColor,
      strokeDasharray: themeConfig.styles.referenceLineDashArray,
      strokeWidth: themeConfig.id === 'analog' ? 2 : 1
    },
    
    // 양수/음수 참조선
    positiveReferenceLine: {
      stroke: themeConfig.styles.positiveReferenceColor,
      strokeDasharray: themeConfig.styles.referenceLineDashArray,
      opacity: themeConfig.id === 'minimal' ? 0.3 : 0.5
    },
    
    negativeReferenceLine: {
      stroke: themeConfig.styles.negativeReferenceColor,
      strokeDasharray: themeConfig.styles.referenceLineDashArray,
      opacity: themeConfig.id === 'minimal' ? 0.3 : 0.5
    },
    
    // 툴팁 스타일
    tooltip: {
      background: themeConfig.styles.tooltipBackground,
      border: themeConfig.styles.tooltipBorder,
      boxShadow: themeConfig.styles.tooltipShadow,
      borderRadius: themeConfig.id === 'notebook' ? '4px' : 
                    themeConfig.id === 'handwritten' ? '12px' : '8px',
      fontFamily: themeConfig.styles.fontFamily,
      fontSize: themeConfig.styles.fontSize
    },
    
    // 커서 스타일
    cursor: {
      stroke: themeConfig.styles.lineColor,
      strokeWidth: 1,
      strokeDasharray: themeConfig.id === 'handwritten' ? '3 3' : '1 1'
    },
    
    // ActiveDot 스타일
    activeDot: {
      r: Math.round(8 * scale),
      stroke: themeConfig.styles.lineColor,
      strokeWidth: Math.round(themeConfig.styles.dotStrokeWidth * scale),
      fill: themeConfig.styles.dotStroke,
      filter: themeConfig.styles.inkBleed ? 'url(#ink-bleed)' : 'none'
    }
  };
};

// 테마별 점 스타일 생성기
export const getCustomDotStyle = (theme, payload, isActive = false, scale = 1) => {
  const themeConfig = getTheme(theme);
  const baseStyle = {
    fill: payload.color,
    stroke: themeConfig.styles.dotStroke,
    strokeWidth: Math.round(themeConfig.styles.dotStrokeWidth * scale),
  };
  
  if (themeConfig.styles.handdrawnDots) {
    return {
      ...baseStyle,
      filter: 'url(#rough-path)',
      strokeDasharray: '0.5 0.5',
    };
  }
  
  if (themeConfig.styles.inkBleed && isActive) {
    return {
      ...baseStyle,
      filter: 'url(#ink-bleed)',
    };
  }
  
  return baseStyle;
};

// 프리젠테이션 테마별 배경 생성기
export const getPresentationBackground = (theme) => {
  switch (theme) {
    case 'modern':
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    case 'handwritten':
      return 'linear-gradient(135deg, #4A5568 0%, #E8E8E8 100%)';
    default:
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
};