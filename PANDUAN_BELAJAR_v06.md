# Belajar My Little World v0.6 — Living World

Panduan ini untuk belajar sambil mengembangkan **source code yang sudah ada**. Kamu tidak perlu Blender atau membuat aset 3D sendiri. Tujuan v0.6 adalah mengubah kota v0.5 yang statis menjadi lingkungan yang hidup, tanpa mengganggu logika perjalanan karakter, halaman Projects, dan fitur masuk gedung.

## A. Persiapan dan cara kerja proyek

```bash
# Dari folder yang berisi package.json
npm install
npm run test:logic
npm run check:syntax
npm run dev
```

Buka `http://localhost:3000` di browser. Jika port tersebut sudah dipakai, ikuti port yang ditampilkan terminal.

**Catatan:** tes logika maupun syntax parsing bukan pengganti `npm run build` dan pengujian visual WebGL. Lakukan build sebelum deploy.

## B. Arsitektur: dua sumber waktu yang berbeda

Ini konsep PALING PENTING.

```text
                ┌─────────────┐
Mouse scroll ──►│ progress 0-1│──► animateScene ──► avatar, motor, bus, camera
                └─────────────┘

                ┌─────────────┐
Frame clock ───►│ deltaSeconds│──► livingWorld ──► trees, clouds, NPC traffic
                └─────────────┘                └► gradual lighting transitions

World Controls ─► timeOfDay / motionEnabled / ecoMode
User click ─────► useAmbientAudio ─► Web Audio context (only after click)
```

Kenapa dibedakan? Karena saat pengunjung berhenti scroll, **pohon dan awan tetap boleh bergerak**. Tetapi karakter utama harus tetap berada pada posisi sesuai scroll. Ketika pengunjung scroll mundur, animasi perjalanan bisa mundur tanpa harus memundurkan awan dan NPC.

## C. Memahami data flow dari Vue menuju Three.js

### 1. Halaman Vue: `pages/index.vue`

Kita memakai tiga `ref`:

```ts
const timeOfDay = ref<'day' | 'sunset' | 'night'>('day')
const worldMotion = ref(true)
const ecoMode = ref(false)
```

Artinya:
- `timeOfDay` adalah suasana, bukan jam asli pengunjung.
- `worldMotion` adalah sakelar animasi dekorasi.
- `ecoMode` adalah sakelar kualitas grafis.

Ketiganya diteruskan sebagai props ke komponen `WorldScene`.

### 2. Panel WORLD: `components/WorldControls.vue`

Komponen hanya menampilkan antarmuka dan memancarkan event:

```vue
<button @click="emit('setTime', 'night')">Night</button>
```

Komponen ini **tidak** membuat warna langit sendiri. Dengan pemisahan tersebut, kontrol UI mudah diuji dan dunia 3D tidak perlu dibuat ulang ketika tombol diklik.

### 3. Bridge: `components/WorldScene.vue`

Dunia 3D dibuat sekali saat elemen DOM benar-benar sudah tersedia. Kita memberikan callback pada `createWorld()` untuk membaca nilai Vue terbaru:

```ts
() => ({
  timeOfDay: props.timeOfDay ?? 'day',
  motionEnabled: props.worldMotion !== false,
  ecoMode: props.ecoMode === true,
})
```

**Kenapa callback?** Karena `WebGLRenderer` berjalan di loop-nya sendiri. Callback membiarkan loop tersebut membaca props terbaru tanpa menghancurkan dan memasang canvas berulang-ulang.

## D. Mode Day / Sunset / Night

File `world/livingWorld.ts` memiliki `skyPresets`:

```ts
export const skyPresets = {
  day:    { sky: '#eaf1e9', fog: '#eaf1e9', hemisphere: 3,    sun: 3,    lamp: 0,   exposure: 1.7,  sunColor: '#fff3df' },
  sunset: { sky: '#e9c8b3', fog: '#e9d0b9', hemisphere: 1.65, sun: 1.7,  lamp: 1,   exposure: 1.56, sunColor: '#ffb584' },
  night:  { sky: '#162739', fog: '#27394a', hemisphere: .58,  sun: .42,  lamp: 2.9, exposure: 1.36, sunColor: '#b0c3eb' },
}
```

Penjelasan variabel:

| Variabel | Fungsi |
|---|---|
| `sky` | Warna background Three.js |
| `fog` | Warna kabut agar objek jauh menyatu dengan suasana |
| `hemisphere` | Intensitas pencahayaan umum dari langit |
| `sun` | Intensitas lampu directional yang mewakili matahari/bulan |
| `lamp` | Nilai `emissiveIntensity` untuk lampu dan jendela |
| `exposure` | Kecerahan akhir output renderer |
| `sunColor` | Warna sumber cahaya directional |

