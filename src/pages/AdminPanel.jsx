import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiRequest } from '../api/client.js';
import { useApp } from '../state/AppContext.jsx';

export default function AdminPanel() {
  const { currentUser, token } = useApp();
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const loadData = async () => {
    if (!token || !isAdmin) return;
    setLoading(true);
    setError('');
    try {
      const [usersData, tagsData] = await Promise.all([
        apiRequest('/users', { token }),
        apiRequest('/tags')
      ]);
      setUsers(usersData ?? []);
      setTags(tagsData ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleUserRename = async (user) => {
    const username = prompt('Новое имя пользователя', user.username);
    if (!username?.trim()) return;
    await apiRequest(`/users/${user.id}`, {
      method: 'PATCH',
      token,
      body: { username: username.trim() }
    });
    await loadData();
  };

  const handleUserRole = async (user) => {
    const role = prompt('Новая роль (user/admin/author)', user.role);
    if (!role) return;
    await apiRequest(`/users/${user.id}/role`, {
      method: 'PATCH',
      token,
      body: { role: role.trim() }
    });
    await loadData();
  };

  const handleUserDelete = async (user) => {
    if (!confirm(`Удалить пользователя ${user.username}?`)) return;
    await apiRequest(`/users/${user.id}`, { method: 'DELETE', token });
    await loadData();
  };

  const handleTagCreate = async () => {
    if (!newTagName.trim()) return;
    await apiRequest('/tags', {
      method: 'POST',
      token,
      body: { name: newTagName.trim() }
    });
    setNewTagName('');
    await loadData();
  };

  const handleTagRename = async (tag) => {
    const name = prompt('Новое название тега', tag.name);
    if (!name?.trim()) return;
    await apiRequest(`/tags/${tag.id}`, {
      method: 'PATCH',
      token,
      body: { name: name.trim() }
    });
    await loadData();
  };

  const handleTagDelete = async (tag) => {
    if (!confirm(`Удалить тег ${tag.name}?`)) return;
    await apiRequest(`/tags/${tag.id}`, { method: 'DELETE', token });
    await loadData();
  };

  return (
    <div className="page">
      <h1>Админ-панель</h1>
      {loading && <div className="muted">Загрузка...</div>}
      {error && <div className="notice">{error}</div>}

      <section>
        <div className="section-head">
          <h2>Пользователи</h2>
        </div>
        <div className="admin-list">
          {users.map((user) => (
            <div className="admin-item" key={user.id}>
              <div>
                <strong>{user.username}</strong> · {user.email}
                <span className="muted"> · role: {user.role}</span>
              </div>
              <div className="editor-actions">
                <button className="ghost" onClick={() => handleUserRename(user)}>
                  Изменить имя
                </button>
                <button className="ghost" onClick={() => handleUserRole(user)}>
                  Изменить роль
                </button>
                <button className="ghost" onClick={() => handleUserDelete(user)}>
                  Удалить
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && <div className="muted">Пользователей нет.</div>}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Теги</h2>
        </div>
        <div className="editor-actions">
          <input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Новый тег"
          />
          <button className="pill" onClick={handleTagCreate}>
            Добавить тег
          </button>
        </div>
        <div className="admin-list">
          {tags.map((tag) => (
            <div className="admin-item" key={tag.id}>
              <div>
                <strong>{tag.name}</strong>
              </div>
              <div className="editor-actions">
                <button className="ghost" onClick={() => handleTagRename(tag)}>
                  Переименовать
                </button>
                <button className="ghost" onClick={() => handleTagDelete(tag)}>
                  Удалить
                </button>
              </div>
            </div>
          ))}
          {tags.length === 0 && <div className="muted">Тегов нет.</div>}
        </div>
      </section>
    </div>
  );
}
