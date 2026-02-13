//! Authentication module for the Herald RSS reader.
//!
//! This module provides:
//! - Password hashing and verification using Argon2
//! - JWT token creation and validation
//! - Axum extractor for authenticated requests

mod jwt;
mod password;

// Re-export key types and functions
pub use jwt::{AuthUser, Claims, create_token, validate_token, AuthError};
pub use password::{hash_password, verify_password};
