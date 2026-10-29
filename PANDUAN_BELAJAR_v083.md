# My Little World v0.8.3 — Stop-by-Chapter + First-person Room Explorer

Versi ini melanjutkan proyek v0.8.2, mempertahankan fitur 3D/Lite, avatar chibi, Living World, mini-map, koleksi, Project Gallery, GitHub, dan CV.

## Persiapan dan menjalankan

1. Ekstrak `my-little-world-portfolio-v0.8.3.zip` ke folder **baru**.
2. Pastikan Node.js **22 atau lebih baru** dan npm tersedia.
3. Dari terminal, buka folder yang ada `package.json`.
4. Jalankan `npm install`, `npm run test:logic`, `npm run check:syntax`, lalu `npm run dev`.
5. Buka `http://localhost:3000`. Jika sebelumnya memilih Lite, aktifkan `3D World`.
6. Tes manual pada Chrome desktop, kemudian Chrome DevTools mode HP, dan perangkat HP asli bila tersedia.

## Fitur 1 — Satu gesture, satu section

File: `composables/useJourney.ts`.

Dulu roda mouse/trackpad menggeser halaman bebas sehingga satu gesture besar bisa membawa karakter dari Home ke Contact. Sekarang `onWheel` memanggil `preventDefault()` dan menghitung **satu langkah section**, lalu GSAP menggerakkan scroll dari section sebelumnya ke section berikutnya selama sekitar 2.15 detik. Wheel event tambahan dari gesture yang sama diabaikan sampai gesture berhenti. `ScrollTrigger` tetap membaca nilai scroll yang diperbarui sehingga animator dan kamera lama tidak perlu diganti.

- Wheel turun: maju satu section. Wheel naik: kembali satu section.
- Swipe vertikal di area dunia pada HP: maju/mundur satu section.
- Arrow Up/Down dan PageUp/PageDown di luar interior: satu section per tekanan.
- Klik navbar/mini-map: boleh **langsung** melompat ke section yang dituju secara sengaja.
- Area panel yang dapat discroll tetap mendapat scroll untuk membaca konten.
- Bila mobile sheet sedang terbuka, scrollnya tidak mencuri kendali konten.

Latihan: cari `duration: direct ? ... : 2.15` dan ubah `2.15` menjadi `2.8`. Ini mengubah durasi perjalanan, **bukan jumlah stop**.

## Fitur 2 — Zoom masuk gedung menuju POV

File: `pages/index.vue` (state `enteredRoom`, `entryProgress`), `world/createWorld.ts`, `utils/roomTransitions.ts`.

1. Tombol Enter Building memanggil `enterBuilding()`.
2. GSAP menaikkan `entryProgress` dari 0 sampai 1; selama fase awal karakter berjalan ke pintu.
3. Kamera orthographic mendekati pintu dan melakukan zoom.
4. Pada perpindahan sudut pandang, sebuah veil singkat menutupi pergantian proyeksi.
5. Pada progress 0.985, Three.js mengganti kamera ke `PerspectiveCamera` pada tinggi mata di dalam ruangan.
6. Saat keluar, animasi ini dimainkan mundur dan posisi scroll perjalanan tetap dipertahankan.

Perhatian: ini transisi **kamera dengan mask singkat**, bukan pergerakan seamless melalui geometri interior lengkap. Bangunan masih berupa diorama dengan dinding depan terbuka dan collision sederhana. Ini sengaja dipilih agar kode mudah dipelajari dan ringan.

## Fitur 3 — Berjalan di ruangan

File: `world/roomExplorer.ts` (matematika), `components/RoomExplorerControls.vue` (input), dan `world/createWorld.ts` (render kamera).

