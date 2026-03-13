import React, { useState, useEffect } from "react";
import { useAppContext } from "../store";
import { useNavigate } from "react-router-dom";
import { generateDietPlan } from "../api/gemini";
import { Loader2, ChefHat, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";

export default function GeneratePlan() {
  const { userProfile, familyMembers, location, savePlan, setCurrentPlan } =
    useAppContext();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [planType, setPlanType] = useState<"single" | "daily" | "weekly">(
    "daily",
  );
  const [preferences, setPreferences] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          // Slow down progress as it gets closer to 90%
          const increment = prev < 50 ? 2 : prev < 80 ? 1 : 0.2;
          return prev >= 90 ? 90 : prev + increment;
        });
      }, 100);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = async () => {
    if (!userProfile) {
      setError(t("generate.profileRequiredDesc"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const plan = await generateDietPlan(
        userProfile,
        familyMembers,
        location,
        planType,
        preferences,
        i18n.language
      );
      setProgress(100);
      
      // Small delay to show 100% before navigating
      setTimeout(() => {
        savePlan(plan);
        setCurrentPlan(plan);
        navigate(`/plans/${plan.id}`);
      }, 400);
    } catch (err: any) {
      console.error(err);
      setError(err.message || t("generate.error"));
      setIsLoading(false);
    }
  };

    if (!userProfile) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12 glass-panel rounded-xl p-10 fresh-border max-w-2xl mx-auto"
        >
          <h2 className="text-2xl font-display font-bold text-slate-800 mb-4 tracking-wider">
            {t("generate.profileRequired")}
          </h2>
          <p className="text-slate-500 mb-8">
            {t("generate.profileRequiredDesc")}
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-6 py-3 rounded-lg font-medium hover:bg-emerald-500/20 transition-all shadow-sm uppercase tracking-wider text-sm"
          >
            {t("generate.goToProfile")}
          </button>
        </motion.div>
      );
    }

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto relative"
      >
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl p-8"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg border border-emerald-200"
              >
                <ChefHat size={40} />
              </motion.div>
              <h3 className="text-2xl font-display font-bold text-slate-800 mb-2 tracking-wider">
                {t("generate.generating")}
              </h3>
              <p className="text-slate-500 flex items-center gap-2 mb-8">
                <Loader2 className="animate-spin" size={16} />
                AI is crafting your perfect menu...
              </p>
              
              {/* Progress Bar */}
              <div className="w-full max-w-xs bg-slate-200 rounded-full h-2.5 mb-2 overflow-hidden">
                <motion.div 
                  className="bg-emerald-500 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.1 }}
                />
              </div>
              <p className="text-xs text-emerald-600 font-mono font-medium">
                {Math.round(progress)}%
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mb-10 relative">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-500/20 shadow-sm">
            <ChefHat size={32} />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-wider text-slate-800 fresh-text">
            {t("generate.title")}
          </h1>
          <p className="text-slate-500 mt-3">
            {t("generate.desc", { count: familyMembers.length + 1 })}
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`glass-panel p-8 rounded-xl fresh-border space-y-8 transition-all ${isLoading ? 'opacity-50 pointer-events-none blur-sm' : ''}`}
        >
          <div>
            <label className="block text-sm font-semibold text-emerald-600 mb-4 uppercase tracking-wider">
              {t("generate.duration")}
            </label>
            <div className="grid grid-cols-3 gap-4">
              {(["single", "daily", "weekly"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setPlanType(type)}
                  className={`p-4 rounded-lg border text-center transition-all ${
                    planType === type
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                      : "border-slate-200 bg-white/60 text-slate-500 hover:border-emerald-500/30 hover:text-emerald-600"
                  }`}
                >
                  <span className="capitalize block text-lg mb-1 font-display tracking-wider">
                    {t(`generate.${type}`)}
                  </span>
                  <span className="text-xs font-normal opacity-80">
                    {t(`generate.${type}Desc`)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-emerald-600 mb-4 uppercase tracking-wider">
              {t("generate.cravings")}
            </label>
            <textarea
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder={t("generate.cravingsPlaceholder")}
              className="w-full p-4 bg-white/80 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none min-h-[120px] resize-none text-slate-800 placeholder-slate-400 transition-all"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-200">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-4 bg-emerald-600 text-white border border-emerald-500 rounded-lg font-bold text-lg hover:bg-emerald-700 transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={24} />{" "}
              {t("generate.generating")}
            </>
          ) : (
            <>
              <Sparkles size={24} /> {t("generate.generateBtn")}
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}
