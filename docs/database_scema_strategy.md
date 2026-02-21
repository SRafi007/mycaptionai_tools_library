# Database Schema Strategy

## Overview

The database uses Supabase (PostgreSQL) and focuses on a relational structure for Tools, Categories, and Tags, while keeping a flexible Analytics table for tracking user interactions.

## Tables

### 1. `tools`
Stores the main content of the platform.
- **id**: UUID
- **name**: Text
- **slug**: Text (Unique URL identifier)
- **description**: Text
- **url**: Text (External link)
- **pricing_type**: Enum/Text ('Free', 'Freemium', 'Paid')
- **is_verified**: Boolean

### 2. `categories`
Groups tools into high-level buckets.
- **id**: UUID
- **name**: Text
- **slug**: Text

### 3. `tags`
Granular descriptors for tools (many-to-many).
- **id**: UUID
- **name**: Text

### 4. `tool_categories` & `tool_tags`
Join tables handling the many-to-many relationships.

### 5. `analytics`
Tracks user behavior and visits.
- **event_type**: 'page_view', etc.
- **metadata**: JSONB for flexible data storage (browser, device, country, etc.)
- **user_id**: References `auth.users` if logged in.
- **ip_address**: Stored for abuse prevention/geo-location (handle with care regarding privacy).

## Security (RLS)

- **Public Access**: All content tables (`tools`, `categories`, `tags`) are readable by `anon` (public).
- **Write Access**: Only `service_role` (Admin) can modify content.
- **Analytics**:
    - **Insert**: Publicly open (anyone can log a visit).
    - **Select**: Restricted to Admins only.
