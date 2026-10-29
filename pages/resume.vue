<script setup lang="ts">
import { education, experiences, owner, skills } from '~/data/portfolio'
useSeoMeta({ title: () => `CV — ${owner.name} | My Little World`, description: () => `Printable profile and CV for ${owner.name}` })
const groupedSkills = Object.entries(skills.reduce<Record<string, string[]>>((groups, item) => {
  ;(groups[item.group] ??= []).push(item.label)
  return groups
}, {})).map(([group, items]) => ({ group, items }))
function printResume() { if (import.meta.client) window.print() }
</script>
<template>
  <main class="resume-page">
    <nav class="resume-nav"><NuxtLink to="/#experience">← Back to the world</NuxtLink><button type="button" @click="printResume">Print / Save as PDF ↗</button></nav>
    <article class="resume-paper">
      <header><span class="resume-eyebrow">PROFILE / CURRICULUM VITAE</span><h1>{{ owner.name }}</h1><p>{{ owner.role }}</p>
        <div class="resume-contact"><span>{{ owner.location }}</span><a v-if="owner.email" :href="`mailto:${owner.email}`">{{ owner.email }}</a>
          <a v-if="owner.githubUsername" :href="`https://github.com/${owner.githubUsername}`">GitHub</a><a v-if="owner.linkedin" :href="owner.linkedin">LinkedIn</a></div>
      </header>
      <section><h2>Profile</h2><p>I enjoy building useful and playful digital experiences that combine web engineering, education, and creative technology.</p></section>
      <section><h2>Experience</h2><div v-for="(job,i) in experiences" :key="i" class="resume-entry"><div><h3>{{ job.role }}</h3><strong>{{ job.company }}</strong></div><span>{{ job.period === 'Isi periode' ? 'Period not specified' : job.period }}</span><p>{{ job.description }}</p></div></section>
      <section v-if="education.length"><h2>Education</h2><div v-for="(item,i) in education" :key="i" class="resume-entry"><div><h3>{{ item.program }}</h3><strong>{{ item.institution }}</strong></div><span>{{ item.period }}</span><p>{{ item.detail }}</p></div></section>
      <section><h2>Skills</h2><div class="resume-skills"><div v-for="entry in groupedSkills" :key="entry.group"><strong>{{ entry.group }}</strong><p>{{ entry.items.join(' · ') }}</p></div></div></section>
      <p class="resume-draft" v-if="experiences.some(item => !item.period || item.period === 'Isi periode')">Draft CV: lengkapi periode pengalaman di data/portfolio.ts sebelum dibagikan.</p>
    </article>
  </main>
</template>
