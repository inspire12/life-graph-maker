import { useState, useEffect } from 'react';
import { FiSave, FiTrash2, FiImage, FiX } from 'react-icons/fi';
import StarRating from '../common/StarRating';
import DatePicker from '../common/DatePicker';
import { fileToBase64, validateImageFile, resizeImage } from '../../utils/imageHelpers';
import { getEmotionColor, getEmotionColorDescription } from '../../utils/colorHelpers';

function EventForm({ 
  event = null, 
  prefilledData = null,
  onSave, 
  onDelete, 
  onCancel,
  mode = 'create' // 'create' or 'edit'
}) {
  const [formData, setFormData] = useState({
    id: null, // 수정 시 이벤트 ID 보존
    title: '',
    description: '',
    date: '',
    endDate: '',
    emotionScore: 0,
    importanceRate: 3,
    category: '성취',
    image: null
  });

  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // 중복 저장 방지

  // 기본 카테고리 목록
  const defaultCategories = [
    '성취', '교육', '커리어', '인간관계', '건강', '취미', '여행', '가족', '도전', '기타'
  ];

  // 감정 점수에 따른 동적 색상 계산
  const emotionColor = getEmotionColor(formData.emotionScore);
  const colorDescription = getEmotionColorDescription(formData.emotionScore);

  // 안전한 날짜 변환 함수
  const safeDateConvert = (dateValue) => {
    if (!dateValue) return '';
    
    // 이미 YYYY-MM-DD 형식인 경우 그대로 반환
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    
    // Date 객체나 다른 형식인 경우 변환
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      console.warn('Date conversion failed:', dateValue);
      return '';
    }
  };

  useEffect(() => {
    if (event && mode === 'edit') {
      setFormData({
        id: event.id, // 이벤트 ID 보존
        title: event.title || '',
        description: event.description || '',
        date: safeDateConvert(event.date),
        endDate: safeDateConvert(event.endDate),
        emotionScore: event.emotionScore || 0,
        importanceRate: event.importanceRate || 3,
        category: event.category || '',
        image: event.image || null
      });

      // 커스텀 카테고리인지 확인
      if (event.category && !defaultCategories.includes(event.category)) {
        setIsCustomCategory(true);
        setCustomCategory(event.category);
      }
    } else if (prefilledData && mode === 'create') {
      // 그래프 클릭으로 전달된 데이터로 초기화
      setFormData(prev => ({
        ...prev,
        ...prefilledData
      }));
    }
  }, [event, prefilledData, mode]);

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

  // handleColorChange 함수는 제거됨 - 색상이 감정 점수에 따라 자동 결정됨

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 유효성 검사
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setImageLoading(true);
    try {
      // 이미지 리사이징 및 base64 변환
      const resizedImage = await resizeImage(file, 800, 600, 0.8);
      setFormData(prev => ({
        ...prev,
        image: resizedImage
      }));
    } catch (error) {
      console.error('Image upload error:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 중복 저장 방지
    if (isSaving) return;
    
    if (!formData.title.trim()) {
      alert('이벤트 제목을 입력해주세요.');
      return;
    }

    if (!formData.category.trim()) {
      alert('카테고리를 선택해주세요.');
      return;
    }

    if (!formData.date.trim()) {
      alert('시작 날짜를 선택해주세요.');
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

    setIsSaving(true);

    try {
      const eventData = {
        ...formData,
        date: formData.date, // 필수 필드이므로 null 체크 제거
        endDate: formData.endDate || null,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        color: getEmotionColor(formData.emotionScore) // 감정 점수 기반 색상 자동 생성
      };

      await onSave(eventData);
    } catch (error) {
      console.error('Failed to save event:', error);
      alert('이벤트 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('정말로 이 이벤트를 삭제하시겠습니까?')) {
      onDelete();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="event-form">
      <div className="form-group">
        <label htmlFor="title">이벤트 제목 <span className="required">*</span></label>
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
          <DatePicker
            value={formData.date}
            onChange={(date) => setFormData(prev => ({ ...prev, date }))}
            label="시작 날짜"
            required={true}
            placeholder="시작 날짜를 선택하세요"
          />
        </div>

        <div className="form-group">
          <DatePicker
            value={formData.endDate}
            onChange={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
            label="종료 날짜 (선택사항)"
            placeholder="종료 날짜를 선택하세요"
          />
        </div>
      </div>

      <div className="form-row" style={{ display: 'none' }}>
        <div className="form-group">
          <label htmlFor="date">시작 날짜 *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
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

      <div className="form-row category-row">
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

        <div className="form-group">
          <label>중요도</label>
          <StarRating
            value={formData.importanceRate}
            onChange={handleImportanceChange}
          />
        </div>
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
        <label>색상 미리보기</label>
        <div className="emotion-color-preview">
          <div 
            className="color-preview-box"
            style={{ backgroundColor: emotionColor }}
          ></div>
          <div className="color-info">
            <div className="color-description">{colorDescription}</div>
            <div className="color-code">색상 코드: {emotionColor}</div>
            <div className="color-note">
              💡 색상은 감정 점수에 따라 자동으로 결정됩니다
            </div>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>사진 (선택사항)</label>
        <div className="image-upload-section">
          {formData.image ? (
            <div className="image-preview">
              <img 
                src={formData.image} 
                alt="이벤트 사진" 
                className="preview-image"
              />
              <button
                type="button"
                onClick={handleImageRemove}
                className="image-remove-btn"
                aria-label="사진 삭제"
              >
                <FiX />
              </button>
            </div>
          ) : (
            <div className="image-upload-area">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="image-upload-input"
                disabled={imageLoading}
              />
              <label htmlFor="image-upload" className="image-upload-label">
                <FiImage />
                <span>
                  {imageLoading ? '업로드 중...' : '사진 추가'}
                </span>
                <small>JPG, PNG, GIF, WebP (최대 5MB)</small>
              </label>
            </div>
          )}
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
            disabled={isSaving}
          >
            <FiSave /> {isSaving ? '저장 중...' : (mode === 'create' ? '추가' : '저장')}
          </button>
        </div>
      </div>
    </form>
  );
}

export default EventForm;