/**
 * The Goravel mark as geometry.
 *
 * Every drawing on the homepage is the same object seen from the same angle: the lattice the mark
 * is built on, the five pieces cut out of it, and the path a request takes through it. Nothing here
 * is decorative; the coordinates come from public/logo.svg.
 *
 * P(0, 0, 3) is the top vertex. A 120 degree turn of the picture is exactly a turn of the object
 * about the line of sight: it maps (a, b, c) to (c, a, b), so the three faces trade places.
 */

export const U = 133 / 3 // horizontal step of one cell
export const V = 25.6 // vertical rise of one cell (30 degrees)
export const H = 51.2 // vertical edge of one cell

export type Cell = [number, number, number]
export type LayerKey = 'http' | 'app' | 'core' | 'data' | 'async'
export type PieceState = 'solid' | 'active' | 'ghost' | 'faint'

export function iso(a: number, b: number, c: number): [number, number] {
  return [133 + (a - b) * U, 154 + (a + b) * V - c * H]
}

/** A placed, scaled view of the lattice. */
export class Iso {
  constructor(public s: number, public ox: number, public oy: number) {}

  p(a: number, b: number, c: number): [number, number] {
    const [x, y] = iso(a, b, c)
    return [this.ox + x * this.s, this.oy + y * this.s]
  }

  path(pts: Cell[], close = true): string {
    const d = 'M' + pts.map((q) => this.p(...q)).map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')
    return close ? d + ' Z' : d
  }

  /** The mark's outline, scaled about its centre. Used to clip the lattice. */
  hexagon(factor: number): string {
    const [cx, cy] = this.p(1.5, 1.5, 1.5)
    const pts: Cell[] = [[0, 0, 3], [3, 0, 3], [3, 0, 0], [3, 3, 0], [0, 3, 0], [0, 3, 3]]
    return (
      'M' +
      pts
        .map(([a, b, c]) => {
          const [x, y] = iso(a, b, c)
          const sx = this.ox + x * this.s
          const sy = this.oy + y * this.s
          return `${(cx + (sx - cx) * factor).toFixed(1)} ${(cy + (sy - cy) * factor).toFixed(1)}`
        })
        .join(' L') +
      ' Z'
    )
  }
}

/** The five pieces of the mark, each one layer of the framework. */
export const PIECES: Record<LayerKey, Cell[]> = {
  http: [[0, 0, 3], [3, 0, 3], [3, 1, 3], [0, 1, 3]],
  app: [[0, 2, 3], [3, 2, 3], [3, 3, 3], [0, 3, 3]],
  data: [[3, 0, 3], [3, 0, 0], [3, 3, 0], [3, 3, 1], [3, 1, 1], [3, 1, 3]],
  async: [[0, 3, 3], [1, 3, 3], [1, 3, 1], [3, 3, 1], [3, 3, 0], [0, 3, 0]],
  core: [[3, 2, 3], [3, 2, 2], [3, 3, 2], [3, 3, 3]]
}

export const LAYER_ORDER: LayerKey[] = ['http', 'app', 'core', 'data', 'async']

export interface Layer {
  key: LayerKey
  name: string
  desc: string
  facades: string[]
  guides: string[]
}

export const LAYERS: Layer[] = [
  {
    key: 'http',
    name: 'HTTP',
    desc: 'Route, middleware, requests, responses, sessions, gRPC',
    facades: ['Route', 'Http', 'Session', 'Grpc', 'RateLimiter', 'View'],
    guides: ['Routing', 'Middleware', 'Controllers']
  },
  {
    key: 'app',
    name: 'Application',
    desc: 'Validation, authentication, authorization, hashing, AI',
    facades: ['Validation', 'Auth', 'Gate', 'Hash', 'Crypt', 'Lang', 'AI'],
    guides: ['Validation', 'Authentication', 'AI SDK']
  },
  {
    key: 'core',
    name: 'Core',
    desc: 'Container, configuration, Artisan, processes, logging, testing',
    facades: ['App', 'Artisan', 'Config', 'Process', 'Log', 'Testing'],
    guides: ['Service Container', 'Artisan Console', 'Processes']
  },
  {
    key: 'data',
    name: 'Data',
    desc: 'ORM, query builder, migrations, seeders, cache, storage',
    facades: ['Orm', 'DB', 'Schema', 'Seeder', 'Cache', 'Storage'],
    guides: ['ORM', 'Migrations', 'Cache']
  },
  {
    key: 'async',
    name: 'Async',
    desc: 'Queues, events, task scheduling, mail, telemetry',
    facades: ['Queue', 'Event', 'Schedule', 'Mail', 'Telemetry'],
    guides: ['Queues', 'Events', 'Task Scheduling']
  }
]

