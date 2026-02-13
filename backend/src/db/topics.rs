use sqlx::PgPool;
use uuid::Uuid;

use crate::models::topic::Topic;

/// Get all topics ordered by sort_order
pub async fn list_all_topics(pool: &PgPool) -> Result<Vec<Topic>, sqlx::Error> {
    sqlx::query_as!(
        Topic,
        r#"
        SELECT id, name, slug, icon, sort_order
        FROM topics
        ORDER BY sort_order ASC
        "#
    )
    .fetch_all(pool)
    .await
}

/// Get topics a user has selected
pub async fn get_user_topics(pool: &PgPool, user_id: Uuid) -> Result<Vec<Topic>, sqlx::Error> {
    sqlx::query_as!(
        Topic,
        r#"
        SELECT t.id, t.name, t.slug, t.icon, t.sort_order
        FROM topics t
        INNER JOIN user_topics ut ON t.id = ut.topic_id
        WHERE ut.user_id = $1
        ORDER BY t.sort_order ASC
        "#,
        user_id
    )
    .fetch_all(pool)
    .await
}

/// Replace user's topic selections (delete existing, insert new)
pub async fn set_user_topics(
    pool: &PgPool,
    user_id: Uuid,
    topic_ids: &[Uuid],
) -> Result<(), sqlx::Error> {
    let mut tx = pool.begin().await?;

    // Delete existing topic selections for this user
    sqlx::query!(
        r#"
        DELETE FROM user_topics
        WHERE user_id = $1
        "#,
        user_id
    )
    .execute(&mut *tx)
    .await?;

    // Insert new topic selections
    for topic_id in topic_ids {
        sqlx::query!(
            r#"
            INSERT INTO user_topics (user_id, topic_id)
            VALUES ($1, $2)
            "#,
            user_id,
            *topic_id
        )
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;

    Ok(())
}
