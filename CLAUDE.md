# RRI Thumbnail Generator — Agent Handoff

**Project:** Web app untuk generate thumbnail YouTube RRI PRO 1 Banda Aceh 97.7 FM  
**Status:** Step 1 ✅ (Next.js scaffold complete)  
**Tech Stack:** Next.js 14 + React 18 + TypeScript + Tailwind + **Supabase** (Auth, Postgres, Storage)  
**Last Updated:** 2026-05-04

---

## Quick Start

```bash
# Install
npm install

# Dev server (port 3000)
npm run dev

# Build
npm run build

# Seed database (after Supabase setup)
npm run seed
```

Visit `http://localhost:3000` → auto-redirects to `/generator` (auth gate will block until login).

---

## Current State

✅ **Step 1 Complete**
- Next.js 14 App Router scaffold
- TypeScript (strict)
- Tailwind CSS with design tokens
- Fonts: Inter (body) + Space_Grotesk (display) via `next/font`
- Folder structure per PRD section 4
- Route group `(protected)/{generator,speakers,settings}` with stubs
- Build verified: `next build` ✓ (87.4 kB initial JS)

✅ **Step 2 Complete**
- Supabase client, server, and middleware setup
- SQL migrations fixed (current_user_id → auth.uid)
- Root middleware implemented
- types/database.ts stubbed
- lib/firestore/ deleted

❌ **Missing Assets** (needed by Step 8)
- `docs/references/bg-dimas.png` — presenter background template (Dimas)
- `docs/references/bg-ammar.png` — presenter background template (Ammar)
- `docs/references/original-thumbnail.png` — reference thumbnail (3 speakers + visual spec)

---

## Folder Structure

```
.
├── PRD-RRI-Thumbnail-Generator.md    # Product spec (Firebase version, needs rewrite)
├── CLAUDE.md                         # This file
├── README.md                         # User-facing docs (TODO)
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
│
├── app/
│   ├── layout.tsx                 # Root layout, font loader, auth provider
│   ├── page.tsx                   # / → redirect /generator
│   ├── globals.css                # Tailwind + CSS var tokens
│   └── (protected)/               # Route group, auth gate wrapper
│       ├── layout.tsx             # TODO: add PasswordGate / auth check
│       ├── generator/page.tsx     # Halaman utama (form + preview + download)
│       ├── speakers/page.tsx      # Database pembicara (CRUD + search)
│       └── settings/page.tsx      # Logo, presenter, password settings
│
├── components/
│   ├── ui/                        # Reusable
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   ├── Button.tsx
│   │   └── Spinner.tsx
│   ├── auth/
│   │   └── PasswordGate.tsx       # TODO: Supabase Auth login form
│   ├── thumbnail/
│   │   ├── ThumbnailPreview.tsx   # SVG renderer (Step 8)
│   │   ├── SpeakerSelect.tsx      # Searchable combobox (Step 9)
│   │   └── DownloadButton.tsx     # SVG → PNG export (Step 11)
│   ├── speakers/
│   │   ├── SpeakerCard.tsx        # (Step 7)
│   │   ├── SpeakerForm.tsx
│   │   └── SpeakerSearchBar.tsx
│   └── settings/
│       ├── LogoUpload.tsx         # (Step 6)
│       ├── PresenterCard.tsx
│       └── PresenterForm.tsx
│
├── lib/
│   ├── supabase/                  # TODO: Create (Step 2)
│   │   ├── client.ts              # Browser client (public routes, auth)
│   │   ├── server.ts              # Server client (admin, seed)
│   │   └── middleware.ts          # Auth refresh, session cookie
│   ├── firestore/                 # DELETE (Firebase, no longer used)
│   ├── storage/                   # TODO: Adapt for Supabase Storage
│   │   └── upload.ts              # Image resize + upload helpers
│   ├── auth/                      # TODO: Session helpers for Supabase Auth
│   │   └── session.ts
│   └── utils/
│       ├── svgToPng.ts            # Export SVG → PNG via canvas
│       └── slugify.ts
│
├── types/
│   ├── database.ts                # TODO: Generated via supabase gen types
│   ├── speaker.ts
│   ├── presenter.ts
│   └── settings.ts
│
├── scripts/
│   └── seed.ts                    # TODO: Insert default presenters (Dimas, Ammar)
│
├── supabase/                      # TODO: Create (Step 2)
│   ├── migrations/
│   │   └── 0001_init.sql          # Create tables + RLS policies
│   ├── seed.sql                   # TODO: Insert presenters
│   └── config.toml                # (Optional, for local dev)
│
├── docs/
│   └── references/
│       ├── mockup.jsx             # Single-file React mockup
│       ├── bg-dimas.png           # ❌ MISSING
│       ├── bg-ammar.png           # ❌ MISSING
│       └── original-thumbnail.png # ❌ MISSING
│
└── public/                        # Static assets (logos, icons)
```

