<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { useI18n } from '../i18n'
import GoravelMark from './GoravelMark.vue'
import { HERO, PIECES, type PieceKey, type PieceState } from './config'

const { tr, link } = useI18n()
const { copy, copied } = useClipboard({ source: HERO.install })
const whole = Object.fromEntries(PIECES.map((p) => [p.key, 'solid'])) as Record<PieceKey, PieceState>
</script>

<template>
<section class="home-hero">
  <div class="g-wrap home-hero-grid">
    <div>
      <h1 class="g-display">{{ tr(HERO.title[0]) }}<br /><span class="light">{{ tr(HERO.title[1]) }}</span></h1>
      <p class="g-lead">{{ tr(HERO.lead) }}</p>
      <div class="g-actions">
        <a class="g-button" :href="link(HERO.cta.link)">
          {{ tr(HERO.cta.text) }}
          <svg class="g-arrow" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
            <path d="M3 10h13M11 5l5 5-5 5" />
          </svg>
        </a>
        <button type="button" class="home-install" @click="copy()">
          <span class="muted">$</span> {{ HERO.install }}
          <span class="home-install-icon" :class="copied ? 'icon-[lucide--check]' : 'icon-[lucide--copy]'" aria-hidden="true" />
          <span class="home-sr">{{ copied ? tr('Copied') : tr('Copy') }}</span>
        </button>
      </div>
    </div>
    <div class="home-hero-art" aria-hidden="true">
      <GoravelMark :states="whole" caption="Goravel" :scale="1.42" />
    </div>
  </div>
</section>
</template>

<style>
.home-hero {
  display: flex;
  align-items: center;
  min-height: calc(100vh - var(--vp-nav-height));
  padding: 56px 0;
  overflow: hidden;
}

.home-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  column-gap: 40px;
  align-items: center;
  width: 100%;
}

.home-hero-grid .g-lead {
  margin-top: 28px;
  font-size: 19px;
  line-height: 32px;
}

.home-hero-art {
  display: flex;
  justify-content: center;
}

.home-install {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 46px;
  padding: 0 16px;
  border: 1px solid var(--g-line);
  border-radius: 3px;
  text-align: left;
  white-space: nowrap;
  transition: border-color 0.18s ease;
  font-family: var(--vp-font-family-mono);
  font-size: 13.5px;
  color: var(--g-ink);
}

.home-install-icon {
  width: 15px;
  height: 15px;
  color: var(--g-grey);
}

.home-install:hover {
  border-color: var(--g-cyan-text);
}

.home-install:hover .home-install-icon,
.home-install-icon[class*='check'] {
  color: var(--g-cyan-text);
}

@media (max-width: 1280px) {
  .home-install {
    font-size: 12.5px;
  }
}

@media (max-width: 900px) {
  .home-hero {
    min-height: 0;
    padding: 40px 0 56px;
  }

  .home-hero-grid {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 40px;
  }

  .home-hero-art .g-mark {
    width: min(100%, 400px);
    height: auto;
  }
}

@media (max-width: 480px) {
  .home-install {
    position: relative;
    width: 100%;
    padding: 10px 14px;
    font-size: 11.5px;
    line-height: 19px;
    white-space: normal;
  }

  .home-install .muted {
    display: none;
  }

  .home-install-icon {
    position: absolute;
    top: 12px;
    right: 14px;
  }
}
</style>
