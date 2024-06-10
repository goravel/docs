import { SidebarConfigArray } from "vuepress";

export function getEnSidebar(): SidebarConfigArray {
  return [
    {
      text: "Prologue",
      // collapsible: true,
      children: [
        {
          text: "Upgrade Guide",
          children: [
            {
              text: "Upgrading To v1.14 From v1.13",
              link: "/upgrade/v1.14",
            },
            {
              text: "Upgrading To v1.13 From v1.12",
              link: "/upgrade/v1.13",
            },
            {
              text: "History Upgrade",
              link: "/upgrade/history",
            },
          ],
        },
        {
          text: "Contribution Guide",
          link: "/prologue/contributions",
        },
        {
          text: "Excellent Extend Packages",
          link: "/prologue/packages",
        },
      ],
    },
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
          text: "Service Container",
          link: "/architecutre-concepts/service-container",
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
          text: "HTTP Middleware",
          link: "/the-basics/middleware",
        },
        {
          text: "Controllers",
          link: "/the-basics/controllers",
        },
        {
          text: "Requests",
          link: "/the-basics/request",
        },
        {
          text: "Responses",
          link: "/the-basics/response",
        },
        {
          text: "Views",
          link: "/the-basics/views",
        },
        {
          text: "Grpc",
          link: "/the-basics/grpc",
        },
        {
          text: "Session",
          link: "/the-basics/session",
        },
        {
          text: "Validation",
          link: "/the-basics/validation",
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
          link: "/digging-deeper/event",
        },
        {
          text: "File Storage",
          link: "/digging-deeper/filesystem",
        },
        {
          text: "Mail",
          link: "/digging-deeper/mail",
        },
        {
          text: "Queues",
          link: "/digging-deeper/queues",
        },
        {
          text: "Task Scheduling",
          link: "/digging-deeper/task-scheduling",
        },
        {
          text: "Localization",
          link: "/digging-deeper/localization",
        },
        {
          text: "Package Development",
          link: "/digging-deeper/package-development",
        },
        {
          text: "Color",
          link: "/digging-deeper/color",
        },
        {
          text: "Strings",
          link: "/digging-deeper/strings",
        },
        {
          text: "Helpers",
          link: "/digging-deeper/helpers",
        },
      ],
    },
    {
      text: "Security",
      // collapsible: true,
      children: [
        {
          text: "Authentication",
          link: "/security/authentication",
        },
        {
          text: "Authorization",
          link: "/security/authorization",
        },
        {
          text: "Encryption",
          link: "/security/encryption",
        },
        {
          text: "Hashing",
          link: "/security/hashing",
        },
      ],
    },
    {
      text: "ORM",
      // collapsible: true,
      children: [
        {
          text: "Getting Started",
          link: "/orm/getting-started",
        },
        {
          text: "Relationships",
          link: "/orm/relationships",
        },
        {
          text: "Migrations",
          link: "/orm/migrations",
        },
        {
          text: "Seeding",
          link: "/orm/seeding",
        },
        {
          text: "Factories",
          link: "/orm/factories",
        },
      ],
    },
    {
      text: "Testing",
      // collapsible: true,
      children: [
        {
          text: "Getting Started",
          link: "/testing/getting-started",
        },
        {
          text: "Mock",
          link: "/testing/mock",
        },
      ],
    },
  ];
}
