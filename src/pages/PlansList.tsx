import React, { useState } from "react";
import { useAppContext } from "../store";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, Utensils, Trash2, CheckSquare, Square } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

export default function PlansList() {
  const { savedPlans, deletePlans } = useAppContext();
  const { t } = useTranslation();
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds(new Set());
  };

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const confirmBatchDelete = () => {
    if (selectedIds.size === 0) return;
    setShowDeleteConfirm(true);
  };

  const handleBatchDelete = () => {
    deletePlans(Array.from(selectedIds));
    setIsSelectionMode(false);
    setSelectedIds(new Set());
    setShowDeleteConfirm(false);
  };

  if (savedPlans.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 glass-panel rounded-xl p-10 fresh-border max-w-2xl mx-auto"
      >
        <div className="w-24 h-24 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20 shadow-sm">
          <Calendar size={48} />
        </div>
        <h1 className="text-3xl font-display font-bold tracking-wider text-slate-800 fresh-text">
          {t("plans.noPlans")}
        </h1>
        <p className="text-lg text-slate-500 max-w-md">
          {t("plans.noPlansDesc")}
        </p>
        <Link
          to="/generate"
          className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-medium rounded-lg hover:bg-emerald-500/20 transition-all gap-2 shadow-sm uppercase tracking-wider text-sm"
        >
          {t("plans.generateFirst")} <ArrowRight size={18} />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      <header className="flex items-center justify-between glass-panel p-6 rounded-xl fresh-border">
        <h1 className="text-3xl font-display font-bold tracking-wider text-slate-800 fresh-text">
          {t("plans.title")}
        </h1>
        <div className="flex items-center gap-3">
          {isSelectionMode ? (
            <>
              <button
                onClick={toggleSelectionMode}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium text-sm uppercase tracking-wider transition-colors"
              >
                {t("plans.cancel")}
              </button>
              <button
                onClick={confirmBatchDelete}
                disabled={selectedIds.size === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm uppercase tracking-wider transition-all shadow-sm ${
                  selectedIds.size > 0 
                    ? "bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20" 
                    : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                }`}
              >
                <Trash2 size={16} />
                {t("plans.batchDelete")} ({selectedIds.size})
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleSelectionMode}
                className="px-4 py-2 text-slate-500 hover:text-emerald-600 font-medium text-sm uppercase tracking-wider transition-colors"
              >
                {t("plans.select")}
              </button>
              <Link
                to="/generate"
                className="inline-flex items-center justify-center px-4 py-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-medium rounded-lg hover:bg-emerald-500/20 transition-all gap-2 text-sm uppercase tracking-wider shadow-sm"
              >
                {t("plans.newPlan")}
              </Link>
            </>
          )}
        </div>
      </header>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {t("plans.deleteConfirm")}
            </h3>
            <p className="text-slate-500 mb-6">
              {t("plan.cannotUndo", "This action cannot be undone.")}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                {t("plans.cancel")}
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors shadow-sm"
              >
                {t("plans.batchDelete")}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {savedPlans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: isSelectionMode ? 1 : 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative"
          >
            {isSelectionMode && (
              <button
                onClick={(e) => toggleSelection(plan.id, e)}
                className="absolute top-4 right-4 z-10 p-2 text-emerald-600 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-emerald-100 hover:bg-white transition-colors"
              >
                {selectedIds.has(plan.id) ? (
                  <CheckSquare size={24} className="text-emerald-600" />
                ) : (
                  <Square size={24} className="text-slate-300" />
                )}
              </button>
            )}
            
            <Link
              to={isSelectionMode ? "#" : `/plans/${plan.id}`}
              onClick={(e) => isSelectionMode && toggleSelection(plan.id, e)}
              className={`group glass-panel rounded-xl p-6 fresh-border transition-all block h-full ${
                isSelectionMode 
                  ? selectedIds.has(plan.id) 
                    ? "border-emerald-500/50 bg-emerald-50/30 shadow-md ring-2 ring-emerald-500/20" 
                    : "cursor-pointer hover:border-emerald-500/30"
                  : "hover:border-emerald-500/30 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
              <div className={isSelectionMode ? "pr-10" : ""}>
                <h3 className="text-xl font-display font-bold text-slate-800 group-hover:text-emerald-600 transition-colors tracking-wider">
                  {plan.title}
                </h3>
                <p className="text-sm text-slate-500 flex items-center gap-2 mt-2 font-mono">
                  <Calendar size={14} className="text-emerald-600" />
                  {new Date(plan.createdAt).toLocaleDateString()}
                </p>
              </div>
              {!isSelectionMode && (
                <span className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-600 text-xs font-bold rounded-lg uppercase tracking-widest shadow-sm">
                  {plan.type}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mt-6 text-sm text-slate-600 bg-white/60 p-4 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <Utensils size={16} className="text-emerald-600" />
                <span className="font-mono font-medium">
                  {plan.days.reduce((acc, day) => acc + day.meals.length, 0)}{" "}
                  {t("plans.meals")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-teal-600" />
                <span className="font-mono font-medium">
                  {plan.days.length} {t("plans.days")}
                </span>
              </div>
            </div>
          </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
