-- Migration: Create Feeds Table


CREATE TABLE feeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    url VARCHAR(2000) NOT NULL UNIQUE,
    site_url VARCHAR(2000) NULL, 
    description TEXT NULL,
    topic_id UUID NULL REFERENCES topics(id),
    is_curated BOOLEAN NOT NULL DEFAULT FALSE,
    last_fetched_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
