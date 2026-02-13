import { memo } from 'react';
import ArticleCard from './ArticleCard';
import LoadMoreButton from './LoadMoreButton';

/**
 * ArticleCardSkeleton - Loading placeholder for article cards
 * Maintains the same dimensions as real cards for smooth transitions
 */
function ArticleCardSkeleton() {
  return (
    <div
      className="
        rounded-lg p-5
        bg-herald-surface
        border border-herald-border
        animate-pulse
      "
      aria-hidden="true"
    >
      {/* Top row skeleton */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-herald-border" />
          <div className="h-3 w-20 rounded bg-herald-border" />
        </div>
        <div className="h-3 w-8 rounded bg-herald-border" />
      </div>

      {/* Title skeleton - two lines */}
      <div className="space-y-2 mb-3">
        <div className="h-5 w-full rounded bg-herald-border" />
        <div className="h-5 w-3/4 rounded bg-herald-border" />
      </div>

      {/* Summary skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-herald-border" />
        <div className="h-4 w-5/6 rounded bg-herald-border" />
      </div>

      {/* Bottom row skeleton */}
      <div className="flex items-center justify-end mt-4 pt-3 border-t border-herald-border">
        <div className="w-5 h-5 rounded bg-herald-border" />
      </div>
    </div>
  );
}

/**
 * EmptyState - Shown when there are no articles
 */
function EmptyState() {
  return (
    <div className="
      flex flex-col items-center justify-center
      py-20 px-6
      text-center
    ">
      {/* Empty inbox icon */}
      <svg
        className="w-16 h-16 mb-6 text-herald-text-muted opacity-50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z"
        />
      </svg>

      {/* Title */}
      <h3 className="font-display text-xl font-semibold mb-2 text-herald-text">
        No articles yet
      </h3>

      {/* Description */}
      <p className="
        text-sm max-w-sm leading-relaxed
        text-herald-text-muted
      ">
        Subscribe to some feeds and fresh articles will appear here.
        Your reading journey starts with a single feed.
      </p>
    </div>
  );
}

/**
 * ArticleGrid - Responsive grid of article cards
 *
 * Features:
 * - Responsive 3/2/1 column layout
 * - Smooth loading skeleton states
 * - Elegant empty state
 * - Load more pagination
 *
 * @param {Object} props
 * @param {Array} props.articles - Array of article objects
 * @param {string|number} props.selectedId - Currently selected article ID
 * @param {Function} props.onSelectArticle - Callback when article is selected
 * @param {Function} props.onToggleSave - Callback for bookmark toggle
 * @param {Function} props.onLoadMore - Callback for loading more articles
 * @param {boolean} props.hasMore - Whether there are more articles to load
 * @param {boolean} props.isLoading - Whether currently loading
 */
function ArticleGrid({
  articles = [],
  selectedId,
  onSelectArticle,
  onToggleSave,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}) {
  const isEmpty = !isLoading && articles.length === 0;
  const isInitialLoad = isLoading && articles.length === 0;

  // Show empty state
  if (isEmpty) {
    return <EmptyState />;
  }

  return (
    <div className="w-full">
      {/* Article grid */}
      <div className="
        grid gap-4
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-3
      ">
        {/* Existing articles */}
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onSelect={onSelectArticle}
            onToggleSave={onToggleSave}
            isSelected={article.id === selectedId}
          />
        ))}

        {/* Loading skeletons - show during initial load */}
        {isInitialLoad &&
          Array.from({ length: 6 }).map((_, index) => (
            <ArticleCardSkeleton key={`skeleton-${index}`} />
          ))
        }
      </div>

      {/* Load more / End of list */}
      {articles.length > 0 && (
        <LoadMoreButton
          onClick={onLoadMore}
          isLoading={isLoading}
          hasMore={hasMore}
          className="mt-6"
        />
      )}

      {/* Inline loading indicator when loading more */}
      {isLoading && articles.length > 0 && (
        <div className="
          grid gap-4
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          mt-4
        ">
          {Array.from({ length: 3 }).map((_, index) => (
            <ArticleCardSkeleton key={`load-more-skeleton-${index}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(ArticleGrid);
