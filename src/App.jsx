import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import GraphList from './pages/GraphList';
import NewGraph from './pages/NewGraph';
import GraphEdit from './pages/GraphEdit';
import Presentation from './pages/Presentation';
import './App.css'
import './styles/themes.css'

function App() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  )
}

export default App
