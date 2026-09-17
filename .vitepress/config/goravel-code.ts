import type { ThemeRegistration } from 'shiki'

const INK = '#101820'
const GREY = '#68747d'
const CYAN = '#0077b3'
const RED = '#b02b2b'

const rule = (scope: string[], foreground: string) => ({ scope, settings: { foreground } })

export const goravelCode: ThemeRegistration = {
  name: 'goravel',
  type: 'light',
  // transparent, so a callout's lighter ground shows through
  colors: { 'editor.background': '#00000000', 'editor.foreground': INK },
  tokenColors: [
    { settings: { foreground: INK } },
    rule(['comment', 'punctuation.definition.comment', 'string.comment'], GREY),
    rule(['keyword', 'storage', 'constant.language', 'variable.language'], INK),
    rule(['entity.name.function', 'support.function', 'entity.name.command'], CYAN),
    rule(['string', 'constant.numeric', 'constant.character'], GREY),
    rule(['punctuation', 'keyword.operator', 'meta.brace'], GREY),
    rule(['markup.inserted', 'meta.diff.header.to-file'], CYAN),
    rule(['markup.deleted', 'meta.diff.header.from-file'], RED),
    // narrower scopes that override the grey and cyan rules above
    rule(
      [
        'entity.name.type', 'entity.name.class', 'entity.name.package', 'entity.name.import.go',
        'support.type', 'support.class', 'storage.type.numeric.go', 'storage.type.string.go',
        'storage.type.boolean.go', 'storage.type.byte.go', 'storage.type.error.go',
        'variable', 'meta.definition.variable', 'punctuation.definition.variable.php',
        'string.unquoted.argument.shell', 'constant.other.option'
      ],
      INK
    )
  ]
}
