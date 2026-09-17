import {
  transformerMetaWordHighlight,
  transformerNotationWordHighlight
} from '@shikijs/transformers'
import { fileURLToPath, URL } from 'node:url'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { createFileSystemTypesCache } from '@shikijs/vitepress-twoslash/cache-fs'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type MarkdownRenderer } from 'vitepress'
import timeline from 'vitepress-markdown-timeline'
import deflist from 'markdown-it-deflist'
import footnote from 'markdown-it-footnote'
import sub from 'markdown-it-sub'
import sup from 'markdown-it-sup'
import taskLists from 'markdown-it-task-lists'
import { goravelCode } from './goravel-code'
import {
  groupIconMdPlugin,
  groupIconVitePlugin
} from 'vitepress-plugin-group-icons'

// import {enSearch, zh_CNSearch} from './search'

function markCustomContainerTitles(md: MarkdownRenderer) {
  for (const name of ['info', 'tip', 'warning', 'danger', 'details']) {
    const key = `container_${name}_open`
    const original = md.renderer.rules[key]
    if (!original) continue
    md.renderer.rules[key] = (tokens, idx, options, env, self) => {
      const html = original(tokens, idx, options, env, self)
      // text after the type on the fence is a custom title
      const custom = /^[a-z-]+[ \t]+\S/i.test((tokens[idx].info || '').trim())
      return custom ? html.replace('custom-block', 'custom-block has-custom-title') : html
    }
  }
}

export const shared = defineConfig({
  title: 'Goravel',

  rewrites: {
    'en/:rest*': ':rest*'
  },

  // there is no dark design
  appearance: false,
  lastUpdated: true,
  cleanUrls: false,
  metaChunk: true,

  head: [
    [
      'script',
      {
        async: 'true',
        src: 'https://www.googletagmanager.com/gtag/js?id=G-HJQNEG5H69'
      }
    ],
    [
      'script',
      {},
      "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-HJQNEG5H69');"
    ]
  ],

  markdown: {
    theme: goravelCode,
    lineNumbers: true,
    codeTransformers: [
      transformerNotationWordHighlight(),
      transformerMetaWordHighlight(),
      transformerTwoslash({
        typesCache: createFileSystemTypesCache()
      })
    ],
    config(md) {
      md.use(groupIconMdPlugin)
      md.use(timeline)
      md.use(footnote)
      md.use(taskLists, { label: true })
      md.use(sub)
      md.use(sup)
      md.use(deflist)
      markCustomContainerTitles(md)
    },
    languages: ['go']
  },

  themeConfig: {
    logo: '/logo@2x.png',
    siteTitle: false,
    socialLinks: [{ icon: 'github', link: 'https://github.com/goravel/goravel' }],
    search: {
      provider: 'algolia',
      options: {
        appId: '4J45WOFT67',
        apiKey: '2d8317ae404e2cdd64933b6dc5416b6a',
        indexName: 'goravel',
        locales: {
          root: {
            placeholder: 'Search docs',
            translations: {
              button: {
                buttonText: 'Search docs'
              }
            }
          },
          zh_CN: {
            placeholder: '搜索文档',
            translations: {
              button: {
                buttonText: '搜索文档'
              }
            }
          },
          uz_UZ: {
            placeholder: 'Fayllarni qidirish',
            translations: {
              button: {
                buttonText: 'Hujjatlarda qidirish'
              }
            }
          }
        }
      }
    }
  },

  vite: {
    plugins: [groupIconVitePlugin(), tailwindcss() as any],
    resolve: {
      alias: [
        {
          find: /^.*\/VPNavBar\.vue$/,
          replacement: fileURLToPath(new URL('../theme/components/NavBar.vue', import.meta.url))
        }
      ]
    }
  }
})
