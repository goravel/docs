<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useHomeI18n } from './i18n'
import { useCycle } from './useCycle'
import GoravelMark from './GoravelMark.vue'
import CommunitySection from './CommunitySection.vue'
import HomeFooter from './HomeFooter.vue'
import { CONCEPTS, FACADES, FILES, LAYERS, LAYER_CODE, LITE, LITE_STEPS, STOPS, tokenize, type LayerKey, type PieceState, type View } from './content'

const { tr, link } = useHomeI18n()

// scroll snap belongs on <html>, so it is added and removed with the page
onMounted(() => document.documentElement.classList.add('g-home-snap'))
onBeforeUnmount(() => document.documentElement.classList.remove('g-home-snap'))

const nameOf = (k: LayerKey | null | undefined) => (k ? LAYERS.find((l) => l.key === k)!.name : 'Your code')

function lit(layer?: LayerKey | null) {
  const out: Partial<Record<LayerKey, PieceState>> = {}
  for (const { key } of LAYERS) out[key] = key === layer ? 'active' : 'solid'
  return out
}

const { index: stopIndex, set: setStop, root: stopsRoot } = useCycle(STOPS.length, 2600)
const stop = computed(() => STOPS[stopIndex.value])
const stopView = computed<View>(() => ({
  kind: 'journey',
  states: lit(stop.value.layer),
  stop: stop.value.key,
  caption: `${stop.value.name}, handled by ${nameOf(stop.value.layer)}`
}))

const { index: conceptIndex, set: setConcept, root: conceptRoot } = useCycle(CONCEPTS.length, 5200)
const concept = computed(() => CONCEPTS[conceptIndex.value])
const conceptView = computed<View>(() => ({
  kind: 'parity',
  states: lit(concept.value.layer),
  turn: conceptIndex.value % 3,
  caption: `${concept.value.name}, handled by ${nameOf(concept.value.layer)}`
}))

const { index: layerIndex, set: setLayer, root: layerRoot } = useCycle(LAYERS.length, 3200)
const layer = computed(() => LAYERS[layerIndex.value])
const layerKey = computed(() => layer.value.key)
const selectLayer = (k: LayerKey) => setLayer(LAYERS.findIndex((l) => l.key === k))
const layerView = computed<View>(() => ({
  kind: 'map',
  states: lit(layerKey.value),
  pulled: [layerKey.value],
  caption: `The ${layer.value.name} piece, pulled out of the mark`
}))

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
  // a layer that is not installed yet waits outside the mark, and slides in when it is
  const pulled = LAYERS.filter((l) => states[l.key] === 'ghost').map((l) => l.key)
  return { kind: 'lite', states, pulled, caption: `${installed.value.length} of 30 facades installed` }
})

const { index: tieStep, root: tieRoot } = useCycle(() => concept.value.ties.length, 1500, 0.3)
const pair = computed(() => concept.value.ties[tieStep.value % concept.value.ties.length] ?? [0, 0])
const files = computed(() => [
  { label: 'Laravel · PHP', name: concept.value.phpFile, lines: tokenize(concept.value.php, 'php'), pair: pair.value[0], go: false },
  { label: 'Goravel · Go', name: concept.value.goFile, lines: tokenize(concept.value.go), pair: pair.value[1], go: true }
])
</script>

