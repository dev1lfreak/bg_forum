import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext.jsx';
import SearchBar from './SearchBar.jsx';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="5" fill="currentColor" />
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
    </g>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M21 14.5a9 9 0 0 1-11.5-11 1 1 0 0 0-1.3-1.2A10.5 10.5 0 1 0 22.7 15.8a1 1 0 0 0-1.7-1.3Z"
    />
  </svg>
);

export default function Layout({ children }) {
  const { currentUser, cycleSignIn, toggleTheme, theme, setSearch } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const hideSearch =
    path === '/create' || path.startsWith('/profile') || path === '/me';

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <Link to="/">BoardGames Forum</Link>
          <span className="tagline">Сообщество для любителей настольных игр</span>
        </div>
        <div className="actions">
          <button className="ghost icon-btn" onClick={toggleTheme} aria-label="Переключить тему">
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <button className="ghost" onClick={cycleSignIn}>
            Sign in ({currentUser?.role})
          </button>
          <button className="ghost" disabled>
            Sign up
          </button>
          <Link className="pill" to="/create">
            Создать пост
          </Link>
          {currentUser && currentUser.id !== 'guest' && (
            <button className="ghost" onClick={() => navigate('/me')}>
              Мой профиль
            </button>
          )}
        </div>
      </header>

      {!hideSearch && (
        <div className="toolbar">
          <SearchBar onChange={(v) => setSearch(v)} />
        </div>
      )}

      <main>{children}</main>
      <footer className="footer">
        <div>
          BoardGames Forum · макет фронтенда · вдохновлено <a href="https://habr.com">Habr</a>
        </div>
        <div className="muted">Ролёвые игры, настольные игры, карточные игры, обсуждения и обзоры — всё на этом сайте.</div>
      </footer>
    </div>
  );
}

