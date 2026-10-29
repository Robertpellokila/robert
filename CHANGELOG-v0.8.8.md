# My Little World v0.8.8 — Welcome Splash & Direct Mode Switch Fix

## Masalah yang diperbaiki

1. **Splash tidak tampil secara konsisten.** Sebelumnya splash diletakkan di dalam struktur halaman, sehingga berpotensi terkena konteks stacking/z-index komponen lain. Sekarang splash dirender melalui `ClientOnly` + `Teleport to="body"`, menggunakan posisi fixed dengan z-index sangat tinggi.
2. **Explore 3D dari Lite bisa kembali ke pilihan mode.** Kini seluruh perpindahan mode memakai `changeExperience()` secara langsung; pilihan mode ditandai selesai bahkan bila pengguna memilih mode yang sedang aktif.
3. **Splash berulang ketika kembali dari halaman studi kasus.** State `welcomeCompleted` memakai `useState()` Nuxt agar bertahan selama navigasi SPA dalam kunjungan yang sama.
4. **Welcome tetap bisa dikunjungi lagi.** Tombol kecil **Replay welcome ✳** disediakan pada footer Lite Portfolio.

## Alur final

- Saat halaman dimuat ulang secara penuh (fresh load): muncul Welcome Splash.
- Pilih **Explore Lite Portfolio**: langsung Lite.
- Pilih **Enter the 3D World**: langsung inisialisasi Three.js dan masuk 3D.
- Dari Lite, tekan **Explore 3D**: langsung 3D, tidak membuka Welcome lagi.
- Dari 3D, tekan **Lite**: langsung Lite.
- Kembali dari halaman proyek (`/projects/[slug]`): tidak meminta pilihan berulang selama navigasi dalam aplikasi.
- Refresh penuh: splash muncul lagi, sesuai desain welcome saat kunjungan baru.

## File yang diubah

- `pages/index.vue` — status welcome, Teleport, dan perpindahan mode.
- `components/LitePortfolio.vue` — tombol Explore 3D direct dan Replay welcome.
- `assets/css/welcome-premium.css` — lapisan tertinggi, kunci scroll background, fokus keyboard.
- `assets/css/lite-premium.css` — gaya tombol Replay welcome.
- `scripts/test-v087.cjs` — menyesuaikan pemeriksaan lama dengan state baru.
- `scripts/test-welcome-v088.cjs` — enam tes tambahan.
- `package.json` — versi dan shortcut `npm run test:welcome`.

## Validasi

- `npm run test:welcome` — 6 tes logika/source-level lulus.
- `npm run test:logic` — regresi termasuk tes sebelumnya lulus.
- `npm run check:syntax` — 42 file script Vue/TypeScript lolos parsing.
- Kedua CSS baru lolos pemeriksaan parser CSS.

**Catatan:** Full Nuxt build serta browser WebGL belum diuji di lingkungan ini karena paket Nuxt belum dapat diinstal dari npm registry. Tes logika tidak menggantikan uji tampilan browser.
