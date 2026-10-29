# Panduan My Little World v0.8.8

## 1. Menjalankan versi ini

1. Ekstrak ZIP ke **folder baru**.
2. Buka folder yang berisi `package.json` lewat VS Code.
3. Jalankan:

   ```bash
   npm install
   npm run test:welcome
   npm run test:logic
   npm run check:syntax
   npm run dev
   ```
4. Buka `http://localhost:3000`.

## 2. Checklist pengujian

- [ ] Hard refresh (`Cmd+Shift+R`) menampilkan splash dengan pilihan Lite dan 3D.
- [ ] Pilih **Explore Lite Portfolio**: masuk Lite dan splash tertutup.
- [ ] Tekan **Explore 3D** di header Lite: langsung masuk 3D tanpa pilihan ulang.
- [ ] Dari 3D, pilih **Lite**: kembali ke Lite tanpa splash.
- [ ] Buka halaman detail proyek, kemudian kembali ke portofolio lewat link internal: tidak muncul pilihan lagi.
- [ ] Di footer Lite, tekan **Replay welcome ✳** untuk membuka splash lagi.
- [ ] Uji splash di perangkat mobile dan keyboard (Tab / Enter).
- [ ] Jalankan `npm run build` dan periksa log browser jika ada kegagalan WebGL.

## 3. Jika kamu ingin memakai patch pada folder proyek lama

Cukup salin file berikut dari v0.8.8 ke folder v0.8.7:

```text
pages/index.vue
components/LitePortfolio.vue
assets/css/welcome-premium.css
assets/css/lite-premium.css
```

Jika kamu menggunakan skrip test baru, salin juga `scripts/test-welcome-v088.cjs`. Jangan menimpa `data/portfolio.ts`, `public/images`, `nuxt.config.ts`, atau favicon yang sudah kamu edit sendiri.

**Penting:** `nuxt.config.ts` harus tetap mendaftarkan `~/assets/css/welcome-premium.css` dan `~/assets/css/lite-premium.css` seperti pada v0.8.7.

## 4. Pemahaman teknis

### `useState()` menjaga pilihan selama navigasi internal

```ts
const welcomeCompleted = useState<boolean>('mlw-welcome-completed', () => false)
const showWelcomeSplash = computed(() => !welcomeCompleted.value)
```

Nilai ini tetap tersedia saat pindah ke halaman studi kasus melalui NuxtLink, lalu kembali. Ketika website dimuat ulang secara penuh, Nuxt menginisialisasi state baru, sehingga welcome muncul lagi.

### `Teleport` memastikan splash di atas semua layer

```vue
<ClientOnly>
  <Teleport to="body">
    <Transition name="splash-fade">
      <div v-if="showWelcomeSplash" class="welcome-splash v087-welcome">
        <!-- Welcome content -->
      </div>
    </Transition>
  </Teleport>
</ClientOnly>
```

Dengan begitu splash tidak terjebak dalam layer CSS milik Lite atau canvas 3D.

### Tombol Explore 3D harus memanggil perpindahan langsung

```vue
<LitePortfolio @switch3d="goDirectlyTo3D" />
```

```ts
function goDirectlyTo3D() {
  changeExperience('3d')
}
```

Jika WebGL2 tidak didukung, tombol 3D nonaktif dan pengunjung tetap dapat menggunakan Lite Mode.
