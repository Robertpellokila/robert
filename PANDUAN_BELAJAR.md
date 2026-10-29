# UPDATE v0.6: Mulai dari [PANDUAN_BELAJAR_v06.md](./PANDUAN_BELAJAR_v06.md) untuk fitur terbaru.

# PANDUAN BELAJAR — v0.4 (Enterable Buildings & Project Gallery)

## 0. Target yang kita pelajari

Kamu bisa menjelaskan kenapa karakter bisa berjalan menuju pintu, kenapa kamera berpindah tanpa mengganti halaman, kenapa konten proyek merupakan HTML dan bukan texture 3D, dan kapan iframe bisa/tidak bisa menampilkan website.

## 1. Jalankan proyek

Buka terminal di folder yang memiliki `package.json`.

```bash
npm install
npm run test:logic
npm run dev
```

Buka `http://localhost:3000`. Scroll atau klik About/Projects. Klik tombol **Enter ...** di panel. Klik **Exit building** (atau tekan `Escape`) untuk keluar.

**Saran:** ekstrak v0.4 ke folder baru, jangan campur dengan source v0.3.1. Kamu dapat membandingkan kedua versi di VS Code.

## 2. Dari scroll menjadi perjalanan

File: `composables/useJourney.ts`.

```ts
const progress = ref(0)
```

GSAP ScrollTrigger memperbarui `progress` antara 0 dan 1 berdasarkan panjang halaman. Sistem v0.3 menghitung satu dari lima rute di `utils/cinematicJourney.ts` dan menggerakkan karakter di `world/animateScene.ts`.

## 3. Dari tombol menjadi Entrance State

File: `pages/index.vue`.

```ts
const enteredRoom = ref<ChapterId | null>(null)
const entryProgress = ref(0)
```

- `enteredRoom`: gedung yang sedang dimasuki (`about`, `projects`, dll).
- `entryProgress`: angka 0–1 yang naik saat masuk dan turun saat keluar.
- **Jangan gunakan scroll untuk animasi interior:** jika pengunjung membuka panel dan ingin scroll isi proyek, dunia 3D tidak boleh bergerak tanpa disengaja.

Klik menu atas akan membuat halaman bergerak ke lokasi, lalu membuka interior ketika sudah tiba. Klik `Enter building` langsung menjalankan animasi pada lokasi saat ini.

Saat masuk, GSAP melakukan tween dari 0 ke 1; `WorldScene` menerima dua props baru itu dan meneruskannya ke `createWorld()`.

## 4. Dari box menjadi gedung miniatur

File: `world/createInteriors.ts`.

```ts
block(group, 6.6, .24, 5.6, '#e5d6bd', 0, -.1, 0)
```

Itu adalah lantai rumah. Angkanya: lebar, tinggi, panjang, warna, koordinat x, y, z. Mesh lainnya membentuk tiga dinding (bagian depan tidak ada agar interior terlihat), meja, monitor, rak, server, dan dekorasi sesuai section.

Satu interior adalah `THREE.Group`, sehingga kita bisa menyembunyikan atau memperlihatkan seluruh ruangan dengan satu perubahan properti `visible`.

## 5. Memahami door pivot

Pintu harus berputar pada engsel, bukan berputar pada pusat pintu. Di `createInteriors.ts` ada `const hinge = new THREE.Group()` dan mesh daun pintu ditempatkan relatif terhadapnya.

```ts
interiors.doorPivots[id].rotation.y = -1.53 * smoothstep((entry - .14) / .29)
```

Pada awal masuk pintu tertutup, lalu berputar hampir 90°. Saat keluar, fungsi yang sama bekerja mundur karena GSAP menurunkan `entryProgress`.

## 6. Memahami interior camera

File: `world/createWorld.ts`. Pada `renderFrame`, animasi perjalanan biasa dievaluasi lebih dahulu; setelah itu kamera mendekat ke gedung menggunakan `camera.position.lerp(...)`. Kita tidak membuat kamera WebGL baru. Selama entrance progress naik, kamera beralih menjadi framing diorama tanpa menghapus renderer yang sudah ada.

**Perlu diketahui:** pada progress ~0.55, model bangunan luar disembunyikan dan interior diaktifkan. Ini *cutaway swap* v0.4, bukan simulasi pintu dan ruangan yang memiliki collision fisik. Sistem ini ringan untuk browser.

## 7. Konten tetap HTML

File: `components/BuildingInterior.vue`. Setiap section memakai `v-if` sehingga konten HTML yang muncul berbeda berdasarkan `chapter`. Keuntungannya teks bisa di-copy, tautan dapat diakses, iframe bisa berfungsi, dan konten mudah dikelola tanpa Blender.

Bagian Projects punya pemilih proyek dan tiga aksi:

- Read case study → route `/projects/[slug]`
- Preview website → iframe (hanya jika diaktifkan dan URL diizinkan)
- Open live site → tab browser baru

## 8. Menambahkan demo website proyek

File: `data/portfolio.ts`. Contoh bila `https://contoh-domainmu.com` benar-benar milikmu dan mengizinkan embed:

```ts
{
  slug: 'meetspace',
  name: 'MeetSpace',
  // ... properti lain ...
  demoUrl: 'https://contoh-domainmu.com',
  repositoryUrl: 'https://github.com/akun/repository',
  allowEmbed: true,
}
```

Alamat pada contoh **bukan deployment riil**. Jangan menganggap demo berhasil sebelum dicoba. Jika situs memblokir iframe (X-Frame-Options/CSP), gunakan Open live site atau tampilkan screenshot.

## 9. Latihan mandiri

1. **Ubah ruangan About:** buka `world/createInteriors.ts`; tambah `block()` untuk meja atau rak baru.
2. **Ubah warna lantai:** ganti `'#e5d6bd'` lalu refresh browser.
3. **Ubah pintu:** di `world/createWorld.ts` ganti `-1.53` ke `-1.1` dan lihat perbedaan sudut buka.
4. **Ubah durasi masuk:** di `pages/index.vue` ganti `duration: 2.15` menjadi `duration: 3.0`.
5. **Buat case study nyata:** di `pages/projects/[slug].vue` isi masalah, proses, hasil, dan pelajaran dari proyek yang kamu selesaikan. Saat ini halaman baru berupa kerangka.
6. **Tambahkan demo asli:** isi URL dan coba `allowEmbed: true` hanya untuk deployment yang memang mengizinkan embed.

## 10. Urutan debug jika ada masalah

- **3D hilang:** periksa console untuk error WebGL; pastikan `components/WorldScene.vue` masih dipakai via `<ClientOnly>`.
- **Tombol masuk tidak bereaksi:** periksa console; pastikan package `gsap` berhasil ter-install.
- **Pintu bergerak tetapi karakter tidak:** periksa nilai `entryProgress` dari 0 ke 1 dan callback `getInteriorState` di `WorldScene.vue`.
- **Preview kosong:** periksa tab Console/Network untuk X-Frame-Options atau frame-ancestors; buka live site di tab baru.
- **Halaman detail 404:** slug URL harus cocok dengan `projects[].slug`.
- **Scroll terasa berhenti setelah keluar:** periksa apakah body `overflow` dipulihkan di `leaveBuilding()`.

## 11. Batas pengujian

File ini disertai hasil static syntax parse dan logic tests. Karena npm install timeout dalam lingkungan pembuatan, build Nuxt dan render WebGL browser **belum** terverifikasi. Jalankan `npm run build` pada komputermu sebelum memindahkan proyek ke hosting.
