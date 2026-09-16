<script setup lang="ts">
/**
 * The homepage.
 *
 * Seven sections, each about a screen, divided by one rule that runs the width of the page. Every
 * section says one thing: a heading, a line, and something you can work. The mark is the same
 * object throughout, and it only ever moves because the reader asked it to.
 */
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useCycle, usePairs } from './useCycle'
import Stage from './Stage.vue'
import CommunitySection from './CommunitySection.vue'
import HomeFooter from './HomeFooter.vue'
import { CONCEPTS, FILES, LAYER_CODE, LITE_STEPS, MOVES, STOPS, tokenize, type View } from './content'
import { FACADE_INFO, FACADE_LINK, LAYERS, LAYER_ORDER, LITE, type LayerKey, type PieceState } from './geometry'

/* The snap is on the document, so it has to be put on and taken off with the page. */
onMounted(() => document.documentElement.classList.add('g-home-snap'))
onBeforeUnmount(() => document.documentElement.classList.remove('g-home-snap'))

const nameOf = (k: LayerKey | null | undefined) => (k ? LAYERS.find((l) => l.key === k)!.name : 'Your code')

function lit(layer?: LayerKey | null) {
  const out: Partial<Record<LayerKey, PieceState>> = {}
  for (const k of LAYER_ORDER) out[k] = k === layer ? 'active' : 'solid'
  return out
}

// ------------------------------------------------------------------ hero
const heroView: View = { kind: 'hero', states: lit(), caption: 'The Goravel mark, with one request inside it.' }

// ------------------------------------------------------------------ one request
const { index: stopIndex, set: setStop, root: stopsRoot } = useCycle(STOPS.length, 2600)
const stop = computed(() => STOPS[stopIndex.value])
const stopView = computed<View>(() => ({
  kind: 'journey',
  states: lit(stop.value.layer),
  stop: stop.value.key,
  caption: `${stop.value.name}, handled by ${nameOf(stop.value.layer)}`
}))

// ------------------------------------------------------------------ Laravel, in Go
const { index: conceptIndex, set: setConcept, root: conceptRoot } = useCycle(CONCEPTS.length, 5200)
const concept = computed(() => CONCEPTS[conceptIndex.value])
const conceptView = computed<View>(() => ({
  kind: 'parity',
  states: lit(concept.value.layer),
  turn: conceptIndex.value % 3,
  caption: `${concept.value.name}, handled by ${nameOf(concept.value.layer)}`
}))

// ------------------------------------------------------------------ five layers
const { index: layerIndex, set: setLayer, root: layerRoot } = useCycle(LAYERS.length, 3200)
const layer = computed(() => LAYERS[layerIndex.value])
const layerKey = computed(() => layer.value.key)
const selectLayer = (k: LayerKey) => setLayer(LAYERS.findIndex((l) => l.key === k))
const layerView = computed<View>(() => {
  // the rest of the mark stays solid, so you can see the hole the piece came out of
  const states: Partial<Record<LayerKey, PieceState>> = {}
  for (const k of LAYER_ORDER) states[k] = k === layerKey.value ? 'active' : 'solid'
  return {
    kind: 'map',
    states,
    moves: { [layerKey.value]: MOVES[layerKey.value] },
    caption: `The ${layer.value.name} piece, pulled out of the mark`
  }
})

// ------------------------------------------------------------------ start with the core
const { index: liteIndex, set: setLite, root: liteRoot } = useCycle(LITE_STEPS.length, 2400)
const liteStep = computed(() => LITE_STEPS[liteIndex.value])
const installed = computed(() =>
  liteIndex.value === LITE_STEPS.length - 1
    ? LAYERS.flatMap((l) => l.facades)
    : [...LITE, ...LITE_STEPS.slice(1, liteIndex.value + 1).flatMap((s) => s.add)]
)
const liteView = computed<View>(() => {
  const added = liteIndex.value === 0 ? [] : liteStep.value.add
  const states: Partial<Record<LayerKey, PieceState>> = {}
  for (const l of LAYERS) {
    const have = l.facades.filter((f) => installed.value.includes(f))
    states[l.key] = !have.length
      ? 'ghost'
      : have.some((f) => added.includes(f)) || added.includes('*')
        ? 'active'
        : 'solid'
  }
  return { kind: 'lite', states, caption: `${installed.value.length} of 30 facades installed` }
})

