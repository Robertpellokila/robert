<script setup lang="ts">
import { computed, ref } from "vue";
import {
  chapters,
  owner,
  experiences,
  skills,
  education,
} from "~/data/portfolio";
import { projects } from "~/data/projects";

const props = defineProps<{ webglAvailable: boolean; notice?: string }>();
const emit = defineEmits<{ switch3d: []; replayWelcome: [] }>();
const menuOpen = ref(false);
const projectFilter = ref("All");
const categories = computed(() => [
  "All",
  ...new Set(projects.map((project) => project.tag)),
]);
const featuredProjects = computed(() =>
  [...projects].sort((a, b) => Number(b.featured) - Number(a.featured)),
);
const displayedProjects = computed(() =>
  featuredProjects.value.filter(
    (project) =>
      projectFilter.value === "All" || project.tag === projectFilter.value,
  ),
);
const skillGroups = computed(() => {
  return skills.reduce<Record<string, typeof skills>>((groups, skill) => {
    (groups[skill.group] ??= []).push(skill);
    return groups;
  }, {});
});
const githubUrl = computed(() =>
  owner.githubUsername
    ? `https://github.com/${encodeURIComponent(owner.githubUsername)}`
    : "",
);
</script>

<template>
  <div id="top" class="lite-portfolio lite-pro">
    <a class="lite-skip" href="#lite-main">Skip to content</a>
    <header class="lite-pro-header">
      <a class="lite-pro-brand" href="#top" @click="menuOpen = false"
        ><span class="lite-pro-mark">R<span>·</span></span
        ><span>{{ owner.name }}<span class="lite-pro-dot">.</span></span></a
      >
      <nav
        :class="['lite-pro-nav', { 'is-open': menuOpen }]"
        aria-label="Portfolio navigation"
      >
        <a
          v-for="chapter in chapters"
          :key="chapter.id"
          :href="`#lite-${chapter.id}`"
          @click="menuOpen = false"
          >{{ chapter.id }}</a
        >
      </nav>
      <div class="lite-pro-header-tools">
        <button
          class="lite-pro-world"
          type="button"
          :disabled="!webglAvailable"
          :title="webglAvailable ? 'Explore 3D world' : '3D World needs WebGL2'"
          @click="emit('switch3d')"
        >
          Explore 3D <span aria-hidden="true">↗</span>
        </button>
        <button
          class="lite-pro-menu"
          type="button"
          :aria-expanded="menuOpen"
          aria-label="Toggle navigation"
          @click="menuOpen = !menuOpen"
        >
          {{ menuOpen ? "Close" : "Menu" }}
          <span aria-hidden="true">{{ menuOpen ? "×" : "☰" }}</span>
        </button>
      </div>
    </header>

    <p v-if="notice" class="lite-pro-notice" role="status">{{ notice }}</p>
    <main id="lite-main" class="lite-pro-main">
      <section id="lite-home" class="lite-pro-hero">
        <div class="lite-pro-hero-copy">
          <p class="lite-pro-overline">
            <span class="lite-pro-pulse" aria-hidden="true" /> DEVELOPER /
            CREATIVE TECHNOLOGY
          </p>
          <h1>Building meaningful <em>digital experiences.</em></h1>
          <p class="lite-pro-intro">
            {{ owner.role }} based in {{ owner.location }}. I turn ideas into
            thoughtful, useful and occasionally playful products.
          </p>
          <div class="lite-pro-hero-cta">
            <a href="#lite-projects" class="lite-pro-btn"
              >Explore selected work <span aria-hidden="true">↗</span></a
            ><a href="#lite-about" class="lite-pro-ghost"
              >Get to know me <span aria-hidden="true">↘</span></a
            >
          </div>
          <div class="lite-pro-facts">
            <div>
              <strong>{{ String(projects.length).padStart(2, "0") }}</strong
              ><span>Selected projects</span>
            </div>
            <div>
              <strong>{{ String(skills.length).padStart(2, "0") }}</strong
              ><span>Tools & skills</span>
            </div>
            <div>
              <strong>3D</strong><span>Alternate world experience</span>
            </div>
          </div>
        </div>
        <div
          class="lite-pro-hero-art"
          aria-label="Portfolio illustration and portrait"
        >
          <div class="lite-pro-art-grid" aria-hidden="true"></div>
          <div class="lite-pro-art-header">
            <span>MY LITTLE WORLD</span><span>EST. 2022</span>
          </div>
          <div class="lite-pro-art-window">
            <img
              v-if="owner.photo"
              :src="owner.photo"
              :alt="`Portrait of ${owner.name}`"
              fetchpriority="high"
            /><span v-else>{{ owner.name.slice(0, 1) }}</span>
          </div>
          <div class="lite-pro-art-caption">
            <span>01 / THE CREATOR</span
            ><strong>Hi, I'm {{ owner.name }}.</strong
            ><span>Web · Learning · Creative tech</span>
          </div>
          <span class="lite-pro-art-star" aria-hidden="true">✳</span>
        </div>
      </section>
      <div class="lite-pro-marquee" aria-hidden="true">
        <span>DESIGN WITH PURPOSE</span><span>✳</span
        ><span>BUILD WITH CURIOSITY</span><span>✳</span
        ><span>KEEP LEARNING</span>
      </div>
      <section id="lite-about" class="lite-pro-section lite-pro-about">
        <div class="lite-pro-section-head">
          <span class="lite-pro-index">01 / ABOUT</span>
          <h2>The person behind <em>the pixels.</em></h2>
        </div>
        <div class="lite-pro-about-layout">
          <div class="lite-pro-about-story">
            <p class="lite-pro-large">
              I enjoy making technology feel more human.
            </p>
            <p>{{ chapters[1]!.description }}</p>
            <p>
              My interests connect web development, learning experiences and
              creative experiments. I like approaching ideas with curiosity,
              prototyping them and improving through testing.
            </p>
            <div class="lite-pro-note">
              <span>MY APPROACH</span
              ><strong>Understand → Design → Build → Iterate.</strong>
            </div>
          </div>
          <div class="lite-pro-about-aside">
            <span class="lite-pro-mini-label">A LITTLE MORE ABOUT ME</span>
            <dl>
              <div>
                <dt>Role</dt>
                <dd>{{ owner.role }}</dd>
              </div>
              <div>
                <dt>Based in</dt>
                <dd>{{ owner.location }}</dd>
              </div>
              <div>
                <dt>Focus</dt>
                <dd>Web applications, education & creative technology</dd>
              </div>
            </dl>
            <a class="lite-pro-textlink" href="#lite-experience"
              >My journey <span aria-hidden="true">↗</span></a
            >
          </div>
        </div>
      </section>
      <section
        id="lite-experience"
        class="lite-pro-section lite-pro-experience"
      >
        <div class="lite-pro-section-head">
          <span class="lite-pro-index">02 / EXPERIENCE</span>
          <h2>A journey of <em>learning by doing.</em></h2>
        </div>
        <div class="lite-pro-timeline">
          <article
            v-for="(job, i) in experiences"
            :key="`${job.company}-${i}`"
            class="lite-pro-timeline-item"
          >
            <span class="lite-pro-timeline-num">{{
              String(i + 1).padStart(2, "0")
            }}</span>
            <div>
              <span class="lite-pro-tag">{{ job.company }}</span>
              <h3>{{ job.role }}</h3>
              <p>{{ job.description }}</p>
            </div>
            <small v-if="job.period && job.period !== 'Isi periode'">{{
              job.period
            }}</small>
          </article>
          <article
            v-for="(school, i) in education"
            :key="`education-${i}`"
            class="lite-pro-timeline-item"
          >
            <span class="lite-pro-timeline-num">E{{ i + 1 }}</span>
            <div>
              <span class="lite-pro-tag">{{ school.institution }}</span>
              <h3>{{ school.program }}</h3>
              <p>{{ school.detail }}</p>
            </div>
            <small>{{ school.period }}</small>
          </article>
        </div>
        <NuxtLink class="lite-pro-textlink" to="/resume"
          >View my resume <span aria-hidden="true">↗</span></NuxtLink
        >
      </section>
      <section id="lite-skills" class="lite-pro-section lite-pro-skills">
        <div class="lite-pro-section-head">
          <span class="lite-pro-index">03 / CAPABILITIES</span>
          <h2>Tools for making <em>things happen.</em></h2>
        </div>
        <div class="lite-pro-skills-layout">
          <div>
            <p class="lite-pro-large">
              From frontend interfaces to APIs and connected experiences.
            </p>
            <p>{{ chapters[3]!.description }}</p>
          </div>
          <div class="lite-pro-skill-groups">
            <div
              v-for="(list, group) in skillGroups"
              :key="group"
              class="lite-pro-skill-group"
            >
              <h3>{{ group }}</h3>
              <div>
                <span v-for="skill in list" :key="skill.label">{{
                  skill.label
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="lite-pro-github"><GitHubHighlights /></div>
      </section>
      <section id="lite-projects" class="lite-pro-section lite-pro-projects">
        <div class="lite-pro-section-head">
          <span class="lite-pro-index">04 / SELECTED WORK</span>
          <h2>Ideas turned into <em>real projects.</em></h2>
          <p>
            Selected prototypes, works in progress, and product concepts. Status
            labels reflect the actual stage of each project.
          </p>
        </div>
        <div
          class="lite-pro-filterbar"
          role="group"
          aria-label="Filter projects"
        >
          <button
            v-for="category in categories"
            :key="category"
            type="button"
            :aria-pressed="projectFilter === category"
            :class="{ selected: projectFilter === category }"
            @click="projectFilter = category"
          >
            {{ category }}
          </button>
        </div>
        <div class="lite-pro-work-grid">
          <article
            v-for="(project, i) in displayedProjects"
            :key="project.slug"
            class="lite-pro-work-card"
          >
            <NuxtLink
              :to="`/projects/${project.slug}`"
              class="lite-pro-work-image"
              :aria-label="`View ${project.name} case study`"
              ><img
                :src="project.cover"
                :alt="project.coverLabel"
                loading="lazy"
                decoding="async"
              /><span class="lite-pro-work-arrow" aria-hidden="true"
                >↗</span
              ></NuxtLink
            >
            <div class="lite-pro-work-content">
              <div class="lite-pro-work-meta">
                <span
                  >{{ String(i + 1).padStart(2, "0") }} /
                  {{ project.kind }}</span
                ><span>{{ project.tag }}</span>
              </div>
              <h3>{{ project.name }}</h3>
              <p>{{ project.summary }}</p>
              <div class="lite-pro-work-tags">
                <span v-for="tech in project.technologies" :key="tech">{{
                  tech
                }}</span>
              </div>
              <NuxtLink
                :to="`/projects/${project.slug}`"
                class="lite-pro-textlink"
                >Explore case study <span aria-hidden="true">↗</span></NuxtLink
              >
            </div>
          </article>
        </div>
        <p v-if="!displayedProjects.length" class="lite-pro-empty">
          No projects match this filter yet. Choose another category.
        </p>
        <p class="lite-pro-concept-note">
          Project illustrations are concept artwork where noted, not screenshots
          of completed apps.
        </p>
      </section>
      <section id="lite-contact" class="lite-pro-contact lite-pro-contact-v12">
        <div class="lite-contact-copy">
          <span class="lite-pro-index">05 / COFFEE & CONNECT</span>
          <h2>Have a project <em>in mind?</em></h2>
          <p>
            Let's turn your idea into something meaningful. Share an
            opportunity, a freelance project, or simply say hello.
          </p>
          <div class="lite-contact-badges">
            <span>✳ Creative collaboration</span><span>↗ Open for ideas</span>
          </div>
        </div>
        <div class="lite-contact-form"><ContactForm /></div>
      </section>
    </main>
    <footer class="lite-pro-footer">
      <button
        type="button"
        class="lite-pro-replay-welcome"
        @click="emit('replayWelcome')"
      >
        Replay welcome ✳</button
      ><span
        >{{ owner.name }}. <small>© 2022 · Crafted with curiosity.</small></span
      ><a href="#top">Back to the top ↑</a>
    </footer>
  </div>
</template>
