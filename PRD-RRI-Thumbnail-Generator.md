# PRD — RRI PRO 1 Banda Aceh Thumbnail Generator

> **Document version:** 1.1 (Supabase)
> **Last updated:** 2026-05-04
> **Status:** Ready for implementation (Step 1 complete, Step 2+ pending user setup)
> **Target executor:** Claude Code (agent-friendly, step-by-step)
> **Backend:** Supabase (Postgres + Auth + Storage)

---

## 1. Overview

Aplikasi web untuk membuat thumbnail YouTube dialog program **RRI PRO 1 Banda Aceh 97.7 FM** secara cepat dan konsisten. User memilih presenter, mengisi judul/jadwal/pembicara, lalu mengunduh PNG 1280×720 yang siap upload ke YouTube.

**Target user:** Tim produksi RRI Banda Aceh (1–3 admin internal).
**Skala data:** ~2–10 presenter, 100–500 pembicara, ~50 thumbnail/bulan.

---

## 2. Goals & Non-Goals

### Goals
- Generate thumbnail YouTube konsisten dengan branding RRI PRO 1 dalam < 1 menit per thumbnail.
- Database pembicara reusable dengan search.
- Setting fleksibel untuk logo dan background presenter (tidak hardcoded).
- Auth real dengan 1-3 akun admin (tidak perlu multi-user complexity).

### Non-Goals (v1)
- ❌ Multi-user / role management (RLS sama untuk semua auth user).
- ❌ Editor visual drag-and-drop posisi.
- ❌ Upload custom font.
- ❌ Riwayat thumbnail (history page).
- ❌ Schedule otomatis / auto-publish ke YouTube.
- ❌ Mobile app native.
- ❌ Internationalization (UI fixed dalam bahasa Indonesia).

---

## 3. Tech Stack

| Layer | Tech | Catatan |
|-------|------|---------|
| **Framework** | Next.js 14 (App Router) | TypeScript, SSR-ready |
| **Styling** | Tailwind CSS | + custom tokens (CSS vars) |
| **Icons** | lucide-react | |
| **Database** | Supabase Postgres | Tables + RLS policies |
| **Auth** | Supabase Auth | Email + password (1-3 admins) |
| **Storage** | Supabase Storage | S3-compatible, public read + auth write |
| **State** | React `useState` + Context | Tidak perlu Redux/Zustand |
| **Forms** | Native React state | Tidak perlu react-hook-form untuk skala ini |
| **Render thumbnail** | SVG inline | Convert ke PNG via `<canvas>` |
| **Hosting** | Vercel (Free) | |
| **Fonts** | Google Fonts via `next/font` | Space Grotesk (judul) + Inter (body) |

### Dependencies utama
```json
{
  "next": "^14.2.0",
  "react": "^18.3.0",
  "@supabase/supabase-js": "^2.45.0",
  "@supabase/ssr": "^0.2.0",
  "lucide-react": "^0.400.0",
  "tailwindcss": "^3.4.0"
}
```

---

## 4. Project Structure

