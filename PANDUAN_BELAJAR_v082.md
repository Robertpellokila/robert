# Panduan Belajar — v0.8.2 (Chibi Avatar + Clean Mobile)

Panduan ini menggunakan **proyek v0.8.2** sebagai contoh. Seluruh source code disediakan dalam ZIP; kamu tidak harus memahami semuanya sekaligus.

## 1. Jalankan proyek

1. Ekstrak ZIP ke folder baru, bukan menimpa `v0.8.1` yang sudah kamu modifikasi.
2. Buka folder yang berisi `package.json` di VS Code.
3. Pastikan Node.js versi 22 atau lebih baru, lalu ketik:

```bash
npm install
npm run test:logic
npm run check:syntax
npm run dev
```

4. Buka `http://localhost:3000`.
5. Untuk build produksi, jalankan `npm run build` di komputermu.

**Catatan kejujuran pengujian:** 73 pengujian source/logika dan parsing script sudah lulus di lingkungan pembuatan. `npm install` gagal akibat DNS `EAI_AGAIN`; kompilasi template Vue, build Nuxt, kualitas visual, dan gesture sentuh nyata belum dapat diuji penuh di sini. Lakukan uji browser lokal sebelum produksi.

## 2. Bagaimana karakter 3D dibuat?

Buka `world/createChibiAvatar.ts`.

Objek yang digunakan adalah **mesh**, yaitu geometri (SphereGeometry/BoxGeometry/TubeGeometry) + material (warna, shading, tekstur). Semua bentuk dikumpulkan dalam `root` (Group) karakter. `root` tetap memakai skala sebelumnya agar karakter dapat ditempatkan pada rute, kendaraan, dan pintu tanpa menulis ulang koordinat perjalanan.

```
world/createWorld.ts
  └── createChibiAvatar()
        ├── root (posisi seluruh karakter)
        ├── head (pivot menoleh / mengangguk)
        │     ├── face + ears + chin
        │     ├── hair cap + left/right curtains
        │     └── eyes + brows + nose + mouth
        ├── leftArm / rightArm (pivot ayunan)
        └── leftLeg / rightLeg (pivot langkah)
```

`world/animateCharacter.ts` masih melakukan rotasi pivot seperti versi sebelumnya. Inilah keuntungan **memisahkan model (bentuk fisik) dari animasi (cara bergerak)**.

### Coba ubah proporsi kepala

Pada `data/portfolio.ts`:

```ts
export const avatarStyle = {
  headScale: 1.35,
  hairSweep: 0.20,
  eyebrowTilt: 0.07,
  // ...warna lain
}
```

- `headScale`: coba `1.15`, `1.35`, lalu `1.45`. Angka terlalu besar bisa menabrak hoodie atau tampak tidak proporsional di motor.
- `hairSweep`: coba `0.10` lalu `0.28` untuk sudut belahan rambut.
- `eyebrowTilt`: coba `0.00` sampai `0.12` untuk ekspresi alis.
- Warna `hoodie` dan `hair` tetap menggunakan HEX seperti di v0.8.1.

**Kenapa lebih mirip foto?** Foto referensi memperlihatkan rambut hitam berbelah tengah dan fitur wajah yang relatif halus. Avatar mengadopsi ciri tersebut, bukan membentuk wajah fotorealistik 1:1. Untuk replika wajah sangat akurat, nanti perlu pembuatan karakter khusus dengan sculpting/rigging atau face capture.

## 3. Mengapa mobile sebelumnya bertabrakan?

Pada v0.8.1 ada tiga sumber kontrol terpisah di atas scene: `topbar` (menu), `VisitorExperience` (Mini Map), dan `WorldControls` (World), ditambah Graphics di `ExperienceSwitch`. Saat popup dibuka pada layar 425×714, semua berada di area atas layar.

Di v0.8.2 kita mengubah pendekatan:

```
Mobile, tampilan utama:
  [Robert.]                        [Projects ☰]

                  WORLD 3D
             (karakter + bangunan)

  [Section summary                Details]
  [progress                               ]
                  [3D World | Lite]

Saat tekan menu:
  [Explore & Settings               X]
  [Map & Sections] [World Settings]
  [6 lokasi] / [Time, Motion, Sound, Graphics]
```

`VisitorExperience` dan `WorldControls` **tetap dipakai desktop**, tetapi disembunyikan pada mobile melalui aturan `@media(max-width:760px)` di akhir `assets/css/main.css`. Semua fungsi yang sebelumnya ada telah dihubungkan ulang melalui drawer `components/MobileToolsDrawer.vue`.

