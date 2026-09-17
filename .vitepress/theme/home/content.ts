export type LayerKey = 'http' | 'app' | 'core' | 'data' | 'async'
export type PieceState = 'solid' | 'active' | 'ghost'
export type StopKey = 'route' | 'mw' | 'ctrl' | 'svc' | 'orm' | 'event' | 'resp'

export const FILES: Record<string, { name: string; lines: string[] }> = {
  web: {
    name: 'routes/web.go',
    lines: [
      'func Web() {',
      '\t[[facades.Route]]().[[Middleware]](middleware.Auth()).',
      '\t\t[[Group]](func(router route.Router) {',
      '\t\t\trouter.[[Get]]("/tasks", controllers.NewTaskController().Index)',
      '\t\t})',
      '}'
    ]
  },
  auth: {
    name: 'app/http/middleware/auth.go',
    lines: [
      'func (m *Auth) Handle(ctx http.Context) {',
      '\ttoken := ctx.[[Request]]().[[Header]]("Authorization", "")',
      '\tif _, err := [[facades.Auth]](ctx).[[Parse]](token); err != nil {',
      '\t\tctx.[[Request]]().[[Abort]](http.StatusUnauthorized)',
      '\t\treturn',
      '\t}',
      '\tctx.[[Request]]().[[Next]]()',
      '}'
    ]
  },
  controller: {
    name: 'app/http/controllers/task_controller.go',
    lines: [
      'func (r *TaskController) Index(ctx http.Context) http.Response {',
      '\ttasks, err := r.taskService.Open(ctx)',
      '\tif err != nil {',
      '\t\treturn ctx.[[Response]]().[[String]](http.StatusInternalServerError, err.Error())',
      '\t}',
      '\treturn ctx.[[Response]]().[[Success]]().[[Json]](tasks)',
      '}'
    ]
  },
  service: {
    name: 'app/services/task_service.go',
    lines: [
      'func (s *TaskService) Open(ctx context.Context) ([]models.Task, error) {',
      '\tvar tasks []models.Task',
      '\terr := [[facades.Orm]]().[[WithContext]](ctx).[[Query]]().[[Where]]("done", false).[[Get]](&tasks)',
      '\tif err != nil {',
      '\t\treturn nil, err',
      '\t}',
      '\t[[facades.Event]]().[[Job]](&events.TasksViewed{}, []event.Arg{}).[[Dispatch]]()',
      '\t[[facades.Queue]]().[[Job]](&jobs.SyncTasks{}, []queue.Arg{}).[[Dispatch]]()',
      '\treturn tasks, nil',
      '}'
    ]
  }
}

export interface Stop {
  key: StopKey
  name: string
  layer: LayerKey | null
  file: string
  lit: number[]
}

export const STOPS: Stop[] = [
  { key: 'route', name: 'Route', layer: 'http', file: 'web', lit: [2, 4] },
  { key: 'mw', name: 'Middleware', layer: 'app', file: 'auth', lit: [2, 3, 7] },
  { key: 'ctrl', name: 'Controller', layer: 'http', file: 'controller', lit: [1, 2] },
  { key: 'svc', name: 'Service', layer: null, file: 'service', lit: [1, 2] },
  { key: 'orm', name: 'ORM', layer: 'data', file: 'service', lit: [3] },
  { key: 'event', name: 'Event and Queue', layer: 'async', file: 'service', lit: [7, 8] },
  { key: 'resp', name: 'Response', layer: 'http', file: 'controller', lit: [6] }
]

export interface Concept {
  name: string
  layer: LayerKey
  phpFile: string
  goFile: string
  php: string
  go: string
  ties: [number, number][]
}

