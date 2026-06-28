import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface TopApiKeysTableProps {
  data: Array<{ name: string; count: number }> | undefined
}

const MAX_ROWS = 10

export function TopApiKeysTable({ data }: TopApiKeysTableProps) {
  const { t } = useTranslation()

  if (!data || data.length === 0) {
    return null
  }

  const top = data.slice(0, MAX_ROWS)
  const rest = data.slice(MAX_ROWS)
  const othersCount = rest.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.topApiKeysToday')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('charts.apiKeyName')}</TableHead>
              <TableHead className="text-right">{t('charts.requestsToday')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {top.map((entry, index) => (
              <TableRow key={`${entry.name}-${index}`}>
                <TableCell className="font-medium">{entry.name}</TableCell>
                <TableCell className="text-right">{entry.count.toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {rest.length > 0 && (
              <TableRow className="text-muted-foreground italic">
                <TableCell>{t('charts.others', { count: rest.length })}</TableCell>
                <TableCell className="text-right">{othersCount.toLocaleString()}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
