CREATE TABLE article_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE UNIQUE,
    content_type VARCHAR(20) NOT NULL DEFAULT 'neutral',
    bias_score REAL NULL, -- (-1.0 to 1.0)
    bias_confidence REAL NULL, -- (0.0 t o 1.0)
    bias_indicators JSONB NULL,
    opposing_queries JSONB NULL,
    topic_summary VARCHAR(500) NULL,
    provider VARCHAR(50) NOT NULL, -- ('ollama' or 'claude') - look at maybe adding grok here 
    model_version VARCHAR(100) NULL,
    analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

 );

 CREATE INDEX idx_article_analysis_article ON article_analysis(article_id);
 CREATE INDEX idx_article_analysis_type ON article_analysis(content_type);
 CREATE INDEX idx_article_analysis_bias ON article_analysis(bias_score) WHERE bias_score IS NOT NULL;
