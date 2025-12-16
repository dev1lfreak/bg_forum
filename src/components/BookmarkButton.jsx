import { useApp } from '../state/AppContext.jsx';

export default function BookmarkButton({ postId }) {
  const { currentUser, toggleBookmark } = useApp();
  const isBookmarked = currentUser?.bookmarks?.includes(postId);

  return (
    <button className="ghost" onClick={() => toggleBookmark(postId)}>
      {isBookmarked ? 'Убрать из закладок' : 'В закладки'}
    </button>
  );
}



