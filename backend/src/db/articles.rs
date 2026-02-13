use sqlx::PgPool;
use sqlx::types::chrono::{DateTime, Utc};
use uuid::Uuid;
use serde::{Serialize, Deserialize};
use sqlx::FromRow;

use crate::models::article::Article;

/// Article with user-specific read/saved status
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ArticleWithStatus {
    pub id: Uuid,
    pub feed_id: Uuid,
    pub title: String,
    pub url: String,
    pub author: Option<String>,
    pub summary: Option<String>,
    pub content: Option<String>,
    pub published_at: Option<DateTime<Utc>>,
    pub guid: Option<String>,
    pub created_at: DateTime<Utc>,
    pub is_read: bool,
    pub is_saved: bool,
}

/// List articles from user's subscribed feeds with read/saved status
/// Optionally filter by topic slug and/or saved-only articles
pub async fn list_articles_for_user(
    pool: &PgPool,
    user_id: Uuid,
    topic_slug: Option<&str>,
    saved_only: bool,
    limit: i64,
    offset: i64,
) -> Result<Vec<ArticleWithStatus>, sqlx::Error> {
    // Build the query based on filters
    // We need to join through: articles -> feeds -> topics (optional) and user_articles
    // User must be subscribed to the feed via user_feeds

    if let Some(slug) = topic_slug {
        if saved_only {
            // Filter by topic AND saved only
            sqlx::query_as!(
                ArticleWithStatus,
                r#"
                SELECT
                    a.id,
                    a.feed_id,
                    a.title,
                    a.url,
                    a.author,
                    a.summary,
                    a.content,
                    a.published_at,
                    a.guid,
                    a.created_at,
                    COALESCE(ua.is_read, FALSE) as "is_read!",
                    COALESCE(ua.is_saved, FALSE) as "is_saved!"
                FROM articles a
                INNER JOIN feeds f ON a.feed_id = f.id
                INNER JOIN topics t ON f.topic_id = t.id
                INNER JOIN user_feeds uf ON f.id = uf.feed_id AND uf.user_id = $1
                LEFT JOIN user_articles ua ON a.id = ua.article_id AND ua.user_id = $1
                WHERE t.slug = $2
                  AND ua.is_saved = TRUE
                ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC
                LIMIT $3 OFFSET $4
                "#,
                user_id,
                slug,
                limit,
                offset
            )
            .fetch_all(pool)
            .await
        } else {
            // Filter by topic only
            sqlx::query_as!(
                ArticleWithStatus,
                r#"
                SELECT
                    a.id,
                    a.feed_id,
                    a.title,
                    a.url,
                    a.author,
                    a.summary,
                    a.content,
                    a.published_at,
                    a.guid,
                    a.created_at,
                    COALESCE(ua.is_read, FALSE) as "is_read!",
                    COALESCE(ua.is_saved, FALSE) as "is_saved!"
                FROM articles a
                INNER JOIN feeds f ON a.feed_id = f.id
                INNER JOIN topics t ON f.topic_id = t.id
                INNER JOIN user_feeds uf ON f.id = uf.feed_id AND uf.user_id = $1
                LEFT JOIN user_articles ua ON a.id = ua.article_id AND ua.user_id = $1
                WHERE t.slug = $2
                ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC
                LIMIT $3 OFFSET $4
                "#,
                user_id,
                slug,
                limit,
                offset
            )
            .fetch_all(pool)
            .await
        }
    } else if saved_only {
        // Saved only, no topic filter
        sqlx::query_as!(
            ArticleWithStatus,
            r#"
            SELECT
                a.id,
                a.feed_id,
                a.title,
                a.url,
                a.author,
                a.summary,
                a.content,
                a.published_at,
                a.guid,
                a.created_at,
                COALESCE(ua.is_read, FALSE) as "is_read!",
                COALESCE(ua.is_saved, FALSE) as "is_saved!"
            FROM articles a
            INNER JOIN feeds f ON a.feed_id = f.id
            INNER JOIN user_feeds uf ON f.id = uf.feed_id AND uf.user_id = $1
            LEFT JOIN user_articles ua ON a.id = ua.article_id AND ua.user_id = $1
            WHERE ua.is_saved = TRUE
            ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC
            LIMIT $2 OFFSET $3
            "#,
            user_id,
            limit,
            offset
        )
        .fetch_all(pool)
        .await
    } else {
        // No filters - all articles from user's feeds
        sqlx::query_as!(
            ArticleWithStatus,
            r#"
            SELECT
                a.id,
                a.feed_id,
                a.title,
                a.url,
                a.author,
                a.summary,
                a.content,
                a.published_at,
                a.guid,
                a.created_at,
                COALESCE(ua.is_read, FALSE) as "is_read!",
                COALESCE(ua.is_saved, FALSE) as "is_saved!"
            FROM articles a
            INNER JOIN feeds f ON a.feed_id = f.id
            INNER JOIN user_feeds uf ON f.id = uf.feed_id AND uf.user_id = $1
            LEFT JOIN user_articles ua ON a.id = ua.article_id AND ua.user_id = $1
            ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC
            LIMIT $2 OFFSET $3
            "#,
            user_id,
            limit,
            offset
        )
        .fetch_all(pool)
        .await
    }
}

