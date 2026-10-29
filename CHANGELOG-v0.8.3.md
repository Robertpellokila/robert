# Changelog v0.8.3 — Chapter Stops & First-Person Indoor Exploration

- Mencegah wheel/trackpad cepat melewati seluruh portfolio: satu gesture ke section berikutnya; animasi perjalanan GSAP tetap aktif.
- Menambahkan touch swipe section-by-section, keyboard chapter navigation, serta mempertahankan navigasi eksplisit langsung via menu.
- Mengubah transisi Enter Building menjadi pergerakan menuju pintu + zoom, diikuti POV `PerspectiveCamera` dengan veil singkat pada transisi proyeksi.
- Menambahkan kontrol keyboard dan mobile D-pad untuk berjalan di interior, serta drag untuk menoleh.
- Menambahkan batas ruang untuk mencegah kamera keluar dinding; collision furnitur detail belum tersedia.
- Menambahkan 13 objek interaktif dalam enam interior, data terpusat `data/roomObjects.ts`, serta `THREE.Raycaster` untuk deteksi klik.
- Foto di About menjadi objek yang bisa dipilih untuk membuka cerita pemilik portofolio.
- Memindahkan isi interior ke panel objek yang muncul hanya setelah objek dipilih. Mode eksplorasi tidak lagi ditutupi panel lebar secara permanen.
- Menambahkan daftar Exhibits alternatif untuk navigasi aksesibel dan mobile.
- Mempertahankan semua file v0.8.2, dengan tambahan modul dan tes baru v0.8.3.

## Catatan penting

Pergeseran orthographic → perspective memakai overlay fade singkat, bukan transformasi proyeksi kontinu. FPS di perangkat dan kompatibilitas template/build Nuxt belum bisa diverifikasi pada lingkungan pengerjaan ini karena registry npm tidak dapat diakses.
