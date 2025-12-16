export default function CommentList({ comments }) {
  if (!comments?.length) {
    return <div className="muted">Пока нет комментариев — будьте первым.</div>;
  }

  return (
    <div className="comments">
      {comments.map((c) => (
        <div key={c.id} className="comment">
          <div className="comment-head">
            <span className="author">{c.userName}</span>
            <span className="muted">{new Date(c.createdAt).toLocaleString()}</span>
          </div>
          <div>{c.text}</div>
        </div>
      ))}
    </div>
  );
}



