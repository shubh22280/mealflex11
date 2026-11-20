import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { COLLECTION_POINTS, PLAN_LIST, PLANS } from '../data/ventureData';
import { MealOrder, MealPreference, PaymentStatus, PlanId } from '../types';
import { formatINR, getTodayISO } from '../utils/formatters';

interface QuickOrderFormProps {
  onAddOrder: (order: Omit<MealOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const PREFERENCES: MealPreference[] = ['Veg', 'Non-Veg', 'Jain'];
const PAYMENT_STATUSES: PaymentStatus[] = ['Paid via UPI', 'Pending'];

export function QuickOrderForm({ onAddOrder }: QuickOrderFormProps) {
  const [date, setDate] = useState<string>(getTodayISO);
  const [studentName, setStudentName] = useState<string>('');
  const [collectionPoint, setCollectionPoint] = useState<string>(COLLECTION_POINTS[0]);
  const [phone, setPhone] = useState<string>('');
  const [planId, setPlanId] = useState<PlanId>('plan_20');
  const [preference, setPreference] = useState<MealPreference>('Veg');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid via UPI');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const selectedPlan = PLANS[planId];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = studentName.trim();
    const trimmedPoint = collectionPoint.trim();

    if (!trimmedName) {
      setErrorMsg('Please enter the student name.');
      return;
    }
    if (!trimmedPoint) {
      setErrorMsg('Please specify a PG / Hostel or collection point.');
      return;
    }

    setErrorMsg('');

    onAddOrder({
      date: date || getTodayISO(),
      studentName: trimmedName,
      collectionPoint: trimmedPoint,
      phone: phone.trim(),
      planId,
      preference,
      paymentStatus,
      totalCredits: selectedPlan.credits,
      mealsServed: 0,
      mealsRemaining: selectedPlan.credits,
      pausedCredits: 0,
    });

    setStudentName('');
    setPhone('');
  };

  return (
    <section
      aria-labelledby="quick-entry-heading"
      className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h2 id="quick-entry-heading" className="text-base font-semibold text-slate-900">
            Quick Daily Order Entry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log a new student subscription, 5-meal paid trial, or single meal add-on.
          </p>
        </div>
        <p className="text-xs text-slate-500 font-mono tabular-nums">
          +{selectedPlan.credits} meal {selectedPlan.credits === 1 ? 'credit' : 'credits'} · Margin {formatINR(selectedPlan.margin)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date */}
          <div>
            <label htmlFor="order-date" className="block text-xs font-medium text-slate-700 mb-1.5">
              Order Date
            </label>
            <input
              id="order-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Student Name */}
          <div>
            <label htmlFor="student-name" className="block text-xs font-medium text-slate-700 mb-1.5">
              Student Name <span className="text-rose-600">*</span>
            </label>
            <input
              id="student-name"
              type="text"
              value={studentName}
              onChange={(e) => {
                setStudentName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g., Siddharth Verma"
              className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* PG / Collection Point */}
          <div>
            <label htmlFor="collection-point" className="block text-xs font-medium text-slate-700 mb-1.5">
              PG / Hostel & Collection Point <span className="text-rose-600">*</span>
            </label>
            <input
              id="collection-point"
              type="text"
              list="dbs-collection-points"
              value={collectionPoint}
              onChange={(e) => {
                setCollectionPoint(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Campus Gate, PG Zone A..."
              className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
            <datalist id="dbs-collection-points">
              {COLLECTION_POINTS.map((pt) => (
                <option key={pt} value={pt} />
              ))}
            </datalist>
          </div>

          {/* Phone / WhatsApp */}
          <div>
            <label htmlFor="student-phone" className="block text-xs font-medium text-slate-700 mb-1.5">
              Phone / WhatsApp <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              id="student-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., 98765 43210"
              className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 font-mono tabular-nums focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Second row: Plan, Preference, Payment Status, Submit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          {/* Plan Type */}
          <div className="lg:col-span-4">
            <label htmlFor="plan-type" className="block text-xs font-medium text-slate-700 mb-1.5">
              Plan Type
            </label>
            <select
              id="plan-type"
              value={planId}
              onChange={(e) => setPlanId(e.target.value as PlanId)}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            >
              {PLAN_LIST.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.dropdownLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Meal Preference */}
          <div className="lg:col-span-3">
            <span className="block text-xs font-medium text-slate-700 mb-1.5">
              Meal Preference
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg h-10">
              {PREFERENCES.map((pref) => (
                <button
                  key={pref}
                  type="button"
                  onClick={() => setPreference(pref)}
                  className={`text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    preference === pref
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Status */}
          <div className="lg:col-span-3">
            <span className="block text-xs font-medium text-slate-700 mb-1.5">
              Payment Status
            </span>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg h-10">
              {PAYMENT_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setPaymentStatus(status)}
                  className={`text-xs font-medium rounded-md transition-colors whitespace-nowrap px-2 ${
                    paymentStatus === status
                      ? status === 'Paid via UPI'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-amber-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status === 'Paid via UPI' ? 'Paid via UPI' : 'Pending'}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="lg:col-span-2">
            <button
              type="submit"
              className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-4 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Log Order
            </button>
          </div>
        </div>

        {/* Quick Collection Point Presets */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 mr-1">Quick drop points:</span>
            {COLLECTION_POINTS.map((pt) => (
              <button
                key={pt}
                type="button"
                onClick={() => setCollectionPoint(pt)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors whitespace-nowrap ${
                  collectionPoint === pt
                    ? 'bg-emerald-50 text-emerald-800 font-medium border border-emerald-200'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {pt}
              </button>
            ))}
          </div>

          {errorMsg && (
            <p role="alert" className="text-xs font-medium text-rose-600">
              {errorMsg}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
