# Changelog v0.7.0 — Visitor Experience

Dibangun di atas source code **v0.6.0**, tanpa menghapus scene, interior, project gallery, case study, CV, GitHub highlights, dan kontrol World.

## Fitur

1. **Mini-map diorama**: tombol MINI MAP membuka gambaran jalur dengan enam lokasi, progres perjalanan, dan pilihan travel ke chapter. Berbeda dengan navigasi utama, klik mini-map tiba di luar bangunan; pengguna dapat masuk secara manual.
2. **Character dialogue**: pesan mengikuti fase perjalanan (`walk`, `mount`, `ride`, `dismount`, `arrive`) dan lokasi. Tombol × menyembunyikan dialogue, tombol chat mengaktifkannya lagi. Dialog tidak menggunakan data pribadi yang dikarang.
3. **Interactive 3D collectibles**: enam objek low-poly di dekat bangunan; kursor pointer saat hover. Klik memicu `THREE.Raycaster`, lalu membuka postcard naratif.
4. **Postcard collection**: daftar temuan yang sudah dibuka tersimpan di `localStorage` dengan key `mlw-discoveries-v07` dan divalidasi saat dimuat.
5. **Keyboard/touch alternative**: tombol Discover here dalam MINI MAP membuka kartu yang sama; pengguna tidak harus bisa mengklik objek 3D kecil.
6. **Discovery panel**: ada tombol kembali, menuju lokasinya, atau masuk gedung ketika berada di lokasi tersebut. Tombol ESC menutup modal.
7. **Pengujian logika Visitor Experience**: sembilan tes tambahan dalam `scripts/test-visitor.cjs`.

## Perubahan file

- `data/discoveries.ts` — data enam collectible (nama, pesan, warna)
- `utils/visitorExperience.ts` — validasi koleksi, judul chapter, pilihan dialog
- `components/VisitorExperience.vue` — UI mini-map, dialog, postcard
- `pages/index.vue` — state penemuan, penyimpanan lokal, event navigasi
- `components/WorldScene.vue` — menyalurkan event interaksi dari Three.js ke Vue
- `world/createWorld.ts` — model objek collectible + Raycaster + cleanup event listener
- `assets/css/main.css` — desain visitor UI, ukuran mobile, canvas pointer events
- `scripts/test-visitor.cjs` — sembilan tes logika

## Batasan dan keputusan desain

- Peta bersifat **skematis**, bukan peta 3D penuh atau penunjuk koordinat presisi.
- Cerita koleksi adalah *editorial flavour*, bukan klaim pencapaian, riwayat kerja, atau keterampilan pribadi.
- Tombol mini-map memakai `scrollIntoView`; ketika memilih lokasi baru, karakter melakukan perjalanan mengikuti posisi scroll, bukan teleportasi langsung dalam satu frame.
- Dialog karakter tampil sebagai HTML overlay. Belum ada animasi bibir, voice-over, atau sistem percakapan bercabang.
- Fitur collectible adalah objek yang dapat diklik, bukan sistem collision/gameplay fisik.
- Build Nuxt/WebGL perlu dites pada browser nyata sebelum deployment.
