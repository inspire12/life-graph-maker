/**
 * Storage 추상화 인터페이스
 * localStorage와 API 구현체를 통일된 인터페이스로 제공
 */
export class StorageService {
  /**
   * 모든 그래프 조회
   * @returns {Promise<Array>} 그래프 목록
   */
  async getGraphs() {
    throw new Error('getGraphs method must be implemented');
  }

  /**
   * 특정 그래프 조회
   * @param {string} id - 그래프 ID
   * @returns {Promise<Object|null>} 그래프 객체
   */
  async getGraph(id) {
    throw new Error('getGraph method must be implemented');
  }

  /**
   * 새 그래프 생성
   * @param {Object} graphData - 그래프 데이터
   * @returns {Promise<Object>} 생성된 그래프
   */
  async createGraph(graphData) {
    throw new Error('createGraph method must be implemented');
  }

  /**
   * 그래프 수정
   * @param {string} id - 그래프 ID
   * @param {Object} updates - 수정할 데이터
   * @returns {Promise<Object>} 수정된 그래프
   */
  async updateGraph(id, updates) {
    throw new Error('updateGraph method must be implemented');
  }

  /**
   * 그래프 삭제
   * @param {string} id - 그래프 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deleteGraph(id) {
    throw new Error('deleteGraph method must be implemented');
  }

  /**
   * 새 이벤트 생성
   * @param {string} graphId - 그래프 ID
   * @param {Object} eventData - 이벤트 데이터
   * @returns {Promise<Object>} 생성된 이벤트
   */
  async createEvent(graphId, eventData) {
    throw new Error('createEvent method must be implemented');
  }

  /**
   * 이벤트 수정
   * @param {string} graphId - 그래프 ID
   * @param {string} eventId - 이벤트 ID
   * @param {Object} updates - 수정할 데이터
   * @returns {Promise<Object>} 수정된 이벤트
   */
  async updateEvent(graphId, eventId, updates) {
    throw new Error('updateEvent method must be implemented');
  }

  /**
   * 이벤트 삭제
   * @param {string} graphId - 그래프 ID
   * @param {string} eventId - 이벤트 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deleteEvent(graphId, eventId) {
    throw new Error('deleteEvent method must be implemented');
  }

  /**
   * 모든 데이터 초기화
   * @returns {Promise<boolean>} 초기화 성공 여부
   */
  async clearAllData() {
    throw new Error('clearAllData method must be implemented');
  }

  /**
   * 데이터 내보내기
   * @returns {Promise<Object>} 전체 데이터
   */
  async exportData() {
    throw new Error('exportData method must be implemented');
  }

  /**
   * 데이터 가져오기
   * @param {Object} data - 가져올 데이터
   * @returns {Promise<boolean>} 가져오기 성공 여부
   */
  async importData(data) {
    throw new Error('importData method must be implemented');
  }
}