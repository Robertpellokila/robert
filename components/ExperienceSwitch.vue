<script setup lang="ts">
import type { ExperienceMode } from '~/utils/experienceMode'
import type { QualityPreference, RenderQualityTier } from '~/utils/renderQuality'
const props = defineProps<{
  mode: ExperienceMode
  webglAvailable: boolean
  loading: boolean
  quality: QualityPreference
  actualQuality: RenderQualityTier
  fps: number
  notice: string
}>()
const emit = defineEmits<{
  changeMode: [mode: ExperienceMode]
  changeQuality: [quality: QualityPreference]
}>()
const qualityOptions: QualityPreference[] = ['auto', 'high', 'balanced', 'low']
</script>
<template>
  <div class="experience-switch" aria-label="Choose portfolio experience">
    <div class="experience-switch-row" role="group" aria-label="Portfolio view">
      <button type="button" :class="{ active: mode === '3d' }" :aria-pressed="mode === '3d'" :disabled="!webglAvailable" @click="emit('changeMode','3d')">◇ 3D World</button>
      <button type="button" :class="{ active: mode === 'lite' }" :aria-pressed="mode === 'lite'" @click="emit('changeMode','lite')">☷ Lite</button>
    </div>
    <label v-if="mode === '3d'" class="experience-quality">Graphics
      <select :value="quality" aria-label="Graphics quality" @change="emit('changeQuality', ($event.target as HTMLSelectElement).value as QualityPreference)">
        <option v-for="item in qualityOptions" :key="item" :value="item">{{ item === 'auto' ? 'Auto' : item === 'balanced' ? 'Balanced' : item === 'high' ? 'High' : 'Low' }}</option>
      </select>
      <span class="experience-tier" aria-live="off">{{ loading ? 'Loading' : `${actualQuality} ${fps ? `· ${fps} fps` : ''}` }}</span>
    </label>
    <p v-if="notice" role="status" class="experience-notice">{{ notice }}</p>
  </div>
</template>
