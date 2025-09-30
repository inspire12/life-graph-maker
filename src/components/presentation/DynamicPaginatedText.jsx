import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function DynamicPaginatedText({ text, className = '' }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState([]);
  const [containerHeight, setContainerHeight] = useState('auto');
  const [maxContainerHeight, setMaxContainerHeight] = useState(400);
  const [isFocused, setIsFocused] = useState(false);
  const [needsPagination, setNeedsPagination] = useState(false);
  
  const containerRef = useRef(null);
  const measureRef = useRef(null);
  const textRef = useRef(null);

  // 화면 크기에 따른 최대 높이 설정
  useEffect(() => {
    const updateMaxHeight = () => {
      const vh = window.innerHeight;
      const maxHeight = Math.min(vh * 0.6, 600); // 최대 60vh 또는 600px
      setMaxContainerHeight(maxHeight);
    };

    updateMaxHeight();
    window.addEventListener('resize', updateMaxHeight);
    return () => window.removeEventListener('resize', updateMaxHeight);
  }, []);

  // 텍스트 분석 및 페이지 계산
  useEffect(() => {
    if (!text || !measureRef.current) {
      setPages([]);
      setCurrentPage(0);
      setContainerHeight('auto');
      setNeedsPagination(false);
      return;
    }

    const measureElement = measureRef.current;
    
    // 페이지네이션 없이 전체 텍스트 높이 측정
    measureElement.innerHTML = text.split('\n').map(line => 
      `<p style="margin: 0 0 1em 0; line-height: 1.7;">${line || '&nbsp;'}</p>`
    ).join('');
    
    const fullHeight = measureElement.scrollHeight + 80; // 패딩 포함
    
    if (fullHeight <= maxContainerHeight) {
      // 컨테이너 내에 모든 내용이 들어감 - 페이지네이션 불필요
      setPages([text]);
      setCurrentPage(0);
      setContainerHeight(fullHeight);
      setNeedsPagination(false);
    } else {
      // 컨테이너 크기 초과 - 페이지네이션 필요
      setContainerHeight(maxContainerHeight + 80); // 페이지네이션 공간 추가
      setNeedsPagination(true);
      
      // 텍스트를 페이지별로 분할 - overflow 기반 분할
      const availableHeight = maxContainerHeight - 80; // 패딩 제외한 실제 텍스트 높이
      const paragraphs = text.split('\n');
      const textPages = [];
      let currentPageLines = [];
      
      // 임시 컨테이너로 각 페이지의 높이를 정확히 계산
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: ${measureElement.offsetWidth}px;
        padding: 40px;
        font-size: 20px;
        line-height: 1.7;
        font-weight: 400;
        box-sizing: border-box;
      `;
      document.body.appendChild(tempContainer);
      
      for (const paragraph of paragraphs) {
        // 현재 페이지에 새 문단 추가 시도
        const testLines = [...currentPageLines, paragraph];
        tempContainer.innerHTML = testLines.map(line => 
          `<p style="margin: 0 0 1em 0; line-height: 1.7;">${line || '&nbsp;'}</p>`
        ).join('');
        
        // overflow 체크: scrollHeight가 containerHeight를 초과하는지 확인
        if (tempContainer.scrollHeight > availableHeight && currentPageLines.length > 0) {
          // 현재 페이지가 overflow됨 - 이전 페이지 저장하고 새 페이지 시작
          textPages.push(currentPageLines.join('\n'));
          currentPageLines = [paragraph];
        } else {
          // 아직 overflow되지 않음 - 계속 추가
          currentPageLines = testLines;
        }
      }
      
      // 마지막 페이지 추가
      if (currentPageLines.length > 0) {
        textPages.push(currentPageLines.join('\n'));
      }
      
      document.body.removeChild(tempContainer);
      
      setPages(textPages.length > 0 ? textPages : [text]);
      setCurrentPage(0);
    }
  }, [text, maxContainerHeight]);

  const nextPage = useCallback(() => {
    setCurrentPage(prev => prev < pages.length - 1 ? prev + 1 : prev);
  }, [pages.length]);

  const prevPage = useCallback(() => {
    setCurrentPage(prev => prev > 0 ? prev - 1 : prev);
  }, []);

  // 키보드 이벤트 처리 (포커스된 상태에서만)
  const handleKeyDown = useCallback((e) => {
    if (!isFocused || !needsPagination || pages.length <= 1) return;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopPropagation();
      prevPage();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      nextPage();
    }
  }, [isFocused, needsPagination, pages.length, prevPage, nextPage]);

  useEffect(() => {
    if (isFocused) {
      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [handleKeyDown, isFocused]);


  const goToPage = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPage(pageIndex);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  if (!text) {
    return (
      <div className={`smart-paginated-text-container ${className}`}>
        <div className="placeholder-text">
          <p>설명이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`smart-paginated-text-container ${className} ${isFocused ? 'focused' : ''} ${needsPagination ? 'has-pagination' : ''}`}
      style={{ height: containerHeight }}
      tabIndex={needsPagination ? 0 : -1}
      onFocus={handleFocus}
      onBlur={handleBlur}
      ref={containerRef}
    >
      {/* 텍스트 측정용 숨겨진 요소 */}
      <div
        ref={measureRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          width: '100%',
          padding: '40px',
          fontSize: '20px',
          lineHeight: '1.7',
          fontWeight: '400',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          left: '-9999px'
        }}
      />

      <div className="text-content" ref={textRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentPage}-${pages.length}`}
            className="text-page"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {pages[currentPage]?.split('\n').map((line, index) => (
              <p key={index} className="text-line">
                {line || '\u00A0'}
              </p>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {needsPagination && pages.length > 1 && (
        <div className="pagination-controls">
          <button
            className="page-nav-btn prev-btn"
            onClick={prevPage}
            disabled={currentPage === 0}
            title="이전 페이지 (←)"
          >
            ←
          </button>

          <div className="page-indicators">
            {pages.map((_, index) => (
              <button
                key={index}
                className={`page-dot ${index === currentPage ? 'active' : ''}`}
                onClick={() => goToPage(index)}
                title={`페이지 ${index + 1}`}
              />
            ))}
          </div>

          <button
            className="page-nav-btn next-btn"
            onClick={nextPage}
            disabled={currentPage === pages.length - 1}
            title="다음 페이지 (→)"
          >
            →
          </button>
        </div>
      )}

      {needsPagination && pages.length > 1 && (
        <div className="page-info">
          <span>{currentPage + 1} / {pages.length}</span>
          {isFocused && (
            <span className="focus-hint">← → 키로 페이지 이동</span>
          )}
        </div>
      )}

      <style>{`
        .smart-paginated-text-container {
          width: 100%;
          max-height: 100%;
          position: relative;
          transition: all 0.3s ease;
          outline: none;
          border-radius: 20px;
          box-sizing: border-box;
        }

        .smart-paginated-text-container.focused {
          box-shadow: 0 0 0 2px var(--color-primary, #2196F3);
        }

        .text-content {
          width: 100%;
          height: 100%;
          overflow: hidden;
          position: relative;
        }
        
        .smart-paginated-text-container.has-pagination .text-content {
          height: calc(100% - 80px);
        }

        .text-page {
          width: 100%;
          height: 100%;
          padding: 40px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .text-line {
          color: var(--color-text-primary);
          font-size: 20px;
          line-height: 1.7;
          margin: 0 0 1em 0;
          font-weight: 400;
          word-break: break-word;
          white-space: pre-wrap;
        }

        .text-line:last-child {
          margin-bottom: 0;
        }

        .pagination-controls {
          position: absolute;
          bottom: 15px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
          backdrop-filter: blur(15px);
          padding: 12px 20px;
          border-radius: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.3);
          height: auto;
          min-height: 52px;
        }

        .page-nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--color-primary, #2196F3) 0%, var(--color-secondary, #1976D2) 100%);
          color: white;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
          font-size: 16px;
        }

        .page-nav-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 8px 20px rgba(33, 150, 243, 0.4);
        }

        .page-nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: linear-gradient(135deg, #bbb 0%, #999 100%);
          box-shadow: none;
          transform: none;
        }

        .page-indicators {
          display: flex;
          gap: 4px;
          align-items: center;
          padding: 0 8px;
        }

        .page-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 1;
          position: relative;
          overflow: hidden;
        }

        .page-dot.active {
          background: linear-gradient(135deg, var(--color-primary, #2196F3) 0%, var(--color-secondary, #1976D2) 100%);
          transform: scale(1.2);
          box-shadow: 0 2px 8px rgba(33, 150, 243, 0.4);
        }

        .page-dot:hover:not(.active) {
          background: rgba(255, 255, 255, 0.7);
          transform: scale(1.1);
        }

        .page-info {
          position: absolute;
          bottom: -35px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          color: var(--color-text-secondary);
          opacity: 0.8;
          text-align: center;
          white-space: nowrap;
          background: rgba(255, 255, 255, 0.9);
          padding: 4px 8px;
          border-radius: 12px;
          backdrop-filter: blur(8px);
        }

        .focus-hint {
          display: block;
          font-size: 9px;
          margin-top: 2px;
          color: var(--color-primary, #2196F3);
          font-weight: 500;
        }

        .placeholder-text {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: var(--color-text-secondary);
          font-style: italic;
          opacity: 0.7;
        }

        /* 반응형 디자인 */
        @media (max-width: 768px) {
          .text-page {
            padding: 24px;
          }
          
          .text-line {
            font-size: 16px;
            line-height: 1.6;
          }
          
          .pagination-controls {
            padding: 6px 12px;
          }
          
          .page-nav-btn {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
}

export default DynamicPaginatedText;