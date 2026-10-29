# Panduan Belajar — My Little World v0.8

## Tujuan
Belajar menerapkan **progressive enhancement**, menjaga konten tetap dapat diakses tanpa 3D, mengatur beban GPU, dan menyediakan pengalaman mobile yang lebih baik.

## 1. Instalasi

```bash
npm install
npm run test:logic
npm run check:syntax
npm run build
npm run dev
```

Buka `http://localhost:3000`. Tes di Chrome desktop dan simulasi perangkat mobile di DevTools. Jangan menggabungkan source v0.7 dan v0.8: gunakan folder baru supaya tidak ada komponen ganda.

## 2. Struktur yang perlu dipelajari (dalam urutan)

1. `utils/experienceMode.ts` — memilih default Lite atau 3D berdasarkan dukungan WebGL2 dan reduced motion.
2. `components/LitePortfolio.vue` — semua section dan proyek ditampilkan secara **HTML semantik**, tanpa Three.js.
3. `components/ExperienceSwitch.vue` — tombol 3D/Lite dan pilihan kualitas. Selalu tersedia, termasuk saat scene gagal.
4. `pages/index.vue` — menyimpan pilihan pengalaman di LocalStorage, menanggapi error, dan beralih antara dua tampilan.
5. `composables/useJourney.ts` — watcher memasang/membersihkan ScrollTrigger setelah halaman 3D dipasang/dilepas.
6. `utils/renderQuality.ts` — preset DPR, target FPS, dan adaptasi sederhana.
7. `world/createWorld.ts` — menghentikan GPU saat tab tersembunyi dan mengatur frame pacing. Menandai `ready` setelah frame pertama berhasil digambar.
8. `world/livingWorld.ts` — menerapkan kualitas ke renderer dan shadow.

## 3. Alur pergantian mode

- Pengunjung pertama kali mendapat HTML Lite dari server, sehingga konten tidak bergantung pada WebGL untuk SSR.
- Saat hydrasi browser, `supportsWebGL2()` memeriksa kemampuan perangkat. Bila WebGL2 tersedia dan system preference tidak meminta reduced motion, otomatis masuk 3D kecuali pengunjung pernah memilih mode lain.
- Ketika memilih Lite, `WorldScene` dilepas, semua canvas serta resource GPU dibersihkan, audio ambience dimatikan. Semua section tetap dapat diakses melalui tautan anchor HTML.
- Bila WebGL rusak, `WorldScene` mengirim event `fatal`; halaman beralih ke Lite dan menampilkan pesan.

### Mengubah preferensi secara manual

Gunakan kontrol **◇ 3D World | ☷ Lite**. Pada mode 3D, pilih **Auto**, **High**, **Balanced**, atau **Low**. Mode disimpan dalam `localStorage['mlw-experience-v08']`.

## 4. Bagaimana kualitas grafis bekerja?

| Mode | Batas device pixel ratio | Target frame | Shadow |
|---|---:|---:|---|
| High | 1.5 | 60 fps | Aktif |
| Balanced | 1.15 | 30 fps | Nonaktif |
| Low | 1.0 | 20 fps | Nonaktif |
| Auto | Mengikuti kemampuan awal + penurunan bertahap | Dinamis | Sesuai tier |

**Penting:** frame rate adalah target batas, bukan janji frame rate aktual. Jika layar 60 Hz dan tier 30 fps, renderer melakukan update pada sekitar setiap frame kedua. Lihat `targetInterval()` di `utils/renderQuality.ts`.

Periksa `livingWorld.update`: render dan posisi scroll tetap satu sumber kebenaran untuk perjalanan karakter, sedangkan animasi awan, pepohonan dan NPC berbasis delta time.

## 5. Penghematan energi tab tersembunyi

Perhatikan di `world/createWorld.ts`:

```ts
function handleVisibility() {
  if (document.hidden) renderer.setAnimationLoop(null)
  else {
    lastDraw = 0
    renderer.setAnimationLoop(renderFrame)
  }
}
```

Mengapa `lastDraw` di-reset? Supaya kembali dari tab tidak menghitung jeda selama beberapa menit sebagai satu frame animasi yang panjang. Pelajari `visibilitychange` dari MDN.

## 6. Latihan mandiri

1. Ubah `qualityDPR.balanced` dari `1.15` menjadi `1.0`. Bandingkan ketajaman dengan kualitas High.
2. Ubah `qualityFPS.low` dari `20` menjadi `15`. Perhatikan kelancaran dibanding penghematan rendering.
3. Tambahkan proyek baru pada `data/projects.ts`, lalu lihat apakah otomatis tampil di `LitePortfolio.vue` dan Project Gallery 3D.
4. Aktifkan setting sistem Reduce Motion, buka halaman di incognito: pengalaman default seharusnya Lite.
5. Disable WebGL di Chrome (atau gunakan perangkat tanpa WebGL2): halaman Lite tetap dapat digunakan.
6. Pindah ke tab lain, kembali lagi; perhatikan scene 3D tidak melompat atau error.

## 7. Checklist QA browser

- [ ] 3D berjalan di desktop dengan WebGL2.
- [ ] Seluruh enam section dapat dibuka dalam Lite tanpa GPU.
- [ ] Link case study dan CV dapat diklik.
- [ ] Beralih Lite → 3D → Lite tidak menggandakan canvas.
- [ ] About dan Projects masih dapat dimasuki di 3D.
- [ ] Day / Sunset / Night dan World Controls masih berfungsi.
- [ ] Mini-map dan enam Easter eggs tetap bekerja.
- [ ] Desktop, tablet, iPhone SE, dan perangkat Android lebar 360–430px tidak overflow horizontal.
- [ ] Tab tersembunyi tidak terus membuat frame WebGL.
- [ ] `npm run build` sukses, Console Chrome tidak menampilkan error.

## 8. Batasan pengujian

`npm run test:logic` menguji fungsi TypeScript dan pengecekan wiring, **bukan build Nuxt atau screenshot WebGL**. `npm run check:syntax` bukan typecheck template Vue. Jalankan `npm run build` dan pengujian browser sebelum deployment.
