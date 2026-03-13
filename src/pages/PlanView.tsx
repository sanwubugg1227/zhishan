import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../store";
import {
  Clock,
  Flame,
  Users,
  Leaf,
  MapPin,
  ChevronLeft,
  Calendar,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

export default function PlanView() {
  const { id } = useParams();
  const { savedPlans, deletePlan } = useAppContext();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const plan = savedPlans.find((p) => p.id === id);
  const [activeDay, setActiveDay] = useState(0);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (!plan) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12 glass-panel rounded-xl p-10 fresh-border max-w-2xl mx-auto"
        >
          <h2 className="text-2xl font-display font-bold text-slate-800 mb-4 tracking-wider">
            {t("plan.notFound")}
          </h2>
          <button
            onClick={() => navigate("/plans")}
            className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-6 py-3 rounded-lg font-medium hover:bg-emerald-500/20 transition-all shadow-sm uppercase tracking-wider text-sm"
          >
            {t("plan.backToPlans")}
          </button>
        </motion.div>
      );
    }

    const confirmDelete = () => {
      setShowDeleteConfirm(true);
    };

    const handleDelete = () => {
      deletePlan(plan.id);
      navigate("/plans");
    };

    const currentDay = plan.days[activeDay];

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-8 pb-12"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 transition-colors font-medium text-sm uppercase tracking-wider"
          >
            <ChevronLeft size={16} /> {t("plan.back")}
          </button>
          
          <button
            onClick={confirmDelete}
            className="flex items-center gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm uppercase tracking-wider border border-transparent hover:border-red-200"
          >
            <Trash2 size={16} /> {t("plan.delete", "Delete")}
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {t("plan.deleteConfirm", "Are you sure you want to delete this plan?")}
              </h3>
              <p className="text-slate-500 mb-6">
                {t("plan.cannotUndo", "This action cannot be undone.")}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  {t("plans.cancel", "Cancel")}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors shadow-sm"
                >
                  {t("plan.delete", "Delete")}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <header className="glass-panel p-8 rounded-xl fresh-border">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold tracking-wider text-slate-800 fresh-text">
                {plan.title}
              </h1>
              <p className="text-slate-500 mt-2 flex items-center gap-2 font-mono text-sm">
                <Calendar size={16} className="text-emerald-600" />
                {new Date(plan.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className="px-4 py-2 bg-teal-500/10 border border-teal-500/20 text-teal-600 text-sm font-bold rounded-lg uppercase tracking-widest shadow-sm">
              {plan.type}
            </span>
          </div>
        </header>

        {plan.days.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {plan.days.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setActiveDay(idx)}
                className={`px-6 py-3 rounded-lg font-display tracking-wider whitespace-nowrap transition-all border ${
                  activeDay === idx
                    ? "bg-emerald-50 text-emerald-700 border-emerald-500 shadow-sm"
                    : "bg-white/60 text-slate-500 border-slate-200 hover:border-emerald-500/30 hover:text-emerald-600"
                }`}
              >
                {day.date}
              </button>
            ))}
          </div>
        )}

        {currentDay && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-display font-bold text-slate-800 tracking-wider">
                {currentDay.date}
              </h2>
              <span className="font-mono text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-sm">
                {currentDay.totalCalories} {t("plan.kcalPerPerson")}
              </span>
            </div>

            {currentDay.meals.map((meal) => (
              <div
                key={meal.id}
                className="glass-panel rounded-xl overflow-hidden fresh-border"
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2">
                        {meal.type}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800">
                        {meal.name}
                      </h3>
                      <p className="text-slate-500 mt-2 text-lg leading-relaxed">
                        {meal.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 md:justify-end shrink-0">
                      <span className="flex items-center gap-1.5 bg-white/60 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600">
                        <Clock size={16} className="text-emerald-600" />{" "}
                        {meal.prepTime}m
                      </span>
                      <span className="flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-lg text-sm font-medium text-teal-600">
                        <Flame size={16} className="text-teal-600" />{" "}
                        {meal.calories} {t("plan.cals")}
                      </span>
                      <span className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-lg text-sm font-medium text-sky-600">
                        <Users size={16} className="text-sky-600" />{" "}
                        {meal.servings} {t("plan.servings")}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/60 p-3 rounded-lg text-center border border-slate-100">
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-1">
                        {t("plan.protein")}
                      </div>
                      <div className="font-mono font-bold text-emerald-600">
                        {meal.protein}g
                      </div>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg text-center border border-slate-100">
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-1">
                        {t("plan.carbs")}
                      </div>
                      <div className="font-mono font-bold text-emerald-600">
                        {meal.carbs}g
                      </div>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg text-center border border-slate-100">
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-1">
                        {t("plan.fat")}
                      </div>
                      <div className="font-mono font-bold text-emerald-600">
                        {meal.fat}g
                      </div>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg text-center border border-slate-100">
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-1">
                        {t("plan.cals")}
                      </div>
                      <div className="font-mono font-bold text-teal-600">
                        {meal.calories}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-display font-bold text-slate-800 mb-4 tracking-wider uppercase">
                        {t("plan.ingredients")}
                      </h4>
                      <ul className="space-y-3">
                        {meal.ingredients.map((ing, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-slate-100 hover:border-emerald-500/30 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-700">
                                {ing.name}
                              </span>
                              {ing.isSeasonal && (
                                <span
                                  title={t("plan.seasonal")}
                                  className="text-emerald-500"
                                >
                                  <Leaf size={14} />
                                </span>
                              )}
                              {ing.isLocal && (
                                <span
                                  title={t("plan.local")}
                                  className="text-sky-500"
                                >
                                  <MapPin size={14} />
                                </span>
                              )}
                            </div>
                            <span className="text-emerald-600 font-mono text-sm">
                              {ing.amount}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-display font-bold text-slate-800 mb-4 tracking-wider uppercase">
                        {t("plan.instructions")}
                      </h4>
                      <ol className="space-y-4">
                        {meal.instructions.map((step, i) => (
                          <li key={i} className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg flex items-center justify-center font-mono font-bold text-sm shadow-sm">
                              {i + 1}
                            </span>
                            <p className="text-slate-600 pt-1 leading-relaxed">
                              {step}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>
    );
  }
