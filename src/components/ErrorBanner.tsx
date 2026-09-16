export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="error-banner" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button className="link-button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}
