import type { ThemeRegistration } from 'shiki'

/*
 * Goravel syntax themes, drawn only from the logo's blues and the neutral
 * greys: keywords in Goravel blue, strings in the logo's light (dark theme) or
 * deep (light theme) face, and framework calls in bold ink so APIs stand out.
 */

interface Palette {
  fg: string
  bg: string
  keyword: string
  type: string
  string: string
  comment: string
  call: string
  punctuation: string
  variable: string
  inserted: string
  deleted: string
}

function theme(name: string, type: 'light' | 'dark', p: Palette): ThemeRegistration {
  return {
    name,
    type,
    colors: {
      'editor.background': p.bg,
      'editor.foreground': p.fg
    },
    tokenColors: [
      { settings: { foreground: p.fg } },
      {
        scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
        settings: { foreground: p.comment, fontStyle: 'italic' }
      },
      {
        scope: [
          'keyword',
          'storage',
          'storage.type',
          'storage.modifier',
          'keyword.control',
          'keyword.function',
          'keyword.package',
          'keyword.import',
          'keyword.type',
          'keyword.struct',
          'keyword.interface',
          'keyword.map',
          'keyword.var',
          'keyword.const',
          'constant.language',
          'variable.language'
        ],
        settings: { foreground: p.keyword }
      },
      {
        scope: [
          'entity.name.type',
          'support.type',
          'support.class',
          'entity.name.class',
          'storage.type.numeric.go',
          'storage.type.string.go',
          'storage.type.boolean.go',
          'storage.type.byte.go',
          'storage.type.error.go',
          'entity.name.package',
          'entity.name.import.go'
        ],
        settings: { foreground: p.type }
      },
      {
        scope: ['string', 'string.quoted', 'constant.numeric', 'constant.character', 'string.template'],
        settings: { foreground: p.string }
      },
      {
        scope: [
          'entity.name.function',
          'support.function',
          'meta.function-call entity.name.function',
          'support.function.builtin',
          'entity.name.command'
        ],
        settings: { foreground: p.call, fontStyle: 'bold' }
      },
      {
        scope: ['punctuation', 'keyword.operator', 'meta.brace', 'punctuation.separator', 'punctuation.terminator'],
        settings: { foreground: p.punctuation }
      },
      {
        scope: ['variable', 'variable.other', 'variable.parameter', 'meta.definition.variable'],
        settings: { foreground: p.variable }
      },
      {
        scope: ['variable.other.php', 'punctuation.definition.variable.php'],
        settings: { foreground: p.type }
      },
      {
        scope: ['markup.inserted', 'meta.diff.header.to-file'],
        settings: { foreground: p.inserted }
      },
      {
        scope: ['markup.deleted', 'meta.diff.header.from-file'],
        settings: { foreground: p.deleted }
      },
      {
        scope: ['string.unquoted.argument.shell', 'constant.other.option'],
        settings: { foreground: p.fg }
      }
    ]
  }
}

export const goravelLight = theme('goravel-light', 'light', {
  fg: '#101820',
  bg: '#f7f9fa',
  keyword: '#101820',
  type: '#101820',
  string: '#68747d',
  comment: '#68747d',
  call: '#0077b3',
  punctuation: '#68747d',
  variable: '#101820',
  inserted: '#0077b3',
  deleted: '#68747d'
})

export const goravelDark = theme('goravel-dark', 'dark', {
  fg: '#d5dee5',
  bg: '#12191f',
  keyword: '#009fe8',
  type: '#d5dee5',
  string: '#86d3fd',
  comment: '#6f7f8c',
  call: '#ffffff',
  punctuation: '#8c9ba7',
  variable: '#d5dee5',
  inserted: '#4cc38a',
  deleted: '#f0766e'
})
