import type { ChapterId } from '~/data/portfolio'

/** Metadata gedung; jangan simpan DOM atau status animasi di sini. */
export const rooms: Record<ChapterId, { title: string; label: string; hint: string; symbol: string }> = {
  home: { title: 'Welcome Home', label: 'Home Cabin', hint: 'Awali perjalananmu dari rumah kecil ini.', symbol: '⌂' },
  about: { title: 'Inside the Studio', label: 'Creative Studio', hint: 'Temukan cerita singkat dan foto profil di studio kerja.', symbol: '✦' },
  experience: { title: 'Career Hall', label: 'Experience Hub', hint: 'Lihat perjalanan pengalaman kerja dan pendidikan.', symbol: '▤' },
  skills: { title: 'Technology Lab', label: 'Skills Lab', hint: 'Pelajari teknologi yang digunakan dan repository publik.', symbol: '⌘' },
  projects: { title: 'Project Exhibition', label: 'Project Gallery', hint: 'Pilih proyek untuk melihat preview, studi kasus, atau demo.', symbol: '▣' },
  contact: { title: 'Coffee & Connect', label: 'Contact Café', hint: 'Buka kontak dan terhubung untuk kolaborasi.', symbol: '☕' },
}
