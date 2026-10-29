# Memperbaiki Pohon yang Menutupi Foto About

Penyebabnya ada di **`world/createWorld.ts`**, bukan `plant()` pada
`world/roomDecor.ts`.

## Patch manual pada proyek yang sedang kamu jalankan

1. Buka `world/createWorld.ts`.
2. Cari baris pohon di dalam `function addScenery(...)`:

```ts
[-32, -7.8, 0.85, 1], [-20, -8.1, 0.85, 0], [-17, 8.2, 0.9, 2],
```

Ganti koordinat `[-20, -8.1, 0.85, 0]` dengan
`[-22.2, -10.5, 0.85, 0]`.

3. Masih di `world/createWorld.ts`, cari kode di dalam fungsi `renderFrame`
(tepat setelah `for (const id of Object.keys(buildings) as ChapterId[]) { ... }`):

```ts
const isInteriorVisible = roomId !== null && entry >= .55
for (const tree of trees) tree.visible = !isInteriorVisible
```

Tambahkan dua baris itu setelah loop visibility bangunan dan interior.

4. Simpan, restart `npm run dev` dan lakukan hard refresh (`Cmd+Shift+R`).
5. Masuk ke gedung About. Foto seharusnya tidak ditutupi pohon kota lagi.
6. Tekan Exit Room dan periksa pohon outdoor tetap muncul lagi.

**Mengapa harus dua perubahan?** Memindahkan satu pohon memperbaiki lokasinya.
Menyembunyikan seluruh pohon outdoor saat interior aktif mencegah kasus
serupa di Home, Experience, Skills, Projects, atau Contact.

Perubahan ini tidak menghapus tanaman yang sengaja berada di interior.