```
rri-thumbnail-generator/
├── app/
│   ├── layout.tsx              # Root layout + font loader + AuthProvider (TODO)
│   ├── page.tsx                # Landing → redirect ke /generator
│   ├── globals.css             # Tailwind + CSS variables
│   ├── (protected)/            # Route group, auth check via middleware
│   │   ├── layout.tsx          # Top Nav + session check
│   │   ├── generator/
│   │   │   └── page.tsx        # Halaman utama (form + preview + download)
│   │   ├── speakers/
│   │   │   └── page.tsx        # Database pembicara (CRUD + search)
│   │   └── settings/
│   │       └── page.tsx        # Logo + presenter settings (no password section)
│   ├── login/
│   │   └── page.tsx            # Supabase Auth login form (email + password)
│   └── auth/                   # Auth callback routes (if using OAuth)
│       └── callback/
│           └── route.ts        # (Optional, for future OAuth)
├── components/
│   ├── auth/
│   │   └── LoginForm.tsx       # Supabase Auth form (replaces PasswordGate)
│   ├── thumbnail/
│   │   ├── ThumbnailPreview.tsx      # SVG renderer
│   │   ├── SpeakerSelect.tsx         # Searchable combobox
│   │   └── DownloadButton.tsx        # SVG → PNG export
│   ├── speakers/
│   │   ├── SpeakerCard.tsx
│   │   ├── SpeakerForm.tsx
│   │   └── SpeakerSearchBar.tsx
│   ├── settings/
│   │   ├── LogoUpload.tsx
│   │   ├── PresenterCard.tsx
│   │   └── PresenterForm.tsx
│   └── ui/                     # Reusable
│       ├── Modal.tsx
│       ├── Input.tsx
│       ├── Button.tsx
│       └── Spinner.tsx
├── lib/
│   ├── supabase/               # Supabase client setup
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client (for seed + SSR)
│   │   └── middleware.ts       # Session refresh (TODO)
│   ├── storage/
│   │   └── upload.ts           # Upload + resize helpers (Supabase Storage)
│   ├── utils/
│   │   ├── svgToPng.ts         # SVG → PNG export via canvas
│   │   └── slugify.ts
│   └── auth/                   # Auth session helpers (TODO)
├── types/
│   ├── database.ts             # Postgres tables (generated via CLI)
│   ├── speaker.ts
│   ├── presenter.ts
│   └── settings.ts
├── middleware.ts               # Auth middleware for session refresh (TODO)
├── lib/                        # Shared utilities
├── scripts/
│   └── seed.ts                 # Insert default presenters (runs once)
├── supabase/                   # Supabase config
│   ├── migrations/
│   │   └── 0001_init.sql       # Create tables, RLS policies, storage policies
│   └── seed.sql                # Seed data (presenters Dimas, Ammar)
├── docs/
│   └── references/
│       ├── mockup.jsx          # UI reference (single-file React)
│       ├── bg-dimas.png        # Presenter background (Dimas)
│       ├── bg-ammar.png        # Presenter background (Ammar)
│       └── original-thumbnail.png # Example output
├── public/
├── .env.local.example
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── CLAUDE.md                   # Agent handoff doc
└── README.md                   # User-facing docs
```

---

## 5. Pages & Routes

| Route | Purpose | Auth | Access |
|-------|---------|------|--------|
| `/` | Redirect ke `/generator` | — | Public |
| `/login` | Supabase Auth login (email + password) | No | Public |
| `/generator` | Halaman utama: form + preview + download | Yes (RLS read) | Protected |
| `/speakers` | CRUD database pembicara dengan search | Yes | Protected |
| `/settings` | Logo, presenter, akun admin info | Yes | Protected |

**Auth Implementation:**
- `app/(protected)/layout.tsx` checks Supabase session (via middleware + cookie)
- If not authenticated → server redirect to `/login`
- If authenticated → render children (form, speakers, settings)
- Logout: `supabase.auth.signOut()` + redirect to `/login`
- Session persisted via HTTP-only cookie (handled by `@supabase/ssr`)

---

## 6. Features (Detailed)

### 6.1 Authentication (Supabase Auth)

**Real auth** menggunakan Supabase Auth:
- Email + password login (no social auth v1)
- Admin accounts dibuat manual via Supabase dashboard
- Password reset via "Forgot Password" link (auto email dari Supabase)
- Session managed via `@supabase/ssr` (HTTP-only cookies, SSR-safe)
- Logout: clear session cookie, redirect to `/login`

**Login page:**
- Background gradient biru navy + green glow (matching brand)
- Card di tengah: logo + judul "Thumbnail Generator" + subtitle
- Input email, input password (toggle show/hide)
- Tombol "Masuk"
- Error message: "Email atau password salah"
- Link "Forgot password?" → Supabase magic link email

