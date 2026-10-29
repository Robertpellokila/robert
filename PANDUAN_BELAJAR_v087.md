# Panduan Belajar — My Little World v0.8.7

Versi: **Interior Polish + Animated Welcome + Premium Lite Mode**. Lanjutan langsung dari v0.8.6, **bukan** project yang dibangun ulang dari awal.

## A. Memulai proyek

Gunakan Node.js 22 atau lebih baru. Buka folder yang berisi `package.json`, lalu:

```bash
npm install
npm run check:syntax
npm run test:logic
npm run dev
```

Buka `http://localhost:3000`. Saat masuk, pilih **Explore Lite Portfolio** atau **Enter the 3D World**.

> Saat berada di lingkungan pengerjaan, paket Nuxt belum tersedia. Pemeriksaan script dan tes logika berhasil dijalankan, tetapi `npm run build` belum lolos pengujian karena perintah Nuxt tidak ditemukan. Uji di komputer lokal sebelum deploy.

## B. Peta perubahan file

| File | Fokus belajar |
| --- | --- |
| `pages/index.vue` | Membuka splash saat awal akses, mengelola pilihan Lite / 3D, menjaga konten di belakang dialog tidak bisa difokuskan |
| `components/LitePortfolio.vue` | Layout portofolio editorial, filter proyek, grup skill, pengalaman, responsive menu |
| `assets/css/lite-premium.css` | Semua styling Lite; pisahkan dari CSS scene 3D supaya gampang diubah |
| `assets/css/welcome-premium.css` | Animasi splash dengan CSS, breakpoint mobile, `prefers-reduced-motion` |
| `world/roomDecor.ts` | Meja, keyboard, monitor coding, figur duduk, rak, gallery, counter café |
| `world/createInteriors.ts` | Menampilkan bubble label dan menghubungkan mesh ke ID informasi |
| `world/createWorld.ts` | Menjaga bubble tetap menghadap kamera saat first-person explore |
| `data/portfolio.ts` dan `data/projects.ts` | Sumber konten yang dipakai bersama oleh Lite dan 3D |

## C. Menata enam interior

Semua posisi furniture dalam **koordinat lokal ruangan**. Dinding belakang berada pada Z negatif, pintu dan posisi awal kamera pada Z positif. Ruangan tetap memakai dimensi kira-kira 6.6 × 5.6. Rekomendasi: sisakan jalur X mendekati 0, dari pintu (Z positif) ke area interaktif. Hindari furniture besar di jalur ini karena collision benda belum lengkap.

1. Home (`function home`): ruang cozy dengan rak, tanaman, meja, monitor, karpet, dekorasi kecil. Ubah nilai X/Z tiap helper untuk memindahkan furniture.
2. About (`function about`): foto sebenarnya dibuat di `createInteriors.ts` agar tetap bisa diklik. Jangan tambahkan frame dekoratif yang menutupi gambar. Figur menghadap ke -Z dan keyboard berada di depan tangannya.
3. Experience (`function experience`): figur duduk menghadap komputer. Board karier dapat diklik langsung, CV ada pada poster terpisah.
4. Skills (`function skills`): ruang server + dashboard berlapis, dua workstation, indikator lampu hijau.
5. Projects (`function projects`): galeri display dengan tiga pedestal, poster proyek interaktif pada `createInteriors.ts`.
6. Contact (`function contact`): coffee bar, pastry, cup, tanaman gantung, meja duduk. Counter sekarang bisa dipilih langsung.

### Coba: ganti posisi tanaman

Di `roomDecor.ts`, misalnya:

```ts
plant(p, 2.56, 1.22, .53)
```

`2.56` = X kanan, `1.22` = Z ke arah pintu, `.53` = skala. Simpan dan hot reload di browser.

### Coba: ubah bentuk dan isi monitor

Helper `monitor` memanggil `screenArt` yang membuat `CanvasTexture` berisi garis coding atau dashboard:

```ts
monitor(p, .68, -1.22, '#C0D8CD', 'code', 'laptop')
```

Argumen terakhir `laptop` adalah ID exhibit dalam `data/roomObjects.ts`. Pastikan ID cocok supaya klik pada monitor bisa membuka detail. Pilihan `variant` saat ini: `code` dan `dashboard`.

### Coba: membetulkan pose duduk

`seatedWorker` pada `roomDecor.ts` menempatkan torso, kepala, tangan dan kaki dengan pose duduk. Rotasi `0` berarti menghadap **-Z**, ke dinding belakang dan komputer. **Jangan ubah rotasi menjadi `Math.PI`** kecuali komputernya pindah menghadap sisi sebaliknya.

