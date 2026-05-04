# PRD — RRI PRO 1 Banda Aceh Thumbnail Generator

> **Document version:** 1.0
> **Last updated:** 2026-05-04
> **Status:** Ready for implementation
> **Target executor:** Claude Code

---

## 1. Overview

Aplikasi web untuk membuat thumbnail YouTube dialog program **RRI PRO 1 Banda Aceh 97.7 FM** secara cepat dan konsisten. User memilih presenter, mengisi judul/jadwal/pembicara, lalu mengunduh PNG 1280×720 yang siap upload ke YouTube.

**Target user:** Tim produksi RRI Banda Aceh (1–3 admin internal).
**Skala data:** ~2–10 presenter, 100–500 pembicara, ~50 thumbnail/bulan.

## 2. Goals & Non-Goals

### Goals
- Generate thumbnail YouTube konsisten dengan branding RRI PRO 1 dalam < 1 menit per thumbnail.
- Database pembicara reusable dengan search.
- Setting fleksibel untuk logo dan background presenter (tidak hardcoded).
- Tanpa kompleksitas auth multi-user.

### Non-Goals (v1)
- ❌ Multi-user / role management.
- ❌ Editor visual drag-and-drop posisi.
- ❌ Upload custom font.
- ❌ Riwayat thumbnail (history page).
- ❌ Schedule otomatis / auto-publish ke YouTube.
- ❌ Mobile app native.
- ❌ Internationalization (UI fixed dalam bahasa Indonesia).

## 3. Tech Stack

| Layer | Tech | Catatan |
|-------|------|---------|
| **Framework** | Next.js 14 (App Router) | TypeScript |
| **Styling** | Tailwind CSS | + tailwindcss-line-clamp |
| **Icons** | lucide-react | |
| **Backend** | Firebase 10+ | Firestore + Storage (no Auth) |
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
  "firebase": "^10.13.0",
  "lucide-react": "^0.400.0",
  "tailwindcss": "^3.4.0"
}
```

## 4. Project Structure

```
rri-thumbnail-generator/
├── app/
│   ├── layout.tsx              # Root layout + font loader
│   ├── page.tsx                # Landing → redirect ke /app
│   ├── globals.css             # Tailwind + CSS variables
│   ├── (protected)/
│   │   ├── layout.tsx          # Password gate + Top Nav
│   │   ├── generator/
│   │   │   └── page.tsx        # Halaman utama
│   │   ├── speakers/
│   │   │   └── page.tsx        # Database pembicara
│   │   └── settings/
│   │       └── page.tsx        # Setting logo/presenter/password
│   └── login/
│       └── page.tsx            # (Opsional, atau pakai modal)
├── components/
│   ├── auth/
│   │   └── PasswordGate.tsx
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
│   └── ui/                            # Reusable
│       ├── Modal.tsx
│       ├── Input.tsx
│       ├── Button.tsx
│       └── Spinner.tsx
├── lib/
│   ├── firebase.ts                    # Firebase init
│   ├── firestore/
│   │   ├── speakers.ts                # CRUD pembicara
│   │   ├── presenters.ts              # CRUD presenter
│   │   └── settings.ts                # Logo + password
│   ├── storage/
│   │   └── upload.ts                  # Upload helpers
│   ├── auth/
│   │   └── session.ts                 # sessionStorage password gate
│   └── utils/
│       ├── svgToPng.ts                # Export logic
│       └── slugify.ts
├── types/
│   ├── speaker.ts
│   ├── presenter.ts
│   └── settings.ts
├── public/
├── .env.local.example
├── firebase.json                      # Storage CORS + Hosting config
├── firestore.rules
├── storage.rules
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 5. Pages & Routes

| Route | Purpose | Access |
|-------|---------|--------|
| `/` | Redirect ke `/generator` | Public |
| `/login` | (Optional) password input | Public |
| `/generator` | Halaman utama: form + preview + download | Password-gated |
| `/speakers` | CRUD database pembicara dengan search | Password-gated |
| `/settings` | Logo, presenter, ubah password | Password-gated |

