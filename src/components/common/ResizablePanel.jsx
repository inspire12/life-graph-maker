import { useState, useRef, useEffect, useCallback } from 'react';

const ResizablePanel = ({ 
  children, 
  defaultWidth = 400, 
  minWidth = 280, 
  maxWidth = 600, 
  className = '',
  storageKey = 'panel-width',
  resizeHandle = 'left' // 'left' or 'right'
}) => {
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseInt(saved, 10) : defaultWidth;
  });
  
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  
  const panelRef = useRef(null);
  const resizeHandleRef = useRef(null);

  // 마우스 이동 핸들러
  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;
    
    const deltaX = resizeHandle === 'left' ? startX - e.clientX : e.clientX - startX;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX));
    
    setWidth(newWidth);
  }, [isResizing, startX, startWidth, minWidth, maxWidth, resizeHandle]);

  // 마우스 업 핸들러
  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // 이벤트 리스너 등록/해제
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // 로컬 스토리지에 너비 저장
  useEffect(() => {
    localStorage.setItem(storageKey, width.toString());
  }, [width, storageKey]);

  // 리사이즈 시작
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(width);
  };

  // 더블클릭으로 기본 너비로 리셋
  const handleDoubleClick = () => {
    setWidth(defaultWidth);
  };

  return (
    <div 
      ref={panelRef}
      className={`resizable-panel ${className}`}
      style={{ 
        width: `${width}px`,
        flexShrink: 0,
        position: 'relative'
      }}
    >
      {/* 리사이즈 핸들 */}
      <div
        ref={resizeHandleRef}
        className={`resize-handle resize-handle-${resizeHandle}`}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '8px',
          cursor: 'col-resize',
          backgroundColor: 'transparent',
          zIndex: 15,
          left: resizeHandle === 'left' ? '-4px' : 'auto',
          right: resizeHandle === 'right' ? '-4px' : 'auto',
          transition: 'background-color 0.2s ease',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          if (!isResizing) {
            e.target.style.backgroundColor = 'rgba(0, 123, 255, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isResizing) {
            e.target.style.backgroundColor = 'transparent';
          }
        }}
      />
      
      {/* 패널 내용 */}
      <div className="resizable-panel-content" style={{ height: '100%' }}>
        {children}
      </div>
      
      {/* 리사이징 중 오버레이 */}
      {isResizing && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            cursor: 'col-resize',
            backgroundColor: 'rgba(0, 0, 0, 0.01)' // 거의 투명하지만 마우스 이벤트 캐치
          }}
        />
      )}
    </div>
  );
};

export default ResizablePanel;