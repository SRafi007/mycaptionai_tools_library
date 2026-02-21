# ENGINEERING STANDARDS & ARCHITECTURE DIRECTIVE

### Security • Scalability • Performance • Maintainability

This document defines non-negotiable engineering principles for MyCaptionAI.

---

# 1️⃣ Core Architectural Philosophy

The system must be:

* Server-first
* Static-first
* Index-driven
* Role-secured
* Extensible by design

Never optimize for “quick now”.
Optimize for “clean in 2 years”.

---

# 2️⃣ Security Architecture

Security must be applied at **three layers**:

---

## 🔐 Layer 1 — Infrastructure Security

### Use:

* Environment variables (never commit secrets)
* Separate env for dev / prod
* Supabase RLS (Row-Level Security)

### Never:

* Expose service role key to frontend
* Run admin operations client-side
* Allow unrestricted public writes

---

## 🔐 Layer 2 — Database Security

### Enable Row-Level Security on all tables.

Example rules:

* tools → public read
* submissions → insert only, no public read
* admin operations → role-based only

Admin role should be verified via:

* Supabase Auth
* Middleware role check

Never trust client.

---

## 🔐 Layer 3 — API & Server Actions

Rules:

* Validate all inputs with Zod or similar
* Rate limit submission endpoints
* Sanitize text inputs
* Strip HTML from user-generated content

Add:

* CSRF protection for admin routes
* Basic rate limiting (IP-based)

---

# 3️⃣ Performance & UX Engineering

User experience must feel instant.

---

## ⚡ Static First Rendering

Default:

* Server Components
* Static Generation
* ISR for listings

Never:

* Fetch tools client-side unnecessarily
* Overuse useEffect data fetching

---

## ⚡ Pagination Required

Never render thousands of tools in one page.

Limit:

* 20–30 per page

Implement:

* Cursor-based pagination (better than offset)

---

## ⚡ Search Performance

Split search into:

1. Fast filter query
2. Embedding similarity query

Embedding search:

* Only triggered after 2+ words
* Debounced input
* Top 10 results max

Never:

* Run vector search on every keystroke

---

## ⚡ Caching Strategy

Use:

* Next.js cache()
* Revalidation tags
* Static sitemap generation

Reduce live DB hits as much as possible.

---

# 4️⃣ Codebase Organization Standards

The project must follow separation of concerns.

---

## Structure Rules

### UI Layer

Only presentation.

### Data Layer

Supabase queries inside `/lib/db/`

### Business Logic Layer

Search, ranking, scoring inside `/lib/core/`

### No DB logic inside components.

---

## Example Separation

Bad:

```
ToolCard fetching from supabase
```

Good:

```
page.tsx fetches data
ToolCard only renders props
```

---

# 5️⃣ Scalability Planning

The architecture must support:

* 10,000+ tools
* 100k+ monthly traffic
* Paid listing system
* API access layer

Without rewriting everything.

---

## How We Achieve This

### 1. Schema Designed for Expansion

Fields like:

* sponsored_rank
* traffic_estimate
* search_volume

These enable ranking algorithms later.

---

### 2. Ranking Logic Is Isolated

Create ranking module:

```
/lib/core/ranking.ts
```

All ranking decisions happen here.

So later:

* Add AI scoring
* Add popularity score
* Add click-through score

Without changing database structure.

---

### 3. Logging System

Log:

* Searches
* Clicks
* Category views

This creates intelligence layer later.

---

# 6️⃣ Customization & Future Expansion

System must allow:

* New filter types
* New pricing models
* New content types
* Multi-language support

---

## Future-Proofing Design

### Avoid Hardcoding Enums in Frontend

Pricing types should come from DB table if possible.

---

### Avoid UI Coupled to Specific Categories

Categories dynamic from DB.

---

### Theme System

Color tokens in single config file:

```
/styles/theme.ts
```

Never hardcode colors across components.

---

# 7️⃣ Admin Panel Security & UX

Admin must:

* Be server-rendered
* Protected by middleware
* Never accessible without role check

Admin actions must:

* Log activity
* Validate inputs
* Trigger embedding regeneration

---

# 8️⃣ Data Backup Strategy

Even on free tier:

Create weekly script:

* Fetch all tools
* Save snapshot JSON
* Store in repo

This protects against:

* Supabase outage
* Accidental deletion

---

# 9️⃣ Monitoring & Observability

Even simple version must include:

* Error logging
* Query failure tracking
* Embedding failure tracking

Later can integrate:

* Sentry
* Logtail

---

# 🔟 Clean Code Mandates

Non-negotiable:

* TypeScript strict mode
* No any types
* ESLint enforced
* No duplicated query logic
* Reusable hooks

---

# 1️⃣1️⃣ SEO + Performance Alignment

Remember:

SEO dies if:

* Pages are client rendered
* Slow TTFB
* Excess JS

Keep:

* Minimal JS bundle
* Mostly server-rendered pages
* Metadata generated server-side

---

# 1️⃣2️⃣ Growth-Ready Hooks

Add fields now for future monetization:

* priority_score
* sponsored_until
* click_count

You don’t need them now.
But schema should allow.

---

# 1️⃣3️⃣ Deployment Discipline

* Preview branch deployments
* Never deploy directly to production
* Test search before release
* Test SEO metadata manually

---

# 1️⃣4️⃣ What This Prevents

If you follow this document:

You avoid:

* Security leaks
* Scalability rewrites
* Performance crashes
* SEO penalties
* Monetization limitations

---

# Final Engineering Principle

Build it like:

You will sell it in 2 years.

Because if structured cleanly,
This directory becomes:

A monetizable digital property.


