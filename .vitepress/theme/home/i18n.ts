import { computed } from 'vue'
import { useData } from 'vitepress'

type Dict = Record<string, string>

const zh_CN: Dict = {
  // tab labels: the stops, the concepts and the layers
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
  // hero
  'Familiar structure.': '熟悉的结构。',
  'Native Go.': '原生的 Go。',
  'Routing, an ORM, validation, queues, events and cache, in one framework.':
    '路由、ORM、验证、队列、事件与缓存，尽在一个框架之中。',
  'Get started': '快速开始',
  'Read the documentation': '阅读文档',

  // follow one request
  'Follow one request.': '跟随一个请求。',
  ', from the router to the response.': '，从路由到响应。',
  'Event and Queue': '事件与队列',

  // laravel comparison
  'Laravel’s structure, written in Go.': '用 Go 写就的 Laravel 结构。',
  'The same facades, the same method names, the same file layout.':
    '相同的门面，相同的方法名，相同的目录结构。',

  // layers
  'Five layers, thirty facades.': '五个层级，三十个门面。',
  'Every facade belongs to one piece of the mark. Choose a piece.':
    '每个门面都属于标志中的一块。选择一块。',

  // lite
  'Start with the core.': '从核心开始。',
  'Goravel Lite is four facades. Add the rest when you need them.':
    'Goravel 轻量版只有四个门面。其余的按需添加。',
  'facades installed': '个门面已安装',
  'Create a Lite project': '创建轻量版项目',
  'Add routing': '添加路由',
  'Add the ORM': '添加 ORM',
  'Add queues': '添加队列',
  'Add validation': '添加验证',
  'Install everything': '安装全部',

  // community
  'Open source.': '开源。',
  'MIT licensed. Built in the open.': 'MIT 许可。公开构建。',
  'WeChat group': '微信群',
  'Support with WeChat': '微信赞赏',

  // footer
  'A Go framework with the structure of Laravel.': '拥有 Laravel 结构的 Go 框架。',

  // accessible names
  'Request stops': '请求经过的环节',
  Concepts: '概念',
  Layers: '层级',
  'Install steps': '安装步骤',
  'WeChat group QR code': '微信群二维码',
  'WeChat reward QR code': '微信赞赏二维码',
  'Open Collective QR code': 'Open Collective 二维码'
}

const uz_UZ: Dict = {
  // tab labels: the stops, the concepts and the layers
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
  // hero
  'Familiar structure.': 'Tanish tuzilma.',
  'Native Go.': 'Sof Go.',
  'Routing, an ORM, validation, queues, events and cache, in one framework.':
    "Marshrutlash, ORM, validatsiya, navbatlar, hodisalar va kesh, barchasi bitta freymvorkda.",
  'Get started': 'Tezda boshlash',
  'Read the documentation': "Hujjatlarni o'qish",

  // follow one request
  'Follow one request.': "Bitta so'rovni kuzating.",
  ', from the router to the response.': ", marshrutizatordan javobgacha.",
  'Event and Queue': 'Hodisa va navbat',

  // laravel comparison
  'Laravel’s structure, written in Go.': 'Laravel tuzilmasi, Go tilida yozilgan.',
  'The same facades, the same method names, the same file layout.':
    "O'sha fasadlar, o'sha metod nomlari, o'sha fayl tuzilmasi.",

  // layers
  'Five layers, thirty facades.': "Beshta qatlam, o'ttizta fasad.",
  'Every facade belongs to one piece of the mark. Choose a piece.':
    "Har bir fasad belgining bitta bo'lagiga tegishli. Bo'lakni tanlang.",

  // lite
  'Start with the core.': 'Yadrodan boshlang.',
  'Goravel Lite is four facades. Add the rest when you need them.':
    "Goravel Lite to'rtta fasaddan iborat. Qolganlarini kerak bo'lganda qo'shing.",
  'facades installed': "ta fasad o'rnatilgan",
  'Create a Lite project': 'Lite loyiha yaratish',
  'Add routing': "Marshrutlashni qo'shish",
  'Add the ORM': "ORM qo'shish",
  'Add queues': "Navbatlarni qo'shish",
  'Add validation': "Validatsiyani qo'shish",
  'Install everything': "Hammasini o'rnatish",

  // community
  'Open source.': 'Ochiq manba.',
  'MIT licensed. Built in the open.': 'MIT litsenziyasi. Ochiq holda quriladi.',
  'WeChat group': 'WeChat guruhi',
  'Support with WeChat': "WeChat orqali qo'llab-quvvatlash",

  // footer
  'A Go framework with the structure of Laravel.': 'Laravel tuzilmasiga ega Go freymvorki.',

  // accessible names
  'Request stops': "So'rov bosqichlari",
  Concepts: 'Tushunchalar',
  Layers: 'Qatlamlar',
  'Install steps': "O'rnatish bosqichlari",
  'WeChat group QR code': 'WeChat guruhi QR kodi',
  'WeChat reward QR code': "WeChat qo'llab-quvvatlash QR kodi",
  'Open Collective QR code': 'Open Collective QR kodi'
}

const DICTS: Record<string, Dict> = { zh_CN, uz_UZ }

export function useHomeI18n() {
  const { localeIndex } = useData()
  const dict = computed(() => DICTS[localeIndex.value] ?? {})

  /* Translate an English source string; fall back to it when there is no translation. */
  const tr = (en: string) => dict.value[en] ?? en

  /* English sits at the root; every other language's pages live under its own prefix. */
  const link = (path: string) => (localeIndex.value === 'root' ? path : `/${localeIndex.value}${path}`)

  return { tr, link }
}
