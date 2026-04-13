import { Link } from 'react-router-dom';
import TagList from './TagList.jsx';
import BookmarkButton from './BookmarkButton.jsx';

export default function PostCard({ post }) {
  return (
    <article className="post-card">
      <div className="post-meta">
        <span className="author">{post.authorName ?? 'Автор'}</span>
        <span className="dot">·</span>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>
      <Link to={`/post/${post.id}`}>
        <h2>{post.title}</h2>
      </Link>
      <p className="excerpt">{post.content}</p>
      <TagList tags={post.tags} />
      <div className="post-actions">
        <BookmarkButton postId={post.id} />
        <span className="muted">👁 {post.views}</span>
        <span className="muted">⬆ {post.score}</span>
        {post.status === 'draft' && <span className="label">Черновик</span>}
      </div>
    </article>
  );
}




