# FIX v0.1.2 — Scene 3D tidak muncul (container was not mounted)

## Gejala

UI muncul, tetapi sebelah kiri kosong. Pesan:

`The 3D canvas container was not mounted.`

Pesan ini berasal dari `WorldScene.client.vue` versi 0.1.1. Pengecekan `host.value` dijalankan ketika referensi DOM belum terpasang akibat alur render client-only. Pengecekan langsung mengembalikan `return`, sehingga `createWorld()` tidak dieksekusi.

## Perbaikan

1. HAPUS `components/WorldScene.client.vue` (file lama).
2. Buat `components/WorldScene.vue` (tanpa suffix `.client`) yang memakai `watch(host, ..., { flush: 'post' })` untuk memulai Three.js saat `host` tersedia.
3. Pada `pages/index.vue`, bungkus `<WorldScene :progress="progress" />` dengan `<ClientOnly>` dan berikan slot `#fallback`.
4. WorldScene memakai `import('~/world/createWorld')` sehingga Three.js diimpor di browser setelah DOM tersedia.
5. Saat komponen dihancurkan, hentikan render loop dan bersihkan canvas dengan `cleanupWorld()`.

## Kalau memakai ZIP lengkap

Ekstrak ke **folder baru**, buka Terminal di folder yang berisi `package.json`:

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` lalu lakukan hard refresh `Cmd+Shift+R`.

**Jangan menggabungkan kedua file** `WorldScene.vue` dan `WorldScene.client.vue` dalam folder components: hapus yang lama dulu agar auto-import Nuxt tidak ambigu.

## Jika memperbarui folder lama

Salin file yang berubah dari ZIP v0.1.2 lalu hapus komponen lama. Stop server (Ctrl+C), bersihkan hasil generate Nuxt kemudian jalankan kembali:

```bash
rm -rf .nuxt
npm run dev
```

> Perintah `rm -rf .nuxt` hanya menghapus cache build Nuxt, bukan source code. Jalankan dari root project.

## Mengerti alurnya

1. `pages/index.vue` meminta Nuxt menampilkan `WorldScene` hanya di browser.
2. Vue membuat `<div class="world-scene">` dan mengisi `host`.
3. `watch(host, ...)` terpicu ketika `host` bukan lagi `null`.
4. `createWorld(host, ...)` membangun scene Three.js dan menambahkan `<canvas>` ke `host`.
5. GSAP mengubah `progress` dari 0 ke 1 ketika scroll.
6. Render loop membaca `props.progress` dan menggerakkan karakter ke posisi pada kurva jalan.
7. Saat halaman ditutup, renderer, observer, event listener, dan GPU resources dibersihkan.

## Cara mengecek sukses

Di Chrome DevTools > Console harus muncul:

`[My Little World] 3D canvas initialized`

Lalu jalankan:

```js
const host = document.querySelector('.world-scene')
const canvas = host?.querySelector('canvas')
console.table({
  hasHost: !!host,
  hasCanvas: !!canvas,
  canvasWidth: canvas?.width,
  canvasHeight: canvas?.height,
  hostWidth: host?.clientWidth,
  hostHeight: host?.clientHeight,
})
```

`hasCanvas` harus `true`, dan width/height lebih besar dari 0.

Jika masih gagal, **kirim pesan Console yang paling atas** setelah reload, bukan hanya screenshot halaman. Bisa jadi ada kesalahan lain (WebGL, import, atau runtime JavaScript).

## Referensi

- Vue Template Refs: https://vuejs.org/guide/essentials/template-refs
- Vue Watchers (`flush: 'post'`): https://vuejs.org/guide/essentials/watchers
- Nuxt ClientOnly: https://nuxt.com/docs/3.x/api/components/client-only
