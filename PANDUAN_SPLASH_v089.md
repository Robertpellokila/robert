# My Little World v0.8.9 — Cinematic Intro & World Preview

Versi ini memperbaiki pengalaman pertama pengunjung. Splash dan pilihan mode **bukan lagi satu layar besar**.

## Alur pengunjung

1. Pengunjung membuka beranda → layar **Welcome** dengan foto dan teks menjalankan animasi zoom selama sekitar **2,9 detik**.
2. Animasi selesai → layar intro memudar dan memperlihatkan **dunia miniatur Three.js yang sudah dimuat di belakang**. Jika WebGL belum siap, gambar suasana kota CSS menjadi fallback sampai render selesai.
3. Modal kecil muncul (di kanan pada desktop, bawah pada ponsel): **Enter the 3D World** dan **View Lite Portfolio**.
4. Memilih 3D → modal langsung menutup dan dunia 3D di belakangnya menjadi interaktif tanpa memuat scene kedua kali.
5. Memilih Lite → mode 3D dilepas dan halaman Lite profesional ditampilkan.
6. Dari Lite, **Explore 3D** → **langsung 3D**, tidak kembali ke modal/welcome.
7. **Replay welcome** di footer Lite → intro dapat dimainkan ulang secara sengaja.

## Menggunakan foto ketika mengajar

Foto harus milikmu dan tidak disertakan secara otomatis karena belum diberikan pada versi ini.

1. Siapkan foto asli kegiatan mengajar, sebaiknya JPG atau WebP dengan sisi lebih dari 800px, sebaiknya terkompresi (contoh 150–400KB).
2. Simpan di `public/images/teaching-intro.webp`.
3. Buka `data/portfolio.ts`, ubah bagian `owner` menjadi:

```ts
introPhoto: '/images/teaching-intro.webp',
```

Jika `introPhoto` kosong, intro akan menggunakan foto dari `owner.photo`. Ini **bukan** foto yang menyatakan sedang mengajar; hanya fallback profil.

## Mengubah durasi intro

Buka `data/portfolio.ts`:

```ts
export const welcomeSettings = {
  introDurationMs: 2900,
} as const
```

Contoh: `introDurationMs: 3800` untuk durasi 3,8 detik. Saat sistem mengaktifkan preferensi `prefers-reduced-motion: reduce`, intro otomatis lebih singkat dan efek gerak dimatikan.

## Mengubah desain popup dan splash

- `components/PortfolioEntryOverlay.vue` — markup splash, foto dan dua tombol mode.
- `assets/css/entry-cinematic.css` — seluruh warna, scale, transisi, posisi popup, dan responsivitas.
- `pages/index.vue` — state `entryStage` (`intro`, `choose`, `done`), timer, dan pemilihan mode.
- `data/portfolio.ts` — foto dan durasi intro.
- `nuxt.config.ts` — mengaktifkan CSS baru.

Kamu dapat mengubah ukuran modal melalui `.mlw-choice-card { width: min(410px,100%) }`. Ubah posisi kanan melalui `.mlw-choice-layer { justify-content: flex-end; padding: ... }`.

## Menjalankan dan menguji di Mac

```bash
npm install
npm run test:logic
npm run check:syntax
npm run dev
```

Buka `http://localhost:3000` lalu tes:

1. Hard-refresh (`Cmd + Shift + R`) → intro animasi terlihat; tanpa klik pun masuk pilihan mode setelah ~2.9 detik.
2. Pastikan dunia 3D terlihat di belakang modal saat WebGL aktif. Jika loading, fallback visual akan terlihat sementara.
3. Pilih **Lite Portfolio**, klik **Explore 3D** → masuk langsung ke 3D.
4. Switch kembali ke Lite → tidak ada popup baru.
5. Klik **Replay welcome** → animasi dan popup dimainkan ulang.
6. Buka responsive mode pada lebar 375, 425 dan 768 px; modal seharusnya berpindah ke bawah sehingga dunia miniatur masih terlihat di atas.
7. Aktifkan reduced motion di sistem/browser → animasi berkurang.
8. Jalankan `npm run build` sebelum deployment.

**Batas pengujian:** pengujian kode dan logika dapat dilakukan tanpa WebGL, namun hasil visual/fps/kompilasi Nuxt secara penuh belum tervalidasi di lingkungan pembuat ZIP. Uji browser lokal tetap diperlukan.
