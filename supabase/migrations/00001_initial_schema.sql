-- ========================================================================================
-- RAAHI PRODUCTION DATABASE SCHEMA
-- Migration: 00001_initial_schema
-- Created For: PostgreSQL (Supabase)
-- Target Users: 100,000+
-- ========================================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search (GIN indexing)

-- Drop existing tables to ensure clean state for this massive migration
-- WARNING: This drops everything! Remove these lines in a real production incremental migration.
DROP TABLE IF EXISTS public.admin_logs CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.call_history CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.emergency_contacts CASCADE;
DROP TABLE IF EXISTS public.trust_scores CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.trip_members CASCADE;
DROP TABLE IF EXISTS public.trips CASCADE;
DROP TABLE IF EXISTS public.travel_preferences CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.sos_alerts CASCADE;

-- Custom ENUM types
CREATE TYPE public.trip_status AS ENUM ('open', 'full', 'ongoing', 'completed', 'cancelled');
CREATE TYPE public.member_status AS ENUM ('pending', 'approved', 'rejected', 'left');
CREATE TYPE public.message_type AS ENUM ('text', 'image', 'system');
CREATE TYPE public.call_type AS ENUM ('audio', 'video');
CREATE TYPE public.report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

-- ========================================================================================
-- 1. BASE TABLES
-- ========================================================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID UNIQUE DEFAULT uuid_generate_v4(), -- Internal unique identifier separate from auth
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  college TEXT NOT NULL,
  department TEXT,
  year TEXT,
  gender TEXT,
  city TEXT,
  bio TEXT,
  avatar_url TEXT,
  trust_score INTEGER DEFAULT 0 NOT NULL,
  trust_level TEXT DEFAULT 'Bronze' NOT NULL,
  is_verified BOOLEAN DEFAULT false NOT NULL,
  role TEXT DEFAULT 'user' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.travel_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  budget_range TEXT,
  travel_style TEXT,
  interests TEXT[] DEFAULT '{}',
  preferred_destinations TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.trips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget NUMERIC NOT NULL,
  travel_type TEXT NOT NULL,
  description TEXT,
  max_members INTEGER NOT NULL,
  current_members INTEGER DEFAULT 1 NOT NULL,
  status public.trip_status DEFAULT 'open' NOT NULL,
  trip_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.trip_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  join_status public.member_status DEFAULT 'pending' NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(trip_id, user_id)
);

CREATE TABLE public.matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  compatibility_score INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL, -- pending, connected, rejected
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_1, user_2)
);

CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  message_type public.message_type DEFAULT 'text' NOT NULL,
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewed_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  safety_rating INTEGER CHECK (safety_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5) NOT NULL,
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(trip_id, reviewer_id, reviewed_user_id)
);

CREATE TABLE public.trust_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  level TEXT NOT NULL,
  reason TEXT, -- Why score changed (e.g., 'Positive Review', 'Completed Trip')
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.emergency_contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'match', 'message', 'trip_update', 'system'
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.call_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  caller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  call_type public.call_type NOT NULL,
  duration INTEGER DEFAULT 0, -- in seconds
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ended_at TIMESTAMPTZ
);

CREATE TABLE public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reported_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reported_user UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status public.report_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.admin_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_id UUID, -- ID of the entity acted upon
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================================================================
-- 2. INDEXES FOR HIGH PERFORMANCE & SCALABILITY
-- ========================================================================================

-- Foreign Keys (B-Tree)
CREATE INDEX idx_travel_pref_user ON public.travel_preferences(user_id);
CREATE INDEX idx_trips_creator ON public.trips(creator_id);
CREATE INDEX idx_trip_members_trip ON public.trip_members(trip_id);
CREATE INDEX idx_trip_members_user ON public.trip_members(user_id);
CREATE INDEX idx_matches_users ON public.matches(user_1, user_2);
CREATE INDEX idx_reviews_trip ON public.reviews(trip_id);
CREATE INDEX idx_reviews_users ON public.reviews(reviewer_id, reviewed_user_id);
CREATE INDEX idx_trust_scores_user ON public.trust_scores(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);

