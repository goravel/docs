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
    label: '适用场景',
    values: ['中小流量生产团队', '核心线上业务团队', '高可用、强合规核心系统']
  },
  {
    label: '支持范围',
    values: ['1 个生产应用', '3 个生产应用', '不限应用（合理使用）']
  },
  {
    label: '问题响应（仅限框架问题）',
    values: [
      '1 个工作日内首次响应',
      '工作日（周一至周五，不含节假日）2 小时响应',
      '7×24 应急通道（仅限业务阻断故障，2 小时内响应）'
    ]
  },
  { label: '版本变更风险提前通知', values: [true, true, true] },
  {
    label: 'PHP 迁移支持',
    values: [
      '每个订阅年度 1 次 60 分钟迁移咨询',
      '每个订阅年度 1 次迁移方案评审',
      '迁移全程指导（每季度 1 次评审）'
    ]
  },
  { label: '框架缺陷加急评估与临时补丁支持', values: [false, true, true] },
  { label: '长期兼容分支维护', values: [false, false, true] }
]
