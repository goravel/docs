import { SidebarConfigArray } from 'vuepress'

export function getZhSidebar(): SidebarConfigArray {
  return [
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
          text: "Artisan 命令行",
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
  ]
}