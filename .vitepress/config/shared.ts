import {
  transformerMetaWordHighlight,
  transformerNotationWordHighlight
} from '@shikijs/transformers'
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
import { goravelDark, goravelLight } from './goravel-code'
import {
  groupIconMdPlugin,
  groupIconVitePlugin
} from 'vitepress-plugin-group-icons'

// import {enSearch, zh_CNSearch} from './search'


/**
 * Tell a container's type name apart from a title its author wrote.
 *
 * `::: warning` renders the word WARNING, which is a label and is set like one: small, mono,
 * tracked. `::: warning Read this before upgrading` renders a sentence, and setting a sentence
 * as a label stretches it into something unreadable. The markup VitePress emits is identical in
 * both cases, so the difference cannot be reached from CSS. This wraps VitePress's own renderer
 * for each container and adds `has-custom-title` when the opening fence carried words of its
 * own, which the stylesheet then sets as text rather than as a label.
 */
function markCustomContainerTitles(md: MarkdownRenderer) {
  for (const name of ['info', 'tip', 'warning', 'danger', 'details']) {
    const key = `container_${name}_open`
    const original = md.renderer.rules[key]
    if (!original) continue
    md.renderer.rules[key] = (tokens, idx, options, env, self) => {
      const html = original(tokens, idx, options, env, self)
      // anything after the type name on the fence is a title the author typed
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
    theme: { light: goravelLight, dark: goravelDark },
    lineNumbers: true,
    codeTransformers: [
      /* VitePress enables four notation transformers (diff, focus, highlight, error level) but
         not the word ones, so `[!code word:Foo]` in a comment, and `/Foo/` on the fence, both
         rendered as literal text. */
      transformerNotationWordHighlight(),
      transformerMetaWordHighlight(),
      transformerTwoslash({
        typesCache: createFileSystemTypesCache()
      })
    ],
    config(md) {
      md.use(groupIconMdPlugin)
      md.use(timeline)
      // markdown VitePress does not ship: footnotes, task lists, sub/sup and definition lists
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
    /* a 4x RGBA cut of the wordmark: the 1000px original is an indexed PNG and the browser
       had to take it down eleven-fold, which is what made the mark look soft */
    logo: '/logo@2x.png',
    siteTitle: false,
    /* Only GitHub. Discord and X live in Community, and listing them in both places made the
       bar read as a toolbar of every link we have rather than a set of decisions. */
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
    plugins: [groupIconVitePlugin(), tailwindcss() as any]
  }
})
