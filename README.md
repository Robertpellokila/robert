# My Little World v0.8.7 — Interior Polish & Premium Experience

Lanjutan dari v0.8.6. **Peningkatan:** interior procedural untuk enam ruang lebih rapi, figur duduk menghadap workstation, bubble interaktif yang mengikuti kamera, splash premium beranimasi dengan pilihan Lite/3D, dan Lite Portfolio editorial responsif untuk recruiter maupun klien.

Dokumentasi: [Panduan v0.8.7](PANDUAN_BELAJAR_v087.md) · [Changelog](CHANGELOG-v0.8.7.md)

```bash
npm install
npm run test:logic
npm run check:syntax
npm run dev
npm run build
```

`npm run build` wajib diuji di lingkungan lokal setelah `npm install`: pada lingkungan pembuat, dependensi Nuxt belum tersedia. Model interior masih procedural, belum identik dengan render 2D referensi.

---

# My Little World v0.8.5 — Detailed Interiors

Lanjutan v0.8.4 dengan enam interior baru sesuai enam gambar referensi. **Bukan salinan identik photorealistic**: semua mesh disusun secara procedural agar dunia tetap eksplorabel. Baca [Panduan interior](PANDUAN_DESAIN_INTERIOR_v085.md) dan [Changelog](CHANGELOG-v0.8.5.md).

```bash
npm install
npm run test:logic
npm run check:syntax
npm run dev
npm run build
```

---

# My Little World v0.8.4

**Update:** Camera-relative first-person controls + readable in-room CV and project exhibits. Start with [Panduan v0.8.4](PANDUAN_BELAJAR_v084.md) and [Changelog](CHANGELOG-v0.8.4.md).

# My Little World v0.8.3 — Chapter Stops & POV Explorer

**Update terbaru:** satu scroll gesture satu chapter, zoom masuk rumah menuju first-person, WASD/panah dan mobile D-pad, 13 objek interaktif.

Panduan utama: [`PANDUAN_BELAJAR_v083.md`](PANDUAN_BELAJAR_v083.md) · Changelog: [`CHANGELOG-v0.8.3.md`](CHANGELOG-v0.8.3.md)

---

# My Little World v0.8.2 — Chibi Avatar & Clean Mobile

Pembaruan ini melanjutkan source v0.8.1. **Baca [Panduan Belajar v0.8.2](PANDUAN_BELAJAR_v082.md)** dan [Changelog](CHANGELOG-v0.8.2.md).

Perintah: `npm install`, `npm run test:logic`, `npm run check:syntax`, `npm run dev`, `npm run build`. Catatan: build browser belum diuji pada lingkungan pembuat karena registry npm tidak terjangkau.

---

# My Little World v0.8.1 — Mobile Cinematic Patch

**Lanjutan langsung dari v0.8.0, tidak memulai ulang proyek.** Mobile kini memiliki menu ringkas, bottom sheet detail, kamera isometrik yang berpusat pada karakter, serta avatar low-poly dengan rambut belah tengah dan wajah lebih ekspresif. Potret 2D yang pengguna berikan disertakan sebagai gambar About.

Mulai dengan `npm install`, `npm run test:logic`, dan `npm run dev`. Baca [Panduan v0.8.1](PANDUAN_BELAJAR_v081.md) dan [Changelog](CHANGELOG-v0.8.1.md).

**Batas pengujian:** npm install/build belum dapat dilakukan di lingkungan pembuat karena `EAI_AGAIN` pada registry npm. Hasil rendering browser belum terverifikasi.

---

# My Little World — v0.8.0

**Performance & Mobile Experience**: pilihan Lite/3D, Auto/High/Balanced/Low, pause di tab tersembunyi, indikator loading frame pertama, dan tampilan Lite untuk semua konten.

**Panduan baru:** [PANDUAN_BELAJAR_v08.md](PANDUAN_BELAJAR_v08.md) • [CHANGELOG-v0.8.md](CHANGELOG-v0.8.md).

# My Little World — v0.6.0 (Living World)

Website portfolio 3D bergaya **low-poly miniature**: Nuxt 3, Vue 3, TypeScript, Three.js, dan GSAP ScrollTrigger. Versi ini melanjutkan v0.5, bukan proyek baru.

## Jalankan

Persiapan: Node.js 22+, npm, Chrome/Safari/Firefox yang mendukung WebGL.

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Untuk memastikan integrasi produksi, jalankan `npm run build` setelah dependensi tersedia.

## Fitur v0.6

- Atmosfer **Day / Sunset / Night** dengan perpindahan halus pada langit, kabut, intensitas sunlight, warna sinar, serta exposure.
- **7 lampu jalan**, **6 jendela emissive**, dan **lampu mobil** yang bersinar saat malam.
- **13 pohon** di sepanjang jalan yang bergoyang perlahan, **3 awan** yang melayang, **2 mobil NPC** menyusuri jalan.
- Penanda kedatangan di depan **6 chapter**, berpendar saat karakter utama mendekat.
- Tombol **WORLD**: pilih waktu, aktif/nonaktif gerak lingkungan, Eco Graphics, dan ambient sound.
- Ambience berupa **suara angin dan cicit burung sintetis buatan kode**, tanpa file musik/audio eksternal; **OFF secara default** sampai ada klik pengunjung.
- Pengaturan waktu/gerak/eco disimpan pada localStorage bila tersedia. Audio tidak dipulihkan otomatis.
- Menghormati pengaturan reduced motion secara default; pengunjung boleh mengubahnya melalui WORLD.
- Mode Eco mematikan shadow map dan membatasi pixel ratio ke 1. Mode normal membatasi pixel ratio ke 1.5.

