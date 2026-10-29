/**
 * Semua data pribadi ada di file ini supaya mudah diedit tanpa menyentuh Three.js.
 * Ganti placeholder dengan informasi yang sudah kamu verifikasi sendiri.
 */
export const owner = {
  name: 'Robert',
  role: 'Creative Developer & Digital Builder',
  location: 'Bali, Indonesia',
  photo: '/images/avatar-reference.webp', // Foto profil
  introPhoto: '', // Opsional: '/images/teaching-intro.webp' setelah mengunggah foto mengajar asli
  email: '', // Isi email milikmu; jika kosong tombol email akan disembunyikan.
  whatsapp: '', // Isi nomor internasional, misalnya '62812XXXXXXXX' (contoh, bukan nomor asli).
  githubUsername: '', // Contoh format: 'username' (tanpa github.com/)
  linkedin: '', // Masukkan URL asli; jangan gunakan tautan placeholder.
  cvUrl: '', // Opsional: '/cv.pdf' setelah menambahkan PDF asli ke public/cv.pdf
}


/** Landing introduction. Place an actual teaching photo in public/images/ if desired. */
export const welcomeSettings = {
  introDurationMs: 2900, // 2.9 seconds; reduce or increase to taste.
} as const

export type ChapterId = 'home' | 'about' | 'experience' | 'skills' | 'projects' | 'contact'
export type TravelMode = 'walk' | 'motorbike' | 'bus'

export interface Chapter {
  id: ChapterId
  number: string
  eyebrow: string
  title: string
  description: string
  caption: string
}

export const chapters: Chapter[] = [
  { id: 'home', number: '01', eyebrow: 'HELLO, EXPLORER!', title: 'Welcome to my little world.', description: 'A tiny city, a curious developer, and a collection of things I love to build. Scroll to follow my journey.', caption: 'The journey starts here' },
  { id: 'about', number: '02', eyebrow: 'THE PERSON BEHIND THE PIXELS', title: 'A little about me.', description: 'I enjoy turning complex ideas into useful, playful digital experiences. I explore software, education and creative technology.', caption: 'At the creative studio' },
  { id: 'experience', number: '03', eyebrow: 'MY JOURNEY SO FAR', title: 'Learning by doing.', description: 'Every experience has taught me something new, from leading and mentoring to building digital experiences.', caption: 'A stop along the career path' },
  { id: 'skills', number: '04', eyebrow: 'TOOLS OF THE TRADE', title: 'Things I work with.', description: 'From frontend experiences to APIs and hardware experiments, these are some of the tools I use and continue exploring.', caption: 'Exploring the tech district' },
  { id: 'projects', number: '05', eyebrow: 'IDEAS TURNED INTO EXPERIENCES', title: 'A few things I’m building.', description: 'A collection of experiments and prototypes. Each one started with a question: what if we could make this better?', caption: 'Next stop: project street' },
  { id: 'contact', number: '06', eyebrow: 'END OF THE ROAD, START OF A CONVERSATION', title: 'Let’s make something.', description: 'Thank you for visiting my little corner of the internet. Have an idea or opportunity? Let’s connect.', caption: 'A little coffee at the finish line' },
]

/**
 * Lima legs = enam chapter. Jenis kendaraan berlaku sejak AWAL leg.
 * Ubah urutannya, maka label HTML dan objek Three.js akan otomatis sinkron.
 */
export const routes: TravelMode[] = ['walk', 'walk', 'motorbike', 'bus', 'walk']

export const experiences = [
  {
    role: 'Teacher Leader',
    company: 'Timedoor Academy',
    period: 'Isi periode',
    description: 'Pendidikan teknologi, kolaborasi tim pengajar, dan pengembangan pengalaman belajar.',
  },
  // Duplikat objek ini jika ingin menambahkan pengalaman kerja lain.
]

export const skills = [
  { label: 'Vue 3', group: 'Frontend' },
  { label: 'Nuxt', group: 'Frontend' },
  { label: 'JavaScript', group: 'Frontend' },
  { label: 'Firebase', group: 'Backend' },
  { label: 'Cloudflare Workers', group: 'Backend' },
  { label: 'Three.js', group: 'Learning' },
]

export { projects, getProject, type PortfolioProject } from '~/data/projects'

/**
 * PERSONALISASI KARAKTER (tidak perlu Blender).
 * Warna bisa diganti dengan kode HEX; detail bentuknya ada di world/createChibiAvatar.ts.
 */
export const avatarStyle = {
  headScale: 1.35, // besar kepala; 1.15-1.48 disarankan
  hairSweep: 0.20, // arah rambut belah tengah (radian)
  eyebrowTilt: 0.07, // kemiringan alis (radian)
  hoodie: '#4f785f',
  hoodShadow: '#385f4b',
  trim: '#365b48',
  skin: '#d9a384',
  shoes: '#f5efe3',
  trousers: '#54677c',
  hair: '#1a1b20',
  hairAccent: '#313038',
  eyebrows: '#252228',
  irises: '#2b2421',
  lips: '#b47e77',
} as const


/** Repo pilihan yang ingin kamu tonjolkan. Harus cocok persis dengan nama repo publik.
 * Jika array kosong, GitHub API akan menampilkan repo publik terbaru. */
export const githubFeaturedRepositories: string[] = []

/** Tambahkan pengalaman yang sudah diverifikasi. Field period boleh kosong saat draf. */
export const education: { institution: string; program: string; period: string; detail: string }[] = []
