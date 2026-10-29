<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { chapters, type ChapterId } from '~/data/portfolio'
import { discoveries, discoveryById } from '~/data/discoveries'
import { journeyDialogue } from '~/utils/visitorExperience'

const props = defineProps<{
  progress: number
  chapter: ChapterId
  phase: string
  mode: string
  collected: ChapterId[]
  selected: ChapterId | null
  inside: boolean
  directorOpen: boolean
}>()
const emit = defineEmits<{
  jump: [index: number]
  discover: [id: ChapterId]
  closeDiscovery: []
  enter: [id: ChapterId]
}>()
const mapOpen = ref(false)
const closeButton = ref<HTMLButtonElement | null>(null)
watch(() => props.selected, async (id) => {
  if (id) { await nextTick(); closeButton.value?.focus() }
})
const speechEnabled = ref(true)
const unlockedCount = computed(() => props.collected.length)
const currentStop = computed(() => chapters.findIndex(c => c.id === props.chapter))
const message = computed(() => journeyDialogue(props.phase, props.chapter, props.mode))
const activeDiscovery = computed(() => props.selected ? discoveryById[props.selected] : null)
const isAtDiscovery = computed(() => activeDiscovery.value?.id === props.chapter)
const percent = computed(() => Math.round(Math.min(1,Math.max(0,props.progress))*100))
function jump(index: number) { mapOpen.value = false; emit('jump', index) }
function close() { emit('closeDiscovery') }
</script>

<template>
  <div v-if="!inside" class="visitor-ui">
    <div class="visitor-map-wrap">
      <button class="visitor-map-toggle" type="button" :aria-expanded="mapOpen" aria-controls="mini-world-map" @click="mapOpen=!mapOpen">
        <span aria-hidden="true">⌁</span> MINI MAP <span class="visitor-map-count">{{ unlockedCount }}/{{ discoveries.length }}</span>
      </button>
      <div v-if="mapOpen" id="mini-world-map" class="visitor-map-card">
        <div class="visitor-map-header"><strong>YOUR LITTLE WORLD</strong><button type="button" aria-label="Close map" @click="mapOpen=false">✕</button></div>
        <p>Choose a location to travel there. Buildings can be entered after you arrive.</p>
        <div class="visitor-map-diorama" aria-hidden="true">
          <svg viewBox="0 0 320 103" width="100%" role="presentation">
            <path d="M18 69 C42 69 47 31 77 31 S107 72 133 72 S159 31 190 31 S220 73 245 73 S277 37 302 37" stroke="#d4dfcf" stroke-width="14" stroke-linecap="round" fill="none"/>
            <path d="M18 69 C42 69 47 31 77 31 S107 72 133 72 S159 31 190 31 S220 73 245 73 S277 37 302 37" stroke="#fbf9eb" stroke-width="10" stroke-linecap="round" fill="none"/>
            <g v-for="(position, index) in [[18,69],[77,31],[133,72],[190,31],[245,73],[302,37]]" :key="index">
              <rect :x="position[0]-9" :y="position[1]-25" width="18" height="16" rx="2" fill="#b5cbb0" stroke="#edf1e5" stroke-width="2"/>
              <circle :cx="position[0]" :cy="position[1]" :r="index === currentStop ? 8 : 5" :fill="index <= currentStop ? '#4e805b' : '#a9baaa'" stroke="#fffdf3" stroke-width="2" />
            </g>
          </svg>
          <span>JOURNEY / {{ percent }}%</span>
        </div>
        <div class="visitor-map-route" aria-hidden="true"><span :style="{width: percent + '%'}" /></div>
        <div class="visitor-map-stops">
          <button v-for="(stop,index) in chapters" :key="stop.id" type="button" :class="{ 'is-current':index===currentStop }"
            :aria-current="index===currentStop ? 'location' : undefined" @click="jump(index)">
            <span class="visitor-map-marker">{{ index+1 }}</span>
            <span class="visitor-map-stop-label">{{ stop.id }}</span>
            <span class="visitor-map-found">{{ collected.includes(stop.id) ? '✦' : '○' }}</span>
          </button>
        </div>
        <div class="visitor-map-discover"><span>✦ {{ unlockedCount }} / {{ discoveries.length }} discoveries</span><button type="button" @click="emit('discover', chapter)">Discover here ↗</button></div>
        <small>Tip: click the tiny glowing objects near each building to collect stories.</small>
      </div>
    </div>
    <div v-if="!selected && !directorOpen" class="visitor-dialogue" :class="{'is-muted':!speechEnabled}" aria-live="off">
      <span class="visitor-dialogue-avatar" aria-hidden="true">☺</span>
      <p v-if="speechEnabled">{{ message }}</p>
      <button type="button" :title="speechEnabled ? 'Hide character dialogue' : 'Show character dialogue'"
        :aria-label="speechEnabled ? 'Hide character dialogue' : 'Show character dialogue'" :aria-pressed="speechEnabled" @click="speechEnabled=!speechEnabled">
        {{ speechEnabled ? '×' : '💬' }}
      </button>
    </div>
  </div>

  <div v-if="activeDiscovery" class="discovery-overlay" role="dialog" aria-modal="true" :aria-label="activeDiscovery.title" @keydown.esc="close">
    <div class="discovery-panel">
      <div class="discovery-top"><span>✦ SECRET POSTCARD / {{ collected.length }} OF {{ discoveries.length }}</span><button type="button" ref="closeButton" aria-label="Close discovery" @click="close">✕</button></div>
      <div class="discovery-art" :style="{'--discovery-accent': activeDiscovery.accent}"><span aria-hidden="true">{{ activeDiscovery.icon }}</span></div>
      <div class="discovery-kicker">{{ activeDiscovery.object }} · {{ activeDiscovery.id.toUpperCase() }}</div>
      <h2>{{ activeDiscovery.title }}</h2>
      <p>{{ activeDiscovery.message }}</p>
      <div class="discovery-actions">
        <button v-if="isAtDiscovery" type="button" class="discovery-primary" @click="emit('enter', activeDiscovery.id); close()">Enter building ↗</button>
        <button v-else type="button" class="discovery-primary" @click="jump(chapters.findIndex(c=>c.id===activeDiscovery?.id)); close()">Travel here ↗</button>
        <button type="button" class="discovery-secondary" @click="close">Back to world</button>
      </div>
      <div class="discovery-footer">Click more glowing objects to complete the postcard collection.</div>
    </div>
  </div>
</template>
