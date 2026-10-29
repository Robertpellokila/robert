<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { chapters, owner, projects, skills, type ChapterId } from '~/data/portfolio'
import { getProject } from '~/data/projects'
import { safeWebUrl } from '~/utils/projectLinks'
import { rooms } from '~/data/rooms'

const props = defineProps<{ chapter: ChapterId }>()
const emit = defineEmits<{ close: [] }>()
const chapter = computed(() => chapters.find(c => c.id === props.chapter)!)
const room = computed(() => rooms[props.chapter])
const selectedSlug = ref(projects[0]?.slug ?? '')
const selectedProject = computed(() => getProject(selectedSlug.value) ?? projects[0]!)
const repositoryLink = computed(() => safeWebUrl(selectedProject.value?.repositoryUrl ?? ''))
watch(() => props.chapter, () => { selectedSlug.value = projects[0]?.slug ?? '' })
</script>

<template>
  <div class="interior-viewport" role="dialog" aria-modal="true" :aria-label="room.title">
    <div class="interior-spotlight" aria-hidden="true" />
    <div class="interior-topline">
      <span class="interior-location">{{ room.symbol }} &nbsp; INSIDE / {{ room.label.toUpperCase() }}</span>
      <button class="interior-exit" type="button" @click="emit('close')">← Exit building <span>ESC</span></button>
    </div>
    <div class="interior-content">
      <div class="interior-heading"><div class="interior-kicker">{{ chapter.eyebrow }}</div><h2>{{ room.title }}</h2><p>{{ room.hint }}</p></div>

      <div v-if="chapter.id === 'home'" class="interior-section">
        <span class="interior-section-label">START HERE</span>
        <h3>Welcome to {{ owner.name }}'s miniature world.</h3>
        <p>Di luar, kamu bisa mengikuti perjalanan karakternya. Setiap bangunan mempunyai cerita yang berbeda. Tekan Exit building lalu scroll atau pilih lokasi melalui navigasi.</p>
      </div>

      <div v-else-if="chapter.id === 'about'" class="interior-section">
        <div class="interior-profile">
          <div class="interior-avatar"><img v-if="owner.photo" :src="owner.photo" alt="Foto profil" @error="($event.target as HTMLImageElement).style.display = 'none'" /><span>{{ owner.name.charAt(0) }}</span></div>
          <div><span class="interior-section-label">ABOUT ME</span><h3>{{ owner.name }}</h3><p>{{ owner.role }} · {{ owner.location }}</p></div>
        </div>
        <p>{{ chapter.description }}</p>
        <p class="interior-note">Untuk menambahkan foto: simpan di <code>public/images/profile.jpg</code>.</p>
      </div>

      <div v-else-if="chapter.id === 'experience'" class="interior-section">
        <span class="interior-section-label">WORK & LEARNING JOURNEY</span>
        <CareerTimeline />
      </div>

      <div v-else-if="chapter.id === 'skills'" class="interior-section">
        <span class="interior-section-label">MY TOOLBOX</span>
        <div class="interior-skills"><span v-for="skill in skills" :key="skill.label" class="interior-skill">{{ skill.label }} <small>{{ skill.group }}</small></span></div>
        <GitHubHighlights />
      </div>

      <div v-else-if="chapter.id === 'projects'" class="interior-section">
        <span class="interior-section-label">PROJECT EXHIBITION / SELECT AN EXHIBIT</span>
        <div class="interior-project-picker">
          <button v-for="project in projects" :key="project.slug" type="button"
            :aria-pressed="selectedSlug === project.slug"
            :class="{ selected: selectedSlug===project.slug }" @click="selectedSlug=project.slug">
            <span :style="{ background: project.color }">{{ project.initials }}</span>{{ project.name }}
          </button>
        </div>
        <div v-if="selectedProject" class="interior-project-detail">
          <img class="interior-project-preview-art" :src="selectedProject.cover" :alt="`Concept illustration: ${selectedProject.name}`" />
          <p class="interior-note">{{ selectedProject.coverLabel }}</p>
          <h3>{{ selectedProject.name }}</h3>
          <p>{{ selectedProject.summary }}</p>
          <div class="interior-tags"><span v-for="tech in selectedProject.technologies" :key="tech">{{ tech }}</span></div>
          <div class="interior-project-actions">
            <NuxtLink :to="`/projects/${selectedProject.slug}`" class="interior-primary">Explore case study ↗</NuxtLink>
            <a v-if="repositoryLink" :href="repositoryLink" target="_blank" rel="noopener noreferrer" class="interior-secondary">Repository ↗</a>
          </div>
          <ProjectPreview :project="selectedProject" />
          <p class="interior-note">Case study berisi tantangan, alur pengembangan, keputusan teknis, hasil, dan galeri screenshot jika sudah kamu tambahkan.</p>
        </div>
      </div>

      <div v-else class="interior-section"><span class="interior-section-label">LET'S CONNECT</span><h3>Let's make something together.</h3>
        <p>{{ chapter.description }}</p>
        <div class="interior-project-actions"><a v-if="owner.email" class="interior-primary" :href="`mailto:${owner.email}`">Email me ↗</a><a v-if="owner.githubUsername" class="interior-secondary" :href="`https://github.com/${owner.githubUsername}`" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a v-if="owner.linkedin" class="interior-secondary" :href="owner.linkedin" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></div>
        <p v-if="!owner.email" class="interior-note">Isi email dan tautan profil aslimu di <code>data/portfolio.ts</code>.</p>
      </div>
    </div>
    <div class="interior-bottomline"><span>MY LITTLE WORLD / INTERIOR EXPERIENCE</span><span>v0.7 — VISITOR EXPERIENCE</span></div>
  </div>
</template>
