import { LocalStorageService } from './storage/localStorage.js';

/**
 * 그래프 관련 비즈니스 로직을 처리하는 서비스
 */
class GraphService {
  constructor() {
    this.storage = new LocalStorageService();
  }

  /**
   * 모든 그래프 목록 조회
   */
  async getAllGraphs() {
    return await this.storage.getGraphs();
  }

  /**
   * 특정 그래프 조회
   */
  async getGraphById(id) {
    return await this.storage.getGraph(id);
  }

  /**
   * 새 그래프 생성
   */
  async createGraph(graphData) {
    const validatedData = this.validateGraphData(graphData);
    return await this.storage.createGraph(validatedData);
  }

  /**
   * 그래프 정보 업데이트
   */
  async updateGraph(id, updates) {
    const validatedUpdates = this.validateGraphData(updates);
    return await this.storage.updateGraph(id, validatedUpdates);
  }

  /**
   * 그래프 삭제
   */
  async deleteGraph(id) {
    return await this.storage.deleteGraph(id);
  }

  /**
   * 그래프 복사
   */
  async duplicateGraph(id) {
    const originalGraph = await this.storage.getGraph(id);
    if (!originalGraph) {
      throw new Error('Graph not found');
    }

    const duplicatedGraph = {
      ...originalGraph,
      title: `${originalGraph.title} (복사본)`,
      events: originalGraph.events.map(event => ({
        ...event,
        id: undefined // 새로운 ID가 생성되도록
      }))
    };

    delete duplicatedGraph.id; // 새로운 ID가 생성되도록
    return await this.storage.createGraph(duplicatedGraph);
  }

  /**
   * 그래프 데이터 유효성 검사
   */
  validateGraphData(data) {
    const validated = { ...data };

    // 제목 검사
    if (validated.title !== undefined) {
      validated.title = String(validated.title).trim();
      if (validated.title.length === 0) {
        validated.title = '새 그래프';
      }
      if (validated.title.length > 100) {
        validated.title = validated.title.substring(0, 100);
      }
    }

    // 설명 검사
    if (validated.description !== undefined) {
      validated.description = String(validated.description).trim();
      if (validated.description.length > 500) {
        validated.description = validated.description.substring(0, 500);
      }
    }

    return validated;
  }

  /**
   * 그래프 통계 정보 계산
   */
  async getGraphStats(id) {
    const graph = await this.storage.getGraph(id);
    if (!graph) {
      return null;
    }

    const events = graph.events || [];
    const stats = {
      totalEvents: events.length,
      averageEmotion: 0,
      highestEmotion: Number.MIN_SAFE_INTEGER,
      lowestEmotion: Number.MAX_SAFE_INTEGER,
      categoryCounts: {},
      importanceDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    if (events.length === 0) {
      return stats;
    }

    let emotionSum = 0;
    
    events.forEach(event => {
      // 감정 점수 통계
      emotionSum += event.emotionScore;
      stats.highestEmotion = Math.max(stats.highestEmotion, event.emotionScore);
      stats.lowestEmotion = Math.min(stats.lowestEmotion, event.emotionScore);

      // 카테고리 통계
      const category = event.category || '기타';
      stats.categoryCounts[category] = (stats.categoryCounts[category] || 0) + 1;

      // 중요도 분포
      const importance = event.importanceRate || 3;
      if (importance >= 1 && importance <= 5) {
        stats.importanceDistribution[importance]++;
      }
    });

    stats.averageEmotion = emotionSum / events.length;

    return stats;
  }
}

export const graphService = new GraphService();