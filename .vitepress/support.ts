export type SupportValue = string | boolean

export interface SupportRow {
  label: string
  values: [SupportValue, SupportValue, SupportValue]
}

export const SUPPORT_ITEM_LABEL = '服务项'

export const SUPPORT_PLANS = ['优先支持', '生产保障', '尊享专属']

export const SUPPORT_ROWS: SupportRow[] = [
  {
    label: '适用场景',
    values: ['中小流量生产团队', '核心线上业务团队', '高可用、强合规核心系统']
  },
  {
    label: '问题响应（仅限框架问题）',
    values: [
      '优先工单队列',
      '工作日（周一至周五，不含节假日）2 小时响应',
      '7×24 应急通道（仅限业务阻断故障）'
    ]
  },
  { label: '版本变更风险提前通知', values: [true, true, true] },
  {
    label: 'PHP 迁移支持',
    values: ['迁移基础咨询', '迁移风险评审', '全流程陪伴指导']
  },
  { label: '框架缺陷加急评估与临时补丁支持', values: [false, true, true] },
  { label: '长期兼容分支维护', values: [false, false, true] }
]
