import { v4 as uuidv4 } from 'uuid';
import { StorageService } from './index.js';

/**
 * localStorage 기반 Storage 구현체
 */
export class LocalStorageService extends StorageService {
  constructor() {
    super();
    this.storageKey = 'life-graphs-data';
    this.initializeStorage();
  }

  /**
   * 스토리지 초기화
   */
  initializeStorage() {
    const existingData = localStorage.getItem(this.storageKey);
    if (!existingData) {
      const initialData = {
        graphs: [],
        settings: {
          defaultViewMode: 'timeline',
          theme: 'book',
          autoSaveInterval: 30000
        }
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }
  }

  /**
   * 스토리지에서 데이터 읽기
   */
  getData() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  /**
   * 스토리지에 데이터 저장
   */
  saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  /**
   * 모든 그래프 조회
   */
  async getGraphs() {
    try {
      const data = this.getData();
      return data?.graphs || [];
    } catch (error) {
      console.error('Error getting graphs:', error);
      return [];
    }
  }

  /**
   * 특정 그래프 조회
   */
  async getGraph(id) {
    try {
      const data = this.getData();
      const graph = data?.graphs?.find(g => g.id === id);
      return graph || null;
    } catch (error) {
      console.error('Error getting graph:', error);
      return null;
    }
  }

  /**
   * 새 그래프 생성
   */
  async createGraph(graphData) {
    try {
      const data = this.getData();
      const newGraph = {
        id: uuidv4(),
        title: graphData.title || '새 그래프',
        description: graphData.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        events: graphData.events || []
      };

      // 이벤트가 있는 경우 각 이벤트에 새로운 ID 할당
      if (newGraph.events.length > 0) {
        newGraph.events = newGraph.events.map(event => ({
          ...event,
          id: uuidv4()
        }));
      }

      data.graphs.push(newGraph);
      this.saveData(data);
      return newGraph;
    } catch (error) {
      console.error('Error creating graph:', error);
      throw error;
    }
  }

  /**
   * 그래프 수정
   */
  async updateGraph(id, updates) {
    try {
      const data = this.getData();
      const graphIndex = data.graphs.findIndex(g => g.id === id);
      
      if (graphIndex === -1) {
        throw new Error('Graph not found');
      }

      data.graphs[graphIndex] = {
        ...data.graphs[graphIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.saveData(data);
      return data.graphs[graphIndex];
    } catch (error) {
      console.error('Error updating graph:', error);
      throw error;
    }
  }

  /**
   * 그래프 삭제
   */
  async deleteGraph(id) {
    try {
      const data = this.getData();
      const graphIndex = data.graphs.findIndex(g => g.id === id);
      
      if (graphIndex === -1) {
        return false;
      }

      data.graphs.splice(graphIndex, 1);
      this.saveData(data);
      return true;
    } catch (error) {
      console.error('Error deleting graph:', error);
      return false;
    }
  }

  /**
   * 새 이벤트 생성
   */
  async createEvent(graphId, eventData) {
    try {
      const data = this.getData();
      const graphIndex = data.graphs.findIndex(g => g.id === graphId);
      
      if (graphIndex === -1) {
        throw new Error('Graph not found');
      }

      const newEvent = {
        id: uuidv4(),
        title: eventData.title || '새 이벤트',
        description: eventData.description || '',
        date: eventData.date || null,
        endDate: eventData.endDate || null,
        order: eventData.order || data.graphs[graphIndex].events.length + 1,
        emotionScore: eventData.emotionScore || 0,
        importanceRate: eventData.importanceRate || 3,
        category: eventData.category || '성취',
        color: eventData.color || '#4CAF50',
        image: eventData.image || null
      };

      data.graphs[graphIndex].events.push(newEvent);
      data.graphs[graphIndex].updatedAt = new Date().toISOString();
      
      this.saveData(data);
      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * 이벤트 수정
   */
  async updateEvent(graphId, eventId, updates) {
    try {
      const data = this.getData();
      const graphIndex = data.graphs.findIndex(g => g.id === graphId);
      
      if (graphIndex === -1) {
        throw new Error('Graph not found');
      }

      const eventIndex = data.graphs[graphIndex].events.findIndex(e => e.id === eventId);
      
      if (eventIndex === -1) {
        throw new Error('Event not found');
      }

      data.graphs[graphIndex].events[eventIndex] = {
        ...data.graphs[graphIndex].events[eventIndex],
        ...updates
      };
      
      data.graphs[graphIndex].updatedAt = new Date().toISOString();
      this.saveData(data);
      
      return data.graphs[graphIndex].events[eventIndex];
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * 이벤트 삭제
   */
  async deleteEvent(graphId, eventId) {
    try {
      const data = this.getData();
      const graphIndex = data.graphs.findIndex(g => g.id === graphId);
      
      if (graphIndex === -1) {
        return false;
      }

      const eventIndex = data.graphs[graphIndex].events.findIndex(e => e.id === eventId);
      
      if (eventIndex === -1) {
        return false;
      }

      data.graphs[graphIndex].events.splice(eventIndex, 1);
      data.graphs[graphIndex].updatedAt = new Date().toISOString();
      
      this.saveData(data);
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  /**
   * 모든 데이터 초기화
   */
  async clearAllData() {
    try {
      localStorage.removeItem(this.storageKey);
      this.initializeStorage();
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  /**
   * 데이터 내보내기
   */
  async exportData() {
    try {
      return this.getData();
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  /**
   * 데이터 가져오기
   */
  async importData(data) {
    try {
      // 데이터 유효성 검사
      if (!data || !Array.isArray(data.graphs)) {
        throw new Error('Invalid data format');
      }

      this.saveData(data);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}