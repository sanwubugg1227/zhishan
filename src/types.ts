export interface UserProfile {
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  height: number; // cm
  weight: number; // kg
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  healthConditions: string[];
  dietaryPreferences: string[];
  allergies: string[];
  goal: "lose_weight" | "maintain" | "gain_muscle" | "healthy_eating";
}

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  relation: string;
  dietaryPreferences: string[];
  allergies: string[];
}

export interface LocationData {
  city: string;
  region: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface Meal {
  id: string;
  name: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  description: string;
  ingredients: {
    name: string;
    amount: string;
    isSeasonal?: boolean;
    isLocal?: boolean;
  }[];
  instructions: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number; // minutes
  servings: number;
  imageUrl?: string;
}

export interface DailyPlan {
  date: string;
  meals: Meal[];
  totalCalories: number;
}

export interface DietPlan {
  id: string;
  title: string;
  createdAt: string;
  type: "single" | "daily" | "weekly";
  days: DailyPlan[];
}
