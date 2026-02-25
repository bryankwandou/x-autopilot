import sqlite3
import os

def init_db():
    db_path = 'data/system.db'
    os.makedirs('data', exist_ok=True)
    os.makedirs('data/logs', exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    with open('database_schema.sql', 'r') as f:
        schema = f.read()
        cursor.executescript(schema)
    
    conn.commit()
    conn.close()
    print(f"Database initialized at {db_path}")

if __name__ == "__main__":
    init_db()
