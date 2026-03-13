import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/generate", async (req, res) => {
    try {
      const {
        user,
        family,
        location,
        planType,
        preferences,
        language,
      } = req.body;

      console.log(`🚀 正在生成【${planType}】计划，由于需要生成大量数据，请耐心等待...`);

      // 初始化 SiliconFlow 客户端
      const openai = new OpenAI({
        apiKey: process.env.SILICON_API_KEY,
        baseURL: process.env.SILICON_BASE_URL, 
      });

      const totalPeople = 1 + (family?.length || 0);

      // 【防偷懒补丁 1】：根据用户选择，严厉警告大模型必须要生成多少天！并且要求精简字数防止断尾。
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
        
        User Profile:
        - Age: ${user.age}, Gender: ${user.gender}, Height: ${user.height}cm, Weight: ${user.weight}kg
        - Activity Level: ${user.activityLevel}
        - Goal: ${user.goal}
        
        Family Members (${family?.length || 0}):
        ${family?.map((f: any) => `- ${f.name} (${f.age}yo, ${f.relation})`).join("\n")}
        
        Total Servings Needed: ${totalPeople}
        Plan Type: ${planType} (single meal, full day, or full week)
        Extra Preferences: ${preferences || "None"}
        
        IMPORTANT: Please generate all text content in ${language === "zh" ? "Chinese (Simplified)" : "English"}.
        
        ${planInstruction}
        
        CRITICAL INSTRUCTION: You MUST return ONLY a valid JSON object. Do NOT wrap it in markdown block like \`\`\`json. 
        The JSON MUST perfectly match this structure:
        {
          "title": "A catchy title for the diet plan",
          "days": [
            {
              "date": "Day label (e.g., Day 1, Monday)",
              "totalCalories": 2000,
              "meals": [
                {
                  "id": "Unique string ID",
                  "name": "Name of the dish",
                  "type": "breakfast|lunch|dinner|snack",
                  "description": "Short description",
                  "ingredients": [
                    {
                      "name": "String",
                      "amount": "String",
                      "isSeasonal": false,
                      "isLocal": false
                    }
                  ],
                  "instructions": ["Step 1", "Step 2"],
                  "calories": 500,
                  "protein": 30,
                  "carbs": 40,
                  "fat": 15,
                  "prepTime": 30,
                  "servings": ${totalPeople}
                }
              ]
            }
            // 【防偷懒补丁 2】: IF planType is "weekly", you MUST output exactly 7 day objects in this array!!!
          ]
        }
      `;

      // 请求 API
      const response = await openai.chat.completions.create({
        // 这里也可以换成更聪明的 Qwen/Qwen2.5-32B-Instruct （如果 7B 偶尔还是不听话的话）
        model: "Qwen/Qwen2.5-7B-Instruct", 
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        // 【防截断补丁 3】：直接给到 8192 最大容量，保证能写完 7 天的完整 JSON
        max_tokens: 8192, 
      });

      let responseText = response.choices[0].message.content || "{}";
      
      // 提取 { 和 } 之间的 JSON 文本
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
      }

      console.log("✅ AI 返回结果解析成功！");
      const data = JSON.parse(responseText);
      res.json(data);
      
    } catch (error: any) {
      console.error("❌ 生成失败详情:", error);
      res.status(500).json({ error: error.message || "Failed to generate plan" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();