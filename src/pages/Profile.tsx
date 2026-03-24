import React, { useState, useEffect } from "react";
import { useAppContext } from "../store";
import { UserProfile, FamilyMember, LocationData } from "../types";
import { Save, Plus, Trash2, MapPin, Users, User, Locate, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

export default function Profile() {
  const {
    userProfile,
    familyMembers,
    location,
    updateUserProfile,
    addFamilyMember,
    removeFamilyMember,
    updateLocation,
  } = useAppContext();
  const { t } = useTranslation();

  const [profile, setProfile] = useState<Partial<UserProfile>>(
    userProfile || {
      name: "",
      age: 30,
      gender: "other",
      height: 170,
      weight: 70,
      activityLevel: "moderate",
      healthConditions: [],
      dietaryPreferences: [],
      allergies: [],
      goal: "healthy_eating",
    },
  );

  const [loc, setLoc] = useState<Partial<LocationData>>(
    location || { city: "", region: "", country: "" },
  );

  const [newMember, setNewMember] = useState<Partial<FamilyMember>>({
    name: "",
    age: 10,
    relation: "child",
    dietaryPreferences: [],
    allergies: [],
  });

  const [isLocating, setIsLocating] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);

  useEffect(() => {
    if (!loc.city && !loc.country) {
      handleDetectLocation();
    }
  }, []);

  // 🌍 纯净版：直接调用后端高德 API，并且会把真实报错弹出来
  const handleDetectLocation = async () => {
    setIsLocating(true);
    try {
      const response = await fetch("/api/location");
      const data = await response.json(); // 先解析高德传回来的数据
      
      // 如果后端返回了 400 或 500 错误，直接抛出真实的报错信息
      if (!response.ok) {
         throw new Error(data.error || "网络请求失败");
      }

      // 更新状态
      setLoc({
        city: data.city || "",
        region: data.region || "",
        country: data.country || "中国",
      });
      
    } catch (error: any) {
      console.error("Location API failed:", error);
      // 直接在页面上弹窗，告诉你到底哪里错了！
      alert("高德定位异常：" + (error.message || "未知错误"));
    } finally {
      setIsLocating(false);
    }
  };

  const handleSaveProfile = () => {
    if (!profile.name?.trim()) {
      setShowErrors(true);
      setSaveMessage({ type: "error", text: t("profile.nameRequired") });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }
    setShowErrors(false);
    updateUserProfile(profile as UserProfile);
    updateLocation(loc as LocationData);
    setSaveMessage({ type: "success", text: t("profile.saveSuccess") });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleAddMember = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!newMember.name || !newMember.name.trim()) {
      alert(t("profile.nameRequired"));
      return;
    }
    
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Date.now().toString() + Math.random().toString(36).substring(2);
      
    addFamilyMember({
      ...newMember,
      id: newId,
      dietaryPreferences: newMember.dietaryPreferences || [],
      allergies: newMember.allergies || [],
    } as FamilyMember);
    
    setNewMember({
      name: "",
      age: 10,
      relation: "child",
      dietaryPreferences: [],
      allergies: [],
    });
    
    setShowMemberForm(false);
    setSaveMessage({ type: "success", text: t("profile.saveSuccess") });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleArrayInput = (
    value: string,
    field: "healthConditions" | "dietaryPreferences" | "allergies",
    isFamily = false,
  ) => {
    const arr = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (isFamily) {
      setNewMember({ ...newMember, [field]: arr });
    } else {
      setProfile({ ...profile, [field]: arr });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto space-y-8 pb-12"
    >
      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-24 right-8 px-6 py-3 rounded-xl shadow-lg border backdrop-blur-md z-50 ${
            saveMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm"
              : "bg-red-50 border-red-200 text-red-600 shadow-sm"
          }`}
        >
          {saveMessage.text}
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold tracking-wider text-slate-800 fresh-text">
          {t("profile.title")}
        </h1>
        <button
          onClick={handleSaveProfile}
          className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-4 py-2 rounded-lg font-medium hover:bg-emerald-500/20 transition-all shadow-sm uppercase tracking-wider text-sm"
        >
          <Save size={18} /> {t("profile.save")}
        </button>
      </div>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-panel p-6 rounded-xl fresh-border"
      >
        <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2 text-slate-800 tracking-wider uppercase">
          <User className="text-emerald-600" /> {t("profile.personalInfo")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wider">
              {t("profile.name")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className={`w-full p-3 bg-white/80 border rounded-lg focus:ring-1 outline-none text-slate-800 transition-all ${
                showErrors && !profile.name?.trim()
                  ? "border-red-400 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
              }`}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wider">
                {t("profile.age")}
              </label>
              <input
                type="number"
                value={profile.age ?? ""}
                onChange={(e) =>
                  setProfile({ ...profile, age: e.target.value === "" ? undefined : Number(e.target.value) })
                }
                className="w-full p-3 bg-white/80 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wider">
                {t("profile.gender")}
              </label>
              <select
                value={profile.gender}
                onChange={(e) =>
                  setProfile({ ...profile, gender: e.target.value as any })
                }
                className="w-full p-3 bg-white/80 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 transition-all appearance-none"
              >
                <option value="male" className="bg-white">
                  {t("profile.male")}
                </option>
                <option value="female" className="bg-white">
                  {t("profile.female")}
                </option>
                <option value="other" className="bg-white">
                  {t("profile.other")}
                </option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wider">
                {t("profile.height")}
              </label>
              <input
                type="number"
                value={profile.height ?? ""}
                onChange={(e) =>
                  setProfile({ ...profile, height: e.target.value === "" ? undefined : Number(e.target.value) })
                }
                className="w-full p-3 bg-white/80 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wider">
                {t("profile.weight")}
              </label>
              <input
                type="number"
                value={profile.weight ?? ""}
                onChange={(e) =>
                  setProfile({ ...profile, weight: e.target.value === "" ? undefined : Number(e.target.value) })
                }
                className="w-full p-3 bg-white/80 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wider">
              {t("profile.activityLevel")}
            </label>
            <select
              value={profile.activityLevel}
              onChange={(e) =>
                setProfile({ ...profile, activityLevel: e.target.value as any })
              }
              className="w-full p-3 bg-white/80 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 transition-all appearance-none"
            >
              <option value="sedentary" className="bg-white">
                {t("profile.sedentary")}
              </option>
              <option value="light" className="bg-white">
                {t("profile.light")}
              </option>
              <option value="moderate" className="bg-white">
                {t("profile.moderate")}
              </option>
              <option value="active" className="bg-white">
                {t("profile.active")}
              </option>
              <option value="very_active" className="bg-white">
                {t("profile.veryActive")}
              </option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wider">
              {t("profile.goal")}
            </label>
            <select
              value={profile.goal}
              onChange={(e) =>
                setProfile({ ...profile, goal: e.target.value as any })
              }
              className="w-full p-3 bg-white/80 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 transition-all appearance-none"
            >
              <option value="lose_weight" className="bg-white">
                {t("profile.loseWeight")}
              </option>
              <option value="maintain" className="bg-white">
                {t("profile.maintain")}
              </option>
              <option value="gain_muscle" className="bg-white">
                {t("profile.gainMuscle")}
              </option>
              <option value="healthy_eating" className="bg-white">
                {t("profile.healthyEating")}
              </option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wider">
              {t("profile.healthConditions")}
            </label>
            <input
              type="text"
              value={profile.healthConditions?.join(", ")}
              onChange={(e) =>
                handleArrayInput(e.target.value, "healthConditions")
              }
              placeholder={t("profile.healthPlaceholder")}
              className="w-full p-3 bg-white/80 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 transition-all placeholder-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wider">
              {t("profile.dietaryPreferences")}
            </label>
            <input
              type="text"
              value={profile.dietaryPreferences?.join(", ")}
              onChange={(e) =>
                handleArrayInput(e.target.value, "dietaryPreferences")
              }
              placeholder={t("profile.dietPlaceholder")}
              className="w-full p-3 bg-white/80 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 transition-all placeholder-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wider">
              {t("profile.allergies")}
            </label>
            <input
              type="text"
              value={profile.allergies?.join(", ")}
              onChange={(e) => handleArrayInput(e.target.value, "allergies")}
              placeholder={t("profile.allergiesPlaceholder")}
              className="w-full p-3 bg-white/80 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 transition-all placeholder-slate-400"
            />
          </div>
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-panel p-6 rounded-xl fresh-border"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold flex items-center gap-2 text-slate-800 tracking-wider uppercase">
            <MapPin className="text-emerald-600" /> {t("profile.location")}
          </h2>
          <button
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="flex items-center gap-2 text-xs bg-teal-500/10 text-teal-600 border border-teal-500/20 px-3 py-1.5 rounded-lg font-medium hover:bg-teal-500/20 transition-all uppercase tracking-wider disabled:opacity-50"
          >
            {isLocating ? <Loader2 size={14} className="animate-spin" /> : <Locate size={14} />}
            {isLocating ? t("profile.locating") : t("profile.detectLocation")}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wider">
              {t("profile.city")}
            </label>
            <input
              type="text"
              value={loc.city}
              onChange={(e) => setLoc({ ...loc, city: e.target.value })}
              className="w-full p-3 bg-white/80 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wider">
              {t("profile.region")}
            </label>
            <input
              type="text"
              value={loc.region}
              onChange={(e) => setLoc({ ...loc, region: e.target.value })}
              className="w-full p-3 bg-white/80 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wider">
              {t("profile.country")}
            </label>
            <input
              type="text"
              value={loc.country}
              onChange={(e) => setLoc({ ...loc, country: e.target.value })}
              className="w-full p-3 bg-white/80 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 transition-all"
            />
          </div>
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-panel p-6 rounded-xl fresh-border"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold flex items-center gap-2 text-slate-800 tracking-wider uppercase">
            <Users className="text-emerald-600" /> {t("profile.familyMembers")}
          </h2>
          {!showMemberForm && (
            <button
              onClick={() => setShowMemberForm(true)}
              className="flex items-center gap-2 text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-500/20 transition-all uppercase tracking-wider"
            >
              <Plus size={14} /> {t("profile.addMember")}
            </button>
          )}
        </div>

        {familyMembers.length > 0 && (
          <div className="space-y-4 mb-8">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-white/60 rounded-lg border border-slate-100"
              >
                <div>
                  <h4 className="font-bold text-slate-800 tracking-wider">
                    {member.name}{" "}
                    <span className="text-sm font-normal text-slate-500 font-mono">
                      ({member.age}yo, {member.relation})
                    </span>
                  </h4>
                  {(member.dietaryPreferences.length > 0 ||
                    member.allergies.length > 0) && (
                    <p className="text-sm text-slate-500 mt-1">
                      {member.dietaryPreferences.length > 0 &&
                        `${t("profile.prefers")}: ${member.dietaryPreferences.join(", ")} `}
                      {member.allergies.length > 0 &&
                        `${t("profile.allergies")}: ${member.allergies.join(", ")}`}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeFamilyMember(member.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {showMemberForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-slate-50 p-5 rounded-xl border border-slate-200 border-dashed overflow-hidden"
          >
            <h3 className="text-sm font-semibold text-emerald-600 mb-4 uppercase tracking-wider">
              {t("profile.addMember")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <input
                  type="text"
                  placeholder={t("profile.name")}
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                  className="w-full p-3 bg-white/80 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 transition-all placeholder-slate-400"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder={t("profile.age")}
                  value={newMember.age ?? ""}
                  onChange={(e) =>
                    setNewMember({ ...newMember, age: e.target.value === "" ? undefined : Number(e.target.value) })
                  }
                  className="w-full p-3 bg-white/80 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 transition-all placeholder-slate-400"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder={t("profile.relation")}
                  value={newMember.relation}
                  onChange={(e) =>
                    setNewMember({ ...newMember, relation: e.target.value })
                  }
                  className="w-full p-3 bg-white/80 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 transition-all placeholder-slate-400"
                />
              </div>
              <div className="md:col-span-3 grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder={t("profile.dietPlaceholder")}
                  value={newMember.dietaryPreferences?.join(", ")}
                  onChange={(e) =>
                    handleArrayInput(e.target.value, "dietaryPreferences", true)
                  }
                  className="w-full p-3 bg-white/80 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 transition-all placeholder-slate-400"
                />
                <input
                  type="text"
                  placeholder={t("profile.allergiesPlaceholder")}
                  value={newMember.allergies?.join(", ")}
                  onChange={(e) =>
                    handleArrayInput(e.target.value, "allergies", true)
                  }
                  className="w-full p-3 bg-white/80 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 transition-all placeholder-slate-400"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddMember}
                className="flex-1 flex items-center justify-center gap-2 text-sm bg-emerald-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-emerald-600 transition-all uppercase tracking-wider"
              >
                <Save size={16} /> {t("profile.save")}
              </button>
              <button
                onClick={() => setShowMemberForm(false)}
                className="flex-1 flex items-center justify-center gap-2 text-sm bg-slate-200 text-slate-700 px-4 py-3 rounded-lg font-medium hover:bg-slate-300 transition-all uppercase tracking-wider"
              >
                {t("cancel", "Cancel")}
              </button>
            </div>
          </motion.div>
        )}
      </motion.section>
    </motion.div>
  );
}