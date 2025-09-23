import { LocalStorageService } from './storage/localStorage.js';

/**
 * 이벤트 관련 비즈니스 로직을 처리하는 서비스
 */
class EventService {
  constructor() {
    this.storage = new LocalStorageService();
  }

  /**
   * 새 이벤트 생성
   */
  async createEvent(graphId, eventData) {
    const validatedData = this.validateEventData(eventData);
    return await this.storage.createEvent(graphId, validatedData);
  }

  /**
   * 이벤트 업데이트
   */
  async updateEvent(graphId, eventId, updates) {
    const validatedUpdates = this.validateEventData(updates);
    return await this.storage.updateEvent(graphId, eventId, validatedUpdates);
  }

  /**
   * 이벤트 삭제
   */
  async deleteEvent(graphId, eventId) {
    return await this.storage.deleteEvent(graphId, eventId);
  }

  /**
   * 이벤트 순서 변경
   */
  async reorderEvents(graphId, eventIds) {
    try {
      const graph = await this.storage.getGraph(graphId);
      if (!graph) {
        throw new Error('Graph not found');
      }

      // 새로운 순서로 이벤트 정렬
      const reorderedEvents = eventIds.map((id, index) => {
        const event = graph.events.find(e => e.id === id);
        if (!event) {
          throw new Error(`Event ${id} not found`);
        }
        return {
          ...event,
          order: index + 1
        };
      });

      // 그래프 업데이트
      await this.storage.updateGraph(graphId, {
        events: reorderedEvents
      });

      return reorderedEvents;
    } catch (error) {
      console.error('Error reordering events:', error);
      throw error;
    }
  }

  /**
   * 중요도 필터링
   */
  async getEventsByImportance(graphId, minImportance = 1) {
    try {
      const graph = await this.storage.getGraph(graphId);
      if (!graph) {
        return [];
      }

      return graph.events.filter(event => 
        event.importanceRate >= minImportance
      );
    } catch (error) {
      console.error('Error filtering events by importance:', error);
      return [];
    }
  }

  /**
   * 카테고리별 이벤트 조회
   */
  async getEventsByCategory(graphId, category) {
    try {
      const graph = await this.storage.getGraph(graphId);
      if (!graph) {
        return [];
      }

      return graph.events.filter(event => 
        event.category === category
      );
    } catch (error) {
      console.error('Error filtering events by category:', error);
      return [];
    }
  }

  /**
   * 이벤트 데이터 유효성 검사
   */
  validateEventData(data) {
    const validated = { ...data };

    // 제목 검사
    if (validated.title !== undefined) {
      validated.title = String(validated.title).trim();
      if (validated.title.length === 0) {
        validated.title = '새 이벤트';
      }
      if (validated.title.length > 100) {
        validated.title = validated.title.substring(0, 100);
      }
    }

    // 설명 검사
    if (validated.description !== undefined) {
      validated.description = String(validated.description).trim();
      if (validated.description.length > 1000) {
        validated.description = validated.description.substring(0, 1000);
      }
    }

    // 감정 점수 검사
    if (validated.emotionScore !== undefined) {
      validated.emotionScore = Number(validated.emotionScore);
      if (isNaN(validated.emotionScore)) {
        validated.emotionScore = 0;
      }
      validated.emotionScore = Math.max(-10, Math.min(10, validated.emotionScore));
    }

    // 중요도 검사
    if (validated.importanceRate !== undefined) {
      validated.importanceRate = Number(validated.importanceRate);
      if (isNaN(validated.importanceRate)) {
        validated.importanceRate = 3;
      }
      validated.importanceRate = Math.max(1, Math.min(5, validated.importanceRate));
    }

    // 순서 검사
    if (validated.order !== undefined) {
      validated.order = Number(validated.order);
      if (isNaN(validated.order) || validated.order < 1) {
        validated.order = 1;
      }
    }

    // 날짜 검사
    if (validated.date !== undefined && validated.date !== null) {
      const date = new Date(validated.date);
      if (isNaN(date.getTime())) {
        validated.date = null;
      } else {
        validated.date = date.toISOString();
      }
    }

    // 종료 날짜 검사
    if (validated.endDate !== undefined && validated.endDate !== null) {
      const endDate = new Date(validated.endDate);
      if (isNaN(endDate.getTime())) {
        validated.endDate = null;
      } else {
        validated.endDate = endDate.toISOString();
      }
    }

    // 시작일과 종료일 검증
    if (validated.date && validated.endDate) {
      const startDate = new Date(validated.date);
      const endDate = new Date(validated.endDate);
      if (endDate < startDate) {
        validated.endDate = null; // 종료일이 시작일보다 빠르면 제거
      }
    }

    // 카테고리 검사
    if (validated.category !== undefined) {
      validated.category = String(validated.category).trim();
      if (validated.category.length === 0) {
        validated.category = '기타';
      }
    }

    // 색상 검사
    if (validated.color !== undefined) {
      validated.color = String(validated.color).trim();
      if (!/^#[0-9A-F]{6}$/i.test(validated.color)) {
        validated.color = '#4CAF50'; // 기본 색상
      }
    }

    return validated;
  }

  /**
   * 이벤트를 시간순으로 정렬
   */
  sortEventsByTime(events) {
    return [...events].sort((a, b) => {
      // 날짜가 있는 이벤트를 우선적으로 정렬
      if (a.date && b.date) {
        return new Date(a.date) - new Date(b.date);
      }
      if (a.date && !b.date) return -1;
      if (!a.date && b.date) return 1;
      
      // 날짜가 모두 없으면 순서로 정렬
      return a.order - b.order;
    });
  }

  /**
   * 이벤트를 순서대로 정렬
   */
  sortEventsByOrder(events) {
    return [...events].sort((a, b) => a.order - b.order);
  }
}

export const eventService = new EventService();