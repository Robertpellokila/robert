<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { githubFeaturedRepositories, owner } from '~/data/portfolio'

type Repo = { id: number; name: string; description: string | null; url: string; language: string | null; stars: number; updatedAt: string | null }
const items = ref<Repo[]>([])
const loading = ref(false)
const errorMessage = ref('')
const notice = ref('')
const githubLink = computed(() => owner.githubUsername ? `https://github.com/${owner.githubUsername}` : '')
async function refresh() {
  if (!owner.githubUsername) return
  loading.value = true
  errorMessage.value = ''
  try {
    const data = await $fetch<{ items: Repo[]; missingFeatured?: string[] }>('/api/github', { query: { username: owner.githubUsername } })
    items.value = data.items
    notice.value = data.missingFeatured?.length ? `Tidak ditemukan: ${data.missingFeatured.join(', ')}.` : ''
  } catch { errorMessage.value = 'GitHub belum bisa diakses. Coba lagi nanti.' }
  finally { loading.value = false }
}
onMounted(refresh)
</script>
<template>
  <div class="repo-widget github-featured">
    <div class="repo-heading"><strong><span class="repo-circle">◉</span> {{ githubFeaturedRepositories.length ? 'SELECTED GITHUB REPOS' : 'LATEST GITHUB REPOS' }}</strong>
      <a v-if="githubLink" :href="githubLink" target="_blank" rel="noopener noreferrer">GitHub profile ↗</a>
    </div>
    <p v-if="!owner.githubUsername" class="repo-empty">Isi <code>owner.githubUsername</code> di <code>data/portfolio.ts</code> untuk menampilkan repo publik.</p>
    <p v-else-if="loading" class="repo-empty" role="status">Loading from GitHub…</p>
    <div v-else-if="errorMessage" class="repo-empty" role="alert">{{ errorMessage }} <button type="button" class="retry-link" @click="refresh">Retry</button></div>
    <div v-else-if="items.length" class="repo-list">
      <a v-for="repo in items" :key="repo.id" :href="repo.url" target="_blank" rel="noopener noreferrer" class="repo-item">
        <div><strong>{{ repo.name }} ↗</strong><span>{{ repo.description || 'Public repository' }}</span></div>
        <small>{{ repo.language || 'Code' }} <span>★ {{ repo.stars }}</span></small>
      </a>
    </div>
    <p v-else class="repo-empty">Belum ada repo publik yang cocok dengan pilihanmu.</p>
    <p v-if="notice" class="repo-hint">{{ notice }} Periksa penulisan nama repository.</p>
  </div>
</template>
