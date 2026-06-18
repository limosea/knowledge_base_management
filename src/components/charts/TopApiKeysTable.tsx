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

export function TopApiKeysTable({ data }: TopApiKeysTableProps) {
  const { t } = useTranslation()

  if (!data || data.length === 0) {
    return null
  }

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
            {data.map((entry, index) => (
              <TableRow key={`${entry.name}-${index}`}>
                <TableCell className="font-medium">{entry.name}</TableCell>
                <TableCell className="text-right">{entry.count.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
