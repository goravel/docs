import { LINKS } from '../../links'

export type PieceKey = 'http' | 'app' | 'core' | 'data' | 'async'
export type PieceState = 'solid' | 'dim' | 'ghost'

interface Concept {
  name: string
  phpFile: string
  goFile: string
  php: string
  go: string
  ties: [number, number][]
}

interface Capability {
  title: string
  says: string
  code: string
  lit?: number[]
  facade?: string
}

interface LiteStep {
  cmd: string
  pick?: string
  add: string[]
}

export const HERO = {
  title: ['Familiar structure.', 'Native Go.'],
  lead: 'Routing, an ORM, validation, queues, events and cache, in one framework.',
  cta: { text: 'Get started', link: '/getting-started/installation.html' },
  install: 'go install github.com/goravel/installer/goravel@latest'
}

const CONCEPTS: Concept[] = [
  {
    name: 'Routing', phpFile: 'routes/web.php', goFile: 'routes/web.go',
    php: "Route::{{middleware}}('auth')->{{group}}(function () {\n    Route::{{get}}('/tasks', [TaskController::class, 'index']);\n});",
    go: '[[facades.Route]]().[[Middleware]](middleware.Auth()).\n\t[[Group]](func(router route.Router) {\n\t\trouter.[[Get]]("/tasks", taskController.Index)\n\t})',
    ties: [[1, 1], [1, 2], [2, 3]]
  },
  {
    name: 'ORM', phpFile: 'app/Services/TaskService.php', goFile: 'app/services/task_service.go',
    php: "$tasks = Task::{{where}}('done', false)\n    ->{{orderByDesc}}('created_at')\n    ->{{limit}}(20)\n    ->{{get}}();",
    go: 'var tasks []models.Task\n[[facades.Orm]]().[[Query]]().\n\t[[Where]]("done", false).\n\t[[OrderByDesc]]("created_at").\n\t[[Limit]](20).\n\t[[Get]](&tasks)',
    ties: [[1, 3], [2, 4], [3, 5], [4, 6]]
  },
  {
    name: 'Validation', phpFile: 'app/Http/Controllers/TaskController.php', goFile: 'app/http/controllers/task_controller.go',
    php: "$validated = $request->{{validate}}([\n    'title'  => 'required|max:255',\n    'due_at' => 'required|date',\n]);",
    go: 'validator, err := ctx.[[Request]]().[[Validate]](map[string]any{\n\t"title":  "required|max:255",\n\t"due_at": "required|date",\n})\nif validator.[[Fails]]() {\n\treturn ctx.[[Response]]().[[Status]](422).\n\t\t[[Json]](validator.Errors().All())\n}',
    ties: [[1, 1], [2, 2], [3, 3]]
  },
  {
    name: 'Queues', phpFile: 'app/Services/TaskService.php', goFile: 'app/services/task_service.go',
    php: "SyncTasks::{{dispatch}}($task)\n    ->{{onQueue}}('sync');",
    go: '[[facades.Queue]]().\n\t[[Job]](&jobs.SyncTasks{}, []queue.Arg{\n\t\t{Type: "int", Value: task.ID},\n\t}).\n\t[[OnQueue]]("sync").\n\t[[Dispatch]]()',
    ties: [[1, 2], [2, 5]]
  },
  {
    name: 'Events', phpFile: 'app/Services/TaskService.php', goFile: 'app/services/task_service.go',
    php: 'TasksViewed::{{dispatch}}($tasks);',
    go: '[[facades.Event]]().\n\t[[Job]](&events.TasksViewed{}, []event.Arg{\n\t\t{Type: "int", Value: len(tasks)},\n\t}).\n\t[[Dispatch]]()',
    ties: [[1, 2]]
  },
  {
    name: 'Scheduling', phpFile: 'routes/console.php', goFile: 'bootstrap/app.go',
    php: "Schedule::{{command}}('emails:send')\n    ->{{daily}}();",
    go: '[[WithSchedule]](func() []schedule.Event {\n\treturn []schedule.Event{\n\t\t[[facades.Schedule]]().[[Command]]("emails:send").\n\t\t\t[[Daily]](),\n\t}\n})',
    ties: [[1, 3], [2, 4]]
  },
  {
    name: 'Cache', phpFile: 'app/Services/TaskService.php', goFile: 'app/services/task_service.go',
    php: "$tasks = Cache::{{remember}}('tasks.open', 600, function () {\n    return Task::{{where}}('done', false)->{{get}}();\n});",
    go: '[[facades.Cache]]().[[Remember]]("tasks.open", 10*time.Minute,\n\tfunc() (any, error) {\n\t\tvar tasks []models.Task\n\t\terr := [[facades.Orm]]().[[Query]]().\n\t\t\t[[Where]]("done", false).[[Get]](&tasks)\n\t\treturn tasks, err\n\t})',
    ties: [[1, 1], [2, 4]]
  },
  {
    name: 'Testing', phpFile: 'tests/Feature/TaskTest.php', goFile: 'tests/feature/task_test.go',
    php: "public function {{test_it_lists_open_tasks}}(): void\n{\n    $this->{{get}}('/tasks')\n        ->{{assertStatus}}(200);\n}",
    go: 'func (s *TaskTestSuite) [[TestIndex]]() {\n\tresponse, err := s.[[Http]](s.T()).[[Get]]("/tasks")\n\ts.[[Nil]](err)\n\tresponse.[[AssertStatus]](200)\n}',
    ties: [[1, 1], [3, 2], [4, 4]]
  },
  {
    name: 'Artisan', phpFile: 'Terminal', goFile: 'Terminal',
    php: 'php artisan {{make:controller}} TaskController',
    go: 'go run . artisan [[make:controller]] TaskController',
    ties: [[1, 1]]
  }
]

