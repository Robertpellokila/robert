# Changelog v0.8.6 → v0.8.7

## Interior polishing
- Enam interior tetap memiliki identitas visual yang berbeda dengan penyesuaian props, penataan dekorasi, dan detail furniture.
- About: foto tidak lagi memiliki bingkai dekoratif tambahan yang saling menutupi; monitor memakai CanvasTexture coding, keyboard detail, dan figur benar-benar menghadap workstation.
- Experience: figur duduk diarahkan ke komputer, kaki menekuk, tangan menjangkau area mengetik, dan board karier dapat diklik.
- Home: dekorasi rak dan meja disempurnakan; Skills: workstation dashboard, rak server, dan lampu. Projects: display museum. Contact: detail kafe/pastry dan counter yang bisa diklik.

## Interaksi
- Bubble chat diganti gaya cream/green yang lebih profesional dengan nama exhibit, icon, tail, dan area klik tersembunyi.
- Bubble billboard tetap menghadap kamera dalam First Person mode serta memiliki gerakan idle halus.
- Objek tertentu seperti monitor, board karier, dan counter dapat diklik secara langsung di mesh fisiknya.

## Splash / pilihan pengalaman
- Splash sambutan memiliki layout split editorial dengan ilustrasi kota CSS dan micro-animations.
- Choice `Lite Portfolio` vs `3D World` ditampilkan sebelum scene 3D dibuat.
- `prefers-reduced-motion` dan pilihan WebGL2 didukung.
- Background Lite selama splash dibuat inert agar fokus keyboard tidak lepas ke konten belakang.

## Premium Lite Portfolio
- Layout editorial responsif dengan navigasi desktop/mobile.
- Hero branding, foto, konten About, timeline Experience, skills grouped by area, GitHub, project gallery, filter status, dan Contact.
- Status proyek, ilustrasi konsep, dan data portfolio tetap menggunakan sumber tunggal dari `data/`.
- Experience Switch yang menumpuk header Lite dihilangkan pada Lite Mode; tombol ke 3D ada di header.

## Tests
- Tes baru: `npm run test:v087`.
- Regresi seluruh tes logika sebelumnya dan pemeriksaan parsing TypeScript/Vue script.
- Full Nuxt build / browser rendering belum berhasil diverifikasi karena dependensi Nuxt belum terpasang pada lingkungan pembuatan.