export const CONCEPTS: Concept[] = [
  {
    name: 'Routing', layer: 'http', phpFile: 'routes/web.php', goFile: 'routes/web.go',
    php: "Route::{{middleware}}('auth')->{{group}}(function () {\n    Route::{{get}}('/tasks', [TaskController::class, 'index']);\n});",
    go: '[[facades.Route]]().[[Middleware]](middleware.Auth()).\n\t[[Group]](func(router route.Router) {\n\t\trouter.[[Get]]("/tasks", taskController.Index)\n\t})',
    ties: [[1, 1], [1, 2], [2, 3]]
  },
  {
    name: 'ORM', layer: 'data', phpFile: 'app/Services/TaskService.php', goFile: 'app/services/task_service.go',
    php: "$tasks = Task::{{where}}('done', false)\n    ->{{orderByDesc}}('created_at')\n    ->{{limit}}(20)\n    ->{{get}}();",
    go: 'var tasks []models.Task\n[[facades.Orm]]().[[Query]]().\n\t[[Where]]("done", false).\n\t[[OrderByDesc]]("created_at").\n\t[[Limit]](20).\n\t[[Get]](&tasks)',
    ties: [[1, 3], [2, 4], [3, 5], [4, 6]]
  },
  {
    name: 'Validation', layer: 'app', phpFile: 'app/Http/Controllers/TaskController.php', goFile: 'app/http/controllers/task_controller.go',
    php: "$validated = $request->{{validate}}([\n    'title'  => 'required|max:255',\n    'due_at' => 'required|date',\n]);",
    go: 'validator, err := ctx.[[Request]]().[[Validate]](map[string]any{\n\t"title":  "required|max:255",\n\t"due_at": "required|date",\n})\nif validator.[[Fails]]() {\n\treturn ctx.[[Response]]().[[Status]](422).\n\t\t[[Json]](validator.Errors().All())\n}',
    ties: [[1, 1], [2, 2], [3, 3]]
  },
  {
    name: 'Queues', layer: 'async', phpFile: 'app/Services/TaskService.php', goFile: 'app/services/task_service.go',
    php: "SyncTasks::{{dispatch}}($task)\n    ->{{onQueue}}('sync');",
    go: '[[facades.Queue]]().\n\t[[Job]](&jobs.SyncTasks{}, []queue.Arg{\n\t\t{Type: "int", Value: task.ID},\n\t}).\n\t[[OnQueue]]("sync").\n\t[[Dispatch]]()',
    ties: [[1, 2], [2, 5]]
  },
  {
    name: 'Events', layer: 'async', phpFile: 'app/Services/TaskService.php', goFile: 'app/services/task_service.go',
    php: 'TasksViewed::{{dispatch}}($tasks);',
    go: '[[facades.Event]]().\n\t[[Job]](&events.TasksViewed{}, []event.Arg{\n\t\t{Type: "int", Value: len(tasks)},\n\t}).\n\t[[Dispatch]]()',
    ties: [[1, 2]]
  },
  {
    name: 'Scheduling', layer: 'async', phpFile: 'routes/console.php', goFile: 'bootstrap/app.go',
    php: "Schedule::{{command}}('emails:send')\n    ->{{daily}}();",
    go: '[[WithSchedule]](func() []schedule.Event {\n\treturn []schedule.Event{\n\t\t[[facades.Schedule]]().[[Command]]("emails:send").\n\t\t\t[[Daily]](),\n\t}\n})',
    ties: [[1, 3], [2, 4]]
  },
  {
    name: 'Cache', layer: 'data', phpFile: 'app/Services/TaskService.php', goFile: 'app/services/task_service.go',
    php: "$tasks = Cache::{{remember}}('tasks.open', 600, function () {\n    return Task::{{where}}('done', false)->{{get}}();\n});",
    go: '[[facades.Cache]]().[[Remember]]("tasks.open", 10*time.Minute,\n\tfunc() (any, error) {\n\t\tvar tasks []models.Task\n\t\terr := [[facades.Orm]]().[[Query]]().\n\t\t\t[[Where]]("done", false).[[Get]](&tasks)\n\t\treturn tasks, err\n\t})',
    ties: [[1, 1], [2, 4]]
  },
  {
    name: 'Testing', layer: 'core', phpFile: 'tests/Feature/TaskTest.php', goFile: 'tests/feature/task_test.go',
    php: "public function {{test_it_lists_open_tasks}}(): void\n{\n    $this->{{get}}('/tasks')\n        ->{{assertStatus}}(200);\n}",
    go: 'func (s *TaskTestSuite) [[TestIndex]]() {\n\tresponse, err := s.[[Http]](s.T()).[[Get]]("/tasks")\n\ts.[[Nil]](err)\n\tresponse.[[AssertStatus]](200)\n}',
    ties: [[1, 1], [3, 2], [4, 4]]
  },
  {
    name: 'Artisan', layer: 'core', phpFile: 'Terminal', goFile: 'Terminal',
    php: 'php artisan {{make:controller}} TaskController',
    go: './artisan [[make:controller]] TaskController',
    ties: [[1, 1]]
  }
]

export const LAYERS: { key: LayerKey; name: string; facades: string[] }[] = [
  { key: 'http', name: 'HTTP', facades: ['Route', 'Http', 'Session', 'Grpc', 'RateLimiter', 'View'] },
  { key: 'app', name: 'Application', facades: ['Validation', 'Auth', 'Gate', 'Hash', 'Crypt', 'Lang', 'AI'] },
  { key: 'core', name: 'Core', facades: ['App', 'Artisan', 'Config', 'Process', 'Log', 'Testing'] },
  { key: 'data', name: 'Data', facades: ['Orm', 'DB', 'Schema', 'Seeder', 'Cache', 'Storage'] },
  { key: 'async', name: 'Async', facades: ['Queue', 'Event', 'Schedule', 'Mail', 'Telemetry'] }
]

