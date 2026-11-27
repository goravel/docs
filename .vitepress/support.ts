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
    values: ['1 个生产应用', '3 个生产应用', '10 个生产应用']
  },
  {
    label: '支持渠道',
    values: ['工单 + 微信群', '工单 + 微信群', '专属微信群 + 工单']
  },
  {
    label: '服务时段',
    values: ['5×8', '7×12', '7×24']
  },
  {
    label: '首次响应',
    values: ['咨询 1 个工作日', '故障 2 小时', '业务阻断 2 小时']
  },
  {
    label: '技术评审',
    values: [false, '年度 1 次', '每季度 1 次']
  },
  { label: '加急补丁', values: [false, true, true] },
  { label: '专属联系人', values: [false, false, '固定联系人'] },
  { label: '历史版本维护', values: [false, false, '1 条分支'] }
]
