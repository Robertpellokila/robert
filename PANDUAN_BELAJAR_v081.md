# Panduan Belajar — v0.8.1 Mobile Experience Fix

Tujuan: membuat pengunjung mobile bisa **melihat perjalanan karakter 3D terlebih dahulu**, kemudian membuka konten hanya saat membutuhkan. Karakter juga diberi ciri rambut dan wajah yang mendekati referensi gambar yang kamu kirim, dalam gaya low-poly.

## 1. Menjalankan proyek

Ekstrak ZIP ke folder baru. Di terminal root proyek:

```bash
node -v                   # Node 22 atau lebih baru
npm install
npm run test:logic        # 61 pemeriksaan logika/sumber
npm run check:syntax
npm run dev
```

Buka `http://localhost:3000` pada Chrome. Untuk build produksi:

```bash
npm run build
```

Jika dependensi belum terpasang atau registry npm tidak dapat dijangkau, perintah test sintaks pun mungkin gagal (memakai paket `typescript`). Test logic menggunakan Node bawaan, kecuali beberapa test menggunakan mekanisme parsing standar yang tercakup di skrip.

## 2. Apa yang salah di v0.8?

Sebelumnya pada mobile layout masih terdiri atas: enam tombol navigasi sepanjang dua baris, travel HUD, mini-map, World controls, dialog karakter, panel chapter setinggi ±52dvh, progress bar, dan switch Lite/3D. Canvas **ada**, tetapi tertutupi lapisan-lapisan HTML. Ini masalah tata letak (layout), bukan hilangnya WebGL.

## 3. Memahami bottom sheet

File: `pages/index.vue`.

```ts
const mobileSheetExpanded = ref(false)
watch(activeIndex, () => {
  mobileSheetExpanded.value = false
  mobileNavOpen.value = false
})
```

`ref(false)` berarti konten ringkas ketika dibuka. Saat bagian perjalanan berubah, `watch(activeIndex)` mengembalikan panel ke keadaan ringkas. Tombol `Details` mengubah `mobileSheetExpanded` menjadi `true`.

Template:

```vue
<div class="panel-anchor" :class="{ 'is-expanded': mobileSheetExpanded }">
  <button class="mobile-sheet-toggle" :aria-expanded="mobileSheetExpanded"
      aria-controls="mobile-section-content"
      @click="mobileSheetExpanded = !mobileSheetExpanded">
    ...
  </button>
  <!-- Konten .chapter-card yang sama dengan desktop -->
</div>
```

Kenapa tidak membuat komponen About/Skills baru? Supaya **konten desktop dan mobile selalu sama** dan tidak perlu mengelola dua versi data.

CSS ada di bagian paling bawah `assets/css/main.css` di bawah heading `v0.8.1 MOBILE CINEMATIC LAYOUT`:

```css
@media (max-width: 760px) {
  .portfolio-v081-root .panel-anchor .chapter-card { display: none; }
  .portfolio-v081-root .panel-anchor.is-expanded .chapter-card {
    display: block;
    max-height: min(47dvh, 440px);
    overflow-y: auto;
  }
}
```

`dvh` = tinggi viewport yang memperhitungkan toolbar browser mobile yang dapat berubah. `max-height` + `overflow-y` membuat Project Gallery panjang tetap dapat dibaca, tanpa memenuhi seluruh layar.

## 4. Mengapa menu mobile dibuat dropdown?

Di file yang sama:

```ts
const mobileNavOpen = ref(false)
```

Tombol di header mengubah state. CSS menyembunyikan `.topbar .nav` pada mobile kecuali parent memiliki kelas `.nav-is-open`. Di desktop nav selalu terlihat.

Menu tidak memakai dependensi baru. Saat pindah chapter, menu menutup otomatis.

## 5. Memahami kamera mobile

File: `world/cameraDirector.ts`.

```ts
const isMobile = viewportWidth <= 760
desiredTarget.x += isMobile ? 0 : 2.0
```

Pada desktop, kamera sengaja menggeser objek ke kiri untuk memberi ruang bagi chapter card di kanan. Pada mobile, kartu berada di bawah: offset desktop akan menyebabkan karakter tampak terlalu ke tepi. Karena itu di mobile target kembali ke tengah.

Di `world/createWorld.ts`, lebar aktual elemen canvas diteruskan ke camera director (`host.clientWidth`). Transisi `lerp` / damping tetap digunakan, jadi animasi scroll maju-mundur tidak berubah.

