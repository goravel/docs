<script setup lang="ts">
import { useI18n } from '../i18n'
import { SUPPORT } from './config'
import { SUPPORT_PLANS, SUPPORT_ROWS, type SupportValue } from '../../support'

const { tr, link } = useI18n()

const yes = (v: SupportValue) => v === true
const text = (v: SupportValue) => (typeof v === 'string' ? v : '')
</script>

<template>
<section class="home-sec">
  <div class="g-wrap">
    <header class="g-sec-head">
      <h2 class="g-h2">{{ tr(SUPPORT.title) }}</h2>
      <p class="g-lead">{{ tr(SUPPORT.lead) }}</p>
    </header>

    <div class="home-support-plans">
      <article v-for="(plan, p) in SUPPORT_PLANS" :key="plan" class="home-support-plan">
        <h3 class="g-h3">{{ plan }}</h3>
        <dl class="home-support-rows">
          <div v-for="row in SUPPORT_ROWS" :key="row.label" class="home-support-row">
            <dt class="g-label muted">{{ row.label }}</dt>
            <dd v-if="typeof row.values[p] === 'boolean'" class="home-support-value">
              <span
                :class="yes(row.values[p]) ? 'icon-[lucide--check] home-support-yes' : 'icon-[lucide--x] home-support-no'"
                role="img"
                :aria-label="yes(row.values[p]) ? tr('Included') : tr('Not included')"
              />
            </dd>
            <dd v-else class="home-support-value">{{ text(row.values[p]) }}</dd>
          </div>
        </dl>
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
.home-support-plans {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 56px;
  border-top: 1px solid var(--g-line);
  border-left: 1px solid var(--g-line);
}

.home-support-plan {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 36px 28px 32px;
  border-right: 1px solid var(--g-line);
  border-bottom: 1px solid var(--g-line);
}

.home-support-rows {
  margin: 24px 0 0;
  padding: 0;
  border-top: 1px solid var(--g-line);
}

.home-support-row {
  display: grid;
  gap: 4px;
  padding: 14px 0;
  border-bottom: 1px solid var(--g-line);
}

.home-support-value {
  margin: 0;
  font-size: 15px;
  line-height: 23px;
  color: var(--g-ink);
}

.home-support-value [class^='icon-'] {
  display: block;
  width: 17px;
  height: 17px;
  margin: 3px 0;
}

.home-support-yes {
  color: var(--g-cyan);
}

.home-support-no {
  color: var(--g-grey);
}

@media (max-width: 900px) {
  .home-support-plans {
    grid-template-columns: minmax(0, 1fr);
  }

  .home-support-plan {
    padding: 28px 20px 32px;
  }
}
</style>
