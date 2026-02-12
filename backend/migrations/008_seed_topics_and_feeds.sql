-- Migration: Seed Topics and Curated Feeds

-- Insert default topics
INSERT INTO topics (name, slug, sort_order) VALUES
    ('Tech', 'tech', 1),
    ('World News', 'world-news', 2),
    ('Sports', 'sports', 3),
    ('AI/ML', 'ai-ml', 4);

-- Insert curated feeds for Tech
INSERT INTO feeds (title, url, topic_id, is_curated) VALUES
    ('Hacker News', 'https://hnrss.org/frontpage', (SELECT id FROM topics WHERE slug = 'tech'), TRUE),
    ('Ars Technica', 'https://feeds.arstechnica.com/arstechnica/index', (SELECT id FROM topics WHERE slug = 'tech'), TRUE),
    ('The Verge', 'https://www.theverge.com/rss/index.xml', (SELECT id FROM topics WHERE slug = 'tech'), TRUE),
    ('TechCrunch', 'https://techcrunch.com/feed/', (SELECT id FROM topics WHERE slug = 'tech'), TRUE);

-- Insert curated feeds for World News
INSERT INTO feeds (title, url, topic_id, is_curated) VALUES
    ('BBC News', 'https://feeds.bbci.co.uk/news/rss.xml', (SELECT id FROM topics WHERE slug = 'world-news'), TRUE),
    ('Reuters', 'https://feeds.reuters.com/reuters/topNews', (SELECT id FROM topics WHERE slug = 'world-news'), TRUE),
    ('AP News', 'https://apnews.com/index.rss', (SELECT id FROM topics WHERE slug = 'world-news'), TRUE),
    ('NPR News', 'https://feeds.npr.org/1001/rss.xml', (SELECT id FROM topics WHERE slug = 'world-news'), TRUE);

-- Insert curated feeds for Sports
INSERT INTO feeds (title, url, topic_id, is_curated) VALUES
    ('ESPN Top', 'https://www.espn.com/espn/rss/news', (SELECT id FROM topics WHERE slug = 'sports'), TRUE),
    ('ESPN NFL', 'https://www.espn.com/espn/rss/nfl/news', (SELECT id FROM topics WHERE slug = 'sports'), TRUE),
    ('ESPN NBA', 'https://www.espn.com/espn/rss/nba/news', (SELECT id FROM topics WHERE slug = 'sports'), TRUE),
    ('Bleacher Report', 'https://bleacherreport.com/articles/feed', (SELECT id FROM topics WHERE slug = 'sports'), TRUE);

-- Insert curated feeds for AI/ML
INSERT INTO feeds (title, url, topic_id, is_curated) VALUES
    ('MIT Tech Review AI', 'https://www.technologyreview.com/topic/artificial-intelligence/feed', (SELECT id FROM topics WHERE slug = 'ai-ml'), TRUE),
    ('OpenAI Blog', 'https://openai.com/blog/rss.xml', (SELECT id FROM topics WHERE slug = 'ai-ml'), TRUE),
    ('Google AI Blog', 'https://blog.google/technology/ai/rss/', (SELECT id FROM topics WHERE slug = 'ai-ml'), TRUE),
    ('Towards Data Science', 'https://towardsdatascience.com/feed', (SELECT id FROM topics WHERE slug = 'ai-ml'), TRUE);

-- Link all curated feeds to their topics in the curated_feeds junction table
INSERT INTO curated_feeds (topic_id, feed_id)
SELECT topic_id, id FROM feeds WHERE is_curated = TRUE;
