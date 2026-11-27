<script setup lang="ts">
import { useI18n } from '../i18n'
import { SUPPORT } from './config'
import SupportMark from '../components/SupportMark.vue'
import {
  SUPPORT_PLANS,
  SUPPORT_ROWS,
  supportDiscountLabel,
  type SupportPrice,
  type SupportValue
} from '../../support'

const { tr, link } = useI18n()

const text = (v: SupportValue) => (typeof v === 'string' ? v : '')
const annualNote = (price: SupportPrice) =>
  `${tr('Billed annually')} ${price.annual} · ${supportDiscountLabel(price)}`
</script>

<template>
<section class="home-sec">
  <div class="g-wrap">
    <header class="g-sec-head">
      <h2 class="g-h2">{{ tr(SUPPORT.title) }}</h2>
      <p class="g-lead">{{ tr(SUPPORT.lead) }}</p>
    </header>

    <div class="home-support-plans">
      <article v-for="(plan, p) in SUPPORT_PLANS" :key="plan.name" class="home-support-plan">
        <h3 class="g-h3">{{ plan.name }}</h3>
        <span v-if="plan.featured" class="home-support-badge">{{ tr('Most popular') }}</span>
        <p class="home-support-price">
          <strong>{{ plan.price.monthly }}</strong>
          <span class="g-label muted">{{ tr('per month') }}</span>
        </p>
        <p class="home-support-annual">{{ annualNote(plan.price) }}</p>
        <dl class="home-support-rows">
          <div v-for="row in SUPPORT_ROWS" :key="row.label" class="home-support-row">
            <dt class="g-label muted">{{ row.label }}</dt>
            <dd v-if="typeof row.values[p] === 'boolean'" class="home-support-value">
              <SupportMark :value="row.values[p] === true" />
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
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 36px 28px 32px;
  border-right: 1px solid var(--g-line);
  border-bottom: 1px solid var(--g-line);
}

.home-support-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 3px 8px;
  border: 1px solid var(--g-cyan);
  border-radius: 999px;
  font-size: 12px;
  line-height: 18px;
  color: var(--g-cyan-text);
  background: var(--g-cyan-tint);
}

.home-support-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 18px 0 0;
}

.home-support-price strong {
  font-size: 30px;
  line-height: 1.1;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--g-ink);
}

.home-support-annual {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--g-grey);
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

@media (max-width: 900px) {
  .home-support-plans {
    grid-template-columns: minmax(0, 1fr);
  }

  .home-support-plan {
    padding: 28px 20px 32px;
  }
}
</style>
