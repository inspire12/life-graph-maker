import { useState, useEffect } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiPlay, FiPause, FiSettings, FiEyeOff, FiEye, FiMonitor, FiSmartphone, FiShare2 } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import ThemeSelector from '../common/ThemeSelector';
import GlobalThemeSelector from '../common/GlobalThemeSelector';

function ControlPanel({
  // 네비게이션 관련
  handlePrevious,
  handleNext,
  toggleAutoPlay,
  isAutoPlay,
  
  // 설정 관련
  minImportance,
  setMinImportance,
  currentTheme,
  setCurrentTheme,
  autoPlayInterval,
  setAutoPlayInterval,
  
  // 레이아웃 관련
  layoutMode,
  setLayoutMode,
  sidebarMode,
  setSidebarMode,
  controlsVisible,
  toggleControls,
  
  // 기타
  handleExit,
  currentEventIndex,
  totalEvents
}) {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const handleShareCurrentPosition = async () => {
    try {
      const currentUrl = new URL(window.location.href);
      if (currentEventIndex > 0) {
        currentUrl.searchParams.set('start', (currentEventIndex + 1).toString());
      } else {
        currentUrl.searchParams.delete('start');
        currentUrl.searchParams.delete('eventId');
      }
      
      await navigator.clipboard.writeText(currentUrl.toString());
      alert(`현재 위치 URL이 클립보드에 복사되었습니다!\n이벤트 ${currentEventIndex + 1}/${totalEvents}에서 시작`);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      alert('URL 복사에 실패했습니다.');
    }
  };

  // 팝업이 열려 있을 때도 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      // 입력 요소에서는 기본 동작 허용
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        return;
      }

      // ESC로 팝업 닫기
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        return;
      }

      // 다른 키보드 단축키들을 부모 핸들러로 전달
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          handleNext();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          toggleAutoPlay();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setSidebarMode(prev => prev === 'overlay' ? 'push' : 'overlay');
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          setLayoutMode(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
          break;
        case '1':
          e.preventDefault();
          setCurrentTheme('modern');
          break;
        case '2':
          e.preventDefault();
          setCurrentTheme('handwritten');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown, true); // capture 단계에서 처리
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, handlePrevious, handleNext, toggleAutoPlay, setLayoutMode, setCurrentTheme, setSidebarMode]);

  return (
    <>
      {/* 플로팅 컨트롤 버튼 */}
      <motion.button
        className="floating-control-btn"
        onClick={togglePanel}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 2000,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-hover)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isOpen ? <FiX /> : <FiSettings />}
      </motion.button>

      {/* 컨트롤 패널 팝업 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 오버레이 */}
            <motion.div
              className="control-panel-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={togglePanel}
              onKeyDown={(e) => {
                // 키보드 이벤트를 부모로 전파
                e.stopPropagation();
                window.dispatchEvent(new KeyboardEvent('keydown', {
                  key: e.key,
                  code: e.code,
                  bubbles: true,
                  cancelable: true
                }));
              }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1999,
                backdropFilter: 'blur(4px)'
              }}
            />
            
            {/* 팝업 패널 */}
            <motion.div
              className="control-panel-popup"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onKeyDown={(e) => {
                // 팝업 내부에서 키보드 이벤트 전파 중단
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
                  return; // 입력 요소에서는 정상 동작
                }
                e.stopPropagation();
              }}
              style={{
                position: 'fixed',
                bottom: '120px',
                right: '30px',
                width: '400px',
                maxWidth: '90vw',
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '20px',
                boxShadow: 'var(--shadow-hover)',
                backdropFilter: 'blur(20px)',
                zIndex: 2001,
                padding: '24px',
                maxHeight: '70vh',
                overflowY: 'auto'
              }}
            >
              {/* 헤더 */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px' 
              }}>
                <h3 style={{ 
                  margin: 0, 
                  color: 'var(--color-text-primary)', 
                  fontSize: '18px', 
                  fontWeight: 'bold' 
                }}>
                  프리젠테이션 컨트롤
                </h3>
                <button
                  onClick={togglePanel}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <FiX />
                </button>
              </div>

              {/* 진행 상황 */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{ 
                    color: 'var(--color-text-secondary)', 
                    fontSize: '14px' 
                  }}>
                    이벤트 진행
                  </span>
                  <span style={{ 
                    color: 'var(--color-text-primary)', 
                    fontSize: '14px', 
                    fontWeight: 'bold' 
                  }}>
                    {currentEventIndex + 1} / {totalEvents}
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'var(--color-border)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <motion.div
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                      borderRadius: '3px'
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentEventIndex + 1) / totalEvents) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* 네비게이션 컨트롤 */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  color: 'var(--color-text-primary)', 
                  fontSize: '16px' 
                }}>
                  네비게이션
                </h4>
                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <button onClick={handlePrevious} className="btn btn-control">
                    <FiChevronLeft /> 이전
                  </button>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select 
                      value={autoPlayInterval} 
                      onChange={(e) => setAutoPlayInterval(Number(e.target.value))}
                      disabled={isAutoPlay}
                      className="speed-select"
                    >
                      <option value={2000}>빠름</option>
                      <option value={3000}>보통</option>
                      <option value={5000}>느림</option>
                      <option value={8000}>매우느림</option>
                    </select>
                    
                    <button onClick={toggleAutoPlay} className="btn btn-control auto-play-btn">
                      {isAutoPlay ? <FiPause /> : <FiPlay />}
                      {isAutoPlay ? '정지' : '자동'}
                      {isAutoPlay && (
                        <div className="auto-play-indicator">
                          <div className="pulse-dot"></div>
                        </div>
                      )}
                    </button>
                  </div>
                  
                  <button onClick={handleNext} className="btn btn-control">
                    다음 <FiChevronRight />
                  </button>
                </div>
              </div>

              {/* 필터 설정 */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  color: 'var(--color-text-primary)', 
                  fontSize: '16px' 
                }}>
                  필터 설정
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      color: 'var(--color-text-secondary)', 
                      fontSize: '12px', 
                      marginBottom: '4px' 
                    }}>
                      중요도 필터
                    </label>
                    <select 
                      value={minImportance} 
                      onChange={(e) => setMinImportance(Number(e.target.value))}
                      className="form-select"
                      style={{ width: '100%' }}
                    >
                      <option value={1}>⭐ 1점 이상</option>
                      <option value={2}>⭐⭐ 2점 이상</option>
                      <option value={3}>⭐⭐⭐ 3점 이상</option>
                      <option value={4}>⭐⭐⭐⭐ 4점 이상</option>
                      <option value={5}>⭐⭐⭐⭐⭐ 5점만</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 테마 설정 */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  color: 'var(--color-text-primary)', 
                  fontSize: '16px' 
                }}>
                  테마 설정
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      color: 'var(--color-text-secondary)', 
                      fontSize: '12px', 
                      marginBottom: '4px' 
                    }}>
                      전체 테마
                    </label>
                    <GlobalThemeSelector />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      color: 'var(--color-text-secondary)', 
                      fontSize: '12px', 
                      marginBottom: '4px' 
                    }}>
                      그래프 테마
                    </label>
                    <ThemeSelector 
                      currentTheme={currentTheme}
                      onThemeChange={setCurrentTheme}
                    />
                  </div>
                </div>
              </div>

              {/* 레이아웃 & 기타 설정 */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  color: 'var(--color-text-primary)', 
                  fontSize: '16px' 
                }}>
                  레이아웃 & 기타
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    onClick={() => setLayoutMode(prev => prev === 'horizontal' ? 'vertical' : 'horizontal')} 
                    className="btn btn-secondary"
                    style={{ justifyContent: 'flex-start' }}
                  >
                    {layoutMode === 'horizontal' ? <FiMonitor /> : <FiSmartphone />}
                    {layoutMode === 'horizontal' ? '세로 모드로 전환' : '가로 모드로 전환'}
                  </button>
                  
                  <button 
                    onClick={() => setSidebarMode(prev => prev === 'overlay' ? 'push' : 'overlay')} 
                    className="btn btn-secondary"
                    style={{ justifyContent: 'flex-start' }}
                  >
                    <FiMonitor />
                    사이드바: {sidebarMode === 'overlay' ? '오버레이' : '푸시'} 모드
                  </button>
                  
                  <button 
                    onClick={handleShareCurrentPosition}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'flex-start' }}
                  >
                    <FiShare2 />
                    현재 위치 공유
                  </button>
                  
                  <button onClick={handleExit} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                    <FiX /> 프리젠테이션 종료
                  </button>
                </div>
              </div>

              {/* 키보드 단축키 */}
              <div style={{
                background: 'var(--color-surface)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '11px',
                color: 'var(--color-text-disabled)',
                fontFamily: 'Courier New, monospace',
                lineHeight: '1.4'
              }}>
                <strong style={{ color: 'var(--color-text-secondary)' }}>키보드 단축키:</strong><br/>
                ← 이전 | → 다음 | Space 다음 | P 자동진행<br/>
                G 그래프토글 | M 사이드바모드 | L 레이아웃전환<br/>
                1-2 테마변경 | H 컨트롤숨김 | ESC 종료
                {isAutoPlay && (
                  <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', marginTop: '4px' }}>
                    🔄 자동 진행 중
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default ControlPanel;