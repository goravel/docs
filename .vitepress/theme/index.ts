import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import Theme from 'vitepress/theme'
import giscusTalk from 'vitepress-plugin-comment-with-giscus'
import { useData, useRoute } from 'vitepress'
import { toRefs } from 'vue'
import '@shikijs/vitepress-twoslash/style.css'
import 'virtual:group-icons.css'
import 'vitepress-markdown-timeline/dist/theme/index.css'
import type { EnhanceAppContext } from 'vitepress'
import './styles.css'

export default {
  extends: Theme,
  enhanceApp({ app }: EnhanceAppContext) {
    app.use(TwoslashFloatingVue)
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
        // i18n setting (Note: This configuration will override the default language set by lang)
        // Configured as an object with key-value pairs inside:
        // [your i18n configuration name]: [corresponds to the language pack name in Giscus]
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
      // The default is true, which means enabled, this parameter can be ignored;
      // If it is false, it means it is not enabled.
      // You can use `comment: true` preface to enable it separately on the page.
      true
    )
  }
}
