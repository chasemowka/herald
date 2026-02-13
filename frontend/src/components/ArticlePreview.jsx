import { memo, useCallback, useEffect, useRef } from 'react';

/**
 * Formats a date into a readable string
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const d = new Date(date);
  const now = new Date();
  const diffInHours = Math.floor((now - d) / (1000 * 60 * 60));

  if (diffInHours < 24) {
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } else if (diffInHours < 48) {
    return 'Yesterday at ' + d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } else {
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

/**
 * CloseIcon
 */
function CloseIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

/**
 * ExternalLinkIcon
 */
function ExternalLinkIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
}

/**
 * BookmarkIcon
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
 * CheckIcon
 */
function CheckIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );
}

/**
 * EyeSlashIcon - for mark as unread
 */
function EyeSlashIcon({ className = '' }) {
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
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}

/**
 * ActionButton - Reusable button for preview actions
 */
function ActionButton({
  onClick,
  icon,
  label,
  variant = 'default',
  active = false,
  className = '',
}) {
  const baseClasses = `
    inline-flex items-center gap-2
    px-4 py-2.5
    text-sm font-medium
    rounded-md
    transition-all duration-150 ease-out
    herald-press
  `;

  const variantClasses = {
    default: `
      bg-herald-surface
      border border-herald-border
      text-herald-text-secondary
      hover:border-herald-text-muted
      hover:text-herald-text
    `,
    primary: `
      bg-herald-accent
      text-herald-black
      font-semibold
      hover:bg-herald-accent-dim
    `,
    active: `
      bg-herald-warm/10
      border border-herald-warm/30
      text-herald-warm
      hover:bg-herald-warm/20
    `,
  };

  const variantClass = active ? variantClasses.active : variantClasses[variant];

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClass} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/**
 * ArticlePreview - Full article reading panel
 *
 * Design: Editorial reading experience
 * - Large, readable typography
 * - Clear visual hierarchy
 * - Smooth slide-in animation
 * - Easy-to-reach action buttons
 *
 * @param {Object} props
 * @param {Object} props.article - Full article object with content
 * @param {Function} props.onClose - Callback to close the preview
 * @param {Function} props.onToggleRead - Callback to toggle read status
 * @param {Function} props.onToggleSave - Callback to toggle saved status
 */
function ArticlePreview({
  article,
  onClose,
  onToggleRead,
  onToggleSave,
}) {
  const panelRef = useRef(null);

  const {
    id,
    title,
    url,
    author,
    summary,
    content,
    published_at,
    feed_title,
    is_read = false,
    is_saved = false,
  } = article || {};

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Focus trap - focus the panel when it opens
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.focus();
    }
  }, [article]);

  const handleToggleRead = useCallback(() => {
    onToggleRead?.(id, !is_read);
  }, [id, is_read, onToggleRead]);

  const handleToggleSave = useCallback(() => {
    onToggleSave?.(id);
  }, [id, onToggleSave]);

  const handleOpenOriginal = useCallback(() => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [url]);

  if (!article) {
    return null;
  }

  const formattedDate = formatDate(published_at);
  const displayContent = content || summary;

  return (
    <>
      {/* Backdrop */}
      <div
        className="
          fixed inset-0 z-40
          bg-herald-black/80
          backdrop-blur-sm
          animate-fade-in
        "
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Preview Panel */}
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-label={`Article: ${title}`}
        className="
          fixed right-0 top-0 bottom-0 z-50
          w-full max-w-2xl
          bg-herald-black
          border-l border-herald-border
          overflow-hidden
          flex flex-col
          animate-slide-in-right
        "
      >
        {/* Header */}
        <header className="
          flex items-center justify-between
          px-6 py-4
          border-b border-herald-border
          bg-herald-surface
        ">
          {/* Source and time */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-xs font-medium uppercase tracking-wider text-herald-accent truncate">
              {feed_title}
            </span>
            <span className="text-herald-text-muted">/</span>
            <time
              dateTime={published_at}
              className="text-sm text-herald-text-muted shrink-0"
            >
              {formattedDate}
            </time>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close preview"
            className="
              p-2 -mr-2
              rounded-md
              text-herald-text-muted
              hover:text-herald-text
              hover:bg-herald-surface-hover
              transition-colors duration-150
              herald-press
            "
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </header>

        {/* Content area - scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-8 max-w-prose mx-auto">
            {/* Title */}
            <h1 className="
              font-display
              text-2xl md:text-3xl font-bold leading-tight mb-4
              text-herald-text
            ">
              {title}
            </h1>

            {/* Author */}
            {author && (
              <p className="text-base mb-6 text-herald-text-secondary">
                By <span className="text-herald-text">{author}</span>
              </p>
            )}

            {/* Content */}
            {displayContent && (
              <div className="text-herald-text-secondary leading-relaxed">
                {/* If content is HTML, render it; otherwise, plain text */}
                {content ? (
                  <div
                    className="
                      prose prose-lg prose-invert
                      prose-headings:text-herald-text
                      prose-headings:font-display
                      prose-a:text-herald-accent
                      prose-a:no-underline
                      hover:prose-a:underline
                      prose-strong:text-herald-text
                      prose-code:text-herald-accent
                      prose-code:bg-herald-surface
                      prose-code:px-1.5 prose-code:py-0.5
                      prose-code:rounded
                      prose-code:before:content-none
                      prose-code:after:content-none
                      prose-blockquote:border-l-herald-accent
                      prose-blockquote:text-herald-text-secondary
                      max-w-none
                    "
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                ) : (
                  <p className="text-lg leading-relaxed">{summary}</p>
                )}
              </div>
            )}

            {/* Read more prompt if only summary */}
            {!content && summary && (
              <div className="mt-8 pt-6 border-t border-herald-border">
                <p className="text-sm text-herald-text-muted mb-4">
                  This is a preview. Read the full article on the original site.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <footer className="
          px-6 py-4
          border-t border-herald-border
          bg-herald-surface
        ">
          <div className="flex flex-wrap items-center gap-3">
            {/* Open original */}
            <ActionButton
              onClick={handleOpenOriginal}
              icon={<ExternalLinkIcon className="w-4 h-4" />}
              label="Open Original"
              variant="primary"
            />

            {/* Mark as read/unread */}
            <ActionButton
              onClick={handleToggleRead}
              icon={is_read
                ? <EyeSlashIcon className="w-4 h-4" />
                : <CheckIcon className="w-4 h-4" />
              }
              label={is_read ? 'Mark Unread' : 'Mark Read'}
              active={is_read}
            />

            {/* Save/Unsave */}
            <ActionButton
              onClick={handleToggleSave}
              icon={<BookmarkIcon filled={is_saved} className="w-4 h-4" />}
              label={is_saved ? 'Saved' : 'Save'}
              active={is_saved}
            />
          </div>
        </footer>
      </aside>
    </>
  );
}

export default memo(ArticlePreview);
