<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  chapters,
  experiences,
  owner,
  projects,
  skills,
  welcomeSettings,
  type ChapterId,
} from "~/data/portfolio";
import { rooms } from "~/data/rooms";
import { validDiscoveryIds } from "~/utils/visitorExperience";
import { travelLabels } from "~/utils/journey";
import { getCinematicState } from "~/utils/cinematicJourney";
import type { TimeOfDay } from "~/world/livingWorld";
import { supportsWebGL2, type ExperienceMode } from "~/utils/experienceMode";
import type {
  QualityPreference,
  RenderQualityTier,
} from "~/utils/renderQuality";
import { nextTick } from "vue";
import { roomObjectsFor } from "~/data/roomObjects";
import type { ExplorerInput } from "~/world/roomExplorer";
import { entryVeilOpacity } from "~/utils/roomTransitions";

// Lazy callback is only called after Vue has mounted the component.
const {
  journeyElement,
  progress,
  activeIndex,
  progressPercent,
  goToChapter,
  travelling,
} = useJourney(
  chapters.length,
  () =>
    experienceMode.value === "3d" &&
    !enteredRoom.value &&
    !mobileToolsOpen.value &&
    !mobileSheetExpanded.value,
);
const current = computed(() => chapters[activeIndex.value]!);
const travelState = computed(() => getCinematicState(progress.value));
const tripMode = computed(() => travelLabels[travelState.value.mode]);
// v0.8: server-friendly Lite HTML first; hydrate into 3D only on capable clients.
const experienceMode = ref<ExperienceMode>("lite");
const webglAvailable = ref(false);
const qualityPreference = ref<QualityPreference>("auto");
const actualQuality = ref<RenderQualityTier>("balanced");
const measuredFps = ref(0);
const worldLoading = ref(false);
// A unique signal starts the avatar's invitation only after the visitor chooses 3D.
const greetingSignal = ref(0);
// Nuxt useState survives internal page navigation, but resets on a full reload.
// The welcome is therefore shown on a fresh visit, not after every in-app switch.
const welcomeCompleted = useState<boolean>(
  "mlw-welcome-completed",
  () => false,
);
const showWelcomeSplash = computed(() => !welcomeCompleted.value);
// Two distinct stages: timed cinematic intro, then a compact choice over real WebGL.
type EntryStage = "intro" | "choose" | "done";
const entryStage = ref<EntryStage>("intro");
let introTimeout: ReturnType<typeof setTimeout> | undefined;
function stopIntroTimer() {
  if (introTimeout !== undefined) clearTimeout(introTimeout);
  introTimeout = undefined;
}
function finishIntro() {
  stopIntroTimer();
  if (!welcomeCompleted.value) entryStage.value = "choose";
}
function startIntro() {
  stopIntroTimer();
  entryStage.value = "intro";
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  introTimeout = setTimeout(
    finishIntro,
    reducedMotion ? 350 : welcomeSettings.introDurationMs,
  );
}
const experienceNotice = ref("");
const cinematic = ref(true);
const directorMode = ref(false);
const mobileSheetExpanded = ref(false);
const mobileToolsOpen = ref(false);
const roomInput = ref<ExplorerInput>({ forward: 0, strafe: 0, turn: 0 });
const selectedRoomObject = ref<string | null>(null);
const roomObjects = computed(() =>
  enteredRoom.value ? roomObjectsFor(enteredRoom.value) : [],
);
function inspectRoomObject(chapter: ChapterId, objectId: string) {
  if (enteredRoom.value !== chapter || entryProgress.value < 0.98) return;
  selectedRoomObject.value = objectId;
  roomInput.value = { forward: 0, strafe: 0, turn: 0 };
}
watch(activeIndex, () => {
  mobileSheetExpanded.value = false;
  mobileToolsOpen.value = false;
});
// v0.7 discoveries are optional, and remain accessible without clicking tiny 3D objects.
const collectedDiscoveries = ref<ChapterId[]>([]);
const selectedDiscovery = ref<ChapterId | null>(null);
function discover(id: ChapterId) {
  selectedDiscovery.value = id;
  collectedDiscoveries.value = validDiscoveryIds([
    ...collectedDiscoveries.value,
    id,
  ]);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        "mlw-discoveries-v07",
        JSON.stringify(collectedDiscoveries.value),
      );
    } catch {
      /* optional */
    }
  }
}
function jumpFromMap(index: number) {
  mobileSheetExpanded.value = false;
  mobileToolsOpen.value = false;
  // Unlike menu navigation, a map jump stops outside the building.
  pendingRoom.value = null;
  if (enteredRoom.value) {
    activeTween?.kill();
    enteredRoom.value = null;
    selectedRoomObject.value = null;
    entryProgress.value = 0;
    document.body.style.overflow = savedBodyOverflow;
  }
  selectedDiscovery.value = null;
  selectedRoomObject.value = null;
  goToChapter(index);
}
// Living World v0.6: atmospheric settings are separate from travel scroll.
const timeOfDay = ref<TimeOfDay>("day");
const worldMotion = ref(true);
const ecoMode = computed(() => actualQuality.value === "low");
const ambient = useAmbientAudio();
function setTime(value: TimeOfDay) {
  timeOfDay.value = value;
}
watch([timeOfDay, worldMotion], () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      "mlw-world-v06",
      JSON.stringify({ timeOfDay: timeOfDay.value, motion: worldMotion.value }),
    );
  } catch {
    /* storage disabled */
  }
});
const phasePercent = computed(() =>
  Math.round(travelState.value.phaseProgress * 100),
);
const photoFailed = ref(false);
const githubLink = computed(() =>
  owner.githubUsername ? `https://github.com/${owner.githubUsername}` : "",
);

