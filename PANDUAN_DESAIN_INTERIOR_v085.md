# My Little World v0.8.5 — Panduan Desain Enam Ruangan

## Tujuan dan batasan

Versi ini mengambil **komposisi, palet warna, dan jenis objek** dari enam referensi pengguna, lalu membangunnya sebagai **mesh 3D procedural** supaya tetap dapat dimasuki dan dijelajahi melalui first-person exploration.

**Penting:** Referensi adalah gambar 2D, bukan file proyek Blender/GLB. Versi ini **bukan salinan identik** secara geometris atau photorealistic. Ukuran ruangan dipertahankan agar kontrol, zoom, raycast, dan batas eksplorasi v0.8.4 tidak rusak. Detail fine furniture bisa diganti bertahap dengan model GLB untuk mengejar kemiripan lebih tinggi.

## Menjalankan

```bash
npm install
npm run test:logic
npm run check:syntax
npm run dev
# lalu untuk cek produksi
npm run build
```

Buka `http://localhost:3000`, pilih sebuah chapter dan tekan Enter Building. Gunakan W/S untuk maju/mundur, A/D untuk geser dan ←/→ untuk menoleh. Objek interaktif dipilih melalui klik atau daftar Exhibits.

## Peta referensi ke implementasi

| Chapter | Objek yang ditambahkan | Nuansa |
| --- | --- | --- |
| Home | wooden floor planks, meja monitor, rak buku, kursi santai, framed painting, lampu, tirai, tanaman, karpet, buku dan mug | kayu, cream, hijau, hangat |
| About | meja kerja, komputer, papan ide dengan sticky notes, framed photo dari aset sendiri, kursi, tanaman, dan jendela | cream, pastel, daylight |
| Experience | workstation, karakter mini duduk, papan proses, CV poster interaktif, rak, lampu, tanaman | beige profesional |
| Skills | graphite floor, monitor command center, server racks, indicator lights, workstation, aksen hijau | dark tech / glowing green |
| Projects | exhibition pedestals, project cards, display tables, wall signs, soft gallery lighting | white museum / wood |
| Contact | warm wood cafe, bar, coffee machine, pastry display, pastries, tables, stools, hanging plants, hanging lamps | warm terracotta cafe |

## File yang berubah

- `world/roomDecor.ts` **BARU**: desain semua room dengan fungsi `home`, `about`, `experience`, `skills`, `projects`, `contact`.
- `world/createInteriors.ts`: menyiapkan dinding dan lantai, memanggil `decorateRoom(group, id)`; foto, CV, poster proyek dan klik 3D tetap terpasang.
- `world/createWorld.ts`: menurunkan exposure pada saat masuk interior agar ruangan cream tidak terlalu putih.
- `data/roomObjects.ts`: memperbarui beberapa titik interaksi agar lebih dekat ke furniture baru.
- `scripts/test-room-v085.cjs`: pemeriksaan struktur enam ruangan dan koneksi dengan sistem eksplorasi.

## Belajar koordinat

Ruang memakai koordinat **lokal** (bukan koordinat dunia luar). Pada `roomDecor.ts`:

```ts
cube(group, width, height, depth, '#D59D65', x, y, z)
```

- X negatif = kiri, X positif = kanan.
- Y = tinggi objek di atas lantai.
- Z negatif = dinding belakang, Z positif = arah pintu / pengunjung.
- Lebar interior 6.6 unit, kedalaman 5.6 unit. Hindari melampaui X ±3 dan Z ±2.6.
- Pertahankan area kosong sekitar **X -0.7 s.d. +0.7 dan Z 0.55 s.d. +2.25** agar jalan dari pintu tidak tertutup furniture.

## Praktik edit ruangan

**A. Ubah interior Home:** buka `world/roomDecor.ts`, cari `function home(p:Parent)`. Coba ubah `chair(p,1.55,1.0,false)` menjadi `chair(p,1.9,1.0,false)`. Refresh dan lihat kursi lebih ke kanan.

**B. Ubah pencahayaan cafe:** cari `function contact` dan `pendant`. Ubah warna material lampu di fungsi `pendant` jika ingin lebih hangat. Intensitas point light interior ada di `createInteriors.ts` (`warmRoom`).

**C. Ubah jumlah server Skills:** cari `rack(p,2.42,-1.85)` dan `rack(p,1.32,-1.85)`; tambahkan rack jika masih muat, tetapi jangan menutup lorong.

**D. Ubah desain gallery Projects:** cari `function projects`; `for` loop membuat tiga pedestal. Poster interaktif proyek masih ditangani `printedCard()` di `createInteriors.ts`.

**E. Menambah objek yang dapat diklik:** menambah furniture visual saja tidak otomatis membuat hotspot. Tambahkan metadata pada `data/roomObjects.ts`, kemudian buat mesh dengan `userData.roomId` dan `userData.objectId` yang cocok atau pakai penanda yang sudah ada. Tampilkan isinya di `components/RoomObjectDetails.vue`.

## Untuk mencapai tingkat detail seperti gambar referensi

Kita perlu **asset pass** tersendiri. Prioritas aset GLB:

1. Home: meja dan kursi detail, buku, tanaman gantung, lampu dekoratif, tirai, rak
2. About: karakter mini, kursi kerja, cork board dan stationery, monitor, pot tanaman
3. Experience: mini figure stylized, board, workstation, frame sertifikat
4. Skills: server cabinets, multiple monitor wall, desk control station
5. Projects: display glass cabinet, museum pedestals, spotlights, framed posters
6. Contact: mesin espresso, pastry display, hanging vines, kitchen counter, sofa dan stool

Dapat dibuat menggunakan Blender/Spline atau aset GLB yang lisensinya mengizinkan penggunaan di website. Asset yang diimpor sebaiknya dikompresi dan ditempatkan pada `public/models/rooms/`. Model GLB harus di-load ketika dibutuhkan, tidak semuanya sekaligus; mesh klik dan collision perlu diselaraskan sendiri.

## Checklist uji browser (belum diverifikasi oleh pembuat)

- [ ] Bisa masuk/keluar keenam gedung tanpa error.
- [ ] Karakter berjalan ke pintu dan kamera berganti first-person.
- [ ] W/S/A/D bekerja normal dan tidak keluar batas dinding.
- [ ] Foto About, poster CV Experience, serta 3 Project Gallery dapat diklik.
- [ ] Kafe Contact terlihat warm dan objek kontak dapat dibuka.
- [ ] Skills tidak terlalu gelap di Night Mode.
- [ ] 375px / 425px mobile dan Lite Mode tetap dapat mengakses konten.
- [ ] Tidak ada error merah di DevTools Console.
- [ ] `npm run build` selesai tanpa error.

## Batasan teknis saat ini

- Desain ruangan adalah **reinterpretasi procedural** dari referensi, bukan geometry GLB asli.
- Detil sofa kain, permukaan kayu realistis, pastry, dan karakter referensi masih sederhana.
- **Belum ada collision per-furniture**: batas dinding tetap bekerja, tetapi kamera dapat menembus beberapa meja atau rak.
- Belum ada penilaian fidelity render melalui Chrome/Firefox/HP. Pengujian source-level tidak menggantikan uji visual.
