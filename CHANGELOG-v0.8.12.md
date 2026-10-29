# Changelog v0.8.12 — Contact Café

- Menambahkan pelayan chibi procedural yang melambaikan tangan di belakang counter.
- Pelayan dapat diklik dan mengarah ke exhibit Message desk yang sudah ada.
- Animasi waving memakai render loop yang sudah ada dan menghormati tombol World Motion.
- Membuat komponen `ContactForm.vue` yang modern, responsif, dengan input nama, email, topik, dan pesan.
- Menghubungkan ContactForm ke panel Contact Café 3D dan Lite Mode (satu komponen dipakai bersama).
- Form membuka **draft email** via `mailto:`; tidak mengklaim mengirim otomatis.
- Menambahkan tes source `scripts/test-contact-v012.cjs` untuk integrasi baru.
