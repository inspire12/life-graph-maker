import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiTrendingUp } from 'react-icons/fi';
import GlobalThemeSelector from './GlobalThemeSelector';

function Header() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="logo">
          <FiTrendingUp />
          <span>Life Graph Maker</span>
        </Link>
        
        <nav className="header-nav">
          {!isHomePage && (
            <Link to="/" className="nav-link">
              <FiHome />
              홈
            </Link>
          )}
          <GlobalThemeSelector />
        </nav>
      </div>
    </header>
  );
}

export default Header;