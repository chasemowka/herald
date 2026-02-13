import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useArticles } from '../hooks/useArticles';
import { useTopics } from '../hooks/useTopics';
import { TopNav, SortToggle, ArticleGrid, ArticlePreview } from '../components';

/**
 * Feed Page - The core of Herald
 *
 * Design: Editorial reading experience
 * - TopNav with topic navigation
 * - SortToggle for feed ordering
 * - Two-column layout: ArticleGrid + ArticlePreview
 * - Responsive: single column on mobile with overlay preview
 */
export function Feed() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { articles, loading, error, pagination, fetchArticles, loadMore, markRead, toggleSave } = useArticles();
  const { userTopics, fetchUserTopics } = useTopics();

  const [selectedArticle, setSelectedArticle] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const activeTopic = searchParams.get('topic') || 'all';

  // Fetch user topics on mount
  useEffect(() => {
    fetchUserTopics().catch(() => {});
  }, [fetchUserTopics]);

  // Fetch articles when filters change
  useEffect(() => {
    const filters = {};
    if (activeTopic && activeTopic !== 'all' && activeTopic !== 'saved') {
      filters.topic = activeTopic;
    }
    if (activeTopic === 'saved') {
      filters.saved = true;
    }

    fetchArticles(filters).catch(() => {});
  }, [fetchArticles, activeTopic, sortBy]);

  const handleTopicChange = (topicSlug) => {
    if (topicSlug === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ topic: topicSlug });
    }
    setSelectedArticle(null);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  const handleArticleSelect = (article) => {
    setSelectedArticle(article);
    // Mark as read when selected
    if (article && !article.is_read) {
      markRead(article.id, true);
    }
  };

  const handleClosePreview = () => {
    setSelectedArticle(null);
  };

  const handleToggleRead = (articleId, isRead) => {
    markRead(articleId, isRead);
  };

  const handleLoadMore = () => {
    const filters = {};
    if (activeTopic && activeTopic !== 'all' && activeTopic !== 'saved') {
      filters.topic = activeTopic;
    }
    if (activeTopic === 'saved') {
      filters.saved = true;
    }
    loadMore(filters);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (route) => {
    if (route === 'settings') {
      navigate('/settings');
    } else if (route === 'login') {
      navigate('/login');
    }
  };

  // Build topics list for navigation
  const navTopics = userTopics.length > 0
    ? userTopics.map(t => ({
        id: t.id || t,
        name: t.name || t,
        slug: t.id || t,
      }))
    : [
        { id: 'tech', name: 'Tech', slug: 'tech' },
        { id: 'world', name: 'World', slug: 'world' },
        { id: 'sports', name: 'Sports', slug: 'sports' },
        { id: 'ai', name: 'AI/ML', slug: 'ai' },
      ];

  return (
    <div className="min-h-screen bg-herald-black flex flex-col">
      {/* Top Navigation */}
      <TopNav
        topics={navTopics}
        activeTopic={activeTopic}
        onTopicChange={handleTopicChange}
        user={user}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />

      {/* Main content area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toolbar row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-herald-text tracking-tight">
              {activeTopic === 'all'
                ? 'All Stories'
                : activeTopic === 'saved'
                ? 'Saved Stories'
                : navTopics.find((t) => t.slug === activeTopic)?.name || activeTopic}
            </h1>
            <p className="mt-1 font-mono text-xs text-herald-text-muted uppercase tracking-wider">
              {sortBy === 'newest' ? 'Latest first' : 'Most relevant'}
            </p>
          </div>

          <SortToggle value={sortBy} onChange={handleSortChange} />
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center animate-fade-in">
            {error}
          </div>
        )}

        {/* Article grid */}
        <ArticleGrid
          articles={articles}
          selectedId={selectedArticle?.id}
          onSelectArticle={handleArticleSelect}
          onToggleSave={toggleSave}
          onLoadMore={handleLoadMore}
          hasMore={pagination.hasMore}
          isLoading={loading}
        />
      </main>

      {/* Article Preview Panel */}
      {selectedArticle && (
        <ArticlePreview
          article={selectedArticle}
          onClose={handleClosePreview}
          onToggleRead={handleToggleRead}
          onToggleSave={toggleSave}
        />
      )}
    </div>
  );
}

export default Feed;
