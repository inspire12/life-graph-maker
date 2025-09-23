// 감정 점수에 따른 색상 계산 유틸리티

/**
 * 감정 점수(-10 ~ +10)를 기반으로 색상을 생성
 * @param {number} emotionScore - 감정 점수 (-10 ~ +10)
 * @returns {string} HEX 색상 코드
 */
export function getEmotionColor(emotionScore) {
  // 점수를 0~1 범위로 정규화 (-10 → 0, 0 → 0.5, +10 → 1)
  const normalizedScore = (emotionScore + 10) / 20;
  
  // 색상 포인트 정의 (HSL 색상환 기준)
  const colorPoints = [
    { score: 0,    hue: 0,   saturation: 80, lightness: 45 }, // 매우 부정적: 빨간색
    { score: 0.15, hue: 15,  saturation: 85, lightness: 50 }, // 부정적: 주황빨강
    { score: 0.3,  hue: 30,  saturation: 75, lightness: 55 }, // 약간 부정적: 주황색
    { score: 0.45, hue: 45,  saturation: 65, lightness: 60 }, // 중립 부정: 황색
    { score: 0.5,  hue: 60,  saturation: 30, lightness: 65 }, // 중립: 회색빛 황색
    { score: 0.55, hue: 80,  saturation: 45, lightness: 60 }, // 중립 긍정: 연두색
    { score: 0.7,  hue: 100, saturation: 60, lightness: 55 }, // 약간 긍정적: 초록색
    { score: 0.85, hue: 150, saturation: 70, lightness: 50 }, // 긍정적: 청록색
    { score: 1,    hue: 200, saturation: 80, lightness: 45 }, // 매우 긍정적: 파란색
  ];
  
  // 현재 점수에 맞는 색상 구간 찾기
  let lowerPoint = colorPoints[0];
  let upperPoint = colorPoints[colorPoints.length - 1];
  
  for (let i = 0; i < colorPoints.length - 1; i++) {
    if (normalizedScore >= colorPoints[i].score && normalizedScore <= colorPoints[i + 1].score) {
      lowerPoint = colorPoints[i];
      upperPoint = colorPoints[i + 1];
      break;
    }
  }
  
  // 두 색상 포인트 사이에서 보간
  const range = upperPoint.score - lowerPoint.score;
  const ratio = range === 0 ? 0 : (normalizedScore - lowerPoint.score) / range;
  
  const hue = Math.round(lowerPoint.hue + (upperPoint.hue - lowerPoint.hue) * ratio);
  const saturation = Math.round(lowerPoint.saturation + (upperPoint.saturation - lowerPoint.saturation) * ratio);
  const lightness = Math.round(lowerPoint.lightness + (upperPoint.lightness - lowerPoint.lightness) * ratio);
  
  return hslToHex(hue, saturation, lightness);
}

/**
 * HSL 값을 HEX 색상 코드로 변환
 * @param {number} h - 색조 (0-360)
 * @param {number} s - 채도 (0-100)
 * @param {number} l - 명도 (0-100)
 * @returns {string} HEX 색상 코드
 */
function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * 감정 점수에 따른 색상 설명 반환
 * @param {number} emotionScore - 감정 점수 (-10 ~ +10)
 * @returns {string} 색상에 대한 설명
 */
export function getEmotionColorDescription(emotionScore) {
  if (emotionScore >= 8) return '매우 긍정적 (깊은 파란색)';
  if (emotionScore >= 5) return '긍정적 (청록색)';
  if (emotionScore >= 2) return '약간 긍정적 (초록색)';
  if (emotionScore >= -1) return '중립 (황색/연두색)';
  if (emotionScore >= -4) return '약간 부정적 (주황색)';
  if (emotionScore >= -7) return '부정적 (주황빨강)';
  return '매우 부정적 (빨간색)';
}

/**
 * 미리 정의된 감정 점수별 색상 샘플
 */
export const emotionColorSamples = [
  { score: -10, color: getEmotionColor(-10), label: '매우 부정적' },
  { score: -7, color: getEmotionColor(-7), label: '부정적' },
  { score: -4, color: getEmotionColor(-4), label: '약간 부정적' },
  { score: -1, color: getEmotionColor(-1), label: '약간 부정적' },
  { score: 0, color: getEmotionColor(0), label: '중립' },
  { score: 1, color: getEmotionColor(1), label: '약간 긍정적' },
  { score: 4, color: getEmotionColor(4), label: '약간 긍정적' },
  { score: 7, color: getEmotionColor(7), label: '긍정적' },
  { score: 10, color: getEmotionColor(10), label: '매우 긍정적' },
];