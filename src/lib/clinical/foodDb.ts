// Mock food database — values per 100g (or per unit where noted).
// kcal, carbs(g), protein(g), fat(g)
export type FoodUnit = "g" | "colher de sopa" | "unidade" | "fatia" | "xícara" | "ml";

export type Food = {
  id: string;
  name: string;
  category: string;
  // nutrients per 100g (base reference)
  per100: { kcal: number; carbs: number; protein: number; fat: number };
  // conversion of available household measures to grams
  measures: Partial<Record<FoodUnit, number>>;
};

export const FOODS: Food[] = [
  { id: "arroz-branco", name: "Arroz branco cozido", category: "Cereais",
    per100: { kcal: 128, carbs: 28.1, protein: 2.5, fat: 0.2 },
    measures: { g: 1, "colher de sopa": 25, "xícara": 160 } },
  { id: "arroz-integral", name: "Arroz integral cozido", category: "Cereais",
    per100: { kcal: 124, carbs: 25.8, protein: 2.6, fat: 1.0 },
    measures: { g: 1, "colher de sopa": 25, "xícara": 160 } },
  { id: "feijao-carioca", name: "Feijão carioca cozido", category: "Leguminosas",
    per100: { kcal: 76, carbs: 13.6, protein: 4.8, fat: 0.5 },
    measures: { g: 1, "colher de sopa": 30, "xícara": 170 } },
  { id: "frango-peito", name: "Peito de frango grelhado", category: "Proteínas",
    per100: { kcal: 165, carbs: 0, protein: 31, fat: 3.6 },
    measures: { g: 1, "unidade": 120 } },
  { id: "ovo", name: "Ovo de galinha cozido", category: "Proteínas",
    per100: { kcal: 155, carbs: 1.1, protein: 13, fat: 11 },
    measures: { g: 1, "unidade": 50 } },
  { id: "pao-frances", name: "Pão francês", category: "Pães",
    per100: { kcal: 300, carbs: 58, protein: 8, fat: 3 },
    measures: { g: 1, "unidade": 50 } },
  { id: "pao-integral", name: "Pão integral", category: "Pães",
    per100: { kcal: 253, carbs: 43, protein: 9, fat: 4 },
    measures: { g: 1, "fatia": 25 } },
  { id: "banana", name: "Banana prata", category: "Frutas",
    per100: { kcal: 89, carbs: 22.8, protein: 1.1, fat: 0.3 },
    measures: { g: 1, "unidade": 90 } },
  { id: "maca", name: "Maçã", category: "Frutas",
    per100: { kcal: 52, carbs: 13.8, protein: 0.3, fat: 0.2 },
    measures: { g: 1, "unidade": 130 } },
  { id: "mamao", name: "Mamão papaia", category: "Frutas",
    per100: { kcal: 43, carbs: 10.8, protein: 0.5, fat: 0.3 },
    measures: { g: 1, "fatia": 100 } },
  { id: "leite-integral", name: "Leite integral", category: "Laticínios",
    per100: { kcal: 61, carbs: 4.8, protein: 3.2, fat: 3.3 },
    measures: { g: 1, ml: 1.03, "xícara": 240 } },
  { id: "iogurte-natural", name: "Iogurte natural integral", category: "Laticínios",
    per100: { kcal: 61, carbs: 4.7, protein: 3.5, fat: 3.3 },
    measures: { g: 1, "unidade": 170 } },
  { id: "queijo-minas", name: "Queijo minas frescal", category: "Laticínios",
    per100: { kcal: 264, carbs: 3.2, protein: 17.4, fat: 20.2 },
    measures: { g: 1, "fatia": 30 } },
  { id: "aveia", name: "Aveia em flocos", category: "Cereais",
    per100: { kcal: 389, carbs: 66, protein: 16.9, fat: 6.9 },
    measures: { g: 1, "colher de sopa": 15 } },
  { id: "azeite", name: "Azeite de oliva extravirgem", category: "Gorduras",
    per100: { kcal: 884, carbs: 0, protein: 0, fat: 100 },
    measures: { g: 1, "colher de sopa": 13, ml: 0.91 } },
  { id: "batata-doce", name: "Batata doce cozida", category: "Tubérculos",
    per100: { kcal: 86, carbs: 20.1, protein: 1.6, fat: 0.1 },
    measures: { g: 1, "unidade": 130 } },
  { id: "salada-folhas", name: "Salada de folhas verdes", category: "Vegetais",
    per100: { kcal: 15, carbs: 2.9, protein: 1.4, fat: 0.2 },
    measures: { g: 1, "xícara": 50 } },
  { id: "tomate", name: "Tomate", category: "Vegetais",
    per100: { kcal: 18, carbs: 3.9, protein: 0.9, fat: 0.2 },
    measures: { g: 1, "unidade": 100, "fatia": 20 } },
  { id: "cafe-coado", name: "Café coado sem açúcar", category: "Bebidas",
    per100: { kcal: 2, carbs: 0.3, protein: 0.1, fat: 0 },
    measures: { g: 1, ml: 1, "xícara": 50 } },
  { id: "whey", name: "Whey Protein (scoop)", category: "Suplementos",
    per100: { kcal: 400, carbs: 8, protein: 78, fat: 6 },
    measures: { g: 1, "unidade": 30 } },
];

export function searchFoods(query: string, limit = 8): Food[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return FOODS.filter((f) =>
    f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q),
  ).slice(0, limit);
}

export function nutrientsFor(food: Food, amount: number, unit: FoodUnit) {
  const gramsPerUnit = food.measures[unit] ?? 1;
  const grams = amount * gramsPerUnit;
  const factor = grams / 100;
  return {
    grams,
    kcal: food.per100.kcal * factor,
    carbs: food.per100.carbs * factor,
    protein: food.per100.protein * factor,
    fat: food.per100.fat * factor,
  };
}