# RAAHI Production Database Architecture Guide

This document describes the database schema, indexing strategies, triggers, security policies, and deployment steps for RAAHI.

## 1. Database Schema Overview

The database is built on Supabase (PostgreSQL) and contains 13 relational tables:

- **`profiles`**: User details extended with verification state and trust system.
- **`travel_preferences`**: Normalized details (budget range, interests) linked 1:1 to profiles.
- **`trips`**: Travel listings created by users.
- **`trip_members`**: Trip buddy requests and memberships.
- **`matches`**: Pre-calculated compatibility records between users.
- **`messages`**: Realtime direct and group messages.
- **`reviews`**: Peer reviews rating safety, communication, and punctuality.
- **`trust_scores`**: Log of trust score changes.
- **`emergency_contacts`**: User-defined SOS contacts.
- **`notifications`**: User notifications.
- **`call_history`**: Direct call metadata records.
- **`reports`**: Safety reporting mechanism.
- **`admin_logs`**: Admin audit trail.

---

## 2. High Performance & Scalability

To support 100,000+ users:
- **Foreign Keys Indexing**: B-tree indexes are set on all foreign keys to speed up joins.
- **BRIN Indexes**: Implemented on `created_at` in high-throughput write-only tables (`admin_logs`, `call_history`) to reduce storage space and accelerate range searches.
- **GIN Indexes**: Placed on array fields (`interests`, `preferred_destinations`) to allow fast tag-based lookups.
- **Composite Indexes**: Set on `messages(sender_id, receiver_id, created_at DESC)` for high-performance pagination.
- **Full-Text Search (FTS)**: A generated `tsvector` column is indexed via GIN on `trips` to support instant, query-based destination search.

---

## 3. Server-Side Matching Stored Procedure (`calculate_match_score`)

Instead of computing compatibility inside client applications, a Pl/pgSQL function runs directly on the database engine. It computes a 0-100 score:
- **30%**: Budget Range match.
- **30%**: Travel Style match.
- **20%**: Shared interests (Jaccard similarity approximation).
- **20%**: Shared destination preferences.

You can call this RPC function directly using:
```js
const { data, error } = await supabase.rpc('calculate_match_score', {
  u1_id: 'user-uuid-1',
  u2_id: 'user-uuid-2'
});
```

---

## 4. Trust Score Engine triggers
Triggers automatically update a user's trust level (Bronze -> Silver -> Gold -> Explorer Elite) as activities occur:
- **+20** points when verified.
- **+10** points for the host and members of a completed trip.
- **+5** / **-5** points depending on receiving a positive (>=4 stars) or negative (<=2 stars) review.

---

## 5. Row Level Security (RLS) & Storage Policies
Strict RLS rules ensure that users can only access their own data, messages where they are the sender/recipient, and public profiles.
Storage policies are configured for three buckets:
- **`avatars`**: Publicly readable, writable by the owner.
- **`trip-images`**: Publicly readable, writable by authenticated users.
- **`documents`**: Private, accessible only by the owner.

---

## 6. How to Deploy

1. Open the **Supabase SQL Editor** in your project dashboard.
2. Copy the entire contents of [schema.sql](file:///c:/Users/patel/OneDrive/Desktop/Raahi/supabase/schema.sql) and execute it.
3. Configure the redirect URL in your Supabase Auth settings to match your Vercel deployment URL (e.g. `https://<your-project>.vercel.app/auth-callback.html`).
