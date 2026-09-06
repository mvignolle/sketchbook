-- Create collections table
CREATE TABLE collections (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  description TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,
  session_id TEXT NOT NULL,
  total_sketches INTEGER DEFAULT 0,
  idea_count INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_collections_session_id ON collections(session_id);
CREATE INDEX idx_collections_share_token ON collections(share_token);
CREATE INDEX idx_collections_created_at ON collections(created_at DESC);

-- Create sketch_groups table
CREATE TABLE sketch_groups (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sketch_groups_collection_id ON sketch_groups(collection_id);
CREATE INDEX idx_sketch_groups_collection_position ON sketch_groups(collection_id, position);

-- Create sketches table
CREATE TABLE sketches (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  group_id TEXT NOT NULL REFERENCES sketch_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  layout JSONB NOT NULL,
  concept_variations TEXT[] DEFAULT ARRAY[]::TEXT[],
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_sketches_collection_id ON sketches(collection_id);
CREATE INDEX idx_sketches_group_id ON sketches(group_id);
CREATE INDEX idx_sketches_vote_count ON sketches(vote_count DESC);
CREATE INDEX idx_sketches_created_at ON sketches(created_at DESC);

-- Create votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sketch_id TEXT NOT NULL REFERENCES sketches(id) ON DELETE CASCADE,
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sketch_id, session_id)
);

CREATE INDEX idx_votes_sketch_id ON votes(sketch_id);
CREATE INDEX idx_votes_collection_id ON votes(collection_id);
CREATE INDEX idx_votes_session_id ON votes(session_id);
CREATE INDEX idx_votes_sketch_session ON votes(sketch_id, session_id);

-- Create generation_records table
CREATE TABLE generation_records (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  idea_count INTEGER NOT NULL,
  prompt TEXT NOT NULL,
  additional_instruction TEXT,
  result_sketch_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_generation_records_collection_id ON generation_records(collection_id);

-- Create sessions table
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_info TEXT,
  ip_hash TEXT,
  is_anonymous BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_sessions_last_activity ON sessions(last_activity);

-- Enable RLS on all tables
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sketch_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE sketches ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Collections RLS: Owner (session_id) can read/write; public shares are readable
CREATE POLICY collections_owner_rw ON collections
  FOR ALL USING (session_id = current_setting('app.session_id', true));

CREATE POLICY collections_public_read ON collections
  FOR SELECT USING (is_published = TRUE AND share_token IS NOT NULL);

-- Sketch Groups RLS: Inherit from parent collection
CREATE POLICY sketch_groups_owner_write ON sketch_groups
  FOR ALL USING (collection_id IN (
    SELECT id FROM collections WHERE session_id = current_setting('app.session_id', true)
  ));

CREATE POLICY sketch_groups_public_read ON sketch_groups
  FOR SELECT USING (collection_id IN (
    SELECT id FROM collections WHERE is_published = TRUE
  ));

-- Sketches RLS: Owner and public shares
CREATE POLICY sketches_owner_write ON sketches
  FOR ALL USING (collection_id IN (
    SELECT id FROM collections WHERE session_id = current_setting('app.session_id', true)
  ));

CREATE POLICY sketches_public_read ON sketches
  FOR SELECT USING (collection_id IN (
    SELECT id FROM collections WHERE is_published = TRUE
  ));

-- Votes RLS: Anyone can add; owner can read all
CREATE POLICY votes_public_add ON votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY votes_read_owned ON votes
  FOR SELECT USING (session_id = current_setting('app.session_id', true)
    OR collection_id IN (SELECT id FROM collections WHERE session_id = current_setting('app.session_id', true)));

-- Generation Records RLS: Inherit from collection
CREATE POLICY generation_records_owner_read ON generation_records
  FOR SELECT USING (collection_id IN (
    SELECT id FROM collections WHERE session_id = current_setting('app.session_id', true)
  ));

-- Sessions RLS: Users can only see their own
CREATE POLICY sessions_owner_all ON sessions
  FOR ALL USING (id = current_setting('app.session_id', true));
