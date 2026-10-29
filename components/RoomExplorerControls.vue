<script setup lang="ts">
import { onMounted, onBeforeUnmount, reactive, watch } from 'vue'
import type { ExplorerInput } from '~/world/roomExplorer'
import type { RoomObject } from '~/data/roomObjects'
import { ref } from 'vue'
const props = defineProps<{ active: boolean; chapter: string; label: string; objects: RoomObject[] }>()
const showObjects = ref(false)
const emit = defineEmits<{ change: [input: ExplorerInput]; exit: []; inspect: [objectId: string] }>()
const pressed = reactive<Record<string, boolean>>({})
const keyMap: Record<string,string> = {
  w:'forward', ArrowUp:'forward', s:'backward', ArrowDown:'backward',
  a:'left', d:'right', ArrowLeft:'turnLeft', ArrowRight:'turnRight',
  q:'turnLeft', e:'turnRight',
}
function sync() {
  emit('change', props.active ? {
    forward: Number(!!pressed.forward) - Number(!!pressed.backward),
    strafe: Number(!!pressed.right) - Number(!!pressed.left),
    turn: Number(!!pressed.turnRight) - Number(!!pressed.turnLeft),
  } : { forward:0, strafe:0, turn:0 })
}
function setButton(name: string, active: boolean) { pressed[name] = active; sync() }
function clear() { for (const key of Object.keys(pressed)) pressed[key] = false; sync() }
function keydown(event: KeyboardEvent) {
  if (!props.active || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return
  if (event.target instanceof Element && event.target.closest('input,textarea,select,[contenteditable=true],[role=dialog]')) return
  const action = keyMap[event.key.length === 1 ? event.key.toLowerCase() : event.key]
  if (action) { event.preventDefault(); setButton(action, true) }
}
function keyup(event: KeyboardEvent) {
  const action = keyMap[event.key.length === 1 ? event.key.toLowerCase() : event.key]
  if (action && props.active) { event.preventDefault(); setButton(action, false) }
}
onMounted(() => { window.addEventListener('keydown',keydown); window.addEventListener('keyup',keyup); window.addEventListener('blur',clear) })
onBeforeUnmount(() => { window.removeEventListener('keydown',keydown); window.removeEventListener('keyup',keyup); window.removeEventListener('blur',clear); clear() })
watch(() => props.active, active => { if (!active) clear() })
</script>
<template>
  <div class="room-explorer-controls" :class="{'is-paused': !active}" aria-label="Room movement controls">
    <div class="room-topline"><div class="room-breadcrumb">⌂ <strong>INSIDE / {{ label }}</strong><small>LOOK AROUND & EXPLORE</small></div>
      <button type="button" class="room-exit-btn" @click="emit('exit')">← Exit room</button></div>
    <div v-if="active" class="room-aim" aria-hidden="true"><span>+</span></div>
    <div class="room-object-list"><button class="room-exhibit-toggle" type="button" :aria-expanded="showObjects" @click="showObjects=!showObjects">✦ Exhibits ({{ objects.length }})</button><div v-if="showObjects" class="room-exhibit-options"><button v-for="obj in objects" :key="obj.id" type="button" @click="emit('inspect',obj.id);showObjects=false">{{ obj.label }} ↗</button></div></div>
    <div class="room-help">{{ active ? 'W/S move forward/back · A/D strafe · ← → look · drag to look · click exhibits' : 'Reading an object' }}</div>
    <div class="room-mobile-pad" aria-label="Touch movement pad">
      <button class="pad-up" type="button" aria-label="Move forward" @pointerdown.prevent="setButton('forward',true)" @pointerup.prevent="setButton('forward',false)" @pointercancel="clear" @pointerleave="clear">↑</button>
      <button class="pad-left" type="button" aria-label="Turn left" @pointerdown.prevent="setButton('turnLeft',true)" @pointerup.prevent="setButton('turnLeft',false)" @pointercancel="clear" @pointerleave="clear">↶</button>
      <button class="pad-down" type="button" aria-label="Move backward" @pointerdown.prevent="setButton('backward',true)" @pointerup.prevent="setButton('backward',false)" @pointercancel="clear" @pointerleave="clear">↓</button>
      <button class="pad-right" type="button" aria-label="Turn right" @pointerdown.prevent="setButton('turnRight',true)" @pointerup.prevent="setButton('turnRight',false)" @pointercancel="clear" @pointerleave="clear">↷</button>
    </div>
    <p class="room-mobile-hint">Tap the glowing exhibits or drag the view to look around.</p>
  </div>
</template>
