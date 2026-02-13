use axum::{routing::{get, post, delete}, Json, Router};
use std::sync::Arc;
use crate::AppState;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/feeds", get(list_feeds))
        .route("/feeds", post(subscribe_feed))
        .route("/feeds/:id", delete(unsubscribe_feed))
        .route("/feeds/refresh", post(refresh_feeds))
}

/// GET /api/feeds - List user's subscribed feeds
async fn list_feeds() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "list_feeds endpoint - not yet implemented"
    }))
}

/// POST /api/feeds - Subscribe to a new RSS feed
async fn subscribe_feed() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "subscribe_feed endpoint - not yet implemented"
    }))
}

/// DELETE /api/feeds/:id - Unsubscribe from a feed
async fn unsubscribe_feed() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "unsubscribe_feed endpoint - not yet implemented"
    }))
}

/// POST /api/feeds/refresh - Manually trigger refresh of all user's feeds
async fn refresh_feeds() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "refresh_feeds endpoint - not yet implemented"
    }))
}
