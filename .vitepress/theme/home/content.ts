/**
 * Everything the page says, in one place, so the stage can be driven from it.
 *
 * The page is a single scroll: one mark on a sticky stage, and a stream of blocks beside it.
 * Each block declares the state the mark should be in while it is the block in view.
 */
import type { LayerKey, PieceState } from './geometry'

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
  desc: string
}

export const STOPS: Stop[] = [
  { key: 'route', name: 'Route', layer: 'http', file: 'web', lit: [2, 4], desc: 'The router matches GET /tasks and runs the middleware on the group.' },
  { key: 'mw', name: 'Middleware', layer: 'app', file: 'auth', lit: [2, 3, 7], desc: 'The middleware reads the token. If it is not valid, the request stops with 401.' },
  { key: 'ctrl', name: 'Controller', layer: 'http', file: 'controller', lit: [1, 2], desc: 'The controller asks the service for the open tasks.' },
  { key: 'svc', name: 'Service', layer: null, file: 'service', lit: [1, 2], desc: 'Your own code. Plain Go, calling the facades it needs.' },
  { key: 'orm', name: 'ORM', layer: 'data', file: 'service', lit: [3], desc: 'The ORM builds the query and the Postgres driver runs it.' },
  { key: 'event', name: 'Event and Queue', layer: 'async', file: 'service', lit: [7, 8], desc: 'The service fires an event and pushes a job onto the queue.' },
  { key: 'resp', name: 'Response', layer: 'http', file: 'controller', lit: [6], desc: 'The tasks are returned as JSON. 200 OK.' }
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

/** How far each piece travels when it is pulled out of the mark, in lattice steps. */
export const MOVES: Record<LayerKey, [number, number, number]> = {
  http: [0, 0, 1.5],
  app: [0, 0, 0.75],
  core: [0, 0, 0],
  data: [0.9, 0, 0],
  async: [0, 0.9, 0]
}

/** Where a piece's leader starts, so the line runs along the axis it moved on. */
export const ANCHOR: Record<LayerKey, [number, number, number]> = {
  http: [2.4, 0.5, 3],
  app: [2.4, 2.5, 3],
  core: [3, 2.5, 2.5],
  data: [3, 0.5, 2.2],
  async: [0.5, 3, 2.2]
}

export const LAYER_CODE: Record<LayerKey, string> = {
  http: '[[facades.Route]]().[[Middleware]](middleware.Auth()).\n\t[[Get]]("/tasks", taskController.Index)',
  app: 'validator, err := ctx.[[Request]]().[[Validate]](map[string]any{\n\t"title": "required|max:255",\n})',
  core: '[[facades.Config]]().[[GetString]]("app.name", "goravel")',
  data: '[[facades.Orm]]().[[Query]]().\n\t[[Where]]("done", false).\n\t[[Get]](&tasks)',
  async: '[[facades.Queue]]().\n\t[[Job]](&jobs.SyncTasks{}, []queue.Arg{}).\n\t[[Dispatch]]()'
}

export const LITE_STEPS = [
  { title: 'Create a Lite project', cmd: 'goravel new blog', add: [] as string[], desc: 'Choose Goravel Lite in the installer. It includes App, Artisan, Config and Process.' },
  { title: 'Add routing', cmd: './artisan package:install Route', add: ['Route'], desc: 'The Route facade joins the HTTP layer, and the piece appears.' },
  { title: 'Add the ORM', cmd: './artisan package:install Orm', add: ['Orm'], desc: 'The Orm facade joins the Data layer.' },
  { title: 'Add queues', cmd: './artisan package:install Queue', add: ['Queue'], desc: 'The Queue facade joins the Async layer.' },
  { title: 'Add validation', cmd: './artisan package:install Validation', add: ['Validation'], desc: 'The Validation facade joins the Application layer. All five pieces are now in place.' },
  { title: 'Install everything', cmd: './artisan package:install --all', add: ['*'], desc: 'All 30 facades, the same set as a full Goravel project. The mark is whole.' }
]

export const ROLES: Record<LayerKey, string> = {
  http: 'route · middleware',
  app: 'validation · auth',
  core: 'container · config',
  data: 'orm · cache · storage',
  async: 'queue · events · mail'
}

/** What the mark is doing while a block is in view. */
export interface View {
  kind: 'hero' | 'journey' | 'parity' | 'map' | 'lite'
  states: Partial<Record<LayerKey, PieceState>>
  labels?: Partial<Record<LayerKey, string>>
  moves?: Partial<Record<LayerKey, [number, number, number]>>
  turn?: number
  stop?: StopKey
  /** How far the request has run, 0 to 1 of the whole route. Set while scrolling the journey. */
  progress?: number
  caption?: string
  meta?: string
}

/** `[[Name]]` in Go, `{{name}}` in PHP: the call is the one thing the eye should land on. */
export function tokenize(src: string, marker: 'go' | 'php' = 'go') {
  const re = marker === 'go' ? /(\[\[[^\]]+\]\])/ : /(\{\{[^}]+\}\})/
  return src.split('\n').map((line) =>
    line.split(re).filter(Boolean).map((part) => {
      const call = marker === 'go' ? part.startsWith('[[') : part.startsWith('{{')
      return { call, text: call ? part.slice(2, -2) : part }
    })
  )
}
