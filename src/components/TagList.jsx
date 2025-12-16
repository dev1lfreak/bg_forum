export default function TagList({ tags = [] }) {
  if (!tags.length) return null;
  return (
    <div className="tags">
      {tags.map((tag) => (
        <span key={tag} className="tag">
          {tag}
        </span>
      ))}
    </div>
  );
}



