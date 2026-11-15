import { useState } from 'react';
import Card from '../common/Card';
import {
  ShoppingBag,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  CalendarClock,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useCare } from '../../context/CareContext';
import { Link } from 'react-router-dom';
import { calculateStockMetrics } from '../../services/refillService';
import RecordRefillModal from '../medications/RecordRefillModal';

export default function MedicineStockInventoryCard({ onAddMedication }) {
  const { medications } = useCare();
  const [selectedMedForRefill, setSelectedMedForRefill] = useState(null);
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);

  // Compute live stock metrics for all medications
  const inventoryList = medications.map((med) => ({
    med,
    metrics: calculateStockMetrics(med)
  }));

  const inStockCount = inventoryList.filter((x) => x.metrics.isInStock).length;
  const lowStockCount = inventoryList.filter((x) => x.metrics.isLowStock).length;
  const outOfStockCount = inventoryList.filter((x) => x.metrics.isOutOfStock).length;

  const getStatusBadge = (metrics) => {
    if (metrics.isOutOfStock) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-[#DC5555] border border-rose-300">
          <AlertOctagon className="w-3 h-3 text-[#DC5555]" /> Out of Stock
        </span>
      );
    }
    if (metrics.isLowStock) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-[#E9A23B] border border-amber-300">
          <AlertTriangle className="w-3 h-3 text-[#E9A23B]" /> Low Stock
        </span>
      );
    }
    if (metrics.isExpiringSoon) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-900 border border-orange-300">
          <CalendarClock className="w-3 h-3 text-orange-600" /> Expiring Soon
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-[#16A37B] border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-[#16A37B]" /> In Stock
      </span>
    );
  };

  const getProgressColor = (metrics) => {
    if (metrics.isOutOfStock) return 'bg-[#DC5555]';
    if (metrics.isLowStock) return 'bg-[#E9A23B]';
    if (metrics.isExpiringSoon) return 'bg-orange-500';
    return 'bg-[#13A89E]';
  };

  return (
    <>
      <Card className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EAF3FC] text-[#142B4A] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#13A89E]" />
              </div>
              <h3 className="text-lg font-bold text-[#142B4A]">Remaining Medicine Stock</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-[#718096]">
                {medications.length} Prescriptions
              </span>
            </div>
            <p className="text-xs text-[#718096] mt-1">
              Live inventory tracking, remaining supply days, and refill alerts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/medications?tab=refills"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-[#142B4A] transition-colors"
            >
              <span>Manage Refills</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Inventory Summary Pills */}
        <div className="grid grid-cols-3 gap-2.5 pt-3 pb-4">
          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-center">
            <span className="text-[10px] font-bold text-[#16A37B] uppercase block">In Stock</span>
            <span className="text-lg font-black text-[#16A37B]">{inStockCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-center">
            <span className="text-[10px] font-bold text-[#E9A23B] uppercase block">Low Stock</span>
            <span className="text-lg font-black text-[#E9A23B]">{lowStockCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/60 text-center">
            <span className="text-[10px] font-bold text-[#DC5555] uppercase block">Out of Stock</span>
            <span className="text-lg font-black text-[#DC5555]">{outOfStockCount}</span>
          </div>
        </div>

        {/* Medications Stock List */}
        <div className="space-y-3">
          {inventoryList.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#172B4D]">No Prescriptions in Inventory</p>
              <p className="text-xs text-[#718096] max-w-xs mx-auto">
                Add medications with initial stock quantities to monitor remaining supplies.
              </p>
              {onAddMedication && (
                <button
                  type="button"
                  onClick={onAddMedication}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#13A89E] hover:bg-[#0F8C83] text-white text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Prescription</span>
                </button>
              )}
            </div>
          ) : (
            inventoryList.slice(0, 4).map(({ med, metrics }) => (
              <div
                key={med.id}
                className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#142B4A] truncate">
                      {med.name}
                    </span>
                    <span className="text-[11px] text-[#718096] font-medium">
                      {med.dosage}
                    </span>
                    {getStatusBadge(metrics)}
                  </div>

                  {/* Stock Gauge Progress Bar */}
                  <div className="w-full sm:w-48 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                        metrics
                      )}`}
                      style={{ width: `${Math.min(100, Math.max(4, metrics.percentage))}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#718096] pt-0.5">
                    <span className="font-semibold text-[#172B4D]">
                      {metrics.currentQuantity} of {metrics.initialQuantity} {metrics.units}
                    </span>
                    <span>•</span>
                    <span className="text-[#718096]">
                      ~{metrics.daysRemaining} days remaining
                    </span>
                  </div>
                </div>

                {/* Restock Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMedForRefill(med);
                    setIsRefillModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-[#0F8C83] text-xs font-bold transition-colors cursor-pointer shrink-0 self-start sm:self-center"
                >
                  Refill
                </button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Record Refill Modal */}
      <RecordRefillModal
        isOpen={isRefillModalOpen}
        onClose={() => {
          setIsRefillModalOpen(false);
          setSelectedMedForRefill(null);
        }}
        targetMedication={selectedMedForRefill}
      />
    </>
  );
}
