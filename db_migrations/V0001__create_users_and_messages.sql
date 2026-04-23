
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_color TEXT DEFAULT 'from-purple-500 to-pink-500',
  created_at TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversation_members (
  conversation_id INTEGER REFERENCES conversations(id),
  user_id INTEGER REFERENCES users(id),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id),
  sender_id INTEGER REFERENCES users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
