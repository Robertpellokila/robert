import * as THREE from 'three'
import type { ChapterId } from '~/data/portfolio'
import { createWavingBarista } from '~/world/createWavingBarista'

/**
 * v0.8.5 | Six custom interiors, inspired by the user's six images.
 * All room coordinates are LOCAL and the entrance is at positive Z.
 * The front-middle zone (|x| < .7, z > .55) stays open for walking.
 * This is a lightweight stylized approximation, not the original image's 3D source.
 */
type Parent = THREE.Object3D
const P = {
  cream:'#F4E9D3', walls:'#F6EEDC', walnut:'#9A6040', oak:'#C98C55',
  paleOak:'#E2B789', moss:'#6D9969', mint:'#98C6A6', dark:'#263334',
  brass:'#DFB86C', gold:'#F3CB86', leaf:'#4C8966', screen:'#65C9A6',
}
function material(color:string, emissive?:string) {
  return new THREE.MeshStandardMaterial({color,roughness:.78,metalness:.04,
    ...(emissive?{emissive,emissiveIntensity:.55}:{})})
}
function cube(p:Parent,w:number,h:number,d:number,c:string,x:number,y:number,z:number) {
  const obj=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(c))
  obj.position.set(x,y,z);obj.castShadow=true;obj.receiveShadow=true;p.add(obj);return obj
}
function sphere(p:Parent,r:number,c:string,x:number,y:number,z:number, detail=1) {
  const obj=new THREE.Mesh(new THREE.IcosahedronGeometry(r,detail),material(c))
  obj.position.set(x,y,z);obj.castShadow=true;p.add(obj);return obj
}
function cyl(p:Parent,r:number,h:number,c:string,x:number,y:number,z:number,n=12) {
  const obj=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,n),material(c))
  obj.position.set(x,y,z);obj.castShadow=true;p.add(obj);return obj
}
function glowing(p:Parent,w:number,h:number,d:number,c:string,x:number,y:number,z:number) {
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.85,roughness:.7}))
  m.position.set(x,y,z);p.add(m);return m
}
function woodFloor(p:Parent,color='#C58E64') {
  // Distinct floor planks make the space feel like a miniature rather than one rectangle.
  for(let i=0;i<11;i++) cube(p,6.35,.025,.465,i%3===0?'#DDB388':color,0,.035,-2.32+i*.47)
  for(let i=0;i<7;i++) cube(p,.012,.028,5.05,'#AD7553',-2.66+i*.89,.054,0)
}
function trim(p:Parent,c=P.oak) {
  for(const x of [-3.06,3.06]) cube(p,.18,3.06,.16,c,x,1.55,-2.54)
  cube(p,6.4,.15,.24,c,0,3.04,-2.52)
  for(const x of [-2.96,2.96]) cube(p,.17,.20,5.22,c,x,3.04,.04)
}
function windowBack(p:Parent,x:number,width=1.7) {
  glowing(p,width,1.75,.046,'#F8E9A7',x,1.72,-2.61)
  for(const dx of [-width/2,0,width/2]) cube(p,.085,1.86,.09,P.oak,x+dx,1.73,-2.54)
  for(const y of [.87,1.72,2.60]) cube(p,width+.16,.075,.1,P.oak,x,y,-2.54)
  cube(p,width+.35,.12,.32,P.oak,x,.79,-2.40)
}
function curtains(p:Parent,x:number,width=1.8,c='#83B49D') {
  for(let side of [-1,1]){
    for(let k=0;k<3;k++){
      const fold=cube(p,.16,1.8,.18,k%2===0?c:'#609984',x+side*(width*.48+k*.10),1.76,-2.32)
      fold.rotation.z=side*.025
    }
  }
  cyl(p,.055,2.6,P.walnut,x,2.8,-2.30).rotation.z=Math.PI/2
}
function plant(p:Parent,x:number,z:number,s=1,hanging=false) {
  const root=new THREE.Group();root.position.set(x,hanging?2.5:0,z);root.scale.setScalar(s);p.add(root)
  cyl(root,.25,.42,'#BF865C',0,hanging?-.15:.23,0)
  if(!hanging){cyl(root,.09,.55,'#57794A',0,.63,0)}
  for(let i=0;i<7;i++){
    const a=i*2.399
    const rr=.25+(i%3)*.12
    const leaf=sphere(root,.20+(i%3)*.045,i%3===0?'#8FBE81':'#568F65',Math.cos(a)*rr,hanging?-.55-(i%3)*.16:.92+(i%3)*.16,Math.sin(a)*rr,1)
    leaf.scale.y=.75
  }
}
function lamp(p:Parent,x:number,z:number,h=2.6) {
  cyl(p,.045,h-1.1,P.brass,x,(h+1.1)/2,z)
  cyl(p,.21,.08,P.oak,x,1.1,z)
  const glow=sphere(p,.19,'#F7D28C',x,h,z,1)
  ;(glow.material as THREE.MeshStandardMaterial).emissive=new THREE.Color('#F7BF76')
  ;(glow.material as THREE.MeshStandardMaterial).emissiveIntensity=1.2
}
function pendant(p:Parent,x:number,z:number) {
  cyl(p,.035,.47,'#6F513A',x,2.72,z)
  cyl(p,.30,.16,P.oak,x,2.42,z)
  sphere(p,.16,'#FBE1A2',x,2.31,z,1)
}
function books(p:Parent,x:number,y:number,z:number,n=7) {
  for(let i=0;i<n;i++){
    const h=.31+((i*7)%4)*.065
    cube(p,.12,h,.28,['#6C9569','#E0B789','#C6B29A','#A36B50','#8AAB93'][i%5]!,x+i*.145,y+h/2,z)
  }
}
function shelf(p:Parent,x:number,z:number,w=1.3,h=2.1) {
  for(const dx of [-w/2,w/2]) cube(p,.095,h,.43,P.walnut,x+dx,h/2,z)
  for(let k=0;k<4;k++) cube(p,w+.10,.08,.53,P.oak,x,.32+k*.55,z)
  books(p,x-w*.41,.95,z,6)
  books(p,x-w*.41,1.50,z,5)
  plant(p,x+w*.30,z,.45)
}
function desk(p:Parent,x:number,z:number,w=1.8) {
  cube(p,w,.12,.78,P.paleOak,x,1.0,z)
  for(const dx of [-w*.42,w*.42]) for(const dz of [-.3,.3]) cube(p,.075,.92,.07,P.walnut,x+dx,.53,z+dz)
}
function screenArt(p:Parent,x:number,y:number,z:number,variant:'code'|'dashboard'|'portrait'='code') {
  if(typeof document==='undefined') return
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=640
  const ctx=canvas.getContext('2d');if(!ctx) return
  ctx.fillStyle=variant==='dashboard' ? '#112126' : '#11231d';ctx.fillRect(0,0,canvas.width,canvas.height)
  if(variant==='code'){
    const colors=['#88f1b7','#7ad9ff','#ffd37f','#9fc1ff','#74e0ab']
    for(let i=0;i<12;i++){
      ctx.fillStyle=colors[i%colors.length]!
      ctx.fillRect(72,72+i*40, 640-(i%4)*110, 12)
      ctx.fillStyle='#365a54'; ctx.fillRect(72,90+i*40, 300+(i%3)*120, 8)
    }
    ctx.fillStyle='#1f6f5d'; ctx.fillRect(710,96,210,390)
    ctx.fillStyle='#9ce8ba'; ctx.fillRect(734,130,160,10)
    ctx.fillStyle='#79b7ff'; ctx.fillRect(734,165,132,10)
  } else if(variant==='dashboard'){
    ctx.fillStyle='#153d46'; ctx.fillRect(58,70,300,160)
    ctx.fillStyle='#1f2d54'; ctx.fillRect(392,70,280,160)
    ctx.fillStyle='#213232'; ctx.fillRect(706,70,260,160)
    ctx.fillStyle='#86f69b'; ctx.fillRect(92,194,228,12)
    ctx.fillStyle='#7ad9ff'; ctx.fillRect(430,194,210,12)
    ctx.fillStyle='#ffd37f'; ctx.fillRect(736,194,180,12)
    for(let i=0;i<5;i++){
      ctx.fillStyle=['#86f69b','#7ad9ff','#ffd37f'][i%3]!
      ctx.fillRect(90+i*46,355-i*18,26,120+i*18)
    }
    ctx.strokeStyle='#7ad9ff'; ctx.lineWidth=6
    ctx.beginPath(); ctx.moveTo(420,420); ctx.lineTo(470,360); ctx.lineTo(530,392); ctx.lineTo(590,300); ctx.lineTo(650,332); ctx.stroke()
  } else {
    ctx.fillStyle='#f7f3e8'; ctx.fillRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle='#c83a2b'; ctx.fillRect(0,0,canvas.width,canvas.height)
  }
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(.74,.44),new THREE.MeshBasicMaterial({map:tex,transparent:false}))
  plane.position.set(x,y,z+.072)
  p.add(plane)
}
function monitor(p:Parent,x:number,z:number,screen='#86BFB5',variant:'code'|'dashboard'='code',objectId='') {
  const display=cube(p,.95,.65,.10,P.dark,x,1.51,z)
  if(objectId) display.userData.interactiveObjectId=objectId
  glowing(p,.81,.51,.018,screen,x,1.51,z+.062)
  screenArt(p,x,1.51,z,variant)
  cube(p,.08,.30,.08,'#4D5A53',x,1.14,z)
  cube(p,.40,.035,.23,P.dark,x,1.03,z)
}
function chair(p:Parent,x:number,z:number,green=true,rotation=0) {
  const root=new THREE.Group();root.position.set(x,0,z);root.rotation.y=rotation;p.add(root)
  cube(root,.58,.14,.55,green?'#729079':'#C69B76',0,.58,0)
  cube(root,.58,.78,.14,green?'#729079':'#C69B76',0,.99,-.24)
  cyl(root,.07,.41,'#625C50',0,.31,0)
  cyl(root,.35,.055,'#625C50',0,.085,0,6)
  return root
}
function picture(p:Parent,x:number,y:number,z:number,w=1.0,h=.72) {
  cube(p,w+.13,h+.13,.075,P.walnut,x,y,z)
  glowing(p,w,h,.013,'#88AC8F',x,y,z+.058)
  cube(p,w*.68,.12,.02,'#D3C59A',x,y-.12,z+.074)
  sphere(p,.13,'#D8AA68',x-.2,y+.07,z+.09,0)
}
function rug(p:Parent,x:number,z:number,w:number,d:number,c='#D3C0A3') {
  cube(p,w,.035,d,c,x,.075,z)
  cube(p,w-.14,.009,d-.15,'#EDE1CD',x,.098,z)
}
function miniLaptop(p:Parent,x:number,y:number,z:number) {
  cube(p,.47,.035,.30,P.dark,x,y,z)
  const screen=cube(p,.47,.36,.035,'#35483C',x,y+.17,z-.17)
  screen.rotation.x=-.12
  glowing(p,.37,.27,.01,'#78BBA5',x,y+.17,z-.142)
}
function banner(p:Parent,text:string,x:number,y:number,z:number,w=1.9,h=.52) {
  // Label drawn on a GPU CanvasTexture, legible in the first-person view.
  if(typeof document==='undefined') return
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256
  const ctx=canvas.getContext('2d');if(!ctx)return
  ctx.fillStyle='#FAF6ED';ctx.fillRect(0,0,1024,256)
  ctx.fillStyle='#325945';ctx.font='bold 75px system-ui, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle'
  ctx.fillText(text,512,125,950)
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}))
  mesh.position.set(x,y,z);p.add(mesh)
}
function home(p:Parent){
  woodFloor(p);trim(p);windowBack(p,1.85,1.55);curtains(p,1.85,1.45)
  desk(p,-.30,-1.12,1.7);monitor(p,-.30,-1.28);keyboard(p,-.30,1.10,-.84)
  chair(p,.35,-.35);shelf(p,-2.35,-1.48,1.06,2.24)
  picture(p,-1.40,2.0,-2.48,1.03,.71)
  plant(p,-2.65,1.2,.84);plant(p,2.5,-1.1,.7);plant(p,-.1,-2.2,.48,true)
  lamp(p,-1.55,.98,2.3);pendant(p,1.1,.3);rug(p,1.25,1.10,2.1,1.28)
  // Relaxing chair + book corner near entrance; the middle route stays unobstructed.
  chair(p,1.55,1.0,false);cube(p,.58,.06,.55,P.oak,2.55,.64,1.1);cyl(p,.07,.56,P.walnut,2.55,.33,1.1)
  cyl(p,.16,.18,'#E8D4A5',2.55,.78,1.1)
  books(p,-.85,1.10,-.78,4)
  cube(p,.20,.28,.20,'#D6A470',.30,1.19,-.84) // pen stand
  sphere(p,.12,'#B8CF9D',-.80,2.66,-2.3,2) // small shelf decor
  cube(p,1.18,.05,.52,'#A77C53',-2.38,2.54,-1.45) // top bookshelf ledge
  for(let i=0;i<6;i++) sphere(p,.07,i%2?'#FFD0A3':'#C3E8B1',-2.4,1.7+i*.13,-1.12,.0)
  banner(p,'MY LITTLE WORLD',0,2.82,-2.42,2.0,.25)
}
function seatedCreator(p:Parent,x:number,z:number){
  return seatedWorker(p,x,z,'#B45C79','#392E2A',Math.PI)
}
function seatedWorker(p:Parent,x:number,z:number,body='#B45C79',hairColor='#392E2A',rotation=0){
  // Face -Z (toward the computer). Rotation 0 keeps the visitor behind the worker.
  // Bent knees and forward-reaching arms make this a sitting / typing pose,
  // instead of a standing mannequin intersecting the chair.
  const root=new THREE.Group();root.position.set(x,0,z);root.rotation.y=rotation;p.add(root)
  cube(root,.40,.63,.34,body,0,1.00,0)
  sphere(root,.23,'#DBAA8D',0,1.51,-.035,2)
  sphere(root,.245,hairColor,0,1.65,-.095,2)
  for(const dx of [-.17,.17]){
    const sleeve=cube(root,.14,.35,.15,body,dx,1.11,-.19);sleeve.rotation.x=-.72
    sphere(root,.076,'#DBAA8D',dx,.99,-.40,1)
    cube(root,.165,.17,.38,'#5D534F',dx,.59,-.25)
    cube(root,.14,.35,.15,'#5D534F',dx,.38,-.44)
    cube(root,.17,.085,.28,'#F4EFDF',dx,.12,-.50)
  }
  return root
}
function keyboard(p:Parent,x:number,y:number,z:number){
  cube(p,.61,.035,.21,'#E9E7DE',x,y,z)
  for(let r=0;r<3;r++)for(let c=0;c<10;c++){
    cube(p,.042,.012,.038,r%2===0?'#A9B9A9':'#8CA59A',x-.25+c*.055,y+.025,z-.064+r*.055)
  }
}
function about(p:Parent){
  woodFloor(p,'#E1C09B');trim(p,'#CFAB87');windowBack(p,2.0,1.88)
  // Move the portrait slightly left and keep the tree away so the face is not hidden.
  desk(p,.65,-1.05,2.0);monitor(p,.68,-1.22,'#C0D8CD','code','laptop');chair(p,.68,-.37,true,Math.PI)
  seatedWorker(p,.68,-.37,'#5F8B6E','#1D2024',0)
  keyboard(p,.68,1.10,-.66)
  // Real portrait frame is created in createInteriors.ts: no decorative mesh over it.
  // Sticky-note pinboard with a few colored paper cards.
  cube(p,1.65,.78,.09,'#D3BB9E',.62,2.49,-2.52)
  for(let i=0;i<9;i++) cube(p,.31,.27,.016,['#E1BAA1','#A8CBA4','#ECD39B','#D6C6AA'][i%4]!, .15+i%3*.47,2.70-Math.floor(i/3)*.23,-2.44)
  miniLaptop(p,-.55,1.12,-.78)
  // Keep the left wall and portrait fully unobstructed from first-person view.
  // The previous foreground tree (-2.83, -1.52) overlapped the real portrait.
  // Use one small plant in the right-hand corner, away from the framed photo.
  plant(p,2.56,1.22,.42)
  cyl(p,.16,.2,P.cream,1.35,1.17,-.68)
  books(p,1.22,1.09,-.78,4)
  rug(p,.22,1.05,1.75,.94,'#D5DDC9')
  banner(p,'ABOUT ME',0,2.87,-2.42,1.18,.25)
}
function experience(p:Parent){
  woodFloor(p,'#D4B28E');trim(p,'#BF9873');windowBack(p,2.2,1.28)
  desk(p,-.18,-1.05,1.72);monitor(p,-.18,-1.23,'#B7C8BA','dashboard');chair(p,.18,-.25,true,Math.PI)
  seatedWorker(p,.18,-.25,'#C7869F','#4A3A33',0)
  keyboard(p,-.18,1.10,-.72)
  miniLaptop(p,-.57,1.10,-.75)
  // Large work process wall, like the reference, with multiple colored notes.
  const careerBoard=cube(p,2.05,1.18,.12,'#B9AA91',-1.65,2.18,-2.55)
  careerBoard.userData.interactiveObjectId='career'
  for(let i=0;i<12;i++) cube(p,.29,.23,.012,['#E8D69D','#E6B9B0','#ABCEA9','#B7CDD2'][i%4]!, -2.38+i%4*.47,2.45-Math.floor(i/4)*.33,-2.45)
  shelf(p,2.62,.18,.80,1.65);plant(p,-2.62,.8,.82)
  rug(p,-.7,.95,1.6,1.02,'#D8D9C5')
  // Physical CV poster is inserted by createInteriors.ts; reserve wall at right.
  banner(p,'CAREER JOURNEY',0,2.89,-2.40,1.95,.24)
}
function rack(p:Parent,x:number,z:number){
  cube(p,.95,2.30,.56,'#1E292A',x,1.26,z)
  for(let i=0;i<6;i++){
    cube(p,.78,.20,.036,'#354346',x,.46+i*.31,z+.298)
    for(let j=0;j<3;j++) glowing(p,.035,.035,.018,j%2?'#78E38B':'#64ACF5',x-.23+j*.2,.46+i*.31,z+.325)
  }
}
function skills(p:Parent){
  // Dark command center: graphite floor, green light strips and display walls.
  cube(p,6.32,.055,5.26,'#313B3B',0,.04,0)
  cube(p,6.34,3.01,.045,'#E6ECE9',0,1.53,-2.63)
  for(let i=0;i<6;i++) glowing(p,.68,.085,.04,'#84E36C',-2.42+i*.97,2.85,-2.45)
  cube(p,3.35,.13,.25,'#172C28',-.84,2.68,-2.45)
  rack(p,2.42,-1.85);rack(p,1.32,-1.85)
  // A wall-wide dashboard with screens of varied proportions.
  for(let i=0;i<5;i++){
    const x=-2.62+i*.76
    cube(p,.7,.7,.07,P.dark,x,2.12,-2.47)
    glowing(p,.6,.56,.018,['#335B57','#4A7065','#34566E'][i%3]!,x,2.12,-2.42)
    glowing(p,.4,.032,.022,'#75D0A1',x,1.98,-2.39)
  }
  for(let i=0;i<2;i++){
    const x=-1.75+i*1.68
    desk(p,x,-.46,1.50);monitor(p,x,-.54,'#4BAF8A','dashboard',i===0?'github':'tech');keyboard(p,x,1.10,-.19);chair(p,x,.45,true,Math.PI)
  }
  // An interaction-friendly clear aisle at center/front.
  cube(p,4.8,.055,.08,'#69CD88',0,.055,1.68)
  banner(p,'TECH CONTROL',0,2.91,-2.4,1.76,.24)
}
function projects(p:Parent){
  // Museum-gallery exhibit tables across the walls; central walking aisle stays open.
  cube(p,6.32,.042,5.24,'#EEE6D7',0,.038,0)
  trim(p,'#BB9F7F')
  for(let i=0;i<3;i++){
    const x=-2.15+i*2.15
    cube(p,1.70,.80,.75,'#B78D68',x,.49,-.58)
    cube(p,1.58,.065,.82,'#E0C4A2',x,.93,-.58)
    cube(p,.92,.06,.55,['#9FC6BA','#D9B894','#9EB1D1'][i]!,x,.98,-.58)
    // Museum labels near the existing clickable physical posters.
    banner(p,['MEETSPACE','BATTLE CARDS','PROFITLENS'][i]!,x,2.81,-2.42,1.72,.28)
  }
  // Back-wall framed concept displays and directed museum lighting.
  for(let i=0;i<3;i++) {
    const px=-2.15+i*2.15
    cube(p,1.53,.92,.07,'#A38463',px,1.94,-2.48)
    glowing(p,1.38,.76,.012,['#A6CBC3','#E7C39D','#B7C9DA'][i]!,px,1.94,-2.42)
    cyl(p,.10,.06,'#D6B788',px,2.75,-2.26)
  }
  // Side gallery frames and small museum displays.
  for(const x of [-2.5,2.5]){
    cube(p,.8,1.27,.75,'#C5A485',x,.76,1.15)
    cube(p,.65,.04,.55,'#F4E5CC',x,1.41,1.15)
  }
  for(let i=0;i<4;i++) glowing(p,.11,.07,.045,'#FFF0CE',-2.1+i*1.37,2.92,-2.37)
  banner(p,'PROJECT EXHIBITION',0,3.00,-2.44,2.44,.24)
}
function cup(p:Parent,x:number,y:number,z:number){
  cyl(p,.11,.22,'#FAE6CE',x,y,z)
  cyl(p,.045,.018,'#6B3B22',x,y+.12,z)
}
function cafeMachine(p:Parent,x:number,z:number){
  cube(p,.88,.76,.45,'#D9D8CF',x,1.52,z)
  cube(p,.68,.36,.035,'#84989A',x,1.64,z+.24)
  for(const xx of [-.23,.22]) cyl(p,.065,.12,'#FAEFE1',x+xx,1.17,z+.32)
}
function pastry(p:Parent,x:number,y:number,z:number){
  cyl(p,.23,.13,'#D6A16B',x,y,z)
  sphere(p,.19,'#F4D4A4',x,y+.13,z,1)
  sphere(p,.045,'#D7896F',x,y+.29,z,0)
}
function contact(p:Parent){
  // Reference 6: warm terracotta coffee + pastry shop with hanging greenery.
  woodFloor(p,'#D59D65');trim(p,'#A7663E');windowBack(p,2.06,1.56)
  plant(p,-2.63,-1.95,.62,true);plant(p,2.67,-1.90,.60,true)
  plant(p,-2.67,1.00,.82);plant(p,2.62,1.0,.7)
  // L-shaped counter and pastry display against back wall. Leave near-center open.
  const contactCounter=cube(p,3.35,1.0,.70,'#B77645',-.92,.57,-1.66)
  contactCounter.userData.interactiveObjectId='email'
  cube(p,3.55,.10,.85,'#E2B27E',-.92,1.10,-1.66)
  // Café host: standing behind the counter, visible from the entrance.
  createWavingBarista(p, -.73, -2.15)
  cafeMachine(p,-2.05,-1.62)
  cup(p,-1.05,1.25,-1.42);cup(p,-.66,1.25,-1.42)
  cube(p,1.55,1.0,.8,'#AA6C42',1.73,.55,-.88)
  cube(p,1.65,.09,.96,'#DFAE78',1.73,1.09,-.88)
  // Glass pastry display case.
  cube(p,1.54,.45,.56,'#DCE4D5',1.73,1.40,-1.04)
  for(let i=0;i<3;i++) pastry(p,1.18+i*.52,1.67,-1.0)
  // Coffee corner front-right: circular table and two lightweight chairs.
  cyl(p,.55,.09,'#B87549',1.76,.80,1.25)
  cyl(p,.095,.75,'#91613F',1.76,.42,1.25)
  for(const z of [.55,1.9]) chair(p,2.62,z,false)
  for(let i=0;i<5;i++) cube(p,.49,.07,.52,P.oak,-2.4+i*.47,2.40,-2.38)
  books(p,-2.23,2.49,-2.22,5)
  pendant(p,-.15,.45);pendant(p,1.82,.17)
  // Miniature cafe details: mugs, stacked jars, menu and pastry trays.
  for(let i=0;i<4;i++) cup(p,-1.82+i*.37,1.28,-1.34)
  for(let i=0;i<5;i++) pastry(p,1.19+i*.25,1.15,-.72)
  cube(p,1.25,.77,.07,'#91653E',-1.18,2.10,-2.48)
  cube(p,1.14,.65,.018,'#F5EBDD',-1.18,2.10,-2.42)
  plant(p,-.60,-2.23,.38,true)
  // Framed contact information is tied to the clickable objects in roomObjects.
  banner(p,'COFFEE & CONNECT',.02,2.91,-2.42,2.58,.3)
}
export function decorateRoom(group:THREE.Group,chapter:ChapterId){
  switch(chapter){
    case 'home':home(group);break
    case 'about':about(group);break
    case 'experience':experience(group);break
    case 'skills':skills(group);break
    case 'projects':projects(group);break
    case 'contact':contact(group);break
  }
}
