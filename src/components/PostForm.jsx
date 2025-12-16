import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../state/AppContext.jsx';

export default function PostForm() {
  const { posts, addPost, updatePost, currentUser } = useApp();
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('edit');
  const editingPost = useMemo(() => posts.find((p) => p.id === postId), [posts, postId]);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [images, setImages] = useState('');

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setContent(editingPost.content);
      setTags(editingPost.tags.join(' '));
      setImages(editingPost.images.join('\n'));
    }
  }, [editingPost]);

  const handleSubmit = (status) => {
    const payload = {
      title,
      content,
      tags: tags
        .split(' ')
        .map((t) => t.trim())
        .filter(Boolean),
      images: images
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      status
    };

    if (editingPost) {
      updatePost(editingPost.id, payload);
      navigate(`/post/${editingPost.id}`);
    } else {
      const id = addPost(payload);
      navigate(status === 'draft' ? '/me' : `/post/${id}`);
    }
  };

  if (currentUser.role === 'guest') {
    return <div className="notice">Чтобы создать пост, войдите как Автор.</div>;
  }

  return (
    <section className="editor">
      <div className="editor-head">
        <h1>{editingPost ? 'Редактирование' : 'Новый пост'}</h1>
        {editingPost && editingPost.status === 'draft' && <span className="label">Черновик</span>}
      </div>

      <label>
        Заголовок
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название" />
      </label>

      <label>
        Теги
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="евро семейная карточки"
        />
        <span className="hint">Разделяйте теги пробелом</span>
      </label>

      <label>
        Ссылки на изображения
        <textarea
          value={images}
          onChange={(e) => setImages(e.target.value)}
          placeholder="https://..."
          rows={3}
        />
        <span className="hint">Каждая ссылка с новой строки</span>
      </label>

      <label>
        Текст
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          placeholder="Напишите текст вашего поста здесь..."
        />
      </label>

      <div className="editor-actions">
        <button className="pill" onClick={() => handleSubmit('published')}>
          Опубликовать
        </button>
        <button className="ghost" onClick={() => handleSubmit('draft')}>
          Сохранить как черновик
        </button>
      </div>
    </section>
  );
}



