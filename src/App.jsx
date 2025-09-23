import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GraphList from './pages/GraphList';
import NewGraph from './pages/NewGraph';
import GraphEdit from './pages/GraphEdit';
import Presentation from './pages/Presentation';
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<GraphList />} />
          <Route path="/new" element={<NewGraph />} />
          <Route path="/graph/:id" element={<GraphEdit />} />
          <Route path="/graph/:id/present" element={<Presentation />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
