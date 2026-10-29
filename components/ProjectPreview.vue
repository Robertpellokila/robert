<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { PortfolioProject } from '~/data/projects'
import { getEmbedUrl, safeWebUrl } from '~/utils/projectLinks'

const props = defineProps<{ project: PortfolioProject }>()
const previewUrl = computed(() => getEmbedUrl(props.project))
const liveUrl = computed(() => safeWebUrl(props.project.demoUrl))
const open = ref(false)
const device = ref<'desktop' | 'mobile'>('desktop')
const closeButton = ref<HTMLButtonElement | null>(null)
const triggerButton = ref<HTMLButtonElement | null>(null)
let previousOverflow = ''
function showPreview() { if (previewUrl.value) open.value = true }
function closePreview() { open.value = false }
function onKeydown(e: KeyboardEvent) {
  if (open.value && e.key === 'Escape') { e.preventDefault(); closePreview() }
}
watch(open, async (value) => {
  if (!import.meta.client) return
  if (value) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeydown)
    await nextTick()
    closeButton.value?.focus()
  } else {
    document.body.style.overflow = previousOverflow
    window.removeEventListener('keydown', onKeydown)
    await nextTick()
    triggerButton.value?.focus()
  }
})
watch(() => props.project.slug, closePreview)
onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', onKeydown)
    if (open.value) document.body.style.overflow = previousOverflow
  }
})
</script>

<template>
  <div class="preview-actions">
    <button v-if="previewUrl" ref="triggerButton" class="interior-primary" type="button" @click="showPreview">◧ Live preview</button>
    <a v-if="liveUrl" class="interior-secondary" :href="liveUrl" target="_blank" rel="noopener noreferrer">Visit website ↗</a>
    <span v-if="!liveUrl" class="preview-helper">Belum ada URL demo publik.</span>
    <span v-else-if="!previewUrl" class="preview-helper">Preview belum diaktifkan; buka website langsung.</span>
  </div>

  <Teleport to="body">
    <div v-if="open && previewUrl" class="preview-backdrop" data-project-preview="open" role="presentation" @click.self="closePreview">
      <section class="preview-modal" role="dialog" aria-modal="true" :aria-label="`Live preview ${project.name}`">
        <header class="preview-toolbar">
          <div class="preview-browser-title"><span class="preview-browser-dot" /> <strong>{{ project.name }}</strong> <small>LIVE WEBSITE · EMBED</small></div>
          <div class="preview-device-switch" aria-label="Preview viewport">
            <button type="button" :aria-pressed="device === 'desktop'" :class="{ selected: device === 'desktop' }" @click="device='desktop'">Desktop</button>
            <button type="button" :aria-pressed="device === 'mobile'" :class="{ selected: device === 'mobile' }" @click="device='mobile'">Mobile</button>
          </div>
          <button ref="closeButton" type="button" class="preview-close" @click="closePreview">Close ✕</button>
        </header>
        <div class="preview-browser">
          <div class="preview-address"><span>🔒</span><span>{{ previewUrl }}</span></div>
          <div class="preview-frame-wrap">
            <iframe :key="project.slug" :src="previewUrl" :title="`Website preview: ${project.name}`"
              :class="{ 'preview-mobile': device === 'mobile' }" loading="lazy" referrerpolicy="no-referrer"
              sandbox="allow-scripts allow-forms" />
          </div>
        </div>
        <footer class="preview-footer">
          <p>Beberapa situs memblokir iframe (CSP / X-Frame-Options). Jika tidak muncul, gunakan tombol Visit website.</p>
          <a :href="liveUrl" target="_blank" rel="noopener noreferrer">Open original ↗</a>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
