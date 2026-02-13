//! RSS/Atom feed fetcher service.
//!
//! This module provides functionality to fetch and parse RSS/Atom feeds,
//! storing new articles in the database.

use feed_rs::parser;
use reqwest::Client;
use sqlx::PgPool;
use std::time::Duration;
use uuid::Uuid;

use crate::db::{articles, feeds};
use crate::models::feed::Feed;

/// Result of fetching a single feed.
#[derive(Debug, Clone)]
pub struct FetchResult {
    /// The ID of the feed that was fetched.
    pub feed_id: Uuid,
    /// Number of articles successfully fetched/created.
    pub articles_fetched: usize,
    /// Errors encountered while processing individual entries (non-fatal).
    pub errors: Vec<String>,
}

/// Errors that can occur during feed fetching.
#[derive(Debug)]
pub enum FetchError {
    /// HTTP request failed.
    HttpError(reqwest::Error),
    /// Failed to parse the feed content.
    ParseError(feed_rs::parser::ParseFeedError),
    /// Database operation failed.
    DatabaseError(sqlx::Error),
}

impl std::fmt::Display for FetchError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            FetchError::HttpError(e) => write!(f, "HTTP error: {}", e),
            FetchError::ParseError(e) => write!(f, "Parse error: {}", e),
            FetchError::DatabaseError(e) => write!(f, "Database error: {}", e),
        }
    }
}

impl std::error::Error for FetchError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            FetchError::HttpError(e) => Some(e),
            FetchError::ParseError(e) => Some(e),
            FetchError::DatabaseError(e) => Some(e),
        }
    }
}

impl From<reqwest::Error> for FetchError {
    fn from(err: reqwest::Error) -> Self {
        FetchError::HttpError(err)
    }
}

impl From<feed_rs::parser::ParseFeedError> for FetchError {
    fn from(err: feed_rs::parser::ParseFeedError) -> Self {
        FetchError::ParseError(err)
    }
}

impl From<sqlx::Error> for FetchError {
    fn from(err: sqlx::Error) -> Self {
        FetchError::DatabaseError(err)
    }
}

/// Service for fetching and parsing RSS/Atom feeds.
pub struct FeedFetcher {
    client: Client,
    pool: PgPool,
}

impl FeedFetcher {
    /// Create a new FeedFetcher with reasonable defaults.
    ///
    /// Configures the HTTP client with:
    /// - 30 second timeout
    /// - Custom User-Agent identifying the Herald RSS reader
    pub fn new(pool: PgPool) -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .user_agent("Herald-RSS-Reader/1.0 (https://github.com/herald-rss)")
            .build()
            .expect("Failed to build HTTP client");

        Self { client, pool }
    }

    /// Fetch a single feed and store new articles.
    ///
    /// # Arguments
    /// * `feed_id` - The database ID of the feed
    /// * `url` - The URL of the RSS/Atom feed
    ///
    /// # Returns
    /// A `FetchResult` containing the count of new articles and any non-fatal errors.
    pub async fn fetch_feed(&self, feed_id: Uuid, url: &str) -> Result<FetchResult, FetchError> {
        // Fetch the feed content via HTTP
        let response = self.client.get(url).send().await?;
        let bytes = response.bytes().await?;

        // Parse the feed using feed-rs
        let feed = parser::parse(&bytes[..])?;

        let mut articles_fetched = 0;
        let mut errors = Vec::new();

        // Process each entry in the feed
        for entry in feed.entries {
            // Extract article fields from the entry
            let title = entry
                .title
                .map(|t| t.content)
                .unwrap_or_else(|| "Untitled".to_string());

            let url = match entry.links.first() {
                Some(link) => link.href.clone(),
                None => {
                    errors.push(format!(
                        "Entry '{}' has no URL, skipping",
                        entry.id
                    ));
                    continue;
                }
            };

            let author = entry.authors.first().map(|a| a.name.clone());
            let summary = entry.summary.map(|s| s.content);
            let content = entry.content.and_then(|c| c.body);
            let published_at = entry.published.or(entry.updated);
            let guid = Some(entry.id);

            // Create the article in the database
            match articles::create_article(
                &self.pool,
                feed_id,
                &title,
                &url,
                author.as_deref(),
                summary.as_deref(),
                content.as_deref(),
                published_at,
                guid.as_deref(),
            )
            .await
            {
                Ok(_) => {
                    articles_fetched += 1;
                }
                Err(e) => {
                    errors.push(format!("Failed to create article '{}': {}", title, e));
                }
            }
        }

        // Update the feed's last_fetched_at timestamp
        feeds::update_last_fetched(&self.pool, feed_id).await?;

        Ok(FetchResult {
            feed_id,
            articles_fetched,
            errors,
        })
    }

    /// Fetch all feeds that a user is subscribed to.
    ///
    /// If one feed fails, continues with the remaining feeds.
    ///
    /// # Arguments
    /// * `user_id` - The ID of the user whose feeds should be fetched
    ///
    /// # Returns
    /// A vector of `FetchResult` for each feed that was successfully fetched.
    /// Feeds that failed completely will have their errors logged but won't
    /// prevent other feeds from being fetched.
    pub async fn fetch_all_user_feeds(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<FetchResult>, FetchError> {
        // Get all feeds the user is subscribed to
        let user_feeds: Vec<Feed> = feeds::list_user_feeds(&self.pool, user_id).await?;

        let mut results = Vec::new();

        for feed in user_feeds {
            match self.fetch_feed(feed.id, &feed.url).await {
                Ok(result) => {
                    tracing::info!(
                        feed_id = %feed.id,
                        feed_title = %feed.title,
                        articles_fetched = result.articles_fetched,
                        "Successfully fetched feed"
                    );
                    results.push(result);
                }
                Err(e) => {
                    // Log the error but continue with other feeds
                    tracing::error!(
                        feed_id = %feed.id,
                        feed_title = %feed.title,
                        error = %e,
                        "Failed to fetch feed"
                    );
                    // Include a result with zero articles and the error
                    results.push(FetchResult {
                        feed_id: feed.id,
                        articles_fetched: 0,
                        errors: vec![format!("Feed fetch failed: {}", e)],
                    });
                }
            }
        }

        Ok(results)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fetch_error_display() {
        let http_err = FetchError::HttpError(
            reqwest::Client::new()
                .get("invalid://url")
                .build()
                .unwrap_err(),
        );
        assert!(http_err.to_string().contains("HTTP error"));
    }
}
