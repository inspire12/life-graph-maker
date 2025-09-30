import { useState, useEffect, useRef } from 'react';
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
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    if (value && !isTyping) {
      const date = new Date(value);
      setSelectedDate(date);
      setDisplayDate(date);
      // 초기값이 YYYY-MM-DD 형식이면 그대로 유지, 아니면 포맷팅
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        setInputValue(value); // YYYY-MM-DD 형식 그대로 유지
      } else {
        setInputValue(formatDisplayValue(date, true)); // 간결한 형식 사용
      }
    } else if (!value && !isTyping) {
      setInputValue('');
      setSelectedDate(null);
    }
  }, [value, isTyping]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

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
    setInputValue(formatDisplayValue(date));
    onChange(dateString);
    setIsOpen(false);
    setIsTyping(false);
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

  const formatDisplayValue = (date = selectedDate, useShortFormat = false) => {
    if (!date) return '';
    
    if (useShortFormat) {
      // 간결한 형식 (YYYY-MM-DD)
      return date.toISOString().split('T')[0];
    }
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 키보드 입력 처리
  const handleInputChange = (e) => {
    const input = e.target.value;
    setInputValue(input);
    setIsTyping(true);

    // 기존 디바운스 타이머 클리어
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // 입력이 비어있으면 즉시 null로 설정
    if (!input.trim()) {
      setSelectedDate(null);
      onChange('');
      return;
    }

    // 즉시 파싱 시도 (유효한 날짜라면 바로 적용)
    const parsedDate = parseInputDate(input);
    if (parsedDate && !isNaN(parsedDate.getTime())) {
      setSelectedDate(parsedDate);
      setDisplayDate(parsedDate);
      const dateString = parsedDate.toISOString().split('T')[0];
      onChange(dateString);
    } else {
      // 파싱에 실패하면 디바운스 후 재시도
      debounceTimeoutRef.current = setTimeout(() => {
        const finalParsedDate = parseInputDate(input);
        if (finalParsedDate && !isNaN(finalParsedDate.getTime())) {
          setSelectedDate(finalParsedDate);
          setDisplayDate(finalParsedDate);
          const dateString = finalParsedDate.toISOString().split('T')[0];
          onChange(dateString);
          setInputValue(formatDisplayValue(finalParsedDate, true));
        }
      }, 800); // 800ms 후 재시도
    }
  };

  // 입력된 문자열을 날짜로 파싱
  const parseInputDate = (input) => {
    // 공백 제거
    input = input.trim();
    if (!input) return null;

    // 다양한 형식 지원
    const formats = [
      // YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
      /^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/,
      // MM-DD-YYYY, MM/DD/YYYY, MM.DD.YYYY  
      /^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/,
      // YYYYMMDD (8자리 숫자)
      /^(\d{4})(\d{2})(\d{2})$/,
      // MM-DD, MM/DD (현재 년도로 가정)
      /^(\d{1,2})[-\/.](\d{1,2})$/,
      // DD-MM-YYYY, DD/MM/YYYY (유럽식, 일이 먼저) - 제거하고 대신 아래 추가
      // YYYY (년도만, 1월 1일로 설정)
      /^(\d{4})$/,
      // MM (월만, 현재 년도 1일로 설정)
      /^(\d{1,2})$/,
      // YYYY-MM (년-월, 해당 월 1일로 설정)
      /^(\d{4})[-\/.](\d{1,2})$/,
      // 한국식 날짜 입력 (예: 2024년 1월 15일, 1월 15일, 15일)
      /^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일?$/,
      /^(\d{1,2})월\s*(\d{1,2})일?$/,
      /^(\d{1,2})일$/
    ];

    for (let i = 0; i < formats.length; i++) {
      const match = input.match(formats[i]);
      if (match) {
        let year, month, day;
        const currentYear = new Date().getFullYear();
        
        switch (i) {
          case 0: case 2: // YYYY-MM-DD, YYYYMMDD 형식
            year = parseInt(match[1]);
            month = parseInt(match[2]) - 1; // 0-based month
            day = parseInt(match[3]);
            break;
          case 1: // MM-DD-YYYY 형식
            month = parseInt(match[1]) - 1;
            day = parseInt(match[2]);
            year = parseInt(match[3]);
            break;
          case 3: // MM-DD (현재 년도)
            month = parseInt(match[1]) - 1;
            day = parseInt(match[2]);
            year = currentYear;
            break;
          case 4: // YYYY (년도만)
            year = parseInt(match[1]);
            month = 0; // 1월
            day = 1;
            break;
          case 5: // MM (월만)
            year = currentYear;
            month = parseInt(match[1]) - 1;
            day = 1;
            break;
          case 6: // YYYY-MM (년-월)
            year = parseInt(match[1]);
            month = parseInt(match[2]) - 1;
            day = 1;
            break;
          case 7: // YYYY년 MM월 DD일
            year = parseInt(match[1]);
            month = parseInt(match[2]) - 1;
            day = parseInt(match[3]);
            break;
          case 8: // MM월 DD일 (현재 년도)
            year = currentYear;
            month = parseInt(match[1]) - 1;
            day = parseInt(match[2]);
            break;
          case 9: // DD일 (현재 년도, 월)
            year = currentYear;
            month = new Date().getMonth(); // 현재 월
            day = parseInt(match[1]);
            break;
        }

        // 날짜 유효성 검증
        if (month >= 0 && month <= 11 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
          day = day + 1
          const date = new Date(year, month, day);
          if (date.getFullYear() === year && 
              date.getMonth() === month && 
              date.getDate() === day) {
            return date;
          }
        }
      }
    }

    // 자연어 처리 확장
    const today = new Date();
    const lowerInput = input.toLowerCase().trim();
    
    // 기본 자연어
    if (lowerInput === '오늘' || lowerInput === 'today') {
      return today;
    } else if (lowerInput === '어제' || lowerInput === 'yesterday') {
      return new Date(today.getTime() - 24 * 60 * 60 * 1000);
    } else if (lowerInput === '내일' || lowerInput === 'tomorrow') {
      return new Date(today.getTime() + 24 * 60 * 60 * 1000);
    }
    
    // 상대적 날짜 표현
    const relativePatterns = [
      // "3일전", "5일 전", "10일전"
      /^(\d+)일\s*전$/,
      // "2주전", "1주 전" 
      /^(\d+)주\s*전$/,
      // "1개월전", "3개월 전"
      /^(\d+)개월\s*전$/,
      // "1년전", "2년 전"  
      /^(\d+)년\s*전$/,
      // "3일후", "5일 후"
      /^(\d+)일\s*후$/,
      // "2주후", "1주 후"
      /^(\d+)주\s*후$/,
    ];
    
    for (let i = 0; i < relativePatterns.length; i++) {
      const match = lowerInput.match(relativePatterns[i]);
      if (match) {
        const num = parseInt(match[1]);
        const result = new Date(today);
        
        switch (i) {
          case 0: // 일 전
            result.setDate(result.getDate() - num);
            break;
          case 1: // 주 전
            result.setDate(result.getDate() - (num * 7));
            break;
          case 2: // 개월 전
            result.setMonth(result.getMonth() - num);
            break;
          case 3: // 년 전
            result.setFullYear(result.getFullYear() - num);
            break;
          case 4: // 일 후
            result.setDate(result.getDate() + num);
            break;
          case 5: // 주 후
            result.setDate(result.getDate() + (num * 7));
            break;
        }
        
        return result;
      }
    }

    return null;
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const parsedDate = parseInputDate(inputValue);
      if (parsedDate) {
        setSelectedDate(parsedDate);
        setDisplayDate(parsedDate);
        const dateString = parsedDate.toISOString().split('T')[0];
        onChange(dateString);
        // 엔터 시에는 간결한 YYYY-MM-DD 형식으로 표시
        setInputValue(formatDisplayValue(parsedDate, true));
      }
      setIsOpen(false);
      setIsTyping(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setIsTyping(false);
    }
  };

  const handleInputFocus = () => {
    setIsTyping(true);
  };

  const handleInputBlur = () => {
    // 약간의 지연을 두어 달력 클릭이 처리되도록 함
    setTimeout(() => {
      setIsTyping(false);
      // 블러 시에도 입력된 값이 유효하면 최종 적용
      if (inputValue.trim()) {
        const parsedDate = parseInputDate(inputValue);
        if (parsedDate && !isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
          setDisplayDate(parsedDate);
          const dateString = parsedDate.toISOString().split('T')[0];
          onChange(dateString);
          setInputValue(formatDisplayValue(parsedDate, true));
        }
      }
    }, 200);
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
    { label: '3일 전', value: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { label: '1주일 전', value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    { label: '1개월 전', value: new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()) },
    { label: '3개월 전', value: new Date(new Date().getFullYear(), new Date().getMonth() - 3, new Date().getDate()) },
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
          value={inputValue}
          placeholder={`${placeholder} (예: 2024-01-15, 01/15, 오늘, 3일전)`}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onClick={() => !isTyping && setIsOpen(!isOpen)}
          className="date-picker-input"
          required={required}
          title="다양한 형식으로 입력 가능: 2024-01-15, 01/15/2024, 01-15, 20240115, 2024, 오늘, 어제, 3일전, 1주전, 1개월전, 1년전 등"
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