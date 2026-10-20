import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import Theme from 'vitepress/theme-without-fonts'
import Layout from './Layout.vue'
import Brand from './components/Brand.vue'
import giscusTalk from 'vitepress-plugin-comment-with-giscus'
import { useData, useRoute } from 'vitepress'
import { defineAsyncComponent, toRefs } from 'vue'
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
    app.component('Brand', Brand)
    // only the three homepages use it, so doc pages do not download it
    app.component('goravel-home', defineAsyncComponent(() => import('./home/Home.vue')))
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
          'en-US': 'en'
        },
        strict: '0',
        reactionsEnabled: '1',
        lazyLoad: '1',
        homePageShowComment: '0',
        lightTheme: 'light',
        darkTheme: 'transparent_dark'
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
