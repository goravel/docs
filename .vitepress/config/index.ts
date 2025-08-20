import { defineConfig } from 'vitepress'
import { shared } from './shared'
import { config as en } from './en'
import { config as zh_CN } from './zh_CN'
import { config as zh_TW } from './zh_TW'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  ...shared,
  locales: {
    root: { label: 'English', ...en },
    zh_CN: { label: '简体中文', ...zh_CN },
    zh_TW: { label: '繁體中文', ...zh_TW },
  }
})
