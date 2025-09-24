// 그래프 테마 정의
export const GRAPH_THEMES = {
  modern: {
    id: 'modern',
    name: '모던',
    description: '깔끔한 디지털 스타일',
    styles: {
      background: '#f5f5f5',
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
  
  analog: {
    id: 'analog',
    name: '아날로그',
    description: '종이 위에 그려진 듯한 클래식한 느낌',
    styles: {
      background: '#faf9f7',
      gridColor: '#d4c5b3',
      gridPattern: '2 2',
      axisColor: '#8b7355',
      lineColor: '#2c5aa0',
      lineWidth: 3,
      lineDashArray: null,
      dotStroke: '#2c5aa0',
      dotStrokeWidth: 3,
      fontSize: 13,
      fontFamily: '"Times New Roman", Times, serif',
      referenceLineColor: '#a0956b',
      referenceLineDashArray: '5 3',
      positiveReferenceColor: '#3d5a3d',
      negativeReferenceColor: '#8b3a3a',
      tooltipBackground: 'rgba(248, 245, 240, 0.95)',
      tooltipBorder: '2px solid #c4a57b',
      tooltipShadow: '0 3px 10px rgba(139, 115, 85, 0.3)',
      // 아날로그 특유의 효과
      paperTexture: true,
      inkBleed: true
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
      fontFamily: '"Kalam", "Comic Sans MS", cursive',
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
  },
  
  notebook: {
    id: 'notebook',
    name: '노트북',
    description: '노트북/다이어리 스타일',
    styles: {
      background: '#ffffff',
      gridColor: '#c5d9f1',
      gridPattern: '1 1',
      axisColor: '#2d3748',
      lineColor: '#1a365d',
      lineWidth: 2,
      lineDashArray: null,
      dotStroke: '#1a365d',
      dotStrokeWidth: 2,
      fontSize: 11,
      fontFamily: '"Courier New", Courier, monospace',
      referenceLineColor: '#718096',
      referenceLineDashArray: '2 4',
      positiveReferenceColor: '#2b6cb0',
      negativeReferenceColor: '#c53030',
      tooltipBackground: 'rgba(255, 255, 255, 0.98)',
      tooltipBorder: '1px solid #c5d9f1',
      tooltipShadow: '0 2px 6px rgba(29, 54, 93, 0.15)',
      // 노트북 특유의 효과
      ruledLines: true,
      marginLine: true,
      holesPunched: false
    }
  },
  
  minimal: {
    id: 'minimal',
    name: '미니멀',
    description: '최소한의 요소만 표시',
    styles: {
      background: '#ffffff',
      gridColor: 'transparent',
      gridPattern: null,
      axisColor: '#9ca3af',
      lineColor: '#374151',
      lineWidth: 2,
      lineDashArray: null,
      dotStroke: '#ffffff',
      dotStrokeWidth: 3,
      fontSize: 11,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      referenceLineColor: '#e5e7eb',
      referenceLineDashArray: '1 2',
      positiveReferenceColor: '#10b981',
      negativeReferenceColor: '#ef4444',
      tooltipBackground: 'rgba(255, 255, 255, 0.98)',
      tooltipBorder: '1px solid #e5e7eb',
      tooltipShadow: '0 1px 3px rgba(0,0,0,0.1)',
      // 미니멀 특유의 효과
      hideGrid: true,
      cleanAxes: true,
      subtleColors: true
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
    case 'analog':
      return 'linear-gradient(135deg, #8B7355 0%, #D4C5B3 100%)';
    case 'handwritten':
      return 'linear-gradient(135deg, #4A5568 0%, #E8E8E8 100%)';
    case 'notebook':
      return 'linear-gradient(135deg, #2D3748 0%, #C5D9F1 100%)';
    case 'minimal':
      return 'linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%)';
    default:
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
};