export const LITE = ['App', 'Artisan', 'Config', 'Process']

export const FACADES: Record<string, [link: string, summary: string]> = {
  Route: ['/the-basics/routing.html', 'Routes, groups and middleware'],
  Http: ['/digging-deeper/http-client.html', 'HTTP client for outgoing requests'],
  Session: ['/the-basics/session.html', 'Session data across requests'],
  Grpc: ['/the-basics/grpc.html', 'gRPC servers and clients'],
  RateLimiter: ['/the-basics/routing.html#rate-limiting', 'Named rate limiters'],
  View: ['/the-basics/views.html', 'Templates rendered as responses'],
  Validation: ['/the-basics/validation.html', 'Validate requests and data'],
  Auth: ['/security/authentication.html', 'JWT and session guards'],
  Gate: ['/security/authorization.html', 'Authorization gates and policies'],
  Hash: ['/security/hashing.html', 'Password hashing'],
  Crypt: ['/security/encryption.html', 'Encryption and decryption'],
  Lang: ['/digging-deeper/localization.html', 'Localization'],
  AI: ['/ai/sdk.html', 'Agents and conversations with AI providers'],
  App: ['/architecture-concepts/service-container.html', 'The service container'],
  Artisan: ['/digging-deeper/artisan-console.html', 'Console commands'],
  Config: ['/getting-started/configuration.html', 'Configuration values'],
  Process: ['/digging-deeper/processes.html', 'Run system processes'],
  Log: ['/the-basics/logging.html', 'Logging to channels'],
  Testing: ['/testing/getting-started.html', 'Test helpers, like Docker databases'],
  Orm: ['/orm/getting-started.html', 'Models, relationships and queries'],
  DB: ['/database/queries.html', 'Query builder'],
  Schema: ['/database/migrations.html', 'Migrations'],
  Seeder: ['/database/seeding.html', 'Database seeders'],
  Cache: ['/digging-deeper/cache.html', 'Cache stores'],
  Storage: ['/digging-deeper/filesystem.html', 'File storage'],
  Queue: ['/digging-deeper/queues.html', 'Background jobs'],
  Event: ['/digging-deeper/event.html', 'Events and listeners'],
  Schedule: ['/digging-deeper/task-scheduling.html', 'Task scheduling'],
  Mail: ['/digging-deeper/mail.html', 'Sending mail'],
  Telemetry: ['/digging-deeper/telemetry.html', 'Traces, metrics and logs']
}

export const LAYER_CODE: Record<LayerKey, string> = {
  http: '[[facades.Route]]().[[Middleware]](middleware.Auth()).\n\t[[Get]]("/tasks", taskController.Index)',
  app: 'validator, err := ctx.[[Request]]().[[Validate]](map[string]any{\n\t"title": "required|max:255",\n})',
  core: '[[facades.Config]]().[[GetString]]("app.name", "goravel")',
  data: '[[facades.Orm]]().[[Query]]().\n\t[[Where]]("done", false).\n\t[[Get]](&tasks)',
  async: '[[facades.Queue]]().\n\t[[Job]](&jobs.SyncTasks{}, []queue.Arg{}).\n\t[[Dispatch]]()'
}

export const LITE_STEPS = [
  { title: 'Create a Lite project', cmd: 'goravel new blog', add: [] as string[] },
  { title: 'Add routing', cmd: './artisan package:install Route', add: ['Route'] },
  { title: 'Add the ORM', cmd: './artisan package:install Orm', add: ['Orm'] },
  { title: 'Add queues', cmd: './artisan package:install Queue', add: ['Queue'] },
  { title: 'Add validation', cmd: './artisan package:install Validation', add: ['Validation'] },
  { title: 'Install everything', cmd: './artisan package:install --all', add: ['*'] }
]

export interface View {
  kind: 'journey' | 'parity' | 'map' | 'lite'
  states: Partial<Record<LayerKey, PieceState>>
  pulled?: LayerKey[]
  turn?: number
  stop?: StopKey
  caption?: string
}

// marks a call: [[Name]] in Go, {{name}} in PHP
export function tokenize(src: string, marker: 'go' | 'php' = 'go') {
  const re = marker === 'go' ? /(\[\[[^\]]+\]\])/ : /(\{\{[^}]+\}\})/
  return src.split('\n').map((line) =>
    line.split(re).filter(Boolean).map((part) => {
      const call = marker === 'go' ? part.startsWith('[[') : part.startsWith('{{')
      return { call, text: call ? part.slice(2, -2) : part }
    })
  )
}
