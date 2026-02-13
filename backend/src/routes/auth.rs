use axum::{
    extract::State,
    routing::{get, post},
    Json, Router,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::{create_token, hash_password, verify_password, AuthUser};
use crate::db::users;
use crate::errors::{AppError, AppResult};
use crate::AppState;

// ============================================================================
// Request/Response Types
// ============================================================================

/// Request body for user registration
#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
    pub display_name: String,
}

/// Request body for user login
#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

/// User response without sensitive fields (no password_hash)
#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub email: String,
    pub display_name: String,
    pub created_at: DateTime<Utc>,
}

/// Response for successful authentication (login/register)
#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: UserResponse,
}

// ============================================================================
// Routes
// ============================================================================

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/auth/register", post(register))
        .route("/auth/login", post(login))
        .route("/auth/me", get(me))
    // OAuth routes - to be implemented
    // .route("/auth/oauth/google", post(oauth_google))
    // .route("/auth/oauth/github", post(oauth_github))
}

// ============================================================================
// Handlers
// ============================================================================

/// POST /api/auth/register - Register new user with email/password
async fn register(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<RegisterRequest>,
) -> AppResult<Json<AuthResponse>> {
    // Validate email format
    if !is_valid_email(&payload.email) {
        return Err(AppError::ValidationError(
            "Invalid email format".to_string(),
        ));
    }

    // Validate password length (minimum 8 characters)
    if payload.password.len() < 8 {
        return Err(AppError::ValidationError(
            "Password must be at least 8 characters".to_string(),
        ));
    }

    // Check if email already exists
    let existing_user = users::find_by_email(&state.db, &payload.email).await?;
    if existing_user.is_some() {
        return Err(AppError::AlreadyExists(
            "A user with this email already exists".to_string(),
        ));
    }

    // Hash the password
    let password_hash = hash_password(&payload.password)
        .map_err(|e| AppError::InternalError(format!("Failed to hash password: {}", e)))?;

    // Create the user
    let user = users::create_user(&state.db, &payload.email, &password_hash, &payload.display_name)
        .await?;

    // Create JWT token
    let token = create_token(
        user.id,
        &user.email,
        &state.config.jwt_secret,
        state.config.jwt_expiration_hours,
    )
    .map_err(|e| AppError::InternalError(format!("Failed to create token: {}", e)))?;

    // Build response
    let user_response = UserResponse {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        created_at: user.created_at,
    };

    Ok(Json(AuthResponse {
        token,
        user: user_response,
    }))
}

/// POST /api/auth/login - Login with email/password, returns JWT
async fn login(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginRequest>,
) -> AppResult<Json<AuthResponse>> {
    // Find user by email
    let user = users::find_by_email(&state.db, &payload.email)
        .await?
        .ok_or(AppError::InvalidCredentials)?;

    // Get password hash (OAuth users don't have one)
    let password_hash = user
        .password_hash
        .as_ref()
        .ok_or(AppError::InvalidCredentials)?;

    // Verify password
    let is_valid = verify_password(&payload.password, password_hash)
        .map_err(|e| AppError::InternalError(format!("Failed to verify password: {}", e)))?;

    if !is_valid {
        return Err(AppError::InvalidCredentials);
    }

    // Create JWT token
    let token = create_token(
        user.id,
        &user.email,
        &state.config.jwt_secret,
        state.config.jwt_expiration_hours,
    )
    .map_err(|e| AppError::InternalError(format!("Failed to create token: {}", e)))?;

    // Build response
    let user_response = UserResponse {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        created_at: user.created_at,
    };

    Ok(Json(AuthResponse {
        token,
        user: user_response,
    }))
}

/// GET /api/auth/me - Get current user profile (requires auth)
async fn me(
    State(state): State<Arc<AppState>>,
    auth_user: AuthUser,
) -> AppResult<Json<UserResponse>> {
    // Fetch full user from database
    let user = users::find_by_id(&state.db, auth_user.user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".to_string()))?;

    // Build response (without password_hash)
    let user_response = UserResponse {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        created_at: user.created_at,
    };

    Ok(Json(user_response))
}

// ============================================================================
// Helpers
// ============================================================================

/// Basic email validation using a simple regex pattern
fn is_valid_email(email: &str) -> bool {
    // Simple validation: contains @ with something before and after
    let parts: Vec<&str> = email.split('@').collect();
    if parts.len() != 2 {
        return false;
    }

    let local = parts[0];
    let domain = parts[1];

    // Local part must not be empty
    if local.is_empty() {
        return false;
    }

    // Domain must contain at least one dot and not be empty parts
    let domain_parts: Vec<&str> = domain.split('.').collect();
    if domain_parts.len() < 2 {
        return false;
    }

    // All domain parts must be non-empty
    domain_parts.iter().all(|part| !part.is_empty())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_emails() {
        assert!(is_valid_email("test@example.com"));
        assert!(is_valid_email("user.name@domain.co.uk"));
        assert!(is_valid_email("a@b.co"));
    }

    #[test]
    fn test_invalid_emails() {
        assert!(!is_valid_email("invalid"));
        assert!(!is_valid_email("@example.com"));
        assert!(!is_valid_email("test@"));
        assert!(!is_valid_email("test@example"));
        assert!(!is_valid_email("test@@example.com"));
        assert!(!is_valid_email("test@.com"));
        assert!(!is_valid_email("test@example."));
    }
}
