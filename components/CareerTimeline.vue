<script setup lang="ts">
import { education, experiences, owner } from '~/data/portfolio'
</script>
<template>
  <div class="career-timeline">
    <div v-for="(item, index) in experiences" :key="`${item.company}-${index}`" class="career-entry">
      <div class="career-marker"><span>{{ String(index + 1).padStart(2, '0') }}</span></div>
      <div class="career-entry-body">
        <div class="career-meta"><strong>WORK EXPERIENCE</strong><span>{{ item.period && item.period !== 'Isi periode' ? item.period : 'Period to be confirmed' }}</span></div>
        <h3>{{ item.role }}</h3><strong>{{ item.company }}</strong><p>{{ item.description }}</p>
      </div>
    </div>
    <div v-for="(item, index) in education" :key="`${item.institution}-${index}`" class="career-entry">
      <div class="career-marker"><span>ED</span></div>
      <div class="career-entry-body"><div class="career-meta"><strong>EDUCATION</strong><span>{{ item.period }}</span></div>
        <h3>{{ item.program }}</h3><strong>{{ item.institution }}</strong><p>{{ item.detail }}</p>
      </div>
    </div>
    <div class="career-actions">
      <NuxtLink to="/resume" class="interior-primary">View printable CV ↗</NuxtLink>
      <a v-if="owner.cvUrl" class="interior-secondary" :href="owner.cvUrl" target="_blank" rel="noopener noreferrer">Download PDF CV ↗</a>
    </div>
    <p class="interior-note">Lengkapi periode dan pendidikan dengan data yang benar di <code>data/portfolio.ts</code> sebelum dipublikasikan.</p>
  </div>
</template>
