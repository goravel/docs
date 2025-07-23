import { defineConfig, type DefaultTheme } from 'vitepress';
export const config = defineConfig({
  lang: 'en-US',
  description: 'Goravel is a web application framework with complete functions and excellent scalability. As a starting scaffolding to help Gopher quickly build their own applications.',
  themeConfig: {
    nav: nav(),
    sidebar: [{
      text: 'Quickstart',
      base: "/quickstart/",
      items: sidebarQuickstart()
    }, {
      text: 'Upgrade',
      base: '/upgrade/',
      items: sidebarUpgrade()
    }, {
      text: "Foundation",
      base: "/foundation/",
      items: sidebarFoundation()
    }, {
      text: "Basic",
      base: "/basic/",
      items: sidebarBasic()
    }, {
      text: "Advanced",
      base: "/advanced/",
      items: sidebarAdvanced()
    }, {
      text: 'Security',
      base: '/security/',
      items: sidebarSecurity()
    }, {
      text: "ORM",
      base: "/orm/",
      items: sidebarDatabase()
    }, {
      text: "Testing",
      base: "/testing/",
      items: sidebarOrm()
    }, {
      text: "Other",
      base: "/other/",
      items: sidebarTesting()
    }],
    editLink: {
      pattern: "https://github.com/goravel/goravel.github.io/edit/main/:path",
      text: 'Edit this page on GitHub'
    },
    footer: {
      message: 'Released under the MIT License',
      copyright: `Copyright © 2021-${new Date().getFullYear()} Goravel`
    },
    docFooter: {
      prev: 'Previous page',
      next: 'Next page'
    },
    outline: {
      label: 'On this page'
    },
    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },
    langMenuLabel: 'Change language',
    returnToTopLabel: 'Return to top',
    sidebarMenuLabel: 'Menu',
    darkModeSwitchLabel: 'Appearance',
    lightModeSwitchTitle: 'Switch to light theme',
    darkModeSwitchTitle: 'Switch to dark theme',
    skipToContentLabel: 'Skip to content'
  }
});
function nav(): DefaultTheme.NavItem[] {
  return [{
    text: 'Quickstart',
    link: "/quickstart/installation",
    activeMatch: "/quickstart/"
  }, {
    text: "Upgrade",
    link: "/upgrade/v1.15"
  }];
}
function sidebarQuickstart(): DefaultTheme.SidebarItem[] {
  return [{
    text: 'Installation',
    link: 'installation'
  }, {
    text: 'Configuration',
    link: 'configuration'
  }, {
    text: 'Directory Structure',
    link: 'directory-structure'
  }, {
    text: 'Compile',
    link: 'compile'
  }, {
    text: 'Contribution Guide',
    link: 'contributions'
  }, {
    text: 'Excellent Packages',
    link: 'packages'
  }, {
    text: 'Privacy Policy',
    link: 'privacy'
  }];
}
function sidebarUpgrade(): DefaultTheme.SidebarItem[] {
  return [{
    text: "Upgrade from v1.15",
    link: "v1.15"
  }, {
    text: "Upgrade from v1.14",
    link: "v1.14"
  }, {
    text: 'History',
    link: 'history'
  }];
}
function sidebarFoundation(): DefaultTheme.SidebarItem[] {
  return [{
    text: 'Lifecycle',
    link: "lifecycle"
  }, {
    text: 'Service Container',
    link: "container"
  }, {
    text: 'Service Providers',
    link: "providers"
  }, {
    text: 'Facades',
    link: 'facades'
  }];
}
function sidebarBasic(): DefaultTheme.SidebarItem[] {
  return [{
    text: 'Routing',
    link: 'routing'
  }, {
    text: "Middlewares",
    link: "middlewares"
  }, {
    text: 'Controllers',
    link: 'controllers'
  }, {
    text: 'Requests',
    link: "requests"
  }, {
    text: 'Responses',
    link: "responses"
  }, {
    text: 'Views',
    link: 'views'
  }, {
    text: 'Grpc',
    link: 'grpc'
  }, {
    text: 'Session',
    link: 'session'
  }, {
    text: 'Validation',
    link: 'validation'
  }, {
    text: 'Logging',
    link: 'logging'
  }];
}
function sidebarAdvanced(): DefaultTheme.SidebarItem[] {
  return [{
    text: "Artisan",
    link: "artisan"
  }, {
    text: 'Cache',
    link: 'cache'
  }, {
    text: "Events",
    link: "events"
  }, {
    text: 'File Storage',
    link: "fs"
  }, {
    text: 'Mail',
    link: 'mail'
  }, {
    text: 'Queues',
    link: 'queues'
  }, {
    text: 'Task Scheduling',
    link: "schedule"
  }, {
    text: 'Localization',
    link: 'localization'
  }, {
    text: 'Package Development',
    link: "package"
  }, {
    text: 'Color Output',
    link: 'color'
  }, {
    text: 'Strings',
    link: 'strings'
  }, {
    text: 'Helpers',
    link: 'helpers'
  }, {
    text: 'HTTP Client',
    link: 'http-client'
  }];
}
function sidebarSecurity(): DefaultTheme.SidebarItem[] {
  return [{
    text: 'Authentication',
    link: 'authentication'
  }, {
    text: 'Authorization',
    link: 'authorization'
  }, {
    text: 'Encryption',
    link: 'encryption'
  }, {
    text: 'Hashing',
    link: 'hashing'
  }];
}
function sidebarDatabase(): DefaultTheme.SidebarItem[] {
  return [{
    text: 'Getting Started',
    link: 'getting-started'
  }, {
    text: 'Query Builder',
    link: 'queries'
  }, {
    text: 'Migrations',
    link: 'migrations'
  }, {
    text: 'Seeding',
    link: 'seeding'
  }];
}
function sidebarOrm(): DefaultTheme.SidebarItem[] {
  return [{
    text: "Quickstart",
    link: "quickstart"
  }, {
    text: 'Relationships',
    link: 'relationships'
  }, {
    text: "Migrations",
    link: "migrations"
  }];
}
function sidebarTesting(): DefaultTheme.SidebarItem[] {
  return [{
    text: "Quickstart",
    link: "quickstart"
  }, {
    text: 'HTTP Tests',
    link: "http"
  }, {
    text: "Mocks",
    link: "mocks"
  }];
}