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

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-green-600',
  POST: 'text-blue-600',
  PUT: 'text-orange-600',
  DELETE: 'text-red-600',
  PATCH: 'text-purple-600',
}

export function TopEndpointsTable({ data }: TopEndpointsTableProps) {
  const { t } = useTranslation()

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
              {data.map((item, index) => (
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
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