**Password Gate Implementation:**
- Cek `sessionStorage.getItem('rri_admin_authed') === 'true'` di `(protected)/layout.tsx`.
- Kalau false → render `<PasswordGate />` (full-screen modal/page).
- Kalau benar → set sessionStorage dan render children.
- Password disimpan di Firestore `settings/auth` field `passwordHash` (SHA-256, bukan plaintext).
- Validasi: hash input di client, compare dengan field dari Firestore.

## 6. Features (Detailed)

### 6.1 Authentication (Password Gate)
- Halaman login penuh dengan card di tengah.
- Background gradient biru navy + green glow + dekoratif triangle (matching brand).
- Logo PRO 1 + judul "Thumbnail Generator".
- Input password (toggle show/hide).
- Tombol "Masuk".
- Default password: `admin123` (di-seed pertama kali jalan).
- Error message kalau salah: "Password salah. Coba lagi."
- Setelah berhasil → sessionStorage flag → redirect ke `/generator`.
- **Logout button** di top nav: clear sessionStorage → redirect ke login.

### 6.2 Generator Page (`/generator`)

**Layout:** 2 kolom desktop (5-col grid: form 2-col, preview 3-col), stack di mobile.

**Form (kolom kiri):**
1. **Section "Presenter"** — card pickers berisi semua presenter dari Firestore. Click → set selected. Visual: mini-thumbnail 16:9 (background presenter) + nama.
2. **Section "Konten Thumbnail"**:
   - Textarea: Judul Program (max 2 baris)
   - Input: Nama Acara (default `BANDA ACEH MENYAPA`)
   - Input: Hari & Tanggal (free text, contoh: `Selasa, 29 Juli 2025`)
   - Input: Jam Siaran (free text, contoh: `09:00 – 10:00 WIB`)
3. **Section "Pembicara"**:
   - Toggle 1/2/3/4 untuk jumlah pembicara.
   - Untuk tiap slot: `<SpeakerSelect>` (searchable combobox, lihat 6.5).
4. **Tombol "Download PNG (1280×720)"** — gradient orange, full-width.

**Preview (kolom kanan):**
- Sticky di top scroll.
- Render `<ThumbnailPreview>` dengan `viewBox="0 0 1280 720"` di-scale ke container.
- Update **real-time** setiap field berubah.
- Border-radius + shadow untuk efek "card preview".
- Subtitle: "1280 × 720" + "Preview akan otomatis update saat Anda mengubah form."

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
- Setelah confirm: hapus dari Firestore + hapus foto dari Storage (kalau ada).

### 6.4 Settings Page (`/settings`)

3 section card:

**A. Logo Header**
- 2 kolom: Logo RRI Banda Aceh (kiri header) + Logo PRO 1 (kanan header).
- Tiap card: preview di background dark (min-height 80px), tombol Upload Logo.
- Format yang dibolehkan: PNG, JPG, SVG. Max 1 MB.

**B. Presenter**
- Header section + tombol "+ Tambah".
- Helper text: "Tiap presenter punya background sendiri (sudah include foto presenter, label nama, glow, & triangle)."
- Grid card: mini-thumbnail landscape 80x48 + nama + tombol Edit/Hapus.
- **Modal Add/Edit:**
  - Nama Presenter (input)
  - Background Thumbnail 1280×720 (upload) — preview aspect-video
  - Helper text: "Background sudah include foto presenter, label nama, glow, & triangle. Rekomendasi 1280×720 PNG/JPG."
  - Validasi: Nama wajib.

**C. Password Admin**
- Input password baru + tombol "Ubah".
- Validasi: minimal 4 karakter.
- Success message dengan check icon: "Password berhasil diubah ✓" (auto-hide 3 detik).

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
  img.crossOrigin = 'anonymous'; // Penting untuk Firebase Storage URL
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
Karena `<image href>` di SVG mengambil dari Firebase Storage URL (eksternal), Storage CORS HARUS dikonfigurasi (lihat section 9). Tanpa ini, canvas akan tainted dan `toBlob()` gagal.

