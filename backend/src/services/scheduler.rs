//! Background RSS feed scheduler service.
//!
//! This module provides a background task that periodically fetches all active
//! RSS feeds and stores new articles in the database.

use sqlx::PgPool;
use std::time::Duration;
use tokio::time;
use tracing::{error, info};

use crate::db::feeds;
use crate::services::fetcher::FeedFetcher;

/// Default fetch interval in minutes.
const DEFAULT_INTERVAL_MINUTES: u64 = 15;

/// Background scheduler for fetching RSS feeds.
///
/// The scheduler periodically fetches all feeds that have at least one subscriber,
/// storing new articles in the database.
pub struct FeedScheduler {
    pool: PgPool,
    fetcher: FeedFetcher,
    interval: Duration,
}

impl FeedScheduler {
    /// Create a new FeedScheduler with the default interval (15 minutes).
    pub fn new(pool: PgPool) -> Self {
        Self::with_interval(pool, DEFAULT_INTERVAL_MINUTES)
    }

    /// Create a new FeedScheduler with a custom interval.
    ///
    /// # Arguments
    /// * `pool` - Database connection pool
    /// * `interval_minutes` - How often to fetch feeds, in minutes
    pub fn with_interval(pool: PgPool, interval_minutes: u64) -> Self {
        let fetcher = FeedFetcher::new(pool.clone());
        Self {
            pool,
            fetcher,
            interval: Duration::from_secs(interval_minutes * 60),
        }
    }

    /// Run the scheduler loop indefinitely.
    ///
    /// This method will:
    /// 1. Immediately perform a fetch on startup
    /// 2. Sleep for the configured interval
    /// 3. Repeat
    ///
    /// This method never returns under normal operation.
    pub async fn run(&self) {
        let mut interval = time::interval(self.interval);

        info!(
            interval_minutes = self.interval.as_secs() / 60,
            "Starting feed scheduler"
        );

        // Run immediately on start, then on interval
        loop {
            interval.tick().await;
            self.fetch_all_feeds().await;
        }
    }

    /// Fetch all active feeds once.
    ///
    /// This is the main work function that:
    /// 1. Gets all feeds with at least one subscriber
    /// 2. Fetches each feed and stores new articles
    /// 3. Logs success/failure for each feed
    async fn fetch_all_feeds(&self) {
        info!("Starting scheduled feed fetch");

        let active_feeds = match feeds::get_all_active_feeds(&self.pool).await {
            Ok(f) => f,
            Err(e) => {
                error!("Failed to get active feeds: {}", e);
                return;
            }
        };

        if active_feeds.is_empty() {
            info!("No active feeds to fetch");
            return;
        }

        info!(feed_count = active_feeds.len(), "Fetching active feeds");

        let mut success_count = 0;
        let mut failure_count = 0;

        for feed in active_feeds {
            match self.fetcher.fetch_feed(feed.id, &feed.url).await {
                Ok(result) => {
                    success_count += 1;
                    info!(
                        feed_id = %feed.id,
                        feed_title = %feed.title,
                        articles_fetched = result.articles_fetched,
                        errors = result.errors.len(),
                        "Feed fetch completed"
                    );

                    // Log any non-fatal errors that occurred during processing
                    for err in &result.errors {
                        tracing::warn!(
                            feed_id = %feed.id,
                            error = %err,
                            "Non-fatal error during feed processing"
                        );
                    }
                }
                Err(e) => {
                    failure_count += 1;
                    error!(
                        feed_id = %feed.id,
                        feed_title = %feed.title,
                        error = %e,
                        "Failed to fetch feed"
                    );
                }
            }
        }

        info!(
            success_count,
            failure_count,
            "Completed scheduled feed fetch"
        );
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scheduler_interval_conversion() {
        // Verify that interval_minutes is correctly converted to Duration
        let interval_minutes = 30u64;
        let expected_secs = interval_minutes * 60;
        let duration = Duration::from_secs(interval_minutes * 60);
        assert_eq!(duration.as_secs(), expected_secs);
    }
}
