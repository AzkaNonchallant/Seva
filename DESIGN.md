# Design System — Horizon Odyssey

File ini cuma penunjuk. Sumber desainnya ada di
[`stitch_universal_travel_management_platform/horizon_odyssey/DESIGN.md`](stitch_universal_travel_management_platform/horizon_odyssey/DESIGN.md)
(7.6 KB, frontmatter YAML + bagian Brand, Colors, Typography, Layout,
Elevation, Shapes, Components).

## Yang sudah diterapkan

Token di file itu sudah diterjemahkan ke `@theme` Tailwind v4 di
[`app/globals.css`](app/globals.css) — warna, skala Inter, spacing, radius, dan
shadow. Komponen di `components/ui/` mengikuti bagian Components; `booking/`,
`travel/`, dan `layout/` mengikuti bagian Brand & Style.

Komentar di source yang menyebut "DESIGN.md" tanpa path merujuk file stitch
yang di atas. Contohnya `app/globals.css:4` menyebut path lengkap.

## Catatan

Folder `stitch_universal_travel_management_platform/` adalah **referensi
visual** — dipakai untuk melihat warna, tipografi, dan tata letak. Isinya
termasuk `code.html` hasil ekspor Stitch, yang **bukan** aplikasi ini dan tidak
disalin mentah ke sini. Yang dipakai hanya nilai-nilai desainnya.
