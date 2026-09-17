<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import { useSidebar } from 'vitepress/theme'
import VPNavBarSearch from 'vitepress/dist/client/theme-default/components/VPNavBarSearch.vue'
import VPNavBarHamburger from 'vitepress/dist/client/theme-default/components/VPNavBarHamburger.vue'
import { useLangs } from 'vitepress/dist/client/theme-default/composables/langs'
import SelectMenu from './SelectMenu.vue'

/* The site bar. */
defineProps<{ isScreenOpen: boolean }>()
defineEmits<{ (e: 'toggle-screen'): void }>()

const VERSIONS = [
  { text: 'v1.18', note: 'Latest', link: 'https://www.goravel.dev/', selected: true },
  { text: 'v1.17', link: 'https://v117.goravel.dev/' },
  { text: 'v1.16', link: 'https://v116.goravel.dev/' }
]

const { site, theme, localeIndex } = useData()
const { hasSidebar } = useSidebar()
const { localeLinks, currentLang } = useLangs({ correspondingLink: true })
const route = useRoute()

const home = computed(() => (localeIndex.value === 'root' ? '/' : `/${localeIndex.value}/`))
const nav = computed(() => theme.value.nav ?? [])
// the first nav item names the docs in each language, and doubles as the lockup's section label
const section = computed(() => nav.value[0]?.text ?? 'Docs')
const github = computed(() => theme.value.socialLinks?.[0])

/* Every language, in the order the config lists them, each linking to this page in that language. */
const languages = computed(() =>
  Object.values(site.value.locales).map(({ label }) => ({
    text: label!,
    link: localeLinks.value.find((l) => l.text === label)?.link ?? route.path,
    selected: label === currentLang.value.label
  }))
)

const isActive = (match?: string) => !!match && new RegExp(match).test(route.path)

const menuOpen = ref(false)

const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (menuOpen.value = false)
watch(menuOpen, (open) =>
  open ? window.addEventListener('keydown', onKey) : window.removeEventListener('keydown', onKey)
)
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

/* Close when keyboard focus leaves the menu, so tabbing past it does not leave it open. */
const onFocusOut = (e: FocusEvent) => {
  if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) menuOpen.value = false
}
</script>

<template>
  <div class="bar" :class="{ docs: hasSidebar }">
    <a class="brand" :href="home">
      <img src="/logo@2x.png" alt="Goravel" width="89" height="24" />
      <span v-if="hasSidebar" class="section">/ {{ section }}</span>
    </a>

    <nav v-if="!hasSidebar" class="nav">
      <template v-for="item in nav" :key="item.text">
        <a v-if="'link' in item" :href="item.link" :class="{ active: isActive(item.activeMatch) }">{{ item.text }}</a>
        <div
          v-else
          class="menu"
          @mouseenter="menuOpen = true"
          @mouseleave="menuOpen = false"
          @focusout="onFocusOut"
        >
          <button type="button" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
            {{ item.text }}<span class="chevron vpi-chevron-down" />
          </button>
          <div v-show="menuOpen" class="panel">
            <section v-for="group in item.items" :key="group.text" class="group">
              <p class="label">{{ group.text }}</p>
              <a v-for="row in group.items" :key="row.link" :href="row.link" v-html="row.text" />
            </section>
          </div>
        </div>
      </template>
    </nav>

    <VPNavBarSearch class="search" />

    <div class="utils">
      <SelectMenu v-if="hasSidebar" label="v1.18" :options="VERSIONS" />
      <SelectMenu class="lang" :label="currentLang.label!" :options="languages" />
      <a v-if="github" class="github" :href="github.link" aria-label="GitHub" target="_blank" rel="noreferrer"
         v-html="(github.icon as { svg: string }).svg" />
    </div>

    <VPNavBarHamburger class="hamburger" :active="isScreenOpen" @click="$emit('toggle-screen')" />
  </div>
</template>

<style scoped>

.bar {
  pointer-events: auto;
  display: flex;
  align-items: center;
  height: var(--vp-nav-height);
  padding: 0 var(--g-shell-inset);
  border-bottom: 1px solid var(--g-line);
  background: var(--g-white);
}

/* brand */
.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.brand img {
  height: 24px;
  width: auto;
}

.section {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--g-grey);
}

.docs {
  padding: 0;
  border-bottom: 0;
}

.docs .brand {
  align-self: stretch;
  width: var(--vp-sidebar-width);
  padding-left: var(--g-shell-inset);
  border-right: 1px solid var(--g-line);
}

.docs .search,
.docs .utils {
  align-self: stretch;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--g-line);
}

/* the search sits over the article column and is exactly as wide as it */
.docs .search {
  flex: 0 1 calc(var(--g-measure) + var(--g-gutter));
  padding-left: var(--g-gutter);
}

.docs .utils {
  flex: 1;
  justify-content: flex-end;
}

/* destinations */
.nav {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 87px;
}

.nav > a,
.menu > button {
  display: flex;
  align-items: center;
  height: var(--vp-nav-height);
  padding: 0 14px;
  font-size: 15px;
  font-weight: 500;
  color: var(--g-ink);
  transition: color 0.15s ease;
}

