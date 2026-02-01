import { defineConfig, type DefaultTheme } from 'vitepress';
export const config = defineConfig({
  lang: "zh-CN",
  description: "Goravel 是一个功能完整且可扩展性极强的 Web 应用程序框架。作为一个起始脚手架，帮助 Gopher 快速构建自己的应用程序。",
  themeConfig: {
    nav: nav(),
    sidebar: [{
      text: "序言",
      base: '/prologue/',
      items: sidebarPrologue()
    }, {
      text: "升级",
      base: "/zh_CN/upgrade/",
      items: sidebarUpgrade()
    }, {
      text: 'Getting Started',
      base: '/getting-started/',
      items: sidebarGettingStarted()
    }, {
      text: 'Architecture Concepts',
      base: '/architecture-concepts/',
      items: sidebarFoundation()
    }, {
      text: 'The Basics',
      base: '/the-basics/',
      items: sidebarBasic()
    }, {
      text: 'Digging Deeper',
      base: '/digging-deeper/',
      items: sidebarAdvanced()
    }, {
      text: 'Security',
      base: '/security/',
      items: sidebarSecurity()
    }, {
      text: 'Database',
      base: '/database/',
      items: sidebarDatabase()
    }, {
      text: 'ORM',
      base: '/orm/',
      items: sidebarOrm()
    }, {
      text: 'Testing',
      base: '/testing/',
      items: sidebarTesting()
    }],
    editLink: {
      pattern: 'https://github.com/goravel/docs/edit/master/:path',
      text: "在 GitHub 上编辑此页面"
    },
    footer: {
      message: "基于 MIT 许可发布",
      copyright: `版权所有 © 2021-${new Date().getFullYear()} Goravel`
    },
    docFooter: {
      prev: "上一页",
      next: "下一页"
    },
    outline: {
      label: "页面导航"
    },
    lastUpdated: {
      text: "最后更新于",
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },
    langMenuLabel: "切换语言",
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "切换到浅色主题",
    darkModeSwitchTitle: "切换到深色主题",
    skipToContentLabel: "跳转到内容"
  }
});
function nav(): DefaultTheme.NavItem[] {
  return [{
    text: "快速开始",
    link: "/zh_CN/getting-started/installation",
    activeMatch: "/zh_CN/getting-started/"
  }, {
    text: "视频教程",
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
    text: "历史",
    link: 'history'
  }];
}
function sidebarFoundation(): DefaultTheme.SidebarItem[] {
  return [{
    text: "生命周期",
    link: 'request-lifecycle'
  }, {
    text: "服务容器",
    link: 'service-container'
  }, {
    text: "服务提供者",
    link: 'service-providers'
  }, {
    text: "门面",
    link: 'facades'
  }];
}
function sidebarBasic(): DefaultTheme.SidebarItem[] {
  return [{
    text: "路由",
    link: 'routing'
  }, {
    text: "中间件",
    link: 'middleware'
  }, {
    text: "控制器",
    link: 'controllers'
  }, {
    text: "请求",
    link: 'request'
  }, {
    text: "响应",
    link: 'response'
  }, {
    text: "视图",
    link: 'views'
  }, {
    text: 'Grpc',
    link: 'grpc'
  }, {
    text: "会话",
    link: 'session'
  }, {
    text: "验证",
    link: 'validation'
  }, {
    text: "日志",
    link: 'logging'
  }];
}
function sidebarAdvanced(): DefaultTheme.SidebarItem[] {
  return [{
    text: "Artisan 命令行",
    link: 'artisan-console'
  }, {
    text: "缓存",
    link: 'cache'
  }, {
    text: "事件",
    link: 'event'
  }, {
    text: "文件存储",
    link: 'filesystem'
  }, {
    text: "邮件",
    link: 'mail'
  }, {
    text: "队列",
    link: 'queues'
  }, {
    text: "任务调度",
    link: 'task-scheduling'
  }, {
    text: "本地化",
    link: 'localization'
  }, {
    text: "包开发",
    link: 'package-development'
  }, {
    text: "彩色输出",
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
    text: "身份验证",
    link: 'authentication'
  }, {
    text: "授权",
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
    text: "快速入门",
    link: 'getting-started'
  }, {
    text: "查询构建器",
    link: 'queries'
  }, {
    text: "迁移",
    link: 'migrations'
  }, {
    text: "填充",
    link: 'seeding'
  }];
}
function sidebarOrm(): DefaultTheme.SidebarItem[] {
  return [{
    text: "快速入门",
    link: 'getting-started'
  }, {
    text: "关系",
    link: 'relationships'
  }, {
    text: "工厂",
    link: 'factories'
  }];
}
function sidebarTesting(): DefaultTheme.SidebarItem[] {
  return [{
    text: "快速入门",
    link: 'getting-started'
  }, {
    text: "HTTP 测试",
    link: 'http-tests'
  }, {
    text: "模拟",
    link: 'mock'
  }];
}