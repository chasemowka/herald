use std::env;

#[derive(Clone)]
pub struct Config {
 //Database 
    pub database_url: String,
    
    //Server 
    pub host: String,
    pub port: u16, 

    //JWT
    pub jwt_secret: String,
    pub jwt_expiration_hours: u64,

    //OAuth
    // pub google_client_id: String,
    // etc.

    //Feed Settings
    pub max_feeds_per_user: i32,
    pub article_retention_days: i32,
}

impl Config { 
    pub fn from_env() -> Self {
        let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

        let port: u16 = env::var("BACKEND_PORT")
            .unwrap_or_else(|_| "8080".to_string())
            .parse()
            .expect("BACKEND_PORT must be a valid number");

        let host = env::var("BACKEND_HOST")
            .unwrap_or_else(|_| "0.0.0.0".to_string());

        let jwt_secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");

        let jwt_expiration_hours: u64 = env::var("JWT_EXPIRATION_HOURS")
            .unwrap_or_else(|_| "24".to_string())
            .parse()
            .expect("JWT_EXPIRATION_HOURS must be a valid number");

       let max_feeds_per_user: i32 = env::var("MAX_FEEDS_PER_USER")
          .unwrap_or_else(|_| "50".to_string())
          .parse()
          .expect("MAX_FEEDS_PER_USER must be a valid number");
      
        let article_retention_days: i32 = env::var("ARTICLE_RETENTION_DAYS")
            .unwrap_or_else(|_| "7".to_string())
            .parse()
            .expect("ARTICLE_RETENTION_DAYS must be a valid number");

        Self { 
            database_url,
            host,
            port,
            jwt_secret,
            jwt_expiration_hours,
            max_feeds_per_user,
            article_retention_days,
        }
    }
}