/** v0.4: navigasi antar bangunan. State ini terpisah dari progress scroll.
 * Masuk gedung adalah aksi eksplisit; scroll manual tetap menjalankan perjalanan.
 * Klik menu atas -> perjalanan -> otomatis masuk ketika tiba.
 */
const enteredRoom = ref<ChapterId | null>(null);
const entryProgress = ref(0);
const pendingRoom = ref<ChapterId | null>(null);
const entranceReady = computed(
  () => enteredRoom.value !== null && entryProgress.value >= 0.995,
);
const roomLabel = computed(() => rooms[current.value.id]?.label ?? "Building");
let activeTween: { kill: () => void } | null = null;
let savedBodyOverflow = "";

async function enterBuilding(id: ChapterId) {
  if (enteredRoom.value) return;
  pendingRoom.value = null;
  mobileToolsOpen.value = false;
  enteredRoom.value = id;
  selectedRoomObject.value = null;
  roomInput.value = { forward: 0, strafe: 0, turn: 0 };
  entryProgress.value = 0;
  if (typeof document !== "undefined") {
    savedBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  try {
    const { gsap } = await import("gsap");
    if (enteredRoom.value !== id) return;
    const value = { progress: 0 };
    activeTween?.kill();
    activeTween = gsap.to(value, {
      progress: 1,
      duration: 2.15,
      ease: "power2.inOut",
      onUpdate: () => {
        entryProgress.value = value.progress;
      },
    });
  } catch (err) {
    console.error("Entrance animation unavailable", err);
    entryProgress.value = 1;
  }
}

async function leaveBuilding() {
  selectedRoomObject.value = null;
  roomInput.value = { forward: 0, strafe: 0, turn: 0 };
  pendingRoom.value = null;
  activeTween?.kill();
  try {
    const { gsap } = await import("gsap");
    const value = { progress: entryProgress.value };
    activeTween = gsap.to(value, {
      progress: 0,
      duration: 1.45,
      ease: "power2.inOut",
      onUpdate: () => {
        entryProgress.value = value.progress;
      },
      onComplete: () => {
        enteredRoom.value = null;
        document.body.style.overflow = savedBodyOverflow;
      },
    });
  } catch {
    entryProgress.value = 0;
    enteredRoom.value = null;
    document.body.style.overflow = savedBodyOverflow;
  }
}

function visitChapter(index: number) {
  mobileSheetExpanded.value = false;
  mobileToolsOpen.value = false;
  const safe = Math.max(0, Math.min(chapters.length - 1, index));
  const id = chapters[safe]!.id;
  if (enteredRoom.value) {
    // Pindah section saat berada di interior: keluar dulu, lalu pergi.
    activeTween?.kill();
    enteredRoom.value = null;
    selectedRoomObject.value = null;
    entryProgress.value = 0;
    document.body.style.overflow = savedBodyOverflow;
  }
  pendingRoom.value = id;
  if (Math.abs(progress.value - safe / (chapters.length - 1)) < 0.002) {
    void enterBuilding(id);
  } else {
    goToChapter(safe);
  }
}
watch(progress, (value) => {
  if (!pendingRoom.value || enteredRoom.value) return;
  const index = chapters.findIndex((item) => item.id === pendingRoom.value);
  if (index < 0) return;
  if (Math.abs(value - index / (chapters.length - 1)) < 0.002) {
    void enterBuilding(pendingRoom.value);
  }
});
function handleEscape(event: KeyboardEvent) {
  if (event.key === "Escape" && selectedRoomObject.value) {
    selectedRoomObject.value = null;
    return;
  }
  if (event.key === "Escape" && mobileToolsOpen.value) {
    mobileToolsOpen.value = false;
    return;
  }
  if (event.key === "Escape" && mobileSheetExpanded.value) {
    mobileSheetExpanded.value = false;
    return;
  }
  if (event.key === "Escape" && selectedDiscovery.value) {
    selectedDiscovery.value = null;
    return;
  }
  if (
    event.key === "Escape" &&
    enteredRoom.value &&
    !document.querySelector("[data-project-preview]")
  )
    void leaveBuilding();
}
function persistExperience() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      "mlw-experience-v08",
      JSON.stringify({
        mode: experienceMode.value,
        quality: qualityPreference.value,
      }),
    );
  } catch {
    /* private mode */
  }
}
function changeQuality(value: QualityPreference) {
  if (!["auto", "high", "balanced", "low"].includes(value)) return;
  qualityPreference.value = value;
  if (value !== "auto") actualQuality.value = value;
  persistExperience();
}
function changeExperience(value: ExperienceMode) {
  mobileSheetExpanded.value = false;
  mobileToolsOpen.value = false;
  if (value === "3d" && !webglAvailable.value) {
    experienceNotice.value =
      "WebGL2 tidak tersedia. Gunakan Lite atau aktifkan hardware acceleration.";
    return;
  }
  // All in-portfolio mode switches are direct: never reopen the welcome.
  welcomeCompleted.value = true;
  if (value === "3d") greetingSignal.value++;
  experienceNotice.value = "";
  if (value === experienceMode.value) {
    persistExperience();
    return;
  }
  if (enteredRoom.value) {
    activeTween?.kill();
    enteredRoom.value = null;
    selectedRoomObject.value = null;
    entryProgress.value = 0;
    document.body.style.overflow = savedBodyOverflow;
  }
  if (value === "lite") void ambient.turnOff();
  experienceMode.value = value;
  worldLoading.value = value === "3d";
  measuredFps.value = 0;
  persistExperience();
  void nextTick(() => window.scrollTo({ top: 0, behavior: "instant" }));
}

