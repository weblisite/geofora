import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { POLAR_PLAN_IDS, PlanInfo, PLAN_INFO } from '@shared/polar-service';

interface PlanState {
  // The currently selected plan ID (during checkout flow)
  selectedPlanId: string | null;
  
  // Information about the selected plan (name, features, etc.)
  selectedPlanInfo: PlanInfo | null;
  
  // Actions
  selectPlan: (planId: string) => void;
  clearSelectedPlan: () => void;
}

/**
 * Store for managing plan selection during the checkout process
 * Persists the selection in localStorage so it survives page refreshes
 */
export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      selectedPlanId: null,
      selectedPlanInfo: null,
      
      selectPlan: (planId: string) => set(() => ({
        selectedPlanId: planId,
        selectedPlanInfo: PLAN_INFO[planId] || null,
      })),
      
      clearSelectedPlan: () => set(() => ({
        selectedPlanId: null,
        selectedPlanInfo: null,
      })),
    }),
    {
      name: 'plan-selection-storage',
    }
  )
);