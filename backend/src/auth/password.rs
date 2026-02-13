use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};

/// Hash a password using Argon2 with default parameters.
///
/// # Arguments
/// * `password` - The plain text password to hash
///
/// # Returns
/// The hashed password as a PHC string format
pub fn hash_password(password: &str) -> Result<String, argon2::password_hash::Error> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2.hash_password(password.as_bytes(), &salt)?;
    Ok(password_hash.to_string())
}

/// Verify a password against a stored hash.
///
/// # Arguments
/// * `password` - The plain text password to verify
/// * `hash` - The stored password hash in PHC string format
///
/// # Returns
/// `true` if the password matches, `false` otherwise
pub fn verify_password(password: &str, hash: &str) -> Result<bool, argon2::password_hash::Error> {
    let parsed_hash = PasswordHash::new(hash)?;
    let argon2 = Argon2::default();
    match argon2.verify_password(password.as_bytes(), &parsed_hash) {
        Ok(()) => Ok(true),
        Err(argon2::password_hash::Error::Password) => Ok(false),
        Err(e) => Err(e),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_and_verify_password() {
        let password = "my_secure_password123";
        let hash = hash_password(password).expect("Failed to hash password");

        // Verify correct password
        assert!(verify_password(password, &hash).expect("Failed to verify"));

        // Verify incorrect password
        assert!(!verify_password("wrong_password", &hash).expect("Failed to verify"));
    }

    #[test]
    fn test_different_hashes_for_same_password() {
        let password = "test_password";
        let hash1 = hash_password(password).expect("Failed to hash");
        let hash2 = hash_password(password).expect("Failed to hash");

        // Each hash should be different due to random salt
        assert_ne!(hash1, hash2);

        // But both should verify correctly
        assert!(verify_password(password, &hash1).expect("Failed to verify"));
        assert!(verify_password(password, &hash2).expect("Failed to verify"));
    }
}
