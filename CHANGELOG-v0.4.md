# Changelog v0.4.0

## Fitur baru

- Enam diorama interior low-poly sesuai section Home / About / Experience / Skills / Projects / Contact.
- Gerbang/pintu berengsel per gedung; animasi buka/tutup berdasarkan `entryProgress`.
- Karakter berjalan menuju pintu dan kamera bertransisi ke cutaway interior.
- Klik menu → perjalanan → auto-entry saat tiba; scroll manual → tombol Enter Building.
- Tombol Exit dan keyboard Escape; body scroll dibuka kembali sesudah exit.
- Project Gallery dengan pilihan proyek, metadata, tech stack, dan tombol case study.
- Halaman proyek `/projects/[slug]` dengan SEO dasar dan fallback 404.
- `iframe` preview hanya aktif ketika URL valid dan `allowEmbed: true`.
- Pemisahan stylesheet interior dan registry data ruangan.

## Keterbatasan yang diketahui

- Peralihan interior memakai visibility cutaway, bukan bangunan 3D dengan collision/fisika dan transparansi atap halus.
- Karakter masuk menggunakan interpolasi posisi dan procedural walking, belum animasi skeletal motion-capture.
- Route case study masih kerangka konten, belum berisi screenshot/analisis asli tiap proyek.
- Website demo belum diisi, sehingga tombol iframe belum aktif secara default.
- Living World (NPC, day/night, audio) sengaja dijadwalkan untuk v0.6.
- Build Nuxt dan render browser belum diverifikasi di sini.
