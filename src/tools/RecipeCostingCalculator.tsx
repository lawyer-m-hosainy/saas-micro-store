import React, { useMemo, useState } from 'react';
import { AlertTriangle, ChefHat, Plus, Trash2 } from 'lucide-react';

export interface Ingredient {
  id: string;
  name: string;
  pricePerKg: number; // ج.م لكل كيلوجرام (أو لتر لو سائل، الوحدة نفس المنطق)
}

export interface RecipeLine {
  ingredientId: string;
  grams: number;
}

export interface Recipe {
  id: string;
  name: string;
  sellingPrice: number;
  lines: RecipeLine[];
}

export interface RecipeResult {
  id: string;
  name: string;
  cost: number;
  foodCostPct: number;
  profit: number;
  suggestedPrice: number; // بافتراض هدف Food Cost% = targetFoodCostPct
  isLosing: boolean;
}

/** تكلفة الطبق = مجموع (وزن المكوّن بالجرام / 1000) × سعر الكيلو، ونسبة Food Cost% = التكلفة / سعر البيع */
export function costRecipe(recipe: Recipe, ingredients: Ingredient[], targetFoodCostPct: number): RecipeResult {
  const cost = recipe.lines.reduce((sum, line) => {
    const ing = ingredients.find((i) => i.id === line.ingredientId);
    if (!ing) return sum;
    return sum + (line.grams / 1000) * ing.pricePerKg;
  }, 0);

  const foodCostPct = recipe.sellingPrice > 0 ? (cost / recipe.sellingPrice) * 100 : 0;
  const profit = recipe.sellingPrice - cost;
  const suggestedPrice = targetFoodCostPct > 0 ? cost / (targetFoodCostPct / 100) : 0;

  return { id: recipe.id, name: recipe.name, cost, foodCostPct, profit, suggestedPrice, isLosing: profit < 0 };
}

const defaultIngredients: Ingredient[] = [
  { id: 'i1', name: 'دقيق', pricePerKg: 18 },
  { id: 'i2', name: 'لحم بقري', pricePerKg: 280 },
  { id: 'i3', name: 'جبنة موتزاريلا', pricePerKg: 220 },
  { id: 'i4', name: 'صلصة طماطم', pricePerKg: 35 },
];

const defaultRecipes: Recipe[] = [
  { id: 'r1', name: 'بيتزا لحم مفرومة', sellingPrice: 145, lines: [{ ingredientId: 'i1', grams: 220 }, { ingredientId: 'i2', grams: 150 }, { ingredientId: 'i3', grams: 120 }, { ingredientId: 'i4', grams: 80 }] },
  { id: 'r2', name: 'بيتزا جبنة', sellingPrice: 95, lines: [{ ingredientId: 'i1', grams: 220 }, { ingredientId: 'i3', grams: 180 }, { ingredientId: 'i4', grams: 90 }] },
];

export function RecipeCostingCalculatorDemo() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(defaultIngredients);
  const [recipes, setRecipes] = useState<Recipe[]>(defaultRecipes);
  const [targetFoodCostPct, setTargetFoodCostPct] = useState(30);

  const results = useMemo(() => recipes.map((r) => costRecipe(r, ingredients, targetFoodCostPct)), [recipes, ingredients, targetFoodCostPct]);
  const best = results.length ? results.reduce((a, b) => (b.profit > a.profit ? b : a)) : null;
  const worst = results.length ? results.reduce((a, b) => (b.profit < a.profit ? b : a)) : null;

  const updateIngredientPrice = (id: string, price: string) => {
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, pricePerKg: Number(price) || 0 } : i)));
  };
  const updateSellingPrice = (id: string, price: string) => {
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, sellingPrice: Number(price) || 0 } : r)));
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><ChefHat size={20} /> حاسبة تكلفة الأطباق وهوامش الربح (نسخة تعمل بالكامل)</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm h-fit">
          <h4 className="font-bold text-gray-700 mb-1 text-sm">أسعار المكوّنات (ج.م/كجم)</h4>
          <p className="text-[11px] text-gray-400 mb-3">عدّل سعر أي مكوّن وشوف تأثيره فورًا على كل الأطباق اللي بتستخدمه.</p>
          <div className="space-y-2">
            {ingredients.map((i) => (
              <div key={i.id} className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-600 flex-1">{i.name}</span>
                <input type="number" value={i.pricePerKg} onChange={(e) => updateIngredientPrice(i.id, e.target.value)} className="w-20 px-2 py-1 border rounded-md text-xs text-left" dir="ltr" />
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-3">
            <label className="block text-[11px] text-gray-500 mb-1">هدف نسبة Food Cost% لاقتراح السعر</label>
            <input type="number" value={targetFoodCostPct} onChange={(e) => setTargetFoodCostPct(Number(e.target.value) || 0)} className="w-full px-2 py-1.5 border rounded-md text-xs" dir="ltr" />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-3">
          {results.map((r) => (
            <div key={r.id} className={`bg-white p-4 rounded-lg border shadow-sm ${r.isLosing ? 'border-red-300 ring-1 ring-red-100' : r.id === best?.id ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-gray-800">{r.name}</span>
                {r.isLosing && <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full"><AlertTriangle size={10} /> طبق خاسر</span>}
                {!r.isLosing && r.id === best?.id && <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">الأعلى ربحاً</span>}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">سعر البيع (ج.م)</label>
                  <input type="number" value={r.id ? recipes.find((rec) => rec.id === r.id)?.sellingPrice : 0} onChange={(e) => updateSellingPrice(r.id, e.target.value)} className="w-full px-2 py-1.5 border rounded-md text-xs" dir="ltr" />
                </div>
                <StatMini label="تكلفة المكوّنات" value={`${r.cost.toFixed(1)} ج.م`} />
                <StatMini label="Food Cost %" value={`${r.foodCostPct.toFixed(1)}%`} tone={r.foodCostPct > 35 ? 'red' : 'emerald'} />
                <StatMini label="السعر المقترح" value={`${r.suggestedPrice.toFixed(0)} ج.م`} />
              </div>
              <div className={`mt-2 text-xs font-mono font-bold ${r.isLosing ? 'text-red-600' : 'text-emerald-600'}`} dir="ltr">
                هامش الربح: {r.profit.toFixed(1)} ج.م
              </div>
            </div>
          ))}
          {worst && best && worst.id !== best.id && (
            <p className="text-[11px] text-gray-400">⬤ الأعلى ربحاً: {best.name} · الأقل ربحاً: {worst.name}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatMini({ label, value, tone }: { label: string; value: string; tone?: 'red' | 'emerald' }) {
  const toneClass = tone === 'red' ? 'text-red-600' : tone === 'emerald' ? 'text-emerald-600' : 'text-gray-800';
  return (
    <div className="bg-gray-50 rounded-md px-2 py-1.5">
      <div className="text-[10px] text-gray-500">{label}</div>
      <div className={`font-mono font-bold text-xs ${toneClass}`}>{value}</div>
    </div>
  );
}
