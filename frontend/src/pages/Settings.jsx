import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTopics } from '../hooks/useTopics';
import api from '../api/client';

/**
 * Available topics for selection
 */
const ALL_TOPICS = [
  { id: 'tech', name: 'Technology', description: 'Software, hardware, startups' },
  { id: 'world', name: 'World News', description: 'Global events and breaking stories' },
  { id: 'sports', name: 'Sports', description: 'Scores, highlights, analysis' },
  { id: 'ai', name: 'AI / ML', description: 'Artificial intelligence' },
  { id: 'politics', name: 'Politics', description: 'Government and policy' },
  { id: 'business', name: 'Business', description: 'Markets and finance' },
];

/**
 * Section component for consistent styling
 */
function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-xl font-bold text-herald-text mb-4 pb-3 border-b border-herald-border">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * Topic Selection Component
 */
function TopicSelection({ userTopics, onUpdate }) {
  const [selected, setSelected] = useState(new Set(userTopics.map(t => t.id || t)));
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const newSelected = new Set(userTopics.map(t => t.id || t));
    setSelected(newSelected);
  }, [userTopics]);

  const toggleTopic = (topicId) => {
    const newSelected = new Set(selected);
    if (newSelected.has(topicId)) {
      newSelected.delete(topicId);
    } else {
      newSelected.add(topicId);
    }
    setSelected(newSelected);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(Array.from(selected));
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to save topics:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <p className="text-sm text-herald-text-muted mb-4">
        Select the topics you want to see in your feed.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {ALL_TOPICS.map((topic) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => toggleTopic(topic.id)}
            className={`flex items-center justify-between p-4 rounded-lg border text-left transition-all duration-200 herald-press ${
              selected.has(topic.id)
                ? 'bg-herald-accent/10 border-herald-accent/50'
                : 'bg-herald-surface border-herald-border hover:border-herald-text-muted'
            }`}
          >
            <div>
              <h3 className="font-medium text-herald-text">{topic.name}</h3>
              <p className="text-sm text-herald-text-muted">{topic.description}</p>
            </div>
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ml-3 transition-colors ${
                selected.has(topic.id)
                  ? 'bg-herald-accent text-herald-black'
                  : 'bg-herald-border text-herald-text-muted'
              }`}
            >
              {selected.has(topic.id) && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>

      {hasChanges && (
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-herald-accent hover:bg-herald-accent-dim text-herald-black font-mono font-medium uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 herald-press"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      )}
    </div>
  );
}

/**
 * Feed Management Component
 */
function FeedManagement() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    try {
      const response = await api.get('/user/feeds');
      setFeeds(response.feeds || response || []);
    } catch (err) {
      console.error('Failed to fetch feeds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeed = async (e) => {
    e.preventDefault();
    if (!newFeedUrl.trim()) return;

    setIsAdding(true);
    setError('');

    try {
      const response = await api.post('/user/feeds', { url: newFeedUrl });
      setFeeds([...feeds, response.feed || response]);
      setNewFeedUrl('');
    } catch (err) {
      setError(err.message || 'Failed to add feed');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveFeed = async (feedId) => {
    try {
      await api.delete(`/user/feeds/${feedId}`);
      setFeeds(feeds.filter((f) => f.id !== feedId));
    } catch (err) {
      console.error('Failed to remove feed:', err);
    }
  };

  return (
    <div>
      <p className="text-sm text-herald-text-muted mb-4">
        Add RSS feeds from your favorite sources.
      </p>

      {/* Add new feed */}
      <form onSubmit={handleAddFeed} className="mb-6">
        <div className="flex gap-2">
          <input
            type="url"
            value={newFeedUrl}
            onChange={(e) => setNewFeedUrl(e.target.value)}
            placeholder="https://example.com/feed.xml"
            className="flex-1 px-4 py-2.5 bg-herald-black/50 border border-herald-border rounded-lg text-herald-text placeholder-herald-text-muted focus:outline-none focus:border-herald-accent focus:ring-1 focus:ring-herald-accent/50 transition-all"
          />
          <button
            type="submit"
            disabled={isAdding || !newFeedUrl.trim()}
            className="px-4 py-2.5 bg-herald-accent hover:bg-herald-accent-dim text-herald-black font-mono font-medium uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed herald-press"
          >
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </div>
        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}
      </form>

      {/* Feed list */}
      <div className="space-y-2">
        {loading ? (
          <div className="py-8 text-center text-herald-text-muted font-mono text-sm">Loading feeds...</div>
        ) : feeds.length === 0 ? (
          <div className="py-8 text-center text-herald-text-muted">
            No custom feeds added yet
          </div>
        ) : (
          feeds.map((feed) => (
            <div
              key={feed.id}
              className="flex items-center justify-between p-4 bg-herald-surface border border-herald-border rounded-lg"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-herald-text truncate">
                  {feed.title || feed.name || 'Untitled Feed'}
                </h3>
                <p className="text-sm text-herald-text-muted truncate">{feed.url}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFeed(feed.id)}
                className="ml-4 p-2 text-herald-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors herald-press"
                aria-label="Remove feed"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Account Section Component
 */
function AccountSection({ user, onLogout }) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsChanging(true);

    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccess('Password changed successfully');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* User info */}
      <div className="flex items-center gap-4 p-4 bg-herald-surface border border-herald-border rounded-lg">
        <div className="w-12 h-12 rounded-full bg-herald-accent flex items-center justify-center text-herald-black text-xl font-bold shadow-[0_0_20px_rgba(0,240,255,0.3)]">
          {user?.name?.[0]?.toUpperCase() || user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <h3 className="font-medium text-herald-text">{user?.name || user?.displayName || 'User'}</h3>
          <p className="text-sm text-herald-text-muted">{user?.email}</p>
        </div>
      </div>

      {/* Password change */}
      {!showPasswordForm ? (
        <button
          type="button"
          onClick={() => setShowPasswordForm(true)}
          className="text-herald-accent hover:text-herald-accent-dim font-medium transition-colors"
        >
          Change password
        </button>
      ) : (
        <form onSubmit={handleChangePassword} className="space-y-4 p-4 bg-herald-surface border border-herald-border rounded-lg">
          <div>
            <label htmlFor="currentPassword" className="block font-mono text-xs text-herald-text-muted uppercase tracking-wider mb-2">
              Current password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-herald-black/50 border border-herald-border rounded-lg text-herald-text focus:outline-none focus:border-herald-accent focus:ring-1 focus:ring-herald-accent/50"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block font-mono text-xs text-herald-text-muted uppercase tracking-wider mb-2">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-herald-black/50 border border-herald-border rounded-lg text-herald-text focus:outline-none focus:border-herald-accent focus:ring-1 focus:ring-herald-accent/50"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block font-mono text-xs text-herald-text-muted uppercase tracking-wider mb-2">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-herald-black/50 border border-herald-border rounded-lg text-herald-text focus:outline-none focus:border-herald-accent focus:ring-1 focus:ring-herald-accent/50"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isChanging}
              className="px-4 py-2 bg-herald-accent hover:bg-herald-accent-dim text-herald-black font-mono font-medium uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 herald-press"
            >
              {isChanging ? 'Changing...' : 'Change Password'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPasswordForm(false);
                setError('');
              }}
              className="px-4 py-2 text-herald-text-muted hover:text-herald-text-secondary transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Logout */}
      <div className="pt-4 border-t border-herald-border">
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 font-medium transition-colors herald-press"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );
}

/**
 * Settings Page - User preferences and account management
 *
 * Design: Clean, organized sections
 * - Topic management
 * - Feed management
 * - Account settings
 */
export function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { userTopics, fetchUserTopics, updateUserTopics } = useTopics();

  useEffect(() => {
    fetchUserTopics().catch(() => {});
  }, [fetchUserTopics]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-herald-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-herald-black/95 backdrop-blur-md border-b border-herald-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 -ml-2 text-herald-text-muted hover:text-herald-text hover:bg-herald-surface/50 rounded-lg transition-colors herald-press"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <h1 className="ml-4 font-display text-lg font-bold text-herald-text">Settings</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Section title="Topics">
          <TopicSelection
            userTopics={userTopics}
            onUpdate={updateUserTopics}
          />
        </Section>

        <Section title="Custom Feeds">
          <FeedManagement />
        </Section>

        <Section title="Account">
          <AccountSection user={user} onLogout={handleLogout} />
        </Section>
      </main>
    </div>
  );
}

export default Settings;
