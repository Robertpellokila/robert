# Panduan Belajar — My Little World v0.7

Tujuan: memahami **hubungan Vue → Three.js → event → state → UI**, sambil membangun fitur yang bisa digunakan pengunjung portfolio.

## 0. Persiapan

Gunakan Node.js 22+, npm, dan browser modern dengan WebGL.

```bash
npm install
npm run test:logic
npm run check:syntax
npm run dev
```

Buka `http://localhost:3000`. Jika dependency telah terpasang, jalankan juga `npm run build` sebelum deploy. Jangan menyalin `node_modules` dari versi lama karena dependency mungkin berubah.

## 1. Alur event yang perlu dipahami

```text
Klik objek 3D → Raycaster di createWorld.ts menemukan Mesh
→ memanggil onDiscover('projects')
→ WorldScene.vue emit('discover','projects')
→ pages/index.vue discover('projects')
→ state selectedDiscovery + collectedDiscoveries diperbarui
→ VisitorExperience.vue menampilkan Postcard
→ localStorage menyimpan ID yang ditemukan
```

Setiap bagian punya tugas tersendiri. `createWorld.ts` hanya mengurus objek dan klik. Vue yang mengatur panel dan data.

### Praktik A: ganti cerita

Buka `data/discoveries.ts`. Ubah `message` dan `title` objek dengan `id: 'about'`. Tidak perlu mengubah Three.js. Teks akan diperbarui otomatis.

### Praktik B: ganti bentuk collectible

Di `world/createWorld.ts` temukan `createDiscoveryObjects()`. Kode `if (item.id === ...)` membuat bentuk berbeda: octahedron, buku, cone, terminal, dodecahedron, dan cup. Ubah `DodecahedronGeometry(.38)` menjadi `BoxGeometry(.5,.5,.5)` untuk mengubah collectible Projects menjadi kubus.

### Praktik C: memahami raycasting

`findDiscovery(event)` melakukan empat langkah:

1. Ambil ukuran canvas untuk mengetahui posisi pointer.
2. Ubah koordinat pixel pointer menjadi koordinat ter-normalisasi `(-1..1)`.
3. Panggil `raycaster.setFromCamera(pointer, camera)`.
4. Cari objek hit lewat `raycaster.intersectObjects(interactive.targets, false)`.

Hanya `interactive.targets` yang dicek, jadi klik jalan/pohon tidak membuka postcard.

### Praktik D: mini-map

File `components/VisitorExperience.vue` memiliki peta skematis SVG dan enam tombol lokasi. Tombol `@click="jump(index)"` mengirim event `jump` ke halaman. `jumpFromMap()` di `pages/index.vue` mengubah scroll ke section yang benar dan memastikan tidak sedang berada di interior.

### Praktik E: dialog karakter

Di `utils/visitorExperience.ts`, fungsi `journeyDialogue(phase,currentId,mode)` menentukan dialog tanpa mengubah objek 3D. Coba ganti teks saat `phase === 'mount'`. Lalu scroll dari Experience menuju Skills untuk melihat teks baru.

### Praktik F: koleksi dan storage

Di `pages/index.vue`, fungsi `discover()` menjalankan `validDiscoveryIds([...previous,id])`. Ini memastikan hanya ID resmi yang disimpan dan duplikasi dihilangkan. Hasil disimpan menggunakan `localStorage` supaya setelah refresh koleksi tetap ada. Untuk mereset **hanya** koleksi demo, buka Console dan jalankan:

```js
localStorage.removeItem('mlw-discoveries-v07')
location.reload()
```

## 2. Latihan mandiri

1. Ubah judul dan pesan collectible Home.
2. Ubah warna `.visitor-map-toggle` di `assets/css/main.css`.
3. Tambahkan variasi dialog ketika karakter sedang menaiki bus.
4. Ubah ukuran hitbox collectible dari `.87` menjadi `1.1` dan bandingkan kemudahan klik.
5. Buka mini-map menggunakan keyboard Tab + Enter. Pastikan tombol lokasinya bisa digunakan.
6. Coba di layar ponsel: apabila objek sulit diklik, gunakan **Discover here**.
7. Pastikan video/iframe dalam gedung Projects, panel World, dan dialog dapat ditutup tanpa masalah.

## 3. Peta file — versi 0.7

| File | Peran |
|---|---|
| `data/discoveries.ts` | Data teks dan visual untuk collectible |
| `utils/visitorExperience.ts` | Pure function untuk data yang aman dan dialog |
| `world/createWorld.ts` | Model 3D, raycast pointer, animasi dan disposisi |
| `components/WorldScene.vue` | Penghubung callback Three.js menjadi event Vue |
| `pages/index.vue` | State utama, penyimpanan koleksi, routing |
| `components/VisitorExperience.vue` | Mini-map, bubble, panel penemuan |
| `assets/css/main.css` | UI dan aturan responsive |
| `scripts/test-visitor.cjs` | Tes tanpa browser |

## 4. Checklist pengujian di Mac

- [ ] Halaman utama menampilkan model 3D dari v0.6.
- [ ] Klik MINI MAP; enam tombol muncul.
- [ ] Pilih Skills; halaman scroll menuju Skills, tidak langsung membuka gedung.
- [ ] Klik objek bercahaya di depan salah satu gedung; postcard muncul.
- [ ] Refresh; penghitung koleksi tetap sama.
- [ ] Tekan Escape; postcard tertutup.
- [ ] Aktifkan tombol Discover here; postcard tetap bisa dibuka tanpa mouse 3D.
- [ ] Tekan Enter building di postcard saat berada di lokasi yang sama; animasi gedung berfungsi.
- [ ] Keluar gedung; mini-map dan dunia luar masih berfungsi.
- [ ] Ubah World ke Night lalu kembali ke Day.
- [ ] Buka Project Gallery, preview, halaman studi kasus dan CV.
- [ ] Uji tampilan mobile; mini-map bisa digulir dan tidak terpotong.
- [ ] Jalankan `npm run build` tanpa error.

## 5. Konsep penting

**Raycasting** bukan berarti berpindah ke koordinat 3D. Raycasting menembakkan garis virtual dari kamera melewati posisi cursor untuk memeriksa apakah garis menyentuh mesh tertentu.

**Custom emits** memisahkan Three.js dari data tampilan. Three.js tidak tahu ada component `VisitorExperience.vue`; ia hanya memanggil fungsi callback.

**LocalStorage** digunakan untuk data santai seperti koleksi postcard. Jangan simpan informasi pribadi sensitif, password, atau token autentikasi di situ.

**Fallback aksesibilitas** sangat penting untuk pengalaman 3D: pointer kecil tidak nyaman di mobile dan tidak bisa dijangkau semua pengguna. Karena itu peta menyediakan tombol HTML dengan keyboard focus.
