import { useMemo, useState } from 'react';
import { Check, Copy, MapPin } from 'lucide-react';
import { PLANS, VENTURE_INFO } from '../data/ventureData';
import { MealOrder } from '../types';
import { formatINR } from '../utils/formatters';

interface KitchenPrepViewProps {
  orders: MealOrder[];
  monthLabel: string;
  onTogglePaid: (id: string) => void;
}

interface DropPointSummary {
  point: string;
  veg: number;
  nonVeg: number;
  jain: number;
  totalActive: number;
  pausedCredits: number;
}

export function KitchenPrepView({
  orders,
  monthLabel,
  onTogglePaid,
}: KitchenPrepViewProps) {
  const [copied, setCopied] = useState(false);

  const activeOrders = useMemo(
    () => orders.filter((o) => o.mealsRemaining > 0),
    [orders]
  );

  const pendingPayments = useMemo(
    () => orders.filter((o) => o.paymentStatus === 'Pending'),
    [orders]
  );

  const dropPointSummaries = useMemo(() => {
    const map = new Map<string, DropPointSummary>();
    for (const order of activeOrders) {
      const existing = map.get(order.collectionPoint) || {
        point: order.collectionPoint,
        veg: 0,
        nonVeg: 0,
        jain: 0,
        totalActive: 0,
        pausedCredits: 0,
      };

      if (order.preference === 'Veg') existing.veg += 1;
      if (order.preference === 'Non-Veg') existing.nonVeg += 1;
      if (order.preference === 'Jain') existing.jain += 1;
      existing.totalActive += 1;
      existing.pausedCredits += order.pausedCredits;
      map.set(order.collectionPoint, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.totalActive - a.totalActive);
  }, [activeOrders]);

  const totals = useMemo(() => {
    return dropPointSummaries.reduce(
      (acc, row) => ({
        veg: acc.veg + row.veg,
        nonVeg: acc.nonVeg + row.nonVeg,
        jain: acc.jain + row.jain,
        totalActive: acc.totalActive + row.totalActive,
      }),
      { veg: 0, nonVeg: 0, jain: 0, totalActive: 0 }
    );
  }, [dropPointSummaries]);

  const handleCopyKitchenNote = async () => {
    const lines = [
      `MealFlex Kitchen Prep Dispatch (${monthLabel})`,
      `Total Active Subscribers: ${totals.totalActive} (Veg: ${totals.veg}, Non-Veg: ${totals.nonVeg}, Jain: ${totals.jain})`,
      '',
      'By Collection Point:',
      ...dropPointSummaries.map(
        (d) => `- ${d.point}: ${d.totalActive} meals (Veg ${d.veg}, Non-Veg ${d.nonVeg}, Jain ${d.jain})`
      ),
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable in restricted contexts
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Daily Kitchen Prep & Drop-Point Manifest
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active students with remaining meal credits in {monthLabel} · Cutoff {VENTURE_INFO.dailyCutoff}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyKitchenNote}
            disabled={dropPointSummaries.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-500 transition-colors whitespace-nowrap shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                Copied Dispatch Text
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                Copy Kitchen Summary
              </>
            )}
          </button>
        </div>

        {/* Summary Totals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
          <div>
            <p className="text-xs text-slate-500">Active Meal Slots</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 font-mono tabular-nums">
              {totals.totalActive}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Veg Meals</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-700 font-mono tabular-nums">
              {totals.veg}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Non-Veg Meals</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 font-mono tabular-nums">
              {totals.nonVeg}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Jain Meals</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 font-mono tabular-nums">
              {totals.jain}
            </p>
          </div>
        </div>

        {dropPointSummaries.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-500 border-t border-slate-100">
            No active subscriptions with remaining meals for {monthLabel}.
          </p>
        ) : (
          <div className="overflow-x-auto border-t border-slate-200 -mx-5 sm:-mx-6 px-5 sm:px-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                  <th className="py-3 pr-4">Collection Point</th>
                  <th className="py-3 px-3 text-right">Veg</th>
                  <th className="py-3 px-3 text-right">Non-Veg</th>
                  <th className="py-3 px-3 text-right">Jain</th>
                  <th className="py-3 px-3 text-right">Active Students</th>
                  <th className="py-3 pl-3 text-right">Paused Credits Held</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {dropPointSummaries.map((row) => (
                  <tr key={row.point} className="hover:bg-slate-50">
                    <td className="py-3 pr-4 font-medium text-slate-900 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                      {row.point}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700">
                      {row.veg}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {row.nonVeg}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {row.jain}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                      {row.totalActive}
                    </td>
                    <td className="py-3 pl-3 text-right font-mono tabular-nums text-slate-500">
                      {row.pausedCredits}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending UPI Collections */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <div className="pb-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">
            Pending UPI Collections
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Students in {monthLabel} whose UPI transfer is marked pending.
          </p>
        </div>

        {pendingPayments.length === 0 ? (
          <p className="py-6 text-xs text-slate-500">
            All orders for {monthLabel} are paid via UPI.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingPayments.map((order) => {
              const plan = PLANS[order.planId];
              return (
                <div
                  key={order.id}
                  className="py-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {order.studentName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {order.collectionPoint} · {plan.name}
                      {order.phone ? ` · ${order.phone}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-amber-700 tabular-nums">
                      {formatINR(plan.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onTogglePaid(order.id)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors"
                    >
                      Mark Paid via UPI
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
