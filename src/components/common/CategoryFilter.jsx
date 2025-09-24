import { useState, useEffect } from 'react';
import { FiFilter, FiX, FiCheck } from 'react-icons/fi';

function CategoryFilter({ events = [], selectedCategories = [], onCategoryChange }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // 이벤트에서 고유한 카테고리들 추출
  const availableCategories = [...new Set(events.map(event => event.category).filter(Boolean))].sort();
  
  const handleCategoryToggle = (category) => {
    let newSelected;
    if (selectedCategories.includes(category)) {
      newSelected = selectedCategories.filter(cat => cat !== category);
    } else {
      newSelected = [...selectedCategories, category];
    }
    onCategoryChange(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === availableCategories.length) {
      // 모두 선택된 상태면 전체 해제
      onCategoryChange([]);
    } else {
      // 전체 선택
      onCategoryChange([...availableCategories]);
    }
  };

  const handleClearAll = () => {
    onCategoryChange([]);
  };

  const isAllSelected = availableCategories.length > 0 && selectedCategories.length === availableCategories.length;
  const hasSelection = selectedCategories.length > 0;

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.category-filter')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (availableCategories.length === 0) {
    return null; // 카테고리가 없으면 렌더링하지 않음
  }

  return (
    <div className="category-filter">
      <button 
        className={`filter-toggle-btn ${hasSelection ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="카테고리 필터"
      >
        <FiFilter size={16} />
        <span>카테고리</span>
        {hasSelection && (
          <span className="filter-count">{selectedCategories.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="filter-dropdown">
          <div className="filter-header">
            <span className="filter-title">카테고리 선택</span>
            <button 
              className="filter-close-btn"
              onClick={() => setIsOpen(false)}
            >
              <FiX size={16} />
            </button>
          </div>

          <div className="filter-controls">
            <button 
              className="filter-control-btn"
              onClick={handleSelectAll}
            >
              {isAllSelected ? '전체 해제' : '전체 선택'}
            </button>
            {hasSelection && (
              <button 
                className="filter-control-btn clear"
                onClick={handleClearAll}
              >
                초기화
              </button>
            )}
          </div>

          <div className="filter-options">
            {availableCategories.map(category => {
              const isSelected = selectedCategories.includes(category);
              const eventCount = events.filter(event => event.category === category).length;
              
              return (
                <label key={category} className="filter-option">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCategoryToggle(category)}
                    style={{ display: 'none' }}
                  />
                  <div className={`filter-checkbox ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <FiCheck size={12} />}
                  </div>
                  <span className="filter-label">{category}</span>
                  <span className="filter-count-badge">({eventCount})</span>
                </label>
              );
            })}
          </div>

          {hasSelection && (
            <div className="filter-summary">
              {selectedCategories.length}개 카테고리 선택됨
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CategoryFilter;