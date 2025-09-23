import { format, parseISO, differenceInDays } from 'date-fns';
import { getEmotionColor } from './colorHelpers';

/**
 * 이벤트를 그래프 데이터로 변환
 */
export function prepareGraphData(events, viewMode = 'timeline') {
  if (!events || events.length === 0) {
    return [];
  }

  if (viewMode === 'timeline') {
    return prepareTimelineData(events);
  } else {
    return prepareSequenceData(events);
  }
}

/**
 * 시간순 그래프 데이터 준비
 */
function prepareTimelineData(events) {
  // 모든 이벤트가 이제 날짜를 가지므로 바로 시간순 정렬
  const timelineEvents = events
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (timelineEvents.length === 0) {
    return [];
  }

  const graphData = [];

  timelineEvents.forEach((event, index) => {
    const eventDate = new Date(event.date);
    
    // 기본 포인트 추가
    const dataPoint = {
      id: event.id,
      date: eventDate,
      dateFormatted: format(eventDate, 'yyyy-MM-dd'),
      displayDate: format(eventDate, 'yyyy.MM'),
      timestamp: eventDate.getTime(),
      emotionScore: event.emotionScore,
      title: event.title,
      description: event.description,
      category: event.category,
      color: event.color || getEmotionColor(event.emotionScore),
      importanceRate: event.importanceRate,
      isStart: true,
      originalEvent: event
    };

    graphData.push(dataPoint);

    // 종료 날짜가 있는 경우 종료 포인트도 추가
    if (event.endDate) {
      const endDate = new Date(event.endDate);
      const endPoint = {
        ...dataPoint,
        id: `${event.id}_end`,
        date: endDate,
        dateFormatted: format(endDate, 'yyyy-MM-dd'),
        displayDate: format(endDate, 'yyyy.MM'),
        timestamp: endDate.getTime(),
        title: `${event.title} (종료)`,
        isStart: false,
        isEnd: true
      };

      graphData.push(endPoint);
    }
  });

  // 시간순으로 정렬
  return graphData.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * 이벤트 순서 그래프 데이터 준비
 */
function prepareSequenceData(events) {
  // 순서대로 정렬
  const sortedEvents = [...events].sort((a, b) => a.order - b.order);

  return sortedEvents.map((event, index) => ({
    id: event.id,
    order: index + 1,
    emotionScore: event.emotionScore,
    title: event.title,
    description: event.description,
    category: event.category,
    color: event.color || getEmotionColor(event.emotionScore),
    importanceRate: event.importanceRate,
    date: event.date ? new Date(event.date) : null,
    dateFormatted: event.date ? format(new Date(event.date), 'yyyy-MM-dd') : '',
    displayDate: event.date ? format(new Date(event.date), 'yyyy.MM') : `${index + 1}번째`,
    originalEvent: event
  }));
}

/**
 * 그래프의 X축 범위 계산
 */
export function calculateXAxisDomain(data, viewMode = 'timeline') {
  if (!data || data.length === 0) {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1).getTime();
    const endOfYear = new Date(currentYear, 11, 31).getTime();
    return viewMode === 'timeline' ? [startOfYear, endOfYear] : [0, 10];
  }

  if (viewMode === 'timeline') {
    const dates = data.map(d => d.date);
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // 시작 년도의 1월 1일부터 끝 년도의 12월 31일까지
    const startYear = minDate.getFullYear();
    const endYear = maxDate.getFullYear();
    
    const startOfRange = new Date(startYear, 0, 1).getTime();
    const endOfRange = new Date(endYear, 11, 31).getTime();
    
    return [startOfRange, endOfRange];
  } else {
    return [0, data.length + 1];
  }
}

/**
 * 그래프의 Y축 범위 계산
 */
export function calculateYAxisDomain(data) {
  if (!data || data.length === 0) {
    return [-10, 10];
  }

  const emotionScores = data.map(d => d.emotionScore);
  const min = Math.min(...emotionScores);
  const max = Math.max(...emotionScores);

  // Y축을 -10 ~ +10 범위로 고정하되, 데이터에 따라 조정
  const minY = Math.min(-10, min - 1);
  const maxY = Math.max(10, max + 1);

  return [minY, maxY];
}

/**
 * X축 틱 포맷터
 */
export function formatXAxisTick(value, viewMode = 'timeline') {
  if (viewMode === 'timeline') {
    const date = new Date(value);
    return format(date, 'yyyy');
  } else {
    return value.toString();
  }
}

/**
 * X축 틱 배열 생성 (년도별)
 */
export function generateXAxisTicks(domain, viewMode = 'timeline') {
  if (viewMode !== 'timeline') return [];
  
  const [start, end] = domain;
  const startYear = new Date(start).getFullYear();
  const endYear = new Date(end).getFullYear();
  
  const ticks = [];
  for (let year = startYear; year <= endYear; year++) {
    ticks.push(new Date(year, 0, 1).getTime());
  }
  
  return ticks;
}

/**
 * 툴팁 내용 포맷터
 */
export function formatTooltipContent(data, viewMode = 'timeline') {
  if (!data) return null;

  const xLabel = viewMode === 'timeline' 
    ? data.displayDate 
    : `${data.order}번째 이벤트`;

  return {
    title: data.title,
    date: xLabel,
    emotion: `감정 점수: ${data.emotionScore > 0 ? '+' : ''}${data.emotionScore}`,
    importance: `중요도: ${'★'.repeat(data.importanceRate)}`,
    category: `카테고리: ${data.category}`,
    description: data.description
  };
}

/**
 * 이벤트 클러스터링 (같은 날짜의 이벤트들을 그룹화)
 */
export function clusterEventsByDate(data, viewMode = 'timeline') {
  if (viewMode !== 'timeline') return data;

  const clusters = new Map();

  data.forEach(point => {
    const dateKey = point.dateFormatted;
    if (!clusters.has(dateKey)) {
      clusters.set(dateKey, []);
    }
    clusters.get(dateKey).push(point);
  });

  // 같은 날짜에 여러 이벤트가 있는 경우 Y축 오프셋 적용
  const clusteredData = [];
  
  clusters.forEach(points => {
    if (points.length === 1) {
      clusteredData.push(points[0]);
    } else {
      // 여러 이벤트가 같은 날짜에 있는 경우 약간씩 Y축을 조정
      points.forEach((point, index) => {
        const offset = (index - (points.length - 1) / 2) * 0.5;
        clusteredData.push({
          ...point,
          emotionScore: point.emotionScore + offset,
          originalEmotionScore: point.emotionScore
        });
      });
    }
  });

  return clusteredData;
}