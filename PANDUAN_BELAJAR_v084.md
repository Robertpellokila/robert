# Panduan Belajar My Little World v0.8.4

Versi ini adalah kelanjutan langsung **v0.8.3**, bukan proyek baru.

## A. Jalankan proyek

1. Ekstrak ZIP ke folder baru dan buka folder berisi `package.json`.
2. Gunakan Node.js 22 atau lebih baru.
3. Jalankan:

   ```bash
   npm install
   npm run test:logic
   npm run check:syntax
   npm run dev
   ```

4. Buka `http://localhost:3000`, pilih **3D World**, lalu masuk ke About atau Experience.
5. Setelah tes visual lokal, jalankan `npm run build` untuk pemeriksaan produksi.

## B. Mengapa arah gerak sebelumnya terbalik?

Three.js menganggap kamera menghadap sumbu **-Z** sebelum diputar. Di versi sebelumnya, kamera diputar mengikuti `yaw`, tetapi rumus geraknya memakai tanda `sin(yaw)` yang berbeda arah. Akibatnya setelah menoleh, menekan W/D bisa menggerakkan kamera ke arah yang tidak sesuai dengan sudut pandang.

Buka `world/roomExplorer.ts`:

```ts
export function explorerBasis(yaw: number) {
  return {
    forwardX: -Math.sin(yaw),
    forwardZ: -Math.cos(yaw),
    rightX: Math.cos(yaw),
    rightZ: -Math.sin(yaw),
  }
}
```

Seluruh gerakan memakai dasar koordinat yang **sama** dengan kamera:

```ts
const dx = (basis.forwardX * forward + basis.rightX * strafe) * distance
const dz = (basis.forwardZ * forward + basis.rightZ * strafe) * distance
```

Kemudian di `world/createWorld.ts` arah drag mouse diubah menjadi:

```ts
indoorPose.yaw -= dx * .004
```

Coba tes: masuk ruangan, tekan W (maju), S (mundur), A (kiri), D (kanan). Putar kamera dengan → dua atau tiga detik, lalu ulangi tes. **Arah gerak harus tetap relatif terhadap kamera**, bukan relatif terhadap bangunan.

## C. Bagaimana CV bisa terlihat di dalam ruangan?

- `world/createInteriors.ts`: menggambar objek **poster resume** 3D menggunakan canvas texture. Poster ini juga menjadi target Raycaster.
- `data/roomObjects.ts`: menyimpan ID `resume`, posisi dan ringkasan.
- `components/RoomObjectDetails.vue`: menentukan konten yang dibuka ketika poster diklik.
- `components/ResumeInlinePreview.vue`: menyusun CV yang dapat dibaca menggunakan **data asli dari `data/portfolio.ts`**.
- `pages/resume.vue`: halaman lengkap untuk membuka/print/save as PDF.

Alurnya: klik poster CV → `roomObjectId='resume'` → dialog muncul → jika `owner.cvUrl` mengarah ke PDF lokal, render PDF; jika kosong, render dokumen HTML bawaan.

### Menggunakan PDF CV asli

1. Salin PDF milikmu ke `public/cv.pdf`.
2. Di `data/portfolio.ts`, ubah:

```ts
cvUrl: '/cv.pdf',
```

3. Lakukan refresh lalu klik poster CV. Gunakan tombol **Open original PDF** jika browser menolak embed PDF.

Jika belum ada PDF, **jangan buat URL palsu**: biarkan `cvUrl: ''` dan isi data pengalaman yang benar. Periode yang masih bertuliskan `Isi periode` ditampilkan sebagai draf, bukan dianggap pengalaman yang sudah terverifikasi.

## D. Gambar dan penjelasan proyek

`components/RoomObjectDetails.vue` menggunakan gambar `project.cover`, dilanjutkan dengan ringkasan, tantangan, highlight, teknologi, dan tombol ke halaman studi kasus. Gambar konsep tetap berlabel konsep, supaya tidak disalahartikan sebagai screenshot aplikasi sebenarnya.

Untuk mengganti dengan screenshot asli:

1. Taruh gambar di `public/images/projects/meetspace-actual.png`.
2. Pada `data/projects.ts`, ubah `cover` menjadi `/images/projects/meetspace-actual.png`.
3. Ubah `coverLabel` menjadi penjelasan sebenarnya, misalnya `Screenshot dari halaman meeting MeetSpace`.
4. Jika situs demo sudah tersedia, isi `demoUrl` dan aktifkan preview hanya bila situs mendukung embedding.

## E. Pengujian manual (penting)

| Uji | Hasil yang diharapkan |
|---|---|
| W pada berbagai arah kamera | Selalu bergerak ke depan layar |
| S pada berbagai arah kamera | Selalu bergerak mundur |
| A / D | Strafe kiri / kanan relatif terhadap kamera |
| Panah kiri / kanan | Kamera benar-benar menoleh kiri / kanan |
| Drag mouse ke kanan | Kamera melihat ke kanan |
| Klik CV di Experience | Poster terbuka menjadi dokumen yang bisa dibaca |
| `cvUrl` kosong | HTML CV ditampilkan; tidak muncul error iframe |
| `cvUrl='/cv.pdf'` dengan PDF tersedia | PDF dimuat di panel; open file tersedia |
| Klik foto About | Foto dan ringkasan About terlihat |
| Klik poster Projects | Gambar, ringkasan dan tautan studi kasus tersedia |
| Ukuran HP 375×667 | Panel bisa digulir dan ditutup dengan tombol |
| Tekan Escape | Dialog objek tertutup |
| Exit Room | Kembali ke dunia luar |

## F. Latihan mandiri

1. Di `world/roomExplorer.ts`, ganti kecepatan `2.2` menjadi `1.5`, lalu rasakan perbedaannya.
2. Di `world/createInteriors.ts`, ganti warna latar CV dan judul poster.
3. Di `components/ResumeInlinePreview.vue`, tambahkan section *Selected Projects* yang bersumber dari `data/projects.ts`.
4. Di `data/portfolio.ts`, lengkapi pengalaman dan kontak dengan informasi yang sudah diverifikasi.

## Catatan

Unit tests dan parsing script tidak menggantikan build Nuxt atau pengujian visual WebGL. Selalu jalankan `npm run build` dan cek di Chrome/Safari serta layar HP sebenarnya.
