import { defineUserConfig } from "vuepress";
import { docsearchPlugin } from "@vuepress/plugin-docsearch";
import taskLists from "markdown-it-task-lists";
import { getZhSidebar } from "./config/sidebar/zh";
import { getEnSidebar } from "./config/sidebar/en";
import { registerComponentsPlugin } from "@vuepress/plugin-register-components";
import { getDirname, path } from "@vuepress/utils";
import { defaultTheme } from '@vuepress/theme-default'
import { seoPlugin } from '@vuepress/plugin-seo'
import { commentPlugin } from '@vuepress/plugin-comment'
import { viteBundler } from '@vuepress/bundler-vite'

const __dirname = getDirname(import.meta.url);

export default defineUserConfig({
  lang: "en-US",
  title: "Goravel",
  description: "A Golang web application framework",
  head: [
    [
      "script",
      {
        crossorigin: "anonymous",
        async: true,
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4978322804450032",
      },
    ],
    [
      "script",
      {
        async: true,
        src: "https://www.googletagmanager.com/gtag/js?id=G-HJQNEG5H69",
      },
    ],
    [
      "script",
      {},
      "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-HJQNEG5H69');",
    ],
  ],
  bundler: viteBundler({
    viteOptions: {},
    vuePluginOptions: {},
  }),
  plugins: [
    registerComponentsPlugin({
      components: {
        SidebarTop: path.resolve(__dirname, "./components/SidebarTop.vue"),
      },
    }),
    docsearchPlugin({
      appId: "4J45WOFT67",
      apiKey: "2d8317ae404e2cdd64933b6dc5416b6a",
      indexName: "goravel",
      locales: {
        "/": {
          placeholder: "Search Documentation",
          translations: {
            button: {
              buttonText: "Search",
            },
          },
        },
        "/zh/": {
          placeholder: "搜索文档",
          translations: {
            button: {
              buttonText: "搜索文档",
            },
          },
        },
      },
    }),
    commentPlugin({
      provider: "Giscus",
      comment: true,
      repo: "goravel/goravel",
      repoId: "R_kgDOGR4SdA",
      category: "Announcements",
      categoryId: "DIC_kwDOGR4SdM4CUEsk",
      mapping: "og:title",
      strict: false,
      reactionsEnabled: true,
      lazyLoading: true,
      darkTheme: "preferred_color_scheme",
      lightTheme: "preferred_color_scheme",
      inputPosition: "top",
    }),
    seoPlugin({
      hostname: "https://goravel.dev",
      ogp: (ogp, page) => ({
        ...ogp,
        "og:title": page.path.replace("/zh", ""),
      }),
    }),
  ],
  locales: {
    "/": {
      lang: "en-US",
      title: "Goravel",
      description: "A Golang web application framework",
    },
    "/zh/": {
      lang: "zh-CN",
      title: "Goravel",
      description: "Golang WEB 应用框架",
    },
  },
  extendsMarkdown: (md) => {
    md.use(taskLists);
  },
  theme: defaultTheme({
    logo: "logo-mini.png",
    contributors: false,
    lastUpdated: false,
    repo: 'goravel/goravel',
    docsBranch: 'master',
    locales: {
      "/": {
        selectLanguageName: "English",
        navbar: [
          {
            text: "Home",
            link: "/",
          },
          {
            text: "Video",
            link: "https://www.youtube.com/playlist?list=PL40Xne4u-oXJ0Z5uFiPWHqIMvzZaG_BDf",
          },
        ],
        sidebar: getEnSidebar(),
      },
      "/zh/": {
        selectLanguageName: "简体中文",
        navbar: [
          {
            text: "首页",
            link: "/zh/",
          },
          {
            text: "视频",
            link: "https://space.bilibili.com/1886603340/channel/seriesdetail?sid=4302621&ctype=0",
          },
        ],
        sidebar: getZhSidebar(),
      },
    },
  }),
});
