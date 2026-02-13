use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;

/// Application error types
#[derive(Debug)]
pub enum AppError {
    // Auth errors
    Unauthorized,
    InvalidCredentials,
    InvalidToken,
    TokenExpired,

    // Resource errors
    NotFound(String),
    AlreadyExists(String),

    // Validation errors
    ValidationError(String),

    // Database errors
    DatabaseError(String),

    // External service errors
    ExternalServiceError(String),

    // AI provider errors
    AIProviderError(String),

    // Rate limiting
    RateLimited,

    // Generic internal error
    InternalError(String),
}

/// Error response body sent to clients
#[derive(Serialize)]
struct ErrorResponse {
    error: String,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    details: Option<String>,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_type, message, details) = match self {
            // 401 Unauthorized
            AppError::Unauthorized => (
                StatusCode::UNAUTHORIZED,
                "unauthorized",
                "Authentication required",
                None,
            ),
            AppError::InvalidCredentials => (
                StatusCode::UNAUTHORIZED,
                "invalid_credentials",
                "Invalid email or password",
                None,
            ),
            AppError::InvalidToken => (
                StatusCode::UNAUTHORIZED,
                "invalid_token",
                "Invalid or malformed token",
                None,
            ),
            AppError::TokenExpired => (
                StatusCode::UNAUTHORIZED,
                "token_expired",
                "Token has expired",
                None,
            ),

            // 404 Not Found
            AppError::NotFound(resource) => (
                StatusCode::NOT_FOUND,
                "not_found",
                "Resource not found",
                Some(resource),
            ),

            // 409 Conflict
            AppError::AlreadyExists(resource) => (
                StatusCode::CONFLICT,
                "already_exists",
                "Resource already exists",
                Some(resource),
            ),

            // 400 Bad Request
            AppError::ValidationError(msg) => (
                StatusCode::BAD_REQUEST,
                "validation_error",
                "Validation failed",
                Some(msg),
            ),

            // 429 Too Many Requests
            AppError::RateLimited => (
                StatusCode::TOO_MANY_REQUESTS,
                "rate_limited",
                "Too many requests, please slow down",
                None,
            ),

            // 502 Bad Gateway (external services)
            AppError::ExternalServiceError(msg) => (
                StatusCode::BAD_GATEWAY,
                "external_service_error",
                "External service error",
                Some(msg),
            ),
            AppError::AIProviderError(msg) => (
                StatusCode::BAD_GATEWAY,
                "ai_provider_error",
                "AI provider error",
                Some(msg),
            ),

            // 500 Internal Server Error
            AppError::DatabaseError(msg) => {
                // Log the actual error but don't expose it to clients
                tracing::error!("Database error: {}", msg);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "database_error",
                    "A database error occurred",
                    None,
                )
            }
            AppError::InternalError(msg) => {
                tracing::error!("Internal error: {}", msg);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "internal_error",
                    "An internal error occurred",
                    None,
                )
            }
        };

        let body = Json(ErrorResponse {
            error: error_type.to_string(),
            message: message.to_string(),
            details,
        });

        (status, body).into_response()
    }
}

// Convenience conversion from SQLx errors
impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        match err {
            sqlx::Error::RowNotFound => AppError::NotFound("Record not found".to_string()),
            sqlx::Error::Database(db_err) => {
                // Check for unique constraint violations
                if let Some(code) = db_err.code() {
                    if code == "23505" {
                        return AppError::AlreadyExists("Record already exists".to_string());
                    }
                }
                AppError::DatabaseError(db_err.to_string())
            }
            _ => AppError::DatabaseError(err.to_string()),
        }
    }
}

/// Result type alias for handlers
pub type AppResult<T> = Result<T, AppError>;
