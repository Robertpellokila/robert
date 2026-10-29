# Changelog v0.8.4 → v0.8.5

## Added

- Enam layout interior **unik** berdasarkan referensi Home, About, Experience, Skills, Projects, dan Contact dari pengguna.
- Module `world/roomDecor.ts`: furniture rinci dan scene-specific helper (lantai papan, rak, tanaman, kursi, lampu, jendela, tirai, monitor, server rack, display museum, mesin kopi, pastry).
- Project Gallery: pedestal, papan nama proyek, display museum. Poster interaktif sebelumnya tetap aktif.
- Contact: ruangan kafe dengan counter kayu, mesin kopi dan etalase pastry.
- `scripts/test-room-v085.cjs` menambah 11 pemeriksaan untuk rancangan ruangan.
- Panduan desain dan perubahan koordinat di `PANDUAN_DESAIN_INTERIOR_v085.md`.

## Changed

- `createInteriors.ts` kini memanggil `decorateRoom()` dan memakai palet berbeda tiap chapter.
- Lighting interior: titik cahaya hangat untuk Home dan Contact, netral di bagian lain.
- Exposure indoor turun secara bertahap agar material pucat tidak wash out saat first-person.
- Titik klik beberapa objek berpindah mengikuti desain furniture.
- Manifest version menjadi 0.8.5.

## Keamanan regresi

- Seluruh sistem outdoor, chapter scroll, chibi avatar, first-person WASD, mobile/Lite mode, CV HTML/PDF, project case study, dan GitHub tidak dihapus.
- `npm run test:logic` dan `npm run check:syntax` lulus di lingkungan pembuat.

## Batasan

- **Bukan identik 1:1 dengan gambar render**: referensi 2D tanpa model 3D asli; furniture procedural adalah tahap pertama.
- Full Nuxt build dan pemeriksaan WebGL langsung belum terverifikasi (dependensi Nuxt/Three.js tidak tersedia di lingkungan pembuat).
- Collision furniture belum otomatis.
