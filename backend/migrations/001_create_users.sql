-- Migration: Create Users Table
--
-- This SQL script creates the 'users' table in our PostgreSQL database.
-- It runs when we execute `sqlx migrate run`.

CREATE TABLE users (
    -- id: The primary key (unique identifier) for each user.
    -- UUID (Universally Unique Identifier) is better than auto-incrementing integers
    -- for security (unpredictable) and distributed systems.
    -- DEFAULT gen_random_uuid() tells Postgres to generate a new UUID if we don't supply one.
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- email: The user's email address.
    -- VARCHAR(320) is the maximum standard length for an email.
    -- NOT NULL means this field is required.
    -- UNIQUE ensures no two users can register with the same email.
    email           VARCHAR(320) NOT NULL UNIQUE,

    -- password_hash: The encrypted version of the user's password.
    -- We NEVER store plain text passwords.
    -- VARCHAR(256) is plenty of space for Argon2 hashes.
    -- It is NULL (optional) because users logging in with Google/GitHub won't have a password here.
    password_hash   VARCHAR(256),

    -- display_name: The name shown in the UI (e.g., "Chase").
    display_name    VARCHAR(100) NOT NULL,

    -- oauth_provider: Tracks which service the user used to login (e.g., 'google', 'github').
    -- NULL if they signed up with email/password.
    oauth_provider  VARCHAR(50),

    -- oauth_id: The unique user ID provided by Google or GitHub.
    -- This ensures we can find the correct user when they log in via OAuth again.
    oauth_id        VARCHAR(256),

    -- created_at: Timestamp of when the account was created.
    -- TIMESTAMPTZ (Timestamp with Time Zone) is the best practice for storing time.
    -- DEFAULT NOW() automatically sets this to the current time on insert.
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- updated_at: Timestamp of the last update to this row.
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- CONSTRAINT: Unique OAuth Account
    -- Ensures we don't link the same Google/GitHub account to multiple users.
    -- A user is unique based on the combination of provider + provider's ID.
    UNIQUE(oauth_provider, oauth_id)
);
