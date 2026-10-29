# Belajar Membangun v0.5 — Interactive Portfolio Content

Kita tidak mengulang Three.js dari awal: v0.4 sudah mempunyai **world (dunia 3D), journey (posisi karakter), building transition (masuk gedung)**. v0.5 memisahkan **isi portofolio** dari grafis 3D, sehingga setiap proyek bisa diedit tanpa membuka kode animasi.

## Peta konsep

```text
Scroll (GSAP) -> Character/Camera (Three.js) -> Masuk gedung
                                                  |
                                                  v
                                           BuildingInterior.vue
                                                  |
                +----------------+----------------+-----------------+
                |                |                  |                |
            CareerTimeline  GitHubHighlights  Project Gallery  About/Contact
                                                   |
                         data/projects.ts ----------+
                                                   |
                          /projects/[slug].vue ----+---- ProjectPreview.vue
```

**Kenapa HTML untuk konten dan Three.js untuk dunia?** Konten HTML jauh lebih mudah dibaca, diakses melalui keyboard, dicari oleh mesin pencari, serta diubah menjadi halaman rute. 3D dipakai untuk pengalaman visual navigasi.

## Langkah 1 — Pahami `data/projects.ts`

Satu object `PortfolioProject` berisi dua kelompok informasi:

- **Ringkas:** `slug`, `name`, `tag`, `summary`, `technologies`, `cover` — untuk panel Projects, pilihan di gedung, dan hero halaman detail.
- **Mendalam:** `context`, `challenge`, `approach`, `engineering`, `outcome`, `learnings`, `gallery` — untuk studi kasus.

Mengapa? Jika sebuah nama proyek diubah, kita tidak harus memperbarui beberapa halaman secara manual. Keduanya membaca data yang sama.

Coba ubah `summary` pada MeetSpace. Perhatikan bahwa teks berubah pada panel gallery dan halaman case study.

## Langkah 2 — Pahami dynamic route Nuxt

File `pages/projects/[slug].vue` akan cocok dengan URL:

- `/projects/meetspace`
- `/projects/timedoor-battle-cards`
- `/projects/profitlens`

Di halaman, `useRoute().params.slug` digunakan untuk memanggil `getProject(slug)`. Jika slug tidak ditemukan, `createError({ statusCode: 404 })` menampilkan halaman error. Nuxt otomatis membuat rute berdasarkan nama file.

Pelajaran: **routing berbeda dari state Three.js**. Saat membuka studi kasus, kita berpindah halaman Nuxt, tetapi data proyek tetap terpusat di `data/projects.ts`.

## Langkah 3 — Menambah screenshot yang benar

Masukkan hasil screenshot yang kamu ambil sendiri dari website/demo ke:

```text
public/images/projects/meetspace-lobby.png
public/images/projects/meetspace-room.png
```

Lalu pada proyek MeetSpace ubah:

```ts
gallery: [
  { src: '/images/projects/meetspace-lobby.png', alt: 'MeetSpace lobby', caption: 'Lobby pengguna' },
  { src: '/images/projects/meetspace-room.png', alt: 'MeetSpace meeting room', caption: 'Tampilan meeting' },
]
```

Jika belum ada screenshot, halaman akan menampilkan instruksi, bukan gambar palsu. SVG yang sudah disertakan adalah **visual konsep**, bukan bukti produk yang telah berjalan.

## Langkah 4 — Mengaktifkan Live Preview

`components/ProjectPreview.vue` menggunakan 3 lapisan pengecekan:

1. `demoUrl` harus URL web yang aman: HTTPS atau HTTP localhost untuk development.
2. `allowEmbed` harus `true` (kamu mengizinkan demo ini di-embed).
3. User harus menekan tombol **Live preview**, baru iframe dipasang ke DOM.

Contoh **hanya setelah website aslimu sudah online**:

```ts
demoUrl: 'https://your-real-project.example',
allowEmbed: true,
```

Saat modal muncul, tombol **Desktop/Mobile** mengubah lebar iframe menggunakan CSS. Ini tidak benar-benar mengubah User-Agent perangkat. Situs yang menggunakan CSP `frame-ancestors` atau `X-Frame-Options` dapat memblokir iframe. Gunakan **Visit website** sebagai fallback.

`iframe sandbox="allow-scripts allow-forms"` merupakan pembatas keamanan, tetapi beberapa aplikasi login atau akses storage perlu ditampilkan di tab asli. Jangan menonaktifkan pembatas tanpa memahami dampaknya.

Latihan: set URL dev lokal dan `allowEmbed: true` pada project latihan, buka preview, geser ukuran, tutup dengan Esc, lalu set `allowEmbed: false` dan lihat bahwa tombol preview hilang.

## Langkah 5 — GitHub repository pilihan

Sebelumnya panel Skills menampilkan beberapa repository terbaru. Sekarang `components/GitHubHighlights.vue` memakai server API yang sama, tetapi API memprioritaskan repo pilihan.

Pada `data/portfolio.ts`:

