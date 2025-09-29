import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function PaginatedText({ text, maxLength = 200, className = '' }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState([]);
  const textRef = useRef(null);

  // 텍스트를 페이지별로 분할
  useEffect(() => {
    if (!text) {
      setPages([]);
      setCurrentPage(0);
      return;
    }

    // 문단별로 먼저 분할
    const paragraphs = text.split(/\n\s*\n|\n{2,}/).filter(p => p.trim());
    
    if (paragraphs.length <= 1 && text.length <= maxLength) {
      // 짧은 텍스트는 페이지네이션 없이 표시
      setPages([text]);
      setCurrentPage(0);
      return;
    }

    const textPages = [];
    let currentPageText = '';

    for (const paragraph of paragraphs) {
      const paragraphWithNewlines = paragraph.trim();
      
      // 현재 페이지에 이 문단을 추가할 수 있는지 확인
      if (currentPageText.length + paragraphWithNewlines.length + 2 <= maxLength) {
        currentPageText += (currentPageText ? '\n\n' : '') + paragraphWithNewlines;
      } else {
        // 현재 페이지가 비어있지 않으면 페이지에 추가
        if (currentPageText.trim()) {
          textPages.push(currentPageText);
        }
        
        // 문단이 너무 길면 문장별로 분할
        if (paragraphWithNewlines.length > maxLength) {
          const sentences = paragraphWithNewlines.split(/(?<=[.!?])\s+/);
          let sentenceGroup = '';
          
          for (const sentence of sentences) {
            if (sentenceGroup.length + sentence.length + 1 <= maxLength) {
              sentenceGroup += (sentenceGroup ? ' ' : '') + sentence;
            } else {
              if (sentenceGroup.trim()) {
                textPages.push(sentenceGroup);
              }
              sentenceGroup = sentence;
            }
          }
          
          if (sentenceGroup.trim()) {
            currentPageText = sentenceGroup;
          } else {
            currentPageText = '';
          }
        } else {
          currentPageText = paragraphWithNewlines;
        }
      }
    }

    // 마지막 페이지 추가
    if (currentPageText.trim()) {
      textPages.push(currentPageText);
    }

    setPages(textPages.length > 0 ? textPages : [text]);
    setCurrentPage(0);
  }, [text, maxLength]);

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPage(pageIndex);
    }
  };

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 텍스트 페이지네이션 키보드 단축키 (Shift + 화살표)
      if (e.shiftKey && pages.length > 1) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prevPage();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          nextPage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages.length]);

  if (!text || pages.length === 0) {
    return (
      <div className={`paginated-text-container ${className}`}>
        <div className="placeholder-text">
          <p>설명이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`paginated-text-container ${className}`}>
      <div className="paginated-text-content" ref={textRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            className="text-page"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {pages[currentPage]?.split('\n').map((line, index) => (
              <p key={index} className="text-line">
                {line || '\u00A0'} {/* 빈 줄은 공백으로 처리 */}
              </p>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {pages.length > 1 && (
        <div className="pagination-controls">
          <button
            className="page-nav-btn prev-btn"
            onClick={prevPage}
            disabled={currentPage === 0}
            title="이전 페이지 (Shift + ←)"
          >
            <FiChevronLeft />
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
            title="다음 페이지 (Shift + →)"
          >
            <FiChevronRight />
          </button>
        </div>
      )}

      {pages.length > 1 && (
        <div className="page-info">
          <span>{currentPage + 1} / {pages.length}</span>
        </div>
      )}

      <style>{`
        .paginated-text-container {
          width: 100%;
          position: relative;
        }

        .paginated-text-content {
          min-height: 100px;
          position: relative;
        }

        .text-page {
          width: 100%;
        }

        .text-line {
          color: var(--color-text-primary);
          font-size: 20px;
          line-height: 1.7;
          margin: 0 0 1em 0;
          font-weight: 400;
        }

        .text-line:last-child {
          margin-bottom: 0;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 20px;
          padding: 0 10px;
        }

        .page-nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 50%;
          background: var(--color-surface);
          color: var(--color-text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sm);
        }

        .page-nav-btn:hover:not(:disabled) {
          background: var(--color-primary);
          color: white;
          transform: scale(1.1);
        }

        .page-nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .page-indicators {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .page-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          background: var(--color-text-disabled);
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0.4;
        }

        .page-dot.active {
          background: var(--color-primary);
          opacity: 1;
          transform: scale(1.3);
        }

        .page-dot:hover {
          opacity: 0.8;
          transform: scale(1.2);
        }

        .page-info {
          text-align: center;
          margin-top: 8px;
          font-size: 12px;
          color: var(--color-text-secondary);
          opacity: 0.7;
        }

        /* 반응형 디자인 */
        @media (max-width: 768px) {
          .text-line {
            font-size: 16px;
          }
          
          .pagination-controls {
            margin-top: 16px;
          }
          
          .page-nav-btn {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>
    </div>
  );
}

export default PaginatedText;