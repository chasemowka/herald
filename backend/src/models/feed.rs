
use uuid::Uuid;
use sqlx::FromRow;
use sqlx::types::chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};


#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Feed {
    pub id: Uuid,
    pub title: String,
    pub url: String,
    pub site_url: Option<String>,
    pub description: Option<String>,
    pub topic_id: Option<Uuid>,
    pub is_curated: bool,
    pub last_fetched_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}