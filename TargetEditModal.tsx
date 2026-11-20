import React, { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { DEFAULT_TARGETS } from '../data/ventureData';
import { MonthlyTargets } from '../types';
import { formatINR } from '../utils/formatters';

interface TargetEditModalProps {
  isOpen: boolean;
  targets: MonthlyTargets;
  onSave: (updated: MonthlyTargets) => void;
  onClose: () => void;
}

export function TargetEditModal({
  isOpen,
  targets,
  onSave,
  onClose,
}: TargetEditModalProps) {
  const [activeSubscribers, setActiveSubscribers] = useState<string>(
    String(targets.activeSubscribers)
  );
  const [monthlyRevenue, setMonthlyRevenue] = useState<string>(
    String(targets.monthlyRevenue)
  );
  const [mealsServed, setMealsServed] = useState<string>(
    String(targets.mealsServed)
  );
  const [monthlyFixedCost, setMonthlyFixedCost] = useState<string>(
    String(targets.monthlyFixedCost)
  );

  useEffect(() => {
    if (isOpen) {
      setActiveSubscribers(String(targets.activeSubscribers));
      setMonthlyRevenue(String(targets.monthlyRevenue));
      setMealsServed(String(targets.mealsServed));
      setMonthlyFixedCost(String(targets.monthlyFixedCost));
    }
  }, [isOpen, targets]);

  if (!isOpen) return null;

  const subsNum = Math.max(1, Number(activeSubscribers) || 0);
  const revNum = Math.max(0, Number(monthlyRevenue) || 0);
  const mealsNum = Math.max(1, Number(mealsServed) || 0);
  const fixedNum = Math.max(0, Number(monthlyFixedCost) || 0);

  const handleAutoSyncFromSubscribers = () => {
    setMonthlyRevenue(String(subsNum * 1400));
    setMealsServed(String(subsNum * 20));
  };

  const handleResetDefaults = () => {
    setActiveSubscribers(String(DEFAULT_TARGETS.activeSubscribers));
    setMonthlyRevenue(String(DEFAULT_TARGETS.monthlyRevenue));
    setMealsServed(String(DEFAULT_TARGETS.mealsServed));
    setMonthlyFixedCost(String(DEFAULT_TARGETS.monthlyFixedCost));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      activeSubscribers: subsNum,
      monthlyRevenue: revNum,
      mealsServed: mealsNum,
      monthlyFixedCost: fixedNum,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-targets-title"
    >
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h3 id="edit-targets-title" className="text-base font-semibold text-slate-900">
              Edit Monthly Targets & Fixed Costs
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust goals for MealFlex monthly tracking.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="target-subscribers" className="text-xs font-medium text-slate-700">
                Target Active Subscribers (students/month)
              </label>
              <button
                type="button"
                onClick={handleAutoSyncFromSubscribers}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Auto-calc Rev & Meals (×₹1,400)
              </button>
            </div>
            <input
              id="target-subscribers"
              type="number"
              min={1}
              value={activeSubscribers}
              onChange={(e) => setActiveSubscribers(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg font-mono tabular-nums focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label htmlFor="target-revenue" className="block text-xs font-medium text-slate-700 mb-1.5">
              Target Monthly Revenue (₹)
            </label>
            <input
              id="target-revenue"
              type="number"
              min={0}
              step={50}
              value={monthlyRevenue}
              onChange={(e) => setMonthlyRevenue(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg font-mono tabular-nums focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label htmlFor="target-meals" className="block text-xs font-medium text-slate-700 mb-1.5">
              Target Meals Served (meals/month)
            </label>
            <input
              id="target-meals"
              type="number"
              min={1}
              value={mealsServed}
              onChange={(e) => setMealsServed(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg font-mono tabular-nums focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label htmlFor="target-fixed-cost" className="block text-xs font-medium text-slate-700 mb-1.5">
              Monthly Fixed Costs (₹)
            </label>
            <input
              id="target-fixed-cost"
              type="number"
              min={0}
              step={100}
              value={monthlyFixedCost}
              onChange={(e) => setMonthlyFixedCost(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg font-mono tabular-nums focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
            <p className="mt-1 text-xs text-slate-500">
              Break-even at ₹15/meal contribution: {Math.ceil(fixedNum / 15)} meals ({Math.ceil(fixedNum / 300)} monthly plans).
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 py-2"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset Defaults ({formatINR(DEFAULT_TARGETS.monthlyRevenue)})
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Save Targets
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
