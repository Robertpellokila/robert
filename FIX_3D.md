# Perbaikan layar 3D kosong — langkah belajar

## Apa yang terjadi?

Pada versi awal, UI portofolio muncul tetapi dunia 3D mungkin tidak terlihat. Kode CSS sebelumnya meletakkan `.scene-layer` pada `z-index: -1`. Lapisan negatif dapat berada di belakang konten/latar halaman. Error WebGL juga bisa tak terlihat ketika lapisannya tersembunyi.

## Apa yang diubah?

1. `assets/css/main.css`: `.scene-layer` dipindah ke `z-index: 0`; `.journey-track` menjadi `z-index: 1`; header, navigasi, dan kartu informasi tetap berada pada z-index yang lebih tinggi. Canvas dibuat selalu mengikuti dimensi layar.
2. `pages/index.vue`: hapus pembungkus `<ClientOnly>` ekstra. Komponen `WorldScene.client.vue` secara konvensi Nuxt memang hanya dijalankan di browser.
3. `components/WorldScene.client.vue`: jika ada exception, tampilkan pesan di halaman serta Console.
4. `world/createWorld.ts`: teruskan kegagalan WebGL render dan peristiwa hilangnya WebGL context ke komponen, serta bersihkan listener saat unmount.

## Cara memakai versi yang diperbaiki

1. Backup folder lama jika sudah dimodifikasi.
2. Ekstrak `my-little-world-portfolio-fixed.zip`.
3. Di terminal, masuk ke folder yang memiliki `package.json`.
4. `npm install` (jika belum ada `node_modules`).
5. `npm run dev`.
6. Buka `http://localhost:3000` dan tekan **Cmd+Shift+R** (Mac) atau **Ctrl+Shift+R** (Windows).

## Jika layar 3D masih kosong

1. Buka Developer Tools **Cmd+Option+I** (Mac), pilih tab **Console**.
2. Cek apakah ada pesan merah `[My Little World] 3D scene failed:`.
3. Di tab **Elements**, cari `.scene-layer`, kemudian `.world-scene`, lalu elemen `<canvas>`. Jika `<canvas>` belum ada, periksa pesan error JavaScript atau import komponen. Jika ada, pastikan ukurannya tidak `0 × 0`.
4. Di Console jalankan kode ini untuk memeriksa DOM dan canvas:

```js
const host = document.querySelector('.world-scene')
const canvas = host?.querySelector('canvas')
console.table({
  hasHost: !!host,
  hasCanvas: !!canvas,
  hostWidth: host?.clientWidth,
  hostHeight: host?.clientHeight,
  canvasWidth: canvas?.width,
  canvasHeight: canvas?.height,
  layerZIndex: getComputedStyle(document.querySelector('.scene-layer')).zIndex,
})
```

5. Jika muncul `WebGL` atau `Failed to create WebGL context`, cek `chrome://gpu`, lalu pastikan browser mendukung WebGL dan akselerasi hardware aktif.
6. Jika tetap bermasalah, kirim pesan error dari **Console** (jangan hanya screenshot tampilan halaman).

## Konsep yang perlu dipahami

**Stacking context:** Elemen HTML disusun berlapis pada sumbu Z layar. Nilai z-index yang kecil akan berada di belakang nilai besar. Ini terpisah dari koordinat Z dunia 3D milik Three.js.

**Canvas:** Elemen HTML `<canvas>` adalah tempat Three.js menggambar objek 3D menggunakan WebGL. Jika Vue tidak memasang canvas, 3D tidak dapat muncul.

**Component lifecycle:** `onMounted()` dijalankan saat komponen sudah dipasang di browser. Barulah `createWorld()` boleh membuat `THREE.WebGLRenderer` yang membutuhkan DOM dan WebGL.

**SSR:** Nuxt merender halaman di server, tetapi server tidak punya jendela browser/WebGL. Nama file `.client.vue` memberitahu Nuxt agar komponen itu hanya berjalan di browser.

**Tidak perlu Blender:** Rumah, jalan, pohon, karakter, bus, dan motor dalam versi 0.1.1 dibangun langsung dari bentuk-bentuk Three.js.

## Catatan verifikasi

Source code diperiksa secara statis. Build penuh Nuxt tidak dijalankan pada lingkungan pembuatan file karena registry npm tidak dapat diakses; jika instalasi pengguna menunjukkan pesan error, gunakan panduan debug di atas untuk menemukan penyebab yang lebih spesifik.
