export type SupportValue = string | boolean

export interface SupportRow {
  label: string
  values: [SupportValue, SupportValue, SupportValue]
}

export interface SupportPrice {
  monthly: string
  annual: string
  annualMonths: number
}

export interface SupportPlan {
  name: string
  price: SupportPrice
  featured?: boolean
}

export const SUPPORT_ITEM_LABEL = '服务项'

export const SUPPORT_PRICE_LABEL = '价格'

export const SUPPORT_PLANS: SupportPlan[] = [
  {
    name: '优先支持',
    price: { monthly: '¥1,280', annual: '¥12,800', annualMonths: 10 }
  },
  {
    name: '生产保障',
    price: { monthly: '¥3,980', annual: '¥39,800', annualMonths: 10 },
    featured: true
  },
  {
    name: '尊享专属',
    price: { monthly: '¥9,980', annual: '¥99,800', annualMonths: 10 }
  }
]

export const supportDiscountLabel = (price: SupportPrice) =>
  `省 ${12 - price.annualMonths} 个月`

export const SUPPORT_ROWS: SupportRow[] = [
  {
    label: '支持范围',
    values: ['1 个生产应用', '3 个生产应用', '不限']
  },
  {
    label: '服务时段',
    values: ['5×8', '7×12', '7×24']
  },
  {
    label: '首次响应',
    values: ['2 小时', '2 小时', '2 小时']
  },
  {
    label: '技术评审',
    values: ['每年 1 次', '每年 2 次', '每年 4 次']
  },
  { label: '升级协助', values: ['每年 1 次', '每年 2 次', '每年 4 次'] },
  { label: '加急补丁', values: [true, true, true] },
  {
    label: '维护期延长',
    values: ['不延长（共 12 个月）', '+6 个月（共 18 个月）', '+12 个月（共 24 个月）']
  }
]
