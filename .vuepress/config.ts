import { defineUserConfig } from "vuepress";
import { defaultTheme } from "vuepress";
import taskLists from 'markdown-it-task-lists'
import { getZhSidebar } from "./config/sidebar/zh";
import { getEnSidebar } from "./config/sidebar/en";
import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics'

export default defineUserConfig({
  lang: "en-US",
  title: "Goravel",
  description: "A Golang web application framework",
  head: [
    [
      "script",
      {
        "data-ad-client": "ca-pub-4978322804450032",
        async: true,
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
      }
    ]
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
  plugins: [
    googleAnalyticsPlugin({
      id: "G-HJQNEG5H69"
    }),
  ],
  extendsMarkdown: md => {
	  md.use(taskLists)
	},
  theme: defaultTheme({
    logo: "https://user-images.githubusercontent.com/24771476/188801966-1b865cb7-99eb-4a62-a486-0c4d9cf7b7fb.png",
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