## D. Bubble chat yang selalu terbaca

Di `createInteriors.ts`, `clickBubble` membuat gambar teks pada CanvasTexture. Setiap bubble:
- Menampilkan "Click me" dan nama exhibit.
- Memiliki area klik lebih besar daripada tulisannya.
- Tidak menggunakan bola penanda yang terlihat.
- Selalu menghadap kamera first-person, diperbarui di `createWorld.ts`.

Untuk mengubah teks, cari:

```ts
ctx.fillText('Click me',190,94)
```

Saat mengubah ukuran elemen bubble, periksa juga `PlaneGeometry(width,height)`. Poster CV, karya, dan foto masih bisa diklik langsung sehingga tidak memerlukan marker besar.

## E. Splash screen awal

`showWelcomeSplash` dimulai dari `true` di `pages/index.vue`. Dialog muncul sebelum mode 3D diinisialisasi. Ketika pengguna menekan tombol, `beginExperience(mode)` memilih Lite / 3D dan menutup splash. Pada perangkat tanpa WebGL2, tombol 3D dibuat tidak aktif.

Untuk mengganti judul, cari `id="splash-title"` pada `pages/index.vue`. Animasi pulau miniatur ada di `welcome-premium.css` dalam kelas `.v087-world-island`, `.v087-world-house`, dan keyframes `v087-float`.

**Prinsip performa:** splash tidak memuat file 3D tambahan; miniatur sambutan dibuat dari CSS. Pengaturan reduced-motion menonaktifkan animasi. 

## F. Premium Lite Mode

Lite bukan fallback kosong. Struktur kontennya:

1. Hero: personal branding, foto profil, CTA, jumlah proyek/skills (dihitung dari data asli).
2. About: profil dan prinsip kerja.
3. Experience: timeline dan link CV.
4. Skills: kategori dari `skills` dan repository GitHub publik bila dikonfigurasi.
5. Projects: galeri case study dengan filter status `Prototype`, `In progress`, `Concept`, dsb; hanya status yang ada di data yang ditampilkan.
6. Contact: CTA dan tautan yang kamu isi sendiri.

`data/portfolio.ts` berisi `owner`, `experiences`, `skills`. Sementara `data/projects.ts` berisi studi kasus. Tidak perlu mengedit `LitePortfolio.vue` setiap menambah proyek.

### Mengubah warna dan tipografi

Di `lite-premium.css`, ubah token CSS `.lite-pro` seperti `--lp-green`, `--lp-ink`, atau `--lp-cream`. Untuk ukuran hero ubah `.lite-pro-hero h1`, untuk kartu proyek `.lite-pro-work-card`.

## G. Checklist browser yang wajib kamu coba

- [ ] Pada awal akses muncul splash, dan tombol Lite / 3D bekerja.
- [ ] Splash di mobile lebar 375px tidak overflow.
- [ ] Lite: menu mobile buka/tutup, klik anchor menuju keenam section.
- [ ] Lite: project filter menampilkan proyek yang sesuai.
- [ ] Lite: halaman `/projects/meetspace` dan `/resume` terbuka.
- [ ] About: foto tidak ketutupan furniture, monitor berisi coding, figur duduk menghadap meja.
- [ ] Experience: figur tidak terbalik, CV dan career board dapat diklik.
- [ ] Skills: monitor / terminal dapat diklik dan server racks terlihat jelas.
- [ ] Projects: tiga pedestal tidak menutupi jalan, poster membuka case study.
- [ ] Contact: counter / bubble membuka informasi, dekorasi kafe tetap dapat dijelajahi.
- [ ] Bubble terbaca saat kamera diputar 90° dan tidak menghalangi akses ke objek.
- [ ] Mode 3D dapat kembali ke Lite tanpa reload dan tanpa error console.
- [ ] `npm run build` berhasil di laptop setelah `npm install`.

## H. Batasan yang masih ada

- Semua furniture menggunakan primitive procedural Three.js, bukan aset 3D hasil rekonstruksi persis dari enam gambar. Untuk fidelity lebih tinggi, gunakan GLB tekstur/material yang konsisten.
- Belum ada collision otomatis untuk setiap meja, kursi, dan pajangan.
- Pose duduk masih statis, belum skeletal typing animation.
- Tidak ada pengujian browser penuh yang berhasil dilakukan di lingkungan pembuat paket; verifikasi hasil WebGL pada laptop dan HP tetap diperlukan.
