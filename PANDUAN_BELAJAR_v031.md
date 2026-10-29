# Panduan praktik v0.3.1 — Pelajari sambil membangun

Panduan ini untuk memahami **kenapa** kode dibuat seperti sekarang, tidak hanya menyalin.

## 0. Jalankan aplikasinya
1. Ekstrak proyek ke folder BARU (jangan gabungkan dua versi).
2. Buka folder yang mempunyai `package.json` di VS Code.
3. `node -v` — gunakan Node.js 22 atau versi yang didukung oleh Nuxt 3.
4. `npm install` lalu `npm run dev`.
5. Buka `http://localhost:3000`.
6. Scroll dari Home sampai Contact. Di bagian bawah kiri, klik `DIRECTOR MODE` dan lihat angka fase berubah.

Jika layar kosong: buka DevTools > Console. Periksa juga adanya `<canvas>` di `.world-scene`. Jika menggunakan folder versi lama, HAPUS `WorldScene.client.vue`; jangan pasang dua komponen berbeda bernama sama.

## 1. Apa itu scene, mesh, camera, renderer?
- `Scene`: ruangan maya tempat semua objek diletakkan.
- `Mesh`: objek dari `Geometry` (bentuk) dan `Material` (warna/permukaan).
- `Group`: beberapa mesh yang bisa dipindahkan bersama, misalnya kepala atau motor.
- `OrthographicCamera`: kamera yang tidak menggunakan efek penyusutan ukuran berdasarkan jarak seperti perspective camera; cocok untuk diorama miniatur.
- `WebGLRenderer`: melukis scene melalui canvas browser.
- `requestAnimationFrame / setAnimationLoop`: mengulang render saat perlu memperbarui gambar.

Coba di `world/createWorld.ts`, cari `createHouse()`. Rumah dibuat dari box, atap cone, pintu, jendela—semua bentuk primitif.

## 2. Satu scroll menggerakkan semuanya
Alirannya:

```text
Scroll Browser (GSAP)
    ↓
progress = 0 ... 1
    ↓
getCinematicState(progress)
    ├── leg          nomor rute
    ├── phase        walk / approach / mount / ride / dismount / arrive
    ├── distance     0 ... 1 antara lokasi A dan B
    └── shot         establishing / follow / tracking / arrival
    ↓
animateScene() + cameraBlendFor()
    ├── posisi karakter
    ├── posisi kendaraan/putaran roda
    ├── pose tangan, kaki, kepala
    └── framing kamera
    ↓
renderer.render(scene, camera)
```

**Mengapa tidak setTimeout?** Karena scroll dapat bergerak mundur. Kalau animasi dipicu timer, ketika pengguna scroll balik, bus mungkin masih berjalan padahal karakter sudah kembali ke lokasi lama. Fungsi pure memastikan input sama = hasil sama.

## 3. Memahami rute dan fase
Buka `data/portfolio.ts`:

```ts
export const routes = ['walk', 'walk', 'motorbike', 'bus', 'walk']
```

Enam lokasi membutuhkan lima perjalanan. Rute motor terjadi dari **Experience → Skills**; bus dari **Skills → Projects**. `utils/cinematicJourney.ts` membagi setiap perjalanan lagi ke fase:

```text
motor: approach(.00-.12) → mount(.12-.24) → ride(.24-.82)
       → dismount(.82-.94) → arrive(.94-1)
bus:   approach(.00-.14) → mount(.14-.26) → ride(.26-.83)
       → dismount(.83-.95) → arrive(.95-1)
```

`distance` tetap `0` saat naik kendaraan, beranjak menuju `1` saat `ride`, lalu tetap `1` saat turun. Itulah cara menghentikan kendaraan di titik awal dan akhir secara konsisten.

**Latihan:** pada file itu ubah `.24` menjadi `.28` untuk motor (dan sesuaikan batas fase supaya urut). Lihat Director Mode: fase menaiki motor lebih panjang, fase berkendara lebih pendek. Kembalikan angkanya setelah latihan.

## 4. Apa itu character rig?
Pada `world/createWorld.ts`, tubuh dibentuk dari beberapa bagian. **Pivot** adalah pusat rotasi. Bahu adalah pivot untuk lengan; panggul adalah pivot untuk kaki; leher adalah pivot untuk kepala.

Di v0.3.1, head pivot dikelompokkan tersendiri. `world/animateCharacter.ts` memutar kepala sedikit saat berjalan atau melambai:

```ts
character.head.rotation.z = pose === 'walk' ? -0.035 * step : 0
```

**Latihan:** ubah `0.035` menjadi `0.09`, reload dan lihat perbedaan. Angka dalam Three.js adalah **radian**. Kembalikan `0.035` bila terasa berlebihan.

**Warna hoodie:** edit di `data/portfolio.ts`, bukan di semua mesh:

```ts
export const avatarStyle = {
  hoodie: '#4f785f',
  hoodShadow: '#385f4b',
  trim: '#365b48',
  skin: '#d9a384',
  shoes: '#f5efe3',
  trousers: '#54677c',
  hair: '#2c3933',
}
```

