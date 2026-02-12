-- Migration: Create Articles Table


CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feed_id UUID NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
    title VARCHAR(1000) NOT NULL,
    url VARCHAR(2000) NOT NULL,
    author VARCHAR(500) NULL,
    summary TEXT NULL,
    content TEXT NULL,
    published_at TIMESTAMPTZ NULL,
    guid VARCHAR(2000) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (feed_id, guid)
 );
 CREATE INDEX idx_articles_feed_id ON articles (feed_id);
 CREATE INDEX idx_articles_published_at ON articles (published_at DESC);
 CREATE INDEX idx_articles_created_at ON articles (created_at);