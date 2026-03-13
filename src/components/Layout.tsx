import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, User, Salad, CalendarHeart, Globe } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

export default function Layout() {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const navItems = [
    { path: "/", icon: Home, label: t("nav.home") },
    { path: "/generate", icon: Salad, label: t("nav.newPlan") },
    { path: "/plans", icon: CalendarHeart, label: t("nav.myPlans") },
    { path: "/profile", icon: User, label: t("nav.profile") },
  ];

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "zh" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 flex flex-col font-sans">
      <header className="glass-panel sticky top-0 z-10 border-b border-emerald-500/10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="text-xl font-display font-bold tracking-wider text-slate-800">
              智膳
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 text-sm font-medium transition-all ${
                  location.pathname === item.path
                    ? "text-emerald-600 font-bold"
                    : "text-slate-500 hover:text-emerald-600"
                }`}
              >
                <item.icon size={18} />
                <span className="uppercase tracking-wider text-xs">
                  {item.label}
                </span>
              </Link>
            ))}

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 hover:text-emerald-600 transition-colors ml-4 border border-slate-200 hover:border-emerald-500/30 px-3 py-1.5 rounded-md bg-white/50"
            >
              <Globe size={14} />
              {i18n.language === "en" ? "中文" : "EN"}
            </button>
          </nav>

          {/* Mobile Lang Toggle */}
          <button
            onClick={toggleLanguage}
            className="md:hidden flex items-center justify-center text-emerald-600 p-2"
          >
            <Globe size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 pb-24 md:pb-8">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-emerald-500/10 pb-safe z-20">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
                location.pathname === item.path
                  ? "text-emerald-600 font-bold"
                  : "text-slate-400 font-medium"
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
