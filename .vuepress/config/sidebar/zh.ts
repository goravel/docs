import { SidebarConfigArray } from "vuepress";

export function getZhSidebar(): SidebarConfigArray {
  return [
    {
      text: "升级指南",
      children: [
        {
          text: "从 v1.7 升级到 v1.8",
          link: "/zh/upgrade/v1.8",
        },
        {
          text: "从 v1.6 升级到 v1.7",
          link: "/zh/upgrade/v1.7",
        },
        {
          text: "从 v1.5 升级到 v1.6",
          link: "/zh/upgrade/v1.6",
        },
        {
          text: "从 v1.4 升级到 v1.5",
          link: "/zh/upgrade/v1.5",
        },
        {
          text: "从 v1.3 升级到 v1.4",
          link: "/zh/upgrade/v1.4",
        },
        {
          text: "从 v1.2 升级到 v1.3",
          link: "/zh/upgrade/v1.3",
        },
        {
          text: "从 v1.1 升级到 v1.2",
          link: "/zh/upgrade/v1.2",
        },
        {
          text: "从 v1.0 升级到 v1.1",
          link: "/zh/upgrade/v1.1",
        },
      ],
    },
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
          text: "HTTP 中间件",
          link: "/zh/the-basics/middleware",
        },
        {
          text: "控制器",
          link: "/zh/the-basics/controllers",
        },
        {
          text: "请求",
          link: "/zh/the-basics/request",
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
          text: "表单验证",
          link: "/zh/the-basics/validation",
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
          text: "用户验证",
          link: "/zh/digging-deeper/authentication",
        },
        {
          text: "用户授权",
          link: "/digging-deeper/authorization",
        },
        {
          text: "缓存系统",
          link: "/zh/digging-deeper/cache",
        },
        {
          text: "事件系统",
          link: "/zh/digging-deeper/event",
        },
        {
          text: "文件储存",
          link: "/zh/digging-deeper/filesystem",
        },
        {
          text: "邮件",
          link: "/zh/digging-deeper/mail",
        },
        {
          text: "队列",
          link: "/zh/digging-deeper/queues",
        },
        {
          text: "任务调度",
          link: "/zh/digging-deeper/task-scheduling",
        },
        {
          text: "Mock",
          link: "/zh/digging-deeper/mock",
        },
      ],
    },
    {
      text: "ORM",
      // collapsible: true,
      children: [
        {
          text: "快速入门",
          link: "/zh/orm/getting-started",
        },
        {
          text: "数据库迁移",
          link: "/zh/orm/migrations",
        },
      ],
    },
  ];
}
