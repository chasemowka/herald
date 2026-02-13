import { useState, useRef, useEffect } from 'react';
import { UserMenu } from './UserMenu';

/**
 * TopNav - The main navigation bar for Herald
 *
 * Design Philosophy:
 * - Editorial meets brutalist - sharp, confident, typographically bold
 * - The brand "HERALD" uses Space Grotesk with a gradient treatment
 * - Nav items use JetBrains Mono for that technical, precise feel
 * - Active states have a glowing underline that slides in
 * - Everything feels intentional and premium
 */
export function TopNav({
  topics = [],
  activeTopic = 'all',
  onTopicChange,
  user,
  onLogout,
  onNavigate,
}) {
  const navRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  // Default topics if none provided
  const allTopics = [
    { id: 'all', name: 'All', slug: 'all' },
    ...topics,
    { id: 'saved', name: 'Saved', slug: 'saved' },
  ];

  // Update the sliding indicator position
  useEffect(() => {
    const updateIndicator = () => {
      const nav = navRef.current;
      if (!nav) return;

      const activeButton = nav.querySelector(`[data-topic="${activeTopic}"]`);
      if (activeButton) {
        const navRect = nav.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();

        setIndicatorStyle({
          left: buttonRect.left - navRect.left,
          width: buttonRect.width,
        });
      }
    };

    updateIndicator();
    // Recalculate on window resize
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTopic, topics]);

  const handleTopicClick = (slug) => {
    onTopicChange?.(slug);
  };

  return (
    <header
      className="
        sticky top-0 z-50
        w-full h-16
        bg-herald-black/95 backdrop-blur-md
        border-b border-herald-border
      "
    >
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center justify-between gap-8">
          {/* Logo / Brand */}
          <div className="flex-shrink-0">
            <a
              href="/"
              className="group flex items-center gap-2"
              aria-label="Herald Home"
            >
              {/* Logo mark */}
              <div
                className="
                  w-8 h-8
                  bg-herald-accent
                  rounded
                  flex items-center justify-center
                  shadow-[0_0_20px_rgba(0,240,255,0.3)]
                  group-hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]
                  transition-shadow duration-300
                "
              >
                <span className="font-display font-bold text-herald-black text-lg">
                  H
                </span>
              </div>

              {/* Brand text */}
              <span
                className="
                  hidden sm:block
                  font-display font-bold text-xl
                  tracking-tight
                  herald-brand
                "
              >
                HERALD
              </span>
            </a>
          </div>

          {/* Topic Navigation - Center */}
          <nav
            ref={navRef}
            className="relative flex-1 flex items-center justify-center"
            aria-label="Topic navigation"
          >
            {/* Sliding indicator background */}
            <div
              className="
                absolute bottom-0 h-0.5
                bg-gradient-to-r from-herald-accent to-herald-accent-dim
                rounded-full
                shadow-[0_0_8px_rgba(0,240,255,0.4)]
                transition-all duration-300 ease-out
              "
              style={{
                left: indicatorStyle.left || 0,
                width: indicatorStyle.width || 0,
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />

            {/* Topic tabs */}
            <div className="flex items-center gap-1">
              {allTopics.map((topic) => {
                const isActive = activeTopic === topic.slug;
                const isSaved = topic.slug === 'saved';

                return (
                  <button
                    key={topic.id}
                    data-topic={topic.slug}
                    onClick={() => handleTopicClick(topic.slug)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`
                      relative px-3 py-2
                      font-mono text-xs font-medium uppercase tracking-wider
                      rounded-lg
                      transition-all duration-200
                      herald-press
                      ${
                        isActive
                          ? 'text-herald-accent'
                          : 'text-herald-text-secondary hover:text-herald-text hover:bg-herald-surface/50'
                      }
                      ${isSaved ? 'flex items-center gap-1.5' : ''}
                    `}
                  >
                    {isSaved && <BookmarkIcon className="w-3.5 h-3.5" />}
                    {topic.name}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Right side - User menu */}
          <div className="flex-shrink-0 flex items-center gap-4">
            {user ? (
              <UserMenu
                user={user}
                onLogout={onLogout}
                onNavigate={onNavigate}
              />
            ) : (
              <button
                onClick={() => onNavigate?.('login')}
                className="
                  px-4 py-2
                  font-mono text-xs font-medium uppercase tracking-wider
                  text-herald-black bg-herald-accent
                  rounded-lg
                  hover:bg-herald-accent-dim
                  shadow-[0_0_20px_rgba(0,240,255,0.3)]
                  hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]
                  transition-all duration-200
                  herald-press
                "
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Bookmark icon for Saved tab
function BookmarkIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      stroke="none"
    >
      <path d="M3 2a1 1 0 011-1h8a1 1 0 011 1v13l-5-3-5 3V2z" />
    </svg>
  );
}

export default TopNav;
