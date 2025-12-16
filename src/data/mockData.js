export const loremIpsum =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.';

const placeholder =
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80';

export const initialUsers = [
  {
    id: 'guest',
    role: 'guest',
    name: 'Гость',
    bio: 'Читайте, голосуйте, комментируйте. Создание пока недоступно.',
    bookmarks: [],
    drafts: []
  },
  {
    id: 'author-1',
    role: 'author',
    name: 'Анна Автор',
    bio: 'Обожаю евро-стратегии, делюсь обзорами и логами партий.',
    bookmarks: [],
    drafts: []
  },
  {
    id: 'admin-1',
    role: 'admin',
    name: 'Админ',
    bio: 'Следит за порядком и обновлениями сообщества.',
    bookmarks: [],
    drafts: []
  }
];

const now = new Date().toISOString();

export const initialPosts = [
  {
    id: 'p1',
    title: 'Почему в «Крыльях» хочется играть снова и снова',
    content: loremIpsum,
    tags: ['евро', 'семейная', 'птицы'],
    images: [placeholder],
    authorId: 'author-1',
    status: 'published',
    createdAt: now,
    views: 32,
    score: 10,
    bookmarkedBy: [],
    comments: [
      { id: 'c1', userName: 'Гость', text: 'Отличный разбор, спасибо!', createdAt: now }
    ]
  },
  {
    id: 'p2',
    title: 'Лучшие кооперативы на вечер с друзьями',
    content: loremIpsum,
    tags: ['кооп', 'вечеринка'],
    images: [],
    authorId: 'admin-1',
    status: 'published',
    createdAt: now,
    views: 18,
    score: 3,
    bookmarkedBy: [],
    comments: []
  },
  {
    id: 'p3',
    title: 'Черновик: заметки по прототипу настолки',
    content: loremIpsum,
    tags: ['дизайн', 'прототип'],
    images: [],
    authorId: 'author-1',
    status: 'draft',
    createdAt: now,
    views: 0,
    score: 0,
    bookmarkedBy: [],
    comments: []
  }
];