## 4. Event dari UI menuju dunia Three.js

`MobileToolsDrawer.vue` **tidak** membuat lampu atau mengubah kualitas Three.js secara langsung. Ia hanya mengirim event ke parent Vue:

```vue
<button @click="emit('setTime', 'night')">Night</button>
```

Kemudian `pages/index.vue` menerima event itu:

```vue
<MobileToolsDrawer
  @set-time="setTime"
  @set-quality="changeQuality"
  @toggle-motion="worldMotion = !worldMotion"
  @navigate="jumpFromMap"
/>
```

`timeOfDay` diberikan ke `WorldScene`, lalu `livingWorld.ts` menyesuaikan lighting. Ini prinsip **props down / events up** dalam Vue.

## 5. Mengapa memakai Teleport?

Drawer dirender memakai `<Teleport to="body">` supaya dia tidak terjebak *stacking context* dari `.site-shell`/scene 3D, terutama ketika elemen 3D dan modal mempunyai `z-index` masing-masing.

Drawer diberi `role="dialog"`, `aria-modal="true"`, tombol close, focus wrap, dan shortcut Escape. Kontrol lain tetap tersedia saat desktop. Penanganan Escape juga berada pada `pages/index.vue`.

## 6. Mengatur kamera mobile

Buka `world/cameraDirector.ts`:

```ts
const targetZoom = ... * (isMobile ? 1.20 : 1)
// ...
relative.multiplyScalar(0.83)
```

Nilai zoom sedikit lebih besar memberi ruang bagi karakter chibi. Perubahan `relative` memendekkan jarak virtual kamera tanpa mengubah gaya orthographic. Coba `1.10` dan `1.25` untuk membandingkan hasil. Jika bangunan terlalu terpotong, kembalikan ke 1.20.

## 7. Checklist uji mandiri

Gunakan DevTools Device Toolbar dengan **425×714**, **375×667**, dan **320×568**; lalu uji satu HP fisik jika tersedia.

- [ ] Menu header satu tombol; Mini Map dan World tidak menimpa navigasi.
- [ ] Drawer berisi enam lokasi. Klik Projects → karakter berpindah ke sana.
- [ ] Drawer tab World bisa mengubah Day/Sunset/Night.
- [ ] Graphics Auto/Low dan suara masih dapat dikendalikan.
- [ ] Drawer dapat ditutup dengan X, tap backdrop, dan Escape (keyboard).
- [ ] Animasi scroll terlihat saat panel Details tertutup.
- [ ] Saat Details dibuka, kartu konten scrollable dan tombolnya dapat diklik.
- [ ] Karakter memiliki kepala lebih besar, rambut belah tengah, hoodie, tangan/kaki utuh.
- [ ] Walk, motor, bus, pintu gedung, dan scroll mundur tidak berubah rusak.
- [ ] Mode Lite dan halaman studi kasus masih berfungsi.
- [ ] Night Mode memiliki header dan tulisan yang kontras.

### Jika error

Buka Chrome DevTools → Console dan ambil **pesan error merah pertama**. Untuk error CSS/layout, periksa tab Elements → Computed, lalu lihat `z-index`, `position`, dan `display`. Untuk error `WebGL`, pastikan canvas ada dalam `.world-scene`.

## 8. Latihan agar bisa membuatnya sendiri

1. Ubah `headScale` dari `1.35` ke `1.42`. Lihat bagian mana dari wajah/hoodie yang bergerak.
2. Ubah `hairSweep`; bandingkan rambut dari sudut kiri dan kanan karakter.
3. Di `MobileToolsDrawer.vue`, tambah satu tombol `Show dialogue` dan emit event baru yang dihubungkan ke state Vue.
4. Di `main.css`, ubah tinggi bottom sheet saat collapsed dari `74px` ke `68px`. Amati ruang dunia 3D di 375×667.
5. Di `cameraDirector.ts`, bandingkan zoom 1.1 dengan 1.2. Pilih yang tidak memotong bangunan.

## 9. Privasi foto referensi

Foto referensimu tersimpan di `public/images/avatar-reference.webp`. **Folder `public` dapat diakses pengunjung setelah deployment.** Jika kamu tidak ingin foto itu dipublikasikan, ganti `owner.photo` dan hapus file tersebut sebelum deploy. Model 3D procedural tidak membutuhkan file foto saat runtime.
