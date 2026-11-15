import Card from '../common/Card';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-slate-200 rounded-md" />
          <div className="h-8 w-64 bg-slate-200 rounded-xl" />
          <div className="h-4 w-96 max-w-full bg-slate-200 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-28 bg-slate-200 rounded-xl" />
          <div className="h-10 w-28 bg-slate-200 rounded-xl" />
        </div>
      </div>

      {/* Hero Assistant Skeleton */}
      <div className="h-28 w-full bg-slate-200 rounded-3xl" />

      {/* Patient Profile Card Skeleton */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 w-full">
            <div className="w-20 h-20 rounded-2xl bg-slate-200 shrink-0" />
            <div className="space-y-2 w-full max-w-md">
              <div className="h-6 w-48 bg-slate-200 rounded-md" />
              <div className="h-4 w-32 bg-slate-200 rounded-md" />
              <div className="flex gap-2">
                <div className="h-5 w-20 bg-slate-200 rounded-full" />
                <div className="h-5 w-24 bg-slate-200 rounded-full" />
              </div>
            </div>
          </div>
          <div className="w-full md:w-72 h-16 bg-slate-200 rounded-xl shrink-0" />
        </div>
      </Card>

      {/* 4 Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="w-8 h-8 rounded-xl bg-slate-200" />
            </div>
            <div className="h-7 w-20 bg-slate-200 rounded-lg" />
            <div className="h-3 w-32 bg-slate-200 rounded" />
          </Card>
        ))}
      </div>

      {/* Vitals Cards Skeleton */}
      <Card className="p-6 space-y-4">
        <div className="h-6 w-48 bg-slate-200 rounded-md" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </Card>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 h-80" />
          <Card className="p-6 h-64" />
        </div>
        <div className="space-y-6">
          <Card className="p-6 h-48" />
          <Card className="p-6 h-64" />
          <Card className="p-6 h-72" />
        </div>
      </div>
    </div>
  );
}
