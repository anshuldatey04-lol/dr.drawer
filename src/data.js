// Default drawer data for TaskDrawerApp
export const DEFAULT_DRAWERS = [
  {
    id: 'work',
    name: 'Work & Productivity',
    description: 'Tools and apps for getting things done',
    gradient: 'from-indigo-500 via-purple-500 to-violet-600',
    gradientColors: ['#6366f1', '#a855f7', '#7c3aed'],
    emoji: '💼',
    links: [
      { id: 'w1', name: 'Linear', url: 'https://linear.app', emoji: '🔮', category: 'tool' },
      { id: 'w2', name: 'Notion', url: 'https://notion.so', emoji: '📝', category: 'docs' },
      { id: 'w3', name: 'Slack', url: 'https://slack.com', emoji: '💬', category: 'communication' },
      { id: 'w4', name: 'Figma', url: 'https://figma.com', emoji: '🎨', category: 'design' },
      { id: 'w5', name: 'GitHub', url: 'https://github.com', emoji: '🐙', category: 'dev' },
      { id: 'w6', name: 'Vercel', url: 'https://vercel.com', emoji: '▲', category: 'dev' },
    ],
  },
  {
    id: 'social',
    name: 'Social & Media',
    description: 'Stay connected with the world',
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    gradientColors: ['#ec4899', '#f43f5e', '#ef4444'],
    emoji: '🌐',
    links: [
      { id: 's1', name: 'Twitter / X', url: 'https://x.com', emoji: '🐦', category: 'social' },
      { id: 's2', name: 'YouTube', url: 'https://youtube.com', emoji: '📺', category: 'media' },
      { id: 's3', name: 'Reddit', url: 'https://reddit.com', emoji: '🤖', category: 'social' },
      { id: 's4', name: 'Instagram', url: 'https://instagram.com', emoji: '📷', category: 'social' },
      { id: 's5', name: 'Spotify', url: 'https://spotify.com', emoji: '🎵', category: 'media' },
    ],
  },
  {
    id: 'dev',
    name: 'Developer Tools',
    description: 'Code, docs, and developer resources',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    gradientColors: ['#10b981', '#14b8a6', '#06b6d4'],
    emoji: '⚡',
    links: [
      { id: 'd1', name: 'MDN Docs', url: 'https://developer.mozilla.org', emoji: '📚', category: 'docs' },
      { id: 'd2', name: 'Stack Overflow', url: 'https://stackoverflow.com', emoji: '🏗️', category: 'community' },
      { id: 'd3', name: 'NPM Registry', url: 'https://npmjs.com', emoji: '📦', category: 'dev' },
      { id: 'd4', name: 'Can I Use', url: 'https://caniuse.com', emoji: '🔍', category: 'tool' },
      { id: 'd5', name: 'Tailwind CSS', url: 'https://tailwindcss.com', emoji: '💨', category: 'docs' },
      { id: 'd6', name: 'CodeSandbox', url: 'https://codesandbox.io', emoji: '🏖️', category: 'dev' },
      { id: 'd7', name: 'Bundlephobia', url: 'https://bundlephobia.com', emoji: '📊', category: 'tool' },
    ],
  },
  {
    id: 'learn',
    name: 'Learning & Reading',
    description: 'Courses, articles, and knowledge bases',
    gradient: 'from-amber-500 via-orange-500 to-yellow-500',
    gradientColors: ['#f59e0b', '#f97316', '#eab308'],
    emoji: '📖',
    links: [
      { id: 'l1', name: 'Coursera', url: 'https://coursera.org', emoji: '🎓', category: 'learning' },
      { id: 'l2', name: 'Medium', url: 'https://medium.com', emoji: '✍️', category: 'reading' },
      { id: 'l3', name: 'Hacker News', url: 'https://news.ycombinator.com', emoji: '🗞️', category: 'news' },
      { id: 'l4', name: 'Wikipedia', url: 'https://wikipedia.org', emoji: '🌍', category: 'reference' },
    ],
  },
];

export const EMOJI_OPTIONS = [
  '🔗', '🌐', '💼', '📝', '🎨', '🔮', '💬', '🐙', '▲', '📺',
  '🤖', '📷', '🎵', '📚', '🏗️', '📦', '🔍', '💨', '🏖️', '📊',
  '🎓', '✍️', '🗞️', '🌍', '⚡', '🔥', '💡', '🎯', '🛠️', '🚀',
  '💎', '🎮', '🎧', '📱', '🖥️', '☁️', '🔒', '💰', '🏠', '❤️',
];

export const GRADIENT_PRESETS = [
  { name: 'Indigo Violet', gradient: 'from-indigo-500 via-purple-500 to-violet-600', colors: ['#6366f1', '#a855f7', '#7c3aed'] },
  { name: 'Rose Red', gradient: 'from-pink-500 via-rose-500 to-red-500', colors: ['#ec4899', '#f43f5e', '#ef4444'] },
  { name: 'Teal Cyan', gradient: 'from-emerald-500 via-teal-500 to-cyan-500', colors: ['#10b981', '#14b8a6', '#06b6d4'] },
  { name: 'Amber Orange', gradient: 'from-amber-500 via-orange-500 to-yellow-500', colors: ['#f59e0b', '#f97316', '#eab308'] },
  { name: 'Blue Sky', gradient: 'from-blue-500 via-sky-500 to-cyan-400', colors: ['#3b82f6', '#0ea5e9', '#22d3ee'] },
  { name: 'Fuchsia Purple', gradient: 'from-fuchsia-500 via-purple-500 to-indigo-500', colors: ['#d946ef', '#a855f7', '#6366f1'] },
  { name: 'Lime Green', gradient: 'from-lime-500 via-emerald-500 to-green-600', colors: ['#84cc16', '#10b981', '#16a34a'] },
  { name: 'Slate Gray', gradient: 'from-slate-400 via-gray-500 to-zinc-600', colors: ['#94a3b8', '#6b7280', '#52525b'] },
];
