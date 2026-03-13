// 记得文件名现在是：api/generate.js
export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { user, family, location, planType, preferences, language } = req.body;

    // 从 Vercel 的环境变量中安全读取 Key
    const apiKey = process.env.SILICON_API_KEY;
    const baseUrl = process.env.SILICON_BASE_URL || "https://api.siliconflow.cn/v1/chat/completions";
    const modelName = process.env.SILICON_MODEL_NAME || "Qwen/Qwen2.5-7B-Instruct";

    if (!apiKey) {
      return res.status(500).json({ error: 'API Key not configured on server' });
    }

    const totalPeople = 1 + (family?.length || 0);

    let planInstruction = "";
    if (planType === "single") {
      planInstruction = "CRITICAL: You MUST generate EXACTLY 1 day, and that day MUST contain EXACTLY 1 meal.";
    } else if (planType === "daily") {
      planInstruction = "CRITICAL: You MUST generate EXACTLY 1 day, and that day MUST contain 3 or 4 meals (breakfast, lunch, dinner, snack).";
    } else if (planType === "weekly") {
      planInstruction = "CRITICAL: You MUST generate EXACTLY 7 days in the 'days' array. EVERY SINGLE DAY MUST contain at least 3 meals. TO SAVE TOKENS, KEEP DESCRIPTIONS VERY SHORT (1 sentence) AND INSTRUCTIONS CONCISE (max 2-3 short steps). Do not skip any days! I need a full 7-day plan.";
    }

    const prompt = `
      You are an expert nutritionist and chef. Create a personalized diet plan based on the following information:
      User Profile: Age: ${user.age}, Gender: ${user.gender}, Height: ${user.height}cm, Weight: ${user.weight}kg, Goal: ${user.goal}
      Family Members: ${family?.length || 0}
      Total Servings Needed: ${totalPeople}
      Plan Type: ${planType}
      Extra Preferences: ${preferences || "None"}
      IMPORTANT: Please generate all text content in ${language === "zh" ? "Chinese (Simplified)" : "English"}.
      ${planInstruction}
      CRITICAL INSTRUCTION: You MUST return ONLY a valid JSON object. Do NOT wrap it in markdown block like \`\`\`json. 
      The JSON MUST perfectly match this structure:
      {"title": "Plan title", "days": [{"date": "Day 1", "totalCalories": 2000, "meals": [{"id": "uuid", "name": "Dish", "type": "breakfast", "description": "desc", "ingredients": [{"name": "Ing", "amount": "100g", "isSeasonal": false, "isLocal": false}], "instructions": ["Step 1"], "calories": 500, "protein": 30, "carbs": 40, "fat": 15, "prepTime": 30, "servings": ${totalPeople}}]}]}
    `;

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: errorData.error?.message || 'API request failed' });
    }

    const data = await response.json();
    let responseText = data.choices[0]?.message?.content || "{}";

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }

    const parsedData = JSON.parse(responseText);
    return res.status(200).json(parsedData);

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}