**Post-login:**
- Redirect ke `/generator`
- Session expires saat browser ditutup (atau after 24h, configurable di Supabase)

**Creating admin accounts (user responsibility):**
1. Buka Supabase dashboard → Authentication
2. Click "Invite" → enter email admin
3. Admin terima email magic link → set password
4. Next login dengan email + password tersebut

### 6.2 Generator Page (`/generator`)

**Layout:** 2 kolom desktop (5-col grid: form 2-col, preview 3-col), stack di mobile.

**Form (kolom kiri):**
1. **Section "Presenter"** — card pickers berisi semua presenter dari Supabase. Click → set selected. Visual: mini-thumbnail 16:9 (background presenter) + nama.
2. **Section "Konten Thumbnail"**:
   - Textarea: Judul Program (max 2 baris)
   - Input: Nama Acara (default `BANDA ACEH MENYAPA`)
   - Input: Hari & Tanggal (free text, contoh: `Selasa, 29 Juli 2025`)
   - Input: Jam Siaran (free text, contoh: `09:00 – 10:00 WIB`)
3. **Section "Pembicara"**:
   - Toggle 1/2/3/4 untuk jumlah pembicara.
   - Untuk tiap slot: `<SpeakerSelect>` (searchable combobox).
4. **Tombol "Download PNG (1280×720)"** — gradient orange, full-width.

**Preview (kolom kanan):**
- Sticky di top scroll.
- Render `<ThumbnailPreview>` dengan `viewBox="0 0 1280 720"` di-scale ke container.
- Update **real-time** setiap field berubah.
- Border-radius + shadow untuk efek "card preview".
- Subtitle: "1280 × 720 px" + "Preview update otomatis saat form berubah."

### 6.3 Speakers Page (`/speakers`)

**Header:**
- Judul "Database Pembicara".
- Subtitle: "X pembicara terdaftar — kelola data untuk dialog program."
- Search bar (288px desktop, full mobile) dengan icon search + clear button.
- Tombol "+ Tambah" di sebelah kanan search.

**Counter (jika ada search):** "Menampilkan X hasil dari Y pembicara."

**Grid:** 3 kolom desktop, 2 kolom tablet, 1 kolom mobile.

**Speaker Card:**
- Foto bulat 56x56 (ring biru tipis).
- Nama lengkap (font-semibold, line-tight).
- Jabatan (text-xs, line-clamp 3).
- Footer: tombol Edit (abu) + Hapus (merah).

**Modal Add/Edit:**
- Field: Nama Lengkap (dengan gelar), Jabatan/Instansi (textarea 3 baris), Foto (upload).
- Foto preview: bulat 64x64 di samping tombol upload.
- Tombol Batal (outline) + Simpan (dark).
- **Validasi:** Nama wajib diisi.

**Search:**
- Filter client-side dengan `useMemo`.
- Match nama OR jabatan (case-insensitive).
- Empty state dengan ikon Search opacity 30%: "Tidak ada pembicara cocok dengan '<keyword>'".

**Hapus:**
- Confirm dialog: "Hapus pembicara ini?"
- Setelah confirm: hapus dari Supabase + hapus foto dari Storage (kalau ada).

### 6.4 Settings Page (`/settings`)

3 section card:

**A. Logo Header**
- 2 kolom: Logo RRI Banda Aceh (kiri header) + Logo PRO 1 (kanan header).
- Tiap card: preview di background dark (min-height 80px), tombol Upload Logo.
- Format yang dibolehkan: PNG, JPG, SVG. Max 1 MB.

**B. Presenter**
- Header section + tombol "+ Tambah".
- Helper text: "Tiap presenter punya background sendiri (include foto, label, glow, triangle)."
- Grid card: mini-thumbnail landscape 80x48 + nama + tombol Edit/Hapus.
- **Modal Add/Edit:**
  - Nama Presenter (input)
  - Background Thumbnail 1280×720 (upload) — preview aspect-video
  - Helper text: "Background include foto presenter, label, glow, triangle. Rekomendasi 1280×720 PNG/JPG."
  - Validasi: Nama wajib.

