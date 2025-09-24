import { useState, useEffect, useRef } from 'react';
import { FiEdit3, FiTrash2, FiCopy, FiPlus, FiEye } from 'react-icons/fi';

function ContextMenu({ 
  isOpen, 
  position, 
  onClose, 
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onDuplicateEvent,
  onViewDetails,
  targetEvent = null 
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMenuItemClick = (action) => {
    action();
    onClose();
  };

  // 화면 경계 확인 및 위치 조정
  const adjustedPosition = { ...position };
  if (menuRef.current) {
    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 오른쪽 경계 확인
    if (position.x + 200 > viewportWidth) {
      adjustedPosition.x = viewportWidth - 220;
    }

    // 아래쪽 경계 확인
    if (position.y + 300 > viewportHeight) {
      adjustedPosition.y = viewportHeight - 320;
    }
  }

  return (
    <>
      {/* 배경 오버레이 */}
      <div className="context-menu-overlay" onClick={onClose} />
      
      {/* 컨텍스트 메뉴 */}
      <div
        ref={menuRef}
        className="context-menu"
        style={{
          position: 'fixed',
          left: adjustedPosition.x,
          top: adjustedPosition.y,
          zIndex: 10000
        }}
      >
        {targetEvent ? (
          // 이벤트 대상 메뉴
          <>
            <div className="context-menu-header">
              <span className="menu-title">{targetEvent.title}</span>
            </div>
            <div className="context-menu-divider" />
            <button 
              className="context-menu-item"
              onClick={() => handleMenuItemClick(() => onEditEvent(targetEvent))}
            >
              <FiEdit3 className="menu-icon" />
              이벤트 수정
            </button>
            <button 
              className="context-menu-item"
              onClick={() => handleMenuItemClick(() => onDuplicateEvent && onDuplicateEvent(targetEvent))}
            >
              <FiCopy className="menu-icon" />
              이벤트 복사
            </button>
            <button 
              className="context-menu-item"
              onClick={() => handleMenuItemClick(() => onViewDetails && onViewDetails(targetEvent))}
            >
              <FiEye className="menu-icon" />
              세부 정보
            </button>
            <div className="context-menu-divider" />
            <button 
              className="context-menu-item danger"
              onClick={() => handleMenuItemClick(() => onDeleteEvent && onDeleteEvent(targetEvent))}
            >
              <FiTrash2 className="menu-icon" />
              이벤트 삭제
            </button>
          </>
        ) : (
          // 빈 공간 대상 메뉴
          <>
            <button 
              className="context-menu-item primary"
              onClick={() => handleMenuItemClick(() => onAddEvent(position))}
            >
              <FiPlus className="menu-icon" />
              이벤트 추가
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default ContextMenu;