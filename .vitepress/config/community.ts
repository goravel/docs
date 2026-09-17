import type { DefaultTheme } from 'vitepress'

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

const VIDEOS = {
  youtube: ['https://www.youtube.com/playlist?list=PL40Xne4u-oXJ0Z5uFiPWHqIMvzZaG_BDf', 'icon-[simple-icons--youtube]', '#FF0000'],
  bilibili: ['https://space.bilibili.com/1886603340/channel/seriesdetail?sid=4302621&ctype=0', 'icon-[simple-icons--bilibili]', '#00A1D6']
} as const

export function community(words: Words, prefix = '', videos: keyof typeof VIDEOS = 'youtube'): DefaultTheme.NavItemWithChildren {
  return {
    text: words.title,
    items: [
      {
        text: words.connect,
        items: [
          row('Discord', 'https://discord.gg/cFc5csczzS', 'icon-[simple-icons--discord]', '#5865F2'),
          row('X', 'https://x.com/goravel_dev', 'icon-[simple-icons--x]', '#000000')
        ]
      },
      {
        text: words.learn,
        items: [
          row(words.videos, ...VIDEOS[videos]),
          row('DevChalk', 'https://devchalk.com/goravel', 'is-devchalk')
        ]
      },
      {
        text: words.contribute,
        items: [
          row(words.guide, `${prefix}/prologue/contributions`, 'icon-[lucide--git-pull-request]'),
          row(words.language, `${prefix}/prologue/contributions#${words.languageAnchor}`, 'icon-[lucide--languages]'),
          row('Open Collective', 'https://opencollective.com/goravel', 'icon-[simple-icons--opencollective]', '#7FADF2')
        ]
      }
    ]
  }
}
