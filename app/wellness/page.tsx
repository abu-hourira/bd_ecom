"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  Scale,
  Flame,
  Droplets,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Leaf,
} from "lucide-react";
import StorefrontHeader from "@/components/storefront/Header";
import StorefrontFooter from "@/components/storefront/Footer";

export default function WellnessPage() {
  // BMI States
  const [heightCm, setHeightCm] = useState<number | "">("");
  const [weightKg, setWeightKg] = useState<number | "">("");
  const [bmiResult, setBmiResult] = useState<{
    bmi: number;
    category: string;
    color: string;
  } | null>(null);

  // Calorie States
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activity, setActivity] = useState<string>("moderate");
  const [calories, setCalories] = useState<number | null>(null);

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heightCm || !weightKg || Number(heightCm) <= 0 || Number(weightKg) <= 0) return;

    const heightM = Number(heightCm) / 100;
    const bmi = Number((Number(weightKg) / (heightM * heightM)).toFixed(1));

    let category = "Normal weight";
    let color = "text-emerald-600";

    if (bmi < 18.5) {
      category = "Underweight";
      color = "text-amber-600";
    } else if (bmi >= 25 && bmi < 30) {
      category = "Overweight";
      color = "text-amber-700";
    } else if (bmi >= 30) {
      category = "Obesity";
      color = "text-rose-600";
    }

    setBmiResult({ bmi, category, color });
  };

  const calculateCalories = (e: React.FormEvent) => {
    e.preventDefault();
    if (!age || !heightCm || !weightKg || Number(age) <= 0 || Number(heightCm) <= 0 || Number(weightKg) <= 0) return;

    // Mifflin-St Jeor Formula
    let bmr = 10 * Number(weightKg) + 6.25 * Number(heightCm) - 5 * Number(age);
    if (gender === "male") bmr += 5;
    else bmr -= 161;

    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
    };

    const tdee = Math.round(bmr * (multipliers[activity] || 1.55));
    setCalories(tdee);
  };

  const waterIntake = weightKg ? (Number(weightKg) * 0.033).toFixed(1) : "2.5";

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between">
      <StorefrontHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        {/* Top Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-forest-soft text-forest mx-auto flex items-center justify-center shadow-card">
            <Heart className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-ink">
            Organic Living & Wellness Calculators
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
            Calculate your general wellness metrics and discover clean organic pantry recommendations.
          </p>
        </div>

        {/* Mandatory Health Disclaimer Notice */}
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3.5 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong>General Wellness Disclaimer:</strong>
            <p className="leading-relaxed text-amber-800/90">
              These self-assessment wellness calculators are provided for general informational purposes only. Results do not constitute medical advice or diagnosis. Always consult a certified physician or healthcare professional before altering your dietary or health regimen.
            </p>
          </div>
        </div>

        {/* 2-Column Calculators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Tool 1: BMI Calculator */}
          <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
            <h3 className="font-bold font-display text-lg text-ink flex items-center gap-2 border-b border-line pb-3">
              <Scale className="w-5 h-5 text-forest" />
              <span>Body Mass Index (BMI)</span>
            </h3>

            <form onSubmit={calculateBMI} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-ink">Height (cm)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 175"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-ink">Weight (kg)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 70"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-forest text-white font-semibold text-xs shadow-xs hover:bg-forest-deep transition-colors"
              >
                Calculate BMI
              </button>
            </form>

            {bmiResult && (
              <div className="p-4 rounded-2xl bg-bg border border-line text-center space-y-1 animate-in fade-in">
                <div className="text-xs text-ink-soft">Your Calculated BMI:</div>
                <div className="text-3xl font-bold font-display font-mono text-forest">
                  {bmiResult.bmi}
                </div>
                <div className={`text-xs font-bold ${bmiResult.color}`}>
                  Category: {bmiResult.category}
                </div>
              </div>
            )}
          </div>

          {/* Tool 2: Calorie Needs & Water Intake */}
          <div className="bg-paper p-6 sm:p-8 rounded-3xl border border-line shadow-card space-y-6">
            <h3 className="font-bold font-display text-lg text-ink flex items-center gap-2 border-b border-line pb-3">
              <Flame className="w-5 h-5 text-accent" />
              <span>Daily Calorie & Hydration Goal</span>
            </h3>

            <form onSubmit={calculateCalories} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-ink">Age (Years)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 28"
                    value={age}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-ink">Biological Sex</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs font-semibold"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-ink">Daily Activity Level</label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg border border-line text-xs"
                >
                  <option value="sedentary">Sedentary (Desk work, little exercise)</option>
                  <option value="light">Light Activity (1-3 days exercise)</option>
                  <option value="moderate">Moderate Activity (3-5 days exercise)</option>
                  <option value="active">Very Active (Heavy workouts)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-forest text-white font-semibold text-xs shadow-xs hover:bg-forest-deep transition-colors"
              >
                Estimate Calorie Needs
              </button>
            </form>

            {calories && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-bg border border-line text-center">
                  <span className="text-[11px] text-ink-soft">Estimated Daily Energy:</span>
                  <div className="text-xl font-bold font-mono text-forest mt-0.5">
                    {calories} kcal
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-bg border border-line text-center">
                  <span className="text-[11px] text-ink-soft flex items-center justify-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    Water Goal:
                  </span>
                  <div className="text-xl font-bold font-mono text-blue-600 mt-0.5">
                    {waterIntake} Liters
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Organic Nutrition Suggestions Banner */}
        <div className="bg-forest-deep text-white p-8 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Pure Farm Pantry Picks</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold font-display">
            Fuel Your Body with Unadulterated Organic Food
          </h3>

          <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
            Replace refined white sugar with pure Sundarban raw honey, switch to traditional wood-churned Bilona cow ghee, and nourish your system with fresh unbleached organic grains.
          </p>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-forest-deep font-bold text-xs shadow-premium hover:bg-accent-hover transition-all"
          >
            <span>Explore Organic Pantry</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
