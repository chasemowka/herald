use std::sync::Arc;
use axum::Router;
use sqlx::postgres::PgPoolOptions;
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use sqlx::PgPool;
use std::env;
use tower_http::trace::TraceLayer;    


// mod config;
mod routes;
pub struct AppState {
   db: PgPool,
}

const ADDR: &str = "0.0.0.0:8080";


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
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");
    
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to DB");

    // 4. Run Migrations (Optional)
    // sqlx::migrate!().run(&pool).await.unwrap();

    // 5. Create App State
    let state = Arc::new(AppState { db: pool });
    
    //6. Build Application Router with CORS + TraceLayer + state 
    let app = Router::new()
        .merge(routes::create_routes())
        .layer(TraceLayer::new_for_http())
        .layer(CorsLayer::permissive())
        .with_state(state);
    // 7. Server Time 
    let listener = TcpListener::bind(ADDR).await.unwrap();
    tracing::info!("Server running on {}", ADDR);
    axum::serve(listener, app).await.unwrap();
}
