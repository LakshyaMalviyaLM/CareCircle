import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { calculateStockMetrics } from '../../services/refillService';
import {
  Pill,
  ShoppingBag,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Calendar,
  CheckCircle2,
  Edit
} from 'lucide-react';

export default function MedicineInventoryCard({
  medication,
  onRefillClick,
  onEditClick
}) {
  const metrics = calculateStockMetrics(medication);

  // Status badge styling
  const getStatusBadge = () => {
    if (metrics.isOutOfStock) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-[#DC5555] border border-rose-200 shrink-0">
          <AlertOctagon className="w-3 h-3 text-[#DC5555]" />
          Out of Stock
        </span>
      );
    }
    if (metrics.isLowStock) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-[#E9A23B] border border-amber-200 shrink-0">
          <AlertTriangle className="w-3 h-3 text-[#E9A23B]" />
          Low Stock
        </span>
      );
    }
    if (metrics.isExpiringSoon) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-800 border border-orange-200 shrink-0">
          <Clock className="w-3 h-3 text-orange-600" />
          {metrics.isExpired ? 'Expired' : 'Expiring Soon'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#16A37B] border border-emerald-200 shrink-0">
        <CheckCircle2 className="w-3 h-3 text-[#16A37B]" />
        In Stock
      </span>
    );
  };

  const getIconContainerStyle = () => {
    if (metrics.isOutOfStock) return 'bg-rose-50 border-rose-200 text-[#DC5555]';
    if (metrics.isLowStock) return 'bg-amber-50 border-amber-200 text-[#E9A23B]';
    if (metrics.isExpiringSoon) return 'bg-orange-50 border-orange-200 text-orange-700';
    return 'bg-teal-50 border-teal-200 text-[#13A89E]';
  };

  return (
    <Card className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition-all duration-200 flex flex-col justify-between h-full">
      <div className="space-y-3.5">
        {/* Header: Icon, Name, Dosage & Status Badge */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getIconContainerStyle()}`}
            >
              <Pill className="w-5 h-5 stroke-[2]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-[#142B4A] text-sm leading-tight truncate">
                  {medication.name}
                </h3>
                <span className="text-[11px] font-semibold text-[#718096] bg-slate-100 px-1.5 py-0.5 rounded">
                  {medication.dosage}
                </span>
              </div>
              <p className="text-[11px] text-[#718096] mt-0.5 capitalize truncate">
                {medication.form || 'Tablet'} • {medication.frequency || 'Daily'}
              </p>
            </div>
          </div>

          <div>{getStatusBadge()}</div>
        </div>

        {/* Stock Level Counter & Progress Gauge */}
        <div className="bg-[#F6F8FC] p-3 rounded-xl border border-slate-200/70 space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] text-[#718096] font-semibold uppercase tracking-wider">
              Remaining Stock
            </span>
            <div className="text-right">
              <span
                className={`text-lg font-extrabold ${
                  metrics.isOutOfStock
                    ? 'text-[#DC5555]'
                    : metrics.isLowStock
                    ? 'text-[#E9A23B]'
                    : 'text-[#142B4A]'
                }`}
              >
                {metrics.currentQuantity}
              </span>
              <span className="text-xs text-[#718096] font-medium ml-1">
                / {metrics.initialQuantity} {metrics.units}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                metrics.isOutOfStock
                  ? 'bg-[#DC5555]'
                  : metrics.isLowStock
                  ? 'bg-[#E9A23B]'
                  : metrics.isExpiringSoon
                  ? 'bg-orange-500'
                  : 'bg-[#13A89E]'
              }`}
              style={{ width: `${Math.min(100, Math.max(3, metrics.percentage))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#718096] pt-0.5">
            <span className="font-semibold text-[#172B4D]">
              {metrics.daysRemaining} days of supply left
            </span>
            <span className="font-medium">{metrics.percentage}%</span>
          </div>
        </div>

        {/* Key Inventory Metadata Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-[#718096]">
          {/* Refill Threshold */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] text-[#718096] uppercase font-bold block">
              Refill Threshold
            </span>
            <span className="font-bold text-[#142B4A] mt-0.5 block">
              &le; {metrics.refillThreshold} {metrics.units}
            </span>
          </div>

          {/* Expiry Date */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] text-[#718096] uppercase font-bold block">
              Expiration Date
            </span>
            <div className="font-bold mt-0.5 block truncate">
              {metrics.expiryDate ? (
                <span className={metrics.isExpiringSoon ? 'text-orange-700' : 'text-[#172B4D]'}>
                  {new Date(metrics.expiryDate).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              ) : (
                <span className="text-slate-400 font-normal">Not set</span>
              )}
            </div>
          </div>
        </div>

        {/* Last Refilled Details */}
        <div className="text-[11px] text-[#718096] flex items-center justify-between pt-0.5">
          <span className="flex items-center gap-1 truncate">
            <Calendar className="w-3 h-3 text-[#718096] shrink-0" />
            Last Refill:{' '}
            {metrics.lastRefillDate
              ? new Date(metrics.lastRefillDate).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric'
                })
              : 'Initial Batch'}
          </span>
          <span className="text-[#718096] truncate">
            Dr: {medication.doctor || 'Physician'}
          </span>
        </div>
      </div>

      {/* Card Actions: Aligned at bottom */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onEditClick && onEditClick(medication)}
          className="h-8.5 w-8.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-[#718096] hover:text-[#142B4A] transition-colors cursor-pointer flex items-center justify-center shrink-0"
          title="Edit Medication"
          aria-label="Edit Medication"
        >
          <Edit className="w-3.5 h-3.5" />
        </button>

        <Button
          variant={metrics.isOutOfStock || metrics.isLowStock ? 'accent' : 'outline'}
          size="sm"
          icon={ShoppingBag}
          onClick={() => onRefillClick && onRefillClick(medication)}
          className="h-8.5 text-xs font-semibold"
        >
          {metrics.isOutOfStock ? 'Refill Immediately' : 'Record Refill'}
        </Button>
      </div>
    </Card>
  );
}
