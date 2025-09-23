import { useState, useEffect } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function DatePicker({ 
  value, 
  onChange, 
  label, 
  required = false,
  placeholder = "날짜 선택"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setDisplayDate(date);
    }
  }, [value]);

  // 현재 월의 첫 번째 날과 마지막 날
  const firstDayOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
  const lastDayOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0);
  
  // 달력 시작 날짜 (이전 달의 마지막 주 포함)
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
  
  // 달력에 표시할 날짜들 생성
  const calendarDates = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < 42; i++) { // 6주 × 7일
    calendarDates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const months = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateString = date.toISOString().split('T')[0];
    onChange(dateString);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1));
  };

  const handleYearChange = (direction) => {
    setDisplayDate(new Date(displayDate.getFullYear() + direction, displayDate.getMonth(), 1));
  };

  const formatDisplayValue = () => {
    if (!selectedDate) return '';
    return selectedDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === displayDate.getMonth();
  };

  const quickDates = [
    { label: '오늘', value: new Date() },
    { label: '어제', value: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { label: '1주일 전', value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    { label: '1개월 전', value: new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()) },
    { label: '6개월 전', value: new Date(new Date().getFullYear(), new Date().getMonth() - 6, new Date().getDate()) },
    { label: '1년 전', value: new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()) }
  ];

  return (
    <div className="date-picker">
      {label && (
        <label className="date-picker-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      
      <div className="date-picker-input-container">
        <input
          type="text"
          value={formatDisplayValue()}
          placeholder={placeholder}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          className="date-picker-input"
          required={required}
        />
        <FiCalendar 
          className="date-picker-icon" 
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>

      {isOpen && (
        <div className="date-picker-dropdown">
          {/* 빠른 선택 */}
          <div className="quick-dates">
            <div className="quick-dates-title">빠른 선택</div>
            <div className="quick-dates-buttons">
              {quickDates.map((quick, index) => (
                <button
                  key={index}
                  type="button"
                  className="quick-date-btn"
                  onClick={() => handleDateClick(quick.value)}
                >
                  {quick.label}
                </button>
              ))}
            </div>
          </div>

          {/* 달력 헤더 */}
          <div className="calendar-header">
            <div className="year-controls">
              <button
                type="button"
                onClick={() => handleYearChange(-1)}
                className="year-btn"
              >
                {displayDate.getFullYear() - 1}
              </button>
              <span className="current-year">{displayDate.getFullYear()}</span>
              <button
                type="button"
                onClick={() => handleYearChange(1)}
                className="year-btn"
              >
                {displayDate.getFullYear() + 1}
              </button>
            </div>
            
            <div className="month-controls">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="nav-btn"
              >
                <FiChevronLeft />
              </button>
              <span className="current-month">
                {months[displayDate.getMonth()]}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="nav-btn"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>

          {/* 요일 헤더 */}
          <div className="weekdays">
            {weekdays.map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>

          {/* 달력 날짜들 */}
          <div className="calendar-dates">
            {calendarDates.map((date, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleDateClick(date)}
                className={`
                  calendar-date
                  ${isToday(date) ? 'today' : ''}
                  ${isSelected(date) ? 'selected' : ''}
                  ${!isCurrentMonth(date) ? 'other-month' : ''}
                `}
              >
                {date.getDate()}
              </button>
            ))}
          </div>

          {/* 닫기 버튼 */}
          <div className="calendar-footer">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="close-btn"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="date-picker-overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default DatePicker;