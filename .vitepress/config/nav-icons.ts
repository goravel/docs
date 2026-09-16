/**
 * Icons for the nav menu rows.
 *
 * Two kinds only: a brand mark where the destination has one people already recognise, and a
 * line drawn at the same weight as the rest of the shell where it does not. Both are 16px and
 * take their colour from the row, so they sit back in grey and follow the label to cyan.
 */
const wrap = (body: string, filled = false) =>
  `<svg class="g-menu-icon" viewBox="0 0 24 24" aria-hidden="true" ${
    filled ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"'
  }>${body}</svg>`

export const ICON_GITHUB = wrap(
  '<path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.7 1.2 3.4.9.1-.7.4-1.2.7-1.5-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/>',
  true
)

export const ICON_DISCORD = wrap(
  '<path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.3.5a14.9 14.9 0 0 0-6.2 0L8.6 3a19.8 19.8 0 0 0-4.9 1.4C.6 9 0 13.5.3 17.9a20 20 0 0 0 6 3l.7-1c-.6-.3-1.3-.6-1.9-1l.5-.4c3.9 1.8 8.1 1.8 12 0l.5.4c-.6.4-1.2.7-1.9 1l.8 1a20 20 0 0 0 6-3c.4-5.1-.7-9.6-3.7-13.5M8 15.1c-1.2 0-2.2-1.1-2.2-2.4 0-1.4 1-2.5 2.2-2.5s2.2 1.1 2.2 2.5c0 1.3-1 2.4-2.2 2.4m8 0c-1.2 0-2.2-1.1-2.2-2.4 0-1.4 1-2.5 2.2-2.5s2.2 1.1 2.2 2.5c0 1.3-1 2.4-2.2 2.4"/>',
  true
)

export const ICON_X = wrap(
  '<path d="M18.9 1.2h3.7l-8 9.1L24 22.8h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9Zm-1.3 19.4h2L6.5 3.3H4.3Z"/>',
  true
)

/** A pull request: the shape of sending a change. */
export const ICON_CONTRIBUTE = wrap(
  '<circle cx="6" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="M6 8.4v7.2M18 15.6V9.5A3 3 0 0 0 15 6.5h-3.6M13.4 4.2 11 6.5l2.4 2.3"/>'
)

/** The translate mark: one script becoming another. */
export const ICON_TRANSLATE = wrap(
  '<path d="M3 5.5h8.5M7.2 3.4v2.1M9.8 5.5c0 3.2-2.6 6.1-6.3 7.6M5.4 9.6c1 2 2.7 3.5 4.8 4.3M13.2 20.6l3.9-9.2 3.9 9.2M14.7 17.2h4.8"/>'
)

/** Support: the only place a heart belongs on this site. */
export const ICON_SUPPORT = wrap(
  '<path d="M12 20.1S4.6 15.6 4.6 10.6a4.2 4.2 0 0 1 7.4-2.7 4.2 4.2 0 0 1 7.4 2.7c0 5-7.4 9.5-7.4 9.5Z"/>'
)

/**
 * The video series and the written guides.
 *
 * These were two favicons fetched from youtube.com and devchalk.com every time the bar rendered:
 * a third party request from the navigation, a raster mark that cannot take the row's colour, and
 * a weight that did not match the icons beside it. They are drawn here instead. The play mark is
 * deliberately generic, because this row points at YouTube in English and Uzbek and at Bilibili in
 * Chinese, and a YouTube mark would be wrong on one of them.
 */
export const ICON_VIDEO = wrap(
  '<rect x="2.5" y="4.8" width="19" height="14.4" rx="3"/><path d="M10.2 9.2v5.6l4.8-2.8z"/>'
)

export const ICON_GUIDE = wrap(
  '<path d="M5 4.2h9.5L19 8.7v11.1H5z"/><path d="M14.2 4.2v4.6H19M8.2 12.4h7.6M8.2 16h5"/>'
)

/** One row of a nav menu: an icon, then what the destination is called. */
export function menuRow(title: string, icon = ''): string {
  return `<span class="g-menu-row">${icon}<span class="g-menu-title">${title}</span></span>`
}
