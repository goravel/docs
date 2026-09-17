/* The Goravel mark as geometry. */

export const U = 133 / 3 // horizontal step of one cell
export const V = 25.6 // vertical rise of one cell (30 degrees)
export const H = 51.2 // vertical edge of one cell

export type Cell = [number, number, number]
export type LayerKey = 'http' | 'app' | 'core' | 'data' | 'async'
export type PieceState = 'solid' | 'active' | 'ghost'

export function iso(a: number, b: number, c: number): [number, number] {
  return [133 + (a - b) * U, 154 + (a + b) * V - c * H]
}

/* A placed, scaled view of the lattice. */
export class Iso {
  constructor(public s: number, public ox: number, public oy: number) {}

  p(a: number, b: number, c: number): [number, number] {
    const [x, y] = iso(a, b, c)
    return [this.ox + x * this.s, this.oy + y * this.s]
  }

  path(pts: Cell[]): string {
    return polyline(pts.map((q) => this.p(...q))) + ' Z'
  }

  hexagon(factor: number): string {
    const [cx, cy] = this.p(1.5, 1.5, 1.5)
    const pts: Cell[] = [[0, 0, 3], [3, 0, 3], [3, 0, 0], [3, 3, 0], [0, 3, 0], [0, 3, 3]]
    const out = pts.map((q) => this.p(...q)).map(([x, y]) => `${(cx + (x - cx) * factor).toFixed(1)} ${(cy + (y - cy) * factor).toFixed(1)}`)
    return 'M' + out.join(' L') + ' Z'
  }
}

/* The five pieces of the mark, each one layer of the framework. */
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
  facades: string[]
}

export const LAYERS: Layer[] = [
  {
    key: 'http',
    name: 'HTTP',
    facades: ['Route', 'Http', 'Session', 'Grpc', 'RateLimiter', 'View']
  },
  {
    key: 'app',
    name: 'Application',
    facades: ['Validation', 'Auth', 'Gate', 'Hash', 'Crypt', 'Lang', 'AI']
  },
  {
    key: 'core',
    name: 'Core',
    facades: ['App', 'Artisan', 'Config', 'Process', 'Log', 'Testing']
  },
  {
    key: 'data',
    name: 'Data',
    facades: ['Orm', 'DB', 'Schema', 'Seeder', 'Cache', 'Storage']
  },
  {
    key: 'async',
    name: 'Async',
    facades: ['Queue', 'Event', 'Schedule', 'Mail', 'Telemetry']
  }
]

export const LITE = ['App', 'Artisan', 'Config', 'Process']

/* Where each facade is documented, so the list on the homepage goes somewhere. */
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

/* Which face a piece shows after k thirds of a turn. */
export function faceOf(key: LayerKey, k = 0): 'top' | 'right' | 'left' {
  return ROT_FACES[(ROT_FACES.indexOf(FACE_OF[key]) + k) % 3]
}

// ------------------------------------------------------------------ lattice
/* The triangular lattice the mark is cut from: verticals every U, diagonals every H. */
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

/* A lattice cell, drawn as a rhombus. The only marker shape on the site. */
export function cellPath(x: number, y: number, r: number): string {
  const w = r * 0.866 * 2
  return `M${x.toFixed(1)} ${(y - r).toFixed(1)} L${(x + w / 2).toFixed(1)} ${y.toFixed(1)} L${x.toFixed(1)} ${(
    y + r
  ).toFixed(1)} L${(x - w / 2).toFixed(1)} ${y.toFixed(1)} Z`
}

export function polyline(points: [number, number][]): string {
  return 'M' + points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')
}

/* Length of a polyline, so a track can be drawn on with stroke-dashoffset. */
export function polylineLength(points: [number, number][]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1])
  }
  return total
}
