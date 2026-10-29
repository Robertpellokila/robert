<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import type { ExperienceMode } from "~/utils/experienceMode";

const props = defineProps<{
  stage: "intro" | "choose" | "done";
  webglAvailable: boolean;
  threeDBackground: boolean;
  photo: string;
}>();
const emit = defineEmits<{ skip: []; choose: [mode: ExperienceMode] }>();
const photoFailed = ref(false);
const introSkip = ref<HTMLButtonElement | null>(null);
const liteButton = ref<HTMLButtonElement | null>(null);
const worldButton = ref<HTMLButtonElement | null>(null);

watch(
  () => props.stage,
  async (stage) => {
    await nextTick();
    if (stage === "intro") introSkip.value?.focus();
    if (stage === "choose")
      (props.webglAvailable ? worldButton.value : liteButton.value)?.focus();
  },
  { immediate: true },
);

function containFocus(event: KeyboardEvent) {
  if (event.key !== "Tab" || props.stage !== "choose") return;
  const elements = [worldButton.value, liteButton.value].filter(
    (value): value is HTMLButtonElement => !!value && !value.disabled,
  );
  const first = elements[0],
    last = elements[elements.length - 1];
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
</script>

<template>
  <div class="mlw-entry-root" @keydown="containFocus">
    <Transition name="mlw-cinematic-intro">
      <section
        v-if="stage === 'intro'"
        class="mlw-intro"
        aria-label="Welcome introduction"
      >
        <div class="mlw-intro-grain" aria-hidden="true"></div>
        <div class="mlw-intro-content">
          <p class="mlw-intro-eyebrow">A WORLD BY ROBERT &nbsp;·&nbsp; 2022</p>
          <div class="mlw-intro-frame">
            <img
              v-if="photo && !photoFailed"
              :src="photo"
              alt="Portfolio introduction portrait"
              @error="photoFailed = true"
            />
            <div v-else class="mlw-intro-photo-placeholder">
              R<span>·</span>
            </div>
            <div class="mlw-intro-photo-label">
              BUILDING IDEAS, SHARING STORIES
            </div>
          </div>
          <p class="mlw-intro-greeting">HELLO, EXPLORER</p>
          <h1>Welcome to <em>my little world.</em></h1>
          <p class="mlw-intro-tagline">
            Where creativity, technology, and learning meet.
          </p>
        </div>
        <div class="mlw-intro-progress" aria-hidden="true"><span /></div>
        <button
          ref="introSkip"
          class="mlw-intro-skip"
          type="button"
          @click="emit('skip')"
        >
          Skip intro <span aria-hidden="true">↗</span>
        </button>
      </section>
    </Transition>

    <Transition name="mlw-mode-modal">
      <div
        v-if="stage === 'choose'"
        class="mlw-choice-layer"
        role="presentation"
      >
        <div class="mlw-choice-shade" aria-hidden="true"></div>
        <div
          v-if="!threeDBackground"
          class="mlw-choice-fallback"
          aria-hidden="true"
        >
          <div class="mlw-fallback-road"></div>
          <div class="mlw-fallback-home"></div>
          <div class="mlw-fallback-home other"></div>
          <div class="mlw-fallback-tree"></div>
          <div class="mlw-fallback-tree other"></div>
        </div>
        <section
          class="mlw-choice-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mlw-choice-title"
          aria-describedby="mlw-choice-description"
        >
          <div class="mlw-choice-kicker">
            <span class="mlw-choice-dot" aria-hidden="true"></span> THE JOURNEY
            BEGINS HERE
          </div>
          <h2 id="mlw-choice-title">
            A little world.<br /><em>Many stories.</em>
          </h2>
          <p id="mlw-choice-description">
            Explore my work your way. Take a walk through the interactive town,
            or explore a clean portfolio.
          </p>
          <div class="mlw-choice-actions">
            <button
              ref="worldButton"
              class="mlw-choice-btn primary"
              type="button"
              :disabled="!webglAvailable"
              @click="emit('choose', '3d')"
            >
              <span class="mlw-choice-symbol" aria-hidden="true">◇</span>
              <span
                ><strong>Enter the 3D World</strong
                ><small>Explore buildings, stories & projects</small></span
              >
              <span class="mlw-choice-arrow" aria-hidden="true">↗</span>
            </button>
            <button
              ref="liteButton"
              class="mlw-choice-btn secondary"
              type="button"
              @click="emit('choose', 'lite')"
            >
              <span class="mlw-choice-symbol" aria-hidden="true">▤</span>
              <span
                ><strong>View Lite Portfolio</strong
                ><small>Fast & focused professional overview</small></span
              >
              <span class="mlw-choice-arrow" aria-hidden="true">↗</span>
            </button>
          </div>
          <div class="mlw-choice-footer">
            <span>YOU CAN SWITCH MODES LATER</span
            ><span>{{ webglAvailable ? "3D READY" : "LITE RECOMMENDED" }}</span>
          </div>
        </section>
        <div class="mlw-choice-caption" aria-hidden="true">
          <span>ROBERT'S LITTLE WORLD</span
          ><span>SCROLL · EXPLORE · DISCOVER</span>
        </div>
      </div>
    </Transition>
  </div>
</template>
