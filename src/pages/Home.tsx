import React from "react";
import { useAppContext } from "../store";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Plus, Calendar, MapPin, Users, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

export default function Home() {
  const { userProfile, familyMembers, location, savedPlans } = useAppContext();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!userProfile) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4"
      >
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8 border border-slate-200 bg-white/50 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50 to-transparent opacity-50"></div>
          <Sparkles size={32} className="text-emerald-700 relative z-10" strokeWidth={1.5} />
        </div>
        <h1 className="text-5xl md:text-6xl font-serif text-slate-900 mb-6 tracking-tight leading-tight">
          {t("home.welcome")}
        </h1>
        <p className="text-lg text-slate-500 max-w-lg mb-10 font-light leading-relaxed">
          {t("home.welcomeDesc")}
        </p>
        <Link
          to="/profile"
          className="group relative inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-3 text-sm tracking-widest uppercase">
            {t("home.setupProfile")} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </Link>
      </motion.div>
    );
  }

  const latestPlan = savedPlans[0];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-12 pb-12"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200/60 pb-8">
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight"
          >
            {t("home.hello")},{" "}
            <span className="italic text-emerald-800">{userProfile.name}</span>.
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 text-slate-500"
          >
            {location && location.city && (
              <span className="flex items-center gap-2 text-xs tracking-widest uppercase font-medium">
                <MapPin size={14} className="text-emerald-700" />
                {location.city}, {location.region}
              </span>
            )}
            <span className="w-1 h-1 rounded-full bg-slate-300 hidden md:block"></span>
            <span className="flex items-center gap-2 text-xs tracking-widest uppercase font-medium">
              <Users size={14} className="text-emerald-700" />
              {familyMembers.length + 1} {t("home.people")}
            </span>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link
            to="/generate"
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-md hover:shadow-lg gap-2 text-xs font-medium tracking-widest uppercase"
          >
            <Plus size={16} /> {t("nav.newPlan")}
          </Link>
        </motion.div>
      </header>

      {latestPlan ? (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-400 tracking-widest uppercase">
              {t("home.latestPlan")}
            </h2>
            <Link
              to="/plans"
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold uppercase tracking-widest transition-colors flex items-center gap-1"
            >
              {t("home.viewAll")} <ArrowRight size={14} />
            </Link>
          </div>

          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-white rounded-2xl p-8 md:p-10 border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
            onClick={() => navigate(`/plans/${latestPlan.id}`)}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-10">
                <div className="space-y-3">
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase tracking-widest">
                    {latestPlan.type}
                  </span>
                  <h3 className="text-3xl font-serif text-slate-900 group-hover:text-emerald-800 transition-colors leading-tight">
                    {latestPlan.title}
                  </h3>
                  <p className="text-sm text-slate-500 flex items-center gap-2 font-mono">
                    <Calendar size={14} className="text-slate-400" />
                    {new Date(latestPlan.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestPlan.days[0]?.meals.slice(0, 3).map((meal, idx) => (
                  <div
                    key={idx}
                    className="group/meal relative"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-emerald-100 group-hover/meal:bg-emerald-500 transition-colors"></div>
                    <div className="pl-5 py-1">
                      <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-2">
                        {meal.type}
                      </div>
                      <h4 className="font-medium text-slate-900 mb-2 leading-snug">
                        {meal.name}
                      </h4>
                      <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          {meal.calories} {t("home.kcal")}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          {meal.prepTime} {t("home.min")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.section>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <Calendar size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-serif text-slate-900 mb-3">
              {t("home.noPlans")}
            </h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto font-light">
              {t("home.noPlansDesc")}
            </p>
            <Link
              to="/generate"
              className="inline-flex items-center justify-center px-8 py-4 bg-emerald-800 text-white rounded-full hover:bg-emerald-900 transition-all shadow-md hover:shadow-lg gap-3 text-xs font-medium tracking-widest uppercase"
            >
              <Sparkles size={16} /> {t("home.generatePlan")}
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
