import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface TopErrorsTableProps {
  data: Array<{ errorMessage: string; action: string; count: number }>
}

export function TopErrorsTable({ data }: TopErrorsTableProps) {
  const { t } = useTranslation()

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.topErrors')}</CardTitle>
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
        <CardTitle>{t('charts.topErrors')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[350px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('charts.errorMessage')}</TableHead>
                <TableHead>{t('charts.action')}</TableHead>
                <TableHead className="text-right">{t('charts.count')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium max-w-[250px] truncate" title={item.errorMessage}>
                    {item.errorMessage}
                  </TableCell>
                  <TableCell>{item.action}</TableCell>
                  <TableCell className="text-right">{item.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