/** Which two lines are being matched at this moment. */
const { step: tieStep, root: tieRoot } = usePairs(() => concept.value.ties, 1500)
const pair = computed(() => concept.value.ties[tieStep.value % concept.value.ties.length] ?? [0, 0])
</script>

<template>
  <div class="g-home">
    <!-- ---------------------------------------------------------- hero -->
    <section class="g-sec is-hero">
      <div class="g-wrap g-hero-grid">
        <div>
          <h1 class="g-display">Familiar structure.<br /><span class="light">Native Go.</span></h1>
          <p class="g-lead">Routing, an ORM, validation, queues, events and cache, in one framework.</p>
          <div class="g-actions">
            <a class="g-button" href="/getting-started/installation.html">
              Get started
              <svg class="g-arrow" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
                <path d="M3 10h13M11 5l5 5-5 5" />
              </svg>
            </a>
            <a class="g-button is-outline" href="/getting-started/configuration.html">Read the documentation</a>
          </div>
        </div>
        <div class="g-proof">
          <div class="g-proof-pane">
            <span class="g-label">Laravel · PHP</span>
            <pre class="g-code is-plain"><code><span
              v-for="(ln, n) in tokenize(CONCEPTS[0].php, 'php')" :key="n" class="ln"><span
              v-for="(t, j) in ln" :key="j" :class="{ call: t.call }">{{ t.text }}</span>
</span></code></pre>
          </div>

          <div class="g-proof-join" aria-hidden="true">
            <svg viewBox="0 0 14 14" width="14" height="14"><path d="M7 0l7 7-7 7-7-7z" /></svg>
          </div>

          <div class="g-proof-pane is-go">
            <span class="g-label cyan">Goravel · Go</span>
            <pre class="g-code is-plain"><code><span
              v-for="(ln, n) in tokenize(CONCEPTS[0].go)" :key="n" class="ln"><span
              v-for="(t, j) in ln" :key="j" :class="{ call: t.call }">{{ t.text }}</span>
</span></code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- ---------------------------------------------------------- one request -->
    <section class="g-sec">
      <div class="g-wrap">
        <header class="g-sec-head">
          <h2 class="g-h2">Follow one request.</h2>
          <p class="g-lead"><code class="g-inline">GET /tasks</code>, from the router to the response.</p>
        </header>

        <nav ref="stopsRoot" class="g-tabs" aria-label="Request stops">
          <button
            v-for="(s, i) in STOPS"
            :key="s.key"
            type="button"
            class="g-tab"
            :class="{ 'is-active': i === stopIndex }"
            :aria-current="i === stopIndex"
            @click="setStop(i)"
          >{{ s.name }}</button>
        </nav>

        <div class="g-panel">
          <div class="g-figure">
            <Stage :view="stopView" :width="400" :height="368" :scale="0.9" />
          </div>
          <div class="g-panel-body">
            <div class="g-file-head">
              <span class="g-label">{{ nameOf(stop.layer) }}</span>
              <span class="g-meta">{{ FILES[stop.file].name }}</span>
            </div>
            <pre :key="stopIndex" class="g-code g-swap"><code><span
              v-for="(line, n) in FILES[stop.file].lines"
              :key="n"
              class="ln"
              :class="{ 'is-lit': stop.lit.includes(n + 1) }"
            ><span class="no">{{ n + 1 }}</span><span class="src"><span
              v-for="(t, j) in tokenize(line)[0]"
              :key="j"
              :class="{ call: t.call }"
            >{{ t.text }}</span></span></span></code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- ---------------------------------------------------------- Laravel, in Go -->
    <section class="g-sec">
      <div class="g-wrap">
        <div class="g-sec-split">
          <header class="g-sec-head">
            <h2 class="g-h2">Laravel’s structure, written in Go.</h2>
            <p class="g-lead">The same facades, the same method names, the same file layout.</p>
          </header>
          <div class="g-figure is-small">
            <Stage :view="conceptView" :width="260" :height="240" :scale="0.62" />
          </div>
        </div>

        <nav ref="conceptRoot" class="g-tabs" aria-label="Concepts">
          <button
            v-for="(c, i) in CONCEPTS"
            :key="c.name"
            type="button"
            class="g-tab"
            :class="{ 'is-active': i === conceptIndex }"
            :aria-current="i === conceptIndex"
            @click="setConcept(i)"
          >{{ c.name }}</button>
        </nav>

        <div ref="tieRoot" class="g-compare">
          <div class="g-col">
            <div class="g-file-head">
              <span class="g-label">Laravel · PHP</span>
              <span class="g-meta">{{ concept.phpFile }}</span>
            </div>
            <pre :key="'php' + conceptIndex" class="g-code is-plain g-swap"><code><span
              v-for="(ln, n) in tokenize(concept.php, 'php')"
              :key="n"
              class="ln"
              :class="{ 'is-pair': n + 1 === pair[0] }"
            ><span v-for="(t, j) in ln" :key="j" :class="{ call: t.call }">{{ t.text }}</span>
