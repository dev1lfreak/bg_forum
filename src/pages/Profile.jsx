import { Link, useParams } from 'react-router-dom';
import { useApp } from '../state/AppContext.jsx';
import PostCard from '../components/PostCard.jsx';

export default function Profile() {
  const { userId } = useParams();
  const { users, posts, currentUser, updateUser, changePassword } = useApp();

  const user = users.find((u) => u.id === userId);
  if (!user) return <div className="muted">Пользователь не найден.</div>;

  const bookmarks = posts.filter((p) => user.bookmarks.includes(p.id));
  const myDrafts = posts.filter((p) => p.authorId === user.id && p.status === 'draft');
  const myPosts = posts.filter((p) => p.authorId === user.id && p.status === 'published');

  const canEditProfile = currentUser?.id === user.id || currentUser?.role === 'admin';
  const canCreatePost = currentUser?.role === 'admin' || currentUser?.role === 'author';

  const handleEditName = () => {
    const next = prompt('Новое имя профиля', user.name);
    if (next && next.trim()) {
      updateUser(user.id, { username: next.trim() });
    }
  };

  const handleChangePassword = async () => {
    const oldPassword = prompt('Текущий пароль');
    if (!oldPassword) return;
    const newPassword = prompt('Новый пароль (минимум 6 символов)');
    if (!newPassword || newPassword.length < 6) {
      alert('Новый пароль слишком короткий.');
      return;
    }

    try {
      await changePassword({
        userId: Number(user.id),
        oldPassword,
        newPassword
      });
      alert('Пароль успешно обновлен.');
    } catch (e) {
      alert(e.message || 'Не удалось сменить пароль.');
    }
  };

  return (
    <div className="page">
      <header className="profile-head">
        <div>
          <div className="profile-title">
            <h1>{user.name}</h1>
            <span className="label">{user.role}</span>
          </div>
          <p className="muted">Профиль участника сообщества настольных игр.</p>
        </div>
        {canEditProfile && (
          <div className="editor-actions">
            <button className="ghost" onClick={handleEditName}>
              Изменить имя
            </button>
            <button className="ghost" onClick={handleChangePassword}>
              Сменить пароль
            </button>
          </div>
        )}
      </header>

      <section>
        <div className="section-head">
          <h2>Опубликованные</h2>
          {canCreatePost && (
            <Link className="ghost" to="/create">
              Написать пост
            </Link>
          )}
        </div>
        {myPosts.length ? (
          myPosts.map((p) => <PostCard key={p.id} post={p} />)
        ) : (
          <div className="muted">Пока нет публикаций.</div>
        )}
      </section>

      <section>
        <div className="section-head">
          <h2>Черновики</h2>
        </div>
        {myDrafts.length ? (
          myDrafts.map((p) => <PostCard key={p.id} post={p} />)
        ) : (
          <div className="muted">Черновиков нет.</div>
        )}
      </section>

      <section>
        <div className="section-head">
          <h2>Закладки</h2>
        </div>
        {bookmarks.length ? (
          bookmarks.map((p) => <PostCard key={p.id} post={p} />)
        ) : (
          <div className="muted">Закладок пока нет.</div>
        )}
      </section>
    </div>
  );
}



