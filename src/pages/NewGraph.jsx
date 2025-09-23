import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { graphService } from '../services/graphService';
import Header from '../components/common/Header';

function NewGraph() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('그래프 제목을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const newGraph = await graphService.createGraph(formData);
      navigate(`/graph/${newGraph.id}`);
    } catch (error) {
      console.error('Failed to create graph:', error);
      alert('그래프 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content">
        <div className="page-header">
          <button onClick={handleCancel} className="btn btn-secondary">
            <FiArrowLeft /> 목록으로
          </button>
          <h1>새 그래프 만들기</h1>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="title">그래프 제목 *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="예: 인생 전체, 직장 생활, 연애 기록..."
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">설명</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="이 그래프에 대한 간단한 설명을 입력하세요..."
              rows={4}
              maxLength={500}
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              취소
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              <FiSave /> {loading ? '생성 중...' : '그래프 만들기'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default NewGraph;