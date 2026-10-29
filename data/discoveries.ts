import type { ChapterId } from './portfolio'

/** Six optional discoveries. The stories are intentionally editorial, not invented achievements. */
export interface Discovery {
  id: ChapterId
  icon: string
  object: string
  title: string
  teaser: string
  message: string
  accent: string
}
export const discoveries: Discovery[] = [
  { id: 'home', icon: '✦', object: 'Star token', title: 'The first spark', teaser: 'A tiny star near home', message: 'Every ambitious build starts with a small question. This is your invitation to explore a world of experiments.', accent: '#d6aa67' },
  { id: 'about', icon: '✎', object: 'Sketchbook', title: 'From curiosity to ideas', teaser: 'A sketchbook by the studio', message: 'The best way to learn is to sketch an idea, test it, and keep improving. Enter the studio to read the story behind the builder.', accent: '#cf987e' },
  { id: 'experience', icon: '★', object: 'Trophy', title: 'Learning through practice', teaser: 'A trophy by the career hub', message: 'Every project and collaboration is an opportunity to grow. Visit Experience for the verified milestones and responsibilities.', accent: '#c8a06a' },
  { id: 'skills', icon: '{ }', object: 'Code terminal', title: 'Tools are only the beginning', teaser: 'A glowing terminal in the tech district', message: 'Frameworks change; problem-solving stays. Open Skills for the actual technologies and public GitHub repositories.', accent: '#7ca49e' },
  { id: 'projects', icon: '◇', object: 'Prototype cube', title: 'Ideas into prototypes', teaser: 'A mysterious cube outside the gallery', message: 'Behind every project is a problem to solve. Step into Projects to explore decisions, case studies and live demos when available.', accent: '#b09cc7' },
  { id: 'contact', icon: '☕', object: 'Coffee cup', title: 'The next conversation', teaser: 'A cup beside the café', message: 'The journey does not end with the last building. New collaborations can begin with a simple conversation.', accent: '#b88b6c' },
]
export const discoveryById = Object.fromEntries(discoveries.map(item => [item.id, item])) as Record<ChapterId, Discovery>
