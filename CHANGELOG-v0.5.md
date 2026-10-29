# Changelog — v0.5.0

## Dari v0.4 ke v0.5

**Dipertahankan:** kota miniatur 3D, animasi jalan/motor/bus yang dikontrol scroll, kamera cinematic/calm, enam gedung dan interior, enter/exit, Director Mode.

**Ditambahkan:**
- `data/projects.ts` dan `PortfolioProject` terstruktur untuk case study (satu source of truth).
- Halaman `/projects/[slug]` lengkap: konteks, tantangan, pendekatan, highlight, engineering, progress, pembelajaran, galeri.
- Tiga SVG concept cover, transparan diberi label sebagai concept artwork.
- Modal `ProjectPreview` fullscreen dengan device viewport desktop/mobile, URL validation dan sandbox.
- `CareerTimeline` & `/resume` dengan print to PDF.
- `GitHubHighlights` dan repo pilihan `githubFeaturedRepositories` via API server.
- `utils/projectLinks.ts`, `assets/css/content.css`, `scripts/test-content.cjs`.
- Klik proyek dari panel luar maupun interior; SEO metadata per proyek.

**Tidak termasuk:** hasil deploy website pribadi, screenshot proyek nyata, PDF CV asli, perhitungan metrik impact, day/night dan kendaraan NPC (untuk v0.6).

## Verifikasi

- 7/7 storyboard tests.
- 6/6 camera tests.
- 8/8 content tests.
- Parsing 24 file TS/Vue: tidak ditemukan diagnostic error; nested HTML tag diperiksa.
- Build Nuxt penuh dan visual browser belum dijalankan (registry npm gagal DNS `EAI_AGAIN` di lingkungan ini).
