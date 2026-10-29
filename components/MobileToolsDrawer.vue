<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { chapters, type ChapterId } from '~/data/portfolio'
import { discoveries } from '~/data/discoveries'
import type { TimeOfDay } from '~/world/livingWorld'
import type { QualityPreference } from '~/utils/renderQuality'

const props = defineProps<{
  open: boolean
  current: ChapterId
  percent: number
  collected: ChapterId[]
  timeOfDay: TimeOfDay
  motionEnabled: boolean
  soundEnabled: boolean
  soundSupported: boolean
  soundError: string
  quality: QualityPreference
  cinematic: boolean
}>()
const emit = defineEmits<{
  close: []
  navigate: [index: number]
  discover: [id: ChapterId]
  setTime: [value: TimeOfDay]
  setQuality: [value: QualityPreference]
  toggleMotion: []
  toggleSound: []
  toggleCamera: []
}>()
const selectedTab = ref<'locations'|'settings'>('locations')
const timeOptions: {value:TimeOfDay;label:string}[] = [{value:'day',label:'☀ Day'},{value:'sunset',label:'◒ Sunset'},{value:'night',label:'☾ Night'}]
const closeRef = ref<HTMLButtonElement|null>(null)
const currentIndex = computed(() => chapters.findIndex(chapter => chapter.id === props.current))
watch(() => props.open, async open => {
  if (open) { selectedTab.value = 'locations'; await nextTick(); closeRef.value?.focus() }
})
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') { e.preventDefault(); emit('close'); return }
  if (e.key !== 'Tab') return
  const root = (e.currentTarget as HTMLElement)
  const focusables = Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]),select:not([disabled]),a[href]'))
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
}
</script>

<template>
  <Teleport to="body"><div v-if="open" class="mobile-tools-backdrop" @click.self="emit('close')">
    <section id="mobile-tools-drawer" class="mobile-tools-drawer" role="dialog" aria-modal="true" aria-labelledby="mobile-tools-title" @keydown="onKeydown">
      <div class="mobile-tools-header">
        <div><small>MY LITTLE WORLD / EXPLORER</small><h2 id="mobile-tools-title">Explore & Settings</h2></div>
        <button ref="closeRef" class="mobile-tools-close" type="button" aria-label="Close tools" @click="emit('close')">✕</button>
      </div>
      <div class="mobile-tools-tabs" role="group" aria-label="Tools categories">
        <button :class="{selected:selectedTab==='locations'}" :aria-pressed="selectedTab==='locations'" type="button" @click="selectedTab='locations'">⌁ Map & Sections</button>
        <button :class="{selected:selectedTab==='settings'}" :aria-pressed="selectedTab==='settings'" type="button" @click="selectedTab='settings'">⚙ World Settings</button>
      </div>
      <div v-if="selectedTab==='locations'" class="mobile-tools-body">
        <div class="mobile-tools-map" aria-hidden="true">
          <svg viewBox="0 0 320 86" width="100%" role="presentation">
            <path d="M18 55 C49 55 48 18 78 18 S106 61 138 61 S165 18 196 18 S230 60 257 60 S277 26 302 26" fill="none" stroke="#d7e4d2" stroke-width="13" stroke-linecap="round" />
            <path d="M18 55 C49 55 48 18 78 18 S106 61 138 61 S165 18 196 18 S230 60 257 60 S277 26 302 26" fill="none" stroke="#fffaf1" stroke-width="6" stroke-linecap="round" />
            <g v-for="(pos,index) in [[18,55],[78,18],[138,61],[196,18],[257,60],[302,26]]" :key="index">
              <circle :cx="pos[0]" :cy="pos[1]" :r="currentIndex === index ? 8 : 5" :fill="currentIndex === index ? '#427451' : '#8dab88'" stroke="white" stroke-width="2" />
            </g>
          </svg>
          <span>Journey {{ percent }}%</span>
        </div>
        <p class="mobile-tools-caption">Pilih lokasi. Karakter akan melanjutkan perjalanan melalui kota.</p>
        <div class="mobile-tools-locations">
          <button v-for="(chapter,index) in chapters" :key="chapter.id" type="button" :class="{'is-current':chapter.id===current}"
            :aria-current="chapter.id===current?'location':undefined" @click="emit('navigate',index)">
            <span class="mobile-tools-location-number">{{ chapter.number }}</span><strong>{{ chapter.id }}</strong>
            <span aria-hidden="true">{{ chapter.id===current ? '●' : '↗' }}</span>
          </button>
        </div>
        <div class="mobile-tools-discover">
          <div><strong>Hidden stories</strong><small>{{ collected.length }} / {{ discoveries.length }} discovered</small></div>
          <button type="button" @click="emit('discover',current); emit('close')">Discover here ↗</button>
        </div>
      </div>
      <div v-else class="mobile-tools-body mobile-tools-settings">
        <fieldset>
          <legend>TIME OF DAY</legend>
          <div class="mobile-tools-time">
            <button v-for="entry in timeOptions"
              :key="entry.value" :class="{selected:timeOfDay===entry.value}" :aria-pressed="timeOfDay===entry.value" type="button" @click="emit('setTime',entry.value)">{{ entry.label }}</button>
          </div>
        </fieldset>
        <div class="mobile-tools-setting-row"><div><strong>Moving World</strong><small>Trees, clouds & traffic</small></div><button type="button" :aria-pressed="motionEnabled" @click="emit('toggleMotion')">{{ motionEnabled?'ON':'OFF' }}</button></div>
        <div class="mobile-tools-setting-row"><div><strong>Ambient Sound</strong><small>Starts only on tap</small></div><button type="button" :disabled="!soundSupported" :aria-pressed="soundEnabled" @click="emit('toggleSound')">{{ soundEnabled?'ON':'OFF' }}</button></div>
        <div class="mobile-tools-setting-row"><div><strong>Cinematic Camera</strong><small>Use dynamic camera angles</small></div><button type="button" :aria-pressed="cinematic" @click="emit('toggleCamera')">{{ cinematic?'ON':'OFF' }}</button></div>
        <label class="mobile-tools-setting-row"><div><strong>Graphics Quality</strong><small>Auto recommended for phones</small></div>
          <select :value="quality" @change="emit('setQuality',($event.target as HTMLSelectElement).value as QualityPreference)">
            <option value="auto">Auto</option><option value="high">High</option><option value="balanced">Balanced</option><option value="low">Low / Eco</option>
          </select>
        </label>
        <p v-if="soundError" role="status" class="mobile-tools-error">{{ soundError }}</p>
      </div>
      <p class="mobile-tools-footnote">All settings affect the 3D world. The Lite portfolio remains available in the bottom switch.</p>
    </section>
  </div></Teleport>
</template>
