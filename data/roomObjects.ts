import type { ChapterId } from '~/data/portfolio'

/** Metadata for clickable 3D props. Position is local to the room center. */
export interface RoomObject {
  id: string
  chapter: ChapterId
  label: string
  description: string
  position: [number, number, number]
  kind: 'portrait' | 'computer' | 'book' | 'career' | 'resume' | 'skills' | 'github' | 'project' | 'contact' | 'welcome'
  projectSlug?: string
}

export const roomObjects: RoomObject[] = [
  { id:'welcome', chapter:'home', kind:'welcome', label:'Welcome board', description:'Your guide to My Little World.', position:[0,1.65,-2.48] },
  { id:'studio-map', chapter:'home', kind:'book', label:'Journey notebook', description:'Learn how the miniature portfolio works.', position:[-1.0,1.16,-1.0] },
  { id:'portrait', chapter:'about', kind:'portrait', label:'All About Me', description:'Discover the person behind the pixels.', position:[-1.8,1.83,-2.35] },
  { id:'laptop', chapter:'about', kind:'computer', label:'Creative workspace', description:'The process behind my work.', position:[-.55,1.23,-.78] },
  { id:'career', chapter:'experience', kind:'career', label:'Career timeline', description:'Experience and education.', position:[-1.65,2.18,-2.39] },
  { id:'resume', chapter:'experience', kind:'resume', label:'My resume', description:'Preview my CV inside the room, then open or save a printable copy.', position:[1.75,1.85,-2.32] },
  { id:'tech', chapter:'skills', kind:'skills', label:'Technology rack', description:'Tools and technical skills.', position:[2.4,1.55,-1.48] },
  { id:'github', chapter:'skills', kind:'github', label:'GitHub terminal', description:'My highlighted repositories.', position:[-1.75,1.55,-.40] },
  { id:'meetspace', chapter:'projects', kind:'project', projectSlug:'meetspace', label:'MeetSpace', description:'Explore the real-time meeting project.', position:[-2.2,1.85,.7] },
  { id:'timedoor-battle-cards', chapter:'projects', kind:'project', projectSlug:'timedoor-battle-cards', label:'Timedoor Battle Cards', description:'RFID-enabled interactive card game.', position:[0,1.85,.7] },
  { id:'profitlens', chapter:'projects', kind:'project', projectSlug:'profitlens', label:'ProfitLens', description:'A finance companion concept for small businesses.', position:[2.2,1.85,.7] },
  { id:'email', chapter:'contact', kind:'contact', label:'Message desk', description:'Contact and collaboration options.', position:[-2.05,1.70,-1.29] },
  { id:'social', chapter:'contact', kind:'github', label:'Social links', description:'Find me online.', position:[1.73,1.64,-.81] },
]

export const roomObjectsFor = (chapter: ChapterId) => roomObjects.filter(item => item.chapter === chapter)
export const getRoomObject = (chapter: ChapterId, id: string) => roomObjects.find(item => item.chapter === chapter && item.id === id)
