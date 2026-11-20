import {
  PILOT_ROADMAP,
  PLAN_LIST,
  SCENARIOS,
  VENTURE_INFO,
} from '../data/ventureData';
import { MonthlyMetrics, MonthlyTargets } from '../types';
import { formatINR } from '../utils/formatters';

interface VentureEconomicsViewProps {
  metrics: MonthlyMetrics;
  targets: MonthlyTargets;
  monthLabel: string;
}

export function VentureEconomicsView({
  metrics,
  targets,
  monthLabel,
}: VentureEconomicsViewProps) {
  return (
    <div className="space-y-6">
      {/* Venture Overview & Unit Cost Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Plan Pricing & Unit Economics
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {VENTURE_INFO.tagline}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-3 font-medium">Plan</th>
                  <th className="py-2 px-2 text-right font-medium">Credits</th>
                  <th className="py-2 px-2 text-right font-medium">Price</th>
                  <th className="py-2 px-2 text-right font-medium">Var. Cost</th>
                  <th className="py-2 pl-2 text-right font-medium">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PLAN_LIST.map((plan) => (
                  <tr key={plan.id}>
                    <td className="py-2.5 pr-3 font-medium text-slate-900">
                      {plan.name}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600">
                      {plan.credits}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-900">
                      {formatINR(plan.price)}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600">
                      {formatINR(plan.totalVariableCost)}
                    </td>
                    <td className="py-2.5 pl-2 text-right font-mono font-semibold tabular-nums text-emerald-700">
                      {formatINR(plan.margin)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-medium text-slate-700 mb-2">
                Variable Cost Breakdown (₹55 / meal)
              </p>
              <ul className="space-y-1.5 text-slate-600">
                {VENTURE_INFO.variableCostBreakdown.map((item) => (
                  <li key={item.label} className="flex justify-between">
                    <span>{item.label}</span>
                    <span className="font-mono tabular-nums text-slate-900">
                      {formatINR(item.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-medium text-slate-700 mb-2">
                Monthly Fixed Cost Budget ({formatINR(targets.monthlyFixedCost)})
              </p>
              <ul className="space-y-1.5 text-slate-600">
                {VENTURE_INFO.fixedCostBreakdown.map((item) => (
                  <li key={item.label} className="flex justify-between">
                    <span>{item.label}</span>
                    <span className="font-mono tabular-nums text-slate-900">
                      {formatINR(item.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Financial Scenario Benchmark vs Live Month */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Monthly Financial Scenarios vs. {monthLabel}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparing live operating performance against Conservative, Base (30 subs), and Ambitious cases.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-3 font-medium">Scenario</th>
                  <th className="py-2 px-2 text-right font-medium">Subs</th>
                  <th className="py-2 px-2 text-right font-medium">Revenue</th>
                  <th className="py-2 px-2 text-right font-medium">Contrib.</th>
                  <th className="py-2 pl-2 text-right font-medium">Net P/L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-emerald-50/60">
                  <td className="py-2.5 pr-3 font-semibold text-emerald-900">
                    Actual ({monthLabel})
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono tabular-nums text-emerald-900">
                    {metrics.activeSubscribersCount}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono tabular-nums text-emerald-900">
                    {formatINR(metrics.totalRevenue)}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono tabular-nums text-emerald-900">
                    {formatINR(metrics.contributionMargin)}
                  </td>
                  <td
                    className={`py-2.5 pl-2 text-right font-mono font-semibold tabular-nums ${
                      metrics.netProfitLoss >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {formatINR(metrics.netProfitLoss, true)}
                  </td>
                </tr>
                {SCENARIOS.map((sc) => (
                  <tr key={sc.id}>
                    <td className="py-2.5 pr-3">
                      <div className="font-medium text-slate-900">{sc.name}</div>
                      <div className="text-slate-500 mt-0.5">{sc.notes}</div>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-700 align-top">
                      {sc.subscribers}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-700 align-top">
                      {formatINR(sc.revenue)}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-700 align-top">
                      {formatINR(sc.contribution)}
                    </td>
                    <td
                      className={`py-2.5 pl-2 text-right font-mono font-semibold tabular-nums align-top ${
                        sc.netOperating >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {formatINR(sc.netOperating, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-600">
            <strong className="text-slate-800">Beachhead Segment:</strong>{' '}
            {VENTURE_INFO.beachhead}. Target SAM: 200 students · Initial SOM: 30 active subscribers (15% SAM · 600 meals/month).
          </div>
        </div>
      </div>

      {/* 30-Day Pilot Execution Roadmap */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <div className="pb-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">
            30-Day DBS Campus Pilot Roadmap
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Success threshold: At least 5 of 15 paying trial students convert to the ₹1,400 monthly subscription (≥33% conversion).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {PILOT_ROADMAP.map((item) => (
            <div
              key={item.week}
              className="border border-slate-200 rounded-lg p-4 flex flex-col justify-between gap-3 bg-slate-50/40"
            >
              <div className="space-y-1.5">
                <p className="text-xs font-mono font-medium text-emerald-700">
                  {item.week}
                </p>
                <h4 className="text-sm font-semibold text-slate-900">
                  {item.focus}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.action}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/80 space-y-1 text-xs">
                <p className="text-slate-700">
                  <span className="font-medium">Target:</span> {item.target}
                </p>
                <p className="text-slate-500">
                  <span className="font-medium text-slate-600">Key Question:</span>{' '}
                  {item.learningQuestion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
