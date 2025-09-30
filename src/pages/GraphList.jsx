import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiPlay, FiCopy, FiTrash2 } from 'react-icons/fi';
import { graphService } from '../services/graphService';
import Header from '../components/common/Header';

function GraphList() {
  const [graphs, setGraphs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGraphs();
  }, []);

  const loadGraphs = async () => {
    try {
      const data = await graphService.getAllGraphs();
      setGraphs(data);
    } catch (error) {
      console.error('Failed to load graphs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGraph = async (id) => {
    if (window.confirm('정말로 이 그래프를 삭제하시겠습니까?')) {
      try {
        await graphService.deleteGraph(id);
        await loadGraphs(); // 목록 새로고침
      } catch (error) {
        console.error('Failed to delete graph:', error);
        alert('그래프 삭제에 실패했습니다.');
      }
    }
  };

  const handleDuplicateGraph = async (id) => {
    try {
      const duplicatedGraph = await graphService.duplicateGraph(id);
      await loadGraphs(); // 목록 새로고침
      alert(`그래프가 성공적으로 복사되었습니다! (${duplicatedGraph.events?.length || 0}개 이벤트 포함)`);
    } catch (error) {
      console.error('Failed to duplicate graph:', error);
      alert('그래프 복사에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Header />
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content">
        <div className="page-header">
          <h1>내 인생 그래프들</h1>
          <Link to="/new" className="btn btn-primary">
            <FiPlus /> 새 그래프 만들기
          </Link>
        </div>

        {graphs.length === 0 ? (
          <div className="empty-state">
            <h2>아직 생성된 그래프가 없습니다</h2>
            <p>첫 번째 인생 그래프를 만들어보세요!</p>
            <Link to="/new" className="btn btn-primary">
              <FiPlus /> 새 그래프 만들기
            </Link>
          </div>
        ) : (
          <div className="graphs-grid">
            {graphs.map(graph => (
              <div key={graph.id} className="graph-card">
                <div className="graph-card-header">
                  <h3>{graph.title}</h3>
                  <div className="graph-actions">
                    <button
                      onClick={() => handleDuplicateGraph(graph.id)}
                      className="btn btn-sm btn-secondary"
                      title="복사"
                    >
                      <FiCopy />
                    </button>
                    <button
                      onClick={() => handleDeleteGraph(graph.id)}
                      className="btn btn-sm btn-danger"
                      title="삭제"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                
                <div className="graph-card-content">
                  <p className="graph-description">{graph.description}</p>
                  <div className="graph-stats">
                    <span>{graph.events?.length || 0}개 이벤트</span>
                    <span>{new Date(graph.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="graph-card-actions">
                  <Link 
                    to={`/graph/${graph.id}`} 
                    className="btn btn-primary"
                  >
                    <FiEdit /> 편집
                  </Link>
                  <Link 
                    to={`/graph/${graph.id}/present`} 
                    className="btn btn-secondary"
                  >
                    <FiPlay /> 발표
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default GraphList;