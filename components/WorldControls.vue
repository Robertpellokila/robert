<script setup lang="ts">
import { ref } from 'vue'
import type { TimeOfDay } from '~/world/livingWorld'
import type { QualityPreference } from '~/utils/renderQuality'

const props = defineProps<{
  timeOfDay: TimeOfDay
  motionEnabled: boolean
  qualityPreference: QualityPreference
  soundEnabled: boolean
  soundSupported: boolean
  soundError: string
}>()
const emit = defineEmits<{
  (event: 'setTime', value: TimeOfDay): void
  (event: 'toggleMotion'): void
  (event: 'setQuality', quality: QualityPreference): void
  (event: 'toggleSound'): void
}>()
const isOpen = ref(false)
const times: { value: TimeOfDay; label: string; icon: string }[] = [
  { value: 'day', label: 'Day', icon: '☀' },
  { value: 'sunset', label: 'Sunset', icon: '◒' },
  { value: 'night', label: 'Night', icon: '☾' },
]
</script>

<template>
  <div class="world-controls">
    <button type="button" class="world-trigger" :aria-expanded="isOpen" aria-controls="world-controls-panel"
      @click="isOpen = !isOpen">
      <span aria-hidden="true">✦</span> WORLD <span class="world-trigger-mode">{{ props.timeOfDay }}</span>
    </button>
    <section v-if="isOpen" id="world-controls-panel" class="world-popover" aria-label="World environment settings">
      <header class="world-popover-header"><strong>WORLD ATMOSPHERE</strong><button type="button" aria-label="Close world settings" @click="isOpen = false">✕</button></header>
      <p>Make the miniature city yours.</p>
      <fieldset class="world-time-choice">
        <legend>TIME OF DAY</legend>
        <div class="world-time-grid">
          <button v-for="item in times" :key="item.value" type="button"
            :class="{ selected: props.timeOfDay === item.value }" :aria-pressed="props.timeOfDay === item.value"
            @click="emit('setTime', item.value)"><span aria-hidden="true">{{ item.icon }}</span>{{ item.label }}</button>
        </div>
      </fieldset>
      <div class="world-toggle-list">
        <button type="button" :aria-pressed="props.motionEnabled" @click="emit('toggleMotion')"><span>Moving world <small>Trees, clouds & traffic</small></span><strong>{{ props.motionEnabled ? 'ON' : 'OFF' }}</strong></button>
        <label class="world-quality-select"><span>Graphics quality <small>Auto adapts to slower GPUs</small></span>
          <select :value="props.qualityPreference" @change="emit('setQuality', ($event.target as HTMLSelectElement).value as QualityPreference)">
            <option value="auto">Auto</option><option value="high">High</option><option value="balanced">Balanced</option><option value="low">Low / Eco</option>
          </select>
        </label>
        <button type="button" :disabled="!props.soundSupported" :aria-pressed="props.soundEnabled" @click="emit('toggleSound')"><span>Ambient sound <small>Original generated wind & birds</small></span><strong>{{ props.soundEnabled ? 'ON' : 'OFF' }}</strong></button>
      </div>
      <p v-if="props.soundError" class="world-sound-error" role="status">{{ props.soundError }}</p>
      <small class="world-controls-note">Sound only starts after you click. Reduced-motion system settings are respected.</small>
    </section>
  </div>
</template>
