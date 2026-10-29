# My Little World v0.8.13 — WhatsApp & Character Greeting

Versi ini meneruskan proyek v0.8.12. Dua perubahan baru:
1. Tombol **Chat via WhatsApp** pada Contact Form (di dalam Contact Café maupun Lite Mode).
2. Karakter 3D menyambut pengunjung setelah memilih **Enter the 3D World**: menoleh ke kamera, melambai, membuat gestur mengajak, lalu kembali ke jalur perjalanan.

## Langkah 1: isi nomor WhatsApp

Buka `data/portfolio.ts`, kemudian isi properti:

```ts
export const owner = {
  // ... data lain tidak perlu dihapus
  whatsapp: '62812XXXXXXXX',
}
```

`62812XXXXXXXX` hanya contoh format, bukan nomor valid. Gunakan nomor WhatsApp milikmu yang benar. Nomor Indonesia `0812...` juga bisa dimasukkan (program mengubah awalan `0` menjadi `62`), tetapi format internasional `62812...` lebih disarankan. Jangan tambahkan `wa.me/` di sini.

**Catatan privasi:** nomor WhatsApp di frontend akan tersedia bagi pengunjung. Jika tidak ingin mengekspos nomor pribadi, gunakan nomor khusus kerja.

## Langkah 2: pahami tombol WhatsApp

- File `utils/whatsapp.ts`: menormalisasi nomor dan membuat tautan `https://wa.me/...`.
- File `components/ContactForm.vue`: tombol dan fungsi `openWhatsApp()` mengisi pesan awal dari form.
- Form yang sama dipakai di Contact Café dan Lite Mode.
- Tidak ada pesan yang dikirim otomatis, pengunjung tetap perlu menekan **Send** di WhatsApp.
- Tanpa konfigurasi nomor, tombol WA dinonaktifkan dan instruksi pengisian ditampilkan.

Kamu bisa mengubah pesan default di fungsi `openWhatsApp()`.

## Langkah 3: pahami animasi menyambut pengunjung

Berikut alurnya:

1. `pages/index.vue`: saat visitor memilih 3D, `greetingSignal.value++` dijalankan.
2. `components/WorldScene.vue`: menerima signal dan menampilkan speech bubble `👋 Yuk, ikut aku!`.
3. `world/createWorld.ts`: membaca signal dalam `renderFrame` dan memutar adegan sekitar **3000 ms**.
4. `world/animateCharacter.ts`: pose `'wave'` atau `'invite'` menggerakkan sendi tangan/head-pivot.

Ketika mode pilihan masih terbuka dan 3D hanya menjadi latar preview, animasi sambutan **belum** diputar. Animasi baru mulai setelah user masuk ke 3D. Klik langsung dari Lite menuju 3D tetap berjalan tanpa mengulang pilihan mode.

## Langkah 4: ubah durasi dan gestur

Buka `world/createWorld.ts`, cari:

```ts
const greetingActive = greetingAllowed && greetingElapsed >= 0 && greetingElapsed < (reducedMotion ? 400 : 3000)
```

Ganti `3000` menjadi `4000` untuk memperpanjangnya. **Penting:** angka pada `const phase = ... greetingElapsed / 3000` juga harus diganti menjadi `4000`, dan batas hilangnya bubble di `components/WorldScene.vue` juga sebaiknya disesuaikan (default `3100`).

Cari kode:

```ts
avatar.rightArm.rotation.z = -1.75 + (reducedMotion ? 0 : .20 * Math.sin(time * .009))
```

- `.20`: besar ayunan.
- `.009`: kecepatan ayunan.
- `-1.75`: posisi tangan terangkat.

Posisi sudut pandang sambutan bisa diubah melalui `welcomingPosition` dan `cameraWeight` pada blok yang sama. Ubah angka sedikit demi sedikit agar kamera tidak menembus bangunan.

## Langkah 5: uji di browser

```bash
npm install
npm run test:invitation
npm run test:logic
npm run check:syntax
npm run dev
```

Pengujian manual:

1. Buka `/`, selesaikan intro, pilih 3D: karakter harus menyapa dan gerak kepala/tangan terlihat.
2. Coba scroll saat sambutan: perjalanan harus langsung berjalan normal.
3. Buka Lite dan pilih Explore 3D: karakter dapat menyapa tanpa membuka dialog mode lagi.
4. Buka Contact Café → klik Message Desk atau pelayan: form harus menampilkan tombol WhatsApp.
5. Buka Lite Contact: tombol yang sama harus tersedia.
6. Isi nomor WA asli di `data/portfolio.ts` dan klik tombol: tautan chat dan pesan awal harus benar; **pesan tidak terkirim otomatis**.
7. Aktifkan `prefers-reduced-motion` di OS: gerakan ekstra dihindari.

## Status pengujian

Tes logika dan pemeriksaan sintaks telah dijalankan. Build Nuxt dan hasil animasi WebGL pada browser sungguhan belum diverifikasi di lingkungan pembuatan. Jalankan `npm run build` dan periksa layar desktop/mobile di komputer sendiri.
