use axum::{
    async_trait,
    extract::FromRequestParts,
    http::{request::Parts, StatusCode},
    response::{IntoResponse, Response},
    Json, RequestPartsExt,
};
use axum_extra::{
    headers::{authorization::Bearer, Authorization},
    TypedHeader,
};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

use crate::AppState;

/// JWT Claims structure containing user information and token metadata.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    /// Subject - the user ID as a string
    pub sub: String,
    /// User's email address
    pub email: String,
    /// Expiration timestamp (Unix timestamp)
    pub exp: usize,
    /// Issued at timestamp (Unix timestamp)
    pub iat: usize,
}

/// Authenticated user extracted from a valid JWT token.
/// Use this as an extractor in Axum handlers to require authentication.
#[derive(Debug, Clone)]
pub struct AuthUser {
    pub user_id: Uuid,
    pub email: String,
}

/// Error type for authentication failures.
#[derive(Debug)]
pub enum AuthError {
    InvalidToken,
    MissingToken,
    ExpiredToken,
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AuthError::InvalidToken => (StatusCode::UNAUTHORIZED, "Invalid or malformed token"),
            AuthError::MissingToken => (StatusCode::UNAUTHORIZED, "Missing authorization token"),
            AuthError::ExpiredToken => (StatusCode::UNAUTHORIZED, "Token has expired"),
        };

        let body = Json(serde_json::json!({
            "error": "unauthorized",
            "message": message
        }));

        (status, body).into_response()
    }
}

/// Create a new JWT token for a user.
///
/// # Arguments
/// * `user_id` - The user's UUID
/// * `email` - The user's email address
/// * `secret` - The JWT secret key
/// * `expiration_hours` - How many hours until the token expires
///
/// # Returns
/// The encoded JWT token string
pub fn create_token(
    user_id: Uuid,
    email: &str,
    secret: &str,
    expiration_hours: u64,
) -> Result<String, jsonwebtoken::errors::Error> {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .expect("Time went backwards")
        .as_secs() as usize;

    let expiration = now + (expiration_hours as usize * 3600);

    let claims = Claims {
        sub: user_id.to_string(),
        email: email.to_string(),
        exp: expiration,
        iat: now,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}

/// Validate and decode a JWT token.
///
/// # Arguments
/// * `token` - The JWT token string to validate
/// * `secret` - The JWT secret key
///
/// # Returns
/// The decoded Claims if valid
pub fn validate_token(token: &str, secret: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )?;

    Ok(token_data.claims)
}

#[async_trait]
impl FromRequestParts<Arc<AppState>> for AuthUser {
    type Rejection = AuthError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &Arc<AppState>,
    ) -> Result<Self, Self::Rejection> {
        // Extract the Authorization header
        let TypedHeader(Authorization(bearer)) = parts
            .extract::<TypedHeader<Authorization<Bearer>>>()
            .await
            .map_err(|_| AuthError::MissingToken)?;

        // Get the token from the bearer
        let token = bearer.token();

        // Validate the token using the secret from config
        let claims = validate_token(token, &state.config.jwt_secret)
            .map_err(|e| {
                match e.kind() {
                    jsonwebtoken::errors::ErrorKind::ExpiredSignature => AuthError::ExpiredToken,
                    _ => AuthError::InvalidToken,
                }
            })?;

        // Parse the user_id from the subject claim
        let user_id = Uuid::parse_str(&claims.sub)
            .map_err(|_| AuthError::InvalidToken)?;

        Ok(AuthUser {
            user_id,
            email: claims.email,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_and_validate_token() {
        let user_id = Uuid::new_v4();
        let email = "test@example.com";
        let secret = "test_secret_key_for_testing";
        let expiration_hours = 24;

        let token = create_token(user_id, email, secret, expiration_hours)
            .expect("Failed to create token");

        let claims = validate_token(&token, secret)
            .expect("Failed to validate token");

        assert_eq!(claims.sub, user_id.to_string());
        assert_eq!(claims.email, email);
    }

    #[test]
    fn test_invalid_secret_fails_validation() {
        let user_id = Uuid::new_v4();
        let email = "test@example.com";
        let secret = "correct_secret";
        let wrong_secret = "wrong_secret";

        let token = create_token(user_id, email, secret, 24)
            .expect("Failed to create token");

        let result = validate_token(&token, wrong_secret);
        assert!(result.is_err());
    }

    #[test]
    fn test_expired_token_fails() {
        let user_id = Uuid::new_v4();
        let email = "test@example.com";
        let secret = "test_secret";

        // Create a token that expires in 0 hours (immediately expired)
        // We need to manually create an expired token for this test
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as usize;

        let claims = Claims {
            sub: user_id.to_string(),
            email: email.to_string(),
            exp: now - 3600, // Expired 1 hour ago
            iat: now - 7200,
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(secret.as_bytes()),
        ).expect("Failed to create token");

        let result = validate_token(&token, secret);
        assert!(result.is_err());
    }
}
