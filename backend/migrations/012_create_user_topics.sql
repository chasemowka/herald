-- Migration: Create User Topics junction table
-- Links users to their selected topics (for onboarding and navigation)

CREATE TABLE user_topics (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, topic_id)
);
