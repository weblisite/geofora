/**
 * Simple store to maintain selected plan across the authentication flow
 */

// Plan types
export type PlanType = 'starter' | 'professional' | 'enterprise';

// Store for the current selected plan
let selectedPlan: PlanType | null = null;

export const planStore = {
  /**
   * Set the selected plan
   */
  setSelectedPlan: (plan: PlanType) => {
    selectedPlan = plan;
    // Also save to localStorage for persistence across page refreshes
    localStorage.setItem('selectedPlan', plan);
  },

  /**
   * Get the currently selected plan
   */
  getSelectedPlan: (): PlanType | null => {
    // If no plan in memory, try to retrieve from localStorage
    if (!selectedPlan) {
      const storedPlan = localStorage.getItem('selectedPlan');
      if (storedPlan && ['starter', 'professional', 'enterprise'].includes(storedPlan)) {
        selectedPlan = storedPlan as PlanType;
      }
    }
    return selectedPlan;
  },

  /**
   * Clear the selected plan
   */
  clearSelectedPlan: () => {
    selectedPlan = null;
    localStorage.removeItem('selectedPlan');
  }
};