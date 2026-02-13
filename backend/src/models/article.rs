
use uuid::Uuid;
use sqlx::FromRow;
use sqlx::types::chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};


#[derive(Serialize, Deserialize, FromRow)]
pub struct Article {
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
}