### Fitur yang tetap dipertahankan dari v0.5

- Karakter hoodie, scroll sinematik, perjalanan kaki/motor/bus, kamera orthographic.
- Enam section: Home, About, Experience, Skills, Projects, Contact.
- Enter / Exit Building dengan ruangan diorama, Project Gallery, Project Case Studies, modal preview website (jika mendukung iframe), Github Highlights, printable CV.

## Belajar file berurutan

| File | Konsep |
|---|---|
| `pages/index.vue` | State pengaturan WORLD, preferensi, komunikasi antar komponen |
| `components/WorldControls.vue` | Props + emits untuk tombol pengaturan |
| `components/WorldScene.vue` | Props Vue dibaca oleh callback yang terus hidup di Three.js |
| `world/createWorld.ts` | Merangkai scene utama dan modul lingkungan |
| `world/livingWorld.ts` | Langit, pohon, awan, mobil NPC, lampu dan efek kedatangan |
| `utils/livingMath.ts` | Perhitungan lintasan NPC dan interpolasi frame-rate independen |
| `composables/useAmbientAudio.ts` | AudioContext yang dipicu klik dan dibersihkan ketika berhenti |
| `assets/css/main.css` | Panel WORLD dan penyesuaian tampilan malam |

Panduan dengan potongan kode dan latihan: **`PANDUAN_BELAJAR_v06.md`**.

## Pengujian

```bash
npm run test:logic        # 30 unit assertions + 1 smoke run (7 journey + 6 camera + 8 content + 9 living)
npm run test:living       # 9 tes untuk v0.6
npm run test:smoke        # smoke test lingkungan dengan mock scene (bukan WebGL asli)
npm run check:syntax      # pemeriksaan parse TypeScript dan script Vue
npm run build             # wajib diuji di Mac setelah npm install
```

Catatan: perintah `test:logic` dan `check:syntax` tidak menggantikan build Nuxt, pemeriksaan TypeScript penuh, ataupun pengujian grafis WebGL di browser. Pengujian build belum tersedia di lingkungan penyiapan ini karena registry npm tidak dapat dijangkau.

## Mengatur isi portofolio

- Edit nama, pengalaman, foto profil, dan GitHub: `data/portfolio.ts`.
- Edit studi kasus, URL demo dan repository: `data/projects.ts`.
- Foto profil: `public/images/profile.jpg`.
- Screenshot proyek yang asli: simpan ke `public/images/projects/`, lalu daftarkan di `data/projects.ts`.
- Preview iframe harus mendapat izin dari website proyek; selalu sediakan tautan untuk membuka situs asli.

## Perilaku & batasan yang disengaja

- NPC adalah objek dekoratif di lajur jalan, **belum memakai physics atau collision detection**. Perjalanan NPC berputar dari ujung jalan ke ujung lainnya.
- Pohon dan awan bukan simulasi angin realistis. Animasi ringan menggunakan sinus, dengan delta frame yang dibatasi.
- Lampu kebanyakan menggunakan `emissive` pada material, **bukan** puluhan `PointLight` yang mahal. Ini memberi kilau visual, bukan pencahayaan fisik pada permukaan sekitar.
- Day/Sunset/Night adalah pilihan manual, bukan jam di lokasi pengunjung.
- Tidak memakai Blender atau aset 3D unduhan untuk versi ini.

## Troubleshooting

Jika canvas kosong: cek DevTools → Console untuk `[My Little World] 3D scene failed:`; jangan menyimpan file lama `WorldScene.client.vue` bersamaan dengan `WorldScene.vue`. Jika audio tidak terdengar, pastikan tekan tombol Sound di WORLD, volume browser tidak mute, dan context berhasil dimulai. Jika frame rate buruk, aktifkan **Eco graphics** dan nonaktifkan **Moving world**.

## v0.7 — Visitor Experience

Mulai dari [Panduan Belajar v0.7](./PANDUAN_BELAJAR_v07.md), lalu baca [Changelog v0.7](./CHANGELOG-v0.7.md).

Fitur baru: mini-map dengan tombol lokasi, dialog karakter mengikuti scroll, enam collectible 3D yang bisa dipilih, postcard dengan alternatif HTML untuk mobile/keyboard, dan penyimpanan koleksi lokal.

```bash
npm run test:visitor
npm run test:logic
npm run check:syntax
npm run build
```

Catatan: `npm run check:syntax` hanya parsing script TypeScript/Vue, **bukan** pemeriksaan template Vue, typecheck penuh, atau jaminan build WebGL.