## 7. Data Model (Firestore)

### Collection: `speakers`
```ts
type Speaker = {
  id: string;              // auto-generated
  fullName: string;        // "Dr. Yusran Asnawi, S.Pd. M.Pd."
  position: string;        // "Wakil Dekan ... UIN Ar-Raniry Banda Aceh"
  photoUrl: string | null; // Firebase Storage download URL
  photoPath?: string;      // Storage path untuk delete (e.g. "speakers/abc123.jpg")
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

### Collection: `presenters`
```ts
type Presenter = {
  id: string;
  name: string;                    // "Dimas"
  backgroundUrl: string | null;    // Storage download URL untuk background full
  backgroundPath?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

### Document: `settings/branding`
```ts
type BrandingSettings = {
  rriLogoUrl: string | null;
  rriLogoPath?: string;
  pro1LogoUrl: string | null;
  pro1LogoPath?: string;
  updatedAt: Timestamp;
};
```

### Document: `settings/auth`
```ts
type AuthSettings = {
  passwordHash: string;    // SHA-256 hex of password
  updatedAt: Timestamp;
};
```

### Seed Data (jalankan saat pertama deploy)
```
settings/auth: { passwordHash: SHA256("admin123") }
settings/branding: { rriLogoUrl: null, pro1LogoUrl: null }
presenters/[auto]: { name: "Dimas", backgroundUrl: null }
presenters/[auto]: { name: "Ammar", backgroundUrl: null }
```

## 8. Storage Structure (Firebase Storage)

```
gs://[BUCKET]/
├── logos/
│   ├── rri-banda-aceh-{timestamp}.png
│   └── pro1-977fm-{timestamp}.png
├── presenters/
│   └── {presenterId}-{timestamp}.png
└── speakers/
    └── {speakerId}-{timestamp}.jpg
```

**Konvensi:**
- Nama file include timestamp untuk hindari cache lama.
- Saat replace foto: upload baru → update Firestore URL → delete file lama.
- Compress image client-side ke max 1280px (untuk presenter background) atau 400px (untuk foto pembicara) sebelum upload.

## 9. Security Rules

### `firestore.rules`
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Speakers — read public, write only valid shape
    match /speakers/{id} {
      allow read: if true;
      allow create: if isValidSpeaker(request.resource.data);
      allow update: if isValidSpeaker(request.resource.data);
      allow delete: if true;
    }

    // Presenters
    match /presenters/{id} {
      allow read: if true;
      allow create: if isValidPresenter(request.resource.data);
      allow update: if isValidPresenter(request.resource.data);
      allow delete: if true;
    }

    // Settings
    match /settings/{doc} {
      allow read: if true;
      allow write: if true; // Validasi tambahan via Storage rules + UI
    }

    function isValidSpeaker(data) {
      return data.keys().hasAll(['fullName', 'position'])
        && data.fullName is string && data.fullName.size() > 0 && data.fullName.size() < 200
        && data.position is string && data.position.size() < 500;
    }

    function isValidPresenter(data) {
      return data.keys().hasAll(['name'])
        && data.name is string && data.name.size() > 0 && data.name.size() < 100;
    }
  }
}
```

### `storage.rules`
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /logos/{file} {
      allow read: if true;
      allow write: if request.resource.size < 1 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
    match /presenters/{file} {
      allow read: if true;
      allow write: if request.resource.size < 3 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
    match /speakers/{file} {
      allow read: if true;
      allow write: if request.resource.size < 1 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### Storage CORS (`cors.json`)
```json
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Cache-Control"]
  }
]
```
Apply via gcloud CLI:
```bash
gsutil cors set cors.json gs://[BUCKET]
```

> ⚠️ **Catatan keamanan:** Karena tidak ada Auth, password gate di client adalah **soft protection** saja — siapa pun yang langsung hit Firestore via SDK bisa write. Mitigasi:
> 1. Validasi shape data via Firestore rules (sudah di atas).
> 2. Limit ukuran file di Storage rules.
> 3. Set Firebase **App Check** (opsional, recommended) untuk hanya allow request dari domain Vercel kita.
> 4. Monitor usage di Firebase Console.

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
- Border-top, text-xs muted, center: status indicator (titik amber + "Connected to Firebase").

### 10.3 Component Style Patterns

**Card:** `bg-white rounded-xl border border-slate-200 p-5`
**Primary Button:** `bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 py-2 text-sm font-medium`
**CTA Button:** `bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl px-4 py-3 font-semibold shadow-lg shadow-orange-500/30`
**Input:** `border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`
**Modal overlay:** `fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4`
**Modal panel:** `bg-white rounded-xl w-full max-w-md p-6`

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
Lihat file referensi di `/docs/references/`:
- `original-thumbnail.png` — contoh thumbnail jadi (3 pembicara + Dimas)
- `bg-dimas.png` — background Dimas (kosongan)
- `bg-ammar.png` — background Ammar (kosongan)

## 12. Environment Variables

`.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

