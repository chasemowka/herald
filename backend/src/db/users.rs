use sqlx::PgPool;
use uuid::Uuid;

use crate::models::user::User;

/// Create a new user with email and password authentication.
pub async fn create_user(
    pool: &PgPool,
    email: &str,
    password_hash: &str,
    display_name: &str,
) -> Result<User, sqlx::Error> {
    sqlx::query_as!(
        User,
        r#"
        INSERT INTO users (email, password_hash, display_name)
        VALUES ($1, $2, $3)
        RETURNING id, email, password_hash, display_name, oauth_provider, oauth_id, created_at, updated_at
        "#,
        email,
        password_hash,
        display_name
    )
    .fetch_one(pool)
    .await
}

/// Create a new user with OAuth authentication.
pub async fn create_oauth_user(
    pool: &PgPool,
    email: &str,
    display_name: &str,
    provider: &str,
    oauth_id: &str,
) -> Result<User, sqlx::Error> {
    sqlx::query_as!(
        User,
        r#"
        INSERT INTO users (email, display_name, oauth_provider, oauth_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, password_hash, display_name, oauth_provider, oauth_id, created_at, updated_at
        "#,
        email,
        display_name,
        provider,
        oauth_id
    )
    .fetch_one(pool)
    .await
}

/// Find a user by their email address.
pub async fn find_by_email(
    pool: &PgPool,
    email: &str,
) -> Result<Option<User>, sqlx::Error> {
    sqlx::query_as!(
        User,
        r#"
        SELECT id, email, password_hash, display_name, oauth_provider, oauth_id, created_at, updated_at
        FROM users
        WHERE email = $1
        "#,
        email
    )
    .fetch_optional(pool)
    .await
}

/// Find a user by their unique ID.
pub async fn find_by_id(
    pool: &PgPool,
    id: Uuid,
) -> Result<Option<User>, sqlx::Error> {
    sqlx::query_as!(
        User,
        r#"
        SELECT id, email, password_hash, display_name, oauth_provider, oauth_id, created_at, updated_at
        FROM users
        WHERE id = $1
        "#,
        id
    )
    .fetch_optional(pool)
    .await
}

/// Find a user by their OAuth provider and OAuth ID.
pub async fn find_by_oauth(
    pool: &PgPool,
    provider: &str,
    oauth_id: &str,
) -> Result<Option<User>, sqlx::Error> {
    sqlx::query_as!(
        User,
        r#"
        SELECT id, email, password_hash, display_name, oauth_provider, oauth_id, created_at, updated_at
        FROM users
        WHERE oauth_provider = $1 AND oauth_id = $2
        "#,
        provider,
        oauth_id
    )
    .fetch_optional(pool)
    .await
}
