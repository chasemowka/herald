CREATE TABLE curated_feeds ( 
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    feed_id UUID NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
    PRIMARY KEY (topic_id, feed_id)
);