import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { UserProfile, FamilyMember, LocationData, DietPlan } from "./types";

interface AppState {
  userProfile: UserProfile | null;
  familyMembers: FamilyMember[];
  location: LocationData | null;
  savedPlans: DietPlan[];
  currentPlan: DietPlan | null;
}

interface AppContextType extends AppState {
  updateUserProfile: (profile: UserProfile) => void;
  addFamilyMember: (member: FamilyMember) => void;
  removeFamilyMember: (id: string) => void;
  updateLocation: (location: LocationData) => void;
  savePlan: (plan: DietPlan) => void;
  setCurrentPlan: (plan: DietPlan | null) => void;
  deletePlan: (id: string) => void;
  deletePlans: (ids: string[]) => void;
}

const defaultState: AppState = {
  userProfile: null,
  familyMembers: [],
  location: null,
  savedPlans: [],
  currentPlan: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem("smartbite_state");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem("smartbite_state", JSON.stringify(state));
  }, [state]);

  const updateUserProfile = (profile: UserProfile) => {
    setState((prev) => ({ ...prev, userProfile: profile }));
  };

  const addFamilyMember = (member: FamilyMember) => {
    setState((prev) => ({
      ...prev,
      familyMembers: [...prev.familyMembers, member],
    }));
  };

  const removeFamilyMember = (id: string) => {
    setState((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((m) => m.id !== id),
    }));
  };

  const updateLocation = (location: LocationData) => {
    setState((prev) => ({ ...prev, location }));
  };

  const savePlan = (plan: DietPlan) => {
    setState((prev) => ({ ...prev, savedPlans: [plan, ...prev.savedPlans] }));
  };

  const setCurrentPlan = (plan: DietPlan | null) => {
    setState((prev) => ({ ...prev, currentPlan: plan }));
  };

  const deletePlan = (id: string) => {
    setState((prev) => ({
      ...prev,
      savedPlans: prev.savedPlans.filter((p) => p.id !== id),
      currentPlan: prev.currentPlan?.id === id ? null : prev.currentPlan,
    }));
  };

  const deletePlans = (ids: string[]) => {
    setState((prev) => ({
      ...prev,
      savedPlans: prev.savedPlans.filter((p) => !ids.includes(p.id)),
      currentPlan: prev.currentPlan && ids.includes(prev.currentPlan.id) ? null : prev.currentPlan,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        updateUserProfile,
        addFamilyMember,
        removeFamilyMember,
        updateLocation,
        savePlan,
        setCurrentPlan,
        deletePlan,
        deletePlans,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
