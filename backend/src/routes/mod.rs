mod health; 

use axum::Router;
use std::sync::Arc;
use crate::AppState;

pub fn create_routes() -> Router<Arc<AppState>> {
    Router::new()
        .nest("/api", health::routes())
}
