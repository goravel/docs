<script setup lang="ts">
import { SUPPORT_ITEM_LABEL, SUPPORT_PLANS, SUPPORT_ROWS } from '../../support'
import type { SupportValue } from '../../support'

const cell = (value: SupportValue) =>
  typeof value === 'boolean' ? (value ? '✅' : '❌') : value
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>{{ SUPPORT_ITEM_LABEL }}</th>
        <th v-for="plan in SUPPORT_PLANS" :key="plan">{{ plan }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in SUPPORT_ROWS" :key="row.label">
        <td>{{ row.label }}</td>
        <td v-for="(value, i) in row.values" :key="i">{{ cell(value) }}</td>
      </tr>
    </tbody>
  </table>
</template>