> Semua `NEXT_PUBLIC_*` akan terekspos ke client. Itu **normal** untuk Firebase web SDK — keamanan via Security Rules.

## 13. Firebase Setup Steps

1. Buka [Firebase Console](https://console.firebase.google.com/) → Create Project (nama: `rri-thumbnail-generator`).
2. Skip Google Analytics.
3. **Add web app** → daftar app name, copy config snippet.
4. **Build → Firestore Database**:
   - Create database → Production mode → region `asia-southeast1` (Singapore, terdekat dari Aceh).
   - Tab "Rules" → paste isi `firestore.rules`.
5. **Build → Storage**:
   - Get started → region sama → Production mode.
   - Tab "Rules" → paste isi `storage.rules`.
6. **Setup CORS Storage** (via Cloud Shell atau gcloud CLI):
   ```bash
   echo '[{"origin":["*"],"method":["GET"],"maxAgeSeconds":3600,"responseHeader":["Content-Type","Cache-Control"]}]' > cors.json
   gsutil cors set cors.json gs://[YOUR-BUCKET]
   ```
7. (Optional) **App Check**: Build → App Check → Register app → reCAPTCHA v3.
8. Copy semua env values ke `.env.local`.
9. Run seed script (one-time) untuk insert default data.

### Seed Script (`scripts/seed.ts`)
Script Node.js standalone yang dijalankan sekali untuk insert default password + 2 presenter:
```ts
// Run: npx tsx scripts/seed.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { createHash } from 'crypto';

const config = { /* your config */ };
const app = initializeApp(config);
const db = getFirestore(app);

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

async function seed() {
  await setDoc(doc(db, 'settings', 'auth'), {
    passwordHash: sha256('admin123'),
    updatedAt: Timestamp.now(),
  });
  await setDoc(doc(db, 'settings', 'branding'), {
    rriLogoUrl: null, pro1LogoUrl: null,
    updatedAt: Timestamp.now(),
  });
  await addDoc(collection(db, 'presenters'), {
    name: 'Dimas', backgroundUrl: null,
    createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  });
  await addDoc(collection(db, 'presenters'), {
    name: 'Ammar', backgroundUrl: null,
    createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  });
  console.log('✅ Seed complete');
}
seed();
```

## 14. Deployment (Vercel)

1. Push repo ke GitHub.
2. [vercel.com](https://vercel.com) → Add New Project → Import dari GitHub.
3. Framework Preset: **Next.js** (auto-detected).
4. **Environment Variables**: paste semua dari `.env.local`.
5. Deploy.
6. Setelah live, **update Firebase Storage CORS** untuk include domain Vercel (opsional, kalau pakai whitelist):
   ```json
   [{"origin":["https://your-app.vercel.app"], ...}]
   ```
7. Test end-to-end di production URL.

## 15. Acceptance Criteria

### Functional
- [ ] User bisa login dengan password default `admin123`.
- [ ] Setelah login, redirect ke `/generator`.
- [ ] Logout button bekerja dan kembali ke login.
- [ ] **Generator:** pilih presenter → background ter-load di preview.
- [ ] **Generator:** ubah judul, tanggal, jam → preview update real-time.
- [ ] **Generator:** toggle 1/2/3/4 pembicara → layout circle adjust.
- [ ] **Generator:** SpeakerSelect bisa search by nama atau jabatan.
- [ ] **Generator:** klik Download → dapat file PNG 1280×720, isinya sesuai preview.
- [ ] **Speakers:** add/edit/delete pembicara persisted ke Firestore.
- [ ] **Speakers:** upload foto → tersimpan di Storage → muncul di card.
- [ ] **Speakers:** search filter list real-time.
- [ ] **Settings:** upload logo RRI & PRO 1 → muncul di thumbnail Generator.
- [ ] **Settings:** add/edit/delete presenter persisted.
- [ ] **Settings:** ubah password → password baru bekerja saat next login.
- [ ] Refresh page tetap stay logged in (sessionStorage).
- [ ] Tutup tab → harus login ulang.

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

## 16. Out of Scope (v1) — Future Improvements

- Riwayat thumbnail (history page) dengan thumbnail preview + reuse.
- Drag-and-drop reorder pembicara.
- Customize posisi/font per template.
- Multiple template variants (Bincang Pagi, Dialog Khusus, dst).
- Export ke format lain (Instagram square, Story 9:16).
- Auto-publish ke YouTube via API.
- Watermark / batch generation.
- Audit log siapa edit apa.
- Export Firestore → backup CSV.

## 17. Reference Materials

Tim akan menyertakan:
- `/docs/references/original-thumbnail.png` — full thumbnail jadi
- `/docs/references/bg-ammar.png` — background presenter Ammar
- `/docs/references/bg-dimas.png` — background presenter Dimas
- `/docs/references/mockup.jsx` — React mockup interaktif (single-file artifact dari Tahap 1)

**Brand info:**
- Nama: RRI PRO 1 Banda Aceh 97.7 FM
- Acara contoh: BANDA ACEH MENYAPA
- Medsos: `@rri_bandaaceh` (IG, FB, TikTok, YouTube)
- Info Promosi & Kerjasama: `0811 6881 2123`

---

## Appendix A — Implementation Order (Recommended)

1. **Setup Next.js + Tailwind + TypeScript** boilerplate.
2. **Firebase init** + env vars + connect to console.
3. **Run seed script** → confirm data muncul di Firestore.
4. **Password gate** + session logic.
5. **Top Nav layout** + 3 routes shell.
6. **Settings page** — upload logo & manage presenters dulu (jadi data ada).
7. **Speakers page** — CRUD + search.
8. **ThumbnailPreview component** — SVG renderer (test pakai data dummy).
9. **SpeakerSelect component**.
10. **Generator page** — wire form + preview + download.
11. **PNG export** — test CORS dengan Storage.
12. **Polish**: empty states, loading spinners, error handling.
13. **Deploy ke Vercel**.
14. **End-to-end test** dengan data real.

## Appendix B — Error Handling Patterns

- **Firestore read fail:** show toast "Gagal memuat data. Refresh halaman." + retry button.
- **Storage upload fail:** show toast "Upload gagal: [reason]". Tetap di form.
- **PNG export fail (CORS):** show alert "Gagal generate PNG. Pastikan Storage CORS sudah disetup. Lihat dokumentasi."
- **Network offline:** show banner kuning "Anda offline. Perubahan tidak akan tersimpan."
- **Validation errors:** inline message di bawah field, merah, text-xs.

## Appendix C — Performance Tips

- `useMemo` untuk filter speaker list.
- Lazy-load gambar di SpeakerSelect dengan `loading="lazy"`.
- Debounce search input 200ms (kalau list > 200 item).
- Resize image client-side sebelum upload (canvas).
- `next/image` untuk gambar UI (tapi NOT untuk SVG `<image>` — pakai URL langsung).
- Cache Firebase queries di Context (avoid re-fetch saat pindah halaman).
