import { useEffect, useRef } from 'react';

function AnimatedPath({ data, xScale, yScale, animate = true }) {
  const pathRef = useRef(null);

  useEffect(() => {
    if (!animate || !pathRef.current || data.length < 2) return;

    const path = pathRef.current;
    const pathLength = path.getTotalLength();
    
    // 초기 상태: 보이지 않음
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;
    
    // 애니메이션: 라인이 그려짐
    const animation = path.animate([
      { strokeDashoffset: pathLength },
      { strokeDashoffset: 0 }
    ], {
      duration: 1000,
      easing: 'ease-out',
      fill: 'forwards'
    });

    return () => {
      if (animation) {
        animation.cancel();
      }
    };
  }, [data, animate]);

  if (data.length < 2) return null;

  // SVG 패스 생성
  const createPath = () => {
    if (!xScale || !yScale) return '';

    let path = '';
    data.forEach((point, index) => {
      const x = xScale(point.timestamp || point.order);
      const y = yScale(point.emotionScore);
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    
    return path;
  };

  return (
    <path
      ref={pathRef}
      d={createPath()}
      fill="none"
      stroke="#64B5F6"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

export default AnimatedPath;