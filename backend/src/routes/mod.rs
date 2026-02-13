mod health;
mod auth;
mod topics;
mod feeds;
mod articles;

use axum::Router;
use std::sync::Arc;
use crate::AppState;

pub fn create_routes() -> Router<Arc<AppState>> {
    Router::new()
        .nest("/api",
            Router::new()
                .merge(health::routes())
                .merge(auth::routes())
                .merge(topics::routes())
                .merge(feeds::routes())
                .merge(articles::routes())
        )
}
