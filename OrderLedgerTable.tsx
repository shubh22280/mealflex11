import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  PauseCircle,
  Search,
  Trash2,
  Utensils,
} from 'lucide-react';
import { PLANS } from '../data/ventureData';
import { MealOrder, MealPreference, PaymentStatus, PlanId } from '../types';
import { formatINR, formatShortDate } from '../utils/formatters';

interface OrderLedgerTableProps {
  orders: MealOrder[];
  monthLabel: string;
  onServeMeal: (id: string) => void;
  onPauseMeal: (id: string) => void;
  onTogglePaid: (id: string) => void;
  onDeleteOrder: (id: string) => void;
  onLoadSampleData: () => void;
}

export function OrderLedgerTable({
  orders,
  monthLabel,
  onServeMeal,
  onPauseMeal,
  onTogglePaid,
  onDeleteOrder,
  onLoadSampleData,
}: OrderLedgerTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | PlanId>('all');
  const [prefFilter, setPrefFilter] = useState<'all' | MealPreference>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentStatus>('all');
  const [pointFilter, setPointFilter] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const uniquePoints = useMemo(() => {
    const pts = new Set(orders.map((o) => o.collectionPoint));
    return Array.from(pts).sort();
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders
      .filter((order) => {
        if (planFilter !== 'all' && order.planId !== planFilter) return false;
        if (prefFilter !== 'all' && order.preference !== prefFilter) return false;
        if (paymentFilter !== 'all' && order.paymentStatus !== paymentFilter) return false;
        if (pointFilter !== 'all' && order.collectionPoint !== pointFilter) return false;
        if (q) {
          const matchesName = order.studentName.toLowerCase().includes(q);
          const matchesPoint = order.collectionPoint.toLowerCase().includes(q);
          const matchesPhone = order.phone.toLowerCase().includes(q);
          if (!matchesName && !matchesPoint && !matchesPhone) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [orders, searchQuery, planFilter, prefFilter, paymentFilter, pointFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    planFilter !== 'all' ||
    prefFilter !== 'all' ||
    paymentFilter !== 'all' ||
    pointFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setPlanFilter('all');
    setPrefFilter('all');
    setPaymentFilter('all');
    setPointFilter('all');
  };

  return (
    <section
      aria-labelledby="ledger-heading"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      {/* Header & Filter Bar */}
      <div className="p-5 border-b border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="ledger-heading" className="text-base font-semibold text-slate-900">
              Daily Operations & Pause-Credit Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {filteredOrders.length} of {orders.length} {orders.length === 1 ? 'order' : 'orders'} in {monthLabel} · Cutoff 10:30 AM Lunch / 5:00 PM Dinner
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline whitespace-nowrap"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-4 relative">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, PG, or WhatsApp..."
              aria-label="Search orders"
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="lg:col-span-2">
            <select
              value={pointFilter}
              onChange={(e) => setPointFilter(e.target.value)}
              aria-label="Filter by collection point"
              className="w-full h-9 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All Collection Points</option>
              {uniquePoints.map((pt) => (
                <option key={pt} value={pt}>
                  {pt}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as 'all' | PlanId)}
              aria-label="Filter by plan"
              className="w-full h-9 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All Plans</option>
              <option value="plan_20">20-Meal Monthly</option>
              <option value="plan_5">5-Meal Trial</option>
              <option value="plan_1">Single Meal</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={prefFilter}
              onChange={(e) => setPrefFilter(e.target.value as 'all' | MealPreference)}
              aria-label="Filter by meal preference"
              className="w-full h-9 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All Preferences</option>
              <option value="Veg">Veg</option>
              <option value="Non-Veg">Non-Veg</option>
              <option value="Jain">Jain</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as 'all' | PaymentStatus)}
              aria-label="Filter by payment status"
              className="w-full h-9 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All Payments</option>
              <option value="Paid via UPI">Paid via UPI</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty States */}
      {orders.length === 0 ? (
        <div className="py-12 px-6 text-center">
          <p className="text-sm font-medium text-slate-900">
            No orders logged for {monthLabel} yet
          </p>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Use the Quick Daily Order Entry form above to log your first student subscription, or load sample DBS Global University pilot data.
          </p>
          <button
            type="button"
            onClick={onLoadSampleData}
            className="mt-4 inline-flex items-center px-4 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            Load Sample Pilot Data
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-10 px-6 text-center">
          <p className="text-sm font-medium text-slate-900">No matching orders found</p>
          <p className="mt-1 text-xs text-slate-500">
            Try adjusting your search query or filter selections.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 text-xs font-medium text-emerald-700 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop High-Density Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                  <th className="py-3 pl-5 pr-3 whitespace-nowrap">Date</th>
                  <th className="py-3 px-3 whitespace-nowrap">Student</th>
                  <th className="py-3 px-3 whitespace-nowrap">PG / Collection Point</th>
                  <th className="py-3 px-3 whitespace-nowrap">Plan · Pref</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Amount</th>
                  <th className="py-3 px-3 whitespace-nowrap">Payment</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Meals Left</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Paused Credits</th>
                  <th className="py-3 pl-3 pr-5 text-right whitespace-nowrap">Daily Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredOrders.map((order) => {
                  const plan = PLANS[order.planId];
                  const isPaid = order.paymentStatus === 'Paid via UPI';
                  const isCompleted = order.mealsRemaining === 0;
                  const isConfirmingDelete = confirmDeleteId === order.id;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 pl-5 pr-3 text-xs font-mono text-slate-500 tabular-nums whitespace-nowrap">
                        {formatShortDate(order.date)}
                      </td>

                      <td className="py-3 px-3 min-w-[140px]">
                        <div className="font-medium text-slate-900 leading-snug">
                          {order.studentName}
                        </div>
                        {order.phone && (
                          <div className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
                            {order.phone}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-xs text-slate-700 whitespace-nowrap">
                        {order.collectionPoint}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-xs font-medium text-slate-800">
                          {plan.shortLabel}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {order.preference} · {order.mealsServed} served
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-xs font-medium text-slate-900 tabular-nums whitespace-nowrap">
                        {formatINR(plan.price)}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onTogglePaid(order.id)}
                          title="Click to toggle payment status"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {isPaid ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                          )}
                          {order.paymentStatus}
                        </button>
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span
                          className={`font-mono text-sm font-semibold tabular-nums ${
                            isCompleted ? 'text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {order.mealsRemaining}
                        </span>
                        <span className="text-xs text-slate-400 font-mono tabular-nums">
                          /{order.totalCredits}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span
                          className={`font-mono text-sm font-medium tabular-nums ${
                            order.pausedCredits > 0 ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {order.pausedCredits}
                        </span>
                      </td>

                      <td className="py-3 pl-3 pr-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onServeMeal(order.id)}
                            disabled={isCompleted}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
                          >
                            <Utensils className="w-3 h-3" aria-hidden="true" />
                            Serve (-1)
                          </button>

                          <button
                            type="button"
                            onClick={() => onPauseMeal(order.id)}
                            disabled={isCompleted}
                            title="Log advance pause before cutoff to preserve meal credit"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
                          >
                            <PauseCircle className="w-3 h-3 text-slate-500" aria-hidden="true" />
                            Pause (+1)
                          </button>

                          {isConfirmingDelete ? (
                            <div className="inline-flex items-center gap-1 ml-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteOrder(order.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2 py-1.5 text-xs font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(order.id)}
                              aria-label={`Delete order for ${order.studentName}`}
                              title="Delete order"
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card List */}
          <div className="lg:hidden divide-y divide-slate-200">
            {filteredOrders.map((order) => {
              const plan = PLANS[order.planId];
              const isPaid = order.paymentStatus === 'Paid via UPI';
              const isCompleted = order.mealsRemaining === 0;
              const isConfirmingDelete = confirmDeleteId === order.id;

              return (
                <div key={order.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">
                        {order.studentName}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {formatShortDate(order.date)} · {order.collectionPoint}
                        {order.phone ? ` · ${order.phone}` : ''}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                        {formatINR(plan.price)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {plan.shortLabel} · {order.preference}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onTogglePaid(order.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                      )}
                      {order.paymentStatus}
                    </button>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-600">
                        Remaining:{' '}
                        <strong className="font-mono text-slate-900 tabular-nums">
                          {order.mealsRemaining}/{order.totalCredits}
                        </strong>
                      </span>
                      <span className="text-slate-600">
                        Paused:{' '}
                        <strong className="font-mono text-emerald-700 tabular-nums">
                          {order.pausedCredits}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onServeMeal(order.id)}
                      disabled={isCompleted}
                      className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 px-3 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <Utensils className="w-3.5 h-3.5" aria-hidden="true" />
                      Serve Meal (-1)
                    </button>
                    <button
                      type="button"
                      onClick={() => onPauseMeal(order.id)}
                      disabled={isCompleted}
                      className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400"
                    >
                      <PauseCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      Pause (+1 Credit)
                    </button>
                    {isConfirmingDelete ? (
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteOrder(order.id);
                          setConfirmDeleteId(null);
                        }}
                        className="h-10 px-3 text-xs font-medium text-white bg-rose-600 rounded-lg"
                      >
                        Confirm
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(order.id)}
                        aria-label={`Delete order for ${order.studentName}`}
                        className="h-10 w-10 inline-flex items-center justify-center text-slate-400 hover:text-rose-600 border border-slate-200 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
