<script setup lang="ts">
import { withBase } from 'vitepress'

const base = (path: string) => withBase(`/${path}`)

const suggestions = [
  ['Installation', 'getting-started/installation.html'],
  ['Routing', 'the-basics/routing.html'],
  ['Upgrading To v1.18 From v1.17', 'upgrade/v1.18.html'],
  ['Excellent Packages', 'getting-started/packages.html']
]
</script>

<template>
  <div class="goravel-404">
    <div class="left">
      <p class="code">404</p>
      <h1 class="title">This page does not exist.</h1>
      <p class="lead">It may have moved in a newer version of the docs, or the address may be wrong.</p>
      <a class="home" :href="base('')">Go to the documentation</a>
    </div>
    <div class="right">
      <span class="label">Try these</span>
      <a v-for="[text, link] in suggestions" :key="link" class="suggestion" :href="base(link)">{{ text }}</a>
    </div>
  </div>
</template>

<style scoped>
.goravel-404 {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 400px;
  min-height: calc(100vh - var(--vp-nav-height));
}

.left {
  padding: 112px var(--g-gutter) 160px;
  border-right: 1px solid var(--g-line);
}

.code,
.label {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.14em;
  color: var(--g-grey);
}

.title {
  margin-top: 18px;
  font-size: 40px;
  line-height: 46px;
  font-weight: 600;
  letter-spacing: -0.03em;
}

.lead {
  max-width: 540px;
  margin-top: 14px;
  font-size: 17px;
  line-height: 28px;
  color: var(--g-grey);
}

.home {
  display: inline-flex;
  align-items: center;
  height: 46px;
  margin-top: 28px;
  padding: 0 22px;
  border-radius: 2px;
  background: var(--g-cyan);
  font-size: 15px;
  font-weight: 600;
  color: var(--g-white);
}

.home:hover {
  background: var(--g-cyan-text);
}

.right {
  display: flex;
  flex-direction: column;
  padding: 112px var(--g-shell-inset) 0 var(--g-rail);
}

.label {
  margin-bottom: 10px;
  font-size: 11px;
  text-transform: uppercase;
}

.suggestion {
  position: relative;
  padding: 8px 0 8px 12px;
  font-size: 15px;
  color: var(--g-grey);
  transition: color 0.15s ease;
}

.suggestion:hover {
  color: var(--g-cyan-text);
}

.suggestion:hover::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--g-cyan);
}

@media (max-width: 959px) {
  .goravel-404 {
    grid-template-columns: minmax(0, 1fr);
  }

  .left {
    padding: 56px 24px 64px;
    border-right: 0;
  }

  .title {
    font-size: 32px;
    line-height: 38px;
  }

  .right {
    padding: 40px 24px 72px;
  }
}
</style>
