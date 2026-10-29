# My Little World v0.8.1 — Mobile Cinematic & Personal Avatar

## Dari v0.8.0

### 1. Mobile-first cinematic screen
- Header mobile 1 baris, berisi logo + tombol section, bukan 6 menu sekaligus.
- Menu section dibuka hanya ketika dibutuhkan, ditampilkan 3 kolom.
- Kartu konten menjadi **bottom sheet**: saat tertutup hanya judul dan tombol Details (±93 px); tap untuk membaca keseluruhan konten.
- Saat section berubah, kartu menutup lagi otomatis sehingga pengunjung dapat melihat animasi.
- Progress bar, World Settings, dan mini-map disusun ulang ke ruang yang lebih kecil. Dialog teks yang menutupi pemandangan disembunyikan khusus mobile.
- Interior memakai overlay tersendiri; tombol world dan panel luar disembunyikan ketika berada di dalam gedung.

### 2. Portrait camera framing
- Kamera tetap orthographic/isometric, tetapi menghilangkan pergeseran dua unit yang hanya dibutuhkan layout desktop.
- Fokus kamera sedikit diturunkan dan offset disesuaikan agar karakter berada di area yang tidak tertutup bottom sheet.
- Shot sinematik desktop tidak diubah.

### 3. Karakter dengan wajah stylized
- Rambut hitam belah tengah (curtain hairstyle), alis lebih tegas, mata berlapis, hidung kecil, bibir halus, serta proporsi kepala lebih terarah.
- Tetap procedural low-poly untuk kompatibilitas animasi lama; **bukan** scan 3D dan **belum** identik 1:1 dengan wajah dalam foto.
- Gambar yang dikirim pengguna tersedia sebagai `/images/avatar-reference.webp` dan digunakan sebagai foto/portrait About.
- Warna wajah/hair/hoodie bisa diubah lewat `data/portfolio.ts`.

### 4. Quality and tests
- `npm run test:mobile`: 12 pemeriksaan integrasi source baru.
- `npm run test:logic`: 49 tes lama + 12 tes baru = 61.
- `npm run check:syntax`: parse TypeScript / script Vue (belum menggantikan Vue template compile).

## Batasan
- Seluruh layout dan rendering akhir **belum lolos uji browser Nuxt nyata** di lingkungan pembuatan karena npm registry `EAI_AGAIN`.
- Jangan menganggap portrait reference sebagai model 3D: kemiripan wajah dibangun dengan bentuk dasar. Untuk kesamaan wajah yang lebih tinggi perlu GLB custom yang sudah di-rig.
- Bottom sheet belum mendukung drag fisik menggunakan gesture; interaksinya melalui tombol *Details / Close* agar aksesibilitas dan scroll perjalanan terjaga.
