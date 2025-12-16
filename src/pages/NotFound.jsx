import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page">
      <h1>Страница не найдена</h1>
      <p>Кажется, такой публикации или раздела нет.</p>
      <Link className="pill" to="/">
        На главную
      </Link>
    </div>
  );
}



