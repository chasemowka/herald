CREATE TABLE opposing_articles(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    opposing_article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    relevance_score REAL NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(source_article_id, opposing_article_id)
);
