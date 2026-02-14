import { memo, useCallback } from 'react';

/**
 * Formats a date into a relative time string
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string (e.g., "2h", "Yesterday", "Feb 12")
 */
function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays}d`;
  } else {
    return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

/**
 * Strips HTML tags from a string
 * @param {string} html - HTML string to strip
 * @returns {string} Plain text
 */
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * BookmarkIcon component - filled or outline based on saved state
 */
function BookmarkIcon({ filled = false, className = '' }) {
  if (filled) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    );
  }
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>
  );
}

/**
 * UnreadIndicator - A sharp, attention-grabbing marker for unread articles
 */
function UnreadIndicator() {
  return (
    <span
      className="
        inline-block w-1.5 h-1.5 rounded-full
        bg-herald-accent
        shadow-[0_0_8px_rgba(0,240,255,0.4)]
      "
      aria-label="Unread"
    />
  );
}

/**
 * ArticleCard - A beautifully designed article card component
 *
 * Design philosophy: Editorial meets brutalist
 * - Sharp borders, confident typography
 * - Electric cyan accents that cut through the darkness
 * - Clear visual hierarchy with read/unread states
 * - Satisfying micro-interactions
 *
 * @param {Object} props
 * @param {Object} props.article - Article data object
 * @param {Function} props.onSelect - Callback when card is clicked
 * @param {Function} props.onToggleSave - Callback for bookmark toggle
 * @param {boolean} props.isSelected - Whether this card is currently selected
 */
function ArticleCard({ article, onSelect, onToggleSave, isSelected = false }) {
  const {
    id,
    title,
    author,
    summary,
    published_at,
    feed_title,
    is_read = false,
    is_saved = false,
  } = article;

  const handleCardClick = useCallback(() => {
    onSelect?.(article);
  }, [article, onSelect]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(article);
    }
  }, [article, onSelect]);

  const handleSaveClick = useCallback((e) => {
    e.stopPropagation();
    onToggleSave?.(id);
  }, [id, onToggleSave]);

  const handleSaveKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onToggleSave?.(id);
    }
  }, [id, onToggleSave]);

  const relativeTime = formatRelativeTime(published_at);

  // Build class names based on state
  const cardClasses = [
    'group relative rounded-lg cursor-pointer',
    'transition-all duration-200 ease-out',
    'herald-press p-5',
    'bg-herald-surface border border-herald-border',
    'hover:bg-herald-surface-hover hover:border-herald-text-muted',
    // Selected state
    isSelected && 'border-herald-accent shadow-[0_0_20px_rgba(0,240,255,0.15)] bg-herald-surface-hover',
    // Unread state - subtle left accent
    !is_read && 'border-l-2 border-l-herald-accent',
  ].filter(Boolean).join(' ');

  return (
    <article
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`${is_read ? '' : 'Unread: '}${title}. From ${feed_title}. ${relativeTime}`}
      className={cardClasses}
    >
      {/* Top row: Source + Time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* Unread indicator */}
          {!is_read && <UnreadIndicator />}

          {/* Feed source - monospace, uppercase for editorial feel */}
          <span
            className={`
              font-mono text-xs font-medium uppercase tracking-wider truncate
              ${!is_read ? 'text-herald-accent' : 'text-herald-text-muted'}
            `}
          >
            {feed_title}
          </span>
        </div>

        {/* Timestamp - clean, secondary */}
        <time
          dateTime={published_at}
          className="
            text-xs font-medium tabular-nums shrink-0 ml-3
            text-herald-text-muted
          "
        >
          {relativeTime}
        </time>
      </div>

      {/* Title - the hero */}
      <h2
        className={`
          font-display text-lg font-semibold leading-snug mb-2
          transition-colors duration-150
          ${!is_read ? 'text-herald-text' : 'text-herald-text-secondary'}
          group-hover:text-herald-accent
        `}
      >
        {title}
      </h2>

      {/* Author */}
      {author && (
        <p className="text-sm mb-2 text-herald-text-muted">
          {author}
        </p>
      )}

      {/* Summary - elegant line clamping */}
      {summary && (
        <p
          className={`
            text-sm leading-relaxed line-clamp-3
            ${!is_read ? 'text-herald-text-secondary' : 'text-herald-text-muted'}
          `}
        >
          {stripHtml(summary)}
        </p>
      )}

      {/* Bottom row: Bookmark */}
      <div className="
        flex items-center justify-between
        mt-4 pt-3
        border-t border-herald-border
      ">
        {/* Saved badge */}
        {is_saved && (
          <span
            className="
              inline-flex items-center gap-1.5
              px-2 py-0.5
              text-[10px] font-bold uppercase tracking-wider
              text-herald-warm
              bg-herald-warm/10
              border border-herald-warm/30
              rounded
            "
          >
            <BookmarkIcon filled className="w-3 h-3" />
            Saved
          </span>
        )}

        {/* Spacer when no badge */}
        {!is_saved && <div />}

        {/* Bookmark button */}
        <button
          onClick={handleSaveClick}
          onKeyDown={handleSaveKeyDown}
          aria-label={is_saved ? 'Remove from saved' : 'Save article'}
          aria-pressed={is_saved}
          className={`
            p-2 -mr-1 -mb-1
            rounded-md
            transition-all duration-150 ease-out
            herald-press
            ${is_saved
              ? 'text-herald-warm hover:bg-herald-warm/10'
              : 'text-herald-text-muted hover:text-herald-text-secondary hover:bg-herald-surface-hover opacity-40 group-hover:opacity-100'
            }
          `}
        >
          <BookmarkIcon
            filled={is_saved}
            className="w-5 h-5 transition-transform duration-150 hover:scale-110"
          />
        </button>
      </div>
    </article>
  );
}

export default memo(ArticleCard);
