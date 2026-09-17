import { defineConfig, type DefaultTheme } from 'vitepress';
import { community } from './community'
export const config = defineConfig({
  lang: "uz-UZ",
  description: "Goravel — bu to‘liq funksiyalarga ega va yuqori darajada kengaytiriladigan web-ilovalar frameworki hisoblanadi. U Go dasturchilari (gopherlar) uchun boshlang‘ich platforma (scaffolding) sifatida xizmat qiladi va ularga o‘z ilovalarini tez, tartibli va professional tarzda yaratishga yordam beradi.",
  themeConfig: {
    nav: nav(),
    sidebar: [{
      text: "Boshlash",
      base: "/uz_UZ/getting-started/",
      collapsed: true,
      items: sidebarGettingStarted()
    }, {
      text: "Arxitektura tushunchalari",
      base: "/uz_UZ/architecture-concepts/",
      collapsed: true,
      items: sidebarFoundation()
    }, {
      text: "Asosiy tushunchalar",
      base: "/uz_UZ/the-basics/",
      collapsed: true,
      items: sidebarBasic()
    }, {
      text: "Chuqurroq o'rganish",
      base: "/uz_UZ/digging-deeper/",
      collapsed: true,
      items: sidebarAdvanced()
    }, {
      text: "AI",
      base: "/uz_UZ/ai/",
      collapsed: true,
      items: sidebarAI()
    }, {
      text: "Xavfsizlik",
      base: "/uz_UZ/security/",
      collapsed: true,
      items: sidebarSecurity()
    }, {
      text: "Ma'lumotlar bazasi",
      base: "/uz_UZ/database/",
      collapsed: true,
      items: sidebarDatabase()
    }, {
      text: 'ORM',
      base: "/uz_UZ/orm/",
      collapsed: true,
      items: sidebarOrm()
    }, {
      text: "Testlash",
      base: "/uz_UZ/testing/",
      collapsed: true,
      items: sidebarTesting()
    }, {
      text: "Yangilash",
      base: "/uz_UZ/upgrade/",
      collapsed: true,
      items: sidebarUpgrade()
    }, {
      text: "Kirish",
      base: "/uz_UZ/prologue/",
      collapsed: true,
      items: sidebarPrologue()
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
        dateStyle: 'short',
        timeStyle: 'medium'
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
  return [
    {
      text: "Hujjatlar",
      link: '/uz_UZ/getting-started/installation',
      activeMatch: '/uz_UZ/getting-started/'
    },
    {
      text: "Qo'llanmalar",
      link: '/uz_UZ/the-basics/routing',
      activeMatch: '/uz_UZ/(the-basics|digging-deeper|database|orm|testing|security|ai)/'
    },
    {
      text: 'Freymvork',
      link: '/uz_UZ/architecture-concepts/request-lifecycle',
      activeMatch: '/uz_UZ/architecture-concepts/'
    },
    community(
      {
        title: 'Hamjamiyat',
        connect: 'Aloqa',
        learn: "O'rganish",
        videos: 'Video darsliklar',
        contribute: "Hissa qo'shish",
        guide: "Hissa qo'shish bo'yicha qo'llanma",
        language: "Til qo'shish",
        languageAnchor: 'add-a-new-language'
      },
      '/uz_UZ'
    )
  ]
}

function sidebarGettingStarted(): DefaultTheme.SidebarItem[] {
  return [{
    text: "O'rnatish",
    link: 'installation'
  }, {
    text: "Konfiguratsiya",
    link: 'configuration'
  }, {
    text: "Papka tuzilishi",
    link: 'directory-structure'
  }, {
    text: "Tuzish",
    link: 'compile'
  }, {
    text: "Ajoyib Paketlar",
    link: 'packages'
  }];
}
function sidebarPrologue(): DefaultTheme.SidebarItem[] {
  return [{
    text: "Chiqarish eslatmalari",
    link: 'releases'
  }, {
    text: "Hissa qo‘shish bo‘yicha qo‘llanma",
    link: 'contributions'
  }, {
    text: "Laravel bilan solishtiring",
    link: 'compare-with-laravel'
  }, {
    text: "Maxfiylik siyosati",
    link: 'privacy'
  }];
}
function sidebarUpgrade(): DefaultTheme.SidebarItem[] {
  return [{
    text: "v1.17-dan v1.18-ga yangilash",
    link: 'v1.18'
  }, {
    text: "v1.16-dan v1.17-ga yangilash",
    link: 'v1.17'
  }, {
    text: "Tarix",
    link: 'history'
  }];
}
function sidebarFoundation(): DefaultTheme.SidebarItem[] {
  return [{
    text: "Hayot sikli",
    link: 'request-lifecycle'
  }, {
    text: "Xizmat konteyneri",
    link: 'service-container'
  }, {
    text: "Xizmat ko'rsatuvchilar",
    link: 'service-providers'
  }, {
    text: "Fasadlar",
    link: 'facades'
  }];
}
function sidebarBasic(): DefaultTheme.SidebarItem[] {
  return [{
    text: "Marshrutlash",
    link: 'routing'
  }, {
    text: 'Middleware',
    link: 'middleware'
  }, {
    text: "Kontrollerlar",
    link: 'controllers'
  }, {
    text: "So'rovlar",
    link: 'request'
  }, {
    text: "Javoblar",
    link: 'response'
  }, {
    text: "Ko‘rishlar",
    link: 'views'
  }, {
    text: 'Grpc',
    link: 'grpc'
  }, {
    text: "Seans",
    link: 'session'
  }, {
    text: "Tekshirish",
    link: 'validation'
  }, {
    text: "Loglash",
    link: 'logging'
  }];
}
function sidebarAdvanced(): DefaultTheme.SidebarItem[] {
  return [{
    text: "Artisan Konsoli",
    link: 'artisan-console'
  }, {
    text: "Kesh",
    link: 'cache'
  }, {
    text: "Harakat",
    link: 'event'
  }, {
    text: "Fayl saqlash",
    link: 'filesystem'
  }, {
    text: "Pochta",
    link: 'mail'
  }, {
    text: "Navbatlar",
    link: 'queues'
  }, {
    text: "Vazifa rejalashtirish",
    link: 'task-scheduling'
  }, {
    text: "Lokallashtirish",
    link: 'localization'
  }, {
    text: "Paketni ishlab chiqish",
    link: 'package-development'
  }, {
    text: "Rang chiqishi",
    link: 'color'
  }, {
    text: "Jarayonlar",
    link: 'processes'
  }, {
    text: "Satrlar",
    link: 'strings'
  }, {
    text: "Yordamchilar",
    link: 'helpers'
  }, {
    text: "HTTP Klienti",
    link: 'http-client'
  }, {
    text: "Ko‘plik shakllari",
    link: 'pluralization'
  }, {
    text: "To‘plamlar",
    link: 'collections'
  }, {
    text: "Telemetriya",
    link: 'telemetry'
  }];
}
function sidebarAI(): DefaultTheme.SidebarItem[] {
  return [{
    text: "AI SDK",
    link: 'sdk'
  }];
}
function sidebarSecurity(): DefaultTheme.SidebarItem[] {
  return [{
    text: "Autentifikatsiya",
    link: 'authentication'
  }, {
    text: "Avtorizatsiya",
    link: 'authorization'
  }, {
    text: "Shifrlash",
    link: 'encryption'
  }, {
    text: "Xeshlash",
    link: 'hashing'
  }];
}
function sidebarDatabase(): DefaultTheme.SidebarItem[] {
  return [{
    text: "Boshlash",
    link: 'getting-started'
  }, {
    text: "So'rov quruvchi",
    link: 'queries'
  }, {
    text: "Migratsiyalar",
    link: 'migrations'
  }, {
    text: "Urg'ochish",
    link: 'seeding'
  }];
}
function sidebarOrm(): DefaultTheme.SidebarItem[] {
  return [{
    text: "Boshlash",
    link: 'getting-started'
  }, {
    text: "Bog'lanishlar",
    link: 'relationships'
  }, {
    text: "Zavodlar",
    link: 'factories'
  }];
}
function sidebarTesting(): DefaultTheme.SidebarItem[] {
  return [{
    text: "Boshlash",
    link: 'getting-started'
  }, {
    text: "HTTP Testlari",
    link: 'http-tests'
  }, {
    text: 'Mock',
    link: 'mock'
  }];
}