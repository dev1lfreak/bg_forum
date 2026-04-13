import { useApp } from '../state/AppContext.jsx';

export default function BookmarkButton({ postId }) {
  const { currentUser, toggleBookmark } = useApp();
  const isBookmarked = currentUser?.bookmarks?.includes(postId);
  const isGuest = currentUser?.role === 'guest';

  return (
    <button className="ghost" onClick={() => toggleBookmark(postId)} disabled={isGuest}>
      {isGuest ? 'Войдите для закладок' : isBookmarked ? 'Убрать из закладок' : 'В закладки'}
    </button>
  );
}




