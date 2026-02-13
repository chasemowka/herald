use sqlx::FromRow;
use uuid::Uuid;
use serde::{Serialize, Deserialize};


#[derive(Serialize, Deserialize, FromRow)]
pub struct Topic {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub sort_order: i32,
    pub icon: Option<String>
}