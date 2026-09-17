export function StatusBadge({ paid }: { paid: boolean }) {
  return <span className={paid ? 'sp-badge sp-badge-paid' : 'sp-badge sp-badge-pending'}>{paid ? 'Paid' : 'Pending'}</span>
}
