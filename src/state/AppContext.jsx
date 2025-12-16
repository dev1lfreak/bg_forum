import React, { createContext, useContext, useMemo, useState } from 'react';
import { initialPosts, initialUsers, loremIpsum } from '../data/mockData.js';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [posts, setPosts] = useState(initialPosts);
  const [users, setUsers] = useState(initialUsers);
  const [currentUserId, setCurrentUserId] = useState(initialUsers[0].id); // guest by default
  const [theme, setTheme] = useState('light');
  const [search, setSearch] = useState('');

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? initialUsers[0],
    [currentUserId, users]
  );

  const cycleSignIn = () => {
    const rolesOrder = ['guest', 'author', 'admin'];
    const currentIdx = rolesOrder.indexOf(currentUser.role);
    const nextRole = rolesOrder[(currentIdx + 1) % rolesOrder.length];
    const target = users.find((u) => u.role === nextRole);
    if (target) setCurrentUserId(target.id);
  };

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const updateUser = (id, updater) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const updated = typeof updater === 'function' ? updater(u) : updater;
        return { ...u, ...updated };
      })
    );
  };

  const addPost = (payload) => {
    const newPost = {
      id: crypto.randomUUID(),
      title: payload.title || 'Без названия',
      content: payload.content || loremIpsum,
      tags: payload.tags ?? [],
      images: payload.images ?? [],
      authorId: currentUser.id,
      status: payload.status || 'draft',
      createdAt: new Date().toISOString(),
      views: 0,
      score: 0,
      comments: [],
      bookmarkedBy: []
    };
    setPosts((prev) => [newPost, ...prev]);
    return newPost.id;
  };

  const updatePost = (postId, updater) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const patch = typeof updater === 'function' ? updater(p) : updater;
        return { ...p, ...patch };
      })
    );
  };

  const deletePost = (postId) => setPosts((prev) => prev.filter((p) => p.id !== postId));

  const toggleBookmark = (postId) => {
    if (!currentUser) return;
    updateUser(currentUser.id, (u) => {
      const isBookmarked = u.bookmarks.includes(postId);
      return {
        bookmarks: isBookmarked
          ? u.bookmarks.filter((id) => id !== postId)
          : [...u.bookmarks, postId]
      };
    });
  };

  const incrementView = (postId) => {
    updatePost(postId, (p) => ({ views: p.views + 1 }));
  };

  const vote = (postId, delta) => updatePost(postId, (p) => ({ score: p.score + delta }));

  const addComment = (postId, { userName, text }) => {
    updatePost(postId, (p) => ({
      comments: [
        ...p.comments,
        {
          id: crypto.randomUUID(),
          userName: userName || currentUser.name,
          text,
          createdAt: new Date().toISOString()
        }
      ]
    }));
  };

  const value = {
    posts,
    users,
    currentUser,
    theme,
    search,
    setSearch,
    toggleTheme,
    cycleSignIn,
    addPost,
    updatePost,
    deletePost,
    toggleBookmark,
    incrementView,
    vote,
    addComment,
    updateUser,
    setCurrentUserId
  };

  return (
    <AppContext.Provider value={value}>
      <div className={`theme-${theme}`}>{children}</div>
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);



