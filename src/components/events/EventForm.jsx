import { useState, useEffect } from 'react';
import { FiSave, FiTrash2 } from 'react-icons/fi';
import StarRating from '../common/StarRating';

function EventForm({ 
  event = null, 
  onSave, 
  onDelete, 
  onCancel,
  mode = 'create' // 'create' or 'edit'
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    emotionScore: 0,
    importanceRate: 3,
    category: '',
    color: '#4CAF50'
  });

  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // 기본 카테고리 목록
  const defaultCategories = [
    '교육', '커리어', '인간관계', '건강', '취미', '여행', '가족', '성취', '도전', '기타'
  ];

  // 기본 색상 팔레트
  const colorPalette = [
    '#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0',
    '#607D8B', '#795548', '#E91E63', '#00BCD4', '#CDDC39'
  ];

  useEffect(() => {
    if (event && mode === 'edit') {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
        emotionScore: event.emotionScore || 0,
        importanceRate: event.importanceRate || 3,
        category: event.category || '',
        color: event.color || '#4CAF50'
      });

      // 커스텀 카테고리인지 확인
      if (event.category && !defaultCategories.includes(event.category)) {
        setIsCustomCategory(true);
        setCustomCategory(event.category);
      }
    }
  }, [event, mode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmotionScoreChange = (e) => {
    const value = parseInt(e.target.value);
    setFormData(prev => ({
      ...prev,
      emotionScore: value
    }));
  };

  const handleImportanceChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      importanceRate: rating
    }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setIsCustomCategory(true);
      setFormData(prev => ({
        ...prev,
        category: customCategory
      }));
    } else {
      setIsCustomCategory(false);
      setFormData(prev => ({
        ...prev,
        category: value
      }));
    }
  };

  const handleCustomCategoryChange = (e) => {
    const value = e.target.value;
    setCustomCategory(value);
    setFormData(prev => ({
      ...prev,
      category: value
    }));
  };

  const handleColorChange = (color) => {
    setFormData(prev => ({
      ...prev,
      color
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('이벤트 제목을 입력해주세요.');
      return;
    }

    if (!formData.category.trim()) {
      alert('카테고리를 선택해주세요.');
      return;
    }

    // 날짜 유효성 검사
    if (formData.date && formData.endDate) {
      const startDate = new Date(formData.date);
      const endDate = new Date(formData.endDate);
      if (endDate < startDate) {
        alert('종료 날짜는 시작 날짜보다 늦어야 합니다.');
        return;
      }
    }

    const eventData = {
      ...formData,
      date: formData.date || null,
      endDate: formData.endDate || null,
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category.trim()
    };

    onSave(eventData);
  };

  const handleDelete = () => {
    if (window.confirm('정말로 이 이벤트를 삭제하시겠습니까?')) {
      onDelete();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="event-form">
      <div className="form-group">
        <label htmlFor="title">이벤트 제목 *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="예: 대학 졸업, 첫 직장, 결혼..."
          required
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">설명</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="이 이벤트에 대한 자세한 설명을 입력하세요..."
          rows={4}
          maxLength={1000}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="date">시작 날짜 (선택사항)</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">종료 날짜 (선택사항)</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            min={formData.date || undefined}
          />
          <small className="field-hint">
            기간이 있는 이벤트의 경우 종료 날짜를 설정하세요
          </small>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="emotionScore">감정 점수</label>
          <div className="emotion-score-input">
            <input
              type="range"
              id="emotionScore"
              name="emotionScore"
              min="-10"
              max="10"
              value={formData.emotionScore}
              onChange={handleEmotionScoreChange}
              className="emotion-slider"
            />
            <div className="emotion-value">
              {formData.emotionScore > 0 ? '+' : ''}{formData.emotionScore}
            </div>
          </div>
          <div className="emotion-labels">
            <span>매우 나쁨 (-10)</span>
            <span>보통 (0)</span>
            <span>매우 좋음 (+10)</span>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>중요도</label>
        <StarRating
          value={formData.importanceRate}
          onChange={handleImportanceChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">카테고리</label>
        <select
          id="category"
          value={isCustomCategory ? 'custom' : formData.category}
          onChange={handleCategoryChange}
        >
          <option value="">카테고리 선택</option>
          {defaultCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
          <option value="custom">직접 입력</option>
        </select>
        
        {isCustomCategory && (
          <input
            type="text"
            value={customCategory}
            onChange={handleCustomCategoryChange}
            placeholder="새 카테고리 입력"
            className="custom-category-input"
            maxLength={20}
          />
        )}
      </div>

      <div className="form-group">
        <label>색상</label>
        <div className="color-palette">
          {colorPalette.map(color => (
            <button
              key={color}
              type="button"
              className={`color-option ${formData.color === color ? 'selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
              aria-label={`색상 ${color}`}
            />
          ))}
        </div>
      </div>

      <div className="form-actions">
        {mode === 'edit' && onDelete && (
          <button 
            type="button" 
            onClick={handleDelete}
            className="btn btn-danger"
          >
            <FiTrash2 /> 삭제
          </button>
        )}
        <div className="action-buttons">
          <button 
            type="button" 
            onClick={onCancel}
            className="btn btn-secondary"
          >
            취소
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
          >
            <FiSave /> {mode === 'create' ? '추가' : '저장'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default EventForm;