</span></code></pre>
          </div>
          <div class="g-col">
            <div class="g-file-head">
              <span class="g-label cyan">Goravel · Go</span>
              <span class="g-meta">{{ concept.goFile }}</span>
            </div>
            <pre :key="'go' + conceptIndex" class="g-code is-plain g-swap"><code><span
              v-for="(ln, n) in tokenize(concept.go)"
              :key="n"
              class="ln"
              :class="{ 'is-pair': n + 1 === pair[1] }"
            ><span v-for="(t, j) in ln" :key="j" :class="{ call: t.call }">{{ t.text }}</span>
</span></code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- ---------------------------------------------------------- five layers -->
    <section class="g-sec">
      <div class="g-wrap">
        <header class="g-sec-head">
          <h2 class="g-h2">Five layers, thirty facades.</h2>
          <p class="g-lead">Every facade belongs to one piece of the mark. Choose a piece.</p>
        </header>

        <nav ref="layerRoot" class="g-tabs" aria-label="Layers">
          <button
            v-for="(l, i) in LAYERS"
            :key="l.key"
            type="button"
            class="g-tab"
            :class="{ 'is-active': l.key === layerKey }"
            :aria-current="l.key === layerKey"
            @click="setLayer(i)"
          >{{ l.name }}</button>
        </nav>

        <div class="g-panel is-layers">
          <div class="g-figure">
            <Stage :view="layerView" :width="460" :height="420" :scale="0.94" @select="selectLayer" />
          </div>
          <div class="g-panel-body">
            <ul :key="layerIndex" class="g-facades g-swap">
              <li v-for="f in layer.facades" :key="f">
                <a :href="FACADE_LINK[f]" :title="FACADE_INFO[f]">{{ f }}</a>
              </li>
            </ul>
            <pre class="g-code is-plain g-layer-code"><code><span
              v-for="(ln, n) in tokenize(LAYER_CODE[layerKey])" :key="n" class="ln"><span
              v-for="(t, j) in ln" :key="j" :class="{ call: t.call }">{{ t.text }}</span>
</span></code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- ---------------------------------------------------------- lite -->
    <section class="g-sec">
      <div class="g-wrap">
        <header class="g-sec-head">
          <h2 class="g-h2">Start with the core.</h2>
          <p class="g-lead">Goravel Lite is four facades. Add the rest when you need them.</p>
        </header>

        <nav ref="liteRoot" class="g-tabs" aria-label="Install steps">
          <button
            v-for="(s, i) in LITE_STEPS"
            :key="s.title"
            type="button"
            class="g-tab"
            :class="{ 'is-active': i === liteIndex }"
            :aria-current="i === liteIndex"
            @click="setLite(i)"
          >{{ s.title }}</button>
        </nav>

        <div class="g-panel">
          <div class="g-figure is-small">
            <Stage :view="liteView" :width="380" :height="360" :scale="0.86" />
          </div>
          <div class="g-panel-body">
            <pre class="g-code is-shell"><code><span class="ln"><span class="prompt">$</span><span class="src">{{ liteStep.cmd }}</span></span></code></pre>
            <p class="g-count">
              <span class="n">{{ installed.length }}</span><span class="muted"> / 30</span>
              <span class="g-body muted">facades installed</span>
            </p>
          </div>
        </div>
      </div>
    </section>

    <div class="g-wrap">
      <CommunitySection />
      <HomeFooter />
    </div>
  </div>
</template>
