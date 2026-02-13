use axum::{routing::{get, post, patch}, Json, Router};
use std::sync::Arc;
use crate::AppState;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        // Core article routes
        .route("/articles", get(list_articles))
        .route("/articles/:id", get(get_article))
        .route("/articles/:id/read", patch(mark_read))
        .route("/articles/:id/save", patch(toggle_save))
        // AI analysis routes (from herald-ai-architecture.md)
        .route("/articles/:id/analysis", get(get_analysis))
        .route("/articles/:id/analyze", post(trigger_analysis))
        .route("/articles/:id/opposing", get(get_opposing))
        .route("/articles/:id/flip", post(flip_it))
}

/// GET /api/articles - List articles with optional filters
/// Query params: ?topic=tech, ?saved=true, ?sort=newest|relevant, ?page=1&per_page=20
async fn list_articles() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "list_articles endpoint - not yet implemented"
    }))
}

/// GET /api/articles/:id - Get full article detail
async fn get_article() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "get_article endpoint - not yet implemented"
    }))
}

/// PATCH /api/articles/:id/read - Mark article as read/unread
async fn mark_read() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "mark_read endpoint - not yet implemented"
    }))
}

/// PATCH /api/articles/:id/save - Toggle bookmark/save
async fn toggle_save() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "toggle_save endpoint - not yet implemented"
    }))
}

/// GET /api/articles/:id/analysis - Get bias analysis for an article
async fn get_analysis() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "get_analysis endpoint - not yet implemented"
    }))
}

/// POST /api/articles/:id/analyze - Trigger analysis if not yet analyzed
async fn trigger_analysis() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "trigger_analysis endpoint - not yet implemented"
    }))
}

/// GET /api/articles/:id/opposing - Get opposing viewpoint articles
async fn get_opposing() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "get_opposing endpoint - not yet implemented"
    }))
}

/// POST /api/articles/:id/flip - "Flip It" - find and return opposing articles
async fn flip_it() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "flip_it endpoint - not yet implemented"
    }))
}
