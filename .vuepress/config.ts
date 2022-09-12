import { defineUserConfig } from "vuepress";
import { defaultTheme } from "vuepress";
import { docsearchPlugin } from "@vuepress/plugin-docsearch";

export default defineUserConfig({
  lang: "en-US",
  title: "Goravel",
  description: "A web application framework",
  plugins: [
    docsearchPlugin({
      appId: "4J45WOFT67",
      apiKey: "7792b58507cf7d450abb1f287f88e3bb",
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
  ],
  locales: {
    "/": {
      lang: "en-US",
      title: "",
      description: "A web application framework",
    },
    "/zh/": {
      lang: "zh-CN",
      title: "",
      description: "WEB 应用框架",
    },
  },
  theme: defaultTheme({
    logo: "https://camo.githubusercontent.com/1dba3402b80a43a1f5fa8a30d1706b497b73dfc4ce2bd77dfcc5ebcbad1c0fd0/68747470733a2f2f676f726176656c2e73332e75732d656173742d322e616d617a6f6e6177732e636f6d2f676f726176656c2d776f72642e706e67",
    locales: {
      "/": {
        selectLanguageName: "English",
        navbar: [
          {
            text: "Home",
            link: "/",
          },
        ],
        sidebar: [
          {
            text: "Getting Started",
            // collapsible: true,
            children: [
              {
                text: "Installation",
                link: "/getting-started/installation",
              },
              {
                text: "Configuration",
                link: "/getting-started/configuration",
              },
              {
                text: "Directory Structure",
                link: "/getting-started/directory-structure",
              },
              {
                text: "Compile",
                link: "/getting-started/compile",
              },
            ],
          },
          {
            text: "Architecutre Concepts",
            // collapsible: true,
            children: [
              {
                text: "Request Lifecycle",
                link: "/architecutre-concepts/request-lifecycle",
              },
              {
                text: "Service Providers",
                link: "/architecutre-concepts/service-providers",
              },
              {
                text: "Facades",
                link: "/architecutre-concepts/facades",
              },
            ],
          },
          {
            text: "The Basics",
            // collapsible: true,
            children: [
              {
                text: "Routing",
                link: "/the-basics/routing",
              },
              {
                text: "Middleware",
                link: "/the-basics/middleware",
              },
              {
                text: "Controllers",
                link: "/the-basics/controllers",
              },
              {
                text: "Response",
                link: "/the-basics/response",
              },
              {
                text: "Grpc",
                link: "/the-basics/grpc",
              },
              {
                text: "Logging",
                link: "/the-basics/logging",
              },
            ],
          },
          {
            text: "Digging Deeper",
            // collapsible: true,
            children: [
              {
                text: "Artisan Console",
                link: "/digging-deeper/artisan-console",
              },
              {
                text: "Cache",
                link: "/digging-deeper/cache",
              },
              {
                text: "Events",
                link: "/digging-deeper/events",
              },
              {
                text: "Queues",
                link: "/digging-deeper/queues",
              },
              {
                text: "Task Scheduling",
                link: "/digging-deeper/task-scheduling",
              },
            ],
          },
          {
            text: "Eloquent ORM",
            // collapsible: true,
            children: [
              {
                text: "Getting Started",
                link: "/ORM/getting-started",
              },
              {
                text: "Migrations",
                link: "/ORM/migrations",
              },
            ],
          },
        ],
      },
      "/zh/": {
        selectLanguageName: "简体中文",
        navbar: [
          {
            text: "首页",
            link: "/zh/",
          },
        ],
        sidebar: [
          {
            text: "入门指南",
            // collapsible: true,
            children: [
              {
                text: "安装",
                link: "/zh/getting-started/installation",
              },
              {
                text: "配置信息",
                link: "/zh/getting-started/configuration",
              },
              {
                text: "文件夹结构",
                link: "/zh/getting-started/directory-structure",
              },
              {
                text: "编译",
                link: "/zh/getting-started/compile",
              },
            ],
          },
          {
            text: "核心架构",
            // collapsible: true,
            children: [
              {
                text: "请求周期",
                link: "/zh/architecutre-concepts/request-lifecycle",
              },
              {
                text: "服务提供者",
                link: "/zh/architecutre-concepts/service-providers",
              },
              {
                text: "Facades",
                link: "/zh/architecutre-concepts/facades",
              },
            ],
          },
          {
            text: "基本功能",
            // collapsible: true,
            children: [
              {
                text: "路由",
                link: "/zh/the-basics/routing",
              },
              {
                text: "中间件",
                link: "/zh/the-basics/middleware",
              },
              {
                text: "控制器",
                link: "/zh/the-basics/controllers",
              },
              {
                text: "响应",
                link: "/zh/the-basics/response",
              },
              {
                text: "Grpc",
                link: "/zh/the-basics/grpc",
              },
              {
                text: "日志",
                link: "/zh/the-basics/logging",
              },
            ],
          },
          {
            text: "综合话题",
            // collapsible: true,
            children: [
              {
                text: "Artisan命令行",
                link: "/zh/digging-deeper/artisan-console",
              },
              {
                text: "缓存系统",
                link: "/zh/digging-deeper/cache",
              },
              {
                text: "事件系统",
                link: "/zh/digging-deeper/events",
              },
              {
                text: "队列",
                link: "/zh/digging-deeper/queues",
              },
              {
                text: "任务调度",
                link: "/zh/digging-deeper/task-scheduling",
              },
            ],
          },
          {
            text: "Eloquent ORM",
            // collapsible: true,
            children: [
              {
                text: "快速入门",
                link: "/zh/ORM/getting-started",
              },
              {
                text: "数据库迁移",
                link: "/zh/ORM/migrations",
              },
            ],
          },
        ],
      },
    },
  }),
});