export const LAYER_NAME = Object.fromEntries(LAYERS.map((l) => [l.key, l.name])) as Record<LayerKey, string>
export const LAYER_OF: Record<string, LayerKey> = Object.fromEntries(
  LAYERS.flatMap((l) => l.facades.map((f) => [f, l.key]))
)
export const LITE = ['App', 'Artisan', 'Config', 'Process']

/** Where each facade is documented, so the list on the homepage goes somewhere. */
export const FACADE_LINK: Record<string, string> = {
  Route: '/the-basics/routing.html',
  Http: '/digging-deeper/http-client.html',
  Session: '/the-basics/session.html',
  Grpc: '/the-basics/grpc.html',
  RateLimiter: '/the-basics/routing.html#rate-limiting',
  View: '/the-basics/views.html',
  Validation: '/the-basics/validation.html',
  Auth: '/security/authentication.html',
  Gate: '/security/authorization.html',
  Hash: '/security/hashing.html',
  Crypt: '/security/encryption.html',
  Lang: '/digging-deeper/localization.html',
  AI: '/ai/sdk.html',
  App: '/architecture-concepts/service-container.html',
  Artisan: '/digging-deeper/artisan-console.html',
  Config: '/getting-started/configuration.html',
  Process: '/digging-deeper/processes.html',
  Log: '/the-basics/logging.html',
  Testing: '/testing/getting-started.html',
  Orm: '/orm/getting-started.html',
  DB: '/database/queries.html',
  Schema: '/database/migrations.html',
  Seeder: '/database/seeding.html',
  Cache: '/digging-deeper/cache.html',
  Storage: '/digging-deeper/filesystem.html',
  Queue: '/digging-deeper/queues.html',
  Event: '/digging-deeper/event.html',
  Schedule: '/digging-deeper/task-scheduling.html',
  Mail: '/digging-deeper/mail.html',
  Telemetry: '/digging-deeper/telemetry.html'
}

export const FACADE_INFO: Record<string, string> = {
  Route: 'Routes, groups and middleware',
  Http: 'HTTP client for outgoing requests',
  Session: 'Session data across requests',
  Grpc: 'gRPC servers and clients',
  RateLimiter: 'Named rate limiters',
  View: 'Templates rendered as responses',
  Validation: 'Validate requests and data',
  Auth: 'JWT and session guards',
  Gate: 'Authorization gates and policies',
  Hash: 'Password hashing',
  Crypt: 'Encryption and decryption',
  Lang: 'Localization',
  AI: 'Agents and conversations with AI providers',
  App: 'The service container',
  Artisan: 'Console commands',
  Config: 'Configuration values',
  Process: 'Run system processes',
  Log: 'Logging to channels',
  Testing: 'Test helpers, like Docker databases',
  Orm: 'Models, relationships and queries',
  DB: 'Query builder',
  Schema: 'Migrations',
  Seeder: 'Database seeders',
  Cache: 'Cache stores',
  Storage: 'File storage',
  Queue: 'Background jobs',
  Event: 'Events and listeners',
  Schedule: 'Task scheduling',
  Mail: 'Sending mail',
  Telemetry: 'Traces, metrics and logs'
}

// ------------------------------------------------------------------ faces
const FACE_OF: Record<LayerKey, 'top' | 'right' | 'left'> = {
  http: 'top',
  app: 'top',
  core: 'right',
  data: 'right',
  async: 'left'
}
const ROT_FACES = ['top', 'right', 'left'] as const
export const SHADE = { top: '#ffffff', right: '#f7f9fa', left: '#e5eaed' } as const

