import { useEffect, useMemo, useState } from 'react';
import {
  ChefHat,
  Database,
  Download,
  LayoutDashboard,
  Menu,
  TrendingUp,
  Trash2,
  X,
} from 'lucide-react';
import { KitchenPrepView } from './components/KitchenPrepView';
import { KpiDashboard } from './components/KpiDashboard';
import { OrderLedgerTable } from './components/OrderLedgerTable';
import { QuickOrderForm } from './components/QuickOrderForm';
import { TargetEditModal } from './components/TargetEditModal';
import { VentureEconomicsView } from './components/VentureEconomicsView';
import {
  createSamplePilotOrders,
  DEFAULT_TARGETS,
  PLANS,
  VENTURE_INFO,
} from './data/ventureData';
import { MealOrder, MonthlyTargets, WorkspaceView } from './types';
import {
  computeMonthlyMetrics,
  exportOrdersToCSV,
  formatMonthLabel,
  getCurrentMonthISO,
  getTodayISO,
} from './utils/formatters';

const STORAGE_ORDERS_KEY = 'mealflex_orders_v1';
const STORAGE_TARGETS_KEY = 'mealflex_targets_v1';

function loadInitialOrders(): MealOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Fallback to sample pilot data if localStorage is unavailable or corrupted
  }
  const today = getTodayISO();
  const monthPrefix = today.slice(0, 7);
  const dayNum = Number(today.slice(8, 10)) || 15;
  return createSamplePilotOrders(monthPrefix, dayNum);
}

function loadInitialTargets(): MonthlyTargets {
  try {
    const raw = localStorage.getItem(STORAGE_TARGETS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.monthlyRevenue === 'number') {
        return { ...DEFAULT_TARGETS, ...parsed };
      }
    }
  } catch {
    // Fallback to default venture targets
  }
  return DEFAULT_TARGETS;
}

