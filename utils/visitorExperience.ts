import { chapters, type ChapterId } from '~/data/portfolio'

/** Pure functions: easy to test without Vue, browser or WebGL. */
export function validDiscoveryIds(input: unknown): ChapterId[] {
  if (!Array.isArray(input)) return []
  const allowed = new Set(chapters.map(c => c.id))
  return [...new Set(input.filter((id): id is ChapterId => typeof id === 'string' && allowed.has(id as ChapterId)))]
}
export function chapterAt(index: number): ChapterId {
  const safe = Number.isFinite(index) ? Math.max(0, Math.min(chapters.length - 1, Math.floor(index))) : 0
  return chapters[safe]!.id
}
export function journeyDialogue(phase: string, currentId: ChapterId, mode: string): string {
  if (phase === 'arrive') {
    const messages: Record<ChapterId, string> = {
      home: 'Welcome! The city is yours to explore.',
      about: 'This is my studio. Want to see inside?',
      experience: 'Every milestone tells a story.',
      skills: 'The tech district is full of tools and ideas.',
      projects: 'The gallery is open. Come explore a build!',
      contact: 'Fancy a coffee and a conversation?',
    }
    return messages[currentId]
  }
  if (phase === 'mount') return mode === 'bus' ? 'All aboard! Next stop: the project gallery.' : 'Helmet on. Ready for the next stop.'
  if (phase === 'dismount') return 'Almost there. Just one more step!'
  if (mode === 'bus') return 'Riding through my miniature world…'
  if (mode === 'motorbike') return 'Taking the scenic route…'
  return 'Follow the path to the next chapter.'
}
