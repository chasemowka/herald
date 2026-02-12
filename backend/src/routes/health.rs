use axum::{routing::get, Router};
use std::sync::Arc;
use crate::AppState;

pub fn routes() -> Router<Arc<AppState>> { 
    Router::new()
        .route("/health", get(health_check))
}

async fn health_check() -> &'static str {
    "OK"
}