export default function App() {
  const [orders, setOrders] = useState<MealOrder[]>(loadInitialOrders);
  const [targets, setTargets] = useState<MonthlyTargets>(loadInitialTargets);
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthISO);
  const [activeView, setActiveView] = useState<WorkspaceView>('operations');
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // Ignore storage quota errors
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TARGETS_KEY, JSON.stringify(targets));
    } catch {
      // Ignore storage quota errors
    }
  }, [targets]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const monthlyOrders = useMemo(
    () => orders.filter((order) => order.date.startsWith(selectedMonth)),
    [orders, selectedMonth]
  );

  const metrics = useMemo(
    () => computeMonthlyMetrics(monthlyOrders, targets),
    [monthlyOrders, targets]
  );

  const monthLabel = useMemo(
    () => formatMonthLabel(selectedMonth),
    [selectedMonth]
  );

  const handleAddOrder = (
    newOrderData: Omit<MealOrder, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const nowIso = new Date().toISOString();
    const order: MealOrder = {
      ...newOrderData,
      id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setOrders((prev) => [order, ...prev]);

    const orderMonth = order.date.slice(0, 7);
    if (orderMonth && orderMonth !== selectedMonth) {
      setSelectedMonth(orderMonth);
    }

    const plan = PLANS[order.planId];
    showToast(
      `Added ${order.studentName} · ${plan.shortLabel} (+${order.totalCredits} meal credits)`
    );
  };

  const handleServeMeal = (id: string) => {
    let servedStudent = '';
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id || order.mealsRemaining <= 0) return order;
        servedStudent = order.studentName;
        return {
          ...order,
          mealsServed: order.mealsServed + 1,
          mealsRemaining: order.mealsRemaining - 1,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    if (servedStudent) {
      showToast(`Served 1 meal to ${servedStudent}`);
    }
  };

  const handlePauseMeal = (id: string) => {
    let pausedStudent = '';
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id || order.mealsRemaining <= 0) return order;
        pausedStudent = order.studentName;
        return {
          ...order,
          pausedCredits: order.pausedCredits + 1,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    if (pausedStudent) {
      showToast(`Pause credit (+1) preserved for ${pausedStudent}`);
    }
  };

  const handleTogglePaid = (id: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order;
        const nextStatus =
          order.paymentStatus === 'Paid via UPI' ? 'Pending' : 'Paid via UPI';
        showToast(`${order.studentName} marked as ${nextStatus}`);
        return {
          ...order,
          paymentStatus: nextStatus,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleDeleteOrder = (id: string) => {
    const target = orders.find((o) => o.id === id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
    if (target) {
      showToast(`Removed order for ${target.studentName}`);
    }
  };

  const handleLoadSampleData = () => {
    const today = getTodayISO();
    const currentMonth = today.slice(0, 7);
    const targetMonth = selectedMonth || currentMonth;
    const dayNum =
      targetMonth === currentMonth ? Number(today.slice(8, 10)) || 15 : 22;

    const sampleOrders = createSamplePilotOrders(targetMonth, dayNum).map(
      (o, idx) => ({
        ...o,
        id: `ord-sample-${targetMonth}-${idx + 1}-${Date.now().toString().slice(-4)}`,
      })
    );

    setOrders((prev) => {
      const otherMonths = prev.filter((o) => !o.date.startsWith(targetMonth));
      return [...sampleOrders, ...otherMonths];
    });
    showToast(`Loaded 6 DBS Global University PG pilot orders for ${formatMonthLabel(targetMonth)}`);
  };

  const handleClearAllData = () => {
    setOrders([]);
    setConfirmClearAll(false);
    showToast('Cleared all order records from local storage');
  };

  const handleExportCSV = () => {
    exportOrdersToCSV(monthlyOrders, monthLabel);
    showToast(`Exported ${monthlyOrders.length} orders to CSV`);
  };

  const navItems: { id: WorkspaceView; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'operations', label: 'Daily Operations', icon: LayoutDashboard },
    { id: 'kitchen', label: 'Kitchen & Cutoff', icon: ChefHat },
    { id: 'economics', label: 'Unit Economics', icon: TrendingUp },
  ];

  const viewTitle =
    activeView === 'operations'
      ? 'Operations Overview'
      : activeView === 'kitchen'
      ? 'Kitchen Prep & Dispatch'
      : 'Unit Economics & Pilot Plan';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Mobile Sidebar Backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                MealFlex
              </span>
              <p className="text-[11px] text-slate-500 leading-none mt-0.5 whitespace-nowrap">
                DBS Global University, Dehradun
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
              aria-label="Close navigation"
              className="p-1.5 text-slate-400 hover:text-slate-700 lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Workspace navigation" className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveView(item.id);
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                    aria-hidden="true"
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Venture Quick Reference */}
        <div className="p-4 border-t border-slate-200 space-y-3 text-xs">
          <div>
            <p className="font-medium text-slate-800">Active Plans & Margins</p>
            <div className="mt-1.5 space-y-1 text-slate-600 font-mono tabular-nums">
              <div className="flex justify-between">
                <span>20-Meal Sub</span>
                <span className="text-slate-900">₹1,400 (+₹300)</span>
              </div>
              <div className="flex justify-between">
                <span>5-Meal Trial</span>
                <span className="text-slate-900">₹350 (+₹75)</span>
              </div>
              <div className="flex justify-between">
                <span>Single Meal</span>
                <span className="text-slate-900">₹70 (+₹15)</span>
              </div>
            </div>
          </div>
          <div className="pt-2.5 border-t border-slate-100 text-slate-500">
            <p className="font-medium text-slate-700">Pause Cutoff Rules</p>
            <p className="mt-0.5 leading-relaxed">{VENTURE_INFO.dailyCutoff}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open navigation menu"
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm truncate">
              <span className="text-slate-400 hidden sm:inline">MealFlex</span>
              <span className="text-slate-300 hidden sm:inline" aria-hidden="true">
                /
              </span>
              <h1 className="font-semibold text-slate-900 truncate">{viewTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Month Picker */}
            <label htmlFor="month-selector" className="sr-only">
              Select Month
            </label>
            <input
              id="month-selector"
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                if (e.target.value) setSelectedMonth(e.target.value);
              }}
              className="h-9 px-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
            />

            {/* Load Sample Pilot Data */}
            <button
              type="button"
              onClick={handleLoadSampleData}
              className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              Load Sample Pilot Data
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={monthlyOrders.length === 0}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-500 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Clear All Data with inline confirm */}
            {confirmClearAll ? (
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClearAllData}
                  className="h-9 px-2.5 text-xs font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 whitespace-nowrap"
                >
                  Confirm Clear
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(false)}
                  className="h-9 px-2.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClearAll(true)}
                disabled={orders.length === 0}
                title="Clear all stored orders"
                className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:text-rose-700 hover:border-rose-200 hover:bg-rose-50 disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                Clear All Data
              </button>
            )}
          </div>
        </header>

        {/* Mobile Secondary Action Strip */}
        <div className="md:hidden px-4 py-2 bg-white border-b border-slate-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleLoadSampleData}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md"
          >
            <Database className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            Load Sample Data
          </button>
          <button
            type="button"
            onClick={() => setConfirmClearAll((v) => !v)}
            disabled={orders.length === 0}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            Clear All
          </button>
        </div>

        {/* Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1400px] w-full mx-auto space-y-6">
          {activeView === 'operations' && (
            <>
              <KpiDashboard
                metrics={metrics}
                targets={targets}
                monthLabel={monthLabel}
                onEditTargets={() => setIsTargetModalOpen(true)}
              />
              <QuickOrderForm onAddOrder={handleAddOrder} />
              <OrderLedgerTable
                orders={monthlyOrders}
                monthLabel={monthLabel}
                onServeMeal={handleServeMeal}
                onPauseMeal={handlePauseMeal}
                onTogglePaid={handleTogglePaid}
                onDeleteOrder={handleDeleteOrder}
                onLoadSampleData={handleLoadSampleData}
              />
            </>
          )}

          {activeView === 'kitchen' && (
            <KitchenPrepView
              orders={monthlyOrders}
              monthLabel={monthLabel}
              onTogglePaid={handleTogglePaid}
            />
          )}

          {activeView === 'economics' && (
            <VentureEconomicsView
              metrics={metrics}
              targets={targets}
              monthLabel={monthLabel}
            />
          )}
        </main>
      </div>

      {/* Edit Monthly Targets Modal */}
      <TargetEditModal
        isOpen={isTargetModalOpen}
        targets={targets}
        onSave={(updated) => {
          setTargets(updated);
          showToast('Monthly targets updated');
        }}
        onClose={() => setIsTargetModalOpen(false)}
      />

      {/* Non-intrusive Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-lg"
        >
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
