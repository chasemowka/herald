use axum::{routing::{get, post}, Json, Router};
use std::sync::Arc;
use crate::AppState;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/auth/register", post(register))
        .route("/auth/login", post(login))
        .route("/auth/me", get(me))
        // OAuth routes - to be implemented
        // .route("/auth/oauth/google", post(oauth_google))
        // .route("/auth/oauth/github", post(oauth_github))
}

/// POST /api/auth/register - Register new user with email/password
async fn register() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "register endpoint - not yet implemented"
    }))
}

/// POST /api/auth/login - Login with email/password, returns JWT
async fn login() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "login endpoint - not yet implemented"
    }))
}

/// GET /api/auth/me - Get current user profile (requires auth)
async fn me() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "me endpoint - not yet implemented"
    }))
}
