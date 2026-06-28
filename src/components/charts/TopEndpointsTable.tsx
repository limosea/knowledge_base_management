import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface TopEndpointsTableProps {
  data: Array<{
    method: string
    path: string
    count: number
    avgResponseTime: number
  }>
}

const MAX_ROWS = 15

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-green-600',
  POST: 'text-blue-600',
  PUT: 'text-orange-600',
  DELETE: 'text-red-600',
  PATCH: 'text-purple-600',
}

export function TopEndpointsTable({ data }: TopEndpointsTableProps) {
  const { t } = useTranslation()

  const { topRows, othersRow } = useMemo(() => {
    if (!data || data.length === 0) return { topRows: [], othersRow: null }
    const sorted = [...data].sort((a, b) => b.count - a.count)
    const top = sorted.slice(0, MAX_ROWS)
    const rest = sorted.slice(MAX_ROWS)
    let others: { count: number; avgMs: number; restLen: number } | null = null
    if (rest.length > 0) {
      const totalCount = rest.reduce((s, r) => s + r.count, 0)
      const totalMs = rest.reduce((s, r) => s + r.avgResponseTime * r.count, 0)
      others = { count: totalCount, avgMs: totalCount > 0 ? Math.round(totalMs / totalCount) : 0, restLen: rest.length }
    }
    return { topRows: top, othersRow: others }
  }, [data])

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.topEndpoints')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            {t('charts.noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.topEndpoints')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[350px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('charts.method')}</TableHead>
                <TableHead>{t('charts.path')}</TableHead>
                <TableHead className="text-right">{t('charts.count')}</TableHead>
                <TableHead className="text-right">{t('charts.avgResponseTime')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topRows.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <span className={`font-mono font-bold ${METHOD_COLORS[item.method] ?? ''}`}>
                      {item.method}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm max-w-[300px] truncate" title={item.path}>
                    {item.path}
                  </TableCell>
                  <TableCell className="text-right">{item.count}</TableCell>
                  <TableCell className="text-right">{item.avgResponseTime}ms</TableCell>
                </TableRow>
              ))}
              {othersRow && (
                <TableRow className="italic text-muted-foreground">
                  <TableCell />
                  <TableCell className="text-sm">
                    {t('charts.others', { count: othersRow.restLen })}
                  </TableCell>
                  <TableCell className="text-right">{othersRow.count}</TableCell>
                  <TableCell className="text-right">{othersRow.avgMs}ms</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
