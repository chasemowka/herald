use axum::{
    extract::{Path, Query, State},
    routing::{get, patch, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::AuthUser;
use crate::db::articles::{self, ArticleWithStatus};
use crate::errors::{AppError, AppResult};
use crate::models::article::Article;
use crate::AppState;

/// Query parameters for listing articles
#[derive(Debug, Deserialize)]
pub struct ArticleQuery {
    /// Filter by topic slug
    pub topic: Option<String>,
    /// Filter to only saved articles
    pub saved: Option<bool>,
    /// Page number (1-indexed, default 1)
    pub page: Option<i64>,
    /// Number of articles per page (default 20)
    pub per_page: Option<i64>,
}

/// Request body for marking an article as read/unread
#[derive(Debug, Deserialize)]
pub struct MarkReadRequest {
    pub is_read: bool,
}

/// Response for paginated article list
#[derive(Debug, Serialize)]
pub struct ArticleListResponse {
    pub articles: Vec<ArticleWithStatus>,
    pub page: i64,
    pub per_page: i64,
    pub has_more: bool,
}

/// Response for toggle save endpoint
#[derive(Debug, Serialize)]
pub struct ToggleSaveResponse {
    pub is_saved: bool,
}

/// Response for successful operations
#[derive(Debug, Serialize)]
pub struct SuccessResponse {
    pub success: bool,
}

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
/// Query params: ?topic=tech, ?saved=true, ?page=1&per_page=20
async fn list_articles(
    State(state): State<Arc<AppState>>,
    auth_user: AuthUser,
    Query(query): Query<ArticleQuery>,
) -> AppResult<Json<ArticleListResponse>> {
    let page = query.page.unwrap_or(1).max(1);
    let per_page = query.per_page.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * per_page;
    let saved_only = query.saved.unwrap_or(false);

    // Fetch one extra to determine if there are more pages
    let limit = per_page + 1;

    let mut fetched_articles = articles::list_articles_for_user(
        &state.db,
        auth_user.user_id,
        query.topic.as_deref(),
        saved_only,
        limit,
        offset,
    )
    .await
    .map_err(AppError::from)?;

    // Determine if there are more articles
    let has_more = fetched_articles.len() as i64 > per_page;
    if has_more {
        fetched_articles.pop(); // Remove the extra article
    }

    Ok(Json(ArticleListResponse {
        articles: fetched_articles,
        page,
        per_page,
        has_more,
    }))
}

/// GET /api/articles/:id - Get full article detail
async fn get_article(
    State(state): State<Arc<AppState>>,
    _auth_user: AuthUser,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Article>> {
    let article = articles::get_article(&state.db, id)
        .await
        .map_err(AppError::from)?
        .ok_or_else(|| AppError::NotFound(format!("Article with id {} not found", id)))?;

    Ok(Json(article))
}

/// PATCH /api/articles/:id/read - Mark article as read/unread
async fn mark_read(
    State(state): State<Arc<AppState>>,
    auth_user: AuthUser,
    Path(id): Path<Uuid>,
    Json(body): Json<MarkReadRequest>,
) -> AppResult<Json<SuccessResponse>> {
    articles::mark_read(&state.db, auth_user.user_id, id, body.is_read)
        .await
        .map_err(AppError::from)?;

    Ok(Json(SuccessResponse { success: true }))
}

/// PATCH /api/articles/:id/save - Toggle bookmark/save
async fn toggle_save(
    State(state): State<Arc<AppState>>,
    auth_user: AuthUser,
    Path(id): Path<Uuid>,
) -> AppResult<Json<ToggleSaveResponse>> {
    let is_saved = articles::toggle_save(&state.db, auth_user.user_id, id)
        .await
        .map_err(AppError::from)?;

    Ok(Json(ToggleSaveResponse { is_saved }))
}

/// GET /api/articles/:id/analysis - Get bias analysis for an article
async fn get_analysis(
    _auth_user: AuthUser,
    Path(_id): Path<Uuid>,
) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "get_analysis endpoint - not yet implemented"
    }))
}

/// POST /api/articles/:id/analyze - Trigger analysis if not yet analyzed
async fn trigger_analysis(
    _auth_user: AuthUser,
    Path(_id): Path<Uuid>,
) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "trigger_analysis endpoint - not yet implemented"
    }))
}

/// GET /api/articles/:id/opposing - Get opposing viewpoint articles
async fn get_opposing(
    _auth_user: AuthUser,
    Path(_id): Path<Uuid>,
) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "get_opposing endpoint - not yet implemented"
    }))
}

/// POST /api/articles/:id/flip - "Flip It" - find and return opposing articles
async fn flip_it(
    _auth_user: AuthUser,
    Path(_id): Path<Uuid>,
) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "flip_it endpoint - not yet implemented"
    }))
}
