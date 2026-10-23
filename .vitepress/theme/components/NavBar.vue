<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData, useRoute } from 'vitepress'
import { useSidebar } from 'vitepress/theme-without-fonts'
import VPNavBarSearch from 'vitepress/dist/client/theme-default/components/VPNavBarSearch.vue'
import VPNavBarHamburger from 'vitepress/dist/client/theme-default/components/VPNavBarHamburger.vue'
import VPSocialLinks from 'vitepress/dist/client/theme-default/components/VPSocialLinks.vue'
// the default nav's link rule: page links get .html while clean URLs are off
import { normalizeLink } from 'vitepress/dist/client/theme-default/support/utils.js'
import { VERSIONS } from '../../links'
import { useDismiss } from '../dismiss'
import { useI18n } from '../i18n'
import SelectMenu from './SelectMenu.vue'

defineProps<{ isScreenOpen: boolean }>()
defineEmits<{ (e: 'toggle-screen'): void }>()

const { theme, localeIndex, isDark } = useData()
const { hasSidebar } = useSidebar()
const { tr, languages, currentLang } = useI18n()
const route = useRoute()

const home = computed(() => (localeIndex.value === 'root' ? '/' : `/${localeIndex.value}/`))
const nav = computed(() => theme.value.nav ?? [])
const section = computed(() => nav.value[0]?.text ?? 'Docs')
const version = (VERSIONS.find((v) => v.selected) ?? VERSIONS[0]).text

const isActive = (match?: string) => !!match && new RegExp(match).test(route.path)

const menuOpen = ref(false)
const navRoot = ref<HTMLElement | null>(null)
const onFocusOut = useDismiss(navRoot, () => (menuOpen.value = false))
</script>

<template>
  <div class="bar" :class="{ docs: hasSidebar }">
    <a class="brand" :href="home">
      <img src="/logo@2x.png" alt="Goravel" width="89" height="24" />
      <span v-if="hasSidebar" class="g-label section">/ {{ section }}</span>
    </a>

    <nav v-if="!hasSidebar" ref="navRoot" class="nav">
      <template v-for="item in nav" :key="item.text">
        <a v-if="'link' in item" :href="normalizeLink(item.link)" :class="{ active: isActive(item.activeMatch) }">{{ item.text }}</a>
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
              <p class="g-label g-diamond label">{{ group.text }}</p>
              <a v-for="row in group.items" :key="row.link" :href="normalizeLink(row.link)" v-html="row.text" />
            </section>
          </div>
        </div>
      </template>
    </nav>

    <VPNavBarSearch class="search" />

    <div class="utils">
      <SelectMenu v-if="hasSidebar" :label="version" :options="VERSIONS" />
      <SelectMenu class="lang" :label="currentLang.label!" :options="languages" />
      <button type="button" class="theme" :aria-label="tr('Switch theme')" @click="isDark = !isDark">
        <span class="sun icon-[lucide--sun]" /><span class="moon icon-[lucide--moon]" />
      </button>
      <VPSocialLinks class="social" :links="theme.socialLinks ?? []" />
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

.docs .search {
  flex: 0 1 calc(var(--g-measure) + var(--g-gutter));
  padding-left: var(--g-gutter);
}

.docs .utils {
  flex: 1 0 auto;
  justify-content: flex-end;
  margin-left: 0;
  padding-right: var(--g-shell-inset);
}

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
  transform: rotate(-90deg); /* the theme's down chevron is a right chevron turned 90deg */
}

.panel {
  position: fixed;
  top: var(--vp-nav-height);
  left: var(--g-frame-x);
  right: var(--g-frame-x);
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  padding: 0 var(--g-shell-inset);
  border-bottom: 1px solid var(--g-line);
  background: var(--g-white);
  box-shadow: 0 24px 40px -24px rgba(var(--g-shadow), 0.12);
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
  gap: 9px;
  margin: 0 0 10px;
  color: var(--g-cyan-text);
}

.group a {
  padding: 6px 0;
  font-size: 15px;
  color: var(--g-ink);
}

.group a:hover {
  color: var(--g-cyan-text);
}

.search {
  margin-left: auto;
}

.search :deep(#docsearch) {
  width: 100%;
}

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

/* the theme gives the search flex-grow and a 32px left padding */
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

.theme {
  display: grid;
  place-items: center;
  width: var(--g-control);
  height: var(--g-control);
  margin: 0 -8px 0 -6px;
  border-radius: 2px;
  color: var(--g-grey);
}

.theme:hover {
  color: var(--g-ink);
}

.theme span {
  width: 17px;
  height: 17px;
}

.moon {
  display: none;
}

:global(.dark .bar .theme .sun) {
  display: none;
}

:global(.dark .bar .theme .moon) {
  display: block;
}

.social {
  margin-left: 2px;
}

.social :deep(.VPSocialLink) {
  width: var(--g-control);
  height: var(--g-control);
}

.social :deep(.VPSocialLink > span) {
  width: 17px;
  height: 17px;
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

/* the theme slides the middle line aside, which overflows a square target */
.hamburger.active :deep(.middle) {
  opacity: 0;
}

@media (max-width: 1279px) {
  .search :deep(.DocSearch-Button .DocSearch-Button-Keys) {
    display: none;
  }
}

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
  .social {
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
