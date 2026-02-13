
use uuid::Uuid;
use sqlx::FromRow;
use sqlx::types::chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub password_hash: Option<String>,
    pub display_name: String,
    pub oauth_provider: Option<String>,
    pub oauth_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}