function beginExperience(mode: ExperienceMode) {
  if (mode === "3d" && !webglAvailable.value) return;
  stopIntroTimer();
  // Choosing the already-rendered 3D preview must dismiss the chooser too.
  entryStage.value = "done";
  changeExperience(mode);
}
function goDirectlyTo3D() {
  // The Lite header always enters the 3D renderer, not the welcome chooser.
  changeExperience("3d");
}
function replayWelcome() {
  // Replay is explicit; ordinary Lite ↔ 3D switches never reopen the intro.
  welcomeCompleted.value = false;
  if (webglAvailable.value) {
    experienceMode.value = "3d";
    worldLoading.value = true;
  }
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    startIntro();
  });
}
function onWorldFatal(message: string) {
  experienceNotice.value = `3D gagal dimuat: ${message}. Mode Lite tetap bisa digunakan.`;
  worldLoading.value = false;
  experienceMode.value = "lite";
  void ambient.turnOff();
  persistExperience();
}
function onWorldPerformance(fps: number, tier: RenderQualityTier) {
  measuredFps.value = fps;
  actualQuality.value = tier;
}
onMounted(() => {
  window.addEventListener("keydown", handleEscape);
  try {
    collectedDiscoveries.value = validDiscoveryIds(
      JSON.parse(window.localStorage.getItem("mlw-discoveries-v07") || "[]"),
    );
  } catch {
    collectedDiscoveries.value = [];
  }
  worldMotion.value = !window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches;
  try {
    const saved = JSON.parse(
      window.localStorage.getItem("mlw-world-v06") || "{}",
    );
    if (["day", "sunset", "night"].includes(saved.timeOfDay))
      timeOfDay.value = saved.timeOfDay;
    if (typeof saved.motion === "boolean") worldMotion.value = saved.motion;
  } catch {
    /* invalid or unavailable preference */
  }
  webglAvailable.value = supportsWebGL2();
  let stored: { mode?: unknown; quality?: unknown } = {};
  try {
    stored = JSON.parse(
      window.localStorage.getItem("mlw-experience-v08") || "{}",
    );
  } catch {
    /* ignore */
  }
  if (["auto", "high", "balanced", "low"].includes(String(stored.quality))) {
    qualityPreference.value = stored.quality as QualityPreference;
  }
  // A real 3D scene is previewed behind the compact chooser when WebGL works.
  // On unsupported/reduced-motion devices the same intro uses a static backdrop.
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  experienceMode.value = welcomeCompleted.value
    ? stored.mode === "3d" && webglAvailable.value
      ? "3d"
      : "lite"
    : webglAvailable.value && !reducedMotion
      ? "3d"
      : "lite";
  worldLoading.value = experienceMode.value === "3d";
  actualQuality.value =
    qualityPreference.value === "auto" ? "balanced" : qualityPreference.value;
  if (!welcomeCompleted.value) startIntro();
  else entryStage.value = "done";
});
watch(
  showWelcomeSplash,
  (open) => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("mlw-welcome-open", open);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  stopIntroTimer();
  if (typeof document !== "undefined")
    document.documentElement.classList.remove("mlw-welcome-open");
  activeTween?.kill();
  if (typeof window !== "undefined")
    window.removeEventListener("keydown", handleEscape);
  if (typeof document !== "undefined" && enteredRoom.value)
    document.body.style.overflow = savedBodyOverflow;
});
</script>

