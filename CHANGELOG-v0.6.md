# Changelog — v0.5 → v0.6

## Added

1. `world/livingWorld.ts`: modul lingkungan yang membuat lampu, jendela glowing, dua kendaraan dekoratif, arrival rings, dan menggerakkan pohon/awan/NPC pada waktu berjalan.
2. `utils/livingMath.ts`: helper murni untuk wrap progress NPC dan damping frame-rate independen.
3. `components/WorldControls.vue`: panel Day / Sunset / Night, motion, Eco, dan audio.
4. `composables/useAmbientAudio.ts`: synth original dengan Web Audio API. Audio dimulai hanya lewat klik, tidak otomatis.
5. `scripts/test-living.cjs`: 9 unit test lingkungan.
6. `scripts/test-living-runtime.cjs`: mock-scene smoke test for environment updates (not real WebGL).
7. `scripts/check-syntax.cjs`: pemeriksaan syntax TypeScript dan blok `<script>` Vue.

## Changed

- `world/createWorld.ts`: kini mengumpulkan referensi pohon/awan dan merangkai `createLivingWorld`; data scroll karakter tetap di `animateScene()`.
- `components/WorldScene.vue`: menerima tiga props lingkungan via callback reaktif tanpa membuat WebGLRenderer ulang.
- `pages/index.vue`: menyimpan pilihan lingkungan, default Eco di mobile, reduced-motion default untuk gerakan, tombol WORLD.
- `assets/css/main.css`: tampilan World Controls dan penyesuaian warna saat malam.
- `package.json`: v0.6.0; `npm run test:living`; syntax check; 30 tes total.

## Tidak berubah

Storyboard karakter, rute kendaraan utama, kamera sinematik, semua enam chapter, fitur masuk gedung, Project Gallery, Case Studies, GitHub Highlights, CV, serta modal preview website.

## Known limits

- Full Nuxt build / WebGL rendering belum diverifikasi di lingkungan penyiapan (registry npm gagal diakses).
- Lampu emissive tidak menyinari seluruh tanah secara fisik.
- Tidak ada collision detection NPC atau animasi kendaraan melalui mesin fisika.
- Ambient sound bersifat sederhana dan tidak selalu terdengar sama pada setiap speaker.
