import { icons as lucide } from '@iconify-json/lucide'
import { icons as simple } from '@iconify-json/simple-icons'
import { getIconData, iconToHTML, iconToSVG, type IconifyJSON } from '@iconify/utils'

/* Render an Iconify icon as an inline svg. A brand mark keeps its owner's colour. */
function icon(set: IconifyJSON, name: string, color?: string): string {
  const { attributes, body } = iconToSVG(getIconData(set, name)!)
  const style = color ? ` style="color:${color}"` : ''
  return iconToHTML(body, { ...attributes, class: 'g-menu-icon' }).replace('<svg', `<svg${style}`)
}

// the bar's GitHub mark, in the shell's grey rather than GitHub's black
export const GITHUB_SVG = iconToHTML(iconToSVG(getIconData(simple, 'github')!).body, { viewBox: '0 0 24 24', width: '17', height: '17', fill: 'currentColor' })

export const ICON_DISCORD = icon(simple, 'discord', '#5865F2')
export const ICON_X = icon(simple, 'x', '#000000')
export const ICON_YOUTUBE = icon(simple, 'youtube', '#FF0000')
export const ICON_BILIBILI = icon(simple, 'bilibili', '#00A1D6')
export const ICON_OPEN_COLLECTIVE = icon(simple, 'opencollective', '#7FADF2')
export const ICON_CONTRIBUTE = icon(lucide, 'git-pull-request')
export const ICON_TRANSLATE = icon(lucide, 'languages')

// DevChalk's mark is a painting, so it is an image rather than an icon
export const ICON_DEVCHALK = '<img class="g-menu-icon is-avatar" src="/devchalk-mark.png" alt="" width="20" height="20" />'

export const menuRow = (title: string, icon = '') =>
  `<span class="g-menu-row">${icon}<span class="g-menu-title">${title}</span></span>`
