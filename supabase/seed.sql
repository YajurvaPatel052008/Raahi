-- ========================================================================================
-- RAAHI SEED DATA
-- Purpose: Populate local/development environment with mock data
-- ========================================================================================

-- Create mock users in auth schema (Note: in local dev only or using Supabase Admin API)
-- Since we can't easily insert into auth.users without encrypted passwords in pure SQL, 
-- we will mock the public profiles directly. In reality, auth.users must exist first.
-- To make this `seed.sql` work in a real Supabase env, we disable triggers temporarily.

SET session_replication_role = 'replica';

-- Insert Profiles
INSERT INTO public.profiles (id, user_id, full_name, email, college, department, year, gender, city, bio, trust_score, trust_level, is_verified, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', uuid_generate_v4(), 'Arjun Sharma', 'arjun@aitr.ac.in', 'AITR', 'CSE', '3rd Year', 'Male', 'Indore', 'Love exploring hidden gems.', 85, 'Explorer Elite', true, 'user'),
  ('22222222-2222-2222-2222-222222222222', uuid_generate_v4(), 'Priya Patel', 'priya@acropolis.in', 'Acropolis', 'IT', '2nd Year', 'Female', 'Bhopal', 'Always ready for a road trip.', 65, 'Gold', true, 'user'),
  ('33333333-3333-3333-3333-333333333333', uuid_generate_v4(), 'Rahul Verma', 'rahul@aitr.ac.in', 'AITR', 'Mech', '4th Year', 'Male', 'Ujjain', 'Budget backpacker.', 30, 'Silver', true, 'user'),
  ('44444444-4444-4444-4444-444444444444', uuid_generate_v4(), 'Admin User', 'admin@aitr.ac.in', 'AITR', 'Admin', 'Staff', 'Other', 'Indore', 'System Administrator', 100, 'Explorer Elite', true, 'admin');

-- Insert Preferences
INSERT INTO public.travel_preferences (user_id, budget_range, travel_style, interests, preferred_destinations)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'High', 'Adventure', ARRAY['Trekking', 'Photography'], ARRAY['Manali', 'Leh']),
  ('22222222-2222-2222-2222-222222222222', 'Medium', 'Relaxation', ARRAY['Beaches', 'Food'], ARRAY['Goa', 'Kerala']),
  ('33333333-3333-3333-3333-333333333333', 'Low', 'Budget', ARRAY['History', 'Museums'], ARRAY['Jaipur', 'Agra']);

-- Insert Trips
INSERT INTO public.trips (id, creator_id, destination, start_date, end_date, budget, travel_type, description, max_members, current_members, status)
VALUES
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Spiti Valley Trek', '2026-10-01', '2026-10-10', 12000, 'Adventure', 'Looking for 3 people to join a road trip and trek in Spiti.', 4, 1, 'open'),
  ('bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Goa Beach Weekend', '2026-11-15', '2026-11-20', 8000, 'Relaxation', 'Chilling at South Goa beaches. Very laid back trip.', 5, 2, 'open'),
  ('cccc3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Jaipur Heritage Tour', '2026-12-05', '2026-12-08', 5000, 'Cultural', 'Budget trip exploring forts and local food.', 3, 3, 'completed');

-- Insert Trip Members
INSERT INTO public.trip_members (trip_id, user_id, join_status)
VALUES
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'approved'), -- Host
  ('bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'approved'), -- Host
  ('bbbb2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'approved'), -- Joined
  ('cccc3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'approved'), -- Host
  ('cccc3333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'approved'), -- Joined
  ('cccc3333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'approved'); -- Joined

-- Insert Reviews
INSERT INTO public.reviews (trip_id, reviewer_id, reviewed_user_id, safety_rating, communication_rating, punctuality_rating, overall_rating, review_text)
VALUES
  ('cccc3333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 5, 4, 5, 5, 'Great host, well planned budget trip!');

-- Insert Messages
INSERT INTO public.messages (sender_id, receiver_id, message)
VALUES
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Hey Rahul, loved the Jaipur trip!'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Thanks Arjun! Next time we go to Udaipur.');

SET session_replication_role = 'origin';
