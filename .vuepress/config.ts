import { defineUserConfig } from "vuepress";
import { defaultTheme } from "vuepress";
import { docsearchPlugin } from "@vuepress/plugin-docsearch";
import { commentPlugin } from "vuepress-plugin-comment2";
import taskLists from "markdown-it-task-lists";
import { getZhSidebar } from "./config/sidebar/zh";
import { getEnSidebar } from "./config/sidebar/en";
import { registerComponentsPlugin } from "@vuepress/plugin-register-components";
import { getDirname, path } from "@vuepress/utils";

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
      repo: "goravel/docs",
      repoId: "R_kgDOGe927A",
      category: "Announcements",
      categoryId: "DIC_kwDOGe927M4CU5Kh",
      mapping: "title",
      strict: false,
      reactionsEnabled: true,
      lazyLoading: true,
      darkTheme: "preferred_color_scheme",
      lightTheme: "preferred_color_scheme",
      inputPosition: "top",
    })
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
    locales: {
      "/": {
        selectLanguageName: "English",
        navbar: [
          {
            text: "Home",
            link: "/",
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
        ],
        sidebar: getZhSidebar(),
      },
    },
  }),
});
