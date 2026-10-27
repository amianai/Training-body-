import type { TestRow } from '@/lib/fitnessTest'
import { cn } from '@/lib/utils'

/** I numeri del test di forma: ultimo risultato per prova e quanto è cambiato dal primo test. */
export function TestResults({ rows, className }: { rows: TestRow[]; className?: string }) {
  return (
    <ul className={cn('grid grid-cols-2 gap-2', className)}>
      {rows.map((row) => (
        <li key={row.exerciseId} className="flex flex-col rounded-lg border bg-background/40 px-3 py-2 text-left">
          <span className="truncate text-xs text-muted-foreground">{row.name}</span>
          <span className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl leading-tight font-bold tabular">{row.value ?? '–'}</span>
            {row.value !== undefined && <span className="text-sm text-muted-foreground">{row.unit}</span>}
            {row.change !== undefined && row.change !== 0 && (
              <span className={cn('ml-auto text-sm font-semibold tabular', row.change > 0 ? 'text-primary' : 'text-muted-foreground')}>
                {row.change > 0 ? `+${row.change}` : `−${-row.change}`}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}
