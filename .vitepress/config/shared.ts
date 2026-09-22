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
import sup from 'markdown-it-sup'
import taskLists from 'markdown-it-task-lists'
import { LINKS } from '../links'
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

// a first line that is only a file path comment, like `// config/app.go`, becomes the block's title
function liftFileNames(md: MarkdownRenderer) {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const path = token.content.match(/^(?:\/\/|#|--) ?((?:[\w.@-]+\/)*[\w.@-]*\.\w+)\n/)
    // line highlights like {2,4} count from the first line, so a block using them keeps it
    if (!path || /\{[\d,-]+\}/.test(token.info)) return fence(tokens, idx, options, env, self)
    token.content = token.content.slice(path[0].length)
    return fence(tokens, idx, options, env, self).replace(/<span class="lang">[^<]*<\/span>/, `<span class="lang">${path[1]}</span>`)
  }
}

// a fence opened as ````md demo shows its source and then renders it, so an example is written once;
// the rendered headings are kept out of the outline
function renderDemos(md: MarkdownRenderer) {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const source = fence(tokens, idx, options, env, self)
    if (!/^md\s+demo\b/.test(tokens[idx].info.trim())) return source
    return source + md.render(tokens[idx].content, { ...env }).replace(/<h([1-6])\b/g, '<h$1 class="ignore-header"')
  }
}

// a percentage in the packages table's coverage column gets a bar beside it when the page is built
function drawCoverageBars(md: MarkdownRenderer) {
  const close = md.renderer.rules.td_close ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))
  md.renderer.rules.td_close = (tokens, idx, options, env, self) => {
    const value = env.relativePath?.includes('getting-started/packages') && tokens[idx - 1].content.match(/^([\d.]+)%$/)
    const bar = value
      ? `<span class="goravel-coverage"><span class="track"><span class="fill" style="width:${Math.min(100, parseFloat(value[1]))}%"></span></span></span>`
      : ''
    return bar + close(tokens, idx, options, env, self)
  }
}

export const shared = defineConfig({
  title: 'Goravel',

  rewrites: {
    'en/:rest*': ':rest*'
  },
  srcExclude: ['README.md', 'AGENTS.md'],

  appearance: true,
  lastUpdated: true,
  cleanUrls: false,
  metaChunk: true,

  head: [
    // the fonts, requested with the page instead of after the stylesheet
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Mona+Sans:wdth,wght@75..125,200..900&display=swap'
      }
    ],
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
      md.use(sup)
      md.use(deflist)
      markCustomContainerTitles(md)
      liftFileNames(md)
      renderDemos(md)
      drawCoverageBars(md)
    },
    languages: ['go']
  },

  themeConfig: {
    logo: '/logo@2x.png',
    siteTitle: false,
    socialLinks: [{ icon: 'github', link: LINKS.github }],
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