**C. Akun Admin**
- Informasi: "Kelola akun admin via Supabase dashboard"
- Helper text: "Untuk tambah/hapus user admin atau ubah password, buka dashboard Supabase"
- Tombol: "Buka Supabase Dashboard" (link eksternal ke supabase project)
- Note: Password ubah via "Account" atau "Reset Password" di dashboard

### 6.5 SpeakerSelect Component (Searchable Combobox)

Custom dropdown untuk pilih pembicara dari database 100+:
- **Trigger button:** input-style, tampilkan nama pembicara terpilih atau placeholder.
- **Dropdown panel** (muncul on click):
  - Search input di atas (autoFocus).
  - List scrollable max-height 256px.
  - Tombol "Hapus pilihan" di atas list (kalau sudah ada selected).
  - Tiap item: foto bulat 36x36 + nama + jabatan (line-clamp 2).
  - Selected state: bg-blue-50 + check icon.
  - Footer: counter "X dari Y pembicara".
- **Click outside:** close dropdown.
- **Search:** match nama OR jabatan (case-insensitive, useMemo).

### 6.6 PNG Export (`svgToPng.ts`)

```ts
export async function exportSvgAsPng(
  svgElement: SVGElement,
  width = 1280,
  height = 720,
  filename?: string
): Promise<void> {
  const svgClone = svgElement.cloneNode(true) as SVGElement;
  svgClone.setAttribute('width', String(width));
  svgClone.setAttribute('height', String(height));

  const svgString = new XMLSerializer().serializeToString(svgClone);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.crossOrigin = 'anonymous'; // Penting untuk Supabase Storage URLs
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);

  await new Promise<void>((resolve) => {
    canvas.toBlob((pngBlob) => {
      if (!pngBlob) return resolve();
      const link = document.createElement('a');
      link.download = filename || `thumbnail-${Date.now()}.png`;
      link.href = URL.createObjectURL(pngBlob);
      link.click();
      URL.revokeObjectURL(url);
      resolve();
    }, 'image/png');
  });
}
```

**Catatan CORS:**
Supabase Storage URLs support CORS natively (GET requests untuk public objects). Tidak perlu setup CORS manual seperti Firebase — works out-of-the-box.

---

## 7. Data Model (Supabase Postgres)

### Table: `speakers`
```sql
id: uuid (primary)
full_name: text (not null) — "Dr. Yusran Asnawi, S.Pd. M.Pd."
position: text — "Wakil Dekan ... UIN Ar-Raniry"
photo_url: text | null — Supabase Storage download URL
photo_path: text | null — "speakers/abc123.jpg" (for delete)
created_at: timestamptz
updated_at: timestamptz
```

### Table: `presenters`
```sql
id: uuid (primary)
name: text (not null) — "Dimas", "Ammar"
background_url: text | null — Storage URL untuk background full 1280×720
background_path: text | null — "presenters/dimas-1234.jpg"
created_at: timestamptz
updated_at: timestamptz
```

### Table: `branding_settings` (singleton)
```sql
id: uuid (primary) — always one row: '00000000-0000-0000-0000-000000000001'
rri_logo_url: text | null
rri_logo_path: text | null
pro1_logo_url: text | null
pro1_logo_path: text | null
updated_at: timestamptz
```

**TypeScript types** generated via:
```bash
supabase gen types typescript --local > types/database.ts
```

### Seed data (jalankan saat pertama):
```sql
-- presenters
INSERT INTO presenters (name, background_url, created_at, updated_at) VALUES
  ('Dimas', null, now(), now()),
  ('Ammar', null, now(), now());

-- branding_settings (singleton)
INSERT INTO branding_settings (id, rri_logo_url, pro1_logo_url, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000001', null, null, now());
```

