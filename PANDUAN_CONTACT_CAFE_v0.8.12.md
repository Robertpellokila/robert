# My Little World v0.8.12 — Barista Melambaikan Tangan & Contact Form

Panduan ini mengikuti struktur proyek v0.8.11. Targetnya supaya kamu bisa melakukan perubahan sendiri dan memahami hubungan antara model Three.js dan komponen Vue.

## 0. Sebelum mengubah kode

1. Simpan cadangan proyek v0.8.11.
2. Kalau kamu sudah mengedit interior, pakai **patch file** saja, jangan mengganti seluruh proyek.
3. Semua posisi furniture di `roomDecor.ts` adalah posisi lokal ruangan. Pintu ada di arah Z positif. Counter utama berada pada Z sekitar -1.66; pelayan ditempatkan **di belakang counter**, pada Z -2.15.

## 1. Membuat pelayan 3D melambaikan tangan

**File baru:** `world/createWavingBarista.ts`.

Buka file tersebut. Fungsi `createWavingBarista(parent, x, z)` membangun sebuah `THREE.Group` berisi tubuh, celemek, wajah, rambut, mata, dan tangan. Pada tangan kanan ada `waveArm` dengan shoulder pivot, supaya hanya tangan yang berputar saat waving. Pelayan dibuat procedural, tidak membutuhkan Blender.

**Integrasi di file:** `world/roomDecor.ts`

Tambahkan import:

```ts
import { createWavingBarista } from '~/world/createWavingBarista'
```

Di fungsi `contact(p:Parent)`, letakkan setelah `contactCounter` dan sebelum `cafeMachine(...)`:

```ts
createWavingBarista(p, -.73, -2.15)
```

Atur posisi: `x=-.73` bergeser horizontal. `z=-2.15` berada di belakang meja. Jangan terlalu dekat dengan Z positif karena objek akan keluar melewati counter.

**Integrasi animasi di file:** `world/createWorld.ts`

Tepat setelah `const interiors = createInteriors(scene)`:

```ts
const baristaWaveArm = interiors.rooms.contact.getObjectByName('contact-barista-wave-arm')
```

Di dalam fungsi `renderFrame`, tepat setelah `const motion = getWorldSettings?.().motionEnabled !== false`:

```ts
if (baristaWaveArm) {
  baristaWaveArm.rotation.z = motion
    ? 2.58 + Math.sin(time * .004) * .28
    : 2.58
}
```

- `2.58` = posisi dasar tangan terangkat, dalam radian.
- `.004` = kecepatan waving (coba `.002` untuk lebih pelan).
- `.28` = besar ayunan (coba `.18` untuk lebih lembut).
- Jika pengunjung mematikan World Motion, tangan berhenti di pose dasar.

**Agar bisa diklik:** torso pelayan sudah memakai `torso.userData.interactiveObjectId = 'email'`, sehingga click handler lama di `createInteriors.ts` membuka exhibit `email`.

## 2. Membuat contact form yang lebih premium

**File baru:** `components/ContactForm.vue`. Ini satu komponen form yang dipakai dua kali, supaya tidak ada dua versi UI yang berbeda.

Fitur:
- input nama dan email yang wajib diisi;
- topik Collaboration, Freelance project, Job opportunity, Say hello;
- pesan dengan minimal 10 karakter;
- CTA membuka draft email; dan tombol salin alamat email;
- desain hijau-cream yang responsif.

**PENTING:** tombol **Buka draft email** mengisi subject dan body lalu memanggil `mailto:`. Halaman belum mengirim pesan langsung lewat server. Pengunjung harus menekan Send dalam aplikasi email mereka. Ini cocok untuk belajar dan tidak membutuhkan API key.

### Mengubah alamat email penerima

Buka `data/portfolio.ts`, isi email asli:

```ts
export const owner = {
  // ...data lainnya tetap...
  email: 'email-kamu@domain.com',
}
```

Jangan menyertakan password, API key, atau token layanan email di frontend. Jika ingin pesan dikirim otomatis tanpa aplikasi email, buat server route Nuxt yang memvalidasi input dan menggunakan layanan pengirim email dari variabel environment server, plus rate limiting dan anti-spam.

### Menghubungkan ke room 3D

Buka `components/RoomObjectDetails.vue`, cari template `item?.kind === 'contact'` dan ganti isinya menjadi:

```vue
<template v-else-if="item?.kind === 'contact'">
  <ContactForm />
</template>
```

Komponen auto-imported oleh Nuxt karena berada di folder `components/`.

### Menghubungkan ke Lite Mode

Buka `components/LitePortfolio.vue`, cari `<section id="lite-contact" ...>` dan buat layout dua kolom dengan `<ContactForm />` di sebelah kanan. CSS tambahan tersedia pada `assets/css/lite-premium.css` di akhir file.

## 3. Cara mengubah desain sendiri

- Seragam hijau: `world/createWavingBarista.ts` → `const hoodie = mat('#6e8e76')`.
- Celemek: `const apron = mat('#e7d4ad')`.
- Kepala: `ball(root, 0.29, skin, 0, 1.76, 0)` — ubah radius `0.29`.
- Arah pandang: lokal +Z menghadap pengunjung di depan counter.
- Posisi pelayan: panggilan `createWavingBarista(p, -.73, -2.15)`.
- Judul form: `components/ContactForm.vue` → teks `Let's brew an idea together.`.
- Warna tombol: `.contact-form-footer button` dalam bagian `<style scoped>`.
- Nama topik: `<option>...</option>` di `ContactForm.vue`.

## 4. Pengujian

```bash
npm install
npm run check:syntax
npm run test:contact
npm run test:logic
npm run dev
```

Buka `localhost:3000` → pilih 3D → Contact → Enter Café. Pastikan pelayan ada di belakang counter dan tangan naik turun. Klik tubuh pelayan atau Message desk: form harus muncul. Isi nama, email, topik dan pesan, lalu klik **Buka draft email**.

Uji juga Lite Mode → Contact: form seharusnya sama. Di mobile, form harus menjadi satu kolom.

**Batasan pengujian:** tes source/logika sudah dibuat, tetapi rendering WebGL dan build Nuxt tetap perlu dites pada browser lokal karena dependensi Nuxt belum tersedia di lingkungan pengerjaan ini.
