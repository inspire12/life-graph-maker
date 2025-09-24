// Import/Export 유틸리티 함수들

/**
 * 그래프 데이터를 JSON 형식으로 내보내기
 */
export const exportToJson = (graph) => {
  const exportData = {
    title: graph.title,
    description: graph.description,
    createdAt: graph.createdAt,
    updatedAt: new Date().toISOString(),
    events: graph.events || [],
    exportedAt: new Date().toISOString(),
    version: "1.0.0"
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${graph.title || 'life-graph'}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 그래프 데이터를 CSV 형식으로 내보내기 (Excel에서 열 수 있음)
 */
export const exportToCsv = (graph) => {
  const csvHeader = [
    'Title',
    'Description', 
    'Date',
    'End Date',
    'Emotion Score',
    'Importance Rate',
    'Category',
    'Color',
    'Created At'
  ];

  const csvRows = graph.events?.map(event => [
    `"${event.title || ''}"`,
    `"${event.description || ''}"`,
    event.date || '',
    event.endDate || '',
    event.emotionScore || 0,
    event.importanceRate || 3,
    `"${event.category || ''}"`,
    event.color || '',
    event.createdAt || ''
  ]) || [];

  const csvContent = [
    csvHeader.join(','),
    ...csvRows.map(row => row.join(','))
  ].join('\n');

  // BOM 추가로 Excel에서 한글 깨짐 방지
  const BOM = '\uFEFF';
  const csvBlob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(csvBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${graph.title || 'life-graph'}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * JSON 파일을 가져와서 그래프 데이터로 변환
 */
export const importFromJson = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // 기본적인 유효성 검사
        if (!importedData || typeof importedData !== 'object') {
          throw new Error('유효하지 않은 JSON 형식입니다.');
        }

        // 필수 필드 검사 및 기본값 설정
        const graphData = {
          title: importedData.title || '가져온 그래프',
          description: importedData.description || '',
          events: Array.isArray(importedData.events) ? importedData.events.map((event, index) => ({
            id: event.id || `imported-${Date.now()}-${index}`,
            title: event.title || '제목 없음',
            description: event.description || '',
            date: event.date || new Date().toISOString().split('T')[0],
            endDate: event.endDate || null,
            emotionScore: typeof event.emotionScore === 'number' ? event.emotionScore : 0,
            importanceRate: typeof event.importanceRate === 'number' ? event.importanceRate : 3,
            category: event.category || '기타',
            color: event.color || '#2196F3',
            image: event.image || null,
            createdAt: event.createdAt || new Date().toISOString()
          })) : [],
          createdAt: importedData.createdAt || new Date().toISOString()
        };

        resolve(graphData);
      } catch (error) {
        reject(new Error(`JSON 파싱 오류: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * CSV 파일을 가져와서 그래프 데이터로 변환
 */
export const importFromCsv = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const lines = csvText.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('CSV 파일에 데이터가 없습니다.');
        }

        // 헤더 건너뛰고 데이터 파싱
        const events = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // CSV 파싱 (간단한 구현, 복잡한 케이스는 라이브러리 사용 고려)
          const values = line.split(',').map(val => val.replace(/^"(.*)"$/, '$1').trim());
          
          if (values.length >= 8) {
            events.push({
              id: `csv-imported-${Date.now()}-${i}`,
              title: values[0] || '제목 없음',
              description: values[1] || '',
              date: values[2] || new Date().toISOString().split('T')[0],
              endDate: values[3] || null,
              emotionScore: parseInt(values[4]) || 0,
              importanceRate: parseInt(values[5]) || 3,
              category: values[6] || '기타',
              color: values[7] || '#2196F3',
              createdAt: values[8] || new Date().toISOString(),
              image: null
            });
          }
        }

        const graphData = {
          title: '가져온 CSV 그래프',
          description: `CSV 파일에서 ${events.length}개 이벤트를 가져왔습니다.`,
          events: events,
          createdAt: new Date().toISOString()
        };

        resolve(graphData);
      } catch (error) {
        reject(new Error(`CSV 파싱 오류: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * 파일 유형 확인
 */
export const getFileType = (file) => {
  const extension = file.name.toLowerCase().split('.').pop();
  const mimeType = file.type.toLowerCase();
  
  if (extension === 'json' || mimeType === 'application/json') {
    return 'json';
  } else if (extension === 'csv' || mimeType === 'text/csv') {
    return 'csv';
  }
  
  return null;
};

/**
 * 가져오기 파일 유효성 검사
 */
export const validateImportFile = (file) => {
  if (!file) {
    throw new Error('파일을 선택해주세요.');
  }
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('파일 크기가 너무 큽니다. (최대 10MB)');
  }
  
  const fileType = getFileType(file);
  if (!fileType) {
    throw new Error('지원하지 않는 파일 형식입니다. JSON 또는 CSV 파일만 업로드 가능합니다.');
  }
  
  return fileType;
};