<template>
  <div
    class="portfolio-v08-root portfolio-v081-root portfolio-v082-root portfolio-v083-root"
    :class="{
      'is-inside': !!enteredRoom,
      'is-welcome-preview': showWelcomeSplash,
    }"
  >
    <!-- Intro and chooser are separate, server-safe UI stages. The actual 3D
         world is mounted underneath while the cinematic intro plays. -->
    <ClientOnly>
      <Teleport to="body">
        <PortfolioEntryOverlay
          v-if="showWelcomeSplash"
          :stage="entryStage"
          :webgl-available="webglAvailable"
          :photo="owner.introPhoto || owner.photo"
          :three-d-background="experienceMode === '3d' && !worldLoading"
          @skip="finishIntro"
          @choose="beginExperience"
        />
      </Teleport>
    </ClientOnly>
    <ExperienceSwitch
      v-if="!showWelcomeSplash && experienceMode === '3d'"
      :mode="experienceMode"
      :webgl-available="webglAvailable"
      :loading="worldLoading"
      :quality="qualityPreference"
      :actual-quality="actualQuality"
      :fps="measuredFps"
      :notice="experienceNotice"
      @change-mode="changeExperience"
      @change-quality="changeQuality"
    />
    <LitePortfolio
      v-if="experienceMode === 'lite'"
      :inert="showWelcomeSplash"
      :webgl-available="webglAvailable"
      :notice="experienceNotice"
      @switch3d="goDirectlyTo3D"
      @replay-welcome="replayWelcome"
    />
    <main
      v-else
      :inert="showWelcomeSplash"
      class="site-shell"
      :class="{
        'world--night': timeOfDay === 'night',
        'world--sunset': timeOfDay === 'sunset',
      }"
    >
      <div class="scene-layer" aria-hidden="true">
        <ClientOnly>
          <WorldScene
            :progress="progress"
            :cinematic="cinematic"
            :interior-chapter="enteredRoom"
            :entrance-progress="entryProgress"
            :time-of-day="timeOfDay"
            :world-motion="worldMotion"
            :eco-mode="ecoMode"
            :quality-preference="qualityPreference"
            :explorer-input="roomInput"
            :greeting-signal="greetingSignal"
            @room-object="inspectRoomObject"
            @discover="discover"
            @ready="worldLoading = false"
            @fatal="onWorldFatal"
            @performance="onWorldPerformance"
          />
          <template #fallback
            ><div class="world-scene scene-loading">
              Preparing your miniature world…
            </div></template
          >
        </ClientOnly>
      </div>
      <div
        v-if="worldLoading"
        class="world-loading-screen"
        role="status"
        aria-live="polite"
      >
        <span class="world-loading-icon">◇</span
        ><strong>Building your little world…</strong
        ><span
          >Preparing 3D scene and camera. You can switch to Lite at any
          time.</span
        >
      </div>

      <div
        ref="journeyElement"
        class="journey-track"
        aria-label="Portfolio journey"
      >
        <section
          v-for="chapter in chapters"
          :id="chapter.id"
          :key="chapter.id"
          class="journey-section"
          :aria-label="chapter.title"
        />
      </div>

      <header class="topbar">
        <button
          class="brand"
          type="button"
          aria-label="Return to home"
          @click="visitChapter(0)"
        >
          <span class="brand-mark"><span class="brand-dot" /></span>
          <span class="brand-name"
            >{{ owner.name }}<span class="brand-period">.</span></span
          >
          <span class="brand-suffix">/ A LITTLE WORLD</span>
        </button>
        <button
          class="mobile-menu-toggle"
          type="button"
          :aria-expanded="mobileToolsOpen"
          aria-controls="mobile-tools-drawer"
          @click="mobileToolsOpen = !mobileToolsOpen"
        >
          <span class="mobile-menu-current">{{ current.id }}</span>
          <span aria-hidden="true">{{ mobileToolsOpen ? "×" : "☰" }}</span>
        </button>
        <nav
          id="mobile-chapter-nav"
          class="nav"
          aria-label="Primary navigation"
        >
          <button
            v-for="(chapter, index) in chapters"
            :key="chapter.id"
            class="nav-link"
            :class="{ 'is-active': activeIndex === index }"
            type="button"
            :aria-current="activeIndex === index ? 'step' : undefined"
            @click="visitChapter(index)"
          >
            {{ chapter.id }}
          </button>
        </nav>
        <div class="availability">
          <span class="availability-dot" />OPEN TO IDEAS
        </div>
      </header>

      <div class="chapter-rail" aria-label="Journey sections">
        <span class="rail-top">THE JOURNEY</span>
        <div class="rail-stops">
          <button
            v-for="(chapter, index) in chapters"
            :key="chapter.id"
            type="button"
            class="rail-stop"
            :class="{ 'rail-stop-active': activeIndex === index }"
            :title="chapter.id"
            :aria-label="`Go to ${chapter.id}`"
            @click="visitChapter(index)"
          >
            <span class="rail-number">{{ chapter.number }}</span
            ><span class="rail-dot" />
          </button>
        </div>
        <span class="rail-bottom">SCROLL TO EXPLORE</span>
      </div>

      <div class="travel-hud">
        <div class="travel-chip" :title="current.caption">
          <span class="travel-chip-icon">↗</span> {{ tripMode }}
          <span class="travel-chip-separator">·</span> {{ travelState.caption }}
        </div>
        <button
          class="cinematic-toggle"
          type="button"
          :aria-pressed="cinematic"
          :title="
            cinematic
              ? 'Use a calmer follow camera'
              : 'Enable cinematic camera changes'
          "
          @click="cinematic = !cinematic"
        >
          ◉ CAMERA {{ cinematic ? "CINEMATIC" : "CALM" }}
        </button>
        <button
          class="cinematic-toggle"
          type="button"
          :aria-pressed="directorMode"
          title="Show the current journey phase and camera shot for learning"
          @click="directorMode = !directorMode"
        >
          {{ directorMode ? "✕ CLOSE" : "⌘ DIRECTOR MODE" }}
        </button>
      </div>

      <VisitorExperience
        :progress="progress"
        :chapter="current.id"
        :phase="travelState.phase"
        :mode="travelState.mode"
        :collected="collectedDiscoveries"
        :selected="selectedDiscovery"
        :inside="!!enteredRoom"
        :director-open="directorMode"
        @jump="jumpFromMap"
        @discover="discover"
        @close-discovery="selectedDiscovery = null"
        @enter="enterBuilding"
      />

      <WorldControls
        :time-of-day="timeOfDay"
        :motion-enabled="worldMotion"
        :quality-preference="qualityPreference"
        :sound-enabled="ambient.enabled.value"
        :sound-supported="ambient.supported.value"
        :sound-error="ambient.error.value"
        @set-time="setTime"
        @toggle-motion="worldMotion = !worldMotion"
        @set-quality="changeQuality"
        @toggle-sound="ambient.toggle()"
      />

      <aside
        v-if="directorMode"
        class="director-panel"
        aria-label="Journey director learning panel"
      >
        <div class="director-header">
          <strong>DIRECTOR / LIVE STORYBOARD</strong><span>v0.8</span>
        </div>
        <dl>
          <div>
            <dt>ROUTE</dt>
            <dd>
              {{ chapters[travelState.leg]?.id }} →
              {{ chapters[travelState.leg + 1]?.id }}
            </dd>
          </div>
          <div>
            <dt>VEHICLE</dt>
            <dd>{{ travelState.mode }}</dd>
          </div>
          <div>
            <dt>ANIMATION</dt>
            <dd>{{ travelState.phase }}</dd>
          </div>
          <div>
            <dt>CAMERA SHOT</dt>
            <dd>{{ cinematic ? travelState.shot : "follow (calm)" }}</dd>
          </div>
          <div>
            <dt>PHASE PROGRESS</dt>
            <dd>{{ phasePercent }}%</dd>
          </div>
          <div>
            <dt>DISTANCE</dt>
            <dd>{{ Math.round(travelState.distance * 100) }}%</dd>
          </div>
        </dl>
        <div class="director-progress">
          <span :style="{ width: `${phasePercent}%` }" />
        </div>
        <p>
          This panel is for learning. All values come from the current scroll
          position.
        </p>
      </aside>

      <MobileToolsDrawer
        :open="mobileToolsOpen"
        :current="current.id"
        :percent="progressPercent"
        :collected="collectedDiscoveries"
        :time-of-day="timeOfDay"
        :motion-enabled="worldMotion"
        :sound-enabled="ambient.enabled.value"
        :sound-supported="ambient.supported.value"
        :sound-error="ambient.error.value"
        :quality="qualityPreference"
        :cinematic="cinematic"
        @close="mobileToolsOpen = false"
        @navigate="jumpFromMap"
        @discover="discover"
        @set-time="setTime"
        @set-quality="changeQuality"
        @toggle-motion="worldMotion = !worldMotion"
        @toggle-sound="ambient.toggle()"
        @toggle-camera="cinematic = !cinematic"
      />

      <div class="panel-anchor" :class="{ 'is-expanded': mobileSheetExpanded }">
        <button
          class="mobile-sheet-toggle"
          type="button"
          :aria-expanded="mobileSheetExpanded"
          aria-controls="mobile-section-content"
          @click="mobileSheetExpanded = !mobileSheetExpanded"
        >
          <span class="mobile-sheet-handle" aria-hidden="true"></span>
          <span class="mobile-sheet-summary"
            ><small
              >{{ current.number }} /
              {{ String(chapters.length).padStart(2, "0") }} ·
              {{ current.eyebrow }}</small
            ><strong>{{ current.title }}</strong></span
          >
          <span class="mobile-sheet-action"
            >{{ mobileSheetExpanded ? "Close" : "Details" }}
            <span aria-hidden="true">{{
              mobileSheetExpanded ? "⌄" : "⌃"
            }}</span></span
          >
        </button>
        <Transition name="chapter" mode="out-in">
          <article
            id="mobile-section-content"
            :key="current.id"
            class="chapter-card"
            :aria-label="`Current chapter: ${current.id}`"
          >
            <div class="card-topline">
              <span
                >{{ current.number }} /
                {{ String(chapters.length).padStart(2, "0") }}</span
              ><span>MY LITTLE WORLD © 2022</span>
            </div>
            <div class="chapter-eyebrow">
              <span class="mini-sparkle">✳</span> {{ current.eyebrow }}
            </div>
            <h1>{{ current.title }}</h1>
            <p class="chapter-description">{{ current.description }}</p>

            <template v-if="current.id === 'home'">
              <div class="hero-details">
                <span class="detail-pill">✦ {{ owner.role }}</span
                ><span class="detail-pill">⌁ {{ owner.location }}</span>
              </div>
              <button
                class="button-primary"
                type="button"
                @click="visitChapter(1)"
              >
                Start exploring <span>↗</span>
              </button>
            </template>

            <template v-else-if="current.id === 'about'">
              <div class="about-profile">
                <div class="profile-frame">
                  <img
                    v-if="owner.photo && !photoFailed"
                    :src="owner.photo"
                    alt="Foto profil"
                    class="profile-photo"
                    @error="photoFailed = true"
                  />
                  <div
                    v-else
                    class="profile-placeholder"
                    aria-label="Placeholder foto profil"
                  >
                    {{ owner.name.charAt(0) }}
                  </div>
                </div>
                <div class="profile-copy">
                  <span class="fact-label">NICE TO MEET YOU</span>
                  <strong>{{ owner.name }}</strong
                  ><span>{{ owner.role }}</span>
                  <small v-if="photoFailed"
                    >Taruh fotomu di public/images/profile.jpg</small
                  >
                </div>
              </div>
              <div class="about-facts">
                <div>
                  <span class="fact-label">FOCUS</span
                  ><strong>Web, education & creative tech</strong>
                </div>
                <div>
                  <span class="fact-label">APPROACH</span
                  ><strong>Curiosity → Prototype → Improve</strong>
                </div>
              </div>
              <button class="text-link" type="button" @click="visitChapter(2)">
                My experience <span>↗</span>
              </button>
            </template>

            <template v-else-if="current.id === 'experience'">
              <div class="experience-list">
                <div
                  v-for="(job, index) in experiences"
                  :key="`${job.role}-${index}`"
                  class="experience-item"
                >
                  <div class="experience-dot" />
                  <div class="experience-content">
                    <div class="experience-header">
                      <strong>{{ job.role }}</strong
                      ><small>{{
                        job.period === "Isi periode"
                          ? "Period to be confirmed"
                          : job.period
                      }}</small>
                    </div>
                    <span>{{ job.company }}</span>
                    <p>{{ job.description }}</p>
                  </div>
                </div>
              </div>
              <button class="text-link" type="button" @click="visitChapter(3)">
                Explore my skills <span>↗</span>
              </button>
            </template>

            <template v-else-if="current.id === 'skills'">
              <div class="skill-grid">
                <div
                  v-for="skill in skills"
                  :key="skill.label"
                  class="skill-pill"
                >
                  <span class="skill-pip" />{{ skill.label
                  }}<small>{{ skill.group }}</small>
                </div>
              </div>
              <GitHubHighlights />
              <button class="text-link" type="button" @click="visitChapter(4)">
                See what I build <span>↗</span>
              </button>
            </template>

            <template v-else-if="current.id === 'projects'">
              <div class="project-list">
                <NuxtLink
                  v-for="project in projects"
                  :key="project.slug"
                  :to="`/projects/${project.slug}`"
                  class="project-item v05-project-link"
                >
                  <div
                    class="project-icon"
                    :style="{ background: project.color }"
                  >
                    {{ project.initials }}
                  </div>
                  <div class="project-copy">
                    <strong>{{ project.name }} ↗</strong
                    ><span>{{ project.kind }}</span>
                  </div>
                  <span class="project-status">{{ project.tag }}</span>
                </NuxtLink>
              </div>
              <button class="text-link" type="button" @click="visitChapter(5)">
                Let's connect <span>↗</span>
              </button>
            </template>

            <template v-else>
              <div class="contact-actions">
                <a
                  v-if="owner.email"
                  class="button-primary"
                  :href="`mailto:${owner.email}`"
                  >Say hello <span>↗</span></a
                >
                <p v-else class="placeholder-note">
                  Masukkan alamat email di <code>data/portfolio.ts</code> untuk
                  mengaktifkan tombol kontak.
                </p>
                <div class="social-links">
                  <a
                    v-if="githubLink"
                    :href="githubLink"
                    target="_blank"
                    rel="noopener noreferrer"
                    >GitHub ↗</a
                  ><a
                    v-if="owner.linkedin"
                    :href="owner.linkedin"
                    target="_blank"
                    rel="noopener noreferrer"
                    >LinkedIn ↗</a
                  >
                </div>
              </div>
            </template>
            <NuxtLink
              v-if="current.id === 'experience'"
              to="/resume"
              class="text-link"
              >View printable CV ↗</NuxtLink
            >
            <button
              class="interior-enter"
              type="button"
              @click="enterBuilding(current.id)"
            >
              <span>⌂ &nbsp; Explore {{ roomLabel }} in first person</span
              ><span>↗</span>
            </button>
            <div class="card-footer">
              <span>✧ LITTLE DETAILS. BIG IDEAS.</span
              ><span
                >{{ current.number }} —
                {{ String(chapters.length).padStart(2, "0") }}</span
              >
            </div>
          </article>
        </Transition>
      </div>

      <!-- v0.8.3: In the house, the 3D world itself is the UI. The old full-height
         text overlay has been replaced with discoverable 3D objects and a POV HUD. -->
      <RoomExplorerControls
        v-if="enteredRoom && entranceReady"
        :active="!selectedRoomObject"
        :chapter="enteredRoom"
        :label="rooms[enteredRoom].label"
        :objects="roomObjects"
        @change="roomInput = $event"
        @inspect="enteredRoom && inspectRoomObject(enteredRoom, $event)"
        @exit="leaveBuilding"
      />
      <RoomObjectDetails
        v-if="enteredRoom && selectedRoomObject && entranceReady"
        :chapter="enteredRoom"
        :object-id="selectedRoomObject"
        @close="selectedRoomObject = null"
      />
      <div
        v-if="enteredRoom && entryProgress < 0.985"
        class="interior-wait"
        role="status"
      >
        Zooming into {{ rooms[enteredRoom].label }}…
      </div>
      <div
        v-if="enteredRoom && entryProgress > 0.87 && entryProgress < 1"
        class="entry-veil"
        aria-hidden="true"
        :style="{ opacity: entryVeilOpacity(entryProgress) }"
      />

      <div
        v-if="!enteredRoom && travelling"
        class="chapter-stop-hint"
        role="status"
      >
        Following the path — next stop: {{ current.id }}
      </div>
      <div class="bottom-bar">
        <div class="bottom-label">
          <span class="scroll-mouse">↧</span><span>SCROLL TO TRAVEL</span>
        </div>
        <div
          class="progress-track"
          role="progressbar"
          :aria-valuenow="progressPercent"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Journey progress"
        >
          <div
            class="progress-fill"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
        <div class="progress-label">
          {{ String(progressPercent).padStart(2, "0") }}<span>%</span>
        </div>
      </div>
    </main>
  </div>
</template>
