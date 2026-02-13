use axum::{routing::{get, put}, Json, Router};
use std::sync::Arc;
use crate::AppState;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/topics", get(list_topics))
        .route("/topics/mine", get(get_my_topics))
        .route("/topics/mine", put(update_my_topics))
}

/// GET /api/topics - List all available topics (for onboarding)
async fn list_topics() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "list_topics endpoint - not yet implemented"
    }))
}

/// GET /api/topics/mine - Get current user's selected topics
async fn get_my_topics() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "get_my_topics endpoint - not yet implemented"
    }))
}

/// PUT /api/topics/mine - Update user's topic selections
async fn update_my_topics() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "update_my_topics endpoint - not yet implemented"
    }))
}
