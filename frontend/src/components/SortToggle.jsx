// SortToggle component - no useState needed, fully controlled

/**
 * SortToggle - Toggle between "Newest" and "Relevant" sorting
 *
 * Design notes:
 * - Feels tactile, like a physical toggle switch
 * - Monospace typography for that technical feel
 * - Smooth sliding animation with satisfying movement
 * - Clear visual feedback on active state
 * - Glowing accent on the active option
 */
export function SortToggle({ value = 'newest', onChange }) {
  const isRelevant = value === 'relevant';

  const handleToggle = () => {
    const newValue = isRelevant ? 'newest' : 'relevant';
    onChange?.(newValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
    // Arrow keys for accessibility
    if (e.key === 'ArrowLeft' && isRelevant) {
      onChange?.('newest');
    }
    if (e.key === 'ArrowRight' && !isRelevant) {
      onChange?.('relevant');
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Sort order"
      className="relative inline-flex items-center"
    >
      {/* Background track */}
      <div
        className="
          relative flex items-center
          bg-herald-surface
          border border-herald-border
          rounded-lg p-0.5
          cursor-pointer
          transition-all duration-200
          hover:border-herald-text-muted
        "
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Sliding indicator */}
        <div
          className={`
            absolute h-[calc(100%-4px)] w-[calc(50%-2px)]
            bg-herald-surface-hover
            border border-herald-accent/30
            rounded-md
            shadow-[0_0_8px_rgba(0,240,255,0.1)]
            transition-transform duration-250 ease-out
            ${isRelevant ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}
          `}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />

        {/* Newest option */}
        <button
          role="radio"
          aria-checked={!isRelevant}
          onClick={(e) => {
            e.stopPropagation();
            if (isRelevant) onChange?.('newest');
          }}
          className={`
            relative z-10 px-3 py-1.5
            font-mono text-xs font-medium uppercase tracking-wider
            rounded-md
            transition-colors duration-200
            ${
              !isRelevant
                ? 'text-herald-accent'
                : 'text-herald-text-muted hover:text-herald-text-secondary'
            }
          `}
        >
          <span className="flex items-center gap-1.5">
            <ClockIcon className="w-3.5 h-3.5" />
            New
          </span>
        </button>

        {/* Relevant option */}
        <button
          role="radio"
          aria-checked={isRelevant}
          onClick={(e) => {
            e.stopPropagation();
            if (!isRelevant) onChange?.('relevant');
          }}
          className={`
            relative z-10 px-3 py-1.5
            font-mono text-xs font-medium uppercase tracking-wider
            rounded-md
            transition-colors duration-200
            ${
              isRelevant
                ? 'text-herald-accent'
                : 'text-herald-text-muted hover:text-herald-text-secondary'
            }
          `}
        >
          <span className="flex items-center gap-1.5">
            <SparkIcon className="w-3.5 h-3.5" />
            Hot
          </span>
        </button>
      </div>
    </div>
  );
}

// Clock icon for "Newest"
function ClockIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4v4l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Spark/fire icon for "Relevant/Hot"
function SparkIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default SortToggle;
