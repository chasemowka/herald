CREATE TABLE user_articles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_saved BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ NULL,
    saved_at TIMESTAMPTZ NULL,
    PRIMARY KEY (user_id, article_id)
 );
 CREATE INDEX idx_user_articles_user_id ON user_articles (user_id, is_saved) WHERE is_saved = TRUE;