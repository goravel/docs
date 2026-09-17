import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import Theme from 'vitepress/theme'
import Layout from './Layout.vue'
import GoravelHome from './home/GoravelHome.vue'
import giscusTalk from 'vitepress-plugin-comment-with-giscus'
import { useData, useRoute } from 'vitepress'
import { toRefs } from 'vue'
import '@shikijs/vitepress-twoslash/style.css'
import 'virtual:group-icons.css'
import 'vitepress-markdown-timeline/dist/theme/index.css'
import type { EnhanceAppContext } from 'vitepress'
import './styles.css'
import './goravel.css'
import './shell.css'
import './home/home.css'

export default {
  extends: Theme,
  Layout,
  enhanceApp({ app }: EnhanceAppContext) {
    app.use(TwoslashFloatingVue)
    // `layout: goravel-home` in a page's frontmatter renders this inside the normal shell.
    app.component('goravel-home', GoravelHome)
  },
  setup() {
    // Get frontmatter and route
    const { frontmatter } = toRefs(useData())
    const route = useRoute()

    giscusTalk(
      {
        repo: 'goravel/goravel',
        repoId: 'R_kgDOGR4SdA',
        category: 'Announcements',
        categoryId: 'DIC_kwDOGR4SdM4CUEsk',
        mapping: 'pathname',
        inputPosition: 'top',
        lang: 'en',

        locales: {
          'zh-CN': 'zh-CN',
          en: 'en'
        },
        strict: '0',
        reactionsEnabled: '1',
        lazyLoad: '1',
        homePageShowComment: '0',
        lightTheme: 'preferred_color_scheme',
        darkTheme: 'preferred_color_scheme'
      },
      {
        frontmatter,
        route
      },
      // Whether to activate the comment area on all pages.
      true
    )
  }
}