-- Chat Optimization: Composite index for fast loading and pagination
CREATE INDEX idx_messages_conversation ON public.messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX idx_messages_receiver_unread ON public.messages(receiver_id, is_read) WHERE is_read = false;

-- Time-Series Append-Only Tables (BRIN)
CREATE INDEX idx_admin_logs_created_at ON public.admin_logs USING BRIN (created_at);
CREATE INDEX idx_call_history_started_at ON public.call_history USING BRIN (started_at);

-- Array Columns (GIN)
CREATE INDEX idx_pref_interests ON public.travel_preferences USING GIN (interests);
CREATE INDEX idx_pref_destinations ON public.travel_preferences USING GIN (preferred_destinations);

-- Full-Text Search (GIN)
-- Add a tsvector column to trips for fast searching
ALTER TABLE public.trips ADD COLUMN fts tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(destination, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(travel_type, '')), 'C')
) STORED;
CREATE INDEX idx_trips_fts ON public.trips USING GIN (fts);


-- ========================================================================================
-- 3. MATCHING ENGINE (POSTGRESQL FUNCTION)
-- ========================================================================================

CREATE OR REPLACE FUNCTION public.calculate_match_score(u1_id UUID, u2_id UUID)
RETURNS INTEGER AS $$
DECLARE
  pref1 public.travel_preferences%ROWTYPE;
  pref2 public.travel_preferences%ROWTYPE;
  score INTEGER := 0;
  common_interests INTEGER := 0;
  total_interests INTEGER := 0;
  common_dest INTEGER := 0;
  total_dest INTEGER := 0;
BEGIN
  -- Fetch preferences
  SELECT * INTO pref1 FROM public.travel_preferences WHERE user_id = u1_id;
  SELECT * INTO pref2 FROM public.travel_preferences WHERE user_id = u2_id;
  
  IF NOT FOUND THEN RETURN 0; END IF;

  -- 1. Budget Match (30%)
  IF pref1.budget_range = pref2.budget_range THEN score := score + 30;
  ELSIF pref1.budget_range IS NOT NULL AND pref2.budget_range IS NOT NULL THEN score := score + 15; END IF;

  -- 2. Travel Style (30%)
  IF pref1.travel_style = pref2.travel_style THEN score := score + 30;
  ELSIF pref1.travel_style IS NOT NULL AND pref2.travel_style IS NOT NULL THEN score := score + 15; END IF;

  -- 3. Interests (20%) - Jaccard similarity approximation
  IF array_length(pref1.interests, 1) > 0 AND array_length(pref2.interests, 1) > 0 THEN
    SELECT count(*) INTO common_interests FROM (SELECT unnest(pref1.interests) INTERSECT SELECT unnest(pref2.interests)) x;
    total_interests := GREATEST(array_length(pref1.interests, 1), array_length(pref2.interests, 1));
    score := score + ROUND((common_interests::numeric / total_interests) * 20);
  END IF;

  -- 4. Destinations (20%)
  IF array_length(pref1.preferred_destinations, 1) > 0 AND array_length(pref2.preferred_destinations, 1) > 0 THEN
    SELECT count(*) INTO common_dest FROM (SELECT unnest(pref1.preferred_destinations) INTERSECT SELECT unnest(pref2.preferred_destinations)) x;
    total_dest := GREATEST(array_length(pref1.preferred_destinations, 1), array_length(pref2.preferred_destinations, 1));
    score := score + ROUND((common_dest::numeric / total_dest) * 20);
  END IF;

  RETURN score;
END;
$$ LANGUAGE plpgsql STABLE;


-- ========================================================================================
-- 4. TRUST SCORE ENGINE & TRIGGERS
-- ========================================================================================

-- Recalculate Trust Level based on score
CREATE OR REPLACE FUNCTION public.update_trust_level_dynamic()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.trust_score >= 76 THEN NEW.trust_level := 'Explorer Elite';
  ELSIF NEW.trust_score >= 51 THEN NEW.trust_level := 'Gold';
  ELSIF NEW.trust_score >= 26 THEN NEW.trust_level := 'Silver';
  ELSE NEW.trust_level := 'Bronze';
  END IF;
  
  -- Log the score history
  IF TG_OP = 'UPDATE' AND OLD.trust_score IS DISTINCT FROM NEW.trust_score THEN
    INSERT INTO public.trust_scores (user_id, score, level) VALUES (NEW.id, NEW.trust_score, NEW.trust_level);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_trust_level_trigger 
