# RAAHI Database Architecture & Scalability Guide

This document explains the design decisions, indexing strategies, and scaling principles utilized in the RAAHI production database.

## 1. Schema Normalization
The database follows standard Third Normal Form (3NF) where applicable to reduce redundancy. 
- **Profiles vs. Preferences**: `travel_preferences` are separated from `profiles` to keep the primary authentication and display table lightweight.
- **Enums**: We use native PostgreSQL `ENUM` types for `status` columns (`trip_status`, `message_type`, etc.) to enforce data integrity at the database engine level, which is much faster than string checks.

## 2. Indexing Strategy for 100,000+ Users

As data grows, querying without indexes results in slow Sequential Scans. We implemented three types of indexes:

### B-Tree Indexes
Default Postgres indexing utilized on all Foreign Keys. 
*Example*: `idx_trips_creator ON trips(creator_id)`. This ensures that finding all trips for a specific user takes `O(log N)` time instead of `O(N)`.

### BRIN (Block Range Indexes)
Used on naturally ordered append-only tables like `admin_logs` and `call_history`. BRIN indexes are extremely small and memory-efficient for time-series data.
*Example*: `CREATE INDEX idx_admin_logs_created_at ON admin_logs USING BRIN (created_at)`.

### GIN (Generalized Inverted Index)
Critical for array columns and Full-Text Search.
*Example*: The `interests` array in `travel_preferences`. This allows lightning-fast checks like "Find all users whose interests include 'Trekking'".
*Example*: `idx_trips_fts` powers destination and description search without using slow `ILIKE '%query%'` clauses.

### Composite Indexes
*Example*: `idx_messages_conversation ON messages(sender_id, receiver_id, created_at DESC)`. This is optimized specifically for the chat interface to instantly load paginated histories between two specific users.

## 3. Server-Side Engines (Functions & Triggers)

We moved heavy logic from the Node.js backend directly into the Database layer via PL/pgSQL.

### Trust Score Engine
Trust scores are calculated autonomously via triggers:
1. `on_review_submitted`: Triggers when a review is left.
2. `on_trip_completed`: Triggers when a trip is marked complete.
3. `calculate_trust_level_trigger`: A `BEFORE UPDATE` trigger that dynamically assigns `Bronze`, `Silver`, `Gold`, or `Explorer Elite` based on the new integer score.

### Smart Matching (`calculate_match_score`)
Instead of pulling thousands of user profiles into the server memory to calculate compatibility, we use the `calculate_match_score(UUID, UUID)` RPC function. The DB compares arrays using `INTERSECT` and returns a highly optimized integer `0-100`.

## 4. Row Level Security (RLS)
The database enforces security independently of the API layer. Every table has explicit policies.
*Rule of Thumb*: 
- `SELECT`: Usually public or restricted to participants (e.g., messages).
- `INSERT`: Verified via `auth.uid() = user_id`.
- `UPDATE/DELETE`: Restricted strictly to owners or admins.

## 5. Pagination & Caching Recommendations

When querying large tables via Supabase API, always use range pagination:
```javascript
// Good (Pagination)
const { data } = await supabase.from('trips').select('*').range(0, 19)
```

**Avoid `count: 'exact'` on large tables**:
Exact counts on tables with millions of rows trigger sequential scans. If you need a count on the `trips` table, use the Supabase estimated count feature.

## 6. Storage Security
- `avatars` & `trip-images`: Public read, authenticated user write.
- `documents`: Strictly private. Users can only upload and read files where the folder name matches their `auth.uid()`.
