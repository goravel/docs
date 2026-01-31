import { defineConfig, type DefaultTheme } from 'vitepress';
export const config = defineConfig({
  lang: "zh-TW",
  description: "Goravel 是一個功能完整且可擴展性極強的 Web 應用程序框架。作為一個起始腳手架，幫助 Gopher 快速構建自己的應用程序。",
  themeConfig: {
    nav: nav(),
    sidebar: [{
      text: 'Prologue',
      base: '/prologue/',
      items: sidebarPrologue()
    }, {
      text: "升級",
      base: "/zh_TW/upgrade/",
      items: sidebarUpgrade()
    }, {
      text: 'Getting Started',
      base: '/getting-started/',
      items: sidebarGettingStarted()
    }, {
      text: 'Architecture Concepts',
      base: "/zh_TW/architecture-concepts/",
      items: sidebarFoundation()
    }, {
      text: "基本功能",
      base: "/zh_TW/the-basics/",
      items: sidebarBasic()
    }, {
      text: "深入挖掘",
      base: "/zh_TW/digging-deeper/",
      items: sidebarAdvanced()
    }, {
      text: "安全",
      base: "/zh_TW/security/",
      items: sidebarSecurity()
    }, {
      text: "數據庫",
      base: "/zh_TW/database/",
      items: sidebarDatabase()
    }, {
      text: 'ORM',
      base: "/zh_TW/orm/",
      items: sidebarOrm()
    }, {
      text: "測試",
      base: "/zh_TW/testing/",
      items: sidebarTesting()
    }],
    editLink: {
      pattern: 'https://github.com/goravel/docs/edit/master/:path',
      text: "在 GitHub 上編輯此頁面"
    },
    footer: {
      message: "基於 MIT 许可發佈",
      copyright: `版權 © 2021-${new Date().getFullYear()} Goravel`
    },
    docFooter: {
      prev: "上一頁",
      next: "下一頁"
    },
    outline: {
      label: "頁面導航"
    },
    lastUpdated: {
      text: "最後更新於",
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },
    langMenuLabel: "切換語言",
    returnToTopLabel: "回到頂部",
    sidebarMenuLabel: "菜單",
    darkModeSwitchLabel: "主題",
    lightModeSwitchTitle: "切換到淺色主題",
    darkModeSwitchTitle: "切換到深色主題",
    skipToContentLabel: "跳轉到內容"
  }
});
function nav(): DefaultTheme.NavItem[] {
  return [{
    text: "快速開始",
    link: "/zh_TW/getting-started/installation",
    activeMatch: "/zh_TW/getting-started/"
  }, {
    text: "視頻教程",
    link: "https://space.bilibili.com/1886603340/channel/seriesdetail?sid=4302621&ctype=0"
  }, {
    text: 'Versions',
    items: [{
      text: 'v1.17 (Latest)',
      link: 'https://www.goravel.dev/'
    }, {
      text: 'v1.16',
      link: 'https://v116.goravel.dev/'
    }]
  }, {
    text: 'Translate',
    link: '/prologue/contributions#add-a-new-language'
  }];
}
function sidebarGettingStarted(): DefaultTheme.SidebarItem[] {
  return [{
    text: 'Installation',
    link: 'installation'
  }, {
    text: "配置",
    link: 'configuration'
  }, {
    text: "目錄結構",
    link: 'directory-structure'
  }, {
    text: "編譯",
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
    text: "貢獻指南",
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
    text: "歷史",
    link: 'history'
  }];
}
function sidebarFoundation(): DefaultTheme.SidebarItem[] {
  return [{
    text: "生命週期",
    link: 'request-lifecycle'
  }, {
    text: "服務容器",
    link: 'service-container'
  }, {
    text: "服務提供者",
    link: 'service-providers'
  }, {
    text: "門面",
    link: 'facades'
  }];
}
function sidebarBasic(): DefaultTheme.SidebarItem[] {
  return [{
    text: "路由",
    link: 'routing'
  }, {
    text: "中間件",
    link: 'middleware'
  }, {
    text: "控制器",
    link: 'controllers'
  }, {
    text: "請求",
    link: 'request'
  }, {
    text: "響應",
    link: 'response'
  }, {
    text: "視圖",
    link: 'views'
  }, {
    text: 'Grpc',
    link: 'grpc'
  }, {
    text: "會話",
    link: 'session'
  }, {
    text: "驗證",
    link: 'validation'
  }, {
    text: "日誌",
    link: 'logging'
  }];
}
function sidebarAdvanced(): DefaultTheme.SidebarItem[] {
  return [{
    text: "Artisan 主控台",
    link: 'artisan-console'
  }, {
    text: "快取",
    link: 'cache'
  }, {
    text: "事件",
    link: 'event'
  }, {
    text: "文件存儲",
    link: 'filesystem'
  }, {
    text: "郵件",
    link: 'mail'
  }, {
    text: "隊列",
    link: 'queues'
  }, {
    text: "任務調度",
    link: 'task-scheduling'
  }, {
    text: "本地化",
    link: 'localization'
  }, {
    text: "包開發",
    link: 'package-development'
  }, {
    text: "彩色輸出",
    link: 'color'
  }, {
    text: 'Processes',
    link: 'processes'
  }, {
    text: 'Strings',
    link: 'strings'
  }, {
    text: "輔助函數",
    link: 'helpers'
  }, {
    text: "HTTP 客戶端",
    link: 'http-client'
  }, {
    text: 'Pluralization',
    link: 'pluralization'
  }];
}
function sidebarSecurity(): DefaultTheme.SidebarItem[] {
  return [{
    text: "身份驗證",
    link: 'authentication'
  }, {
    text: "授權",
    link: 'authorization'
  }, {
    text: "加密",
    link: 'encryption'
  }, {
    text: "哈希",
    link: 'hashing'
  }];
}
function sidebarDatabase(): DefaultTheme.SidebarItem[] {
  return [{
    text: "快速入門",
    link: 'getting-started'
  }, {
    text: "查詢構建器",
    link: 'queries'
  }, {
    text: "遷移",
    link: 'migrations'
  }, {
    text: "填充",
    link: 'seeding'
  }];
}
function sidebarOrm(): DefaultTheme.SidebarItem[] {
  return [{
    text: "快速入門",
    link: 'getting-started'
  }, {
    text: "關係",
    link: 'relationships'
  }, {
    text: "工廠",
    link: 'factories'
  }];
}
function sidebarTesting(): DefaultTheme.SidebarItem[] {
  return [{
    text: "快速入門",
    link: 'getting-started'
  }, {
    text: "HTTP 測試",
    link: 'http-tests'
  }, {
    text: "模擬",
    link: 'mock'
  }];
}