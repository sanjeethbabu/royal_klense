-- Run this SQL in your Supabase SQL Editor (https://supabase.com -> SQL Editor)

CREATE TABLE IF NOT EXISTS enquiries (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  message TEXT,
  type TEXT DEFAULT 'contact',
  position TEXT,
  education TEXT,
  experience TEXT,
  city TEXT,
  state TEXT,
  resume_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
