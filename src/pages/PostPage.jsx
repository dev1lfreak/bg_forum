import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from '../state/AppContext.jsx';
import TagList from '../components/TagList.jsx';
import BookmarkButton from '../components/BookmarkButton.jsx';
import CommentList from '../components/CommentList.jsx';

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6S2 12 2 12Z"
    />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

const CommentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 5h14a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2H11l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
    />
    <path
      fill="currentColor"
      d="M8 11.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm4 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm4 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
    />
  </svg>
);

export default function PostPage() {
  const { postId } = useParams();
  const { posts, users, currentUser, incrementView, vote, addComment, deletePost } = useApp();
  const navigate = useNavigate();
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const viewMarked = useRef(false);

  const post = useMemo(() => posts.find((p) => p.id === postId), [posts, postId]);
  const author = useMemo(() => users.find((u) => u.id === post?.authorId), [users, post]);

  useEffect(() => {
    viewMarked.current = false;
  }, [postId]);

  useEffect(() => {
    if (post && !viewMarked.current) {
      incrementView(post.id);
      viewMarked.current = true;
    }
  }, [post, incrementView]);

  if (!post) return <div className="muted">Публикация не найдена.</div>;

  const canEdit = currentUser?.role === 'admin' || currentUser?.id === post.authorId;
  const isPublished = post.status === 'published';

  const handleComment = () => {
    if (!commentText.trim()) return;
    addComment(post.id, {
      userName: commentName || currentUser.name || 'Гость',
      text: commentText
    });
    setCommentName('');
    setCommentText('');
  };

  const handleDelete = () => {
    if (confirm('Удалить публикацию?')) {
      deletePost(post.id);
      navigate('/');
    }
  };

  return (
    <article className="post-page">
      <div className="post-head">
        <div>
          <div className="post-meta">
            <span className="author">
              <Link to={`/profile/${author?.id}`}>{author?.name}</Link>
            </span>
            <span className="dot">·</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            {!isPublished && <span className="label">Черновик</span>}
          </div>
          <h1>{post.title}</h1>
        </div>
        <div className="post-cta">
          <BookmarkButton postId={post.id} />
          <div className="votes">
            <button onClick={() => vote(post.id, 1)}>⬆</button>
            <span>{post.score}</span>
            <button onClick={() => vote(post.id, -1)}>⬇</button>
          </div>
        </div>
      </div>

      {post.images?.length > 0 && (
        <div className="gallery">
          {post.images.map((src, idx) => (
            <img key={idx} src={src} alt="post" />
          ))}
        </div>
      )}

      <p className="content">{post.content}</p>

      <TagList tags={post.tags} />

      <div className="post-stats">
        <span className="stat">
          <EyeIcon /> Просмотры: {post.views}
        </span>
        <span className="stat">
          <CommentIcon /> Комментарии: {post.comments.length}
        </span>
      </div>

      {canEdit && (
        <div className="editor-actions post-controls">
          <Link className="pill" to={`/create?edit=${post.id}`}>
            Редактировать
          </Link>
          <button className="ghost" onClick={handleDelete}>
            Удалить
          </button>
        </div>
      )}

      <section className="comments-block">
        <h3>Комментарии</h3>
        <CommentList comments={post.comments} />
        <div className="comment-form">
          <input
            placeholder="Ваше имя"
            value={commentName}
            onChange={(e) => setCommentName(e.target.value)}
          />
          <textarea
            placeholder="Текст комментария"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
          />
          <button className="pill" onClick={handleComment}>
            Отправить
          </button>
        </div>
      </section>
    </article>
  );
}

