import type { ThemeOptions } from 'vitepress'

interface Palette {
  ink: string
  grey: string
  cyan: string
  red: string
}

// These palettes mirror the light and dark values of the theme tokens in
// .vitepress/theme/goravel.css: ink -> --g-ink, grey -> --g-grey,
// cyan -> --g-cyan-text, red -> --g-red-text. Keep them in step.
const LIGHT: Palette = { ink: '#101820', grey: '#636f78', cyan: '#0074ae', red: '#b02b2b' }
const DARK: Palette = { ink: '#e6edf2', grey: '#8a99a5', cyan: '#5cc4f7', red: '#f59393' }

const rule = (scope: string[], foreground: string) => ({ scope, settings: { foreground } })

const theme = (type: 'light' | 'dark', { ink, grey, cyan, red }: Palette) => ({
  name: `goravel-${type}`,
  type,
  // transparent, so a callout's lighter ground shows through
  colors: { 'editor.background': '#00000000', 'editor.foreground': ink },
  tokenColors: [
    { settings: { foreground: ink } },
    rule(['comment', 'punctuation.definition.comment', 'string.comment'], grey),
    rule(['keyword', 'storage', 'constant.language', 'variable.language'], ink),
    rule(['entity.name.function', 'support.function', 'entity.name.command'], cyan),
    rule(['string', 'constant.numeric', 'constant.character'], grey),
    rule(['punctuation', 'keyword.operator', 'meta.brace'], grey),
    rule(['markup.inserted', 'meta.diff.header.to-file'], cyan),
    rule(['markup.deleted', 'meta.diff.header.from-file'], red),
    // narrower scopes that override the grey and cyan rules above
    rule(
      [
        'entity.name.type', 'entity.name.class', 'entity.name.package', 'entity.name.import.go',
        'support.type', 'support.class', 'storage.type.numeric.go', 'storage.type.string.go',
        'storage.type.boolean.go', 'storage.type.byte.go', 'storage.type.error.go',
        'variable', 'meta.definition.variable', 'punctuation.definition.variable.php',
        'string.unquoted.argument.shell', 'constant.other.option', 'entity.name.tag.yaml'
      ],
      ink
    )
  ]
})

export const goravelCode: ThemeOptions = { light: theme('light', LIGHT), dark: theme('dark', DARK) }