---

## Design System

### Color Tokens (CSS variables in `app/globals.css`)
```css
--color-primary:    #0f172a  /* slate-900, text + primary buttons */
--color-accent:     #f97316  /* orange-500, CTA */
--color-accent-2:   #ea580c  /* orange-600, CTA hover */
--color-bg:         #f8fafc  /* slate-50, page background */
--color-card:       #ffffff  /* white, card background */
--color-border:     #e2e8f0  /* slate-200, borders */
--color-muted:      #64748b  /* slate-500, helper text */
```

Used in Tailwind as `bg-brand-*`, `text-brand-*`, etc. (see `tailwind.config.ts`).

### Typography
- **Display**: `Space_Grotesk` (weights 500/600/700) — headings + thumbnail title
- **Body**: `Inter` (weights 400-800) — UI + thumbnail body text
- Loaded via `next/font/google` at `app/layout.tsx`

### Component Patterns
- **Card**: `bg-white rounded-xl border border-slate-200 p-5`
- **Primary Button**: `bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 py-2 text-sm font-medium`
- **CTA Button**: `bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl px-4 py-3 font-semibold shadow-lg`
- **Input**: `border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500`

---

## Data Model (Supabase Postgres)

**Tables** (SQL schemas in `supabase/migrations/0001_init.sql`):

### `speakers`
```sql
id: uuid (primary)
full_name: text (not null)
position: text
photo_url: text | null (Supabase Storage URL)
photo_path: text | null (path untuk delete)
created_at: timestamptz
updated_at: timestamptz
```

### `presenters`
```sql
id: uuid (primary)
name: text (not null)
background_url: text | null
background_path: text | null
created_at: timestamptz
updated_at: timestamptz
```

### `branding_settings` (singleton)
```sql
id: uuid (primary, always single row)
rri_logo_url: text | null
rri_logo_path: text | null
pro1_logo_url: text | null
pro1_logo_path: text | null
updated_at: timestamptz
```

**Seed data** (run once after migration):
- `presenters`: 2 rows (Dimas, Ammar)
- `branding_settings`: 1 row (all nulls, wait for user uploads)

---

## Auth & Security

**Approach: Supabase Auth (Real Auth — Email + Password)**

- Admin accounts created manually via Supabase dashboard (1-3 users)
- Login page: email + password form → `supabase.auth.signInWithPassword()`
- Session: managed by `@supabase/supabase-js` client + cookies via `@supabase/ssr`
- Logout: `supabase.auth.signOut()`
- RLS policies: all tables + storage buckets require `auth.uid() is not null` for write

**No more password gate** (password-hash-in-DB deleted). Real user auth instead.

---

## Supabase Setup (Step 2 — User Responsibility)

