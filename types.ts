export type PlanId = 'plan_20' | 'plan_5' | 'plan_1';

export type MealPreference = 'Veg' | 'Non-Veg' | 'Jain';

export type PaymentStatus = 'Paid via UPI' | 'Pending';

export type WorkspaceView = 'operations' | 'kitchen' | 'economics';

export interface MealPlan {
  id: PlanId;
  name: string;
  shortLabel: string;
  dropdownLabel: string;
  price: number;
  credits: number;
  variableCostPerMeal: number;
  totalVariableCost: number;
  margin: number;
}

export interface MealOrder {
  id: string;
  date: string; // YYYY-MM-DD
  studentName: string;
  collectionPoint: string;
  phone: string;
  planId: PlanId;
  preference: MealPreference;
  paymentStatus: PaymentStatus;
  totalCredits: number;
  mealsServed: number;
  mealsRemaining: number;
  pausedCredits: number;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyTargets {
  activeSubscribers: number;
  monthlyRevenue: number;
  mealsServed: number;
  monthlyFixedCost: number;
}

export interface MonthlyMetrics {
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  totalVariableCost: number;
  contributionMargin: number;
  netProfitLoss: number;
  activeSubscribersCount: number;
  monthlySubsCount: number;
  trialSubsCount: number;
  singleOrdersCount: number;
  totalMealsServed: number;
  totalMealsRemaining: number;
  totalActivePauseCredits: number;
  totalPausesLogged: number;
}

export interface PilotWeekMilestone {
  week: string;
  focus: string;
  action: string;
  target: string;
  metric: string;
  learningQuestion: string;
}
