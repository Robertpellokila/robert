# My Little World — v0.8.9

**Cinematic Welcome → Compact World Chooser**

## Berubah
- Welcome intro dibuat sebagai **tahap terpisah** dari pilihan mode.
- Intro menggunakan foto/portrait yang dapat diganti, judul **Welcome to my little world**, durasi otomatis 2,9 detik, animasi scale-up, progress line, dan tombol Skip.
- Setelah intro, **modal kecil** menampilkan pilihan 3D/Lite di atas **scene Three.js asli** yang sudah disiapkan. Tidak lagi menggunakan kartu split-screen besar sebagai seluruh landing experience.
- Saat render 3D belum siap atau WebGL tidak mendukung, latar fallback ditampilkan agar tidak ada layar kosong.
- Memilih 3D menutup chooser dan menampilkan dunia yang sudah ada; memilih Lite melepas render 3D.
- Berpindah dari Lite via Explore 3D tetap langsung masuk 3D tanpa intro/popup ulang.
- Footer Lite mempertahankan **Replay welcome** untuk menonton intro lagi.
- Intro menghormati prefers-reduced-motion, desain modal responsif.
- Konfigurasi foto intro `owner.introPhoto` dan durasi intro `welcomeSettings.introDurationMs` di `data/portfolio.ts`.

## Berkas utama
- `components/PortfolioEntryOverlay.vue` (baru)
- `assets/css/entry-cinematic.css` (baru)
- `pages/index.vue` (diperbarui)
- `data/portfolio.ts` (diperbarui)
- `nuxt.config.ts` (CSS)
- `scripts/test-entry-v089.cjs` (baru)

## Pengujian
`npm run check:syntax`, `npm run test:logic`, dan parsing CSS dilakukan pada proyek. Nuxt build/visual browser masih perlu verifikasi lokal.
