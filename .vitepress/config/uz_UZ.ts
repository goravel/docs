import { defineConfig, type DefaultTheme } from 'vitepress';
export const config = defineConfig({
  lang: 'en-US',
  description: "Goravel — bu to‘liq funksiyalarga ega va yuqori darajada kengaytiriladigan web-ilovalar frameworki hisoblanadi. U Go dasturchilari (gopherlar) uchun boshlang‘ich platforma (scaffolding) sifatida xizmat qiladi va ularga o‘z ilovalarini tez, tartibli va professional tarzda yaratishga yordam beradi.",
  themeConfig: {
    nav: nav(),
    sidebar: [{
      text: "Kirish",
      base: '/prologue/',
      items: sidebarPrologue()
    }, {
      text: "Yangilash",
      base: '/upgrade/',
      items: sidebarUpgrade()
    }, {
      text: "Boshlash",
      base: '/getting-started/',
      items: sidebarGettingStarted()
    }, {
      text: "Arxitektura tushunchalari",
      base: '/architecture-concepts/',
      items: sidebarFoundation()
    }, {
      text: "Asosiy tushunchalar",
      base: '/the-basics/',
      items: sidebarBasic()
    }, {
      text: "Chuqurroq o'rganish",
      base: '/digging-deeper/',
      items: sidebarAdvanced()
    }, {
      text: "Xavfsizlik",
      base: '/security/',
      items: sidebarSecurity()
    }, {
      text: "Ma'lumotlar bazasi",
      base: '/database/',
      items: sidebarDatabase()
    }, {
      text: 'ORM',
      base: '/orm/',
      items: sidebarOrm()
    }, {
      text: "Testlash",
      base: '/testing/',
      items: sidebarTesting()
    }],
    editLink: {
      pattern: 'https://github.com/goravel/docs/edit/master/:path',
      text: "Ushbu sahifani GitHub-da tahrirlash"
    },
    footer: {
      message: "MIT litsenziyasi ostida chiqarilgan",
      copyright: `Mualliflik huquqi © 2021-${new Date().getFullYear()} Goravel`
    },
    docFooter: {
      prev: "Oldingi sahifa",
      next: "Keyingi sahifa"
    },
    outline: {
      label: "Ushbu sahifada"
    },
    lastUpdated: {
      text: "Oxirgi yangilanish",
      formatOptions: {
        dateStyle: "qisqa",
        timeStyle: "o'rta"
      }
    },
    langMenuLabel: "Tilni o'zgartirish",
    returnToTopLabel: "Yuqoriga qaytish",
    sidebarMenuLabel: "Menyu",
    darkModeSwitchLabel: "Ko'rinish",
    lightModeSwitchTitle: "Yorug‘lik mavzusiga o‘tish",
    darkModeSwitchTitle: "Qorongʻu mavzuga oʻtish",
    skipToContentLabel: "Kontentga o‘tish"
  }
});
function nav(): DefaultTheme.NavItem[] {
  return [{
    text: "Tez boshlash",
    link: '/getting-started/installation',
    activeMatch: '/getting-started/'
  }, {
    text: "Video darsliklar",
    link: 'https://www.youtube.com/playlist?list=PL40Xne4u-oXJ0Z5uFiPWHqIMvzZaG_BDf'
  }, {
    text: "Versiyalar",
    items: [{
      text: "v1.17 (Eng so'nggi)",
      link: ""
    }, {
      text: 'v1.16',
      link: 'https://v116.goravel.dev/'
    }]
  }, {
    text: "Tarjima qilish",
    link: '/prologue/contributions#add-a-new-language'
  }];
}
function sidebarGettingStarted(): DefaultTheme.SidebarItem[] {
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
    text: 'Excellent Packages',
    link: 'packages'
  }];
}
function sidebarPrologue(): DefaultTheme.SidebarItem[] {
  return [{
    text: 'Release Notes',
    link: 'releases'
  }, {
    text: 'Contribution Guide',
    link: 'contributions'
  }, {
    text: 'Compare With Laravel',
    link: 'compare-with-laravel'
  }, {
    text: 'Privacy Policy',
    link: 'privacy'
  }];
}
function sidebarUpgrade(): DefaultTheme.SidebarItem[] {
  return [{
    text: 'Upgrading To v1.17 From v1.16',
    link: 'v1.17'
  }, {
    text: 'Upgrading To v1.16 From v1.15',
    link: 'v1.16'
  }, {
    text: 'History',
    link: 'history'
  }];
}
function sidebarFoundation(): DefaultTheme.SidebarItem[] {
  return [{
    text: 'Lifecycle',
    link: 'request-lifecycle'
  }, {
    text: 'Service Container',
    link: 'service-container'
  }, {
    text: 'Service Providers',
    link: 'service-providers'
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
    text: 'Middleware',
    link: 'middleware'
  }, {
    text: 'Controllers',
    link: 'controllers'
  }, {
    text: 'Requests',
    link: 'request'
  }, {
    text: 'Responses',
    link: 'response'
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
    text: 'Artisan Console',
    link: 'artisan-console'
  }, {
    text: 'Cache',
    link: 'cache'
  }, {
    text: 'Event',
    link: 'event'
  }, {
    text: 'File Storage',
    link: 'filesystem'
  }, {
    text: 'Mail',
    link: 'mail'
  }, {
    text: 'Queues',
    link: 'queues'
  }, {
    text: 'Task Scheduling',
    link: 'task-scheduling'
  }, {
    text: 'Localization',
    link: 'localization'
  }, {
    text: 'Package Development',
    link: 'package-development'
  }, {
    text: 'Color Output',
    link: 'color'
  }, {
    text: 'Processes',
    link: 'processes'
  }, {
    text: 'Strings',
    link: 'strings'
  }, {
    text: 'Helpers',
    link: 'helpers'
  }, {
    text: 'HTTP Client',
    link: 'http-client'
  }, {
    text: 'Pluralization',
    link: 'pluralization'
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
    text: 'Getting Started',
    link: 'getting-started'
  }, {
    text: 'Relationships',
    link: 'relationships'
  }, {
    text: 'Factories',
    link: 'factories'
  }];
}
function sidebarTesting(): DefaultTheme.SidebarItem[] {
  return [{
    text: 'Getting Started',
    link: 'getting-started'
  }, {
    text: 'HTTP Tests',
    link: 'http-tests'
  }, {
    text: 'Mock',
    link: 'mock'
  }];
}