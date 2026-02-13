-- Migration: Add Politics Topic and Curated Feeds

-- Insert Politics topic
INSERT INTO topics (name, slug, sort_order) VALUES
    ('Politics', 'politics', 5);

-- Insert curated political feeds
INSERT INTO feeds (title, url, topic_id, is_curated) VALUES
    ('Politico', 'https://www.politico.com/rss/politicopicks.xml', (SELECT id FROM topics WHERE slug = 'politics'), TRUE),
    ('The Hill', 'https://thehill.com/feed/', (SELECT id FROM topics WHERE slug = 'politics'), TRUE),
    ('AP Politics', 'https://apnews.com/apf-politics', (SELECT id FROM topics WHERE slug = 'politics'), TRUE),
    ('NPR Politics', 'https://feeds.npr.org/1014/rss.xml', (SELECT id FROM topics WHERE slug = 'politics'), TRUE);

-- Link political feeds to curated_feeds junction table
INSERT INTO curated_feeds (topic_id, feed_id)
SELECT topic_id, id FROM feeds
WHERE topic_id = (SELECT id FROM topics WHERE slug = 'politics')
AND is_curated = TRUE;