1. Go [supabase.com](https://supabase.com) → Create project
2. Project name: `rri-thumbnail-generator`
3. Region: `asia-southeast1` (Singapore, nearest to Aceh)
4. Copy 6 env vars to `.env.local`
5. Run migrations: `supabase db push` (local dev) or apply via dashboard
6. Create 1-3 admin accounts via Supabase dashboard
7. Create storage buckets: `logos`, `presenters`, `speakers` (public read, auth write)

**Env vars needed:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=...  # server-only, for seed script
```

---

## Implementation Roadmap (PRD Appendix A)

| Step | Task | Owner | Est. Time | Notes |
|------|------|-------|-----------|-------|
| 1 ✅ | Setup Next.js + Tailwind + TypeScript | Done | — | Build passing, ready for Step 2 |
| 2 ✅ | Supabase init (project + env + migrations) | Done | — | Client, server, middleware setup complete |
| 3 ✅ | Run seed script (2 presenters) | Done | — | Dimas, Ammar, and Branding settings seeded |
| 4 ✅ | Supabase Auth login page + middleware | Done | — | Login page created and routes protected |
| 5 | Top Nav layout + 3 routes shell | Agent | ~30min | Logo, nav tabs, logout button |
| 6 ✅ | Settings page (logo upload + presenters CRUD) | Done | — | Logos and presenters managed in storage |
| 7 ✅ | Speakers page (CRUD + search) | Done | — | Searchable speaker database implemented |
| 8 | Thumbnail Renderer Component (Canvas/Image logic) | Agent | ~2hr | The core rendering engine |
| 9 | SpeakerSelect combobox | Agent | ~1hr | Searchable dropdown with photos |
| 10 | Generator page (form + preview + download) | Agent | ~2hr | Wire form fields + real-time preview |
| 11 | PNG export (SVG → canvas → blob) | Agent | ~1hr | Test CORS with Supabase Storage |
| 12 | Polish (empty states, loading, errors) | Agent | ~1hr | Spinners, toast messages, validations |
| 13 | Deploy to Vercel | Agent | ~30min | Push to GitHub, link to Vercel |
| 14 | E2E test + visual check | User | ~30min | Verify vs. reference thumbnail |

---

## Key Files to Read First

- **PRD**: [`PRD-RRI-Thumbnail-Generator.md`](PRD-RRI-Thumbnail-Generator.md) — **Note:** Firebase version, needs rewrite for Supabase
- **Mockup**: [`docs/references/mockup.jsx`](docs/references/mockup.jsx) — reference React UI (1078 lines, single-file)
- **Config**: [`tailwind.config.ts`](tailwind.config.ts), [`app/globals.css`](app/globals.css) — design tokens
- **Layout**: [`app/layout.tsx`](app/layout.tsx) — font loading, auth provider (TODO)

---

## Common Tasks

### Run dev server
```bash
npm run dev
# Open http://localhost:3000
```

### Build for production
```bash
npm run build
npm start
```

### Type-check
```bash
npx tsc --noEmit
```

### Format (Prettier recommended, not yet added)
```bash
# TODO: add prettier config + pre-commit hook
```

---

## Notes for Next Agent

### ⚠️ Critical Before Step 2+

1. **PRD needs rewrite** — Currently describes Firebase. Switch to Supabase:
   - Section 3: Tech Stack (firebase → supabase)
   - Section 4: Project Structure (firebase.ts → supabase/, add migrations/)
   - Section 7: Data Model (Firestore → Postgres SQL)
   - Section 9: Security (Firestore rules → RLS policies)
   - Section 13: Setup (Firebase Console → Supabase Console)

2. **package.json needs update**:
   ```bash
   npm remove firebase
   npm install @supabase/supabase-js @supabase/ssr
   ```

3. **Assets missing**:
   - `bg-dimas.png`, `bg-ammar.png` — background templates for presenters (1280×720)
   - `original-thumbnail.png` — reference output (needed for Step 8 visual verification)
   - Ask user to supply before Step 8

### Conventions

- **File naming**: kebab-case for files, PascalCase for components
- **Folder naming**: lowercase (app/, lib/, components/)
- **Imports**: use `@/*` path alias (configured in tsconfig.json)
- **Types**: central in `types/` folder, not co-located
- **Styling**: Tailwind only, no CSS modules
- **Auth guard**: Middleware at Step 4 (handle in `app/(protected)/layout.tsx`)

### Performance Targets (PRD Section 15)

- First Load JS < 300 KB ✅ (currently 87.4 kB)
- First paint < 3s on 4G
- Preview update < 100ms
- PNG export < 5s
- Lighthouse Performance ≥ 80

Monitor with `npm run build` → Vercel Analytics post-deploy.

---

## Getting Help

- **PRD questions**: Read [`PRD-RRI-Thumbnail-Generator.md`](PRD-RRI-Thumbnail-Generator.md)
- **UI reference**: Check [`docs/references/mockup.jsx`](docs/references/mockup.jsx)
- **Design tokens**: See [`tailwind.config.ts`](tailwind.config.ts) + [`app/globals.css`](app/globals.css)
- **Supabase docs**: https://supabase.com/docs
- **Next.js docs**: https://nextjs.org/docs

---

**Status**: Ready for Step 2 (Supabase init). Waiting on user to create Supabase project + provide env vars.

