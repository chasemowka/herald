use sqlx::PgPool;
use uuid::Uuid;

use crate::models::feed::Feed;

/// Get all feeds a user is subscribed to.
pub async fn list_user_feeds(pool: &PgPool, user_id: Uuid) -> Result<Vec<Feed>, sqlx::Error> {
    sqlx::query_as!(
        Feed,
        r#"
        SELECT f.id, f.title, f.url, f.site_url, f.description, f.topic_id,
               f.is_curated, f.last_fetched_at, f.created_at, f.updated_at
        FROM feeds f
        INNER JOIN user_feeds uf ON f.id = uf.feed_id
        WHERE uf.user_id = $1
        ORDER BY f.title ASC
        "#,
        user_id
    )
    .fetch_all(pool)
    .await
}

/// Find a feed by its URL (for checking if it already exists).
pub async fn get_feed_by_url(pool: &PgPool, url: &str) -> Result<Option<Feed>, sqlx::Error> {
    sqlx::query_as!(
        Feed,
        r#"
        SELECT id, title, url, site_url, description, topic_id,
               is_curated, last_fetched_at, created_at, updated_at
        FROM feeds
        WHERE url = $1
        "#,
        url
    )
    .fetch_optional(pool)
    .await
}

/// Get a feed by its unique ID.
pub async fn get_feed_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Feed>, sqlx::Error> {
    sqlx::query_as!(
        Feed,
        r#"
        SELECT id, title, url, site_url, description, topic_id,
               is_curated, last_fetched_at, created_at, updated_at
        FROM feeds
        WHERE id = $1
        "#,
        id
    )
    .fetch_optional(pool)
    .await
}

/// Create a new feed.
pub async fn create_feed(
    pool: &PgPool,
    title: &str,
    url: &str,
    site_url: Option<&str>,
    description: Option<&str>,
    topic_id: Option<Uuid>,
) -> Result<Feed, sqlx::Error> {
    sqlx::query_as!(
        Feed,
        r#"
        INSERT INTO feeds (title, url, site_url, description, topic_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, title, url, site_url, description, topic_id,
                  is_curated, last_fetched_at, created_at, updated_at
        "#,
        title,
        url,
        site_url,
        description,
        topic_id
    )
    .fetch_one(pool)
    .await
}

/// Subscribe a user to a feed (insert into user_feeds junction table).
pub async fn subscribe_user_to_feed(
    pool: &PgPool,
    user_id: Uuid,
    feed_id: Uuid,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        r#"
        INSERT INTO user_feeds (user_id, feed_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, feed_id) DO NOTHING
        "#,
        user_id,
        feed_id
    )
    .execute(pool)
    .await?;

    Ok(())
}

/// Unsubscribe a user from a feed (delete from user_feeds junction table).
pub async fn unsubscribe_user_from_feed(
    pool: &PgPool,
    user_id: Uuid,
    feed_id: Uuid,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        r#"
        DELETE FROM user_feeds
        WHERE user_id = $1 AND feed_id = $2
        "#,
        user_id,
        feed_id
    )
    .execute(pool)
    .await?;

    Ok(())
}

/// Update the last_fetched_at timestamp for a feed.
pub async fn update_last_fetched(pool: &PgPool, feed_id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query!(
        r#"
        UPDATE feeds
        SET last_fetched_at = NOW(), updated_at = NOW()
        WHERE id = $1
        "#,
        feed_id
    )
    .execute(pool)
    .await?;

    Ok(())
}

/// Get all feeds that have at least one subscriber (active feeds).
/// Used by the scheduler to determine which feeds need to be fetched.
pub async fn get_all_active_feeds(pool: &PgPool) -> Result<Vec<Feed>, sqlx::Error> {
    sqlx::query_as!(
        Feed,
        r#"
        SELECT DISTINCT f.id, f.title, f.url, f.site_url, f.description, f.topic_id,
               f.is_curated, f.last_fetched_at, f.created_at, f.updated_at
        FROM feeds f
        INNER JOIN user_feeds uf ON f.id = uf.feed_id
        "#
    )
    .fetch_all(pool)
    .await
}

/// Get curated feeds for given topics (useful for onboarding).
pub async fn get_curated_feeds_for_topics(
    pool: &PgPool,
    topic_ids: &[Uuid],
) -> Result<Vec<Feed>, sqlx::Error> {
    sqlx::query_as!(
        Feed,
        r#"
        SELECT id, title, url, site_url, description, topic_id,
               is_curated, last_fetched_at, created_at, updated_at
        FROM feeds
        WHERE is_curated = TRUE AND topic_id = ANY($1)
        ORDER BY title ASC
        "#,
        topic_ids
    )
    .fetch_all(pool)
    .await
}
