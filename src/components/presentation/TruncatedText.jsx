import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function TruncatedText({ text, maxLines = 8, className = '' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldTruncate, setShouldTruncate] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const textRef = useRef(null);
  const measureRef = useRef(null);

  // 텍스트가 지정된 줄 수를 초과하는지 확인
  useEffect(() => {
    if (!text || !measureRef.current) return;

    const measureElement = measureRef.current;
    measureElement.textContent = text;
    
    // 한 줄의 높이 계산
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = window.getComputedStyle(measureElement).cssText;
    tempDiv.style.height = 'auto';
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.whiteSpace = 'nowrap';
    tempDiv.textContent = 'Test line height';
    document.body.appendChild(tempDiv);
    const lineHeight = tempDiv.offsetHeight;
    document.body.removeChild(tempDiv);

    // 전체 텍스트 높이 계산
    const fullHeight = measureElement.scrollHeight;
    const maxHeight = lineHeight * maxLines;

    if (fullHeight > maxHeight) {
      setShouldTruncate(true);
      
      // 텍스트를 점진적으로 줄여가며 적정 길이 찾기
      let truncatedText = text;
      measureElement.textContent = truncatedText + '...';
      
      while (measureElement.scrollHeight > maxHeight && truncatedText.length > 0) {
        // 단어 단위로 자르기
        const words = truncatedText.trim().split(' ');
        if (words.length > 1) {
          words.pop();
          truncatedText = words.join(' ');
        } else {
          // 단어가 하나밖에 없으면 문자 단위로 자르기
          truncatedText = truncatedText.slice(0, -1);
        }
        measureElement.textContent = truncatedText + '...';
      }
      
      setDisplayText(truncatedText);
    } else {
      setShouldTruncate(false);
      setDisplayText(text);
    }
  }, [text, maxLines]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!text) {
    return (
      <div className={`truncated-text-container ${className}`}>
        <div className="placeholder-text">
          <p>설명이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`truncated-text-container ${className}`}>
      {/* 텍스트 측정용 숨겨진 요소 */}
      <div
        ref={measureRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          height: 'auto',
          width: textRef.current?.offsetWidth || '100%',
          fontSize: '20px',
          lineHeight: '1.7',
          fontWeight: '400',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      />

      <div ref={textRef} className="text-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={isExpanded ? 'expanded' : 'collapsed'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {shouldTruncate && !isExpanded ? (
              <div className="truncated-content">
                <p className="text-paragraph">
                  {displayText}
                  {displayText && <span className="ellipsis">...</span>}
                </p>
              </div>
            ) : (
              <div className="full-content">
                {text.split('\n').map((line, index) => (
                  <p key={index} className="text-paragraph">
                    {line || '\u00A0'}
                  </p>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {shouldTruncate && (
        <motion.button
          className="expand-toggle-btn"
          onClick={toggleExpanded}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isExpanded ? '접기' : '더보기'}
        </motion.button>
      )}

      <style>{`
        .truncated-text-container {
          width: 100%;
          position: relative;
        }

        .text-content {
          width: 100%;
        }

        .text-paragraph {
          color: var(--color-text-primary);
          font-size: 20px;
          line-height: 1.7;
          margin: 0 0 1em 0;
          font-weight: 400;
          word-break: break-word;
          white-space: pre-wrap;
        }

        .text-paragraph:last-child {
          margin-bottom: 0;
        }

        .ellipsis {
          color: var(--color-text-secondary);
          opacity: 0.7;
        }

        .expand-toggle-btn {
          margin-top: 16px;
          padding: 8px 20px;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sm);
          display: block;
          margin-left: auto;
          margin-right: auto;
        }

        .expand-toggle-btn:hover {
          background: var(--color-primary-dark, var(--color-primary));
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
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
          .text-paragraph {
            font-size: 16px;
            line-height: 1.6;
          }
          
          .expand-toggle-btn {
            font-size: 13px;
            padding: 6px 16px;
            margin-top: 12px;
          }
        }

        @media (max-width: 480px) {
          .text-paragraph {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}

export default TruncatedText;