<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { owner, chapters, experiences, education, skills } from '~/data/portfolio'
import { getRoomObject } from '~/data/roomObjects'
import { getProject } from '~/data/projects'
import type { ChapterId } from '~/data/portfolio'

const props = defineProps<{ chapter: ChapterId; objectId: string }>()
const emit = defineEmits<{ close: [] }>()
const item = computed(() => getRoomObject(props.chapter, props.objectId))
const chapterInfo = computed(() => chapters.find(c => c.id === props.chapter))
const project = computed(() => item.value?.projectSlug ? getProject(item.value.projectSlug) : undefined)
const panel = ref<HTMLElement | null>(null)
const localCvPdf = computed(() => /^\/[\w/-]+\.pdf$/i.test(owner.cvUrl) ? owner.cvUrl : '')
const skillGroups = computed(() => Object.entries(skills.reduce<Record<string, string[]>>((map,skill) => {
  ;(map[skill.group] ??= []).push(skill.label)
  return map
}, {})))
onMounted(async () => { await nextTick(); panel.value?.focus() })
</script>

<template>
  <div class="room-object-backdrop" role="presentation" @click.self="emit('close')">
    <section ref="panel" tabindex="-1" class="room-object-panel room-object-panel-v084" role="dialog" aria-modal="true"
      :aria-label="item?.label ?? 'Room details'" @keydown.esc="emit('close')">
      <div class="object-heading"><span>✦ {{ chapter.toUpperCase() }} / INTERACTIVE EXHIBIT</span>
        <button type="button" aria-label="Close object details" @click="emit('close')">✕</button>
      </div>
      <h2>{{ item?.label ?? 'Exhibit' }}</h2>
      <p class="object-lead">{{ item?.description }}</p>

      <template v-if="item?.kind === 'portrait'">
        <figure class="object-portrait-hero"><img :src="owner.photo" :alt="`Portrait of ${owner.name}`" /><figcaption>THE PERSON BEHIND THE PIXELS</figcaption></figure>
        <h3>{{ owner.name }}</h3>
        <p><strong>{{ owner.role }}</strong> · {{ owner.location }}</p>
        <p>{{ chapterInfo?.description }}</p>
        <div class="object-explainer"><h3>What I enjoy building</h3><p>Interactive web experiences, education technology, practical software and playful interfaces that connect creativity with engineering.</p></div>
        <div class="object-tags"><span v-for="skill in skills.slice(0,5)" :key="skill.label">{{ skill.label }}</span></div>
      </template>

      <template v-else-if="item?.kind === 'computer'">
        <div class="object-explainer"><h3>From idea to application</h3><p>I start by understanding a problem, define the user journey, prototype the interface, implement features, then validate and refine the result.</p></div>
        <div class="object-steps"><div><b>01</b><span>Research & requirements</span></div><div><b>02</b><span>Prototype & UI design</span></div><div><b>03</b><span>Frontend, backend & integration</span></div><div><b>04</b><span>Testing & improvements</span></div></div>
      </template>

      <template v-else-if="item?.kind === 'resume'">
        <p class="object-note">This is a readable preview using the portfolio data. If you add a real PDF in <code>public/cv.pdf</code>, it can be embedded here instead.</p>
        <div v-if="localCvPdf" class="object-cv-pdf"><iframe :src="localCvPdf" title="CV PDF preview" loading="lazy" /></div>
        <ResumeInlinePreview v-else />
        <div class="object-actions"><NuxtLink class="object-cta" to="/resume" target="_blank">Open / Print CV ↗</NuxtLink><a v-if="localCvPdf" class="object-cta secondary" :href="localCvPdf" target="_blank" rel="noopener">Open original PDF ↗</a></div>
      </template>

      <template v-else-if="item?.kind === 'career'">
        <p>{{ chapterInfo?.description }}</p>
        <div v-for="(job,index) in experiences" :key="index" class="object-job"><strong>{{ job.role }}</strong><span>{{ job.company }} · {{ job.period || 'Period not specified' }}</span><p>{{ job.description }}</p></div>
        <div v-for="(school,index) in education" :key="`edu-${index}`" class="object-job"><strong>{{ school.program }}</strong><span>{{ school.institution }} · {{ school.period }}</span><p>{{ school.detail }}</p></div>
        <NuxtLink class="object-cta" to="/resume" target="_blank">Read the full CV ↗</NuxtLink>
      </template>

      <template v-else-if="item?.kind === 'skills'">
        <div v-for="([group,items]) in skillGroups" :key="group" class="object-explainer"><h3>{{ group }}</h3><div class="object-tags"><span v-for="skill in items" :key="skill">{{ skill }}</span></div></div>
      </template>

      <template v-else-if="item?.kind === 'github'"><h3>Code & experiments</h3><p>Explore my public repositories and source code.</p><GitHubHighlights/><a v-if="owner.githubUsername" class="object-cta" :href="`https://github.com/${owner.githubUsername}`" target="_blank" rel="noopener noreferrer">Open GitHub ↗</a></template>

      <template v-else-if="item?.kind === 'project' && project">
        <figure class="object-project-figure"><img :src="project.cover" :alt="project.coverLabel"/><figcaption>{{ project.coverLabel }}</figcaption></figure>
        <p>{{ project.summary }}</p><div class="object-tags"><span v-for="tech in project.technologies" :key="tech">{{ tech }}</span></div>
        <div class="object-explainer"><h3>The challenge</h3><p>{{ project.challenge }}</p></div>
        <div class="object-explainer"><h3>What I built / planned</h3><ul><li v-for="(highlight,index) in project.highlights" :key="index">{{ highlight }}</li></ul></div>
        <div class="object-actions"><NuxtLink class="object-cta" :to="`/projects/${project.slug}`" target="_blank">Read full case study ↗</NuxtLink><a v-if="project.demoUrl" class="object-cta secondary" :href="project.demoUrl" target="_blank" rel="noopener noreferrer">Visit website ↗</a></div>
        <ProjectPreview :project="project"/>
      </template>

      <template v-else-if="item?.kind === 'contact'"><ContactForm /></template>
      <template v-else><div class="object-explainer"><h3>{{ chapterInfo?.title }}</h3><p>{{ chapterInfo?.description }}</p><p>Each exhibit connects this miniature world to the real portfolio. Look around and inspect the highlighted objects.</p></div></template>
      <div class="object-footer"><button type="button" @click="emit('close')">← Back to room</button></div>
    </section>
  </div>
</template>