---

## 8. Storage Structure (Supabase Storage)

```
buckets:
├── logos/
│   ├── rri-banda-aceh-{timestamp}.png
│   └── pro1-977fm-{timestamp}.png
├── presenters/
│   ├── dimas-{timestamp}.png
│   └── ammar-{timestamp}.png
└── speakers/
    ├── {speakerId}-{timestamp}.jpg
    └── ...
```

**Konvensi:**
- Nama file include timestamp untuk hindari cache lama
- Saat replace foto: upload baru → update Supabase row → delete file lama
- Compress image client-side ke max 1280px (presenter background) atau 400px (foto pembicara) sebelum upload
- Public URLs format: `https://<project>.supabase.co/storage/v1/object/public/{bucket}/{path}`

---

## 9. Security (RLS Policies + Storage Policies)

**Database RLS:**
```sql
-- Speakers: public read (anon + auth), auth-only write
CREATE POLICY "speakers_read" ON speakers FOR SELECT USING (true);
CREATE POLICY "speakers_write" ON speakers FOR INSERT, UPDATE, DELETE 
  TO authenticated USING (auth.uid() IS NOT NULL);

-- Presenters: same
CREATE POLICY "presenters_read" ON presenters FOR SELECT USING (true);
CREATE POLICY "presenters_write" ON presenters FOR INSERT, UPDATE, DELETE 
  TO authenticated USING (auth.uid() IS NOT NULL);

-- Branding Settings: same
CREATE POLICY "branding_read" ON branding_settings FOR SELECT USING (true);
CREATE POLICY "branding_write" ON branding_settings FOR UPDATE 
  TO authenticated USING (auth.uid() IS NOT NULL);
```

**Storage Policies:**
```sql
-- Logos: public read, auth write
CREATE POLICY "logos_read" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "logos_write" ON storage.objects FOR INSERT, UPDATE, DELETE TO authenticated 
  USING (bucket_id = 'logos' AND auth.uid() IS NOT NULL);

-- Same for 'presenters' and 'speakers' buckets
```

**Auth Security:**
- Only 1-3 admin email accounts via Supabase Auth
- RLS requires `auth.uid() IS NOT NULL` for all writes
- No public write access (anon reads only)
- Service role key only on server (seed script, not exposed)

---

## 10. UI/UX Specifications

### 10.1 Design System

**Color tokens (Tailwind/CSS vars):**
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#0f172a` (slate-900) | Tombol utama, text utama |
| `--color-accent` | `#f97316` (orange-500) | Brand accent, CTA |
| `--color-accent-2` | `#ea580c` (orange-600) | CTA hover |
| `--color-bg` | `#f8fafc` (slate-50) | Background app |
| `--color-card` | `#ffffff` | Card background |
| `--color-border` | `#e2e8f0` (slate-200) | Border default |
| `--color-muted` | `#64748b` (slate-500) | Subtitle, helper text |

**Thumbnail palette (di dalam SVG):**
| Element | Hex |
|---------|-----|
| BG navy gradient | `#1e3a8a → #0c1e4a → #060f2c` |
| Green glow | `#a3e635` (lime-400) |
| Blue glow | `#3b82f6` (blue-500) |
| Triangle stroke | `#60a5fa` / `#a78bfa` |
| Circle ring | gradient `#60a5fa → #1e40af` |
| Footer pill bg | `#ffffff` |
| Info promosi bg | `#22c55e` (green-500) |

**Typography:**
- **Heading (UI + thumbnail title):** `Space Grotesk` weights 500/600/700
- **Body (UI + thumbnail text):** `Inter` weights 400/500/600/700/800

Load via `next/font/google`:
```ts
import { Inter, Space_Grotesk } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });
```

### 10.2 UI Layout

