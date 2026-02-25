-- X-Autopilot-Assistant Database Schema
-- Optimized for SQLite 3.x

CREATE TABLE IF NOT EXISTS hype_events (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    source TEXT,
    velocity_score REAL,
    emotion_score REAL,
    controversy_score REAL,
    estimated_half_life REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS content_pieces (
    id TEXT PRIMARY KEY,
    event_id TEXT,
    text TEXT NOT NULL,
    format TEXT CHECK(format IN ('tweet', 'thread', 'reply')),
    category TEXT CHECK(category IN ('provocative', 'insight', 'controversial')),
    has_visual INTEGER DEFAULT 0,
    visual_url TEXT,
    scheduled_at DATETIME,
    executed_at DATETIME,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY(event_id) REFERENCES hype_events(id)
);

CREATE TABLE IF NOT EXISTS performance_metrics (
    content_id TEXT PRIMARY KEY,
    impressions INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    reposts INTEGER DEFAULT 0,
    follower_delta INTEGER DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(content_id) REFERENCES content_pieces(id)
);

CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT,
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
