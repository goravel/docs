<script setup lang="ts">
import { SUPPORT_ITEM_LABEL, SUPPORT_PLANS, SUPPORT_PRICE_LABEL, SUPPORT_ROWS } from '../../support'
import type { SupportValue } from '../../support'

const cell = (value: SupportValue) =>
  typeof value === 'boolean' ? (value ? '✅' : '❌') : value
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>{{ SUPPORT_ITEM_LABEL }}</th>
        <th v-for="plan in SUPPORT_PLANS" :key="plan.name">{{ plan.name }}</th>
      </tr>
    </thead>
    <tbody>
      <tr class="support-price-row">
        <td>{{ SUPPORT_PRICE_LABEL }}</td>
        <td v-for="plan in SUPPORT_PLANS" :key="`${plan.name}-price`">
          <strong>{{ plan.price.monthly }}</strong> / 月
          <span class="support-price-annual">年付 {{ plan.price.annual }}（省 2 个月）</span>
        </td>
      </tr>
      <tr v-for="row in SUPPORT_ROWS" :key="row.label">
        <td>{{ row.label }}</td>
        <td v-for="(value, i) in row.values" :key="i">{{ cell(value) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.support-price-row td {
  white-space: nowrap;
}

.support-price-annual {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  line-height: 18px;
  color: var(--g-grey);
}
</style>