**Top Nav (sticky, h-16):**
- Logo app (orange gradient square + Radio icon) + judul "Thumbnail Generator" + subtitle "RRI PRO 1 Banda Aceh".
- Tab pills: Generator | Pembicara | Setting (active = white card with shadow, inactive = gray).
- Logout button (kanan, kecil, ghost).
- Max-width 7xl, padding x-6.

**Main Content:**
- Max-width 7xl, padding x-6 py-6.

**Footer:**
- Border-top, text-xs muted, center: status indicator (titik amber + "Connected to Supabase").

### 10.3 Component Style Patterns

**Card:** `bg-white rounded-xl border border-slate-200 p-5`
**Primary Button:** `bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 py-2 text-sm font-medium`
**CTA Button:** `bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl px-4 py-3 font-semibold shadow-lg shadow-orange-500/30`
**Input:** `border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`
**Modal overlay:** `fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4`
**Modal panel:** `bg-white rounded-xl w-full max-w-md p-6`

---

## 11. Thumbnail Layout Specs (1280×720)

> **PENTING:** Background image berisi gradient + glow + triangle + foto presenter + label "DIMAS PRESENTER" sudah baked-in. SVG hanya overlay elemen dinamis di atas background.

### Layer Order (bottom → top)
1. Background image (full 1280×720)
2. Logo RRI (top-left)
3. Logo PRO 1 (top-right)
4. Title text (kiri)
5. Event name + date + time (kiri, di bawah title)
6. Speaker circles (tengah-bawah, 1–4 lingkaran)
7. Footer: medsos pill + info promosi bubble

### Posisi Elemen

| Element | x | y | w | h | Notes |
|---------|---|---|---|---|-------|
| Background image | 0 | 0 | 1280 | 720 | full slice |
| Logo RRI | 80 | 50 | 140 | 70 | preserveAspectRatio meet |
| Logo PRO 1 | 1080 | 45 | 140 | 70 | preserveAspectRatio meet |
| Title line 1 | 80 | 180 | — | — | Space Grotesk 700, 36px, white, uppercase |
| Title line 2 | 80 | 230 | — | — | same |
| Event name | 80 | 295 | — | — | Inter 700, 22px, white, uppercase, letter-spacing 1 |
| Date icon | 420 | 275 | 20 | 22 | Calendar SVG, white stroke |
| Date text | 452 | 293 | — | — | Inter 700, 20px, white, uppercase |
| Time icon | 750 | 273 | 24 | 24 | Clock SVG, white stroke |
| Time text | 782 | 293 | — | — | Inter 700, 20px, white |
| Footer medsos pill | 80 | 615 | 310 | 48 | white bg, rounded 24, IG/FB/TT/YT icons + `@rri_bandaaceh` |
| Info promosi bubble | 440 | 615 | — | — | Green circle 40px + 2 baris text white Inter 700 16px |

### Speaker Circles (Y-anchor: 380)

| Count | Positions (x) | Radius |
|-------|---------------|--------|
| 1 | [380] | 70 |
| 2 | [290, 470] | 70 |
| 3 | [200, 380, 560] | 65 |
| 4 | [130, 290, 450, 610] | 55 |

**Tiap lingkaran:**
- Outer ring: stroke gradient `circleRing`, strokeWidth 4, radius `circleR + 5`.
- Inner: clipPath circle radius `circleR`, foto pembicara `preserveAspectRatio="xMidYMid slice"`.
- Nama: y = circleY + circleR + 30, fontSize 15 (atau 13 jika count=4), Inter 700, white, center.
- Jabatan: foreignObject di bawah nama, width 190 (atau 150 jika count=4), Inter 500, fontSize 11 (atau 10), uppercase, line-height 1.3, max ~3 baris.

### Reference Images
Lihat file referensi di `docs/references/`:
- `original-thumbnail.png` — contoh thumbnail jadi (3 pembicara + Dimas)
- `bg-dimas.png` — background Dimas (dengan foto, label, glow, triangle)
- `bg-ammar.png` — background Ammar (dengan foto, label, glow, triangle)

