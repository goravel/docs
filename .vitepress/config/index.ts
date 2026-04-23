import { defineConfig } from 'vitepress'
import { shared } from './shared'
import { config as en } from './en'
import { config as zh_CN } from './zh_CN'
import { config as uz_UZ } from './uz_UZ'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  ...shared,
  locales: {
    root: { label: 'English', ...en },
    zh_CN: { label: '简体中文', ...zh_CN },
    uz_UZ: { label: 'Oʻzbekcha', ...uz_UZ },
  }
})
