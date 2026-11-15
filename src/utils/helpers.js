// Utility helpers for CareCircle

export function formatTime(timeStr) {
  if (!timeStr) return '';
  return timeStr;
}

export function getStatusBadge(status) {
  switch (status?.toLowerCase()) {
    case 'taken':
    case 'completed':
    case 'success':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Taken'
      };
    case 'pending':
    case 'upcoming':
    case 'scheduled':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Pending'
      };
    case 'missed':
    case 'overdue':
    case 'cancelled':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: 'Missed'
      };
    default:
      return {
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        label: status || 'Unknown'
      };
  }
}

export function calculateAdherenceStats(medications) {
  if (!medications || medications.length === 0) {
    return { taken: 0, pending: 0, missed: 0, total: 0, percentage: 0 };
  }

  const taken = medications.filter(m => m.status === 'taken').length;
  const pending = medications.filter(m => m.status === 'pending').length;
  const missed = medications.filter(m => m.status === 'missed').length;
  const total = medications.length;
  const percentage = Math.round((taken / total) * 100);

  return { taken, pending, missed, total, percentage };
}