```ts
export const owner = {
  // ... properti lain
  githubUsername: 'USERNAME_GITHUB_KAMU',
}
export const githubFeaturedRepositories: string[] = ['NAMA_REPO_1', 'NAMA_REPO_2']
```

Khusus GitHub, nama harus identik dengan repository publikmu. Endpoint server ada di `server/api/github.get.ts`. Ia memvalidasi username, memanggil API GitHub publik, menghapus fork/arsip, memilih repo sesuai daftar, lalu mengirim JSON ke komponen. Jika pilihan tidak ditemukan akan ada pesan penjelas.

**Kenapa server API?** Kita tidak perlu memanggil GitHub dari semua komponen secara langsung, dan bisa mengatur caching, validasi, serta error pada satu tempat.

## Langkah 6 — Career Timeline & CV

`CareerTimeline.vue` menampilkan `experiences` dan `education` dari `data/portfolio.ts`.

Bentuk data pendidikan:

```ts
export const education = [
  { institution: 'NAMA KAMPUS', program: 'NAMA PROGRAM', period: 'TAHUN', detail: 'DETAIL TERKONFIRMASI' },
]
```

Bagian huruf kapital hanyalah placeholder. Halaman `/resume` menggunakan data sama untuk tampilan CV HTML yang rapi. Klik **Print / Save as PDF**, kemudian pilih opsi **Save as PDF** di dialog Print browser. Untuk file PDF CV kamu yang benar-benar ada, simpan sebagai `public/cv.pdf` dan set `owner.cvUrl: '/cv.pdf'`.

Jangan publikasikan CV dengan periode `Isi periode` atau link kontak kosong jika ingin menggunakannya untuk melamar kerja.

## Langkah 7 — Memahami pemisahan komponen

- `BuildingInterior.vue`: panel isi bangunan, tidak menangani izin URL atau panggilan GitHub secara langsung.
- `ProjectPreview.vue`: mengetahui cara membuka/menutup modal iframe dan memilih ukuran perangkat.
- `GitHubHighlights.vue`: menangani fetch, loading/error dan list repo.
- `CareerTimeline.vue`: menampilkan data pengalaman/pendidikan.
- `pages/projects/[slug].vue`: konten SEO terstruktur untuk setiap proyek.
- `pages/resume.vue`: versi siap cetak.

Inilah prinsip **single responsibility**: tiap file memiliki pekerjaan yang jelas.

## Langkah 8 — Pengujian

```bash
npm run test:logic
npm run build
npm run dev
```

Tes logika mencakup 7 storyboard, 6 kamera, 8 pemeriksaan konten/URL. Build dan pengujian browser tetap harus dijalankan di perangkatmu.

Untuk pengujian manual: navigasikan ke Projects -> Enter Building -> pilih proyek -> Read Case Study -> Back. Lalu uji Experience -> CareerTimeline -> View CV -> Print. Terakhir, uji Skills dan repo GitHub.

## Latihan mandiri (bertahap)

**Latihan A (mudah):** Tambahkan satu feature highlight pada proyek MeetSpace, lalu cek case study.

**Latihan B (sedang):** Simpan satu screenshot milikmu, isi `gallery`, dan beri caption serta alt yang menjelaskan UI.

**Latihan C (sedang):** Pilih dua repo favorit di `githubFeaturedRepositories`, kemudian ubah urutannya untuk melihat perubahan list.

**Latihan D (lanjutan):** Tambahkan proyek baru di `data/projects.ts` dengan slug baru. Pastikan ia muncul di Project Gallery dan bisa dibuka lewat `/projects/slug-baru` tanpa menulis file Vue baru.

**Latihan E (lanjutan):** Tambahkan section `decisions` baru pada case study dan tampilkan sebagai komponen terpisah. Ini akan mengajarkan data-driven UI secara lebih dalam.

## Kesalahan umum

- **Preview putih:** situs tujuan mungkin melarang iframe atau butuh cookie/login yang diblokir sandbox; gunakan tab asli.
- **404 halaman proyek:** cek `slug`, bukan nama display.
- **Gambar tidak tampil:** file di `public/` diakses sebagai path dari root, misalnya `/images/projects/a.png`, bukan `/public/images/...`.
- **GitHub kosong:** isi `owner.githubUsername`; pastikan repositori publik dan tidak diarsipkan. Pilihan diperiksa dalam 100 repo terbaru yang diambil.
- **CV tidak menjadi PDF langsung:** fitur ini menggunakan dialog Print browser, bukan generator PDF otomatis.
- **Dunia 3D kosong:** pastikan `WorldScene.vue` memakai `<ClientOnly>`, cek Console, dan jangan gabungkan komponen `.client.vue` lama.

## Kesimpulan belajar

Di v0.5 kamu belajar **data modeling TypeScript, dynamic routing Nuxt, komponen reusable Vue, modal dan iframe, HTTP API, UI status loading/error, SEO metadata, serta print CSS**. Kamu tidak perlu membuat model 3D baru; semua peningkatan ini memanfaatkan dunia v0.4.