**Eksperimen:** di cameraDirector, coba ubah `isMobile ? 1.12 : 1` menjadi `isMobile ? 1.00 : 1` untuk membuat kamera terlihat lebih jauh. Perhatikan risiko karakter menjadi terlalu kecil.

## 6. Kenapa avatar belum bisa persis seperti gambar?

File: `world/createWorld.ts`, fungsi `createAvatar()`.

Wajah dibuat dari beberapa mesh dasar: bola terpotong/ellipsoid untuk kepala, mata dan telinga, alis dari box, dan beberapa mesh rambut yang disusun kiri/kanan untuk membentuk middle part. Semua digabung ke `head` pivot agar karakter dapat menoleh dan mengangguk seperti v0.3.

Dari gambar referensi yang kamu kirim, beberapa ciri yang bisa diwujudkan ialah rambut hitam tebal belah tengah, alis gelap, mata tenang, wajah lebih ramping, dan proporsi kepala yang terasa lebih manusiawi. Ini **stylized resemblance**, bukan rekonstruksi wajah dari satu gambar.

Di `data/portfolio.ts`, ganti:

```ts
avatarStyle.hair
avatarStyle.hairAccent
avatarStyle.skin
avatarStyle.eyebrows
avatarStyle.hoodie
```

Jika ingin memperbesar realisme pada v0.9, siapkan custom `.glb` dengan skeleton dan shape keys, lalu ganti `createAvatar()` sambil mempertahankan interface `CharacterRig`. Kamu tidak perlu mempelajari Blender secara penuh sekarang.

## 7. Foto di About

Gambar yang kamu kirim disimpan dalam `public/images/avatar-reference.webp`. `owner.photo` otomatis menunjuk ke file tersebut. Ini adalah **gambar 2D** yang berbeda dari model karakter 3D procedural. Jika ingin mengganti dengan foto profil lain, taruh di `public/images/` dan ubah `owner.photo`.

## 8. Coba uji dengan Chrome DevTools

1. Jalankan `npm run dev` dan buka `http://localhost:3000`.
2. Buka DevTools (`Cmd + Option + I` pada Mac).
3. Aktifkan Device Toolbar (`Cmd + Shift + M`).
4. Pilih `Responsive` lalu coba ukuran **425 × 714**, **375 × 667**, dan **320 × 568**.
5. Pastikan 3D terlihat dominan saat panel ditutup. Tap `Details`, baca konten, kemudian `Close`.
6. Coba pilih menu About/Projects; kartu harus menutup lagi saat chapter berubah.
7. Scroll sambil mengamati karakter dan perpindahan kamera; cek apakah karakter terlihat utuh dan tidak masuk ke balik panel yang ringkas.
8. Uji masuk/keluar bangunan Projects, kemudian kembali scroll.
9. Coba 3D → Lite → 3D dan mode Low / Balanced.
10. Uji keyboard: `Tab`, `Enter`, dan `Escape` pada menu dan bottom sheet.

**Catatan:** Screenshot Device Toolbar menguji viewport mobile pada desktop, tetapi tidak sepenuhnya menggantikan pengujian pada HP asli (terutama performa dan touch behavior).

## 9. Jika terasa terlalu sempit

Buka `assets/css/main.css` dan cari:

```css
bottom: calc(96px + env(safe-area-inset-bottom,0px));
```

Ini jarak bottom sheet dari bawah agar progress + switch tidak tertutup. **Jangan membuat panel menempel di bawah tanpa menggeser kontrol lainnya.** Atur jarak secara bersamaan pada `.bottom-bar` dan `.experience-switch`.

## 10. Tes yang tersedia

- `npm run test:logic`: seluruh test lama + test mobile.
- `npm run test:mobile`: 12 pemeriksaan struktur source baru.
- `npm run check:syntax`: pemeriksaan parsing script TS/Vue.
- `npm run build`: uji integrasi Nuxt yang harus kamu jalankan di komputermu.

## 11. Tugas belajar sendiri

- Ubah batas mobile dari `760px` ke `820px` dan uji tablet.
- Ubah judul bottom sheet menjadi dua baris dan lihat bagaimana tinggi panel berubah.
- Coba membuat mode Portrait atau Wide pada mobile camera.
- Tambahkan satu atribut aksesori pada avatar (misalnya backpack) tanpa mengubah rig pose.