**Catatan:** bentuk masih low-poly procedural. Model yang semakin realistis/halus biasanya memerlukan file GLB, rig/skeleton, dan animasi yang cocok. Versi ini belum memakai Blender/Mixamo.

## 5. Memahami kamera sinematik
Buka `world/cameraDirector.ts`. Ada empat preset:
- **establishing**: pemandangan lebar ketika memulai perjalanan.
- **follow**: kamera lebih dekat selama berjalan.
- **tracking**: kamera melebar saat motor/bus bergerak.
- **arrival**: kamera mendekat ketika tiba.

Buka `utils/cameraTimeline.ts`: saat status berpindah, kamera **tidak langsung melompat**. Target sudut lama diinterpolasi ke sudut baru selama awal setiap fase.

```ts
const alpha = smoothstep(clamp01(state.phaseProgress / 0.22))
```

Maksudnya: selama 22% awal fase, kamera bergeser pelan dari preset sebelumnya menuju preset berikutnya. `smoothstep` membuat awal dan akhir transisi lebih lembut.

**Latihan:** ubah `.22` menjadi `.50`. Kamera membutuhkan lebih banyak bagian fase untuk mencapai shot berikutnya. Coba bandingkan di browser, lalu kembalikan.

**Latihan kedua:** di `cameraDirector.ts` ubah `tracking` `zoom: 0.81` menjadi `zoom: 0.7`. Angka zoom lebih kecil pada OrthographicCamera = tampilan lebih jauh / dunia lebih luas.

## 6. Memahami Director Mode (alat belajar baru)
Klik tombol `DIRECTOR MODE` yang berada dekat tombol kamera. Panel menampilkan:
- ROUTE: dari lokasi mana ke lokasi mana.
- VEHICLE: berjalan / motor / bus.
- ANIMATION: fase saat ini.
- CAMERA SHOT: jenis pengambilan kamera.
- PHASE PROGRESS: seberapa jauh fase berjalan.
- DISTANCE: seberapa jauh kendaraan sudah maju antar lokasi.

Panel hanya menampilkan data dari `getCinematicState`; tidak membuat logika perjalanan baru. Lokasi kodenya ada di `pages/index.vue` dan CSS di `assets/css/main.css`.

**Latihan:** saat motor `mount`, perhatikan `DISTANCE` masih 0%. Saat `ride`, angka tersebut mulai naik. Ini membuktikan model berdasarkan fase, bukan gerak acak.

## 7. Mengapa perlu `<ClientOnly>` di Nuxt?
Nuxt dapat merender halaman dari server. WebGL memerlukan DOM browser. `pages/index.vue` memasang `<WorldScene>` hanya pada sisi client. `components/WorldScene.vue` menunggu template ref `host` tersedia lalu memanggil `createWorld()`.

Jangan mengubah sistem mount ini tanpa alasan: pada versi awal project, canvas tidak muncul karena elemen host belum siap.

## 8. Menguji perubahan
```bash
npm run test:logic
npm run build
npm run dev
```

`test:logic` memeriksa posisi/fase tanpa memuat GPU (13 tes: perjalanan dan kamera). Ini BUKAN pengganti uji browser. Uji manual yang wajib:
1. Scroll dari Home sampai Contact.
2. Scroll mundur: pose harus mengikuti posisi scroll, bukan waktu.
3. Motor harus ada sejak awal leg Experience→Skills.
4. Bus harus ada sejak awal leg Skills→Projects.
5. Camera Cinematic vs Calm terlihat berbeda.
6. Panel Director Mode cocok dengan aktivitas karakter.
7. Foto About, GitHub, dan link kontak muncul sesuai config; jangan isi data palsu.
8. Jika WebGL mati, error yang jelas tetap terlihat dan konten HTML tetap ada.

## 9. Debug masalah umum
- **`npm` tidak ditemukan:** pasang Node.js terlebih dahulu.
- **Port 3000 sedang dipakai:** hentikan dev server lain atau gunakan port berbeda (`npm run dev -- --port 3001`).
- **Canvas kosong:** buka Console, cari error pertama dan lihat `.world-scene canvas` di Elements.
- **Pergantian kendaraan terasa aneh:** periksa fase di Director Mode dan `animateScene.ts`.
- **Gerakan kamera terlalu keras:** kecilkan perbedaan nilai offset/zoom preset, atau gunakan tombol Calm.
- **FPS turun:** coba kurangi `renderer.setPixelRatio` dan shadow map, lalu ukur ulang.

## 10. Urutan belajar mandiri (7 sesi)
1. Dasar objek Three.js: Mesh, Group, position/rotation/scale.
2. Menggambar karakter dari bentuk primitif dan memilih pivot.
3. Pahami 0–1 progress serta interpolation `lerp`.
4. Pahami finite-state storyboard dan fase kendaraan.
5. Kamera orthographic, zoom, smoothstep, delta-time smoothing.
6. Vue state + prop + composable + `<ClientOnly>`.
7. Pengujian, debugging Console, build, dan review roadmap ke v0.4.

Jika ketujuh sesi selesai, kamu sudah bisa membuat diorama kecil serupa tanpa menyalin seluruh proyek.
