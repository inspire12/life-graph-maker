/**
 * 이미지 처리 관련 유틸리티 함수들
 */

/**
 * 파일을 base64 문자열로 변환
 * @param {File} file - 변환할 파일
 * @returns {Promise<string>} base64 문자열
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

/**
 * 이미지 파일 유효성 검사
 * @param {File} file - 검사할 파일
 * @returns {Object} { isValid: boolean, error?: string }
 */
export function validateImageFile(file) {
  // 파일 타입 검사
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'JPG, PNG, GIF, WebP 형식의 이미지만 업로드 가능합니다.'
    };
  }

  // 파일 크기 검사 (5MB 제한)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: '이미지 크기는 5MB 이하여야 합니다.'
    };
  }

  return { isValid: true };
}

/**
 * 이미지 리사이징 (Canvas 사용)
 * @param {File} file - 원본 이미지 파일
 * @param {number} maxWidth - 최대 너비
 * @param {number} maxHeight - 최대 높이
 * @param {number} quality - 품질 (0-1)
 * @returns {Promise<string>} 리사이징된 base64 문자열
 */
export function resizeImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 비율 계산
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // 캔버스 크기 설정
      canvas.width = width;
      canvas.height = height;

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, width, height);

      // base64 변환
      const resizedBase64 = canvas.toDataURL(file.type, quality);
      resolve(resizedBase64);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * base64 문자열에서 파일 크기 계산 (대략값)
 * @param {string} base64String - base64 문자열
 * @returns {number} 바이트 단위 크기
 */
export function getBase64Size(base64String) {
  if (!base64String) return 0;
  
  // data:image/jpeg;base64, 부분 제거
  const base64Data = base64String.split(',')[1] || base64String;
  
  // base64 디코딩된 크기 계산
  const padding = (base64Data.match(/=/g) || []).length;
  return (base64Data.length * 3) / 4 - padding;
}

/**
 * 이미지 미리보기 URL 생성
 * @param {string} base64String - base64 문자열
 * @returns {string} 미리보기 URL
 */
export function createPreviewUrl(base64String) {
  return base64String;
}