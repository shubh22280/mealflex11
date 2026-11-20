import { PLANS } from '../data/ventureData';
import { MealOrder, MonthlyMetrics, MonthlyTargets } from '../types';

export function formatINR(amount: number, showSign = false): string {
  const abs = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat('en-IN').format(abs);
  if (amount < 0) return `-₹${formatted}`;
  if (showSign && amount > 0) return `+₹${formatted}`;
  return `₹${formatted}`;
}

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCurrentMonthISO(): string {
  return getTodayISO().slice(0, 7);
}

export function formatMonthLabel(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number);
  if (!year || !month) return monthStr;
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export function computeMonthlyMetrics(
  orders: MealOrder[],
  targets: MonthlyTargets
): MonthlyMetrics {
  let totalRevenue = 0;
  let paidRevenue = 0;
  let pendingRevenue = 0;
  let totalVariableCost = 0;
  let totalMealsServed = 0;
  let totalMealsRemaining = 0;
  let totalActivePauseCredits = 0;
  let totalPausesLogged = 0;
  let singleOrdersCount = 0;

  const monthlyStudents = new Set<string>();
  const trialStudents = new Set<string>();
  const activePlanStudents = new Set<string>();

  for (const order of orders) {
    const plan = PLANS[order.planId];
    totalRevenue += plan.price;
    if (order.paymentStatus === 'Paid via UPI') {
      paidRevenue += plan.price;
    } else {
      pendingRevenue += plan.price;
    }
    totalVariableCost += plan.totalVariableCost;
    totalMealsServed += order.mealsServed;
    totalMealsRemaining += order.mealsRemaining;
    totalPausesLogged += order.pausedCredits;
    if (order.mealsRemaining > 0) {
      totalActivePauseCredits += order.pausedCredits;
    }

    const normalizedStudent = order.studentName.trim().toLowerCase() || order.id;
    if (order.planId === 'plan_20') {
      monthlyStudents.add(normalizedStudent);
      activePlanStudents.add(normalizedStudent);
    } else if (order.planId === 'plan_5') {
      trialStudents.add(normalizedStudent);
      activePlanStudents.add(normalizedStudent);
    } else {
      singleOrdersCount += 1;
    }
  }

  const contributionMargin = totalRevenue - totalVariableCost;
  const netProfitLoss = contributionMargin - targets.monthlyFixedCost;

  return {
    totalRevenue,
    paidRevenue,
    pendingRevenue,
    totalVariableCost,
    contributionMargin,
    netProfitLoss,
    activeSubscribersCount: activePlanStudents.size,
    monthlySubsCount: monthlyStudents.size,
    trialSubsCount: trialStudents.size,
    singleOrdersCount,
    totalMealsServed,
    totalMealsRemaining,
    totalActivePauseCredits,
    totalPausesLogged,
  };
}

export function exportOrdersToCSV(orders: MealOrder[], monthLabel: string): void {
  const headers = [
    'Order ID',
    'Date',
    'Student Name',
    'PG / Collection Point',
    'Phone / WhatsApp',
    'Plan',
    'Meal Preference',
    'Amount (INR)',
    'Variable Cost (INR)',
    'Margin (INR)',
    'Payment Status',
    'Total Credits',
    'Meals Served',
    'Meals Remaining',
    'Paused Credits',
  ];

  const escapeCsv = (val: string | number): string => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = orders.map((o) => {
    const plan = PLANS[o.planId];
    return [
      o.id,
      o.date,
      o.studentName,
      o.collectionPoint,
      o.phone || '',
      plan.name,
      o.preference,
      plan.price,
      plan.totalVariableCost,
      plan.margin,
      o.paymentStatus,
      o.totalCredits,
      o.mealsServed,
      o.mealsRemaining,
      o.pausedCredits,
    ]
      .map(escapeCsv)
      .join(',');
  });

  const csvContent = [headers.map(escapeCsv).join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeSlug = monthLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.href = url;
  link.setAttribute('download', `mealflex-orders-${safeSlug}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
