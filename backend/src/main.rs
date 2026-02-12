use std::sync::Arc;
use axum::Router;
use sqlx::postgres::PgPoolOptions;
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use sqlx::PgPool;
use tower_http::trace::TraceLayer;    


mod config;
mod routes;
use config::Config;

pub struct AppState {
   pub db: PgPool,
   pub config: Config,
}


#[tokio::main]
async fn main() {
    // Load .env file
    dotenvy::dotenv().ok();

    // Initialize tracing and logging 
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "herald_backend=debug".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // 3. Connect to DB
    let config = Config::from_env();
    
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&config.database_url)
        .await
        .expect("Failed to connect to DB");

    // 4. Run Migrations (Optional)
    sqlx::migrate!().run(&pool).await.unwrap();
    let addr = format!("{}:{}", config.host, config.port);
    // 5. Create App State
    let state = Arc::new(AppState { db: pool, config });
    
    //6. Build Application Router with CORS + TraceLayer + state 
    let app = Router::new()
        .merge(routes::create_routes())
        .layer(TraceLayer::new_for_http())
        .layer(CorsLayer::permissive())
        .with_state(state);
    // 7. Server Time 
    let listener = TcpListener::bind(&addr).await.unwrap();
    tracing::info!("Server running on {}", addr);
    axum::serve(listener, app).await.unwrap();
}
