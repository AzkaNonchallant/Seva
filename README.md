# Horizon Odyssey — Dinas Travel

Front-end untuk Sistem Manajemen Perjalanan Dinas PT Andrea. Dibangun dengan
Next.js 16 (App Router) dan Tailwind CSS v4.

Fitur yang terimplementasi penuh adalah area **Admin Travel**: dashboard, antrean
penugasan booking, pembuatan dan perubahan status booking, detail travel
request, monitoring keberangkatan, travel policy, dan notifikasi.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Halaman root mengarahkan sesuai role: ke login bila
belum punya sesi, atau ke beranda role bila sudah masuk.

Perintah lain:

```bash
npm run build   # build produksi
npm run lint    # ESLint
npx tsc --noEmit  # cek tipe tanpa emit
npx next typegen # regenerate PageProps/LayoutProps setelah menambah rute
```

## Backend: mock atau asli

`API_SPEC.md` adalah kontrak yang jadi rujukan. Transport-nya punya dua mode dan
hanya perlu satu environment variable untuk berpindah:

```bash
# Kosong = mock aktif (default, backend belum tersedia)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001  # backend sungguhan
```

Saat variabel tersebut kosong, `apiRequest` memuat `lib/mocks/handlers.ts`
sebagai transport. Saat diisi, modul yang sama dilewati dan permintaan
dipYKirim ke backend. Tidak ada call site yang berubah, dan tidak ada kode yang
perlu dihapus saat backend siap.

Mock menyalin `API_SPEC.md` persis: path, method, envelope
`{success, data}` / `{success, message}`, dan kode status. Role `ADMIN` dari
backend adalah satu-satunya penentu akses; label "Admin Travel" hanya istilah
di layar.

### Login demo (khusus mock)

Semua akun memakai password `andrea2026`:

| Email | Role | Beranda |
|---|---|---|
| `elena.rostova@andrea.co.id` | ADMIN | `/travel-admin/dashboard` |
| `andra.wijaya@andrea.co.id` | SUPER_ADMIN | `/admin/dashboard` |
| `azka.pratama@andrea.co.id` | EMPLOYEE | `/employee/dashboard` |
| `ayu.lestari@andrea.co.id` | FINANCE | `/finance/dashboard` |

Data mock disimpan di memori proses, jadibooking yang dibuat akan hilang setelah
server di-restart. Itu disengaja — tidak perlu database untuk melihat seluruh
alur kerja.

## Struktur

```
app/
  login, forgot-password     auth (login, lupa password)
  travel-admin/               area Admin Travel (lihat di bawah)
  admin|approver|employee|finance/   placeholder, rute tetap ada
  actions/                    server action: auth, booking, notifikasi
  globals.css                 token desain sebagai @theme Tailwind v4
lib/
  api/                        lapisan service — satu file per domain
    api.ts                    interceptor: token, envelope, switch mock/nyata
    errors.ts                 ApiError + toDisplayError
    fetch-or-not-found.ts     helper 404 untuk halaman detail
  auth.ts                     createSession / requireSession / requireBookingManager
  permissions.ts              peta role → beranda
  mocks/                      handler mock + data benih
components/
  ui/                         primitif: button, card, badge, field, empty/error state
  layout/                     sidebar, header
  data-table/                 tabel, filter, paginasi
  booking/, travel/, auth/    komponen per domain
```

### Layar Admin Travel

| Rute | Endpoint |
|---|---|
| `/travel-admin/dashboard` | `GET /api/travel/bookings/pending`, `GET /api/notifications/unread-count` |
| `/travel-admin/bookings/queue` | `GET /api/travel/bookings/pending` |
| `/travel-admin/bookings` | `GET /api/travel`, `GET /api/travel/:id/bookings` |
| `/travel-admin/bookings/[id]` | `GET /api/travel/:travelId/bookings` |
| `/travel-admin/requests` | `GET /api/travel` |
| `/travel-admin/requests/[id]` | `GET /api/travel/:id` |
| `/travel-admin/departures` | `GET /api/travel`, `GET /api/travel/:id/bookings` |
| `/travel-admin/policy` | `GET /api/travel/policies` |
| `/travel-admin/notifications` | `GET /api/notifications` |
| `/travel-admin/reports` | `GET /api/reports/*` |
| `/travel-admin/documents` | `GET /api/travel/:id/documents` |
| `/travel-admin/profile` | `GET /api/auth/me` |

Mutasi lewat Server Action: `POST /api/travel/:travelId/bookings` dan
`PATCH /api/travel/bookings/:id/status`. Keduanya memanggil ulang gate role di
server — tombol yang nonaktif di UI hanya kenyamanan, bukan titik penegakan.

## Autentikasi

Token JWT disimpan di cookie `httpOnly` (`horizon_token`), jadi tidak pernah
masuk ke bundle browser. `apiRequest` adalah modul `server-only` yang membaca
cookie itu dan memasang header `Authorization: Bearer <token>`.

## Catatan implementasi

**Rute memakai segmen nyata, bukan route group.** Scaffold awal memakai
`(admin)`, `(employee)`, dan sejenisnya, tapi itu membuat lima file berbeda
saling berebut `/dashboard` dan build gagal. Rute sekarang adalah segmen biasa
(`/admin`, `/travel-admin`, …) sehingga tidak ada tabrakan.

**Tampilan lintas-travel disusun di sisi klien.** `API_SPEC` tidak menyediakan
endpoint agregat booking, padahal dashboard butuh sebaran status dan total
realisasi. Angka itu dirangkai dari `GET /api/travel` lalu
`GET /api/travel/:id/bookings` di `lib/api/report.ts`, bukan dengan endpoint
baru. Konsekuensinya satu permintaan tambahan per travel. Kalau backend nanti
menambah endpoint laporan, hanya fungsi di file itu yang perlu diganti.

**`GET /api/travel/bookings/pending` tidak punya body di spec.** Endpoint itu
disebut namanya saja. Mock mengembalikan baris yang sudah di-denormalisasi
(nama pemohon, kota, tanggal, estimasi, jam tunggu) — dicatat di
`lib/api/booking.ts`.

**`GET /api/travel/:travelId/bookings` addressed dengan travel id, bukan
booking id**, sesuai nama path-nya. Halaman `/bookings/[id]` karena itu
menampilkan seluruh booking milik satu pengajuan.
