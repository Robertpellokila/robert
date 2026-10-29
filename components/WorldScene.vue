<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'

/**
 * Pembelajaran:
 * - host adalah referensi ke <div> yang menjadi tempat canvas WebGL.
 * - watcher baru membuat Three.js setelah elemen benar-benar terpasang.
 * - Nuxt membungkus komponen ini dengan <ClientOnly> di pages/index.vue.
 */
import type { ChapterId } from '~/data/portfolio'
import type { TimeOfDay } from '~/world/livingWorld'
import type { QualityPreference, RenderQualityTier } from '~/utils/renderQuality'
import type { ExplorerInput } from '~/world/roomExplorer'
const props = defineProps<{ progress: number; cinematic?: boolean; interiorChapter?: ChapterId | null; entranceProgress?: number; timeOfDay?: TimeOfDay; worldMotion?: boolean; ecoMode?: boolean; qualityPreference?: QualityPreference; explorerInput?: ExplorerInput; greetingSignal?: number }>()
const emit = defineEmits<{ discover: [id: ChapterId]; ready: []; fatal: [message: string]; performance: [fps: number, tier: RenderQualityTier]; roomObject: [chapter: ChapterId, objectId: string] }>()
const host = shallowRef<HTMLElement | null>(null)
const errorMessage = ref('')
const status = ref<'loading' | 'ready' | 'error'>('loading')
const greetingVisible = ref(false)
let greetingTimer: ReturnType<typeof setTimeout> | undefined
watch([() => props.greetingSignal, status], ([value, currentStatus]) => {
  if (!value || currentStatus !== 'ready') return
  greetingVisible.value = true
  if (greetingTimer) clearTimeout(greetingTimer)
  greetingTimer = setTimeout(() => { greetingVisible.value = false }, 3100)
}, { immediate: true })
watch(() => props.progress, (value) => { if (value > .025) greetingVisible.value = false })
let destroyWorld: (() => void) | undefined

function reportError(error: unknown) {
  console.error('[My Little World] 3D scene failed:', error)
  errorMessage.value = error instanceof Error ? error.message : String(error)
  status.value = 'error'
  emit('fatal', errorMessage.value)
}

function cleanupWorld() {
  const cleanup = destroyWorld
  destroyWorld = undefined
  cleanup?.()
}

// Unlike a one-shot onMounted() check, the watcher runs when host gets assigned.
// flush: 'post' ensures the element is available after Vue has patched its DOM.
watch(host, async (element, _previous, onCleanup) => {
  if (!element) return

  let cancelled = false
  onCleanup(() => {
    cancelled = true
    cleanupWorld()
  })

  try {
    // Import only in the browser: the server has no WebGL context.
    const { createWorld } = await import('~/world/createWorld')
    if (cancelled || !element.isConnected) return

    cleanupWorld()
    destroyWorld = createWorld(element, () => props.progress, reportError, () => props.cinematic !== false, () => ({ id: props.interiorChapter ?? null, progress: props.entranceProgress ?? 0 }), () => ({
      timeOfDay: props.timeOfDay ?? 'day', motionEnabled: props.worldMotion !== false, ecoMode: props.ecoMode === true,
    }), (id: ChapterId) => emit('discover', id), () => { status.value = 'ready'; emit('ready') }, (fps, tier) => emit('performance', fps, tier), () => props.qualityPreference ?? 'auto', () => props.explorerInput ?? {forward:0,strafe:0,turn:0}, (chapter, objectId) => emit('roomObject',chapter,objectId), () => props.greetingSignal ?? 0)
    // The loading indicator disappears only after the first rendered WebGL frame.
    console.info('[My Little World] 3D canvas initialized', {
      width: element.clientWidth,
      height: element.clientHeight,
    })
  } catch (error) {
    if (!cancelled) reportError(error)
  }
}, { flush: 'post', immediate: true })

onBeforeUnmount(() => { if (greetingTimer) clearTimeout(greetingTimer); cleanupWorld() })
</script>

<template>
  <div ref="host" class="world-scene" aria-label="Low-poly 3D miniature city">
    <Transition name="greeting-fade"><div v-if="greetingVisible && props.progress <= .025 && status === 'ready'" class="avatar-welcome-bubble" aria-live="polite">👋 Yuk, ikut aku! <small>Scroll untuk mulai menjelajah</small></div></Transition>
    <div v-if="status === 'loading'" class="scene-loading" role="status">
      Preparing your miniature world…
    </div>
    <div v-if="status === 'error'" class="scene-error" role="alert">
      <strong>The 3D world could not be displayed.</strong>
      {{ errorMessage }}
      <div>Open Chrome DevTools → Console to see the full error.</div>
    </div>
  </div>
</template>

<style scoped>
.avatar-welcome-bubble{position:absolute;left:20%;top:31%;z-index:4;border:1px solid rgba(105,151,115,.35);padding:12px 16px;border-radius:20px;background:#fffdf5ed;color:#355943;box-shadow:0 16px 40px #1c3d2d2b;font-size:15px;font-weight:800;pointer-events:none;white-space:nowrap;animation:avatar-nudge 1.7s ease-in-out infinite}
.avatar-welcome-bubble small{display:block;margin-top:3px;font-size:11px;font-weight:500;color:#638371}
.greeting-fade-enter-active,.greeting-fade-leave-active{transition:opacity .3s,transform .3s}.greeting-fade-enter-from,.greeting-fade-leave-to{opacity:0;transform:translateY(10px)}
@keyframes avatar-nudge{50%{transform:translateY(-5px)}}
@media(max-width:760px){.avatar-welcome-bubble{left:10%;top:33%;padding:10px 12px;font-size:13px}}
@media(prefers-reduced-motion:reduce){.avatar-welcome-bubble{animation:none}}
</style>