export const LARAVEL = {
  title: 'Laravel, line for line.',
  checks: ['Familiar facades, familiar method names', 'The same file layout, artisan included'],
  compare: { text: 'Compare with Laravel', link: '/prologue/compare-with-laravel.html' },
  concepts: CONCEPTS
}

export const FACADES: Record<string, [link: string, summary: string]> = {
  AI: ['/ai/sdk.html', 'Agents and conversations with AI providers'],
  App: ['/architecture-concepts/service-container.html', 'The service container'],
  Artisan: ['/digging-deeper/artisan-console.html', 'Console commands'],
  Auth: ['/security/authentication.html', 'JWT and session guards'],
  Cache: ['/digging-deeper/cache.html', 'Cache stores'],
  Config: ['/getting-started/configuration.html', 'Configuration values'],
  Crypt: ['/security/encryption.html', 'Encryption and decryption'],
  DB: ['/database/queries.html', 'Query builder'],
  Event: ['/digging-deeper/event.html', 'Events and listeners'],
  Gate: ['/security/authorization.html', 'Authorization gates and policies'],
  Grpc: ['/the-basics/grpc.html', 'gRPC servers and clients'],
  Hash: ['/security/hashing.html', 'Password hashing'],
  Http: ['/digging-deeper/http-client.html', 'HTTP client for outgoing requests'],
  Lang: ['/digging-deeper/localization.html', 'Localization'],
  Log: ['/the-basics/logging.html', 'Logging to channels'],
  Mail: ['/digging-deeper/mail.html', 'Sending mail'],
  Orm: ['/orm/getting-started.html', 'Models, relationships and queries'],
  Process: ['/digging-deeper/processes.html', 'Run system processes'],
  Queue: ['/digging-deeper/queues.html', 'Background jobs'],
  RateLimiter: ['/the-basics/routing.html#rate-limiting', 'Named rate limiters'],
  Route: ['/the-basics/routing.html', 'Routes, groups and middleware'],
  Schedule: ['/digging-deeper/task-scheduling.html', 'Task scheduling'],
  Schema: ['/database/migrations.html', 'Migrations'],
  Seeder: ['/database/seeding.html', 'Database seeders'],
  Session: ['/the-basics/session.html', 'Session data across requests'],
  Storage: ['/digging-deeper/filesystem.html', 'File storage'],
  Telemetry: ['/digging-deeper/telemetry.html', 'Traces, metrics and logs'],
  Testing: ['/testing/getting-started.html', 'Test helpers, like Docker databases'],
  Validation: ['/the-basics/validation.html', 'Validate requests and data'],
  View: ['/the-basics/views.html', 'Templates rendered as responses']
}

export const FACADES_TITLE = 'facades. One framework.'

export const FRESH = ['AI', 'Telemetry']

export const CAPABILITIES: Capability[] = [
  {
    title: 'One process',
    says: 'HTTP, gRPC, queue, scheduler and telemetry start together.',
    code: '// config/app.go\n"disabled_runners": []string{\n\t[["goravel:schedule"]],\n},'
  },
  {
    title: 'Gin or Fiber',
    says: 'Runs on gin. Install fiber, change one line.',
    lit: [4],
    code: '// config/http.go\n  [[config.Add]]("http", map[string]any{\n-   "default": "gin",\n+   "default": [["fiber"]],'
  },
  {
    title: 'Real databases in tests',
    says: 'Postgres or Redis in Docker, from inside a test.',
    code: 'database, err := [[facades.Testing]]().\n\t[[Docker]]().[[Database]]("postgres")\ncache, err := [[facades.Testing]]().\n\t[[Docker]]().[[Cache]]("redis")'
  },
  {
    title: 'AI SDK',
    says: 'Agents and tools for OpenAI, Anthropic and Gemini.',
    facade: 'AI',
    code: 'conversation, err := [[facades.AI]]().\n\t[[Agent]](&agents.SupportAgent{})\nif err != nil {\n\treturn err\n}'
  },
  {
    title: 'Telemetry',
    says: 'OpenTelemetry traces, metrics and logs.',
    facade: 'Telemetry',
    code: '# .env\nOTEL_TRACES_EXPORTER=[[otlptrace]]\nOTEL_METRICS_EXPORTER=[[otlpmetric]]\nOTEL_LOGS_EXPORTER=[[otlplog]]'
  },
  {
    title: 'One binary',
    says: 'Upload the binary and your .env. No runtime to install.',
    code: '$ go run . artisan [[build]] --static\n# upload\n.env\n./goravel'
  }
]

