import { defineConfig, type DefaultTheme } from 'vitepress';
export const config = defineConfig({
  lang: "uz-UZ",
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
    text: "v1.16-dan v1.17-ga yangilash",
    link: 'v1.17'
  }, {
    text: "v1.15 dan v1.16 ga yangilash",
    link: 'v1.16'
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
    text: 'Routing',
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