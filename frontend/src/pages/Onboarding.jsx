import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTopics } from '../hooks/useTopics';

/**
 * Topic data with icons
 */
const TOPICS = [
  {
    id: 'tech',
    name: 'Technology',
    description: 'Software, hardware, startups, and digital innovation',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
      </svg>
    ),
  },
  {
    id: 'world',
    name: 'World News',
    description: 'Global events, international relations, and breaking stories',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Scores, highlights, and analysis from all major leagues',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    ),
  },
  {
    id: 'ai',
    name: 'AI / ML',
    description: 'Artificial intelligence, machine learning, and automation',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
  {
    id: 'politics',
    name: 'Politics',
    description: 'Government, policy, elections, and political analysis',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Markets, finance, entrepreneurship, and economics',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
];

/**
 * Onboarding Page - Topic selection after registration
 *
 * Design: Clean, inviting, and purposeful
 * - Grid of selectable topic cards
 * - Clear visual feedback on selection
 * - Progressive disclosure (continue when ready)
 */
export function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateUserTopics } = useTopics();

  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleTopic = (topicId) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleContinue = async () => {
    if (selectedTopics.length === 0) return;

    setIsSubmitting(true);
    setError('');

    try {
      await updateUserTopics(selectedTopics);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to save topics. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate('/', { replace: true });
  };

  const displayName = user?.name || user?.displayName || user?.email?.split('@')[0] || 'there';

  return (
    <div className="min-h-screen bg-herald-black py-12 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-herald-accent/5 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px] bg-herald-warm/5 blur-3xl rounded-full" />

      <div className="relative max-w-3xl mx-auto">
        {/* Welcome header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-herald-text mb-3 tracking-tight">
            Welcome, {displayName}!
          </h1>
          <p className="text-lg text-herald-text-secondary max-w-lg mx-auto">
            Select the topics you're interested in. We'll personalize your feed based on your choices.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center animate-fade-in">
            {error}
          </div>
        )}

        {/* Topic grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {TOPICS.map((topic) => {
            const isSelected = selectedTopics.includes(topic.id);

            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => toggleTopic(topic.id)}
                className={`group relative p-6 rounded-xl border text-left transition-all duration-200 herald-press ${
                  isSelected
                    ? 'bg-herald-accent/10 border-herald-accent/50 shadow-[0_0_20px_rgba(0,240,255,0.1)]'
                    : 'bg-herald-surface border-herald-border hover:bg-herald-surface-hover hover:border-herald-text-muted'
                }`}
              >
                {/* Checkmark indicator */}
                <div
                  className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? 'bg-herald-accent text-herald-black scale-100'
                      : 'bg-herald-border text-herald-text-muted scale-90 group-hover:scale-100'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>

                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${
                    isSelected
                      ? 'bg-herald-accent/20 text-herald-accent'
                      : 'bg-herald-surface-hover text-herald-text-muted group-hover:text-herald-text-secondary'
                  }`}
                >
                  {topic.icon}
                </div>

                {/* Content */}
                <h3 className={`font-display text-lg font-semibold mb-1 transition-colors ${
                  isSelected ? 'text-herald-text' : 'text-herald-text-secondary group-hover:text-herald-text'
                }`}>
                  {topic.name}
                </h3>
                <p className={`text-sm transition-colors ${
                  isSelected ? 'text-herald-text-secondary' : 'text-herald-text-muted'
                }`}>
                  {topic.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleSkip}
            className="order-2 sm:order-1 text-herald-text-muted hover:text-herald-text-secondary font-mono text-xs uppercase tracking-wider transition-colors"
          >
            Skip for now
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={selectedTopics.length === 0 || isSubmitting}
            className="order-1 sm:order-2 px-8 py-3.5 bg-herald-accent hover:bg-herald-accent-dim text-herald-black font-mono font-bold uppercase tracking-wider rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[180px] justify-center herald-press"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Selection count */}
        <p className="text-center text-herald-text-muted font-mono text-xs uppercase tracking-wider mt-6">
          {selectedTopics.length === 0
            ? 'Select at least one topic to continue'
            : `${selectedTopics.length} topic${selectedTopics.length === 1 ? '' : 's'} selected`}
        </p>
      </div>
    </div>
  );
}

export default Onboarding;
