import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * UserMenu - Dropdown menu for user actions
 *
 * Design notes:
 * - Shows user avatar/initial with monospace aesthetic
 * - Smooth dropdown animation with scale + fade
 * - Click outside to close
 * - Keyboard accessible
 */
export function UserMenu({ user, onLogout, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Get user initial for avatar
  const userInitial = user?.displayName?.[0] || user?.email?.[0] || '?';
  const userName = user?.displayName || user?.email || 'User';

  // Close handler with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 100);
  }, []);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        handleClose();
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
        buttonRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
    }
  };

  const handleMenuAction = (action) => {
    handleClose();
    if (action === 'logout' && onLogout) {
      onLogout();
    } else if (onNavigate) {
      onNavigate(action);
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: ProfileIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'logout', label: 'Logout', icon: LogoutIcon, variant: 'danger' },
  ];

  return (
    <div className="relative">
      {/* Avatar Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="
          group flex items-center gap-2 px-2 py-1.5 rounded-lg
          bg-transparent hover:bg-herald-surface
          border border-transparent hover:border-herald-border
          transition-all duration-200
          herald-press
        "
      >
        {/* Avatar circle */}
        <div
          className="
            w-8 h-8 rounded-lg
            bg-herald-surface border border-herald-border
            flex items-center justify-center
            font-mono text-sm font-semibold
            text-herald-accent
            group-hover:border-herald-accent/40
            group-hover:shadow-[0_0_12px_rgba(0,240,255,0.15)]
            transition-all duration-200
          "
        >
          {userInitial.toUpperCase()}
        </div>

        {/* Dropdown chevron */}
        <ChevronIcon
          className={`
            w-4 h-4 text-herald-text-muted
            transition-transform duration-200
            ${isOpen ? 'rotate-180' : ''}
          `}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className={`
            absolute top-full right-0 mt-2
            w-56 py-1
            bg-herald-surface
            border border-herald-border
            rounded-lg
            shadow-xl shadow-black/40
            ${isClosing ? 'herald-dropdown-exit' : 'herald-dropdown-enter'}
          `}
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-herald-border">
            <p className="font-mono text-xs text-herald-text-muted uppercase tracking-wider">
              Signed in as
            </p>
            <p className="mt-1 text-sm text-herald-text font-medium truncate">
              {userName}
            </p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                role="menuitem"
                onClick={() => handleMenuAction(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5
                  text-left text-sm
                  transition-colors duration-150
                  ${
                    item.variant === 'danger'
                      ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                      : 'text-herald-text-secondary hover:bg-herald-surface-hover hover:text-herald-text'
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-mono text-xs uppercase tracking-wide">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Icon components - minimal, geometric style
function ChevronIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function ProfileIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-2.5 2.5-4 6-4s6 1.5 6 4" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.93 2.93l1.41 1.41M11.66 11.66l1.41 1.41M2.93 13.07l1.41-1.41M11.66 4.34l1.41-1.41" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M6 8h8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default UserMenu;
