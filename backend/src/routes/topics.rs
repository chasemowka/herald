use axum::{
    extract::State,
    routing::{get, put},
    Json, Router,
};
use serde::Deserialize;
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::AuthUser;
use crate::db::topics;
use crate::errors::AppResult;
use crate::models::Topic;
use crate::AppState;

/// Request body for updating user's topic selections
#[derive(Debug, Deserialize)]
pub struct UpdateTopicsRequest {
    pub topic_ids: Vec<Uuid>,
}

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/topics", get(list_topics))
        .route("/topics/mine", get(get_my_topics).put(update_my_topics))
}

/// GET /api/topics - List all available topics (for onboarding)
///
/// Public endpoint - no authentication required.
/// Returns all topics ordered by sort_order for the topic picker UI.
async fn list_topics(State(state): State<Arc<AppState>>) -> AppResult<Json<Vec<Topic>>> {
    let topics = topics::list_all_topics(&state.db).await?;
    Ok(Json(topics))
}

/// GET /api/topics/mine - Get current user's selected topics
///
/// Requires authentication.
/// Returns the list of topics the user has selected (drives the nav bar).
async fn get_my_topics(
    State(state): State<Arc<AppState>>,
    auth_user: AuthUser,
) -> AppResult<Json<Vec<Topic>>> {
    let user_topics = topics::get_user_topics(&state.db, auth_user.user_id).await?;
    Ok(Json(user_topics))
}

/// PUT /api/topics/mine - Update user's topic selections
///
/// Requires authentication.
/// Accepts a JSON body with topic_ids and replaces the user's topic selections.
/// Returns the updated list of user's topics.
async fn update_my_topics(
    State(state): State<Arc<AppState>>,
    auth_user: AuthUser,
    Json(payload): Json<UpdateTopicsRequest>,
) -> AppResult<Json<Vec<Topic>>> {
    // Update the user's topic selections
    topics::set_user_topics(&state.db, auth_user.user_id, &payload.topic_ids).await?;

    // Fetch and return the updated list
    let updated_topics = topics::get_user_topics(&state.db, auth_user.user_id).await?;
    Ok(Json(updated_topics))
}