export const PIECES: { key: PieceKey; facades: string[] }[] = [
  { key: 'http', facades: ['Route', 'Http', 'Session', 'Grpc', 'RateLimiter', 'View'] },
  { key: 'app', facades: ['Validation', 'Auth', 'Gate', 'Hash', 'Crypt', 'Lang', 'AI'] },
  { key: 'core', facades: ['App', 'Artisan', 'Config', 'Process', 'Log', 'Testing'] },
  { key: 'data', facades: ['Orm', 'DB', 'Schema', 'Seeder', 'Cache', 'Storage'] },
  { key: 'async', facades: ['Queue', 'Event', 'Schedule', 'Mail', 'Telemetry'] }
]

export const LITE: { title: string; lead: string; base: string[]; steps: LiteStep[] } = {
  title: 'Start with the core.',
  lead: 'Goravel Lite ships only the essentials. Add the rest when you need them.',
  base: ['App', 'Artisan', 'Config', 'Process'],
  steps: [
    { cmd: 'goravel new blog', pick: 'Goravel Lite - Only includes essential facades', add: [] },
    { cmd: 'go run . artisan package:install Route', add: ['Route'] },
    { cmd: 'go run . artisan package:install Orm', add: ['Orm'] },
    { cmd: 'go run . artisan package:install Queue', add: ['Queue'] },
    { cmd: 'go run . artisan package:install Validation', add: ['Validation'] },
    { cmd: 'go run . artisan package:install --all', add: ['*'] }
  ]
}

interface Join {
  title: string
  link: string
  says: string
  wechat?: { label: string; src: string; alt: string }
}

export const OPEN_SOURCE: { title: string; joins: Join[] } = {
  title: 'Open source.',
  joins: [
    { title: 'Star on GitHub', link: LINKS.github, says: 'MIT licensed' },
    {
      title: 'Join Discord',
      link: LINKS.discord,
      says: 'Questions and discussion',
      wechat: { label: 'WeChat group', src: '/wechat.jpg', alt: 'WeChat group QR code' }
    },
    { title: 'Contribute', link: '/prologue/contributions.html', says: 'Features earn a T‑shirt' },
    {
      title: 'Sponsor',
      link: LINKS.openCollective,
      says: 'Open Collective',
      wechat: { label: 'Support with WeChat', src: '/reward-wechat.jpg', alt: 'WeChat reward QR code' }
    }
  ]
}

export const CORE_TEAM = ['hwbrzzl', 'krishankumar01', 'DevHaoZi', 'almas-x']

export const CONTRIBUTORS = [
  'hwbrzzl', 'krishankumar01', 'DevHaoZi', 'almas-x', 'merouanekhalili', 'hongyukeji', 'sidshrivastav',
  'Juneezee', 'dragoonchang', 'dhanusaputra', 'mauri870', 'Marian0', 'ahmed3mar', 'flc1125',
  'zzpwestlife', 'juantarrel', 'Kamandlou', 'livghit', 'jeff87218', 'shayan-yousefi', 'zxdstyle',
  'milwad-dev', 'mdanialr', 'KlassnayaAfrodita', 'YlanzinhoY', 'gouguoyin', 'dzham', 'praem90',
  'vendion', 'tzsk', 'ycb1986', 'BadJacky', 'NiteshSingh17', 'alfanzain', 'oprudkyi', 'zoryamba',
  'oguzhankrcb', 'ChisThanh', 'wyicwx', 'LinboLen', 'president-tuychiyev', 'eddyjj92',
  'codedsultan'
]

export const FOOTER = [
  {
    title: 'Documentation',
    items: [
      ['Installation', '/getting-started/installation.html'],
      ['Routing', '/the-basics/routing.html'],
      ['ORM', '/orm/getting-started.html'],
      ['Queues', '/digging-deeper/queues.html'],
      ['Testing', '/testing/getting-started.html']
    ]
  },
  {
    title: 'Project',
    items: [
      ['Release Notes', '/prologue/releases.html'],
      ['Upgrading To v1.18', '/upgrade/v1.18.html'],
      ['Compare With Laravel', '/prologue/compare-with-laravel.html'],
      ['Contribution Guide', '/prologue/contributions.html'],
      ['Privacy Policy', '/prologue/privacy.html']
    ]
  }
]
