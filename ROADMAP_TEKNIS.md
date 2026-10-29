# Status pengembangan — 28 Oktober 2022

- **v0.3:** Cinematic character & camera — fondasi dibuat.
- **v0.4:** Diorama enam ruangan dan enterable buildings — fondasi dibuat.
- **v0.5:** Interactive Portfolio Content, case studies, GitHub & printable CV — fondasi dibuat.
- **v0.6:** Living World — **implementasi source code tersedia**: day/sunset/night, emissive lights, moving trees/clouds, two traffic NPC, ambient sound on user gesture, Eco, reduced motion, arrival rings. **Belum diverifikasi dengan full Nuxt build dan live browser**.
- **v0.7 (next):** Mini map, world interactions, dialog karakter, easter eggs, keyboard navigation.
- **v0.8:** Mobile/performance: lazy-loaded scenery, texture budgets, automated performance benchmark, WebGL fallback.
- **v1.0:** Accessibility, SEO, privacy-respecting analytics, production deployments, device testing.

Lihat `PANDUAN_BELAJAR_v06.md` untuk struktur kode, langkah eksperimen, dan checklist UAT.

---

# Roadmap teknis setelah v0.5

| Versi    | Fokus                             | Acceptance criteria                                                                                           |
| -------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| v0.3     | Character & cinematic camera      | Scroll maju/mundur deterministik; naik kendaraan; camera blend                                                |
| v0.4     | Enterable miniature buildings     | Enam interior; karakter masuk/keluar; cutaway camera; konten HTML                                             |
| **v0.5** | **Interactive portfolio content** | Case study per slug, GitHub featured, preview opt-in, screenshot gallery, timeline dan printable CV           |
| v0.6     | Living World                      | Day/night lighting, awan dan pepohonan bergerak, NPC vehicles, ambience opt-in, bangunan merespons kedatangan |
| v0.7     | Visitor Experience                | Mini-map, menu aksesibilitas, dialog, progressive disclosure, easter eggs                                     |
| v0.8     | Performance & Mobile              | Adaptive pixel ratio, asset compression/lazy loading, performance budgets dan fallback tanpa WebGL            |
| v1.0     | Professional release              | Kontrak data konten final, SEO audit, accessibility audit, test mobile, CI/CD, domain dan analytics opsional  |

## Rancangan v0.6 — Living World (belum diimplementasi)

1. `world/environmentClock.ts`: `dayPhase` 0..1, mengontrol cahaya/sky warna tanpa perlu real-time.
2. `world/ambientMotion.ts`: animasi pohon, awan, lampu menggunakan elapsed time; pause saat tab tidak terlihat.
3. `world/npcVehicles.ts`: kendaraan dekoratif pada jalur terpisah tanpa mengganggu protagonis.
4. `composables/useWorldPreferences.ts`: pengaturan tema siang/malam, mute/unmute ambience, reduced-motion.
5. `components/WorldSettings.vue`: user toggles di UI, simpan secara lokal hanya saat ada persetujuan.
6. `tests/`: pastikan state perjalanan tidak dipengaruhi animasi ambient; test frame-rate dan interaction freeze.

**Arsitektur penting:** Storyboard scroll tetap deterministik dan terpisah dari animasi suasana. Tiga kategori state: `journey` (scroll), `interior` (enter/exit), dan `ambient` (clock/NPC) sehingga tidak saling mengganggu.

## v0.7 — Visitor Experience (implemented in source, browser verification pending)

- Mini-map skematis dengan akses cepat enam lokasi.
- Dialogue bubble berdasarkan fase perjalanan.
- Enam collectible objek 3D, dipilih dengan Raycaster.
- Postcard collection dan penghitungan temuan yang tersimpan lokal.
- Alternative HTML bagi keyboard/touch input.

Tahap berikutnya **v0.8**: pengalaman mobile khusus, optimasi bundle/model, quality presets, navigasi tanpa WebGL, dan audit accessibility/performance.

## v0.8 delivered (foundation)

Mode Lite/3D, pilihan kualitas, pause render tab tersembunyi, responsivitas Lite, loading state, pengujian performa logika. Setelah verifikasi build dan mobile browser, lanjut v1.0: optimasi konten/SEO, accessibility audit, dan deploy.
