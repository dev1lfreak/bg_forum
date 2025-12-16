import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard.jsx';
import { useApp } from '../state/AppContext.jsx';

export default function Home() {
  const { posts, search, currentUser } = useApp();

  const filtered = useMemo(() => {
    if (!search) return posts.filter((p) => p.status === 'published');
    const term = search.toLowerCase();
    return posts.filter(
      (p) =>
        p.status === 'published' &&
        (p.title.toLowerCase().includes(term) || p.tags.some((t) => t.toLowerCase().includes(term)))
    );
  }, [posts, search]);

  const bookmarks = useMemo(
    () => posts.filter((p) => currentUser?.bookmarks?.includes(p.id)),
    [posts, currentUser]
  );

  return (
    <div className="grid">
      <section className="feed">
        {filtered.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {filtered.length === 0 && <div className="muted">Ничего не найдено.</div>}
      </section>
      <aside className="sidebar">
        <div className="card">
          <h3>О чём здесь</h3>
          <p>Форум по настольным играм: делитесь обзорами, логами партий, прототипами.</p>
        </div>
        <div className="card">
          <h3>Закладки</h3>
          {bookmarks.length ? (
            <ul>
              {bookmarks.map((p) => (
                <li key={p.id}>
                  <Link to={`/post/${p.id}`}>{p.title}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="muted">Закладок пока нет.</div>
          )}
        </div>
      </aside>
    </div>
  );
}