.nav > a:hover,
.nav > a.active,
.menu:hover > button {
  color: var(--g-cyan-text);
}

.chevron {
  width: 14px;
  height: 14px;
  margin-left: 6px;
  color: var(--g-grey);
  transition: transform 0.2s ease;
}

.menu button[aria-expanded='true'] .chevron {
  transform: rotate(-90deg); /* the theme draws this chevron as a right one turned 90deg */
}

/* the Community panel drops from the bar's rule and runs the width of the screen */
.panel {
  position: fixed;
  top: var(--vp-nav-height);
  left: 0;
  right: 0;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  padding: 0 var(--g-shell-inset);
  border-bottom: 1px solid var(--g-line);
  background: var(--g-white);
  box-shadow: 0 24px 40px -24px rgba(16, 24, 32, 0.12);
}

.group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 28px 32px 32px;
  border-left: 1px solid var(--g-line);
}

.group:first-child {
  padding-left: 0;
  border-left: 0;
}

.label {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 10px;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--g-cyan-text);
}

.label::before {
  content: '';
  width: 6px;
  height: 6px;
  background: currentColor;
  transform: rotate(45deg);
}

.group a {
  padding: 6px 0;
  font-size: 15px;
  color: var(--g-ink);
}

.group a:hover {
  color: var(--g-cyan-text);
}

/* utilities */
.search {
  margin-left: auto;
}

.search :deep(#docsearch) {
  width: 100%;
}

/* the search reads as a field: one grey cell, the shortcut at its far end */
.search :deep(.DocSearch-Button) {
  gap: 9px;
  width: 100%;
  height: var(--g-control);
  margin: 0;
  padding: 0 10px 0 11px;
  border: 0;
  border-radius: 2px;
  background: var(--g-soft);
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.search :deep(.DocSearch-Button:hover) {
  background: var(--g-hover);
}

.search :deep(.DocSearch-Button:focus-visible) {
  outline: none;
  box-shadow: inset 0 0 0 1px var(--g-cyan);
}

.search :deep(.DocSearch-Button-Container) {
  gap: 9px;
  min-width: 0;
}

.search :deep(.DocSearch-Search-Icon) {
  width: 15px;
  height: 15px;
  color: var(--g-grey);
}

.search :deep(.DocSearch-Button .DocSearch-Button-Placeholder) {
  overflow: hidden;
  padding: 0;
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--g-grey);
}

.search :deep(.DocSearch-Button .DocSearch-Button-Keys) {
  gap: 1px;
  min-width: 0;
  margin-left: auto;
  padding-left: 8px;
}

.search :deep(.DocSearch-Button .DocSearch-Button-Key) {
  top: 0;
  width: auto;
  height: auto;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  border-radius: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 500;
  line-height: 16px;
  color: var(--g-grey);
}

.search :deep(.DocSearch-Button .DocSearch-Button-Key + .DocSearch-Button-Key) {
  padding: 0 6px 0 2px;
}

/* VitePress's own scoped styles give the search flex-grow and a 32px left padding */
.bar:not(.docs) .search {
  flex: 0 0 280px;
  padding-left: 0;
}

.utils {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-left: 20px;
}

.docs .utils {
  margin-left: 0;
  padding-right: var(--g-shell-inset);
}

.github {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--g-control);
  height: var(--g-control);
  margin-left: 2px;
  color: var(--g-grey);
  transition: color 0.15s ease;
}

.github:hover {
  color: var(--g-ink);
}

.hamburger {
  display: none;
  width: var(--g-control);
  height: var(--g-control);
  border-radius: 2px;
}

.hamburger:hover {
  background: var(--g-soft);
}

/* the theme slides the middle line aside to make a cross; a square target has no room for it */
.hamburger.active :deep(.middle) {
  opacity: 0;
}

@media (max-width: 1279px) {
  .search :deep(.DocSearch-Button .DocSearch-Button-Keys) {
    display: none;
  }
}

/* a phone: the wordmark, the version on a docs page, the search, and the menu */
@media (max-width: 959px) {
  .bar,
  .docs {
    padding: 0 24px;
    border-bottom: 1px solid var(--g-line);
  }

  .docs .brand {
    width: auto;
    padding-left: 0;
    border-right: 0;
  }

  .nav,
  .section,
  .lang,
  .github {
    display: none;
  }

  .docs .search,
  .docs .utils {
    flex: 0 0 auto;
    padding: 0;
    border-bottom: 0;
  }

  .utils,
  .docs .utils {
    margin-left: auto;
  }

  .search {
    order: 2;
    margin-left: 0;
  }

  .search :deep(.DocSearch-Button) {
    justify-content: center;
    width: var(--g-control);
    padding: 0;
    background: transparent;
  }

  .search :deep(.DocSearch-Button:hover) {
    background: var(--g-soft);
  }

  .search :deep(.DocSearch-Button .DocSearch-Button-Placeholder) {
    display: none;
  }

  .bar:not(.docs) .search {
    flex: 0 0 auto;
  }

  .hamburger {
    display: flex;
    order: 3;
  }
}
</style>
