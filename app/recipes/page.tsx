"use client";
// app/recipes/page.tsx - Organic Recipes & Herbal Health Remedies
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Utensils,
  Clock,
  Users,
  Sparkles,
  ArrowRight,
  Heart,
  Search,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Leaf,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useStorefront } from "@/context/StorefrontContext";

export default function RecipesPage() {
  const { t, lang } = useLanguage();
  const language = lang;
  const { isFeatureEnabled } = useStorefront();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const url =
          selectedCategory === "all"
            ? "/api/storefront/recipes"
            : `/api/storefront/recipes?category=${selectedCategory}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setRecipes(data.recipes || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [selectedCategory]);

  const categories = [
    { id: "all", label: language === "bn" ? "সকল রেসিপি ও টোটকা" : "All Recipes & Remedies" },
    { id: "herbal_remedy", label: language === "bn" ? "🌿 ভেষজ যত্ন ও টোটকা" : "Herbal Remedies" },
    { id: "healthy_cooking", label: language === "bn" ? "🍳 স্বাস্থ্যকর রান্না" : "Healthy Cooking" },
    { id: "drinks", label: language === "bn" ? "🥤 অর্গানিক পানীয়" : "Organic Drinks" },
  ];

  const filteredRecipes = recipes.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      r.title?.toLowerCase().includes(q) ||
      r.healthBenefits?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-bg pb-20">
      {/* Hero Banner */}
      <div className="bg-forest-deep text-white py-12 sm:py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-6xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-accent text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Leaf className="w-3.5 h-3.5" />
            <span>{language === "bn" ? "খাঁটি খাবারের সঠিক ব্যবহার" : "Organic Cooking & Wellness"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white">
            {language === "bn"
              ? "স্বাস্থ্যকর রেসিপি ও ঘরোয়া ভেষজ টোটকা"
              : "Pure Organic Recipes & Herbal Remedies"}
          </h1>

          <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
            {language === "bn"
              ? "কীভাবে খাঁটি মধু, কোল্ড প্রেসড তেল ও ঘি দিয়ে সহজে পরিবারের রোগ প্রতিরোধ ক্ষমতা বাড়াবেন এবং ১-ক্লিকে উপাদানগুলো ঘরে অর্ডার করবেন।"
              : "Discover how to cook with pure ingredients, boost natural immunity, and add all needed pantry items to your cart in 1 click."}
          </p>

          {/* Search bar */}
          <div className="max-w-md mx-auto pt-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-3.5 text-stone-400" />
              <input
                type="text"
                placeholder={
                  language === "bn"
                    ? "রেসিপি বা ভেষজ যত্ন খুঁজুন..."
                    : "Search recipes or remedies..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white text-ink text-xs sm:text-sm font-medium focus:outline-hidden shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === c.id
                  ? "bg-forest text-white shadow-md shadow-forest/20"
                  : "bg-white text-stone-700 hover:bg-stone-100 border border-line"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Recipes Grid */}
        {loading ? (
          <div className="p-16 text-center text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-forest" />
            <p className="text-xs font-medium">লোড হচ্ছে...</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="p-16 text-center text-stone-400 bg-white rounded-3xl border border-line">
            কোনো রেসিপি পাওয়া যায়নি।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((r) => (
              <Link
                key={r.id}
                href={`/recipes/${r.slug}`}
                className="group bg-white rounded-3xl border border-line overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 bg-stone-100 relative overflow-hidden">
                    {r.imageUrl ? (
                      <img
                        src={r.imageUrl}
                        alt={r.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <Utensils className="w-12 h-12" />
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3 bg-forest/90 backdrop-blur-xs text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                      {r.category === "herbal_remedy" ? "🌿 ভেষজ যত্ন" : "🍳 রান্না রেসিপি"}
                    </div>

                    {r.bundleDiscountPercent && (
                      <div className="absolute top-3 right-3 bg-accent text-forest-deep text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase shadow-xs">
                        {r.bundleDiscountPercent}% Bundle Off
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-2.5">
                    <h3 className="font-bold text-base text-ink group-hover:text-forest transition-colors leading-snug">
                      {r.title}
                    </h3>
                    
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {r.healthBenefits || "প্রাকৃতিক স্বাস্থ্য উপকারিতা এবং ঘরোয়া ব্যবহার প্রণালী..."}
                    </p>

                    <div className="pt-2 flex items-center gap-4 text-[11px] text-stone-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        {r.prepTimeMinutes} মিনিট
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        {r.servings} জনের জন্য
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-forest group-hover:text-forest-deep">
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>১-ক্লিকে কার্ট ও প্রস্তুত প্রণালী</span>
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