<template>
  <div class="g-home">
    <section class="g-sec is-hero">
      <div class="g-wrap g-hero-grid">
        <div>
          <h1 class="g-display">{{ tr('Familiar structure.') }}<br /><span class="light">{{ tr('Native Go.') }}</span></h1>
          <p class="g-lead">{{ tr('Routing, an ORM, validation, queues, events and cache, in one framework.') }}</p>
          <div class="g-actions">
            <a class="g-button" :href="link('/getting-started/installation.html')">
              {{ tr('Get started') }}
              <svg class="g-arrow" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
                <path d="M3 10h13M11 5l5 5-5 5" />
              </svg>
            </a>
            <a class="g-button is-outline" :href="link('/getting-started/configuration.html')">{{ tr('Read the documentation') }}</a>
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

    <section class="g-sec">
      <div class="g-wrap">
        <header class="g-sec-head">
          <h2 class="g-h2">{{ tr('Follow one request.') }}</h2>
          <p class="g-lead"><code class="g-inline">GET /tasks</code>{{ tr(', from the router to the response.') }}</p>
        </header>

        <nav ref="stopsRoot" class="g-tabs" :aria-label="tr('Request stops')">
          <button
            v-for="(s, i) in STOPS"
            :key="s.key"
            type="button"
            class="g-tab"
            :class="{ 'is-active': i === stopIndex }"
            :aria-current="i === stopIndex"
            @click="setStop(i)"
          >{{ tr(s.name) }}</button>
        </nav>

        <div class="g-panel">
          <div class="g-figure">
            <GoravelMark :view="stopView" :scale="0.9" />
          </div>
          <div class="g-panel-body">
            <div class="g-file-head">
              <span class="g-label">{{ tr(nameOf(stop.layer)) }}</span>
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

    <section class="g-sec">
      <div class="g-wrap">
        <header class="g-sec-head">
          <h2 class="g-h2">{{ tr('Laravel’s structure, written in Go.') }}</h2>
          <p class="g-lead">{{ tr('The same facades, the same method names, the same file layout.') }}</p>
        </header>

        <div class="g-parity">
          <div class="g-parity-side">
            <nav ref="conceptRoot" class="g-list" :aria-label="tr('Concepts')">
              <button
                v-for="(c, i) in CONCEPTS"
                :key="c.name"
                type="button"
                class="g-list-item"
                :class="{ 'is-active': i === conceptIndex }"
                :aria-current="i === conceptIndex"
                @click="setConcept(i)"
              >{{ tr(c.name) }}</button>
            </nav>
            <GoravelMark :view="conceptView" :scale="0.5" />
          </div>

          <div ref="tieRoot" class="g-parity-code">
            <div v-for="file in files" :key="file.label" :class="{ 'is-go': file.go }">
              <div class="g-file-head">
                <span class="g-label" :class="{ cyan: file.go }">{{ file.label }}</span>
                <span class="g-meta">{{ file.name }}</span>
              </div>
              <pre :key="file.label + conceptIndex" class="g-code is-plain g-swap"><code><span
                v-for="(ln, n) in file.lines"
                :key="n"
                class="ln"
                :class="{ 'is-pair': n + 1 === file.pair }"
              ><span v-for="(t, j) in ln" :key="j" :class="{ call: t.call }">{{ t.text }}</span>
</span></code></pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="layers" class="g-sec">
      <div class="g-wrap">
        <header class="g-sec-head">
          <h2 class="g-h2">{{ tr('Five layers, thirty facades.') }}</h2>
          <p class="g-lead">{{ tr('Every facade belongs to one piece of the mark. Choose a piece.') }}</p>
        </header>

        <nav ref="layerRoot" class="g-tabs" :aria-label="tr('Layers')">
          <button
            v-for="(l, i) in LAYERS"
            :key="l.key"
            type="button"
            class="g-tab"
            :class="{ 'is-active': l.key === layerKey }"
            :aria-current="l.key === layerKey"
            @click="setLayer(i)"
          >{{ tr(l.name) }}</button>
        </nav>

        <div class="g-panel is-layers">
          <div class="g-figure">
            <GoravelMark :view="layerView" :scale="0.94" @select="selectLayer" />
          </div>
          <div class="g-panel-body">
            <ul :key="layerIndex" class="g-facades g-swap">
              <li v-for="f in layer.facades" :key="f">
                <a :href="FACADES[f][0]" :title="FACADES[f][1]">{{ f }}</a>
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

    <section class="g-sec">
      <div class="g-wrap">
        <header class="g-sec-head">
          <h2 class="g-h2">{{ tr('Start with the core.') }}</h2>
          <p class="g-lead">{{ tr('Goravel Lite is four facades. Add the rest when you need them.') }}</p>
        </header>

        <div class="g-assemble">
          <ol ref="liteRoot" class="g-steps" :aria-label="tr('Install steps')">
            <li v-for="(s, i) in LITE_STEPS" :key="s.title">
              <button
                type="button"
                class="g-step"
                :class="{ 'is-done': i < liteIndex, 'is-active': i === liteIndex }"
                :aria-current="i === liteIndex"
                @click="setLite(i)"
              >
                <span class="g-step-title">{{ tr(s.title) }}</span>
                <code class="g-step-cmd">$ {{ s.cmd }}</code>
              </button>
            </li>
          </ol>
          <div class="g-assemble-figure">
            <GoravelMark :view="liteView" :scale="1" />
            <p class="g-count">
              <span class="n">{{ installed.length }}</span><span class="muted"> / 30</span>
              <span class="g-body muted">{{ tr('facades installed') }}</span>
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
