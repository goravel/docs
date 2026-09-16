/**
 * Icons for the nav menu rows.
 *
 * Two kinds. A destination that belongs to somebody else gets that somebody's real mark in that
 * somebody's own colour, because a brand mark recoloured is no longer the mark people recognise:
 * this is the one place the site's palette gives way. A destination that belongs to Goravel gets
 * a line drawn at the shell's own weight, in the shell's grey, following the row's colour.
 *
 * Brand colours used, each the published primary of its owner:
 *   GitHub   #181717    Discord  #5865F2    X       #000000
 *   YouTube  #FF0000    Bilibili #00A1D6
 */
const brand = (body: string, color: string, viewBox = '0 0 24 24') =>
  `<svg class="g-menu-icon is-brand" viewBox="${viewBox}" style="color:${color}" fill="currentColor" aria-hidden="true">${body}</svg>`

const line = (body: string) =>
  `<svg class="g-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`

export const ICON_GITHUB = brand(
  '<path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.7 1.2 3.4.9.1-.7.4-1.2.7-1.5-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/>',
  '#181717'
)

export const ICON_DISCORD = brand(
  '<path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.3.5a14.9 14.9 0 0 0-6.2 0L8.6 3a19.8 19.8 0 0 0-4.9 1.4C.6 9 0 13.5.3 17.9a20 20 0 0 0 6 3l.7-1c-.6-.3-1.3-.6-1.9-1l.5-.4c3.9 1.8 8.1 1.8 12 0l.5.4c-.6.4-1.2.7-1.9 1l.8 1a20 20 0 0 0 6-3c.4-5.1-.7-9.6-3.7-13.5M8 15.1c-1.2 0-2.2-1.1-2.2-2.4 0-1.4 1-2.5 2.2-2.5s2.2 1.1 2.2 2.5c0 1.3-1 2.4-2.2 2.4m8 0c-1.2 0-2.2-1.1-2.2-2.4 0-1.4 1-2.5 2.2-2.5s2.2 1.1 2.2 2.5c0 1.3-1 2.4-2.2 2.4"/>',
  '#5865F2'
)

export const ICON_X = brand(
  '<path d="M18.9 1.2h3.7l-8 9.1L24 22.8h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9Zm-1.3 19.4h2L6.5 3.3H4.3Z"/>',
  '#000000'
)

/** The English and Uzbek video series live on YouTube. */
export const ICON_YOUTUBE = brand(
  '<path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8M9.6 15.6V8.4l6.3 3.6z"/>',
  '#FF0000'
)

/** The Chinese series lives on Bilibili, so that row carries Bilibili's mark, not YouTube's. */
export const ICON_BILIBILI = brand(
  '<path d="M18.2 3.2a1.4 1.4 0 0 1 0 2l-1.8 1.8h1.3A4.3 4.3 0 0 1 22 11.3v6.1a4.3 4.3 0 0 1-4.3 4.3H6.3A4.3 4.3 0 0 1 2 17.4v-6.1A4.3 4.3 0 0 1 6.3 7h1.3L5.8 5.2a1.4 1.4 0 0 1 2-2L10.5 7h3L16.2 3.2a1.4 1.4 0 0 1 2 0M6.3 9.7a1.6 1.6 0 0 0-1.6 1.6v6.1a1.6 1.6 0 0 0 1.6 1.6h11.4a1.6 1.6 0 0 0 1.6-1.6v-6.1a1.6 1.6 0 0 0-1.6-1.6zm2 2.4a1.3 1.3 0 0 1 1.3 1.3v1.3a1.3 1.3 0 1 1-2.6 0v-1.3a1.3 1.3 0 0 1 1.3-1.3m7.4 0a1.3 1.3 0 0 1 1.3 1.3v1.3a1.3 1.3 0 1 1-2.6 0v-1.3a1.3 1.3 0 0 1 1.3-1.3"/>',
  '#00A1D6'
)

/**
 * DevChalk's mark is a painted illustration rather than a flat logo, so it is set as a small
 * rounded avatar. Recolouring it is not possible and shrinking it to icon size turns it to mush.
 */
export const ICON_DEVCHALK =
  '<img class="g-menu-icon is-avatar" src="/devchalk-mark.png" alt="" width="20" height="20" aria-hidden="true" />'

/** A pull request: the shape of sending a change. */
export const ICON_CONTRIBUTE = line(
  '<circle cx="6" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="M6 8.4v7.2M18 15.6V9.5A3 3 0 0 0 15 6.5h-3.6M13.4 4.2 11 6.5l2.4 2.3"/>'
)

/** The translate mark: one script becoming another. */
export const ICON_TRANSLATE = line(
  '<path d="M3 5.5h8.5M7.2 3.4v2.1M9.8 5.5c0 3.2-2.6 6.1-6.3 7.6M5.4 9.6c1 2 2.7 3.5 4.8 4.3M13.2 20.6l3.9-9.2 3.9 9.2M14.7 17.2h4.8"/>'
)

/** Support: the only place a heart belongs on this site. */
export const ICON_SUPPORT = line(
  '<path d="M12 20.1S4.6 15.6 4.6 10.6a4.2 4.2 0 0 1 7.4-2.7 4.2 4.2 0 0 1 7.4 2.7c0 5-7.4 9.5-7.4 9.5Z"/>'
)

/** One row of a nav menu: a mark, then what the destination is called. */
export function menuRow(title: string, icon = ''): string {
  return `<span class="g-menu-row">${icon}<span class="g-menu-title">${title}</span></span>`
}
