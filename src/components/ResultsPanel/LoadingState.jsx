import { Card } from '@/components/ui/card'

export function LoadingState() {
  return (
    <div className="space-y-3 p-4">
      <p className="text-sm text-muted-foreground">경로 조합 계산 중...</p>
      {[0, 1, 2].map((i) => (
        <Card key={i} className="gap-2 rounded-xl px-4 py-3">
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        </Card>
      ))}
    </div>
  )
}
