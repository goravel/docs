import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import { useLangs } from 'vitepress/dist/client/theme-default/composables/langs.js'

type Dict = Record<string, string>

const zh_CN: Dict = {
  Route: '路由',
  Middleware: '中间件',
  Controller: '控制器',
  Service: '服务',
  Response: '响应',
  Routing: '路由',
  Validation: '验证',
  Queues: '队列',
  Events: '事件',
  Scheduling: '调度',
  Cache: '缓存',
  Testing: '测试',
  Application: '应用',
  Core: '核心',
  Data: '数据',
  Async: '异步',
  'Familiar structure.': '熟悉的结构。',
  'Native Go.': '原生的 Go。',
  'Routing, an ORM, validation, queues, events and cache, in one framework.':
    '路由、ORM、验证、队列、事件与缓存，尽在一个框架之中。',
  'Get started': '快速开始',
  'Compare with Laravel': '与 Laravel 对比',
  'Start with the core.': '从核心开始。',
  'facades installed': '个门面已安装',
  'Open source.': '开源。',
  'WeChat group': '微信群',
  'Support with WeChat': '微信赞赏',
  'A Go framework with the structure of Laravel.': '拥有 Laravel 结构的 Go 框架。',
  Concepts: '概念',
  'Install steps': '安装步骤',
  'WeChat group QR code': '微信群二维码',
  'WeChat reward QR code': '微信赞赏二维码',
  'GitHub stars': 'GitHub 星标',
  contributors: '贡献者',
  forks: '复刻',
  Documentation: '文档',
  Project: '项目',
  Community: '社区',
  Installation: '安装',
  ORM: 'ORM',
  'Release Notes': '发行说明',
  'Upgrading To v1.18': '升级到 v1.18',
  'Compare With Laravel': '与 Laravel 对比',
  'Contribution Guide': '贡献指南',
  'Privacy Policy': '隐私政策',
  Contribute: '参与贡献',
  'This page does not exist.': '页面不存在。',
  'It may have moved in a newer version of the docs, or the address may be wrong.': '它可能已在新版文档中移动，或者地址有误。',
  'Go to the documentation': '前往文档',
  'Try these': '试试这些',
  'Upgrading To v1.18 From v1.17': '从 v1.17 升级到 v1.18',
  'Excellent Packages': '优秀扩展包',
  Methods: '方法',
  Filter: '筛选',
  'Filter methods': '筛选方法',
  'Familiar facades, familiar method names': '熟悉的门面，熟悉的方法名',
  'The same file layout, artisan included': '相同的目录结构，自带 artisan',
  'Laravel, line for line.': '与 Laravel 逐行对应。',
  'facades. One framework.': '个门面，一个框架。',
  'One process': '一个进程',
  'HTTP, gRPC, queue, scheduler and telemetry start together.': 'HTTP、gRPC、队列、调度与遥测一同启动。',
  'Gin or Fiber': 'Gin 或 Fiber',
  'Real databases in tests': '用真实数据库测试',
  'OpenTelemetry traces, metrics and logs.': 'OpenTelemetry 链路、指标与日志。',
  'One binary': '一个二进制文件',
  'Upload the binary and your .env. No runtime to install.': '上传二进制文件和 .env 即可，无需安装运行时。',
  'Runs on gin. Install fiber, change one line.': '默认使用 gin。安装 fiber，改一行配置即可切换。',
  'Postgres or Redis in Docker, from inside a test.': '在测试中通过 Docker 启动 Postgres 或 Redis。',
  'Agents and tools for OpenAI, Anthropic and Gemini.': '支持 OpenAI、Anthropic 与 Gemini 的智能体和工具。',
  'Goravel Lite ships only the essentials. Add the rest when you need them.': 'Goravel Lite 只包含必要的门面，其余按需安装。',
  new: '新',
  Copy: '复制',
  Copied: '已复制',
  Releases: '版本发布',
  release: '发布',
  'bug fixes': '缺陷修复',
  planned: '计划中',
  ended: '已结束',
  today: '今天',
  'Core team': '核心团队',
  'more contributors': '位其他贡献者',
  'Star on GitHub': '在 GitHub 上 Star',
  'MIT licensed': 'MIT 许可',
  'Join Discord': '加入 Discord',
  'Questions and discussion': '提问与讨论',
  Sponsor: '赞助',
  'Features earn a T‑shirt': '贡献功能可获得 T 恤'
}

const uz_UZ: Dict = {
  Route: 'Marshrut',
  Middleware: 'Oraliq dastur',
  Controller: 'Kontroller',
  Service: 'Xizmat',
  Response: 'Javob',
  Routing: 'Marshrutlash',
  Validation: 'Validatsiya',
  Queues: 'Navbatlar',
  Events: 'Hodisalar',
  Scheduling: 'Rejalashtirish',
  Cache: 'Kesh',
  Testing: 'Test',
  Application: 'Ilova',
  Core: 'Yadro',
  Data: "Ma'lumotlar",
  Async: 'Asinxron',
  'Familiar structure.': 'Tanish tuzilma.',
  'Native Go.': 'Sof Go.',
  'Routing, an ORM, validation, queues, events and cache, in one framework.':
    "Marshrutlash, ORM, validatsiya, navbatlar, hodisalar va kesh, barchasi bitta freymvorkda.",
  'Get started': 'Tezda boshlash',
  'Compare with Laravel': 'Laravel bilan solishtirish',
  'Start with the core.': 'Yadrodan boshlang.',
  'facades installed': "ta fasad o'rnatilgan",
  'Open source.': 'Ochiq manba.',
  'WeChat group': 'WeChat guruhi',
  'Support with WeChat': "WeChat orqali qo'llab-quvvatlash",
  'A Go framework with the structure of Laravel.': 'Laravel tuzilmasiga ega Go freymvorki.',
  Concepts: 'Tushunchalar',
  'Install steps': "O'rnatish bosqichlari",
  'WeChat group QR code': 'WeChat guruhi QR kodi',
  'WeChat reward QR code': "WeChat qo'llab-quvvatlash QR kodi",
  'GitHub stars': 'GitHub yulduzlari',
  contributors: "hissa qo'shuvchilar",
  forks: 'forklar',
  Documentation: 'Hujjatlar',
  Project: 'Loyiha',
  Community: 'Hamjamiyat',
  Installation: "O'rnatish",
  ORM: 'ORM',
  'Release Notes': 'Chiqarish eslatmalari',
  'Upgrading To v1.18': 'v1.18 ga yangilash',
  'Compare With Laravel': 'Laravel bilan solishtirish',
  'Contribution Guide': "Hissa qo'shish bo'yicha qo'llanma",
  'Privacy Policy': 'Maxfiylik siyosati',
  Contribute: "Hissa qo'shish"
}

const DICTS: Record<string, Dict> = { zh_CN, uz_UZ }

export function useI18n() {
  const { site, localeIndex } = useData()
  const route = useRoute()
  const { localeLinks, currentLang } = useLangs({ correspondingLink: true })
  const dict = computed(() => DICTS[localeIndex.value] ?? {})

  const tr = (en: string) => dict.value[en] ?? en

  // a docs path in the current language; links that leave the site pass through
  const link = (path: string) => (localeIndex.value === 'root' || !path.startsWith('/') ? path : `/${localeIndex.value}${path}`)

  // every language, each linking to this page in that language
  const languages = computed(() =>
    Object.values(site.value.locales).map(({ label }) => ({
      text: label!,
      link: localeLinks.value.find((l) => l.text === label)?.link ?? route.path,
      selected: label === currentLang.value.label
    }))
  )

  return { tr, link, languages, currentLang }
}
