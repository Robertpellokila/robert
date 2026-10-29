# Changelog — My Little World v0.8.2

## Tujuan
Patch dari v0.8.1 untuk **Stylized Chibi + Big Head + Hair Likeness** serta menghilangkan tabrakan menu Mini Map/World/Graphics pada mobile. Ini bukan project baru; seluruh fitur v0.8 tetap ada.

## Yang berubah

1. **Avatar procedural dipisah** ke `world/createChibiAvatar.ts`.
   - Kepala 1,35× dengan kepala sebagai `Group` ber-pivot untuk animasi.
   - Wajah memakai permukaan halus, pipi dan dagu lebih lembut; mata, alis, hidung, dan mulut berbentuk geometri Three.js.
   - Rambut hitam tebal *center-part / curtain hair*, dua fringe dan sideburn, merujuk ciri visual pada gambar yang diberikan.
   - Hoodie hijau, celana, sepatu, pivot tangan/kaki tetap kompatibel dengan `poseCharacter` dan perjalanan motor/bus.
   - Perubahan proporsi dan rambut dapat disetel lewat `data/portfolio.ts` (`headScale`, `hairSweep`, `eyebrowTilt`).
   - Avatar ini **representasi stylized**, bukan 3D scan dengan kemiripan wajah 1:1.

2. **Mobile Tools Drawer baru** (`components/MobileToolsDrawer.vue`).
   - Header mobile kini satu tombol untuk membuka `Map & Sections` dan `World Settings`.
   - Mini Map, World Settings, Graphics, Sound, Moving World, dan Cinematic Camera tersedia di drawer yang sama.
   - Kontrol Mini Map/World lama hanya disembunyikan pada layar ≤760px; desktop tetap seperti sebelumnya.
   - Drawer modal memakai `aria-modal`, label, tombol close, Escape, dan focus wrap pada Tab.
   - Navigasi lokasi dan discovery dari drawer terhubung ke state yang sudah ada.

3. **Layering dan prioritas mobile** (`assets/css/main.css`).
   - UI utama hanya menampilkan brand/menu, ringkasan bottom sheet, progress kecil, dan 3D/Lite switch.
   - Selector Graphics dipindah dari switch mobile ke Settings.
   - Scene 3D lebih terbuka; drawer muncul di atas scene tanpa bertabrakan dengan popup lama.
   - Kontras header pada Night Mode diperbaiki.

4. **Kamera mobile** (`world/cameraDirector.ts`).
   - Zoom target ditingkatkan pada portrait; offset kamera diringkas tanpa mengubah komposisi desktop.

5. **Pengujian**
   - `npm run test:logic` menambahkan 12 tes baru di `scripts/test-mobile-v082.cjs`.
   - Perintah `npm run test:mobile:v082` menjalankan tes patch saja.
   - Tes logika/source dan pemeriksaan sintaks sudah dijalankan, **namun kompilasi Nuxt dan WebGL browser belum dapat diverifikasi karena npm registry tidak dapat diakses**.

## Catatan
- Foto referensi yang sebelumnya ada di `public/images/avatar-reference.webp` masih digunakan untuk About. Karena disimpan di `public`, ia akan ikut terpublikasi apabila website dideploy; ubah/hapus jika tidak ingin menampilkannya secara publik.
- Perangkat mobile perlu diuji nyata, terutama iPhone Safari dan Chrome Android, setelah `npm install` dan `npm run build` lokal berhasil.
