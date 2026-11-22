<script setup lang="ts">
import { useI18n } from '../i18n'
import { SUPPORT } from './config'

const { tr, link } = useI18n()
</script>

<template>
<section class="home-sec support">
  <div class="g-wrap">
    <header class="g-sec-head">
      <h2 class="g-h2">{{ tr(SUPPORT.title) }}</h2>
      <p class="g-lead">{{ tr(SUPPORT.lead) }}</p>
    </header>

    <div class="support-plans">
      <article v-for="plan in SUPPORT.plans" :key="plan.name" class="support-plan">
        <h3 class="g-h3">{{ tr(plan.name) }}</h3>
        <p class="g-body muted">{{ tr(plan.says) }}</p>
        <p class="support-channel">
          <span class="g-label muted">{{ tr('Response channel') }}</span>{{ tr(plan.channel) }}
        </p>
      </article>
    </div>

    <div class="g-actions">
      <a class="g-button" :href="link(SUPPORT.cta.link)">
        {{ tr(SUPPORT.cta.text) }}
        <svg class="g-arrow" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
          <path d="M3 10h13M11 5l5 5-5 5" />
        </svg>
      </a>
    </div>
  </div>
</section>
</template>

<style>
.support-plans {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 56px;
  border-top: 1px solid var(--g-line);
  border-left: 1px solid var(--g-line);
}

.support-plan {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 36px 28px 32px;
  border-right: 1px solid var(--g-line);
  border-bottom: 1px solid var(--g-line);
}

.support-plan .g-body {
  margin-top: 10px;
}

.support-channel {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: auto 0 0;
  padding-top: 24px;
  font-family: var(--vp-font-family-mono);
  font-size: 13.5px;
  line-height: 20px;
  color: var(--g-ink);
}

@media (max-width: 900px) {
  .support-plans {
    grid-template-columns: minmax(0, 1fr);
  }

  .support-plan {
    padding: 28px 20px 32px;
  }
}
</style>
