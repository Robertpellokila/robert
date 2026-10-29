/**
 * v0.5 — Single source of truth for project content.
 * Replace concept artwork and copy with your verified real screenshots and outcomes.
 * Do not put secrets, private client code, or unverified metrics here.
 */
export interface PortfolioProject {
  slug: string
  name: string
  kind: string
  tag: 'Prototype' | 'In progress' | 'Concept' | 'Completed'
  initials: string
  color: string
  summary: string
  technologies: string[]
  demoUrl: string
  repositoryUrl: string
  allowEmbed: boolean
  featured: boolean
  cover: string
  coverLabel: string
  role: string
  context: string
  challenge: string
  approach: string[]
  highlights: string[]
  engineering: { title: string; description: string }[]
  outcome: string
  learnings: string[]
  gallery: { src: string; alt: string; caption: string }[]
}

export const projects: PortfolioProject[] = [
  {
    slug: 'meetspace',
    name: 'MeetSpace', kind: 'Flexible real-time meeting experiences', tag: 'In progress',
    initials: 'MS', color: '#dae8f8', summary: 'Eksperimen platform meeting dengan beberapa mode ruang dan pengalaman kolaborasi berbeda.',
    technologies: ['Vue 3', 'Pinia', 'LiveKit', 'Firebase', 'Cloudflare Workers'],
    demoUrl: '', repositoryUrl: '', allowEmbed: false, featured: true,
    cover: '/images/projects/meetspace-concept.svg', coverLabel: 'Concept artwork — bukan screenshot aplikasi',
    role: 'Personal development project',
    context: 'Ruang meeting virtual sering memiliki antarmuka seragam, padahal aktivitas belajar dan hangout membutuhkan pengalaman berbeda.',
    challenge: 'Membuat fondasi meeting yang mendukung beberapa mode tanpa mengorbankan kejelasan navigasi dan alur bergabung.',
    approach: [
      'Memisahkan mode ruangan dan tema visual dari logika koneksi meeting.',
      'Menggunakan LiveKit untuk komunikasi real-time dan Vue/Pinia untuk status antarmuka.',
      'Merancang alur host, waiting room, dan akses peserta secara bertahap.',
    ],
    highlights: ['Multi-mode room concept', 'Host & waiting room flow', 'Real-time participant UI'],
    engineering: [
      { title: 'Frontend state', description: 'Pinia menjaga state room, tema, dan tampilan agar komponen UI tetap terpisah.' },
      { title: 'Real-time layer', description: 'LiveKit digunakan sebagai lapisan komunikasi, terpisah dari manajemen data aplikasi.' },
      { title: 'Access flow', description: 'Akses host dan peserta dipisahkan dengan pemeriksaan serta persetujuan sebelum masuk.' },
    ],
    outcome: 'Proyek masih dalam pengembangan. Tambahkan hasil pengujian dan metrik yang benar-benar telah diukur setelah tersedia.',
    learnings: ['Memisahkan fitur real-time dari UI dan state aplikasi.', 'Menyusun mode ruang tanpa menduplikasi keseluruhan halaman.'],
    gallery: [],
  },
  {
    slug: 'timedoor-battle-cards',
    name: 'Timedoor Battle Cards', kind: 'RFID-powered educational card game prototype', tag: 'Prototype',
    initials: 'TC', color: '#f6e2b9', summary: 'Prototipe kartu fisik RFID yang terhubung dengan arena pertarungan edukatif berbasis web.',
    technologies: ['ESP32', 'RC522 RFID', 'Web UI', 'JavaScript'],
    demoUrl: '', repositoryUrl: '', allowEmbed: false, featured: true,
    cover: '/images/projects/tbc-concept.svg', coverLabel: 'Concept artwork — bukan screenshot aplikasi',
    role: 'Prototype design & development',
    context: 'Menghubungkan interaksi kartu fisik dengan pengalaman permainan web yang bisa ditampilkan di layar publik.',
    challenge: 'Meneruskan identitas kartu yang dipindai perangkat RFID ke sistem permainan dan menyelaraskannya dengan status battle.',
    approach: [
      'Mendesain pembacaan UID menggunakan ESP32 dan modul RFID RC522.',
      'Memisahkan data kartu, event scan, dan aturan permainan web.',
      'Menyiapkan tampilan player serta arena publik sebagai dua konteks UI.',
    ],
    highlights: ['RFID card interaction', 'ESP32-to-web events', 'Player & public battle layouts'],
    engineering: [
      { title: 'Hardware input', description: 'ESP32 membaca UID kartu melalui RC522; konfigurasi perangkat divalidasi pada tahap prototipe.' },
      { title: 'Game state', description: 'Data kartu dan aksi permainan diatur terpisah supaya aturan bisa terus dikembangkan.' },
      { title: 'Two-screen UX', description: 'Informasi untuk pemain dan layar publik diprioritaskan secara berbeda.' },
    ],
    outcome: 'Status: prototipe. Hindari mengklaim uji lapangan atau hasil belajar sebelum ada bukti pengujian yang sesuai.',
    learnings: ['Integrasi perangkat keras dan antarmuka web.', 'Mendesain sistem yang bergantung pada event dunia nyata.'],
    gallery: [],
  },
  {
    slug: 'profitlens',
    name: 'ProfitLens', kind: 'Small-business profitability explorer', tag: 'Concept',
    initials: 'PL', color: '#dcf0d7', summary: 'Konsep aplikasi untuk membantu UMKM memahami laba setelah memperhitungkan berbagai komponen biaya.',
    technologies: ['Vue 3', 'TypeScript', 'Data modeling'],
    demoUrl: '', repositoryUrl: '', allowEmbed: false, featured: false,
    cover: '/images/projects/profitlens-concept.svg', coverLabel: 'Concept artwork — bukan screenshot aplikasi',
    role: 'Product concept & technical planning',
    context: 'Pemilik usaha kecil membutuhkan cara yang mudah untuk membedakan pemasukan, biaya, dan keuntungan bersih.',
    challenge: 'Mendesain alur pencatatan yang sederhana sekaligus transparan mengenai sumber perhitungan profit.',
    approach: [
      'Menentukan business rules untuk penjualan, pembelian, dan biaya operasional.',
      'Merancang model data sebelum membuat antarmuka dashboard.',
      'Mengutamakan angka yang dapat ditelusuri tanpa memerlukan AI.',
    ],
    highlights: ['Business rules', 'Database planning', 'Profit calculation concept'],
    engineering: [
      { title: 'Data accuracy', description: 'Perhitungan profit harus berasal dari transaksi dan biaya yang memiliki aturan jelas.' },
      { title: 'Explainability', description: 'Dashboard dirancang agar pengguna dapat melihat komponen yang membentuk hasil.' },
    ],
    outcome: 'Masih tahap konsep. Tidak ada klaim bahwa sistem sudah dipakai UMKM atau menghasilkan dampak bisnis.',
    learnings: ['Merancang kebutuhan produk sebelum menulis kode.', 'Memisahkan logika bisnis dari visualisasi dashboard.'],
    gallery: [],
  },
]

export const getProject = (slug: string) => projects.find(project => project.slug === slug)
