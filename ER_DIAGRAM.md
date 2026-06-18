# RAAHI Entity-Relationship Diagram

This document contains the Entity-Relationship (ER) diagram for the RAAHI database schema.

```mermaid
erDiagram
    profiles ||--o{ trips : "hosts"
    profiles ||--o{ trip_members : "joins"
    profiles ||--o{ reviews : "reviewer/reviewee"
    profiles ||--o{ messages : "sender/receiver"
    profiles ||--o{ notifications : "receives"
    profiles ||--o{ sos_alerts : "triggers"

    trips ||--o{ trip_members : "has"
    trips ||--o{ reviews : "rated_for"
    trips ||--o{ messages : "contains"
    trips ||--o{ sos_alerts : "linked_to"

    profiles {
        uuid id PK
        text email UK
        text full_name
        text bio
        text college
        text department
        text year
        text city
        text gender
        text_array interests
        text travel_style
        text avatar_url
        user_role role
        integer trust_score
        trust_level trust_level
        boolean is_verified
        timestamptz created_at
        timestamptz updated_at
    }

    trips {
        uuid id PK
        uuid host_id FK
        text destination
        date start_date
        date end_date
        numeric budget
        text travel_type
        text description
        integer max_members
        trip_status status
        timestamptz created_at
        timestamptz updated_at
    }

    trip_members {
        uuid id PK
        uuid trip_id FK
        uuid user_id FK
        member_status status
        timestamptz created_at
    }

    reviews {
        uuid id PK
        uuid trip_id FK
        uuid reviewer_id FK
        uuid reviewee_id FK
        integer safety_rating
        integer communication_rating
        integer punctuality_rating
        integer overall_experience
        text feedback
        timestamptz created_at
    }

    messages {
        uuid id PK
        uuid trip_id FK
        uuid sender_id FK
        uuid receiver_id FK
        text content
        text image_url
        text voice_note_url
        boolean is_read
        timestamptz created_at
    }

    notifications {
        uuid id PK
        uuid user_id FK
        notification_type type
        text title
        text body
        text link
        boolean is_read
        timestamptz created_at
    }

    sos_alerts {
        uuid id PK
        uuid user_id FK
        uuid trip_id FK
        numeric location_lat
        numeric location_lng
        text status
        timestamptz resolved_at
        timestamptz created_at
    }
```
