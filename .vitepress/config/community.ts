import type { DefaultTheme } from 'vitepress'
import { LINKS } from '../links'

interface Words {
  title: string
  connect: string
  learn: string
  videos: string
  contribute: string
  guide: string
  language: string
  languageAnchor: string
}

const row = (text: string, link: string, icon: string, color?: string) => ({
  text: `<span class="g-menu-row"><span class="g-menu-icon ${icon}"${color ? ` style="color:${color}"` : ''}></span>${text}</span>`,
  link,
  noIcon: true // the theme only drops its external arrow for links holding an svg or img
})

export function community(words: Words, prefix = '', videos: 'youtube' | 'bilibili' = 'youtube'): DefaultTheme.NavItemWithChildren {
  return {
    text: words.title,
    items: [
      {
        text: words.connect,
        items: [
          row('Discord', LINKS.discord, 'icon-[simple-icons--discord]', '#5865F2'),
          row('X', LINKS.x, 'icon-[simple-icons--x]')
        ]
      },
      {
        text: words.learn,
        items: [
          videos === 'youtube'
            ? row(words.videos, LINKS.youtube, 'icon-[simple-icons--youtube]', '#FF0000')
            : row(words.videos, LINKS.bilibili, 'icon-[simple-icons--bilibili]', '#00A1D6'),
          row('DevChalk', LINKS.devchalk, 'is-devchalk')
        ]
      },
      {
        text: words.contribute,
        items: [
          row(words.guide, `${prefix}/prologue/contributions`, 'icon-[lucide--git-pull-request]'),
          row(words.language, `${prefix}/prologue/contributions#${words.languageAnchor}`, 'icon-[lucide--languages]'),
          row('Open Collective', LINKS.openCollective, 'icon-[simple-icons--opencollective]', '#7FADF2')
        ]
      }
    ]
  }
}
