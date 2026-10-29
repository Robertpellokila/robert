<script setup lang="ts">
import { computed } from 'vue'
import { owner, education, experiences, skills } from '~/data/portfolio'
const skillGroups = computed(() => Object.entries(skills.reduce<Record<string, string[]>>((groups, skill) => {
  ;(groups[skill.group] ??= []).push(skill.label)
  return groups
}, {})))
const publicPeriod = (period: string) => period && period !== 'Isi periode' ? period : 'Periode belum diisi'
</script>

<template>
  <article class="resume-inline" aria-label="Curriculum vitae preview">
    <header class="resume-inline-header">
      <span>CURRICULUM VITAE · LIVE PREVIEW</span>
      <h3>{{ owner.name }}</h3>
      <p>{{ owner.role }}</p>
      <small>{{ owner.location }}</small>
    </header>
    <section>
      <h4>Profile</h4>
      <p>I enjoy building useful digital experiences across web development, education and creative technology.</p>
    </section>
    <section>
      <h4>Experience</h4>
      <div v-for="(job,index) in experiences" :key="index" class="resume-inline-entry">
        <strong>{{ job.role }}</strong><small>{{ job.company }} · {{ publicPeriod(job.period) }}</small>
        <p>{{ job.description }}</p>
      </div>
      <p v-if="!experiences.length">Professional experience is being updated.</p>
    </section>
    <section v-if="education.length">
      <h4>Education</h4>
      <div v-for="(entry,index) in education" :key="index" class="resume-inline-entry">
        <strong>{{ entry.program }}</strong><small>{{ entry.institution }} · {{ entry.period }}</small><p>{{ entry.detail }}</p>
      </div>
    </section>
    <section>
      <h4>Tools & skills</h4>
      <div v-for="([group,items]) in skillGroups" :key="group" class="resume-inline-entry">
        <strong>{{ group }}</strong><p>{{ items.join(' · ') }}</p>
      </div>
    </section>
    <p v-if="experiences.some(job => !job.period || job.period==='Isi periode')" class="resume-inline-draft">
      Draft CV: lengkapi periode pengalaman sebelum digunakan untuk melamar pekerjaan.
    </p>
  </article>
</template>