### Kenapa tidak langsung mengganti nilainya?

Kalau semua nilai berubah pada satu frame, dunia tampak berkedip. Kita menggunakan interpolasi berdasarkan durasi antarframe:

```ts
const alpha = 1 - Math.exp(-deltaSeconds * 2.2)
sunlight.intensity += (target.sun - sunlight.intensity) * alpha
```

`alpha` bernilai dari 0 sampai 1; saat mendekati target, perpindahan makin halus. Ini lebih stabil daripada melakukan `lerp(..., 0.05)` tetap pada tiap frame, yang berubah kecepatannya menurut fps.

**Latihan 1:** Ubah `skyPresets.night.sky` menjadi `#101d36` dan `skyPresets.sunset.sunColor` menjadi `#ff9a69`. Jalankan dan bandingkan.

## E. Lampu jalan & jendela

Fungsi `makeStreetLamp()` membuat tiang, kap, dan globe memakai mesh primitif. Material globenya dibuat dengan:

```ts
new THREE.MeshStandardMaterial({
  color: '#ffeed0',
  emissive: '#ffbd66',
  emissiveIntensity: 0,
})
```

Saat memilih Night, `emissiveIntensity` bertransisi ke nilai 2.9. Kita juga menambahkan satu panel window glow pada setiap gedung dan lampu mobil NPC.

**Perlu dipahami:** bahan emissive membuat material **terlihat menyala**, tetapi tidak otomatis memantulkan cahaya fisik ke tanah. Untuk pencahayaan fisik perlu PointLight, shadow map, dan biaya GPU tambahan. Pilihan emissive ini sengaja dibuat untuk situs portofolio yang ringan.

**Latihan 2:** Cari array lokasi lampu berikut:

```ts
for (const x of [-32, -24, -12, -1, 11, 23, 32]) {
  lamps.push(makeStreetLamp(scene, x, 5.8))
}
```

Tambahkan satu nilai `x`, misalnya `15`, kemudian lihat perubahan kota. Hindari menambah terlalu banyak lampu dekoratif jika performa turun.

## F. Animasi pohon dan awan

`createWorld.ts` sudah membuat pohon dan awan. Sekarang referensi Group-nya dikumpulkan agar `livingWorld.ts` dapat menggerakkannya.

```ts
const canAnimate = settings.motionEnabled
if (canAnimate) elapsed += frameDelta

// Pohon
const sway = Math.sin(elapsed * 0.72 + i * 0.91) * 0.018

tree.rotation.z = baseTreeRotations[i] + sway
```

Fungsi `Math.sin()` menghasilkan gerakan periodik dari -1 ke +1. Besar `0.018` adalah radian, jadi goyangan sangat halus dan cocok untuk miniatur. Awan menggeser posisi di sumbu X dan sedikit sumbu Y menggunakan sinus juga.

**Latihan 3:** Ubah `0.018` menjadi `0.04` agar pohon bergerak lebih jelas. Jangan terlalu besar atau batang pohon terlihat seperti jatuh.

## G. Kendaraan NPC

NPC berbeda dari bus dan motor karakter utama. Mobil NPC hanya dekorasi untuk membuat jalan hidup.

Di `world/livingWorld.ts` ada daftar:

```ts
const traffic = [
  { model: makeNpcCar(scene, '#a9b9d0'), speed: .017, offset: .08, reverse: false, lane: -1.02 },
  { model: makeNpcCar(scene, '#dca894'), speed: .012, offset: .55, reverse: true, lane: 1.02 },
]
```

Penjelasan:

- `model` adalah mesh mobil.
- `speed` adalah kecepatan dalam fraksi seluruh lintasan per detik; `.017` berarti sekitar 59 detik untuk satu rute.
- `offset` menentukan posisi awal sehingga dua mobil tidak selalu berdekatan.
- `reverse` membalik arah.
- `lane` menggeser posisi sedikit ke kiri/kanan dari centerline jalan.

Mobil memakai **kurva path yang sama** dengan perjalanan utama tetapi posisi dan kecepatannya berasal dari waktu frame, bukan nilai scroll. Ini masih dekoratif: belum ada rem, kemudi pintar, collision detection, atau lampu sein.

**Latihan 4:** Ubah mobil kedua menjadi `'#9bbca5'` dan `speed: .009`. Setelah memahami itu, tambahkan objek ketiga ke array traffic. Pilih `offset` berbeda dan pastikan NPC tidak terlalu menumpuk di jalan.

## H. Interaksi kecil saat tiba di gedung

Kita membuat lingkaran halus pada enam area. Setiap frame jaraknya diukur dari posisi karakter ke penanda:

