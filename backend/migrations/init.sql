-- TailorAI / Slang PostgreSQL Migration
-- Initial Schema: 10 Core Tables with pgvector support

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Resumes
CREATE TABLE IF NOT EXISTS master_resumes (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    tex_source TEXT NOT NULL,
    template_id VARCHAR(64) DEFAULT 'jakes_resume',
    parse_confidence NUMERIC(4, 2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Profile Items
CREATE TABLE IF NOT EXISTS profile_items (
    id VARCHAR(64) PRIMARY KEY,
    master_id VARCHAR(64) REFERENCES master_resumes(id) ON DELETE CASCADE,
    section VARCHAR(128) NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(64) DEFAULT 'extracted',
    status VARCHAR(32) DEFAULT 'extracted', -- 'extracted' or 'confirmed'
    locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Evidence Bank
CREATE TABLE IF NOT EXISTS evidence (
    id VARCHAR(64) PRIMARY KEY,
    profile_item_id VARCHAR(64) REFERENCES profile_items(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    skills JSONB DEFAULT '[]'::jsonb,
    domain VARCHAR(128) DEFAULT 'Engineering',
    source VARCHAR(64) DEFAULT 'master_resume',
    embedding vector(384),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Job Descriptions
CREATE TABLE IF NOT EXISTS job_descriptions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    raw_text TEXT NOT NULL,
    role VARCHAR(255) NOT NULL,
    seniority VARCHAR(64) DEFAULT 'Mid-Level',
    domain VARCHAR(128) DEFAULT 'Engineering',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Requirements
CREATE TABLE IF NOT EXISTS requirements (
    id VARCHAR(64) PRIMARY KEY,
    jd_id VARCHAR(64) REFERENCES job_descriptions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    kind VARCHAR(16) DEFAULT 'must', -- 'must' or 'nice'
    category VARCHAR(64) DEFAULT 'Essential',
    embedding vector(384),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Matches
CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(64) PRIMARY KEY,
    requirement_id VARCHAR(64) REFERENCES requirements(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL, -- 'direct', 'transferable', or 'missing'
    evidence_ids JSONB DEFAULT '[]'::jsonb,
    rationale TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Variants
CREATE TABLE IF NOT EXISTS variants (
    id VARCHAR(64) PRIMARY KEY,
    master_id VARCHAR(64) REFERENCES master_resumes(id) ON DELETE CASCADE,
    jd_id VARCHAR(64) REFERENCES job_descriptions(id) ON DELETE CASCADE,
    mode VARCHAR(64) DEFAULT 'Same career',
    tex TEXT NOT NULL,
    pdf_url TEXT,
    alignment_report JSONB DEFAULT '{}'::jsonb,
    parent_variant_id VARCHAR(64) REFERENCES variants(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Changes
CREATE TABLE IF NOT EXISTS changes (
    id VARCHAR(64) PRIMARY KEY,
    variant_id VARCHAR(64) REFERENCES variants(id) ON DELETE CASCADE,
    section VARCHAR(128) NOT NULL,
    before TEXT NOT NULL,
    after TEXT NOT NULL,
    reason TEXT NOT NULL,
    evidence_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    state VARCHAR(32) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'edited'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Compile Runs
CREATE TABLE IF NOT EXISTS compile_runs (
    id VARCHAR(64) PRIMARY KEY,
    variant_id VARCHAR(64) REFERENCES variants(id) ON DELETE CASCADE,
    ok BOOLEAN DEFAULT FALSE,
    log TEXT,
    pages INTEGER DEFAULT 1,
    checks JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performant lookups
CREATE INDEX IF NOT EXISTS idx_profile_items_master ON profile_items(master_id);
CREATE INDEX IF NOT EXISTS idx_evidence_profile ON evidence(profile_item_id);
CREATE INDEX IF NOT EXISTS idx_requirements_jd ON requirements(jd_id);
CREATE INDEX IF NOT EXISTS idx_matches_requirement ON matches(requirement_id);
CREATE INDEX IF NOT EXISTS idx_variants_master ON variants(master_id);
CREATE INDEX IF NOT EXISTS idx_variants_jd ON variants(jd_id);
CREATE INDEX IF NOT EXISTS idx_changes_variant ON changes(variant_id);
CREATE INDEX IF NOT EXISTS idx_compile_runs_variant ON compile_runs(variant_id);