---

## 12. Environment Variables

`.env.local`:
```bash
# Supabase (from Project Settings → API Keys)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Server-only (for seed script, never expose to frontend)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

> Semua `NEXT_PUBLIC_*` akan terekspos ke client. Itu **normal** untuk Supabase web SDK — keamanan via RLS policies.

---

## 13. Supabase Setup Steps

1. Buka [supabase.com](https://supabase.com) → Create new project
2. Project name: `rri-thumbnail-generator`
3. Password: auto-generated (Anda tidak perlu ingat)
4. Region: `asia-southeast1` (Singapore, terdekat dari Aceh)
5. Skip / enable backup (optional)
6. **Database ready** → copy 3 credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` (format: `https://xxx.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
7. **Apply migrations:**
   - Option A (recommended): Via Supabase CLI:
     ```bash
     npm install -g supabase
     supabase link --project-ref <ref>
     supabase db push
     ```
   - Option B: Via dashboard SQL Editor → copy-paste `supabase/migrations/0001_init.sql`
8. **Create storage buckets** (via dashboard):
   - Storage → Create bucket: `logos` (public)
   - Create bucket: `presenters` (public)
   - Create bucket: `speakers` (public)
9. **Create admin accounts** (via dashboard):
   - Authentication → Invite User
   - Enter 1-3 admin email addresses
   - They get magic link → set password
10. **Run seed script:**
    ```bash
    npm run seed
    ```
    (inserts 2 presenters: Dimas, Ammar)
11. Paste credentials ke `.env.local`, deploy!

---

## 14. Deployment (Vercel)

1. Push repo ke GitHub.
2. [vercel.com](https://vercel.com) → Add New Project → Import dari GitHub.
3. Framework Preset: **Next.js** (auto-detected).
4. **Environment Variables**: paste semua dari `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY  (optional, if seed post-deploy)
   ```
5. Deploy.
6. Test end-to-end di production URL.

---

## 15. Acceptance Criteria

### Functional
- [ ] User bisa login dengan email + password (dari Supabase Admin).
- [ ] Setelah login, redirect ke `/generator`.
- [ ] Logout button di top nav bekerja, kembali ke `/login`.
- [ ] **Generator:** pilih presenter → background ter-load di preview.
- [ ] **Generator:** ubah judul, tanggal, jam → preview update real-time.
- [ ] **Generator:** toggle 1/2/3/4 pembicara → layout circle adjust.
- [ ] **Generator:** SpeakerSelect bisa search by nama atau jabatan.
- [ ] **Generator:** klik Download → dapat file PNG 1280×720, isinya sesuai preview.
- [ ] **Speakers:** add/edit/delete pembicara persisted ke Supabase.
- [ ] **Speakers:** upload foto → tersimpan di Storage → muncul di card.
- [ ] **Speakers:** search filter list real-time.
- [ ] **Settings:** upload logo RRI & PRO 1 → muncul di thumbnail Generator.
- [ ] **Settings:** add/edit/delete presenter persisted.
- [ ] **Settings:** "Buka Supabase Dashboard" link works.
- [ ] Refresh page tetap stay logged in (session cookie persists).
- [ ] Tutup browser → harus login ulang.

### Non-Functional
- [ ] First load < 3 detik di koneksi 4G.
- [ ] Preview update < 100ms saat ketik.
- [ ] Download PNG selesai < 5 detik.
- [ ] No console errors di production.
- [ ] Responsive: usable di mobile (≥375px), tablet, desktop.
- [ ] Lighthouse Performance ≥ 80.
- [ ] Bundle size < 300KB initial JS.

### Visual
- [ ] Thumbnail PNG persis match dengan reference (`docs/references/original-thumbnail.png`) saat input data sama.
- [ ] Font Space Grotesk + Inter ter-load di UI dan thumbnail.
- [ ] Warna brand konsisten.

---

## 16. Out of Scope (v1) — Future Improvements

- Riwayat thumbnail (history page) dengan thumbnail preview + reuse.
- Drag-and-drop reorder pembicara.
- Customize posisi/font per template.
- Multiple template variants (Bincang Pagi, Dialog Khusus, dst).
- Export ke format lain (Instagram square, Story 9:16).
- Auto-publish ke YouTube via API.
- Watermark / batch generation.
- Audit log siapa edit apa.
- Export Supabase → backup CSV.

---

## 17. Reference Materials

Tim akan menyertakan:
- `docs/references/original-thumbnail.png` — full thumbnail jadi
- `docs/references/bg-dimas.png` — background presenter Dimas (1280×720)
- `docs/references/bg-ammar.png` — background presenter Ammar (1280×720)
- `docs/references/mockup.jsx` — React mockup interaktif (single-file artifact)

**Brand info:**
- Nama: RRI PRO 1 Banda Aceh 97.7 FM
- Acara contoh: BANDA ACEH MENYAPA
- Medsos: `@rri_bandaaceh` (IG, FB, TikTok, YouTube)
- Info Promosi & Kerjasama: `0811 6881 2123`

---

## Appendix A — Implementation Order (Recommended)

| Step | Task | Owner | Notes |
|------|------|-------|-------|
| 1 ✅ | Setup Next.js + Tailwind + TypeScript | Agent | Build ✓, ready for Step 2 |
| 2 | Supabase project setup + env vars | User | Create project, migrations, buckets, admin accounts |
| 3 | Run seed script | Agent | Insert 2 presenters (Dimas, Ammar) |
| 4 | Supabase Auth login page + middleware | Agent | Replace PasswordGate with real auth form |
| 5 | Top Nav + route shells | Agent | Logo, tabs, logout button |
| 6 | Settings page (logo + presenters CRUD) | Agent | No password section (auth via Supabase) |
| 7 | Speakers page (CRUD + search) | Agent | Cards, modals, delete confirm |
| 8 | ThumbnailPreview SVG renderer | Agent | Test dengan dummy data (needs bg images) |
| 9 | SpeakerSelect combobox | Agent | Searchable dropdown + photos |
| 10 | Generator page (form + preview + download) | Agent | Wire form + real-time preview |
| 11 | PNG export (SVG → canvas) | Agent | Test CORS dengan Supabase Storage |
| 12 | Polish (empty states, loading, errors) | Agent | Spinners, toast messages, validation |
| 13 | Deploy ke Vercel | Agent | Push GitHub, link Vercel, set env vars |
| 14 | E2E test + visual check | User | Compare vs. reference thumbnail |

---

## Appendix B — Error Handling Patterns

- **Supabase query fail:** show toast "Gagal memuat data. Refresh halaman." + retry button.
- **Storage upload fail:** show toast "Upload gagal: [reason]". Tetap di form.
- **PNG export fail (CORS):** show alert "Gagal generate PNG. Cek koneksi internet dan pastikan Storage URLs accessible."
- **Network offline:** show banner kuning "Anda offline. Perubahan tidak akan tersimpan."
- **Validation errors:** inline message di bawah field, merah, text-xs.
- **Auth errors (login fail):** "Email atau password salah" (don't reveal which field wrong).

---

## Appendix C — Performance Tips

- `useMemo` untuk filter speaker list.
- Lazy-load gambar di SpeakerSelect dengan `loading="lazy"`.
- Debounce search input 200ms (kalau list > 200 item).
- Resize image client-side sebelum upload (canvas).
- `next/image` untuk gambar UI (tapi NOT untuk SVG `<image>` — pakai URL langsung).
- Cache Supabase queries di Context (avoid re-fetch saat pindah halaman).
- Use HTTP-only cookies for session (handled by `@supabase/ssr`, so no JS access to token).
