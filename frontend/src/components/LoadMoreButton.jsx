import { memo } from 'react';

/**
 * Spinner component for loading state
 */
function Spinner({ className = '' }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * ChevronDownIcon
 */
function ChevronDownIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * CheckCircleIcon - for "all caught up" state
 */
function CheckCircleIcon({ className = '' }) {
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
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

/**
 * LoadMoreButton - A polished load more button with loading state
 *
 * Design: Matches Herald's editorial dark aesthetic
 * - Clean, bordered button style
 * - Electric cyan accent on hover
 * - Subtle loading spinner
 * - Elegant "all caught up" end state
 *
 * @param {Object} props
 * @param {Function} props.onClick - Callback when button is clicked
 * @param {boolean} props.isLoading - Whether currently loading more
 * @param {boolean} props.hasMore - Whether there's more content to load
 * @param {string} props.className - Additional CSS classes
 */
function LoadMoreButton({
  onClick,
  isLoading = false,
  hasMore = true,
  className = '',
}) {
  const isDisabled = isLoading || !hasMore;

  // End state - show a clean "all caught up" message
  if (!hasMore && !isLoading) {
    return (
      <div className={`flex flex-col items-center py-10 ${className}`}>
        {/* Decorative line */}
        <div className="
          w-24 h-px mb-4
          bg-gradient-to-r
          from-transparent
          via-herald-border
          to-transparent
        " />

        {/* Check icon */}
        <CheckCircleIcon className="w-6 h-6 mb-2 text-herald-accent opacity-60" />

        {/* Message */}
        <p className="text-sm font-medium text-herald-text-muted">
          You're all caught up
        </p>

        {/* Bottom decorative line */}
        <div className="
          w-24 h-px mt-4
          bg-gradient-to-r
          from-transparent
          via-herald-border
          to-transparent
        " />
      </div>
    );
  }

  return (
    <div className={`flex justify-center py-8 ${className}`}>
      <button
        onClick={onClick}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={`
          inline-flex items-center justify-center gap-2.5
          px-8 py-3
          font-mono text-sm font-semibold tracking-wide uppercase
          rounded-md
          transition-all duration-200 ease-out
          herald-press
          bg-transparent
          border border-herald-border
          text-herald-text-secondary
          ${isLoading
            ? 'opacity-70 cursor-wait'
            : 'hover:border-herald-accent hover:text-herald-accent hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]'
          }
          disabled:opacity-50
          disabled:cursor-not-allowed
          disabled:hover:border-herald-border
          disabled:hover:text-herald-text-secondary
          disabled:hover:shadow-none
        `}
      >
        {isLoading ? (
          <>
            <Spinner className="w-4 h-4 text-herald-accent" />
            <span>Loading</span>
          </>
        ) : (
          <>
            <span>Load More</span>
            <ChevronDownIcon className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}

export default memo(LoadMoreButton);
