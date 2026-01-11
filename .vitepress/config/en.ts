import { defineConfig, type DefaultTheme } from 'vitepress'

export const config = defineConfig({
  lang: 'en-US',
  description:
    'Goravel is a web application framework with complete functions and excellent scalability. As a starting scaffolding to help Gopher quickly build their own applications.',
  themeConfig: {
    nav: nav(),
    sidebar: [
      {
        text: 'Prologue',
        base: '/prologue/',
        items: sidebarPrologue()
      },
      {
        text: 'Upgrade',
        base: '/upgrade/',
        items: sidebarUpgrade()
      },
      {
        text: 'Getting Started',
        base: '/getting-started/',
        items: sidebarGettingStarted()
      },
      {
        text: 'Architecture Concepts',
        base: '/architecture-concepts/',
        items: sidebarFoundation()
      },
      {
        text: 'The Basics',
        base: '/the-basics/',
        items: sidebarBasic()
      },
      {
        text: 'Digging Deeper',
        base: '/digging-deeper/',
        items: sidebarAdvanced()
      },
      {
        text: 'Security',
        base: '/security/',
        items: sidebarSecurity()
      },
      {
        text: 'Database',
        base: '/database/',
        items: sidebarDatabase()
      },
      {
        text: 'ORM',
        base: '/orm/',
        items: sidebarOrm()
      },
      {
        text: 'Testing',
        base: '/testing/',
        items: sidebarTesting()
      }
    ],

    editLink: {
      pattern: 'https://github.com/goravel/docs/edit/master/:path',
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
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'Quickstart',
      link: '/getting-started/installation',
      activeMatch: '/getting-started/'
    },
    {
      text: 'Video Tutorials',
      link: 'https://www.youtube.com/playlist?list=PL40Xne4u-oXJ0Z5uFiPWHqIMvzZaG_BDf'
    },
    {
      text: 'Translate',
      link: '/prologue/contributions#add-a-new-language'
    }
  ]
}

function sidebarGettingStarted(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Installation',
      link: 'installation'
    },
    {
      text: 'Configuration',
      link: 'configuration'
    },
    {
      text: 'Directory Structure',
      link: 'directory-structure'
    },
    {
      text: 'Compile',
      link: 'compile'
    },
    {
      text: 'Excellent Packages',
      link: 'packages'
    }
  ]
}

function sidebarPrologue(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Release Notes',
      link: 'releases'
    },
    {
      text: 'Contribution Guide',
      link: 'contributions'
    },
    {
      text: 'Compare With Laravel',
      link: 'compare-with-laravel'
    },
    {
      text: 'Privacy Policy',
      link: 'privacy'
    }
  ]
}

function sidebarUpgrade(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Upgrading To v1.16 From v1.15',
      link: 'v1.16'
    },
    {
      text: 'Upgrading To v1.15 From v1.14',
      link: 'v1.15'
    },
    {
      text: 'History',
      link: 'history'
    }
  ]
}

function sidebarFoundation(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Lifecycle',
      link: 'request-lifecycle'
    },
    {
      text: 'Service Container',
      link: 'service-container'
    },
    {
      text: 'Service Providers',
      link: 'service-providers'
    },
    {
      text: 'Facades',
      link: 'facades'
    }
  ]
}

function sidebarBasic(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Routing',
      link: 'routing'
    },
    {
      text: 'Middleware',
      link: 'middleware'
    },
    {
      text: 'Controllers',
      link: 'controllers'
    },
    {
      text: 'Requests',
      link: 'request'
    },
    {
      text: 'Responses',
      link: 'response'
    },
    {
      text: 'Views',
      link: 'views'
    },
    {
      text: 'Grpc',
      link: 'grpc'
    },
    {
      text: 'Session',
      link: 'session'
    },
    {
      text: 'Validation',
      link: 'validation'
    },
    {
      text: 'Logging',
      link: 'logging'
    }
  ]
}

function sidebarAdvanced(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Artisan Console',
      link: 'artisan-console'
    },
    {
      text: 'Cache',
      link: 'cache'
    },
    {
      text: 'Event',
      link: 'event'
    },
    {
      text: 'File Storage',
      link: 'filesystem'
    },
    {
      text: 'Mail',
      link: 'mail'
    },
    {
      text: 'Queues',
      link: 'queues'
    },
    {
      text: 'Task Scheduling',
      link: 'task-scheduling'
    },
    {
      text: 'Localization',
      link: 'localization'
    },
    {
      text: 'Package Development',
      link: 'package-development'
    },
    {
      text: 'Color Output',
      link: 'color'
    },
    {
      text: 'Processes',
      link: 'processes'
    },
    {
      text: 'Strings',
      link: 'strings'
    },
    {
      text: 'Helpers',
      link: 'helpers'
    },
    {
      text: 'HTTP Client',
      link: 'http-client'
    },
    {
      text: 'Pluralization',
      link: 'pluralization'
    },
    {
      text: 'Telemetry',
      link: 'telemetry'
    }
  ]
}

function sidebarSecurity(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Authentication',
      link: 'authentication'
    },
    {
      text: 'Authorization',
      link: 'authorization'
    },
    {
      text: 'Encryption',
      link: 'encryption'
    },
    {
      text: 'Hashing',
      link: 'hashing'
    }
  ]
}

function sidebarDatabase(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Getting Started',
      link: 'getting-started'
    },
    {
      text: 'Query Builder',
      link: 'queries'
    },
    {
      text: 'Migrations',
      link: 'migrations'
    },
    {
      text: 'Seeding',
      link: 'seeding'
    }
  ]
}

function sidebarOrm(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Getting Started',
      link: 'getting-started'
    },
    {
      text: 'Relationships',
      link: 'relationships'
    },
    {
      text: 'Factories',
      link: 'factories'
    }
  ]
}

function sidebarTesting(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Getting Started',
      link: 'getting-started'
    },
    {
      text: 'HTTP Tests',
      link: 'http-tests'
    },
    {
      text: 'Mock',
      link: 'mock'
    }
  ]
}
