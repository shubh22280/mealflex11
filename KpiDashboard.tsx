import { SlidersHorizontal } from 'lucide-react';
import { MonthlyMetrics, MonthlyTargets } from '../types';
import { formatINR } from '../utils/formatters';

interface KpiDashboardProps {
  metrics: MonthlyMetrics;
  targets: MonthlyTargets;
  monthLabel: string;
  onEditTargets: () => void;
}

interface ProgressRowProps {
  label: string;
  currentText: string;
  targetText: string;
  percent: number;
  subtext: string;
}

function TargetProgressCard({
  label,
  currentText,
  targetText,
  percent,
  subtext,
}: ProgressRowProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const roundedPct = Math.round(percent);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900 tabular-nums tracking-tight">
              {currentText}
            </span>
            <span className="text-xs text-slate-500 tabular-nums">
              of {targetText}
            </span>
          </div>
        </div>
        <span
          className={`text-xs font-mono font-medium tabular-nums ${
            roundedPct >= 100
              ? 'text-emerald-700'
              : roundedPct >= 50
              ? 'text-slate-700'
              : 'text-slate-500'
          }`}
        >
          {roundedPct}%
        </span>
      </div>

      <div>
        <div
          className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={roundedPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        >
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
            style={{ width: `${clamped}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500 truncate">{subtext}</p>
      </div>
    </div>
  );
}

export function KpiDashboard({
  metrics,
  targets,
  monthLabel,
  onEditTargets,
}: KpiDashboardProps) {
  const revPct = targets.monthlyRevenue > 0 ? (metrics.totalRevenue / targets.monthlyRevenue) * 100 : 0;
  const subPct = targets.activeSubscribers > 0 ? (metrics.activeSubscribersCount / targets.activeSubscribers) * 100 : 0;
  const mealsPct = targets.mealsServed > 0 ? (metrics.totalMealsServed / targets.mealsServed) * 100 : 0;

  const isProfitable = metrics.netProfitLoss >= 0;
  const marginPct =
    metrics.totalRevenue > 0
      ? Math.round((metrics.contributionMargin / metrics.totalRevenue) * 100)
      : 0;

  const subBreakdown = [
    `${metrics.monthlySubsCount} monthly`,
    `${metrics.trialSubsCount} trial`,
    ...(metrics.singleOrdersCount > 0 ? [`${metrics.singleOrdersCount} add-on`] : []),
  ].join(' · ');

  return (
    <section aria-labelledby="kpi-section-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="kpi-section-heading" className="text-lg font-semibold text-slate-900">
            Monthly Targets & Unit Economics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {monthLabel} · Variable cost ₹55/meal · Fixed overhead {formatINR(targets.monthlyFixedCost)}/mo
          </p>
        </div>

        <button
          type="button"
          onClick={onEditTargets}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          Edit Monthly Targets
        </button>
      </div>

      {/* 3 Core Monthly Target Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TargetProgressCard
          label="Monthly Revenue vs. Target"
          currentText={formatINR(metrics.totalRevenue)}
          targetText={formatINR(targets.monthlyRevenue)}
          percent={revPct}
          subtext={`${formatINR(metrics.paidRevenue)} collected · ${formatINR(metrics.pendingRevenue)} pending`}
        />
        <TargetProgressCard
          label="Active Subscribers vs. Target"
          currentText={String(metrics.activeSubscribersCount)}
          targetText={`${targets.activeSubscribers} students`}
          percent={subPct}
          subtext={subBreakdown}
        />
        <TargetProgressCard
          label="Meals Served vs. Target"
          currentText={String(metrics.totalMealsServed)}
          targetText={`${targets.mealsServed} meals`}
          percent={mealsPct}
          subtext={`${metrics.totalMealsRemaining} meal credits remaining in active plans`}
        />
      </div>

      {/* 5 Financial & Operational KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500">Total Revenue</p>
          <p className="mt-1.5 text-xl font-semibold text-slate-900 font-mono tabular-nums">
            {formatINR(metrics.totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            {formatINR(metrics.paidRevenue)} UPI verified
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500">Total Variable Cost</p>
          <p className="mt-1.5 text-xl font-semibold text-slate-900 font-mono tabular-nums">
            {formatINR(metrics.totalVariableCost)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            ₹55/meal kitchen + drop + pack
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500">Contribution Margin</p>
          <p className="mt-1.5 text-xl font-semibold text-emerald-700 font-mono tabular-nums">
            {formatINR(metrics.contributionMargin)}
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            {marginPct}% unit margin (₹15/meal)
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500">
            Net {isProfitable ? 'Profit' : 'Loss'} (After Fixed)
          </p>
          <p
            className={`mt-1.5 text-xl font-semibold font-mono tabular-nums ${
              isProfitable ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatINR(metrics.netProfitLoss, true)}
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            After {formatINR(targets.monthlyFixedCost)} fixed cost
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 col-span-2 sm:col-span-1">
          <p className="text-xs font-medium text-slate-500">Active Pause Credits</p>
          <p className="mt-1.5 text-xl font-semibold text-slate-900 font-mono tabular-nums">
            {metrics.totalActivePauseCredits}
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            {metrics.totalPausesLogged} total pauses honored
          </p>
        </div>
      </div>
    </section>
  );
}
