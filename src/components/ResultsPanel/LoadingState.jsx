import './LoadingState.css'

export function LoadingState() {
  return (
    <div className="loading-state">
      <p className="loading-state__msg">경로 조합 계산 중...</p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line skeleton-line--sub" />
          <div className="skeleton-line skeleton-line--short" />
        </div>
      ))}
    </div>
  )
}
