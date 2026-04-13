import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest, graphqlRequest } from '../api/client.js';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [token, setToken] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const decodeJwtRole = useCallback((accessToken) => {
    if (!accessToken) return 'guest';
    try {
      const payload = accessToken.split('.')[1];
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(normalized));
      return decoded.role || 'user';
    } catch {
      return 'user';
    }
  }, []);

  const normalizePost = useCallback((post) => {
    const resolvedTags = (post.tags ?? []).map((t) => t.tag?.name ?? t.name).filter(Boolean);
    return {
      id: String(post.id),
      title: post.title,
      content: post.content,
      tags: resolvedTags,
      images: [],
      authorId: String(post.authorId),
      authorName: post.author?.username ?? 'Автор',
      status: String(post.status).toLowerCase() === 'published' ? 'published' : 'draft',
      createdAt: post.createdAt,
      views: post.viewCount ?? 0,
      score: post.rating ?? 0,
      comments: []
    };
  }, []);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await graphqlRequest(
        `
          query Posts($input: FindAllPostsInput) {
            posts(input: $input) {
              total
              items {
                id
                title
                content
                status
                viewCount
                rating
                createdAt
                authorId
                authorUsername
                tags {
                  id
                  name
                }
              }
            }
          }
        `,
        { token, variables: { input: { limit: 100 } } }
      );
      setPosts((data?.posts?.items ?? []).map(normalizePost));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, normalizePost]);

  const loadTags = useCallback(async () => {
    try {
      const data = await apiRequest('/tags');
      setTags(data ?? []);
    } catch {
      setTags([]);
    }
  }, []);

  const loadBookmarks = useCallback(async () => {
    if (!token) {
      setBookmarks([]);
      return;
    }
    try {
      const data = await apiRequest('/bookmarks', { token, query: { limit: 100 } });
      setBookmarks((data?.items ?? []).map((item) => String(item.postId)));
    } catch {
      setBookmarks([]);
    }
  }, [token]);

  useEffect(() => {
    loadPosts();
    loadTags();
  }, [loadPosts, loadTags]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const currentUser = useMemo(
    () =>
      authUser
        ? {
            id: String(authUser.id),
            name: authUser.username,
            username: authUser.username,
            role: decodeJwtRole(token),
            bookmarks
          }
        : {
            id: 'guest',
            name: 'Гость',
            username: 'Гость',
            role: 'guest',
            bookmarks: []
          },
    [authUser, bookmarks, decodeJwtRole, token]
  );

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const login = async ({ email, password }) => {
    const data = await graphqlRequest(
      `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            accessToken
            user {
              id
              email
              username
            }
          }
        }
      `,
      { variables: { input: { email, password } } }
    );
    setToken(data.login.accessToken);
    setAuthUser(data.login.user);
  };

  const register = async ({ email, username, password }) => {
    const data = await graphqlRequest(
      `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            accessToken
            user {
              id
              email
              username
            }
          }
        }
      `,
      { variables: { input: { email, username, password } } }
    );
    setToken(data.register.accessToken);
    setAuthUser(data.register.user);
  };

  const logout = () => {
    setToken(null);
    setAuthUser(null);
    setBookmarks([]);
  };

  const updateUser = async (id, patch) => {
    if (!token) return;
    const payload = typeof patch === 'function' ? patch(currentUser) : patch;
    const updated = await apiRequest(`/users/${id}`, {
      method: 'PATCH',
      token,
      body: { username: payload.name ?? payload.username }
    });
    setAuthUser(updated);
  };

  const changePassword = async ({ userId, oldPassword, newPassword }) => {
    if (!token) throw new Error('Требуется авторизация');
    await apiRequest(`/users/${userId}/change-password`, {
      method: 'POST',
      token,
      body: { oldPassword, newPassword }
    });
  };

  const addPost = async (payload) => {
    if (!token) throw new Error('Требуется авторизация');
    if (!payload.title?.trim() || !payload.content?.trim()) {
      throw new Error('Заголовок и текст обязательны.');
    }
    const selectedTagIds = tags
      .filter((tag) => payload.tags.includes(tag.name))
      .map((tag) => tag.id);
    const data = await graphqlRequest(
      `
        mutation CreatePost($input: CreatePostInput!) {
          createPost(input: $input) {
            id
          }
        }
      `,
      {
        token,
        variables: {
          input: {
            title: payload.title.trim(),
            content: payload.content.trim(),
            status: payload.status === 'published' ? 'Published' : 'Draft',
            tagIds: selectedTagIds
          }
        }
      }
    );
    await loadPosts();
    return String(data.createPost.id);
  };

  const updatePost = async (postId, updater) => {
    if (!token) throw new Error('Требуется авторизация');
    const source = posts.find((p) => p.id === String(postId));
    const patch = typeof updater === 'function' ? updater(source) : updater;
    if (!patch.title?.trim() || !patch.content?.trim()) {
      throw new Error('Заголовок и текст обязательны.');
    }
    const selectedTagIds = tags
      .filter((tag) => (patch.tags ?? []).includes(tag.name))
      .map((tag) => tag.id);

    await graphqlRequest(
      `
        mutation UpdatePost($input: UpdatePostInput!) {
          updatePost(input: $input) {
            id
          }
        }
      `,
      {
        token,
        variables: {
          input: {
            id: Number(postId),
            title: patch.title.trim(),
            content: patch.content.trim(),
            status: patch.status === 'published' ? 'Published' : 'Draft',
            tagIds: selectedTagIds
          }
        }
      }
    );
    await loadPosts();
  };

  const deletePost = async (postId) => {
    if (!token) return;
    await graphqlRequest(
      `
        mutation DeletePost($id: Int!) {
          deletePost(id: $id)
        }
      `,
      { token, variables: { id: Number(postId) } }
    );
    await loadPosts();
  };

  const toggleBookmark = async (postId) => {
    if (!token) return;
    await apiRequest('/bookmarks/toggle', {
      method: 'POST',
      token,
      body: { postId: Number(postId) }
    });
    await loadBookmarks();
  };

  const incrementView = () => {};

  const vote = () => {};

  const loadComments = useCallback(async (postId) => {
    const data = await graphqlRequest(
      `
        query CommentsByPost($postId: Int!) {
          commentsByPost(postId: $postId) {
            id
            text
            createdAt
            authorUsername
          }
        }
      `,
      { variables: { postId: Number(postId) } }
    );
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: (data.commentsByPost ?? []).map((comment) => ({
        id: String(comment.id),
        userName: comment.authorUsername ?? 'Пользователь',
        text: comment.text,
        createdAt: comment.createdAt
      }))
    }));
  }, []);

  const addComment = async (postId, { text }) => {
    if (!token) throw new Error('Требуется авторизация');
    await graphqlRequest(
      `
        mutation CreateComment($input: CreateCommentInput!) {
          createComment(input: $input) {
            id
          }
        }
      `,
      { token, variables: { input: { postId: Number(postId), text } } }
    );
    await loadComments(postId);
  };

  const users = useMemo(() => {
    const byId = new Map();
    posts.forEach((post) => {
      byId.set(post.authorId, {
        id: post.authorId,
        name: post.authorName,
        username: post.authorName,
        role: 'user',
        bio: 'Пользователь форума',
        bookmarks: []
      });
    });
    if (currentUser?.id && currentUser.id !== 'guest') {
      byId.set(currentUser.id, {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        role: currentUser.role,
        bio: 'Пользователь форума',
        bookmarks: currentUser.bookmarks
      });
    }
    return Array.from(byId.values());
  }, [currentUser, posts]);

  const value = {
    posts,
    users,
    currentUser,
    theme,
    search,
    loading,
    error,
    setSearch,
    toggleTheme,
    login,
    register,
    logout,
    token,
    addPost,
    updatePost,
    deletePost,
    toggleBookmark,
    incrementView,
    vote,
    commentsByPost,
    loadComments,
    addComment,
    updateUser,
    changePassword
  };

  return (
    <AppContext.Provider value={value}>
      <div className={`theme-${theme}`}>{children}</div>
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);



