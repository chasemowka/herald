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

    //AI Models 
    pub ollama_url: String,
    pub ollama_model: String, 
    pub anthropic_api_key: Option<String>,
    pub claude_model: String,
    pub grok_api_key: Option<String>,
    pub grok_model: String,
    pub ai_default_provider: String,
    pub ai_analysis_batch_size: i32,
    pub ai_analysis_enabled: bool,

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
        let ollama_url = env::var("OLLAMA_URL")
            .unwrap_or_else(|_| "http://localhost:11434".to_string());
            
        let ollama_model = env::var("OLLAMA_MODEL")
            .unwrap_or_else(|_| "llama3".to_string());

        let anthropic_api_key: Option<String> = env::var("ANTHROPIC_API_KEY").ok();

        let claude_model = env::var("CLAUDE_MODEL")
            .unwrap_or_else(|_| "claude-sonnet-4-20250514".to_string());

        let grok_api_key: Option<String> = env::var("GROK_API_KEY").ok();

        let grok_model = env::var("GROK_MODEL")
            .unwrap_or_else(|_| "grok-4.1-fast".to_string());
        
        let ai_default_provider = env::var("AI_DEFAULT_PROVIDER")
            .unwrap_or_else(|_| "ollama".to_string());

        let ai_analysis_batch_size: i32 = env::var("AI_ANALYSIS_BATCH_SIZE")
            .unwrap_or_else(|_| "10".to_string())
            .parse()
            .expect("AI_ANALYSIS_BATCH_SIZE must be a valid number");
        
        let ai_analysis_enabled: bool = env::var("AI_ANALYSIS_ENABLED")
            .unwrap_or_else(|_| "true".to_string())
            .parse()
            .expect("AI_ANALYSIS_ENABLED must be true or false");

        Self { 
            database_url,
            host,
            port,
            jwt_secret,
            jwt_expiration_hours,
            max_feeds_per_user,
            article_retention_days,
            ollama_url,
            ollama_model,
            anthropic_api_key,
            claude_model,
            grok_api_key,
            grok_model,
            ai_default_provider,
            ai_analysis_batch_size,
            ai_analysis_enabled,
        }
    }
}