/// Get a single article by ID
pub async fn get_article(pool: &PgPool, id: Uuid) -> Result<Option<Article>, sqlx::Error> {
    sqlx::query_as!(
        Article,
        r#"
        SELECT id, feed_id, title, url, author, summary, content, published_at, guid, created_at
        FROM articles
        WHERE id = $1
        "#,
        id
    )
    .fetch_optional(pool)
    .await
}

/// Mark an article as read or unread for a user
/// Uses upsert to create user_articles record if it doesn't exist
pub async fn mark_read(
    pool: &PgPool,
    user_id: Uuid,
    article_id: Uuid,
    is_read: bool,
) -> Result<(), sqlx::Error> {
    let read_at = if is_read { Some(Utc::now()) } else { None };

    sqlx::query!(
        r#"
        INSERT INTO user_articles (user_id, article_id, is_read, read_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, article_id)
        DO UPDATE SET is_read = $3, read_at = $4
        "#,
        user_id,
        article_id,
        is_read,
        read_at
    )
    .execute(pool)
    .await?;

    Ok(())
}

/// Toggle the saved status of an article for a user
/// Returns the new saved state (true = saved, false = unsaved)
pub async fn toggle_save(
    pool: &PgPool,
    user_id: Uuid,
    article_id: Uuid,
) -> Result<bool, sqlx::Error> {
    // Use upsert with toggle logic
    // If record doesn't exist, create with is_saved = true
    // If record exists, flip the is_saved value
    let result = sqlx::query!(
        r#"
        INSERT INTO user_articles (user_id, article_id, is_saved, saved_at)
        VALUES ($1, $2, TRUE, NOW())
        ON CONFLICT (user_id, article_id)
        DO UPDATE SET
            is_saved = NOT user_articles.is_saved,
            saved_at = CASE
                WHEN NOT user_articles.is_saved THEN NOW()
                ELSE NULL
            END
        RETURNING is_saved
        "#,
        user_id,
        article_id
    )
    .fetch_one(pool)
    .await?;

    Ok(result.is_saved)
}

/// Create a new article (used by RSS fetcher)
/// Returns the created article, or the existing article if guid conflicts
pub async fn create_article(
    pool: &PgPool,
    feed_id: Uuid,
    title: &str,
    url: &str,
    author: Option<&str>,
    summary: Option<&str>,
    content: Option<&str>,
    published_at: Option<DateTime<Utc>>,
    guid: Option<&str>,
) -> Result<Article, sqlx::Error> {
    sqlx::query_as!(
        Article,
        r#"
        INSERT INTO articles (feed_id, title, url, author, summary, content, published_at, guid)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (feed_id, guid)
        DO UPDATE SET
            title = EXCLUDED.title,
            url = EXCLUDED.url,
            author = EXCLUDED.author,
            summary = EXCLUDED.summary,
            content = EXCLUDED.content,
            published_at = EXCLUDED.published_at
        RETURNING id, feed_id, title, url, author, summary, content, published_at, guid, created_at
        "#,
        feed_id,
        title,
        url,
        author,
        summary,
        content,
        published_at,
        guid
    )
    .fetch_one(pool)
    .await
}
