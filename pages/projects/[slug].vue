<script setup lang="ts">
import { computed } from 'vue'
import { getProject } from '~/data/projects'
import { safeWebUrl } from '~/utils/projectLinks'

const route = useRoute()
const project = computed(() => getProject(String(route.params.slug)))
if (!project.value) throw createError({ statusCode: 404, statusMessage: 'Project not found' })
const current = project.value
const demoUrl = computed(() => safeWebUrl(current.demoUrl))
const repoUrl = computed(() => safeWebUrl(current.repositoryUrl))
useSeoMeta({
  title: () => `${current.name} — Case Study | My Little World`,
  description: () => current.summary,
  ogTitle: () => `${current.name} — Portfolio Case Study`,
  ogDescription: () => current.summary,
})
</script>
<template>
  <main class="study-page">
    <nav class="study-nav" aria-label="Project navigation"><NuxtLink to="/#projects">← Back to project district</NuxtLink><NuxtLink to="/">MY LITTLE WORLD ✳</NuxtLink></nav>
    <header class="study-hero">
      <div class="study-copy">
        <span class="study-eyebrow">CASE STUDY / {{ current.tag.toUpperCase() }}</span>
        <h1>{{ current.name }}</h1>
        <p>{{ current.summary }}</p>
        <div class="study-tech"><span v-for="tech in current.technologies" :key="tech">{{ tech }}</span></div>
        <div class="study-actions">
          <ProjectPreview :project="current" />
          <a v-if="repoUrl" class="study-repo" :href="repoUrl" target="_blank" rel="noopener noreferrer">View source ↗</a>
        </div>
      </div>
      <figure class="study-cover" :style="{ background: current.color }">
        <img :src="current.cover" :alt="`Concept illustration for ${current.name}`" />
        <figcaption>{{ current.coverLabel }}</figcaption>
      </figure>
    </header>
    <div class="study-layout">
      <aside class="study-sidebar"><span>AT A GLANCE</span><dl>
        <dt>PROJECT</dt><dd>{{ current.kind }}</dd>
        <dt>MY ROLE</dt><dd>{{ current.role }}</dd>
        <dt>STATUS</dt><dd>{{ current.tag }}</dd>
      </dl><NuxtLink to="/#projects">← Return to the world</NuxtLink></aside>
      <article class="study-article">
        <section><div class="study-section-number">01 / BACKGROUND</div><h2>Why this project?</h2><p>{{ current.context }}</p></section>
        <section><div class="study-section-number">02 / THE CHALLENGE</div><h2>What problem am I solving?</h2><p>{{ current.challenge }}</p></section>
        <section><div class="study-section-number">03 / THE APPROACH</div><h2>How I approached it</h2>
          <ol class="study-step-list"><li v-for="step in current.approach" :key="step">{{ step }}</li></ol>
        </section>
        <section><div class="study-section-number">04 / HIGHLIGHTS</div><h2>Selected features</h2>
          <div class="study-highlight-grid"><div v-for="(item,i) in current.highlights" :key="item"><small>0{{ i+1 }}</small><h3>{{ item }}</h3></div></div>
        </section>
        <section><div class="study-section-number">05 / ENGINEERING</div><h2>Technical decisions</h2>
          <div class="study-decision" v-for="decision in current.engineering" :key="decision.title"><h3>{{ decision.title }}</h3><p>{{ decision.description }}</p></div>
        </section>
        <section><div class="study-section-number">06 / GALLERY</div><h2>Inside the project</h2>
          <div v-if="current.gallery.length" class="study-gallery">
            <figure v-for="image in current.gallery" :key="image.src"><img :src="image.src" :alt="image.alt" loading="lazy" /><figcaption>{{ image.caption }}</figcaption></figure>
          </div>
          <div v-else class="study-gallery-empty"><span>▧</span><p>Screenshot asli belum ditambahkan. Setelah proyekmu siap, simpan gambarnya di <code>public/images/projects/</code> lalu isi array <code>gallery</code> pada <code>data/projects.ts</code>.</p></div>
        </section>
        <section><div class="study-section-number">07 / PROGRESS</div><h2>Outcome & current status</h2><p>{{ current.outcome }}</p></section>
        <section><div class="study-section-number">08 / REFLECTION</div><h2>What I learned</h2><ul class="study-learnings"><li v-for="item in current.learnings" :key="item">{{ item }}</li></ul></section>
        <div class="study-bottom"><span>THANKS FOR EXPLORING</span><NuxtLink to="/#projects">Back to the miniature city ↗</NuxtLink></div>
      </article>
    </div>
  </main>
</template>
