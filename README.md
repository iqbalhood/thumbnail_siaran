# RRI PRO 1 Banda Aceh — Thumbnail Generator

**Generator thumbnail YouTube untuk program dialog RRI PRO 1 Banda Aceh 97.7 FM.**

Aplikasi web yang memudahkan tim produksi RRI membuat thumbnail berkualitas tinggi (1280×720 PNG) dalam hitungan menit, dengan UI intuitif dan database pembicara reusable.

---

## 🎯 Fitur Utama

- ✨ **Generator Cepat**: Pilih presenter, isi judul/jadwal, select pembicara → preview real-time + download PNG
- 📋 **Database Pembicara**: Kelola 100+ pembicara dengan foto, search by nama/jabatan
- ⚙️ **Manajemen Logo**: Upload logo RRI & PRO 1, otomatis muncul di semua thumbnail
- 🎨 **Design System**: Konsisten dengan branding RRI, font profesional (Space Grotesk + Inter)
- 🔐 **Secure**: Auth admin via Supabase, RLS policies, no public write
- 📱 **Responsive**: Optimal di desktop, tablet, mobile (≥375px)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22+ dan npm 11+
- Supabase account (https://supabase.com)

### Setup

1. **Clone & install**
   ```bash
   git clone <repo>
   cd rri-thumbnail-generator
   npm install
   ```

2. **Buat Supabase project**
   - Sign up di https://supabase.com
   - Create project: `rri-thumbnail-generator`
   - Region: `asia-southeast1` (Singapore)
   - Copy credentials

3. **Setup env vars**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local, paste Supabase credentials:
   # NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   # SUPABASE_SERVICE_ROLE_KEY=...
   ```

4. **Apply database migrations**
   ```bash
   # Via Supabase CLI (recommended):
   # npm install -g supabase
   # supabase link --project-ref <project-ref>
   # supabase db push
   
   # OR manually via Supabase dashboard:
   # SQL Editor → paste content dari docs/migrations/0001_init.sql
   ```

5. **Seed initial data (2 presenters)**
   ```bash
   npm run seed
   ```

6. **Create admin accounts**
   - Buka Supabase dashboard → Authentication
   - Invite 1-3 admin users (email address)
   - They get magic link email untuk set password

7. **Run dev server**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

---

## 📖 Usage

### Step 1: Login
- Masukkan email + password admin Anda (dari Supabase)
- Session akan tersimpan selama tab aktif

### Step 2: Generator (Halaman Utama)
- **Pilih Presenter**: Klik salah satu presenter card (Dimas/Ammar/dst.) yang sudah di-setup di Settings
- **Isi Konten**: Judul program, nama acara, hari & tanggal, jam siaran
- **Select Pembicara**: 1-4 pembicara (combobox searchable)
- **Preview**: Update real-time saat ketik
- **Download**: Klik tombol Download PNG → file 1280×720 PNG siap upload ke YouTube

### Step 3: Database Pembicara
- **Cari**: Filter by nama atau jabatan
- **Tambah**: Klik "+ Tambah", upload foto (bulat), isi nama + jabatan
- **Edit/Hapus**: Klik icon di card pembicara
- Foto otomatis upload ke Supabase Storage

### Step 4: Settings
- **Logo Header**: Upload logo RRI Banda Aceh + logo PRO 1 (PNG/JPG/SVG, max 1 MB)
- **Presenter**: Manage presenter cards dengan background custom (1280×720)
- **Akun Admin**: Manage users via Supabase dashboard (bukan di app)

---

## 🛠️ Development

### Folder Structure
```
app/                 # Next.js App Router
├── layout.tsx       # Root layout + fonts
├── page.tsx         # Landing (redirect to /generator)
└── (protected)/     # Auth-gated routes
    ├── generator/   # Form + preview + download
    ├── speakers/    # Database pembicara
    └── settings/    # Logo + presenter settings

components/          # React components
├── ui/              # Reusable (Modal, Input, Button, etc.)
├── auth/            # Login form
├── thumbnail/       # Preview, SpeakerSelect, Download
├── speakers/        # Speaker CRUD components
└── settings/        # Settings form components

lib/                 # Business logic
├── supabase/        # Supabase client setup
├── storage/         # Upload helpers
├── utils/           # SVG export, slugify
└── auth/            # Session helpers

types/               # TypeScript types (generated from Supabase)
scripts/             # Seed script, etc.
docs/                # Documentation + reference assets
```

### Available Scripts

```bash
npm run dev          # Dev server (port 3000)
npm run build        # Production build
npm run start        # Run prod build
npm run seed         # Insert seed data (one-time)
npm run lint         # Type check (tsc)
```

### Design Tokens

**Colors** (in `app/globals.css` + `tailwind.config.ts`):
- `--color-primary`: #0f172a (slate-900) — text, buttons
- `--color-accent`: #f97316 (orange-500) — CTA, brand
- `--color-bg`: #f8fafc (slate-50) — page background
- `--color-card`: #ffffff — card background
- `--color-muted`: #64748b — helper text

**Fonts**:
- Display: `Space_Grotesk` (headings)
- Body: `Inter` (UI + body text)

---

## 📦 Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Framework** | Next.js 14 (App Router) | TypeScript, SSR-ready |
| **UI** | React 18 + Tailwind CSS | No CSS modules, token-driven |
| **Database** | Supabase Postgres | Tables + RLS policies |
| **Auth** | Supabase Auth | Email + password, 1-3 admins |
| **Storage** | Supabase Storage | Buckets: logos, presenters, speakers |
| **Export** | Canvas API | SVG → PNG (client-side) |
| **Hosting** | Vercel (recommended) | Free tier OK for this scale |
| **Fonts** | Google Fonts + next/font | Inter, Space_Grotesk |

---

## 🔒 Security

- **Auth**: Real Supabase Auth (email + password)
- **Database**: RLS policies — public read, auth-only write
- **Storage**: Public read (download URLs), auth-only upload
- **Secrets**: Service role key only on server (seed script)
- **CORS**: Handled by Supabase Storage natively

---

## 📊 Performance

Target metrics (PRD Section 15):
- **First Load JS**: < 300 KB (currently 87.4 kB)
- **First Paint**: < 3s on 4G
- **Preview Update**: < 100ms when typing
- **PNG Export**: < 5s
- **Lighthouse Performance**: ≥ 80

Monitor via `npm run build` → Vercel Analytics (post-deploy).

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push repo ke GitHub
2. https://vercel.com → Import project
3. Framework: **Next.js** (auto-detected)
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY  (for seed, optional post-deploy)
   ```
5. Deploy
6. Update Supabase Storage CORS (if needed):
   ```bash
   gsutil cors set cors.json gs://your-bucket
   ```

### Custom Hosting

- `npm run build` → `.next/` folder
- Run `npm start` to serve
- Ensure env vars accessible at runtime

---

## 📝 Documentation

- **[CLAUDE.md](CLAUDE.md)** — Agent/developer handoff doc (architecture, conventions, roadmap)
- **[PRD-RRI-Thumbnail-Generator.md](PRD-RRI-Thumbnail-Generator.md)** — Full product specification
- **[docs/references/mockup.jsx](docs/references/mockup.jsx)** — Single-file React UI mockup (reference)

---

## 📸 Reference Assets

Needed for Step 8+ (visual verification):
- `docs/references/original-thumbnail.png` — Example output (3 pembicara)
- `docs/references/bg-dimas.png` — Presenter Dimas background template
- `docs/references/bg-ammar.png` — Presenter Ammar background template

Ask maintainer if missing.

---

## 🤝 Contributing

- Code style: TypeScript strict, Tailwind utility classes
- No external CSS libraries — token-driven design
- Path alias: `@/*` (configured in tsconfig.json)
- Component structure: one component per file (unless tiny helper)

---

## 📞 Support

Hubungi:
- **Technical**: Check [CLAUDE.md](CLAUDE.md) conventions + PRD
- **Feature requests**: Submit via GitHub issues
- **Bug reports**: Include browser, steps to reproduce, screenshot

---

## 📄 License

Internal tool untuk RRI PRO 1 Banda Aceh. All rights reserved.

---

**Status**: Beta v0.1 (Step 1 complete, awaiting Supabase setup)

**Built with** ❤️ **for RRI Banda Aceh 97.7 FM**
