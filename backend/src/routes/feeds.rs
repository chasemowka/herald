use axum::{
    extract::{Path, State},
    routing::{delete, get},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::AuthUser;
use crate::db::feeds;
use crate::errors::{AppError, AppResult};
use crate::models::Feed;
use crate::AppState;

/// Request body for subscribing to a new feed
#[derive(Debug, Deserialize)]
pub struct SubscribeFeedRequest {
    pub url: String,
}

/// Response for subscribe endpoint
#[derive(Debug, Serialize)]
pub struct SubscribeResponse {
    pub feed: Feed,
    pub is_new: bool, // true if we created the feed, false if it already existed
}

/// Response for successful operations
#[derive(Debug, Serialize)]
pub struct SuccessResponse {
    pub success: bool,
}

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/feeds", get(list_feeds).post(subscribe_feed))
        .route("/feeds/:id", delete(unsubscribe_feed))
}

/// GET /api/feeds - List user's subscribed feeds
///
/// Requires authentication.
/// Returns all feeds the authenticated user is subscribed to, ordered by title.
async fn list_feeds(
    State(state): State<Arc<AppState>>,
    auth_user: AuthUser,
) -> AppResult<Json<Vec<Feed>>> {
    let user_feeds = feeds::list_user_feeds(&state.db, auth_user.user_id)
        .await
        .map_err(AppError::from)?;
    Ok(Json(user_feeds))
}

/// POST /api/feeds - Subscribe to a new RSS feed
///
/// Requires authentication.
/// Accepts a JSON body with the feed URL.
/// If the feed already exists in the system, subscribes the user to it.
/// If the feed is new, creates it (using URL as title initially) and subscribes the user.
/// Returns the feed and whether it was newly created.
async fn subscribe_feed(
    State(state): State<Arc<AppState>>,
    auth_user: AuthUser,
    Json(payload): Json<SubscribeFeedRequest>,
) -> AppResult<Json<SubscribeResponse>> {
    // Validate URL is not empty
    let url = payload.url.trim();
    if url.is_empty() {
        return Err(AppError::ValidationError("URL cannot be empty".to_string()));
    }

    // Check if feed with this URL already exists
    let existing_feed = feeds::get_feed_by_url(&state.db, url)
        .await
        .map_err(AppError::from)?;

    let (feed, is_new) = match existing_feed {
        Some(feed) => {
            // Feed already exists, just subscribe the user
            (feed, false)
        }
        None => {
            // Create a new feed (use URL as title initially, will be updated when fetched)
            let new_feed = feeds::create_feed(
                &state.db,
                url,    // Use URL as initial title
                url,    // The actual URL
                None,   // site_url - will be populated on fetch
                None,   // description - will be populated on fetch
                None,   // topic_id - user can categorize later
            )
            .await
            .map_err(AppError::from)?;
            (new_feed, true)
        }
    };

    // Subscribe the user to the feed
    feeds::subscribe_user_to_feed(&state.db, auth_user.user_id, feed.id)
        .await
        .map_err(AppError::from)?;

    Ok(Json(SubscribeResponse { feed, is_new }))
}

/// DELETE /api/feeds/:id - Unsubscribe from a feed
///
/// Requires authentication.
/// Removes the subscription link between the user and the feed.
/// Does not delete the feed itself (other users may be subscribed).
async fn unsubscribe_feed(
    State(state): State<Arc<AppState>>,
    auth_user: AuthUser,
    Path(id): Path<Uuid>,
) -> AppResult<Json<SuccessResponse>> {
    feeds::unsubscribe_user_from_feed(&state.db, auth_user.user_id, id)
        .await
        .map_err(AppError::from)?;

    Ok(Json(SuccessResponse { success: true }))
}
