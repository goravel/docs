import { SidebarConfigArray } from "vuepress";

export function getZhSidebar(): SidebarConfigArray {
  return [
    {
      text: "前言",
      // collapsible: true,
      children: [
        {
          text: "升级指南",
          children: [
            {
              text: "从 v1.15 升级到 v1.16",
              link: "/zh/upgrade/v1.14",
            },
            {
              text: "从 v1.14 升级到 v1.15",
              link: "/zh/upgrade/v1.15",
            },
            {
              text: "历史版本升级",
              link: "/zh/upgrade/history",
            },
          ],
        },
        {
          text: "贡献指南",
          link: "/zh/prologue/contributions",
        },
        {
          text: "优秀扩展包",
          link: "/zh/prologue/packages",
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
          text: "服务容器",
          link: "/zh/architecutre-concepts/service-container",
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
          text: "视图",
          link: "/zh/the-basics/views",
        },
        {
          text: "Grpc",
          link: "/zh/the-basics/grpc",
        },
        {
          text: "Session",
          link: "/zh/the-basics/session",
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
          text: "本地化",
          link: "/zh/digging-deeper/localization",
        },
        {
          text: "扩展包开发",
          link: "/zh/digging-deeper/package-development",
        },
        {
          text: "颜色",
          link: "/zh/digging-deeper/color",
        },
        {
          text: "Strings",
          link: "/zh/digging-deeper/strings",
        },
        {
          text: "辅助函数",
          link: "/zh/digging-deeper/helpers",
        },
      ],
    },
    {
      text: "安全相关",
      // collapsible: true,
      children: [
        {
          text: "用户验证",
          link: "/zh/security/authentication",
        },
        {
          text: "用户授权",
          link: "/zh/security/authorization",
        },
        {
          text: "加密解密",
          link: "/zh/security/encryption",
        },
        {
          text: "哈希",
          link: "/zh/security/hashing",
        },
      ],
    },
    {
      text: "Database",
      // collapsible: true,
      children: [
        {
          text: "快速入门",
          link: "/zh/database/getting-started",
        },
        {
          text: "数据库迁移",
          link: "/zh/database/migrations",
        },
        {
          text: "数据填充",
          link: "/zh/database/seeding",
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
          text: "模型关联",
          link: "/zh/orm/relationships",
        },
        {
          text: "模型工厂",
          link: "/zh/orm/factories",
        },
      ],
    },
    {
      text: "测试相关",
      // collapsible: true,
      children: [
        {
          text: "快速入门",
          link: "/zh/testing/getting-started",
        },
        {
          text: "HTTP Tests",
          link: "/zh/testing/http-tests",
        },
        {
          text: "Mock",
          link: "/zh/testing/mock",
        },
      ],
    },
  ];
}