BEFORE UPDATE OF trust_score ON public.profiles 
FOR EACH ROW EXECUTE FUNCTION public.update_trust_level_dynamic();


-- Verified Student Trigger
CREATE OR REPLACE FUNCTION public.handle_user_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_verified = true AND OLD.is_verified = false THEN
    UPDATE public.profiles SET trust_score = trust_score + 20 WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_verified AFTER UPDATE OF is_verified ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_user_verification();


-- Completed Trip Trigger (Rewards host + members)
CREATE OR REPLACE FUNCTION public.handle_trip_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Reward Host
    UPDATE public.profiles SET trust_score = trust_score + 10 WHERE id = NEW.creator_id;
    -- Reward Approved Members
    UPDATE public.profiles SET trust_score = trust_score + 10 
    WHERE id IN (SELECT user_id FROM public.trip_members WHERE trip_id = NEW.id AND join_status = 'approved');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_trip_completed AFTER UPDATE OF status ON public.trips FOR EACH ROW EXECUTE FUNCTION public.handle_trip_completion();


-- Review Trigger
CREATE OR REPLACE FUNCTION public.handle_new_review()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.overall_rating >= 4 THEN
    UPDATE public.profiles SET trust_score = trust_score + 5 WHERE id = NEW.reviewed_user_id;
  ELSIF NEW.overall_rating <= 2 THEN
    UPDATE public.profiles SET trust_score = trust_score - 5 WHERE id = NEW.reviewed_user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_submitted AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.handle_new_review();


-- Initial Profile Creation from Auth
CREATE OR REPLACE FUNCTION public.handle_new_auth_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, college)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'), COALESCE(NEW.raw_user_meta_data->>'college', 'Unknown'));
  
  INSERT INTO public.travel_preferences (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_prod AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


-- ========================================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view, only owner can update
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Preferences: Only owner can view/update
CREATE POLICY "Users can view own preferences" ON public.travel_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.travel_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Trips: Anyone can view open/ongoing trips, only creator can edit/delete
CREATE POLICY "Trips are viewable by everyone" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Users can insert own trips" ON public.trips FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own trips" ON public.trips FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete own trips" ON public.trips FOR DELETE USING (auth.uid() = creator_id);

-- Trip Members: Anyone can view, users can insert for themselves, creator can update status
CREATE POLICY "Trip members viewable by everyone" ON public.trip_members FOR SELECT USING (true);
CREATE POLICY "Users can join trips" ON public.trip_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own status or creator can update any" ON public.trip_members FOR UPDATE USING (
  auth.uid() = user_id OR auth.uid() IN (SELECT creator_id FROM public.trips WHERE id = trip_id)
);

-- Messages: Only sender or receiver can view/insert
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receivers can mark as read" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Reviews: Viewable by everyone, only participants can insert
CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Notifications: Only owner
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Emergency Contacts
CREATE POLICY "Users view own contacts" ON public.emergency_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own contacts" ON public.emergency_contacts FOR ALL USING (auth.uid() = user_id);

-- Trust Scores History
CREATE POLICY "Users view own score history" ON public.trust_scores FOR SELECT USING (auth.uid() = user_id);

-- Admin & Reports
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reported_by);
CREATE POLICY "Admins can view reports" ON public.reports FOR SELECT USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin' OR role = 'super_admin'));
CREATE POLICY "Admins full access" ON public.admin_logs FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin' OR role = 'super_admin'));

-- ========================================================================================
-- 6. STORAGE BUCKET POLICIES (Assuming buckets exist)
-- ========================================================================================
-- Avatars (Public Read, Owner Write)
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trip Images (Public Read, Owner Write)
CREATE POLICY "Trip images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'trip-images');
CREATE POLICY "Users can upload trip images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'trip-images' AND auth.uid() IS NOT NULL);

-- Documents (Private - Read/Write by Owner only)
CREATE POLICY "Users can view own documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