```ts
const distance = actorPosition.distanceTo(location)
const intensity = Math.max(0, 1 - distance / 4)
ring.visible = intensity > 0.04
```

Jadi saat karakter mendekat, cincin perlahan muncul. Saat ia menjauh, cincin meredup. Fitur ini tidak menggunakan raycast atau klik objek 3D, sehingga ringan dan tidak mengubah sistem Enter Building yang sudah ada sejak v0.4.

**Latihan 5:** Ubah angka `4` menjadi `6` supaya area pemicu menyala dari jarak lebih jauh.

## I. Ambience dengan Web Audio API

Buka `composables/useAmbientAudio.ts`. Kita tidak mengambil audio dari website mana pun. Audio berupa:

1. **Suara angin lembut:** buffer noise acak yang difilter dengan low-pass.
2. **Cicit burung sintetis:** oscillator sine yang frekuensinya dinaikkan sesaat, kemudian volume menghilang.

Browser modern sering memblokir audio yang diputar tanpa interaksi. Karena itu, context dibuat **setelah tombol Sound ON diklik**:

```ts
const ctx = new window.AudioContext()
// ... susun noise, filter, gain, kemudian mulai
await ctx.resume()
```

Saat Sound OFF ditekan, interval chirp dihentikan, sumber noise dihentikan, dan `AudioContext.close()` dipanggil. Saat komponen ditutup, cleanup juga berjalan.

**Latihan 6:** Turunkan `volume.gain.value` dari `.027` menjadi `.015` jika suara angin terlalu keras. Jangan memperbesar secara ekstrem.

## J. Eco mode dan reduced motion

Ada dua fitur berbeda:

- **Eco Graphics:** mengubah `renderer.setPixelRatio()` maksimum 1 dan mematikan shadow map. Ini mengurangi beban penggambaran 3D.
- **Moving World:** menghentikan pembaruan posisi lingkungan seperti pohon, awan, dan kendaraan. Karakter tetap mengikuti scroll seperti sebelumnya.

Di perangkat mobile, Eco default ON. Bila pengunjung memiliki setting sistem `prefers-reduced-motion: reduce`, Moving World default OFF. Pilihan ini bisa diubah oleh pengunjung pada panel WORLD.

Kami menyimpan tiga preferensi tersebut (time, motion, eco) di `localStorage`, **bukan audio**. Audio selalu dimulai OFF karena perlu gesture pengunjung.

## K. Uji semua fungsi secara manual

Lakukan ini setelah `npm run dev`:

1. **DAY → SUNSET → NIGHT:** perhatikan langit, jendela, lampu jalan, dan pencahayaan.
2. **NIGHT → DAY:** transisi kembali halus, tanpa flashing.
3. **Moving World OFF:** pohon, awan, NPC berhenti; scroll karakter masih bekerja.
4. **Moving World ON:** NPC melanjutkan dari posisi terakhir.
5. **Eco ON:** lihat fps/GPU di DevTools Performance (performa akan berbeda antarperangkat).
6. **Sound ON/OFF:** audio berfungsi hanya setelah klik, tidak mulai otomatis setelah refresh.
7. **About → Enter Building → Exit:** fitur interior tetap berfungsi.
8. **Projects → case study → back:** halaman detail tetap dapat diakses.
9. **Mobile dan reduced motion:** pastikan navigasi dan konten masih mudah digunakan.
10. **Console:** periksa error berwarna merah dan jalankan `npm run build` di komputermu.

## L. Cara mengatasi masalah

| Gejala | Kemungkinan penyebab / pemeriksaan |
|---|---|
| Canvas kosong | Pastikan `WorldScene.vue` versi ini, cek Console WebGL dan jangan campur file `.client.vue` lama |
| Malam terlalu gelap | Tingkatkan `skyPresets.night.hemisphere` atau `exposure` secara bertahap |
| Lampu tidak terlihat terang | `emissiveIntensity` terlalu kecil atau toneMappingExposure mempengaruhi hasil visual |
| Mobil bertumpuk di tengah | Pastikan `livingWorld.update()` tetap memposisikan mobil meskipun motion OFF |
| Audio tidak terdengar | Klik Sound ON, cek output speaker, volume browser, serta dukungan Web Audio |
| Frame rate rendah | Aktifkan Eco, Moving World OFF, coba Chrome/Safari terbaru |
| Perubahan tidak terlihat | Hard refresh, stop server, hapus `.nuxt` lalu jalankan ulang bila perlu |

## M. Berikutnya: v0.7

Setelah v0.6 stabil: mini-map, dialog karakter, area clickable khusus, keyboard shortcuts, Easter eggs dan preferensi kunjungan yang lebih lengkap. Kita juga bisa meningkatkan NPC menjadi traffic logic sederhana dan memperkaya interior pada versi selanjutnya.