| Perangkat | Kontrol |
|---|---|
| Laptop | W/S atau ↑/↓: maju/mundur |
| Laptop | A/D: geser kiri/kanan |
| Laptop | ←/→ atau Q/E: putar pandangan |
| Desktop | Drag mouse pada canvas untuk menoleh |
| HP | Tombol arah di kiri bawah untuk maju/mundur/belok |
| HP | Geser jari pada area scene untuk menoleh |
| Semua | Exit room atau Escape: kembali ke dunia miniatur |

`stepExplorer()` menghitung posisi (x,z) dan sudut pandang (yaw) setiap frame. Menggunakan delta-time, sehingga kecepatan tidak tergantung langsung pada FPS. Posisi dijepit ke batas ruang ±2.73 pada X dan -1.92..2.25 pada Z. **Collision dengan semua furnitur secara detail belum ada**, jadi beberapa benda dapat dilintasi.

Latihan: ubah `2.2 * seconds` menjadi `1.5 * seconds` agar karakter POV berjalan lebih lambat.

## Fitur 4 — Klik objek 3D

File: `data/roomObjects.ts` (data), `world/createInteriors.ts` (mesh klik), `world/createWorld.ts` (Raycaster), `components/RoomObjectDetails.vue` (panel HTML).

Setiap ruangan memiliki penanda objek berwarna keemasan. Ketika diklik, `THREE.Raycaster` memeriksa mesh yang terkena klik lalu mengirim `roomObject` dari `WorldScene.vue` ke `pages/index.vue`. Vue menampilkan panel detail berdasarkan ID objek yang benar. Foto About juga memiliki mesh tersendiri yang bisa diklik.

Contoh:

- About → **My portrait**: foto serta cerita tentang pemilik portofolio.
- About → **Creative workspace**: proses kerja dan teknologi.
- Experience → **Career timeline** / **My resume**.
- Skills → **Technology rack** / **GitHub terminal**.
- Projects → **MeetSpace**, **Timedoor Battle Cards**, **ProfitLens** beserta studi kasus.
- Contact → **Message desk** / **Social links**.

Setiap objek juga tersedia di tombol **Exhibits**, sebagai alternatif jika sulit diklik pada mobile/keyboard. Ini penting untuk aksesibilitas.

Untuk menambah objek baru, tambahkan entri baru ke `data/roomObjects.ts`, buat pengaturan tampilan di `RoomObjectDetails.vue` bila perlu, dan tentukan posisi lokal `position: [x,y,z]`. Marker 3D dibuat otomatis.

## Checklist manual

- [ ] Scroll cepat dari Home hanya berhenti di About (tidak langsung di Projects).
- [ ] Scroll lagi membawa karakter ke Experience; arah scroll sebaliknya kembali ke About.
- [ ] Klik navbar Projects bisa melompat langsung (ini memang fitur intentional navigation).
- [ ] Masuk About: karakter menuju pintu, kamera zoom, lalu berubah ke pandangan mata.
- [ ] Laptop: WASD / arrow dan drag berfungsi; tidak dapat berjalan melewati batas dinding.
- [ ] Klik foto di dinding About dan klik penanda emas; detail muncul dan bisa ditutup.
- [ ] Masuk Projects dan buka detail setiap objek; tautan studi kasus bekerja.
- [ ] HP: swipe di dunia luar pindah **satu section**; d-pad tersedia saat indoor.
- [ ] Mode Lite masih menampilkan konten dan navigasi seperti sebelumnya.
- [ ] Exit indoor mengembalikan posisi perjalanan di chapter yang sama.
- [ ] Tidak ada error baru di DevTools Console.

## Hasil pengujian

Pengujian logika v0.8.2 dan tes baru v0.8.3 dijalankan secara lokal pada source. Pemeriksaan syntax TypeScript/Vue script dilakukan, tetapi **bukan** kompilasi template Vue atau Nuxt build. Instalasi npm pada lingkungan pembuatan ini gagal karena DNS registry (`EAI_AGAIN`), sehingga WebGL dan kontrol sesungguhnya harus diuji pada browser setelah kamu menjalankan `npm install` di perangkatmu.
