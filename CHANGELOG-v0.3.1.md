# Perubahan dari v0.3.0 ke v0.3.1

- Memperhalus transisi target kamera antar fase (`utils/cameraTimeline.ts` + `world/cameraDirector.ts`).
- Memperbaiki `phaseProgress` saat berjalan agar interpolasi kamera tepat pada awal fase.
- Menambahkan head pivot; gerakan kepala mengikuti progress scroll (`world/createWorld.ts`, `world/animateCharacter.ts`).
- Memindahkan warna karakter ke `data/portfolio.ts` (`avatarStyle`).
- Menambahkan Director Mode dalam UI sebagai alat belajar real-time (`pages/index.vue`, `assets/css/main.css`).
- Menambahkan 6 pengujian kamera; total 13 pengujian logika (`npm run test:logic`).
- Menambahkan `ROADMAP_TEKNIS.md` dan `PANDUAN_BELAJAR_v031.md`.

## Status uji
- Lulus pengujian storyboard dan kamera (13/13).
- Lulus pemeriksaan sintaks TypeScript/Vue secara statis.
- **Belum** lolos verifikasi `npm run build` maupun inspeksi WebGL nyata; instalasi paket tidak berhasil di lingkungan pembuat. Jalankan build dan periksa visual di komputer target.
