import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  format,
} from 'date-fns'

export type DateRangeType = 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'custom'

/**
 * 获取指定时间范围
 */
export function getDateRange(range: DateRangeType): { start: Date; end: Date } {
  const now = new Date()

  switch (range) {
    case 'today':
      return {
        start: startOfDay(now),
        end: now,
      }

    case 'yesterday':
      const yesterday = subDays(now, 1)
      return {
        start: startOfDay(yesterday),
        end: endOfDay(yesterday),
      }

    case 'week':
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }), // 周一开始
        end: now,
      }

    case 'month':
      return {
        start: startOfMonth(now),
        end: now,
      }

    case 'quarter':
      return {
        start: startOfQuarter(now),
        end: now,
      }

    case 'year':
      return {
        start: startOfYear(now),
        end: now,
      }

    default:
      return {
        start: startOfDay(now),
        end: now,
      }
  }
}

/**
 * 获取对比时间范围（环比）
 */
export function getComparisonRange(range: DateRangeType): { start: Date; end: Date } {
  const { start, end } = getDateRange(range)
  const duration = end.getTime() - start.getTime()

  const compareEnd = new Date(start.getTime() - 1)
  const compareStart = new Date(compareEnd.getTime() - duration)

  return {
    start: compareStart,
    end: compareEnd,
  }
}

/**
 * 获取同比时间范围（去年同期）
 */
export function getYearOverYearRange(range: DateRangeType): { start: Date; end: Date } {
  const { start, end } = getDateRange(range)

  return {
    start: subYears(start, 1),
    end: subYears(end, 1),
  }
}

/**
 * 格式化日期范围为字符串
 */
export function formatDateRange(start: Date, end: Date, formatStr: string = 'yyyy-MM-dd'): string {
  return `${format(start, formatStr)} ~ ${format(end, formatStr)}`
}

/**
 * 将日期范围转换为 ISO 字符串
 */
export function dateRangeToISO(start: Date, end: Date): { startDate: string; endDate: string } {
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  }
}

/**
 * 解析日期范围类型为描述文本
 */
export function getDateRangeLabel(range: DateRangeType): string {
  const labels: Record<DateRangeType, string> = {
    today: '今天',
    yesterday: '昨天',
    week: '本周',
    month: '本月',
    quarter: '本季度',
    year: '本年',
    custom: '自定义',
  }

  return labels[range] || '未知'
}

/**
 * 生成时间段列表（用于时段分析）
 */
export function generateTimeRanges(): string[] {
  const ranges: string[] = []

  for (let hour = 0; hour < 24; hour++) {
    const start = hour.toString().padStart(2, '0')
    const end = (hour + 1).toString().padStart(2, '0')
    ranges.push(`${start}:00-${end}:00`)
  }

  return ranges
}

/**
 * 获取日期所属的时间段
 */
export function getTimeRange(date: Date): string {
  const hour = date.getHours()
  const start = hour.toString().padStart(2, '0')
  const end = (hour + 1).toString().padStart(2, '0')
  return `${start}:00-${end}:00`
}

/**
 * 生成日期数组（用于填充图表数据）
 */
export function generateDateArray(start: Date, end: Date): Date[] {
  const dates: Date[] = []
  const current = new Date(start)

  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

/**
 * 判断是否为同一天
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return format(date1, 'yyyy-MM-dd') === format(date2, 'yyyy-MM-dd')
}
