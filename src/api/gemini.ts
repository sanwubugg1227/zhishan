import { UserProfile, FamilyMember, LocationData, DietPlan } from "../types";

export async function generateDietPlan(
  user: UserProfile,
  family: FamilyMember[],
  location: LocationData | null,
  planType: "single" | "daily" | "weekly",
  preferences: string,
  language: string = "en",
): Promise<DietPlan> {
  
  // 向本地 Node.js 后端发起请求
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user,
      family,
      location,
      planType,
      preferences,
      language
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate plan');
  }

  const data = await response.json();

  return {
    id: crypto.randomUUID(),
    title: data.title || (language === 'zh' ? "您的专属饮食计划" : "Your Custom Diet Plan"),
    createdAt: new Date().toISOString(),
    type: planType,
    days: data.days || [],
  };
}