const fs=require('node:fs')
const path=require('node:path')
const assert=require('node:assert/strict')
const vm=require('node:vm')
const ts=require('typescript')
const root=path.resolve(__dirname,'..')
const read=p=>fs.readFileSync(path.join(root,p),'utf8')
const page=read('pages/index.vue')
const lite=read('components/LitePortfolio.vue')
const component=read('components/PortfolioEntryOverlay.vue')
let count=0
function test(label, action){action();count++;console.log('✔',label)}

test('welcome uses client-only Teleport separate from normal page',()=>{
 assert.match(page,/<ClientOnly>\s*<Teleport to="body">\s*<PortfolioEntryOverlay/)
 assert.match(page,/<PortfolioEntryOverlay v-if="showWelcomeSplash"/)
 assert.match(component,/stage === 'intro'/)
 assert.match(component,/stage === 'choose'/)
})
test('welcome state survives internal navigation without replaying during mode switch',()=>{
 assert.match(page,/welcomeCompleted = useState<boolean>\('mlw-welcome-completed', \(\) => false\)/)
 assert.match(page,/showWelcomeSplash = computed\(\(\) => !welcomeCompleted.value\)/)
 assert.match(page,/function changeExperience[\s\S]*?welcomeCompleted.value = true/)
 assert.match(page,/if \(!welcomeCompleted.value\) startIntro\(\)/)
})
test('Lite Explore 3D is direct, not a mode dialog',()=>{
 assert.match(lite,/@click="emit\('switch3d'\)"/)
 assert.match(page,/@switch3d="goDirectlyTo3D"/)
 assert.match(page,/function goDirectlyTo3D\(\) \{[\s\S]*changeExperience\('3d'\)/)
})
test('visitor may replay intro only via explicit action',()=>{
 assert.match(lite,/@click="emit\('replayWelcome'\)"/)
 assert.match(page,/function replayWelcome\(\) \{[\s\S]*welcomeCompleted.value = false/)
})
test('changeExperience marks welcomed even when mode already active',()=>{
 const code=page.slice(page.indexOf('function changeExperience'),page.indexOf('function beginExperience'))
 assert.ok(code.indexOf('welcomeCompleted.value = true')<code.indexOf('if (value === experienceMode.value)'))
})
test('direct Lite to 3D and back works as before',()=>{
 const code=page.slice(page.indexOf('function changeExperience'),page.indexOf('function beginExperience'))
 const plain=ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText
 const ctx={
  experienceMode:{value:'lite'},webglAvailable:{value:true},welcomeCompleted:{value:true},greetingSignal:{value:0},
  mobileSheetExpanded:{value:false},mobileToolsOpen:{value:false},experienceNotice:{value:''},
  enteredRoom:{value:null},worldLoading:{value:false},measuredFps:{value:0},
  savedBodyOverflow:'',activeTween:null,selectedRoomObject:{value:null},entryProgress:{value:0},
  ambient:{turnOff(){}},document:{body:{style:{overflow:''}}},
  nextTick:()=>{},window:{scrollTo(){}},persistExperience(){},
 }
 vm.createContext(ctx);vm.runInContext(plain,ctx)
 ctx.changeExperience('3d');assert.equal(ctx.experienceMode.value,'3d')
 ctx.changeExperience('lite');assert.equal(ctx.experienceMode.value,'lite')
})
console.log(`${count} updated welcome/navigation source checks passed.`)