/** Which face a piece shows after k thirds of a turn. */
export function faceOf(key: LayerKey, k = 0): 'top' | 'right' | 'left' {
  return ROT_FACES[(ROT_FACES.indexOf(FACE_OF[key]) + k) % 3]
}

export const FACE_MATRIX = {
  top: [0.866, 0.5, -0.866, 0.5],
  right: [0.866, -0.5, 0, 1],
  left: [0.866, 0.5, 0, 1]
} as const

/** The transform that lays text flat on an isometric face. */
export function faceTransform(face: 'top' | 'right' | 'left', x: number, y: number): string {
  const [a, b, c, d] = FACE_MATRIX[face]
  return `matrix(${a} ${b} ${c} ${d} ${x.toFixed(1)} ${y.toFixed(1)})`
}

// ------------------------------------------------------------------ lattice
/** The triangular lattice the mark is cut from: verticals every U, diagonals every H. */
export function latticePath(g: Iso, x0: number, x1: number, y0: number, y1: number): string {
  const ux = U * g.s
  const hy = H * g.s
  const cx = g.ox + 133 * g.s
  const cy = g.oy + 154 * g.s
  const out: string[] = []

  let k = Math.floor((x0 - cx) / ux) - 1
  while (cx + k * ux <= x1) {
    const x = cx + k * ux
    if (x >= x0) out.push(`M${x.toFixed(1)} ${y0.toFixed(1)}V${y1.toFixed(1)}`)
    k += 1
  }

  const slope = V / U
  const reach = (x1 - x0) * slope
  for (const sign of [1, -1]) {
    let m = Math.floor((y0 - reach - cy) / hy) - 1
    while (cy + m * hy <= y1 + reach) {
      const base = cy + m * hy
      out.push(
        `M${x0.toFixed(1)} ${(base + sign * slope * (x0 - cx)).toFixed(1)}L${x1.toFixed(1)} ${(
          base +
          sign * slope * (x1 - cx)
        ).toFixed(1)}`
      )
      m += 1
    }
  }
  return out.join(' ')
}

// ------------------------------------------------------------------ the request
/**
 * Every segment runs along one lattice axis and lies in one plane of the mark: the top face
 * (c = 3), then the right face (a = 3), then the left face (b = 3).
 */
export function requestPath(g: Iso) {
  const p = (a: number, b: number, c: number) => g.p(a, b, c)
  return {
    entry: p(-1.2, 1.5, 3),
    channel: p(3, 1.5, 3),
    drop: p(3, 1.5, 2.5),
    core: p(3, 2.5, 2.5),
    data: p(3, 0.5, 2.5),
    exit: p(3, -1.2, 2.5),
    front: p(3, 3, 2.5),
    fall: p(3, 3, 1.5),
    async: p(0.5, 3, 1.5)
  }
}

/** A lattice cell, drawn as a rhombus. The only marker shape on the site. */
export function cellPath(x: number, y: number, r: number): string {
  const w = r * 0.866 * 2
  return `M${x.toFixed(1)} ${(y - r).toFixed(1)} L${(x + w / 2).toFixed(1)} ${y.toFixed(1)} L${x.toFixed(1)} ${(
    y + r
  ).toFixed(1)} L${(x - w / 2).toFixed(1)} ${y.toFixed(1)} Z`
}

export function polyline(points: [number, number][]): string {
  return 'M' + points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')
}

/** The point a given distance along a polyline: where the request has reached. */
export function pointAt(points: [number, number][], dist: number): [number, number] {
  if (!points.length) return [0, 0]
  let left = Math.max(0, dist)
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]
    const [x1, y1] = points[i]
    const seg = Math.hypot(x1 - x0, y1 - y0)
    if (left <= seg || i === points.length - 1) {
      const k = seg === 0 ? 0 : Math.min(1, left / seg)
      return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k]
    }
    left -= seg
  }
  return points[points.length - 1]
}

/** Length of a polyline, so a track can be drawn on with stroke-dashoffset. */
export function polylineLength(points: [number, number][]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1])
  }
  return total
}
